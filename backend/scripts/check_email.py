"""
Email-config diagnostic + live SMTP test for ProjeXtPal production.

Usage (on the prod server):
    docker compose -f docker-compose.production.yml exec backend \
        python manage.py shell < scripts/check_email.py

Or for a real send:
    docker compose -f docker-compose.production.yml exec backend \
        python -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE','core.settings'); \
                   import django; django.setup(); \
                   exec(open('scripts/check_email.py').read())" \
        --to you@example.com
"""
import os
import sys

import django
from django.conf import settings
from django.core.mail import send_mail

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
try:
    django.setup()
except Exception:
    pass

REQUIRED = [
    "EMAIL_BACKEND",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USE_TLS",
    "EMAIL_HOST_USER",
    "EMAIL_HOST_PASSWORD",
    "DEFAULT_FROM_EMAIL",
    "FRONTEND_URL",
]

print("=" * 60)
print("ProjeXtPal email-config check")
print("=" * 60)

missing = []
for key in REQUIRED:
    value = getattr(settings, key, None)
    masked = "<unset>"
    if value not in (None, ""):
        if "PASSWORD" in key:
            masked = "***" + str(value)[-2:] if len(str(value)) > 2 else "***"
        else:
            masked = repr(value)
    else:
        missing.append(key)
    print(f"  {key:24s} = {masked}")

console_backend = "console" in (settings.EMAIL_BACKEND or "")
print()
if console_backend:
    print("[!] EMAIL_BACKEND is the console backend — emails are printed, not sent.")
if missing:
    print(f"[!] Missing / empty: {', '.join(missing)}")
if not console_backend and not missing:
    print("[OK] All required vars present and SMTP backend configured.")

# Optional live send: --to <addr>
to_addr = None
if "--to" in sys.argv:
    idx = sys.argv.index("--to")
    if idx + 1 < len(sys.argv):
        to_addr = sys.argv[idx + 1]

if to_addr:
    print()
    print(f"Sending test email to {to_addr} ...")
    try:
        send_mail(
            subject="ProjeXtPal SMTP test",
            message="If you received this, SMTP works.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_addr],
            fail_silently=False,
        )
        print("[OK] send_mail returned without raising.")
    except Exception as exc:
        print(f"[FAIL] {type(exc).__name__}: {exc}")
        sys.exit(1)
