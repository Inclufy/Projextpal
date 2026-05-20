"""
LLM key resolver — BYO key with fallback.

Resolution order for a given (company, provider) pair:

  1. `admin_portal.ClientApiKey` — the UI-managed BYO key (Settings →
     API Keys page). This is the canonical happy-path: customers toggle
     "Custom" in the web UI and paste their key.
  2. `accounts.CompanyAIKey` — admin-only "advanced" store for cases
     that ClientApiKey can't represent (base_url override for Azure
     OpenAI / Bedrock / corporate proxy, OpenAI organization id).
  3. `settings.OPENAI_API_KEY` / `settings.ANTHROPIC_API_KEY` — Inclufy
     multi-tenant pool fallback.
  4. Empty string if none of the above are set.

Audit trail: every BYO hit (steps 1 or 2) updates `CompanyAIKey.last_used_*`
when that row exists, so admins can spot which provider/route is in use.
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
    source: str = "fallback"  # "byo-ui" | "byo-advanced" | "fallback" | "missing"

    @property
    def ok(self) -> bool:
        return bool(self.api_key)


def get_openai_client(company, **extra_kwargs):
    """
    Resolve the company's OpenAI key and return an `openai.OpenAI` client.

    Honors base_url + organization_id overrides from CompanyAIKey if set.
    Returns None if no key is available (caller decides whether to raise).
    """
    from openai import OpenAI  # lazy import keeps non-AI flows fast
    res = get_llm_key(company, "openai")
    if not res.ok:
        return None
    kwargs = {"api_key": res.api_key, **extra_kwargs}
    if res.base_url:
        kwargs["base_url"] = res.base_url
    if res.organization_id:
        kwargs["organization"] = res.organization_id
    return OpenAI(**kwargs)


def get_anthropic_client(company, **extra_kwargs):
    """
    Resolve the company's Anthropic key and return an `anthropic.Anthropic`
    client. Returns None if no key is available.
    """
    from anthropic import Anthropic
    res = get_llm_key(company, "anthropic")
    if not res.ok:
        return None
    kwargs = {"api_key": res.api_key, **extra_kwargs}
    if res.base_url:
        kwargs["base_url"] = res.base_url
    return Anthropic(**kwargs)


def get_langchain_openai_kwargs(company) -> dict:
    """
    Helper for `langchain_openai.ChatOpenAI(**kwargs)` — returns the
    dict to splat in. Empty dict if no key (so caller can detect).
    """
    res = get_llm_key(company, "openai")
    if not res.ok:
        return {}
    kwargs = {"openai_api_key": res.api_key}
    if res.base_url:
        kwargs["openai_api_base"] = res.base_url
    if res.organization_id:
        kwargs["openai_organization"] = res.organization_id
    return kwargs


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

    company_key = None  # accounts.CompanyAIKey (advanced)
    client_key = None   # admin_portal.ClientApiKey (UI-managed, happy path)

    if company is not None:
        # Step 1 — UI-managed BYO key (Settings → API Keys in the web app).
        try:
            from admin_portal.models import ClientApiKey
            client_key = ClientApiKey.objects.filter(
                company=company, provider=provider, is_active=True,
            ).first()
        except Exception:
            client_key = None

        # Step 2 — advanced admin-only store (Azure / Bedrock / proxy URLs).
        try:
            from accounts.models import CompanyAIKey
            company_key = CompanyAIKey.objects.filter(
                company=company, is_active=True,
            ).first()
        except Exception:
            company_key = None

    if client_key and client_key.api_key:
        api_key = client_key.api_key
        source = "byo-ui"
        # ClientApiKey doesn't model base_url / org_id — borrow from
        # CompanyAIKey if also configured.
        if company_key:
            if provider == "openai":
                base_url = company_key.openai_base_url
                org_id = company_key.openai_organization_id
            elif provider == "anthropic":
                base_url = company_key.anthropic_base_url
    elif company_key:
        if provider == "openai" and company_key.openai_api_key:
            api_key = company_key.openai_api_key
            base_url = company_key.openai_base_url
            org_id = company_key.openai_organization_id
            source = "byo-advanced"
        elif provider == "anthropic" and company_key.anthropic_api_key:
            api_key = company_key.anthropic_api_key
            base_url = company_key.anthropic_base_url
            source = "byo-advanced"

    if not api_key:
        if provider == "openai":
            api_key = getattr(settings, "OPENAI_API_KEY", "") or ""
        elif provider == "anthropic":
            api_key = getattr(settings, "ANTHROPIC_API_KEY", "") or ""
        source = "fallback" if api_key else "missing"

    # Audit trail — only when a CompanyAIKey row exists to attach to.
    if api_key and company_key and source.startswith("byo"):
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
