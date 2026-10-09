import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Utilisateur personnalisé.
    Le frontend (src/features/auth/types/index.ts) attend un objet User avec :
    id, name, email, role, phone, region, culture, company, category, created_at
    """

    class Role(models.TextChoices):
        FARMER = "farmer", "Agriculteur"
        SUPPLIER = "supplier", "Fournisseur"
        ADMIN = "admin", "Administrateur"

    class Status(models.TextChoices):
        ACTIVE = "active", "Actif"
        PENDING = "pending", "En attente de validation"
        SUSPENDED = "suspended", "Suspendu"
        REJECTED = "rejected", "Refusé"

    # On garde username (requis par AbstractUser) mais on s'authentifie par email.
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.FARMER)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    phone = models.CharField(max_length=30, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)

    # Champs spécifiques agriculteur
    culture = models.CharField(max_length=100, blank=True, null=True)

    # Champs spécifiques fournisseur
    company = models.CharField(max_length=150, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, default="")
    address = models.CharField(max_length=255, blank=True, default="")
    lat = models.FloatField(blank=True, null=True)
    lng = models.FloatField(blank=True, null=True)

    # Préférences (page Paramètres)
    language = models.CharField(max_length=10, default="fr")
    country = models.CharField(max_length=100, default="Togo")

    # Préférences de notification (page Paramètres) — notifications dans l'application.
    notify_diagnostics = models.BooleanField(default=True)     # agriculteur : diagnostic terminé
    notify_order_updates = models.BooleanField(default=True)   # agriculteur : demandes / commandes
    notify_new_orders = models.BooleanField(default=True)      # fournisseur : nouvelles demandes / commandes
    notify_stock_alerts = models.BooleanField(default=True)    # fournisseur : stock faible / rupture
    # Fournisseur : boutique visible des agriculteurs (annuaire, catalogue, commandes).
    shop_visible = models.BooleanField(default=True)

    # Photo de profil
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.name} <{self.email}> ({self.role})"

    def to_frontend_dict(self, request=None):
        """Formate l'utilisateur exactement comme le type `User` du frontend."""
        avatar_url = None
        if self.avatar:
            avatar_url = self.avatar.url
            if request is not None:
                avatar_url = request.build_absolute_uri(avatar_url)

        return {
            "id": str(self.id),
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "avatar": avatar_url,
            "phone": self.phone,
            "region": self.region,
            "culture": self.culture,
            "company": self.company,
            "category": self.category,
            "description": self.description,
            "language": self.language,
            "country": self.country,
            "notify_diagnostics": self.notify_diagnostics,
            "notify_order_updates": self.notify_order_updates,
            "notify_new_orders": self.notify_new_orders,
            "notify_stock_alerts": self.notify_stock_alerts,
            "shop_visible": self.shop_visible,
            "created_at": self.date_joined.isoformat(),
        }

    def to_admin_dict(self, request=None):
        """Format utilisé par les pages Admin (Utilisateurs / Fournisseurs)."""
        base = self.to_frontend_dict(request=request)
        base["status"] = self.status
        base["diagnostics"] = self.diagnostics.count()
        return base

    def to_supplier_dict(self, viewer=None, origin=None):
        """
        Format utilisé par la Carte des Fournisseurs (agriculteur).
        `viewer` est l'utilisateur (agriculteur) qui consulte la carte ;
        `origin` = (lat, lng) optionnel : position réelle de l'appareil, prioritaire
        sur la position du profil pour calculer la distance.
        Les compteurs (produits, ventes) viennent des annotations posées par la vue
        (`products_count`, `orders_done`) pour éviter une requête par fournisseur.
        """
        from .geo import haversine_km, resolve_coordinates

        precise = self.lat is not None and self.lng is not None
        lat, lng = self.lat, self.lng
        if not precise:
            lat, lng = resolve_coordinates(self.region, str(self.id))

        distance = None
        if origin is not None:
            distance = haversine_km(origin[0], origin[1], lat, lng)
        elif viewer is not None:
            v_lat, v_lng = viewer.lat, viewer.lng
            if v_lat is None or v_lng is None:
                v_lat, v_lng = resolve_coordinates(viewer.region, str(viewer.id))
            distance = haversine_km(v_lat, v_lng, lat, lng)

        return {
            "id": str(self.id),
            "name": self.company or self.name,
            "category": self.category or "Autre",
            "description": self.description or "",
            "distance": distance if distance is not None else 0.0,
            "has_distance": distance is not None,
            "rating": 0,
            "reviews_count": 0,
            "address": self.address or self.region or "",
            "region": self.region or "",
            "phone": self.phone,
            "lat": lat,
            "lng": lng,
            "location_precise": precise,
            "products_count": getattr(self, "products_count", 0),
            "orders_done": getattr(self, "orders_done", 0),
            "member_since": self.date_joined.isoformat(),
        }


class PasswordResetToken(models.Model):
    """Jeton simple pour la réinitialisation de mot de passe."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reset_tokens")
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def __str__(self):
        return f"Reset token for {self.user.email}"
