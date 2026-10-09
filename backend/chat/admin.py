from django.contrib import admin

from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ("role", "content", "created_at")


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "created_at", "updated_at")
    search_fields = ("title", "user__email")
    inlines = [MessageInline]


from .models import DirectMessage, DirectThread  # noqa: E402


class DirectMessageInline(admin.TabularInline):
    model = DirectMessage
    extra = 0
    readonly_fields = ("sender", "content", "product_name", "is_read", "created_at")


@admin.register(DirectThread)
class DirectThreadAdmin(admin.ModelAdmin):
    list_display = ("farmer", "supplier", "created_at", "updated_at")
    search_fields = ("farmer__email", "supplier__email")
    inlines = [DirectMessageInline]
