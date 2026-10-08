from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product, ProductRequest
from .serializers import CreateProductRequestSerializer, ProductWriteSerializer
from notifications.models import notify
from adminpanel.models import ActivityLog, log_activity


class ProductListCreateView(APIView):
    """
    GET  /api/marketplace/products — produits du fournisseur connecté.
    POST /api/marketplace/products — crée un nouveau produit.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        products = Product.objects.filter(supplier=request.user)
        return Response([p.to_frontend_dict(request=request) for p in products])

    def post(self, request):
        serializer = ProductWriteSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        product = serializer.save(supplier=request.user)
        log_activity(
            f"Produit ajouté : {product.name}", user=request.user,
            type=ActivityLog.Type.PRODUCT,
        )
        return Response(product.to_frontend_dict(request=request), status=status.HTTP_201_CREATED)


class ProductDetailView(APIView):
    """
    PATCH  /api/marketplace/products/<id> — modifie un produit.
    DELETE /api/marketplace/products/<id> — supprime un produit.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def patch(self, request, pk):
        product = get_object_or_404(Product, pk=pk, supplier=request.user)
        serializer = ProductWriteSerializer(
            product, data=request.data, partial=True, context={"request": request}
        )
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        serializer.save()
        return Response(product.to_frontend_dict(request=request))

    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk, supplier=request.user)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RequestListView(APIView):
    """GET /api/marketplace/requests — demandes reçues par le fournisseur connecté."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        requests_qs = ProductRequest.objects.filter(supplier=request.user)
        return Response([r.to_frontend_dict() for r in requests_qs])


class RequestActionView(APIView):
    """
    POST /api/marketplace/requests/<id>/accept
    POST /api/marketplace/requests/<id>/reject
    """

    permission_classes = [IsAuthenticated]

    def _set_status(self, request, pk, new_status):
        req = get_object_or_404(ProductRequest, pk=pk, supplier=request.user)
        if req.status != ProductRequest.Status.PENDING:
            return Response(
                {"message": "Cette demande a déjà été traitée."},
                status=status.HTTP_409_CONFLICT,
            )
        req.status = new_status
        req.save(update_fields=["status"])
        log_activity(
            f"Demande {'acceptée' if new_status == ProductRequest.Status.ACCEPTED else 'refusée'} : "
            f"{req.quantity}x {req.product_name}",
            user=request.user, type=ActivityLog.Type.REQUEST,
        )

        if req.farmer is not None:
            if new_status == ProductRequest.Status.ACCEPTED:
                notify(
                    req.farmer,
                    title="Demande acceptée",
                    body=f"{req.supplier.company or req.supplier.name} a accepté votre demande de {req.quantity}x {req.product_name}.",
                    icon="✅",
                    link="/app/fournisseurs",
                )
            else:
                notify(
                    req.farmer,
                    title="Demande refusée",
                    body=f"{req.supplier.company or req.supplier.name} a refusé votre demande de {req.quantity}x {req.product_name}.",
                    icon="❌",
                    link="/app/fournisseurs",
                )

        return Response(req.to_frontend_dict())

    def post(self, request, pk, action):
        if action == "accept":
            return self._set_status(request, pk, ProductRequest.Status.ACCEPTED)
        if action == "reject":
            return self._set_status(request, pk, ProductRequest.Status.REJECTED)
        return Response({"message": "Action inconnue."}, status=status.HTTP_400_BAD_REQUEST)


class CreateRequestView(APIView):
    """
    POST /api/marketplace/requests
    Crée une demande de devis vers le fournisseur d'un produit (côté agriculteur).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateProductRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        data = serializer.validated_data
        product = get_object_or_404(Product, pk=data["product_id"])

        req = ProductRequest.objects.create(
            supplier=product.supplier,
            farmer=request.user,
            product=product,
            farmer_name=request.user.name,
            product_name=product.name,
            quantity=data["quantity"],
            phone=data.get("phone") or (request.user.phone or ""),
            region=request.user.region or "",
        )
        notify(
            product.supplier,
            title="Nouvelle demande",
            body=f"{request.user.name} souhaite {data['quantity']}x {product.name}.",
            icon="📦",
            link="/fournisseur/demandes",
        )
        log_activity(
            f"Nouvelle demande : {request.user.name} → {data['quantity']}x {product.name}",
            user=request.user, type=ActivityLog.Type.REQUEST,
        )
        return Response(req.to_frontend_dict(), status=status.HTTP_201_CREATED)


# ======================================================================
# Marketplace : catalogue, commandes, paiement FedaPay
# ======================================================================
import json
import logging

from django.conf import settings
from django.db.models import Count, Q, Sum
from rest_framework.permissions import AllowAny

from accounts.models import User

from . import fedapay, services
from .models import Order, Payment, PayoutAccount
from .serializers import (
    CreateOrderSerializer,
    PayoutAccountSerializer,
    SupplierOrderStatusSerializer,
)

logger = logging.getLogger(__name__)


def _frontend_base(request) -> str:
    """URL du site (pour la page de retour de paiement)."""
    base = getattr(settings, "FRONTEND_URL", "") or request.headers.get("Origin", "")
    return base or "http://localhost:5173"


def _error(exc: services.OrderError):
    return Response({"message": exc.message}, status=exc.status_code)


def _get_order_for_user(request, pk) -> Order:
    order = get_object_or_404(Order, pk=pk)
    user = request.user
    if user.id not in (order.buyer_id, order.supplier_id) and user.role != User.Role.ADMIN:
        from django.http import Http404
        raise Http404
    return order


class CatalogView(APIView):
    """
    GET /api/marketplace/catalog — produits disponibles de tous les fournisseurs
    actifs (côté agriculteur). Filtres : ?search= ?category= ?supplier_id=
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Product.objects.filter(
            supplier__role=User.Role.SUPPLIER,
            supplier__status=User.Status.ACTIVE,
            status=Product.Status.DISPONIBLE,
            stock__gt=0,
        ).select_related("supplier")

        search = request.query_params.get("search")
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(category__icontains=search))
        category = request.query_params.get("category")
        if category and category != "Tous":
            qs = qs.filter(category=category)
        supplier_id = request.query_params.get("supplier_id")
        if supplier_id:
            qs = qs.filter(supplier_id=supplier_id)

        data = []
        for p in qs:
            item = p.to_frontend_dict(request=request)
            item["supplier_name"] = p.supplier.company or p.supplier.name
            item["supplier_region"] = p.supplier.region or p.supplier.address or ""
            data.append(item)
        return Response(data)


class OrderListCreateView(APIView):
    """
    GET  /api/marketplace/orders — commandes de l'utilisateur connecté
         (acheteur si agriculteur, vendeur si fournisseur).
    POST /api/marketplace/orders — crée une commande (un seul fournisseur) et
         lance le paiement FedaPay. Réponse : {order, payment_url}.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        services.expire_stale_orders()
        if request.user.role == User.Role.SUPPLIER:
            # Le fournisseur ne voit que les commandes réellement payées.
            qs = Order.objects.filter(supplier=request.user, paid_at__isnull=False)
        else:
            qs = Order.objects.filter(buyer=request.user)
        qs = qs.prefetch_related("items", "payments")
        return Response([o.to_frontend_dict() for o in qs])

    def post(self, request):
        if request.user.role != User.Role.FARMER:
            return Response({"message": "Seuls les agriculteurs peuvent passer commande."}, status=403)

        serializer = CreateOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        data = serializer.validated_data

        services.expire_stale_orders()
        try:
            order = services.create_order(
                buyer=request.user,
                items=[dict(i) for i in data["items"]],
                delivery_method=data["delivery_method"],
                delivery_address=data.get("delivery_address", ""),
                phone=data.get("phone", ""),
                note=data.get("note", ""),
            )
        except services.OrderError as exc:
            return _error(exc)

        try:
            payment = services.start_payment(order, request.user, _frontend_base(request))
        except services.OrderError as exc:
            # Paiement impossible à lancer : on annule pour libérer le stock réservé.
            try:
                services.cancel_unpaid_order(order)
            except services.OrderError:
                pass
            return _error(exc)

        return Response(
            {"order": order.to_frontend_dict(), "payment_url": payment.payment_url},
            status=status.HTTP_201_CREATED,
        )


class OrderDetailView(APIView):
    """GET /api/marketplace/orders/<id>"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        return Response(_get_order_for_user(request, pk).to_frontend_dict())


class OrderPayView(APIView):
    """POST /api/marketplace/orders/<id>/pay — (re)lance le paiement d'une commande en attente."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, buyer=request.user)
        services.expire_stale_orders()
        order.refresh_from_db()
        try:
            # Réutilise le lien existant s'il est encore valable et en cours.
            last = order.payments.filter(status=Payment.Status.PENDING).first()
            if last and last.payment_url and order.status == Order.Status.PENDING:
                return Response({"order": order.to_frontend_dict(), "payment_url": last.payment_url})
            payment = services.start_payment(order, request.user, _frontend_base(request))
        except services.OrderError as exc:
            return _error(exc)
        return Response({"order": order.to_frontend_dict(), "payment_url": payment.payment_url})


class OrderVerifyPaymentView(APIView):
    """
    POST /api/marketplace/orders/<id>/verify-payment
    Appelé par la page de retour : relit le statut chez FedaPay (ne fait pas
    confiance aux paramètres de l'URL) et met la commande à jour.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, buyer=request.user)
        payment = order.payments.first()
        if payment is None:
            return Response({"message": "Aucun paiement pour cette commande."}, status=404)
        try:
            services.sync_payment_from_provider(payment)
        except services.OrderError as exc:
            return _error(exc)
        order.refresh_from_db()
        return Response(order.to_frontend_dict())


class OrderCancelView(APIView):
    """POST /api/marketplace/orders/<id>/cancel — annule une commande non payée."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, buyer=request.user)
        # Si l'acheteur a payé entre-temps, on ne doit pas annuler : on resynchronise d'abord.
        payment = order.payments.first()
        if payment and payment.provider == "fedapay":
            try:
                services.sync_payment_from_provider(payment)
                order.refresh_from_db()
            except services.OrderError:
                pass
        try:
            order = services.cancel_unpaid_order(order)
        except services.OrderError as exc:
            return _error(exc)
        return Response(order.to_frontend_dict())


class OrderConfirmDeliveryView(APIView):
    """POST /api/marketplace/orders/<id>/confirm-delivery — l'acheteur confirme la réception."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, buyer=request.user)
        try:
            order = services.buyer_confirm_delivery(order)
        except services.OrderError as exc:
            return _error(exc)
        return Response(order.to_frontend_dict())


class OrderSupplierStatusView(APIView):
    """POST /api/marketplace/orders/<id>/status {status: preparing|shipped|cancelled} — fournisseur."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, supplier=request.user)
        serializer = SupplierOrderStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Statut invalide.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        try:
            order = services.supplier_set_status(order, serializer.validated_data["status"])
        except services.OrderError as exc:
            return _error(exc)
        return Response(order.to_frontend_dict())


class OrderSimulatePaymentView(APIView):
    """
    POST /api/marketplace/orders/<id>/simulate-payment {outcome: approved|declined}
    Disponible UNIQUEMENT si PAYMENT_SIMULATION est activé (développement local
    sans clé FedaPay). Désactivé par défaut en production.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not getattr(settings, "PAYMENT_SIMULATION", False):
            return Response({"message": "Simulation désactivée."}, status=404)
        order = get_object_or_404(Order, pk=pk, buyer=request.user)
        payment = order.payments.filter(provider="simulation").first()
        if payment is None:
            return Response({"message": "Aucun paiement simulé pour cette commande."}, status=404)
        outcome = request.data.get("outcome", "approved")
        new_status = Payment.Status.APPROVED if outcome == "approved" else Payment.Status.DECLINED
        order = services.apply_payment_status(payment, new_status)
        return Response(order.to_frontend_dict())


class FedaPayWebhookView(APIView):
    """
    POST /api/marketplace/webhooks/fedapay
    À déclarer dans le tableau de bord FedaPay (Webhooks) avec cet URL en HTTPS.
    Sécurité : signature X-FEDAPAY-SIGNATURE vérifiée si FEDAPAY_WEBHOOK_SECRET est
    défini, PUIS statut relu directement chez FedaPay (le corps reçu n'est jamais cru).
    """

    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        raw = request.body
        secret = getattr(settings, "FEDAPAY_WEBHOOK_SECRET", "")
        if secret:
            header = request.headers.get("X-FEDAPAY-SIGNATURE", "")
            if not fedapay.verify_webhook_signature(raw, header, secret):
                logger.warning("Webhook FedaPay : signature invalide")
                return Response({"message": "Signature invalide."}, status=400)
        elif not settings.DEBUG:
            logger.warning("FEDAPAY_WEBHOOK_SECRET non défini : seule la relecture API protège le webhook.")

        try:
            event = json.loads(raw or b"{}")
        except ValueError:
            return Response({"message": "Corps invalide."}, status=400)

        entity = event.get("entity") or event.get("data") or {}
        tx_id = str(entity.get("id") or "")
        if not tx_id:
            return Response({"ok": True})  # événement sans transaction : on ignore

        payment = Payment.objects.filter(provider="fedapay", provider_transaction_id=tx_id).first()
        if payment is None:
            return Response({"ok": True})  # transaction inconnue (autre service du même compte)

        try:
            services.sync_payment_from_provider(payment)
        except services.OrderError:
            # 5xx → FedaPay réessaiera plus tard.
            return Response({"message": "Synchronisation impossible, réessayez."}, status=503)
        return Response({"ok": True})


class EarningsView(APIView):
    """GET /api/marketplace/earnings — synthèse financière du fournisseur."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.SUPPLIER:
            return Response({"message": "Réservé aux fournisseurs."}, status=403)

        orders = Order.objects.filter(supplier=request.user)
        paid_states = [Order.Status.PAID, Order.Status.PREPARING, Order.Status.SHIPPED, Order.Status.DELIVERED]

        def total(qs):
            return qs.aggregate(t=Sum("supplier_amount"))["t"] or 0

        in_progress = orders.filter(status__in=[Order.Status.PAID, Order.Status.PREPARING, Order.Status.SHIPPED])
        available = orders.filter(status=Order.Status.DELIVERED, payout_status=Order.PayoutStatus.AVAILABLE)
        paid_out = orders.filter(status=Order.Status.DELIVERED, payout_status=Order.PayoutStatus.PAID)
        gross = orders.filter(status__in=paid_states)

        account = PayoutAccount.objects.filter(supplier=request.user).first()
        return Response({
            "commission_percent": float(getattr(settings, "MARKETPLACE_COMMISSION_PERCENT", 5)),
            "pending_amount": total(in_progress),     # payé, pas encore livré
            "available_amount": total(available),     # livré, en attente de reversement
            "paid_out_amount": total(paid_out),       # déjà reversé
            "total_sales": gross.aggregate(t=Sum("subtotal"))["t"] or 0,
            "total_commission": gross.aggregate(t=Sum("commission_amount"))["t"] or 0,
            "orders_count": gross.count(),
            "payout_account": account.to_frontend_dict() if account else None,
        })


class PayoutAccountView(APIView):
    """GET/PUT /api/marketplace/payout-account — numéro Mobile Money de reversement."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.SUPPLIER:
            return Response({"message": "Réservé aux fournisseurs."}, status=403)
        account = PayoutAccount.objects.filter(supplier=request.user).first()
        return Response(account.to_frontend_dict() if account else None)

    def put(self, request):
        if request.user.role != User.Role.SUPPLIER:
            return Response({"message": "Réservé aux fournisseurs."}, status=403)
        account = PayoutAccount.objects.filter(supplier=request.user).first()
        serializer = PayoutAccountSerializer(account, data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        serializer.save(supplier=request.user)
        return Response(serializer.data)
