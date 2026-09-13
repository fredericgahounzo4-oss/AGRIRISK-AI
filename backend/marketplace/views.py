from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product, ProductRequest
from .serializers import CreateProductRequestSerializer, ProductWriteSerializer
from notifications.models import notify


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
        return Response(req.to_frontend_dict(), status=status.HTTP_201_CREATED)
