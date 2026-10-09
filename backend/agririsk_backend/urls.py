from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from chat import views as chat_views
from diagnostics import views as diagnostics_views
from marketplace import views as marketplace_views
from notifications import views as notification_views
from accounts import views as accounts_views
from adminpanel import views as adminpanel_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/admin/", include("adminpanel.urls")),
    path("api/platform/status", adminpanel_views.PlatformStatusView.as_view(), name="platform-status"),

    # Carte des Fournisseurs (agriculteur) — routes déclarées ici (et non
    # sous api/auth/) pour matcher exactement /api/suppliers attendu par
    # le frontend (src/features/suppliers/api/suppliersApi.ts).
    path("api/suppliers", accounts_views.SuppliersListView.as_view(), name="suppliers-list"),
    path("api/suppliers/<uuid:pk>", accounts_views.SupplierDetailView.as_view(), name="suppliers-detail"),

    # Diagnostics — routes déclarées directement ici pour matcher exactement
    # les URL sans slash final attendues par le frontend (src/services/api.ts).
    path("api/diagnostics", diagnostics_views.DiagnosticListCreateView.as_view(), name="diagnostics-list-create"),
    path("api/diagnostics/<uuid:pk>", diagnostics_views.DiagnosticDetailView.as_view(), name="diagnostics-detail"),
    path("api/diagnostics/<uuid:pk>/report", diagnostics_views.DiagnosticReportView.as_view(), name="diagnostics-report"),

    # Assistant IA (conversations)
    path("api/conversations", chat_views.ConversationListCreateView.as_view(), name="conversations-list-create"),
    path("api/conversations/messages", chat_views.SendMessageView.as_view(), name="conversations-send-message"),
    path("api/conversations/<uuid:pk>/messages", chat_views.ConversationMessagesView.as_view(), name="conversation-messages"),

    # Messagerie directe agriculteur ↔ fournisseur
    path("api/messages/threads", chat_views.ThreadListCreateView.as_view(), name="threads-list-create"),
    path("api/messages/threads/<uuid:pk>", chat_views.ThreadMessagesView.as_view(), name="threads-messages"),
    path("api/messages/unread", chat_views.UnreadCountView.as_view(), name="messages-unread"),

    # Marketplace (produits fournisseur + demandes)
    path("api/marketplace/products", marketplace_views.ProductListCreateView.as_view(), name="products-list-create"),
    path("api/marketplace/products/<uuid:pk>", marketplace_views.ProductDetailView.as_view(), name="products-detail"),
    path("api/marketplace/requests", marketplace_views.RequestListView.as_view(), name="requests-list"),
    path("api/marketplace/requests/create", marketplace_views.CreateRequestView.as_view(), name="requests-create"),
    path("api/marketplace/requests/<uuid:pk>/<str:action>", marketplace_views.RequestActionView.as_view(), name="requests-action"),

    # Marketplace : catalogue, commandes, paiement FedaPay
    path("api/marketplace/catalog", marketplace_views.CatalogView.as_view(), name="catalog"),
    path("api/marketplace/orders", marketplace_views.OrderListCreateView.as_view(), name="orders-list-create"),
    path("api/marketplace/orders/<uuid:pk>", marketplace_views.OrderDetailView.as_view(), name="orders-detail"),
    path("api/marketplace/orders/<uuid:pk>/pay", marketplace_views.OrderPayView.as_view(), name="orders-pay"),
    path("api/marketplace/orders/<uuid:pk>/verify-payment", marketplace_views.OrderVerifyPaymentView.as_view(), name="orders-verify-payment"),
    path("api/marketplace/orders/<uuid:pk>/cancel", marketplace_views.OrderCancelView.as_view(), name="orders-cancel"),
    path("api/marketplace/orders/<uuid:pk>/confirm-delivery", marketplace_views.OrderConfirmDeliveryView.as_view(), name="orders-confirm-delivery"),
    path("api/marketplace/orders/<uuid:pk>/status", marketplace_views.OrderSupplierStatusView.as_view(), name="orders-supplier-status"),
    path("api/marketplace/orders/<uuid:pk>/simulate-payment", marketplace_views.OrderSimulatePaymentView.as_view(), name="orders-simulate-payment"),
    path("api/marketplace/webhooks/fedapay", marketplace_views.FedaPayWebhookView.as_view(), name="fedapay-webhook"),
    path("api/marketplace/earnings", marketplace_views.EarningsView.as_view(), name="earnings"),
    path("api/marketplace/payout-account", marketplace_views.PayoutAccountView.as_view(), name="payout-account"),

    # Notifications
    path("api/notifications", notification_views.NotificationListView.as_view(), name="notifications-list"),
    path("api/notifications/read-all", notification_views.NotificationMarkAllReadView.as_view(), name="notifications-read-all"),
    path("api/notifications/<uuid:pk>/read", notification_views.NotificationMarkReadView.as_view(), name="notifications-mark-read"),
]

# Sert les fichiers médias (avatars, images de diagnostic) même en
# production. Ce n'est pas la solution la plus scalable (un vrai
# stockage type S3 serait préférable à grande échelle), mais suffisant
# pour la taille actuelle du projet, et bien plus simple à mettre en
# place qu'un service de stockage externe.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
