from rest_framework import serializers

from .models import PlatformSettings


class PlatformSettingsSerializer(serializers.ModelSerializer):
    confidence_threshold = serializers.IntegerField(min_value=0, max_value=100)

    class Meta:
        model = PlatformSettings
        fields = ["auto_validate_suppliers", "confidence_threshold", "maintenance_mode"]
