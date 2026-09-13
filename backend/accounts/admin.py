from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import PasswordResetToken, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    model = User
    list_display = ("email", "name", "role", "region", "is_staff", "date_joined")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("email", "name", "company")
    ordering = ("-date_joined",)

    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        ("Informations personnelles", {"fields": ("name", "phone", "region")}),
        ("Spécifique agriculteur", {"fields": ("culture",)}),
        ("Spécifique fournisseur", {"fields": ("company", "category")}),
        ("Rôle & permissions", {
            "fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions"),
        }),
        ("Dates importantes", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "name", "role", "password1", "password2"),
        }),
    )


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "token", "created_at", "used")
    readonly_fields = ("token", "created_at")
