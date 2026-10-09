import uuid

from django.conf import settings
from django.db import models


class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="conversations"
    )
    title = models.CharField(max_length=200, default="Nouvelle conversation")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.title} ({self.user.email})"

    def to_frontend_dict(self):
        last_message = self.messages.order_by("-created_at").first()
        return {
            "id": str(self.id),
            "title": self.title,
            "last_message": last_message.content if last_message else "",
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class Message(models.Model):
    class Role(models.TextChoices):
        USER = "user", "Utilisateur"
        ASSISTANT = "assistant", "Assistant"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    role = models.CharField(max_length=10, choices=Role.choices)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}"

    def to_frontend_dict(self):
        return {
            "id": str(self.id),
            "role": self.role,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
        }


# ======================================================================
# Messagerie directe agriculteur ↔ fournisseur
# ======================================================================
class DirectThread(models.Model):
    """Fil de discussion entre un agriculteur et un fournisseur (un seul par paire)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farmer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="farmer_threads"
    )
    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="supplier_threads"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        unique_together = [("farmer", "supplier")]

    def __str__(self):
        return f"{self.farmer.email} ↔ {self.supplier.email}"

    def other_party(self, user):
        return self.supplier if user.id == self.farmer_id else self.farmer

    def to_frontend_dict(self, viewer, request=None):
        other = self.other_party(viewer)
        last = self.messages.order_by("-created_at").first()
        avatar = None
        if other.avatar:
            avatar = request.build_absolute_uri(other.avatar.url) if request else other.avatar.url
        return {
            "id": str(self.id),
            "other_id": str(other.id),
            "other_name": (other.company or other.name) if other.role == "supplier" else other.name,
            "other_role": other.role,
            "other_avatar": avatar,
            "last_message": last.content if last else "",
            "last_message_at": last.created_at.isoformat() if last else self.created_at.isoformat(),
            "unread_count": self.messages.filter(is_read=False).exclude(sender=viewer).count(),
            "updated_at": self.updated_at.isoformat(),
        }


class DirectMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    thread = models.ForeignKey(DirectThread, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_direct_messages"
    )
    content = models.TextField(max_length=2000)
    # Produit à l'origine de la discussion (copie figée du nom, utile si supprimé).
    product_id = models.UUIDField(null=True, blank=True)
    product_name = models.CharField(max_length=200, blank=True, default="")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender.email}: {self.content[:40]}"

    def to_frontend_dict(self):
        return {
            "id": str(self.id),
            "sender_id": str(self.sender_id),
            "content": self.content,
            "product_id": str(self.product_id) if self.product_id else None,
            "product_name": self.product_name,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat(),
        }
