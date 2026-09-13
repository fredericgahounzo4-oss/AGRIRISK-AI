import uuid

from django.conf import settings
from django.db import models


class Product(models.Model):
    class Status(models.TextChoices):
        DISPONIBLE = "Disponible", "Disponible"
        RUPTURE = "Rupture", "Rupture"
        BIENTOT = "Bientôt disponible", "Bientôt disponible"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products"
    )
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True, default="")
    price = models.PositiveIntegerField(help_text="Prix en FCFA")
    stock = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DISPONIBLE)
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    sku = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = [("supplier", "sku")]

    def __str__(self):
        return f"{self.name} ({self.supplier.company or self.supplier.name})"

    def to_frontend_dict(self, request=None):
        image_url = None
        if self.image:
            image_url = self.image.url
            if request is not None:
                image_url = request.build_absolute_uri(image_url)

        return {
            "id": str(self.id),
            "name": self.name,
            "category": self.category,
            "price": self.price,
            "stock": self.stock,
            "status": self.status,
            "image": image_url,
            "supplier_id": str(self.supplier_id),
            "sku": self.sku,
        }


class ProductRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        ACCEPTED = "accepted", "Accepté"
        REJECTED = "rejected", "Refusé"
        COMPLETED = "completed", "Terminé"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_requests"
    )
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="sent_requests",
    )
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, null=True, blank=True, related_name="requests"
    )

    # Copies "figées" au moment de la demande (utile même si le produit/l'agriculteur change/est supprimé).
    farmer_name = models.CharField(max_length=150)
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    phone = models.CharField(max_length=30, blank=True, default="")
    region = models.CharField(max_length=100, blank=True, default="")

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.farmer_name} → {self.quantity}x {self.product_name} ({self.status})"

    def to_frontend_dict(self):
        return {
            "id": str(self.id),
            "farmer_name": self.farmer_name,
            "product": self.product_name,
            "quantity": self.quantity,
            "date": self.created_at.isoformat(),
            "status": self.status,
            "phone": self.phone,
            "region": self.region,
        }
