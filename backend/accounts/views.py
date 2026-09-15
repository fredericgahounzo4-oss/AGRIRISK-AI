import secrets

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PasswordResetToken
from adminpanel.models import ActivityLog, log_activity
from .serializers import (
    AvatarUploadSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterFarmerSerializer,
    RegisterSupplierSerializer,
    ResetPasswordSerializer,
    UpdateProfileSerializer,
)

User = get_user_model()


def auth_response(user, message=None, request=None):
    token, _ = Token.objects.get_or_create(user=user)
    data = {"token": token.key, "user": user.to_frontend_dict(request=request)}
    if message:
        data["message"] = message
    return data


class LoginView(APIView):
    """POST /api/auth/login"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            log_activity(
                "Tentative de connexion échouée",
                type=ActivityLog.Type.AUTH,
                severity=ActivityLog.Severity.DANGER,
            )
            return Response(
                {"message": "Email ou mot de passe incorrect.", "errors": serializer.errors},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        user = serializer.validated_data["user"]
        log_activity(f"Connexion réussie : {user.name}", user=user, type=ActivityLog.Type.AUTH)
        return Response(auth_response(user, request=request))


class RegisterFarmerView(APIView):
    """POST /api/auth/register/farmer"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterFarmerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        user = serializer.save()
        log_activity(
            f"Nouvel agriculteur inscrit : {user.name}", user=user,
            type=ActivityLog.Type.REGISTER,
        )
        return Response(
            auth_response(user, message="Compte créé avec succès.", request=request),
            status=status.HTTP_201_CREATED,
        )


class RegisterSupplierView(APIView):
    """POST /api/auth/register/supplier"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSupplierSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        user = serializer.save()
        log_activity(
            f"Nouveau fournisseur inscrit : {user.name}", user=user,
            type=ActivityLog.Type.REGISTER,
        )
        return Response(
            auth_response(user, message="Compte fournisseur créé avec succès.", request=request),
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    """POST /api/auth/logout"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    """GET /api/auth/me"""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(request.user.to_frontend_dict(request=request))


class UpdateProfileView(APIView):
    """PATCH /api/auth/profile — met à jour les infos du profil (hors mot de passe/avatar)."""

    permission_classes = [IsAuthenticated]

    def patch(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        serializer.save()
        return Response(request.user.to_frontend_dict(request=request))


class AvatarUploadView(APIView):
    """POST /api/auth/profile/avatar — upload de la photo de profil (multipart/form-data)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AvatarUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Image invalide.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        request.user.avatar = serializer.validated_data["avatar"]
        request.user.save()
        return Response(request.user.to_frontend_dict(request=request))


class ChangePasswordView(APIView):
    """POST /api/auth/change-password"""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            return Response(
                {"message": "Erreur de validation.", "errors": serializer.errors},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        # On régénère le token pour invalider les anciennes sessions.
        Token.objects.filter(user=request.user).delete()
        token = Token.objects.create(user=request.user)
        return Response({"message": "Mot de passe modifié avec succès.", "token": token.key})


class ForgotPasswordView(APIView):
    """POST /api/auth/forgot-password"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        # On répond toujours 200, même si l'email n'existe pas, pour ne pas
        # révéler quels emails sont enregistrés.
        try:
            user = User.objects.get(email__iexact=email)
            token = secrets.token_urlsafe(32)
            PasswordResetToken.objects.create(user=user, token=token)
            # TODO: envoyer un vrai email (django.core.mail.send_mail).
            # En développement, le lien est simplement affiché dans la console
            # (voir EMAIL_BACKEND dans settings.py).
            print(f"[DEV] Lien de réinitialisation pour {email} : /reset-password?token={token}")
        except User.DoesNotExist:
            pass

        return Response({"message": "Si ce compte existe, un email a été envoyé."})


class ResetPasswordView(APIView):
    """POST /api/auth/reset-password"""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_value = serializer.validated_data["token"]

        try:
            reset_token = PasswordResetToken.objects.get(token=token_value, used=False)
        except PasswordResetToken.DoesNotExist:
            return Response(
                {"message": "Lien de réinitialisation invalide ou expiré."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = reset_token.user
        user.set_password(serializer.validated_data["password"])
        user.save()
        reset_token.used = True
        reset_token.save()

        return Response({"message": "Mot de passe réinitialisé avec succès."})


User = get_user_model()


class SuppliersListView(APIView):
    """
    GET /api/suppliers — annuaire des fournisseurs pour la Carte des
    Fournisseurs (agriculteur). Filtre optionnel ?category=Semences.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        suppliers = User.objects.filter(role=User.Role.SUPPLIER, status=User.Status.ACTIVE)

        category = request.query_params.get("category")
        if category and category != "Tous":
            suppliers = suppliers.filter(category=category)

        data = [s.to_supplier_dict(viewer=request.user) for s in suppliers]
        data.sort(key=lambda s: s["distance"])
        return Response(data)


class SupplierDetailView(APIView):
    """GET /api/suppliers/<id> — fiche détaillée d'un fournisseur."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        supplier = get_object_or_404(User, pk=pk, role=User.Role.SUPPLIER, status=User.Status.ACTIVE)
        return Response(supplier.to_supplier_dict(viewer=request.user))
