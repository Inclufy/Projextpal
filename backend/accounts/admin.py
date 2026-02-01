from django.contrib import admin
from accounts.models import (
    CustomUser,
    VerificationToken,
    PasswordResetToken,
    Company,
)


class CompanyAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_subscribed")
    list_filter = ("is_subscribed",)
    search_fields = ("name",)


class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "role")
    list_filter = ("theme", "role")
    search_fields = ("email", "username")


class VerificationTokenAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "token", "created_at", "expires_at", "is_used")
    list_filter = ("is_used", "created_at", "expires_at")
    search_fields = ("user__email", "token")


class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "token", "created_at", "expires_at", "is_used")
    list_filter = ("is_used", "created_at", "expires_at")
    search_fields = ("user__email", "token")


# Register your models here.
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(VerificationToken, VerificationTokenAdmin)
admin.site.register(PasswordResetToken, PasswordResetTokenAdmin)
admin.site.register(Company, CompanyAdmin)
