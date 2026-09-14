from django.urls import path

from . import views

urlpatterns = [
    path("stats", views.AdminStatsView.as_view(), name="admin-stats"),
    path("users", views.AdminUsersView.as_view(), name="admin-users"),
    path("users/<uuid:pk>/toggle", views.AdminUserToggleStatusView.as_view(), name="admin-user-toggle"),
    path("suppliers", views.AdminSuppliersView.as_view(), name="admin-suppliers"),
    path(
        "suppliers/<uuid:pk>/<str:decision>",
        views.AdminSupplierDecisionView.as_view(),
        name="admin-supplier-decision",
    ),
    path("products", views.AdminProductsView.as_view(), name="admin-products"),
    path("products/<uuid:pk>", views.AdminProductDetailView.as_view(), name="admin-product-detail"),
    path("diagnostics", views.AdminDiagnosticsView.as_view(), name="admin-diagnostics"),
    path("logs", views.AdminLogsView.as_view(), name="admin-logs"),
]
