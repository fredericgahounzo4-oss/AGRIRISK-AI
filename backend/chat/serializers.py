from rest_framework import serializers


class SendMessageSerializer(serializers.Serializer):
    conversation_id = serializers.UUIDField(required=False, allow_null=True)
    content = serializers.CharField(max_length=4000, allow_blank=False)


class StartThreadSerializer(serializers.Serializer):
    """Ouvre (ou retrouve) un fil avec un fournisseur et envoie un premier message."""

    supplier_id = serializers.UUIDField()
    product_id = serializers.UUIDField(required=False, allow_null=True)
    content = serializers.CharField(max_length=2000, allow_blank=False)


class DirectMessageSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=2000, allow_blank=False)
