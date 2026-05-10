"""
Render every transactional email template × every supported language to disk
so you can visually QA the new ProjeXtPal branded emails.

Run inside the backend container:

    docker exec -it projextpal-backend-prod python3 manage.py shell \
        -c "exec(open('scripts/render_email_previews.py').read())"

Outputs go to /tmp/email_previews/ inside the container. Pull them out with:

    docker cp projextpal-backend-prod:/tmp/email_previews ./email_previews
    open ./email_previews/index.html

The index.html aggregates all variants in one scrollable preview.
"""
from pathlib import Path

from django.template.loader import render_to_string

from core.email_i18n import SUPPORTED_LANGS, get_email_context

OUT_DIR = Path("/tmp/email_previews")
OUT_DIR.mkdir(parents=True, exist_ok=True)

# (template_key, html_path, sample kwargs)
SCENARIOS = [
    (
        "verify_email",
        "email/transactional/verify_email.html",
        {"name": "Sami", "url": "https://projextpal.com/verify-email/abc123/", "expires_in_hours": 24},
    ),
    (
        "password_reset",
        "email/transactional/password_reset.html",
        {"name": "Sami", "url": "https://projextpal.com/reset-password/xyz789/", "expires_in_hours": 1},
    ),
    (
        "admin_invite",
        "email/transactional/admin_invite.html",
        {"name": "Sami", "url": "https://projextpal.com/verify-email/inv456/", "expires_in_hours": 24},
    ),
]

generated = []

for template_key, template_path, sample in SCENARIOS:
    for lang in SUPPORTED_LANGS:
        ctx = get_email_context(template_key, lang=lang, **sample)
        ctx["url"] = sample["url"]
        # build expires text inline (mirrors core.email_send._build_expires_text)
        hours = sample.get("expires_in_hours", 0)
        if hours:
            ctx["expires_text"] = ctx["i18n"].get("expires_in_hours", "").format(hours=hours)
        else:
            ctx["expires_text"] = ""

        html = render_to_string(template_path, ctx)
        filename = f"{template_key}__{lang}.html"
        (OUT_DIR / filename).write_text(html, encoding="utf-8")
        generated.append((template_key, lang, filename, ctx["subject"]))
        print(f"  rendered  {filename:40s}  subject={ctx['subject']!r}")

# Build an index that iframes every variant for fast visual sweep
index_rows = []
for template_key, lang, filename, subject in generated:
    index_rows.append(
        f"""
        <div style="margin:24px 0;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
          <div style="padding:10px 14px;background:#f8f5ff;font-family:system-ui;
                      font-size:14px;color:#1a0f2e;border-bottom:1px solid #ddd;">
            <strong>{template_key}</strong> · <code>{lang}</code> · {subject}
          </div>
          <iframe src="{filename}" style="width:100%;height:720px;border:0;display:block;"></iframe>
        </div>
        """
    )

index_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ProjeXtPal email previews</title>
  <style>
    body {{ font-family: system-ui, sans-serif; max-width: 720px; margin: 24px auto; padding: 0 16px; color: #1a0f2e; }}
    h1 {{ color: #7c3aed; }}
  </style>
</head>
<body>
  <h1>ProjeXtPal email previews</h1>
  <p>Generated {len(generated)} variants — verify branding, layout, RTL (ar) and translations.</p>
  {''.join(index_rows)}
</body>
</html>
"""
(OUT_DIR / "index.html").write_text(index_html, encoding="utf-8")

print(f"\nDone. Open: {OUT_DIR}/index.html")
print(f"Pull from container: docker cp projextpal-backend-prod:/tmp/email_previews ./email_previews")
