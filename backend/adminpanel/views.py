from django.contrib.auth import get_user_model
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from chat.models import Message
from diagnostics.models import Diagnostic
from marketplace.models import Product

from .models import ActivityLog, log_activity
from .permissions import IsAdminRole

User = get_user_model()

MONTH_LABELS_FR = {
    1: "Jan", 2: "Fév", 3: "Mar", 4: "Avr", 5: "Mai", 6: "Jun",
    7: "Jul", 8: "Août", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Déc",
}


class AdminStatsView(APIView):
    """GET /api/admin/stats — chiffres clés + graphique pour le dashboard admin."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        total_users = User.objects.exclude(role=User.Role.ADMIN).count()
        farmers = User.objects.filter(role=User.Role.FARMER).count()
        suppliers = User.objects.filter(role=User.Role.SUPPLIER).count()
        total_diagnostics = Diagnostic.objects.count()

        recent_logs = [log.to_frontend_dict() for log in ActivityLog.objects.all()[:5]]

        # 6 derniers mois, y compris le mois courant.
        now = timezone.now()
        months = []
        for i in range(5, -1, -1):
            month_index = (now.month - 1 - i) % 12 + 1
            year_offset = (now.month - 1 - i) // 12
            months.append((now.year + year_offset, month_index))

        def count_by_month(queryset, date_field="created_at"):
            rows = (
                queryset.annotate(m=TruncMonth(date_field))
                .values("m")
                .annotate(c=Count("id"))
            )
            return {(row["m"].year, row["m"].month): row["c"] for row in rows if row["m"]}

        diag_by_month = count_by_month(Diagnostic.objects.all())
        messages_by_month = count_by_month(Message.objects.filter(role=Message.Role.USER))
        users_by_month = count_by_month(User.objects.exclude(role=User.Role.ADMIN), "date_joined")

        monthly_stats = [
            {
                "month": MONTH_LABELS_FR[m],
                "diagnostics": diag_by_month.get((y, m), 0),
                "ai_messages": messages_by_month.get((y, m), 0),
                "new_users": users_by_month.get((y, m), 0),
            }
            for (y, m) in months
        ]

        return Response(
            {
                "total_users": total_users,
                "farmers": farmers,
                "suppliers": suppliers,
                "total_diagnostics": total_diagnostics,
                "recent_logs": recent_logs,
                "monthly_stats": monthly_stats,
            }
        )


class AdminUsersView(APIView):
    """GET /api/admin/users — tous les comptes (agriculteurs + fournisseurs)."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        users = User.objects.exclude(role=User.Role.ADMIN).order_by("-date_joined")
        return Response([u.to_admin_dict(request=request) for u in users])


class AdminUserToggleStatusView(APIView):
    """POST /api/admin/users/<id>/toggle — bascule actif <-> suspendu."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        user = get_object_or_404(User.objects.exclude(role=User.Role.ADMIN), pk=pk)
        if user.status == User.Status.ACTIVE:
            user.status = User.Status.SUSPENDED
            log_activity(
                f"Compte suspendu : {user.name}", user=request.user,
                type=ActivityLog.Type.ADMIN, severity=ActivityLog.Severity.WARNING,
            )
        else:
            user.status = User.Status.ACTIVE
            log_activity(
                f"Compte réactivé : {user.name}", user=request.user,
                type=ActivityLog.Type.ADMIN,
            )
        user.save(update_fields=["status"])
        return Response(user.to_admin_dict(request=request))


class AdminSuppliersView(APIView):
    """GET /api/admin/suppliers — tous les fournisseurs (validés ou en attente)."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        suppliers = User.objects.filter(role=User.Role.SUPPLIER).order_by("-date_joined")
        return Response([s.to_admin_dict(request=request) for s in suppliers])


class AdminSupplierDecisionView(APIView):
    """
    POST /api/admin/suppliers/<id>/validate
    POST /api/admin/suppliers/<id>/reject
    """

    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, pk, decision):
        supplier = get_object_or_404(User, pk=pk, role=User.Role.SUPPLIER)
        if decision == "validate":
            supplier.status = User.Status.ACTIVE
            log_activity(
                f"Fournisseur validé : {supplier.name}", user=request.user,
                type=ActivityLog.Type.ADMIN,
            )
        elif decision == "reject":
            supplier.status = User.Status.REJECTED
            log_activity(
                f"Fournisseur refusé : {supplier.name}", user=request.user,
                type=ActivityLog.Type.ADMIN, severity=ActivityLog.Severity.WARNING,
            )
        else:
            return Response({"message": "Action inconnue."}, status=status.HTTP_400_BAD_REQUEST)
        supplier.save(update_fields=["status"])
        return Response(supplier.to_admin_dict(request=request))


class AdminProductsView(APIView):
    """GET /api/admin/products — tous les produits, tous fournisseurs confondus."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        products = Product.objects.all().select_related("supplier")
        return Response([p.to_frontend_dict(request=request) for p in products])


class AdminProductDetailView(APIView):
    """DELETE /api/admin/products/<id> — retire un produit de la plateforme."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def delete(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        log_activity(
            f"Produit retiré : {product.name}", user=request.user,
            type=ActivityLog.Type.ADMIN, severity=ActivityLog.Severity.WARNING,
        )
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminDiagnosticsView(APIView):
    """GET /api/admin/diagnostics — tous les diagnostics, tous utilisateurs confondus."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        diagnostics = Diagnostic.objects.all().select_related("user")
        return Response([d.to_history_dict(request=request) for d in diagnostics])


class AdminLogsView(APIView):
    """GET /api/admin/logs — journal d'activité de la plateforme."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        logs = ActivityLog.objects.all()[:200]
        return Response([log.to_frontend_dict() for log in logs])
