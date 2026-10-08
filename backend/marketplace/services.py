"""
Logique métier des commandes : création, réservation de stock, synchronisation
du paiement, transitions de statut. Les vues restent minces et appellent ce module.
"""

import logging
from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from adminpanel.models import ActivityLog, log_activity
from notifications.models import notify

from . import fedapay
from .models import Order, OrderItem, Payment, Product

logger = logging.getLogger(__name__)


class OrderError(Exception):
    """Erreur métier affichable à l'utilisateur (HTTP 422/409)."""

    def __init__(self, message, status_code=422):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _fmt(amount: int) -> str:
    return f"{amount:,}".replace(",", " ") + " FCFA"


# ------------------------------------------------------------------
# Stock
# ------------------------------------------------------------------
def _release_stock(order: Order):
    """Remet en stock les articles d'une commande non payée (annulée/expirée/échouée)."""
    for item in order.items.select_related("product"):
        product = Product.objects.select_for_update().filter(pk=item.product_id).first()
        if not product:
            continue
        product.stock += item.quantity
        if product.status == Product.Status.RUPTURE and product.stock > 0:
            product.status = Product.Status.DISPONIBLE
        product.save(update_fields=["stock", "status"])


# ------------------------------------------------------------------
# Création de commande
# ------------------------------------------------------------------
@transaction.atomic
def create_order(*, buyer, items, delivery_method, delivery_address, phone, note) -> Order:
    """
    `items` : liste de {"product_id": UUID, "quantity": int}, tous du même fournisseur.
    Le stock est réservé immédiatement (libéré si le paiement échoue ou expire).
    """
    if not items:
        raise OrderError("Le panier est vide.")

    merged = {}
    for it in items:
        pid = str(it["product_id"])
        merged[pid] = merged.get(pid, 0) + int(it["quantity"])

    products = {
        str(p.pk): p
        for p in Product.objects.select_for_update().select_related("supplier").filter(pk__in=merged.keys())
    }
    if len(products) != len(merged):
        raise OrderError("Un des produits n'existe plus.")

    suppliers = {p.supplier_id for p in products.values()}
    if len(suppliers) != 1:
        raise OrderError("Une commande ne peut concerner qu'un seul fournisseur.")
    supplier = next(iter(products.values())).supplier
    if supplier.pk == buyer.pk:
        raise OrderError("Vous ne pouvez pas commander vos propres produits.")
    if supplier.status != supplier.Status.ACTIVE:
        raise OrderError("Ce fournisseur n'est pas disponible actuellement.")

    subtotal = 0
    for pid, qty in merged.items():
        product = products[pid]
        if product.status != Product.Status.DISPONIBLE:
            raise OrderError(f"« {product.name} » n'est pas disponible actuellement.")
        if product.stock < qty:
            raise OrderError(f"Stock insuffisant pour « {product.name} » (reste {product.stock}).")
        subtotal += product.price * qty

    rate = Decimal(str(getattr(settings, "MARKETPLACE_COMMISSION_PERCENT", 5)))
    commission = int((Decimal(subtotal) * rate / Decimal(100)).quantize(Decimal("1")))
    min_amount = int(getattr(settings, "MARKETPLACE_MIN_ORDER_AMOUNT", 100))
    if subtotal < min_amount:
        raise OrderError(f"Le montant minimum d'une commande est de {_fmt(min_amount)}.")

    order = Order.objects.create(
        buyer=buyer,
        supplier=supplier,
        buyer_name=buyer.name or buyer.email,
        supplier_name=supplier.company or supplier.name,
        subtotal=subtotal,
        commission_rate=rate,
        commission_amount=commission,
        supplier_amount=subtotal - commission,
        delivery_method=delivery_method,
        delivery_address=delivery_address or "",
        phone=phone or buyer.phone or "",
        note=note or "",
    )

    for pid, qty in merged.items():
        product = products[pid]
        OrderItem.objects.create(
            order=order, product=product, product_name=product.name,
            unit_price=product.price, quantity=qty,
        )
        product.stock -= qty
        if product.stock == 0:
            product.status = Product.Status.RUPTURE
        product.save(update_fields=["stock", "status"])

    log_activity(
        f"Nouvelle commande {order.reference} : {buyer.name} → {order.supplier_name} ({_fmt(subtotal)})",
        user=buyer, type=ActivityLog.Type.REQUEST,
    )
    return order


# ------------------------------------------------------------------
# Paiement
# ------------------------------------------------------------------
def start_payment(order: Order, buyer, frontend_base: str) -> Payment:
    """Crée la transaction FedaPay (ou une simulation en dev) et renvoie le Payment."""
    if order.status != Order.Status.PENDING:
        raise OrderError("Cette commande n'est plus en attente de paiement.", 409)

    callback = f"{frontend_base.rstrip('/')}/app/paiement/retour?order={order.id}"

    if fedapay.is_configured():
        try:
            tx = fedapay.create_transaction(order=order, buyer=buyer, callback_url=callback)
        except fedapay.FedaPayError as exc:
            raise OrderError(str(exc), 502) from exc
        return Payment.objects.create(
            order=order, provider="fedapay", provider_transaction_id=tx["id"],
            amount=order.subtotal, payment_url=tx["url"], raw=tx["raw"],
        )

    if getattr(settings, "PAYMENT_SIMULATION", False):
        payment = Payment.objects.create(
            order=order, provider="simulation", amount=order.subtotal,
            payment_url=f"{frontend_base.rstrip('/')}/app/paiement/simulation?order={order.id}",
        )
        return payment

    raise OrderError(
        "Le paiement en ligne n'est pas encore configuré. Contactez l'administrateur.", 503
    )


@transaction.atomic
def apply_payment_status(payment: Payment, new_status: str, raw=None) -> Order:
    """
    Applique un statut de paiement (idempotent : webhook + page retour peuvent
    arriver dans n'importe quel ordre, et même plusieurs fois).
    """
    payment = Payment.objects.select_for_update().get(pk=payment.pk)
    order = Order.objects.select_for_update().get(pk=payment.order_id)

    if raw is not None:
        payment.raw = raw

    # Une fois approuvé, un paiement ne change plus.
    if payment.status == Payment.Status.APPROVED:
        payment.save(update_fields=["raw", "updated_at"])
        return order

    payment.status = new_status
    payment.save(update_fields=["status", "raw", "updated_at"])

    if new_status == Payment.Status.APPROVED:
        if order.status == Order.Status.CANCELLED:
            # Payé après annulation/expiration : le stock a déjà été libéré, on
            # signale un remboursement à faire plutôt que de perdre l'argent.
            order.refund_status = Order.RefundStatus.NEEDED
            order.save(update_fields=["refund_status"])
            log_activity(
                f"Paiement reçu sur commande annulée {order.reference} — remboursement requis",
                user=order.buyer, type=ActivityLog.Type.REQUEST, severity=ActivityLog.Severity.WARNING,
            )
            return order
        if order.status == Order.Status.PENDING:
            order.status = Order.Status.PAID
            order.paid_at = timezone.now()
            order.save(update_fields=["status", "paid_at"])
            _notify_paid(order)

    elif new_status in (Payment.Status.DECLINED, Payment.Status.CANCELED, Payment.Status.EXPIRED):
        # On garde la commande en attente : l'acheteur peut réessayer tant qu'elle n'a pas expiré.
        if order.buyer:
            notify(
                order.buyer, title="Paiement non abouti",
                body=f"Le paiement de la commande {order.reference} n'a pas abouti. Vous pouvez réessayer.",
                icon="⚠️", link=f"/app/commandes/{order.id}",
            )
    return order


def _notify_paid(order: Order):
    notify(
        order.supplier, title="Nouvelle commande payée",
        body=f"{order.buyer_name} a payé la commande {order.reference} ({_fmt(order.subtotal)}).",
        icon="💰", link="/fournisseur/commandes",
    )
    if order.buyer:
        notify(
            order.buyer, title="Paiement confirmé",
            body=f"Votre paiement de {_fmt(order.subtotal)} pour la commande {order.reference} est confirmé.",
            icon="✅", link=f"/app/commandes/{order.id}",
        )
    log_activity(
        f"Commande payée {order.reference} ({_fmt(order.subtotal)})",
        user=order.buyer, type=ActivityLog.Type.REQUEST,
    )


def sync_payment_from_provider(payment: Payment) -> Order:
    """Relit la transaction chez FedaPay et applique son statut."""
    if payment.provider != "fedapay" or not payment.provider_transaction_id:
        return payment.order
    try:
        tx = fedapay.retrieve_transaction(payment.provider_transaction_id)
    except fedapay.FedaPayError as exc:
        raise OrderError(str(exc), 502) from exc

    status = (tx.get("status") or "").lower()
    mapping = {
        "approved": Payment.Status.APPROVED,
        "transferred": Payment.Status.APPROVED,   # fonds déjà reversés au marchand
        "declined": Payment.Status.DECLINED,
        "canceled": Payment.Status.CANCELED,
        "cancelled": Payment.Status.CANCELED,
        "expired": Payment.Status.EXPIRED,
    }
    if status in mapping:
        return apply_payment_status(payment, mapping[status], raw=tx)
    return payment.order  # pending / refunded / autre : rien à faire pour l'instant


# ------------------------------------------------------------------
# Transitions de statut
# ------------------------------------------------------------------
@transaction.atomic
def cancel_unpaid_order(order: Order, reason_label="annulée"):
    order = Order.objects.select_for_update().get(pk=order.pk)
    if order.status != Order.Status.PENDING:
        raise OrderError("Seule une commande en attente de paiement peut être annulée.", 409)
    order.status = Order.Status.CANCELLED
    order.save(update_fields=["status"])
    _release_stock(order)
    return order


@transaction.atomic
def supplier_set_status(order: Order, new_status: str) -> Order:
    order = Order.objects.select_for_update().get(pk=order.pk)
    allowed = {
        Order.Status.PAID: [Order.Status.PREPARING, Order.Status.CANCELLED],
        Order.Status.PREPARING: [Order.Status.SHIPPED, Order.Status.CANCELLED],
    }
    if new_status not in allowed.get(order.status, []):
        raise OrderError("Ce changement de statut n'est pas possible.", 409)

    order.status = new_status
    fields = ["status"]
    if new_status == Order.Status.CANCELLED:
        # Commande déjà payée annulée par le fournisseur → remboursement + stock remis.
        order.refund_status = Order.RefundStatus.NEEDED
        fields.append("refund_status")
        _release_stock(order)
    order.save(update_fields=fields)

    if order.buyer:
        labels = {
            Order.Status.PREPARING: ("Commande en préparation", "est en cours de préparation.", "📦"),
            Order.Status.SHIPPED: ("Commande expédiée", "a été expédiée / est prête.", "🚚"),
            Order.Status.CANCELLED: ("Commande annulée", "a été annulée par le fournisseur. Vous serez remboursé.", "❌"),
        }
        title, text, icon = labels[new_status]
        notify(order.buyer, title=title, body=f"Votre commande {order.reference} {text}",
               icon=icon, link=f"/app/commandes/{order.id}")
    log_activity(f"Commande {order.reference} → {order.get_status_display()}",
                 user=order.supplier, type=ActivityLog.Type.REQUEST)
    return order


@transaction.atomic
def buyer_confirm_delivery(order: Order) -> Order:
    order = Order.objects.select_for_update().get(pk=order.pk)
    if order.status != Order.Status.SHIPPED:
        raise OrderError("Vous pourrez confirmer la réception une fois la commande expédiée.", 409)
    order.status = Order.Status.DELIVERED
    order.delivered_at = timezone.now()
    order.payout_status = Order.PayoutStatus.AVAILABLE
    order.save(update_fields=["status", "delivered_at", "payout_status"])
    notify(
        order.supplier, title="Livraison confirmée",
        body=f"{order.buyer_name} a confirmé la réception de {order.reference}. "
             f"{_fmt(order.supplier_amount)} seront reversés.",
        icon="🎉", link="/fournisseur/revenus",
    )
    log_activity(f"Commande livrée {order.reference}", user=order.buyer, type=ActivityLog.Type.REQUEST)
    return order


def expire_stale_orders():
    """Annule les commandes impayées au-delà du délai (libère le stock réservé)."""
    minutes = int(getattr(settings, "ORDER_EXPIRY_MINUTES", 30))
    limit = timezone.now() - timedelta(minutes=minutes)
    stale = Order.objects.filter(status=Order.Status.PENDING, created_at__lt=limit)
    count = 0
    for order in stale:
        # Dernière vérification chez FedaPay : l'acheteur a peut-être payé sans repasser par le site.
        payment = order.payments.first()
        if payment and payment.provider == "fedapay":
            try:
                sync_payment_from_provider(payment)
                order.refresh_from_db()
                if order.status != Order.Status.PENDING:
                    continue
            except OrderError:
                pass
        try:
            cancel_unpaid_order(order)
            count += 1
        except OrderError:
            continue
    return count
