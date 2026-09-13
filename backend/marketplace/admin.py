from django.contrib import admin

from .models import Product, ProductRequest


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
