# ============================================================
# ADMIN PORTAL - DJANGO ADMIN
# Register models with Django admin
# ============================================================

from django.contrib import admin
from .models import AuditLog, SystemSetting


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['created_at', 'user_email', 'action', 'category', 'severity', 'description']
    list_filter = ['action', 'category', 'severity', 'created_at']
    search_fields = ['user_email', 'description']
    readonly_fields = [
        'id', 'user', 'user_email', 'action', 'category', 'severity',
        'description', 'metadata', 'resource_type', 'resource_id',
        'company', 'ip_address', 'user_agent', 'created_at'
    ]
    ordering = ['-created_at']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(SystemSetting)
class SystemSettingAdmin(admin.ModelAdmin):
    list_display = ['key', 'category', 'is_sensitive', 'updated_at']
    list_filter = ['category', 'is_sensitive']
    search_fields = ['key', 'description']
    ordering = ['category', 'key']
