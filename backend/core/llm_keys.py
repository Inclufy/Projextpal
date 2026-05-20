"""
LLM key resolver — BYO key with fallback.

Resolution order for a given (company, provider) pair:

  1. If `company` has an active `CompanyAIKey` row with a non-empty key
     for the requested provider, return that key (and base_url / org_id).
  2. Otherwise fall back to `settings.OPENAI_API_KEY` or
     `settings.ANTHROPIC_API_KEY` (Inclufy-managed pool).
  3. If neither is set, return an empty string and the caller decides
     whether to raise.

Every successful resolution records `last_used_at` + `last_used_provider`
on the CompanyAIKey row so admins can audit usage.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from django.conf import settings
from django.utils import timezone


@dataclass
class LLMKeyResolution:
    api_key: str
    base_url: str = ""
    organization_id: str = ""
    source: str = "fallback"  # "byo" | "fallback" | "missing"

    @property
    def ok(self) -> bool:
        return bool(self.api_key)


def get_llm_key(
    company,
    provider: str,
    *,
    user=None,
) -> LLMKeyResolution:
    """
    Resolve the API key + base URL + (OpenAI) organization id to use
    for an LLM call. See module docstring for the precedence rules.

    `company` may be None (e.g. anonymous flows or system jobs); we then
    skip step 1 and go straight to fallback.
    """
    provider = (provider or "").lower()
    api_key = ""
    base_url = ""
    org_id = ""
    source = "missing"

    company_key = None
    if company is not None:
        # Defer the import to runtime to avoid Django apps-not-ready issues.
        try:
            from accounts.models import CompanyAIKey
            company_key = CompanyAIKey.objects.filter(
                company=company, is_active=True,
            ).first()
        except Exception:
            company_key = None

    if company_key:
        if provider == "openai" and company_key.openai_api_key:
            api_key = company_key.openai_api_key
            base_url = company_key.openai_base_url
            org_id = company_key.openai_organization_id
            source = "byo"
        elif provider == "anthropic" and company_key.anthropic_api_key:
            api_key = company_key.anthropic_api_key
            base_url = company_key.anthropic_base_url
            source = "byo"

    if not api_key:
        if provider == "openai":
            api_key = getattr(settings, "OPENAI_API_KEY", "") or ""
        elif provider == "anthropic":
            api_key = getattr(settings, "ANTHROPIC_API_KEY", "") or ""
        source = "fallback" if api_key else "missing"

    # Audit trail (best-effort)
    if api_key and company_key and source == "byo":
        try:
            company_key.last_used_at = timezone.now()
            company_key.last_used_provider = provider
            company_key.save(update_fields=["last_used_at", "last_used_provider"])
        except Exception:
            pass

    return LLMKeyResolution(
        api_key=api_key, base_url=base_url,
        organization_id=org_id, source=source,
    )
