from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from chat import views as chat_views
from diagnostics import views as diagnostics_views
from marketplace import views as marketplace_views
from notifications import views as notification_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/admin/", include("adminpanel.urls")),

    # Diagnostics — routes déclarées directement ici pour matcher exactement
    # les URL sans slash final attendues par le frontend (src/services/api.ts).
    path("api/diagnostics", diagnostics_views.DiagnosticListCreateView.as_view(), name="diagnostics-list-create"),
    path("api/diagnostics/<uuid:pk>", diagnostics_views.DiagnosticDetailView.as_view(), name="diagnostics-detail"),
    path("api/diagnostics/<uuid:pk>/report", diagnostics_views.DiagnosticReportView.as_view(), name="diagnostics-report"),

    # Assistant IA (conversations)
    path("api/conversations", chat_views.ConversationListCreateView.as_view(), name="conversations-list-create"),
    path("api/conversations/messages", chat_views.SendMessageView.as_view(), name="conversations-send-message"),
    path("api/conversations/<uuid:pk>/messages", chat_views.ConversationMessagesView.as_view(), name="conversation-messages"),

    # Marketplace (produits fournisseur + demandes)
    path("api/marketplace/products", marketplace_views.ProductListCreateView.as_view(), name="products-list-create"),
    path("api/marketplace/products/<uuid:pk>", marketplace_views.ProductDetailView.as_view(), name="products-detail"),
    path("api/marketplace/requests", marketplace_views.RequestListView.as_view(), name="requests-list"),
    path("api/marketplace/requests/create", marketplace_views.CreateRequestView.as_view(), name="requests-create"),
    path("api/marketplace/requests/<uuid:pk>/<str:action>", marketplace_views.RequestActionView.as_view(), name="requests-action"),

    # Notifications
    path("api/notifications", notification_views.NotificationListView.as_view(), name="notifications-list"),
    path("api/notifications/read-all", notification_views.NotificationMarkAllReadView.as_view(), name="notifications-read-all"),
    path("api/notifications/<uuid:pk>/read", notification_views.NotificationMarkReadView.as_view(), name="notifications-mark-read"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
