import random
import string
import uuid
from decimal import Decimal

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


# ======================================================================
# Marketplace : commandes, lignes de commande, paiements, compte de reversement
# ======================================================================
def _generate_reference():
    """Référence lisible par l'humain, ex: AGR-7K2M9Q."""
    alphabet = string.ascii_uppercase.replace("O", "").replace("I", "") + "23456789"
    return "AGR-" + "".join(random.choices(alphabet, k=6))


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "En attente de paiement"
        PAID = "paid", "Payée"
        PREPARING = "preparing", "En préparation"
        SHIPPED = "shipped", "Expédiée"
        DELIVERED = "delivered", "Livrée"
        CANCELLED = "cancelled", "Annulée"

    class DeliveryMethod(models.TextChoices):
        PICKUP = "pickup", "Retrait chez le fournisseur"
        DELIVERY = "delivery", "Livraison"

    class PayoutStatus(models.TextChoices):
        NONE = "none", "Non dû"           # pas encore livrée
        AVAILABLE = "available", "À reverser"  # livrée, argent dû au fournisseur
        PAID = "paid", "Reversé"

    class RefundStatus(models.TextChoices):
        NONE = "none", "Aucun"
        NEEDED = "needed", "Remboursement à faire"
        DONE = "done", "Remboursée"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=12, unique=True, default=_generate_reference)
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="orders",
    )
    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="supplier_orders",
    )
    # Copies figées (utile même si le compte change ou est supprimé).
    buyer_name = models.CharField(max_length=150)
    supplier_name = models.CharField(max_length=200)

    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)

    # Montants en FCFA (entiers, le FCFA n'a pas de centimes).
    subtotal = models.PositiveIntegerField(help_text="Total payé par l'acheteur (FCFA)")
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0"))
    commission_amount = models.PositiveIntegerField(default=0, help_text="Commission AgriRisk (FCFA)")
    supplier_amount = models.PositiveIntegerField(default=0, help_text="Montant net dû au fournisseur (FCFA)")

    delivery_method = models.CharField(
        max_length=10, choices=DeliveryMethod.choices, default=DeliveryMethod.PICKUP
    )
    delivery_address = models.CharField(max_length=255, blank=True, default="")
    phone = models.CharField(max_length=30, blank=True, default="")
    note = models.CharField(max_length=500, blank=True, default="")

    payout_status = models.CharField(
        max_length=10, choices=PayoutStatus.choices, default=PayoutStatus.NONE
    )
    refund_status = models.CharField(
        max_length=10, choices=RefundStatus.choices, default=RefundStatus.NONE
    )

    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reference} — {self.buyer_name} → {self.supplier_name} ({self.status})"

    def to_frontend_dict(self):
        payment = self.payments.first()
        return {
            "id": str(self.id),
            "reference": self.reference,
            "status": self.status,
            "buyer_name": self.buyer_name,
            "supplier_id": str(self.supplier_id),
            "supplier_name": self.supplier_name,
            "subtotal": self.subtotal,
            "commission_amount": self.commission_amount,
            "supplier_amount": self.supplier_amount,
            "delivery_method": self.delivery_method,
            "delivery_address": self.delivery_address,
            "phone": self.phone,
            "note": self.note,
            "payout_status": self.payout_status,
            "refund_status": self.refund_status,
            "payment_status": payment.status if payment else None,
            "created_at": self.created_at.isoformat(),
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None,
            "items": [i.to_frontend_dict() for i in self.items.all()],
        }


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, null=True, blank=True, related_name="order_items"
    )
    # Copies figées au moment de la commande.
    product_name = models.CharField(max_length=200)
    unit_price = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField(default=1)

    @property
    def line_total(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"

    def to_frontend_dict(self):
        return {
            "id": str(self.id),
            "product_id": str(self.product_id) if self.product_id else None,
            "product_name": self.product_name,
            "unit_price": self.unit_price,
            "quantity": self.quantity,
            "line_total": self.line_total,
        }


class Payment(models.Model):
    """Une tentative de paiement FedaPay pour une commande."""

    class Status(models.TextChoices):
        PENDING = "pending", "En cours"
        APPROVED = "approved", "Approuvé"
        DECLINED = "declined", "Refusé"
        CANCELED = "canceled", "Annulé"
        EXPIRED = "expired", "Expiré"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payments")
    provider = models.CharField(max_length=20, default="fedapay")
    provider_transaction_id = models.CharField(max_length=64, blank=True, default="", db_index=True)
    amount = models.PositiveIntegerField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    payment_url = models.URLField(max_length=500, blank=True, default="")
    raw = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order.reference} — {self.provider} {self.status}"


class PayoutAccount(models.Model):
    """Numéro Mobile Money où le fournisseur reçoit ses reversements."""

    class Operator(models.TextChoices):
        TMONEY = "tmoney", "T-Money (Togocom)"
        FLOOZ = "flooz", "Flooz (Moov Africa)"
        MTN = "mtn", "MTN MoMo"
        MOOV = "moov", "Moov Money"
        ORANGE = "orange", "Orange Money"
        WAVE = "wave", "Wave"
        OTHER = "other", "Autre"

    supplier = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payout_account"
    )
    operator = models.CharField(max_length=10, choices=Operator.choices, default=Operator.TMONEY)
    phone = models.CharField(max_length=30)
    account_name = models.CharField(max_length=150, blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.supplier} — {self.operator} {self.phone}"

    def to_frontend_dict(self):
        return {
            "operator": self.operator,
            "phone": self.phone,
            "account_name": self.account_name,
        }
