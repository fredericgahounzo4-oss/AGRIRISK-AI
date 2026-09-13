from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification


class NotificationListView(APIView):
    """
    GET /api/notifications
    Renvoie { results: [...], unread_count: N } — format attendu par
    src/features/notifications/api/notificationsApi.ts (NotificationListResponse).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)[:50]
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({
            "results": [n.to_frontend_dict() for n in notifications],
            "unread_count": unread_count,
        })


class NotificationMarkReadView(APIView):
    """POST /api/notifications/<id>/read"""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, user=request.user)
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])
        return Response(notification.to_frontend_dict())


class NotificationMarkAllReadView(APIView):
    """POST /api/notifications/read-all"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)
