import uuid

from django.conf import settings
from django.db import models


class Diagnostic(models.Model):
    class DiagnosticType(models.TextChoices):
        CULTURE = "culture", "Culture"
        ANIMAL = "animal", "Animal"

    class RiskLevel(models.TextChoices):
        FAIBLE = "Faible", "Faible"
        MOYEN = "Moyen", "Moyen"
        ELEVE = "Élevé", "Élevé"
        CRITIQUE = "Critique", "Critique"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="diagnostics"
    )
    type = models.CharField(max_length=10, choices=DiagnosticType.choices)
    image = models.ImageField(upload_to="diagnostics/")

    disease_name = models.CharField(max_length=200)
    scientific_name = models.CharField(max_length=200, blank=True)
    confidence = models.PositiveSmallIntegerField(default=0)  # 0-100
    risk_level = models.CharField(max_length=10, choices=RiskLevel.choices)

    # Stockés en JSON : listes de chaînes.
    causes = models.JSONField(default=list, blank=True)
    recommendations = models.JSONField(default=list, blank=True)
    treatment = models.TextField(blank=True)

    # Réponse brute du modèle, conservée pour debug / audit.
    raw_ai_response = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.disease_name} ({self.user.email})"

    def to_result_dict(self, request=None):
        """Format exact attendu par le type `DiagnosticResult` du frontend."""
        image_url = self.image.url
        if request is not None:
            image_url = request.build_absolute_uri(image_url)

        return {
            "id": str(self.id),
            "type": self.type,
            "disease_name": self.disease_name,
            "scientific_name": self.scientific_name,
            "confidence": self.confidence,
            "risk_level": self.risk_level,
            "causes": [{"label": c} for c in self.causes],
            "recommendations": [{"label": r} for r in self.recommendations],
            "treatment": self.treatment,
            "image_url": image_url,
            "additional_images": [],
            "created_at": self.created_at.isoformat(),
        }

    def to_history_dict(self, request=None):
        """Format exact attendu par le type `DiagnosticHistoryItem` du frontend."""
        image_url = self.image.url
        if request is not None:
            image_url = request.build_absolute_uri(image_url)

        return {
            "id": str(self.id),
            "type": self.type,
            "disease_name": self.disease_name,
            "risk_level": self.risk_level,
            "confidence": self.confidence,
            "created_at": self.created_at.isoformat(),
            "image_url": image_url,
        }
