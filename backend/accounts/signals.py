"""
Signals for the accounts app.

Sprint 6: auto-create a TenantAIFeatureFlags row the first time a Company
lands in the DB, so the admin screens never render an empty grid.
"""
from __future__ import annotations

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Company, TenantAIFeatureFlags

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Company)
def ensure_tenant_ai_feature_flags(sender, instance, created, **kwargs):
    """Create a default feature-flag row the moment a Company is created.

    Swallow-all: a failure here must never block Company creation (which
    is on the critical path for tenant onboarding + sandbox provisioning).
    """
    if not created:
        return
    try:
        TenantAIFeatureFlags.objects.get_or_create(company=instance)
    except Exception as e:  # noqa: BLE001
        logger.warning("TenantAIFeatureFlags autocreate failed for %s: %s", instance.id, e)
