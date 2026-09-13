import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    icon = models.CharField(max_length=10, default="🔔")
    title = models.CharField(max_length=150)
    body = models.CharField(max_length=255, blank=True, default="")
    link = models.CharField(max_length=255, blank=True, default="")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} → {self.user.email}"

    def to_frontend_dict(self):
        return {
            "id": str(self.id),
            "icon": self.icon,
            "title": self.title,
            "body": self.body,
            "link": self.link,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat(),
        }


def notify(user, *, title: str, body: str = "", icon: str = "🔔", link: str = "") -> Notification:
    """
    Petit helper pour créer une notification depuis n'importe quelle app
    (diagnostics, marketplace, ...) sans dépendance circulaire :
        from notifications.models import notify
        notify(user, title="...", body="...", icon="...", link="/app/...")
    """
    return Notification.objects.create(user=user, title=title, body=body, icon=icon, link=link)
