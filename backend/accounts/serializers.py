from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(email=attrs["email"], password=attrs["password"])
        if user is None:
            raise serializers.ValidationError(
                {"message": "Email ou mot de passe incorrect."}
            )
        attrs["user"] = user
        return attrs


class BaseRegisterSerializer(serializers.Serializer):
    """Champs communs, alignés sur RegisterFarmerCredentials / RegisterSupplierCredentials."""

    name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    region = serializers.CharField(max_length=100, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Un compte existe déjà avec cet email.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirmation"]:
            raise serializers.ValidationError(
                {"password_confirmation": "Les mots de passe ne correspondent pas."}
            )
        validate_password(attrs["password"])
        return attrs


class RegisterFarmerSerializer(BaseRegisterSerializer):
    culture = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def create(self, validated_data):
        validated_data.pop("password_confirmation")
        password = validated_data.pop("password")
        user = User(
            username=validated_data["email"],
            email=validated_data["email"],
            name=validated_data["name"],
            phone=validated_data.get("phone", ""),
            region=validated_data.get("region", ""),
            culture=validated_data.get("culture", ""),
            role=User.Role.FARMER,
        )
        user.set_password(password)
        user.save()
        return user


class RegisterSupplierSerializer(BaseRegisterSerializer):
    company = serializers.CharField(max_length=150)
    category = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def create(self, validated_data):
        validated_data.pop("password_confirmation")
        password = validated_data.pop("password")
        user = User(
            username=validated_data["email"],
            email=validated_data["email"],
            name=validated_data["name"],
            phone=validated_data.get("phone", ""),
            region=validated_data.get("region", ""),
            company=validated_data.get("company", ""),
            category=validated_data.get("category", ""),
            role=User.Role.SUPPLIER,
            status=User.Status.PENDING,
        )
        user.set_password(password)
        user.save()
        return user


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "name", "phone", "region", "culture",
            "company", "category", "description", "language", "country",
        ]
        extra_kwargs = {field: {"required": False} for field in fields}


class AvatarUploadSerializer(serializers.Serializer):
    avatar = serializers.ImageField()


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField()
    new_password_confirmation = serializers.CharField()

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirmation"]:
            raise serializers.ValidationError(
                {"new_password_confirmation": "Les mots de passe ne correspondent pas."}
            )
        validate_password(attrs["new_password"], user=self.context["request"].user)
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField()
    password_confirmation = serializers.CharField()

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirmation"]:
            raise serializers.ValidationError(
                {"password_confirmation": "Les mots de passe ne correspondent pas."}
            )
        validate_password(attrs["password"])
        return attrs
