from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ai_client.groq_client import AIConfigError, AIRequestError

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
    appelle la vraie IA (Groq) et enregistre + renvoie sa réponse.
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


# ======================================================================
# Messagerie directe agriculteur ↔ fournisseur
# ======================================================================
from django.db.models import Q  # noqa: E402

from accounts.models import User  # noqa: E402
from marketplace.models import Product  # noqa: E402
from notifications.models import notify  # noqa: E402

from .models import DirectMessage, DirectThread  # noqa: E402
from .serializers import DirectMessageSerializer, StartThreadSerializer  # noqa: E402


def _user_threads(user):
    return DirectThread.objects.filter(Q(farmer=user) | Q(supplier=user)).select_related(
        "farmer", "supplier"
    )


def _get_thread(user, pk) -> DirectThread:
    return get_object_or_404(_user_threads(user), pk=pk)


def _post_message(thread, sender, content, product=None) -> DirectMessage:
    message = DirectMessage.objects.create(
        thread=thread, sender=sender, content=content.strip(),
        product_id=product.pk if product else None,
        product_name=product.name if product else "",
    )
    thread.save(update_fields=["updated_at"])  # remonte le fil en tête de liste

    recipient = thread.other_party(sender)
    sender_label = (sender.company or sender.name) if sender.role == "supplier" else sender.name
    link = "/fournisseur/messages" if recipient.role == "supplier" else "/app/messages"
    notify(
        recipient,
        title="Nouveau message",
        body=f"{sender_label} : {content.strip()[:120]}",
        icon="💬",
        link=f"{link}?thread={thread.id}",
        pref="notify_new_orders" if recipient.role == "supplier" else "notify_order_updates",
    )
    return message


class ThreadListCreateView(APIView):
    """
    GET  /api/messages/threads — fils de l'utilisateur connecté (agriculteur ou fournisseur).
    POST /api/messages/threads — (agriculteur) écrit à un fournisseur ; crée le fil si besoin.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        threads = _user_threads(request.user)
        return Response([t.to_frontend_dict(request.user, request) for t in threads])

    def post(self, request):
        if request.user.role != User.Role.FARMER:
            return Response(
                {"message": "Seuls les agriculteurs peuvent initier une discussion."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = StartThreadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        data = serializer.validated_data
        supplier = get_object_or_404(
            User, pk=data["supplier_id"], role=User.Role.SUPPLIER,
            status=User.Status.ACTIVE, shop_visible=True,
        )
        product = None
        if data.get("product_id"):
            product = Product.objects.filter(pk=data["product_id"], supplier=supplier).first()

        thread, _ = DirectThread.objects.get_or_create(farmer=request.user, supplier=supplier)
        message = _post_message(thread, request.user, data["content"], product)
        return Response(
            {"thread": thread.to_frontend_dict(request.user, request), "message": message.to_frontend_dict()},
            status=status.HTTP_201_CREATED,
        )


class ThreadMessagesView(APIView):
    """
    GET  /api/messages/threads/<id>  — messages du fil (marque les messages reçus comme lus).
    POST /api/messages/threads/<id>  — envoie un message dans le fil.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        thread = _get_thread(request.user, pk)
        thread.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response(
            {
                "thread": thread.to_frontend_dict(request.user, request),
                "messages": [m.to_frontend_dict() for m in thread.messages.all()],
            }
        )

    def post(self, request, pk):
        thread = _get_thread(request.user, pk)
        serializer = DirectMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        message = _post_message(thread, request.user, serializer.validated_data["content"])
        return Response(message.to_frontend_dict(), status=status.HTTP_201_CREATED)


class UnreadCountView(APIView):
    """GET /api/messages/unread — nombre total de messages non lus (pastille de la barre latérale)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = (
            DirectMessage.objects.filter(thread__in=_user_threads(request.user), is_read=False)
            .exclude(sender=request.user)
            .count()
        )
        return Response({"count": count})
