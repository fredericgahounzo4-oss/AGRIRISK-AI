import uuid

from django.conf import settings
from django.db import models


class ActivityLog(models.Model):
    class Type(models.TextChoices):
        AUTH = "auth", "Authentification"
        REGISTER = "register", "Inscription"
        DIAGNOSTIC = "diagnostic", "Diagnostic"
        ASSISTANT = "assistant", "Assistant IA"
        PRODUCT = "product", "Produit"
        REQUEST = "request", "Demande"
        ADMIN = "admin", "Administration"

    class Severity(models.TextChoices):
        INFO = "info", "Info"
        WARNING = "warning", "Avertissement"
        DANGER = "danger", "Danger"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    action = models.CharField(max_length=200)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs",
    )
    # Copie figée du nom, utile si l'utilisateur est supprimé plus tard.
    user_label = models.CharField(max_length=150, blank=True, default="")
    type = models.CharField(max_length=20, choices=Type.choices, default=Type.ADMIN)
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.INFO)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} — {self.user_label}"

    def to_frontend_dict(self):
        return {
            "id": str(self.id),
            "action": self.action,
            "user": self.user_label or "Inconnu",
            "type": self.type,
            "severity": self.severity,
            "created_at": self.created_at.isoformat(),
        }


def log_activity(action, user=None, type=ActivityLog.Type.ADMIN, severity=ActivityLog.Severity.INFO):
    """
    Petit helper appelé depuis les autres apps (accounts, diagnostics,
    marketplace...) pour enregistrer une ligne dans le journal d'activité admin.
    Ne lève jamais d'exception : le logging ne doit jamais casser une requête.
    """
    try:
        ActivityLog.objects.create(
            action=action,
            user=user,
            user_label=getattr(user, "name", None) or getattr(user, "email", "") or "Inconnu",
            type=type,
            severity=severity,
        )
    except Exception:
        pass
