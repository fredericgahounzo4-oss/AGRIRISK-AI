from django.contrib import admin

from .models import Diagnostic


@admin.register(Diagnostic)
class DiagnosticAdmin(admin.ModelAdmin):
    list_display = ("disease_name", "user", "type", "risk_level", "confidence", "created_at")
    list_filter = ("type", "risk_level")
    search_fields = ("disease_name", "user__email")
    readonly_fields = ("raw_ai_response", "created_at")
