from rest_framework import serializers


class SendMessageSerializer(serializers.Serializer):
    conversation_id = serializers.UUIDField(required=False, allow_null=True)
    content = serializers.CharField(max_length=4000, allow_blank=False)
