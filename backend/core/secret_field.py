"""
EncryptedTextField — symmetric Fernet encryption for sensitive CharField/TextField values.

Used for storing API keys at rest so a database leak doesn't expose
customer credentials. Combined with database at-rest encryption (KMS-CMK
on RDS) this gives belt-and-braces defence.

Usage:
    class CompanyAIKey(models.Model):
        openai_api_key = EncryptedCharField(max_length=500, blank=True, default="")

Configuration:
    Set FIELD_ENCRYPTION_KEY in your environment to a 32-byte URL-safe
    base64 string. Generate one with:

        python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'

    Rotation: keep both old + new keys in FIELD_ENCRYPTION_KEYS (comma-
    separated). The first key is used for writes; all keys are tried for
    reads. After all data has been re-encrypted (re_encrypt_api_keys
    management command), drop the old key.

Plaintext fallback:
    If FIELD_ENCRYPTION_KEY is missing/blank, EncryptedTextField behaves
    as a regular TextField (so local dev without the secret works). DO
    NOT deploy production without setting it -- raises a system check
    warning at startup.
"""

from __future__ import annotations

import os
from typing import Iterable

from django.conf import settings
from django.core.checks import Warning as DjangoCheckWarning, register
from django.db import models


# Fernet prefixes its tokens with "gAAAAA" (URL-safe base64 of version byte 0x80).
# Use this to distinguish ciphertext from plaintext during migration.
FERNET_TOKEN_PREFIX = "gAAAAA"


def _load_keys() -> list[bytes]:
    """Return all configured Fernet keys (newest first)."""
    raw = getattr(settings, "FIELD_ENCRYPTION_KEYS", None) or \
        getattr(settings, "FIELD_ENCRYPTION_KEY", None) or \
        os.environ.get("FIELD_ENCRYPTION_KEY", "") or \
        os.environ.get("FIELD_ENCRYPTION_KEYS", "")
    if not raw:
        return []
    if isinstance(raw, (list, tuple)):
        keys = list(raw)
    else:
        keys = [k.strip() for k in str(raw).split(",") if k.strip()]
    return [k.encode() if isinstance(k, str) else k for k in keys]


def _get_multifernet():
    """Build a MultiFernet from configured keys. Returns None if no keys set."""
    keys = _load_keys()
    if not keys:
        return None
    from cryptography.fernet import Fernet, MultiFernet
    return MultiFernet([Fernet(k) for k in keys])


def encrypt_text(plain: str) -> str:
    if not plain:
        return ""
    mf = _get_multifernet()
    if mf is None:
        # Plaintext fallback (dev mode). System check warns at startup.
        return plain
    return mf.encrypt(plain.encode()).decode()


def decrypt_text(stored: str) -> str:
    if not stored:
        return ""
    if not stored.startswith(FERNET_TOKEN_PREFIX):
        # Legacy plaintext or fallback mode -- return as-is.
        return stored
    mf = _get_multifernet()
    if mf is None:
        # Should never happen (we have a token but no key)
        return ""
    try:
        return mf.decrypt(stored.encode()).decode()
    except Exception:
        return ""


class EncryptedTextField(models.TextField):
    """TextField whose value is Fernet-encrypted at rest."""

    description = "Encrypted text (Fernet)"

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return decrypt_text(value)

    def to_python(self, value):
        if value is None or value == "":
            return value
        return decrypt_text(value)

    def get_prep_value(self, value):
        if value is None or value == "":
            return value
        # Avoid double-encrypting if value already looks like a Fernet token.
        if isinstance(value, str) and value.startswith(FERNET_TOKEN_PREFIX):
            return value
        return encrypt_text(value)


class EncryptedCharField(models.CharField):
    """CharField variant. Note: encrypted ciphertext is longer than the
    plaintext, so set max_length generously (>= 500 for typical API keys)."""

    description = "Encrypted char (Fernet)"

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        return decrypt_text(value)

    def to_python(self, value):
        if value is None or value == "":
            return value
        return decrypt_text(value)

    def get_prep_value(self, value):
        if value is None or value == "":
            return value
        if isinstance(value, str) and value.startswith(FERNET_TOKEN_PREFIX):
            return value
        return encrypt_text(value)


@register("security")
def _check_encryption_key_configured(app_configs, **kwargs):
    """Warn at startup if FIELD_ENCRYPTION_KEY isn't set."""
    if _load_keys():
        return []
    return [
        DjangoCheckWarning(
            "FIELD_ENCRYPTION_KEY is not set. EncryptedTextField/EncryptedCharField "
            "will store data as plaintext. Set FIELD_ENCRYPTION_KEY before "
            "deploying to any environment that holds real customer keys.",
            hint=(
                "Generate one with: "
                "python -c 'from cryptography.fernet import Fernet; "
                "print(Fernet.generate_key().decode())'"
            ),
            id="security.W101_fernet_key_missing",
        ),
    ]
