from rest_framework import serializers

from .models import Diagnostic


class DiagnosticUploadSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=Diagnostic.DiagnosticType.choices)
    image = serializers.ImageField()
