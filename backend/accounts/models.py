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

    # Préférences (page Paramètres)
    language = models.CharField(max_length=10, default="fr")
    country = models.CharField(max_length=100, default="Togo")

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
            "created_at": self.date_joined.isoformat(),
        }

    def to_admin_dict(self, request=None):
        """Format utilisé par les pages Admin (Utilisateurs / Fournisseurs)."""
        base = self.to_frontend_dict(request=request)
        base["status"] = self.status
        base["diagnostics"] = self.diagnostics.count()
        return base


class PasswordResetToken(models.Model):
    """Jeton simple pour la réinitialisation de mot de passe."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reset_tokens")
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    def __str__(self):
        return f"Reset token for {self.user.email}"
