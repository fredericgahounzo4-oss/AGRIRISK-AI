from django.contrib import admin

from .models import Order, OrderItem, Payment, PayoutAccount, Product, ProductRequest


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "supplier", "category", "price", "stock", "status")
    list_filter = ("status", "category")
    search_fields = ("name", "sku", "supplier__company", "supplier__email")


@admin.register(ProductRequest)
class ProductRequestAdmin(admin.ModelAdmin):
    list_display = ("farmer_name", "product_name", "quantity", "supplier", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("farmer_name", "product_name", "supplier__company", "supplier__email")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "unit_price", "quantity")
    can_delete = False


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ("provider", "provider_transaction_id", "amount", "status", "created_at")
    can_delete = False


@admin.action(description="Marquer le reversement comme effectué (fournisseur payé)")
def mark_payout_paid(modeladmin, request, queryset):
    queryset.filter(
        status=Order.Status.DELIVERED, payout_status=Order.PayoutStatus.AVAILABLE
    ).update(payout_status=Order.PayoutStatus.PAID)


@admin.action(description="Marquer le remboursement comme effectué")
def mark_refund_done(modeladmin, request, queryset):
    queryset.filter(refund_status=Order.RefundStatus.NEEDED).update(
        refund_status=Order.RefundStatus.DONE
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "reference", "buyer_name", "supplier_name", "subtotal", "commission_amount",
        "supplier_amount", "status", "payout_status", "refund_status", "created_at",
    )
    list_filter = ("status", "payout_status", "refund_status")
    search_fields = ("reference", "buyer_name", "supplier_name")
    inlines = [OrderItemInline, PaymentInline]
    actions = [mark_payout_paid, mark_refund_done]


@admin.register(PayoutAccount)
class PayoutAccountAdmin(admin.ModelAdmin):
    list_display = ("supplier", "operator", "phone", "account_name")
    search_fields = ("supplier__company", "supplier__email", "phone")
