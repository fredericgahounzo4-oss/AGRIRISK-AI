from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ai_client.gemini_client import AIConfigError, AIRequestError

from .models import Conversation, Message
from .serializers import SendMessageSerializer
from .services import generate_reply, generate_title


class ConversationListCreateView(APIView):
    """
    GET  /api/conversations — liste des conversations de l'utilisateur.
    POST /api/conversations — crée une conversation vide.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversations = Conversation.objects.filter(user=request.user)
        return Response([c.to_frontend_dict() for c in conversations])

    def post(self, request):
        conversation = Conversation.objects.create(user=request.user)
        return Response(conversation.to_frontend_dict(), status=status.HTTP_201_CREATED)


class ConversationMessagesView(APIView):
    """GET /api/conversations/<id>/messages"""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        conversation = get_object_or_404(Conversation, pk=pk, user=request.user)
        messages = conversation.messages.order_by("created_at")
        return Response([m.to_frontend_dict() for m in messages])


class SendMessageView(APIView):
    """
    POST /api/conversations/messages
    Crée la conversation si besoin, enregistre le message utilisateur,
    appelle la vraie IA (Gemini) et enregistre + renvoie sa réponse.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SendMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        content = serializer.validated_data["content"]
        conversation_id = serializer.validated_data.get("conversation_id")

        if conversation_id:
            conversation = get_object_or_404(Conversation, pk=conversation_id, user=request.user)
        else:
            conversation = Conversation.objects.create(
                user=request.user, title=generate_title(content)
            )

        Message.objects.create(conversation=conversation, role=Message.Role.USER, content=content)

        try:
            reply_text = generate_reply(conversation, content)
        except AIConfigError as exc:
            return Response({"message": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except AIRequestError as exc:
            return Response(
                {"message": f"Erreur lors de la génération de la réponse IA : {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        assistant_message = Message.objects.create(
            conversation=conversation, role=Message.Role.ASSISTANT, content=reply_text
        )
        conversation.refresh_from_db()

        return Response(
            {
                "conversation": conversation.to_frontend_dict(),
                "message": assistant_message.to_frontend_dict(),
            },
            status=status.HTTP_201_CREATED,
        )
