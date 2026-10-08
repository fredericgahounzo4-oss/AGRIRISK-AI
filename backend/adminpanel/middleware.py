from django.http import JsonResponse
from rest_framework.authtoken.models import Token

from .models import PlatformSettings

MAINTENANCE_MESSAGE = "La plateforme est en maintenance. Merci de réessayer dans quelques instants."

# Toujours accessibles, même en maintenance : connexion (les admins doivent pouvoir
# se connecter), déconnexion, statut public, et webhook de paiement (un paiement
# en cours ne doit jamais être perdu).
ALWAYS_ALLOWED = (
    "/api/auth/login",
    "/api/auth/logout",
    "/api/platform/status",
    "/api/marketplace/webhooks/",
)


class MaintenanceModeMiddleware:
    """
    Si le « mode maintenance » est actif (Admin > Paramètres système), l'API
    répond 503 à tout le monde sauf aux administrateurs authentifiés.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if self._blocked(request):
            return JsonResponse({"message": MAINTENANCE_MESSAGE, "maintenance": True}, status=503)
        return self.get_response(request)

    def _blocked(self, request):
        path = request.path
        if request.method == "OPTIONS" or not path.startswith("/api/"):
            return False
        if path.startswith(ALWAYS_ALLOWED):
            return False
        try:
            if not PlatformSettings.load().maintenance_mode:
                return False
        except Exception:
            # Base pas encore migrée, etc. : on ne bloque jamais par erreur.
            return False
        return not self._is_admin(request)

    @staticmethod
    def _is_admin(request):
        header = request.META.get("HTTP_AUTHORIZATION", "")
        parts = header.split()
        if len(parts) != 2 or parts[0] != "Bearer":
            return False
        try:
            token = Token.objects.select_related("user").get(key=parts[1])
        except Token.DoesNotExist:
            return False
        return token.user.is_active and token.user.role == "admin"
