from rest_framework import serializers

from .models import PayoutAccount, Product, ProductRequest


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["name", "category", "price", "stock", "status", "image", "sku"]
        extra_kwargs = {field: {"required": False} for field in fields}

    def validate_sku(self, value):
        request = self.context["request"]
        qs = Product.objects.filter(supplier=request.user, sku=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Vous avez déjà un produit avec ce SKU.")
        return value


class CreateProductRequestSerializer(serializers.Serializer):
    """
    Utilisé pour créer une demande depuis le côté agriculteur (marketplace public).
    Pas encore branché sur une page frontend, mais prêt pour une future page
    "Demander un devis" côté agriculteur.
    """

    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, max_value=10000)


class CreateOrderSerializer(serializers.Serializer):
    items = OrderItemInputSerializer(many=True, allow_empty=False)
    delivery_method = serializers.ChoiceField(choices=["pickup", "delivery"], default="pickup")
    delivery_address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    note = serializers.CharField(max_length=500, required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs.get("delivery_method") == "delivery" and not attrs.get("delivery_address", "").strip():
            raise serializers.ValidationError({"delivery_address": "L'adresse de livraison est requise."})
        return attrs


class SupplierOrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["preparing", "shipped", "cancelled"])


class PayoutAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayoutAccount
        fields = ["operator", "phone", "account_name"]

    def validate_phone(self, value):
        digits = "".join(ch for ch in value if ch.isdigit())
        if len(digits) < 8:
            raise serializers.ValidationError("Numéro de téléphone invalide.")
        return value.strip()
