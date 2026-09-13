from rest_framework import serializers

from .models import Product, ProductRequest


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
