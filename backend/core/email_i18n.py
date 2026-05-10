"""
Email i18n strings for ProjeXtPal transactional emails.

Lightweight dict-based translations. Default = 'en'. Caller passes desired
language code; falls back to 'en' for unknown keys/languages.

Usage:
    from core.email_i18n import get_email_context
    ctx = get_email_context('verify_email', lang='nl', name='Sami', url=link)
"""
from __future__ import annotations

SUPPORTED_LANGS = ("en", "nl", "ar", "fr")
RTL_LANGS = ("ar",)

# Shared chrome (logo wordmark, footer) — rendered into base.html
_SHARED = {
    "en": {
        "footer_tagline": "ProjeXtPal — modern project management for ambitious teams.",
        "footer_automated": "This is an automated message from ProjeXtPal. Please do not reply directly to this email.",
        "expires_in_hours": "This link expires in {hours} hours.",
        "expires_in_hour": "This link expires in {minutes} minutes.",
        "fallback_intro": "If the button doesn't work, copy this link into your browser:",
    },
    "nl": {
        "footer_tagline": "ProjeXtPal — modern projectmanagement voor ambitieuze teams.",
        "footer_automated": "Dit is een automatisch bericht van ProjeXtPal. Niet rechtstreeks op deze e-mail reageren.",
        "expires_in_hours": "Deze link verloopt over {hours} uur.",
        "expires_in_hour": "Deze link verloopt over {minutes} minuten.",
        "fallback_intro": "Werkt de knop niet? Kopieer deze link naar je browser:",
    },
    "ar": {
        "footer_tagline": "بروجكستبال — إدارة مشاريع حديثة للفرق الطموحة.",
        "footer_automated": "هذه رسالة آلية من بروجكستبال. يرجى عدم الرد مباشرة على هذا البريد الإلكتروني.",
        "expires_in_hours": "تنتهي صلاحية هذا الرابط خلال {hours} ساعة.",
        "expires_in_hour": "تنتهي صلاحية هذا الرابط خلال {minutes} دقيقة.",
        "fallback_intro": "إذا لم يعمل الزر، انسخ هذا الرابط إلى متصفحك:",
    },
    "fr": {
        "footer_tagline": "ProjeXtPal — gestion de projet moderne pour des équipes ambitieuses.",
        "footer_automated": "Ceci est un message automatique de ProjeXtPal. Merci de ne pas répondre directement à cet e-mail.",
        "expires_in_hours": "Ce lien expire dans {hours} heures.",
        "expires_in_hour": "Ce lien expire dans {minutes} minutes.",
        "fallback_intro": "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
    },
}

# Per email-flow strings
_TEMPLATES = {
    "verify_email": {
        "en": {
            "subject": "Verify your ProjeXtPal account",
            "preheader": "Confirm your email to activate your ProjeXtPal account.",
            "title": "Welcome to ProjeXtPal",
            "greeting": "Hi {name},",
            "body": "Thanks for signing up. Please verify your email address to activate your account and start managing projects.",
            "cta": "Verify email",
            "info": "If you didn't create a ProjeXtPal account, you can safely ignore this email.",
        },
        "nl": {
            "subject": "Verifieer je ProjeXtPal-account",
            "preheader": "Bevestig je e-mailadres om je ProjeXtPal-account te activeren.",
            "title": "Welkom bij ProjeXtPal",
            "greeting": "Hoi {name},",
            "body": "Bedankt voor je aanmelding. Verifieer je e-mailadres om je account te activeren en te starten met je projecten.",
            "cta": "E-mail verifiëren",
            "info": "Heb je geen ProjeXtPal-account aangemaakt? Dan kun je deze e-mail negeren.",
        },
        "ar": {
            "subject": "تحقق من حساب بروجكستبال الخاص بك",
            "preheader": "أكد بريدك الإلكتروني لتفعيل حساب بروجكستبال.",
            "title": "مرحبًا بك في بروجكستبال",
            "greeting": "مرحبًا {name}،",
            "body": "شكرًا لتسجيلك. يرجى التحقق من عنوان بريدك الإلكتروني لتفعيل حسابك والبدء في إدارة مشاريعك.",
            "cta": "تحقق من البريد الإلكتروني",
            "info": "إذا لم تقم بإنشاء حساب في بروجكستبال، يمكنك تجاهل هذه الرسالة بأمان.",
        },
        "fr": {
            "subject": "Vérifiez votre compte ProjeXtPal",
            "preheader": "Confirmez votre e-mail pour activer votre compte ProjeXtPal.",
            "title": "Bienvenue sur ProjeXtPal",
            "greeting": "Bonjour {name},",
            "body": "Merci pour votre inscription. Veuillez vérifier votre adresse e-mail pour activer votre compte et commencer à gérer vos projets.",
            "cta": "Vérifier l'e-mail",
            "info": "Si vous n'avez pas créé de compte ProjeXtPal, vous pouvez ignorer cet e-mail.",
        },
    },
    "password_reset": {
        "en": {
            "subject": "Reset your ProjeXtPal password",
            "preheader": "Use the link below to set a new password.",
            "title": "Reset your password",
            "greeting": "Hi {name},",
            "body": "We received a request to reset the password for your ProjeXtPal account. Click the button below to choose a new password.",
            "cta": "Reset password",
            "info": "If you didn't request a password reset, you can ignore this email — your password won't change.",
        },
        "nl": {
            "subject": "Wachtwoord opnieuw instellen — ProjeXtPal",
            "preheader": "Gebruik de onderstaande link om een nieuw wachtwoord in te stellen.",
            "title": "Wachtwoord opnieuw instellen",
            "greeting": "Hoi {name},",
            "body": "We hebben een verzoek ontvangen om het wachtwoord van je ProjeXtPal-account te resetten. Klik op de knop hieronder om een nieuw wachtwoord te kiezen.",
            "cta": "Wachtwoord resetten",
            "info": "Heb je geen wachtwoordreset aangevraagd? Dan kun je deze e-mail negeren — je wachtwoord verandert niet.",
        },
        "ar": {
            "subject": "إعادة تعيين كلمة مرور بروجكستبال",
            "preheader": "استخدم الرابط أدناه لتعيين كلمة مرور جديدة.",
            "title": "إعادة تعيين كلمة المرور",
            "greeting": "مرحبًا {name}،",
            "body": "تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك في بروجكستبال. انقر على الزر أدناه لاختيار كلمة مرور جديدة.",
            "cta": "إعادة تعيين كلمة المرور",
            "info": "إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة — لن تتغير كلمة المرور الخاصة بك.",
        },
        "fr": {
            "subject": "Réinitialisez votre mot de passe ProjeXtPal",
            "preheader": "Utilisez le lien ci-dessous pour définir un nouveau mot de passe.",
            "title": "Réinitialisez votre mot de passe",
            "greeting": "Bonjour {name},",
            "body": "Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte ProjeXtPal. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.",
            "cta": "Réinitialiser le mot de passe",
            "info": "Si vous n'avez pas demandé de réinitialisation, vous pouvez ignorer cet e-mail — votre mot de passe ne sera pas modifié.",
        },
    },
    "admin_invite": {
        "en": {
            "subject": "You're invited to ProjeXtPal",
            "preheader": "Set up your account and join your team on ProjeXtPal.",
            "title": "You're invited to ProjeXtPal",
            "greeting": "Hi {name},",
            "body": "You've been invited to join ProjeXtPal — modern project management for ambitious teams. Click the button below to verify your email and set up your account.",
            "cta": "Accept invitation",
            "info": "Already accepted this invitation? You can safely ignore this email.",
        },
        "nl": {
            "subject": "Je bent uitgenodigd voor ProjeXtPal",
            "preheader": "Stel je account in en sluit je aan bij je team op ProjeXtPal.",
            "title": "Je bent uitgenodigd voor ProjeXtPal",
            "greeting": "Hoi {name},",
            "body": "Je bent uitgenodigd voor ProjeXtPal — modern projectmanagement voor ambitieuze teams. Klik op de knop hieronder om je e-mail te verifiëren en je account in te stellen.",
            "cta": "Uitnodiging accepteren",
            "info": "Heb je deze uitnodiging al geaccepteerd? Dan kun je deze e-mail negeren.",
        },
        "ar": {
            "subject": "أنت مدعو إلى بروجكستبال",
            "preheader": "أنشئ حسابك وانضم إلى فريقك على بروجكستبال.",
            "title": "أنت مدعو إلى بروجكستبال",
            "greeting": "مرحبًا {name}،",
            "body": "تمت دعوتك للانضمام إلى بروجكستبال — إدارة مشاريع حديثة للفرق الطموحة. انقر على الزر أدناه للتحقق من بريدك الإلكتروني وإعداد حسابك.",
            "cta": "قبول الدعوة",
            "info": "هل قبلت هذه الدعوة بالفعل؟ يمكنك تجاهل هذه الرسالة بأمان.",
        },
        "fr": {
            "subject": "Vous êtes invité sur ProjeXtPal",
            "preheader": "Configurez votre compte et rejoignez votre équipe sur ProjeXtPal.",
            "title": "Vous êtes invité sur ProjeXtPal",
            "greeting": "Bonjour {name},",
            "body": "Vous avez été invité à rejoindre ProjeXtPal — gestion de projet moderne pour des équipes ambitieuses. Cliquez sur le bouton ci-dessous pour vérifier votre e-mail et configurer votre compte.",
            "cta": "Accepter l'invitation",
            "info": "Vous avez déjà accepté cette invitation ? Vous pouvez ignorer cet e-mail.",
        },
    },
    # ---- Notification engine (4 events) ----
    # All 4 share the same template; the per-kind strings drive the subject + CTA label.
    "notification_task_assigned": {
        "en": {"subject": "New task assigned to you", "cta": "Open task", "info": "You can manage your notification preferences in account settings."},
        "nl": {"subject": "Nieuwe taak aan jou toegewezen", "cta": "Open taak", "info": "Je kunt je notificatievoorkeuren beheren in je accountinstellingen."},
        "ar": {"subject": "تم تعيين مهمة جديدة لك", "cta": "افتح المهمة", "info": "يمكنك إدارة تفضيلات الإشعارات في إعدادات الحساب."},
        "fr": {"subject": "Nouvelle tâche qui vous est assignée", "cta": "Ouvrir la tâche", "info": "Vous pouvez gérer vos préférences de notification dans les paramètres du compte."},
    },
    "notification_comment_mention": {
        "en": {"subject": "You were mentioned in a comment", "cta": "View comment", "info": "You can manage your notification preferences in account settings."},
        "nl": {"subject": "Je bent genoemd in een opmerking", "cta": "Bekijk opmerking", "info": "Je kunt je notificatievoorkeuren beheren in je accountinstellingen."},
        "ar": {"subject": "تم ذكرك في تعليق", "cta": "عرض التعليق", "info": "يمكنك إدارة تفضيلات الإشعارات في إعدادات الحساب."},
        "fr": {"subject": "Vous avez été mentionné dans un commentaire", "cta": "Voir le commentaire", "info": "Vous pouvez gérer vos préférences de notification dans les paramètres du compte."},
    },
    "notification_project_member_added": {
        "en": {"subject": "You've been added to a project", "cta": "Open project", "info": "You can manage your notification preferences in account settings."},
        "nl": {"subject": "Je bent toegevoegd aan een project", "cta": "Open project", "info": "Je kunt je notificatievoorkeuren beheren in je accountinstellingen."},
        "ar": {"subject": "تمت إضافتك إلى مشروع", "cta": "افتح المشروع", "info": "يمكنك إدارة تفضيلات الإشعارات في إعدادات الحساب."},
        "fr": {"subject": "Vous avez été ajouté à un projet", "cta": "Ouvrir le projet", "info": "Vous pouvez gérer vos préférences de notification dans les paramètres du compte."},
    },
    "notification_deadline_approaching": {
        "en": {"subject": "Deadline approaching", "cta": "Open task", "info": "You can manage your notification preferences in account settings."},
        "nl": {"subject": "Deadline nadert", "cta": "Open taak", "info": "Je kunt je notificatievoorkeuren beheren in je accountinstellingen."},
        "ar": {"subject": "اقتراب الموعد النهائي", "cta": "افتح المهمة", "info": "يمكنك إدارة تفضيلات الإشعارات في إعدادات الحساب."},
        "fr": {"subject": "Échéance approchant", "cta": "Ouvrir la tâche", "info": "Vous pouvez gérer vos préférences de notification dans les paramètres du compte."},
    },
    "invoice": {
        "en": {
            "subject": "Invoice {number} from ProjeXtPal",
            "preheader": "Your invoice details are inside.",
            "title": "Invoice {number}",
            "greeting": "Dear {name},",
            "body": "Thank you for your business. Please find your invoice details below. The full invoice is attached as a PDF.",
            "label_number": "Invoice number",
            "label_date": "Invoice date",
            "label_due": "Due date",
            "label_period": "Billing period",
            "label_status": "Status",
            "label_total": "Total amount",
            "view_pdf": "View invoice (PDF attached)",
            "payment_instructions": "Payment instructions",
            "payment_body": "Please make payment by {due_date} to avoid late fees.",
            "questions": "If you have any questions about this invoice, please contact support.",
        },
        "nl": {
            "subject": "Factuur {number} van ProjeXtPal",
            "preheader": "Je factuurgegevens staan in deze e-mail.",
            "title": "Factuur {number}",
            "greeting": "Beste {name},",
            "body": "Bedankt voor je vertrouwen. Hieronder vind je je factuurgegevens. De volledige factuur is bijgevoegd als PDF.",
            "label_number": "Factuurnummer",
            "label_date": "Factuurdatum",
            "label_due": "Vervaldatum",
            "label_period": "Factureerperiode",
            "label_status": "Status",
            "label_total": "Totaalbedrag",
            "view_pdf": "Factuur bekijken (PDF bijgevoegd)",
            "payment_instructions": "Betaalinstructies",
            "payment_body": "Betaal voor {due_date} om vertragingstoeslagen te vermijden.",
            "questions": "Vragen over deze factuur? Neem contact op met support.",
        },
        "ar": {
            "subject": "فاتورة {number} من بروجكستبال",
            "preheader": "تفاصيل فاتورتك في الداخل.",
            "title": "فاتورة {number}",
            "greeting": "عزيزي {name}،",
            "body": "شكرًا لتعاملك معنا. تجد تفاصيل فاتورتك أدناه. الفاتورة الكاملة مرفقة كملف PDF.",
            "label_number": "رقم الفاتورة",
            "label_date": "تاريخ الفاتورة",
            "label_due": "تاريخ الاستحقاق",
            "label_period": "فترة الفوترة",
            "label_status": "الحالة",
            "label_total": "المبلغ الإجمالي",
            "view_pdf": "عرض الفاتورة (PDF مرفق)",
            "payment_instructions": "تعليمات الدفع",
            "payment_body": "يرجى السداد قبل {due_date} لتجنب رسوم التأخير.",
            "questions": "هل لديك أسئلة حول هذه الفاتورة؟ تواصل مع الدعم.",
        },
        "fr": {
            "subject": "Facture {number} de ProjeXtPal",
            "preheader": "Les détails de votre facture sont à l'intérieur.",
            "title": "Facture {number}",
            "greeting": "Cher/Chère {name},",
            "body": "Merci pour votre confiance. Vous trouverez ci-dessous les détails de votre facture. La facture complète est jointe en PDF.",
            "label_number": "Numéro de facture",
            "label_date": "Date de facture",
            "label_due": "Date d'échéance",
            "label_period": "Période de facturation",
            "label_status": "Statut",
            "label_total": "Montant total",
            "view_pdf": "Voir la facture (PDF joint)",
            "payment_instructions": "Instructions de paiement",
            "payment_body": "Merci de payer avant le {due_date} pour éviter les frais de retard.",
            "questions": "Des questions sur cette facture ? Contactez le support.",
        },
    },
}


def _resolve_lang(lang: str | None) -> str:
    if not lang:
        return "en"
    code = lang.lower().split("-")[0].split("_")[0]
    return code if code in SUPPORTED_LANGS else "en"


def get_email_context(template_key: str, lang: str | None = None, **format_kwargs) -> dict:
    """Build the i18n context dict for a Django email template.

    Returns a dict with:
      - lang, direction, direction_align: for the <html> root + RTL handling
      - i18n: per-template strings + shared chrome strings
      - subject: rendered (formatted) subject for the SMTP send
      - any **format_kwargs are also passed through into i18n string formatting
    """
    resolved = _resolve_lang(lang)
    template = _TEMPLATES.get(template_key, {})
    strings = dict(template.get(resolved) or template.get("en") or {})
    shared = dict(_SHARED.get(resolved) or _SHARED["en"])

    # Format every string with provided kwargs (silent on KeyError so extras don't break)
    def _fmt(value: str) -> str:
        try:
            return value.format(**format_kwargs)
        except (KeyError, IndexError):
            return value

    rendered = {k: _fmt(v) for k, v in strings.items()}
    rendered_shared = {k: _fmt(v) for k, v in shared.items()}

    is_rtl = resolved in RTL_LANGS
    return {
        "lang": resolved,
        "direction": "rtl" if is_rtl else "ltr",
        "direction_align": "right" if is_rtl else "left",
        "subject": rendered.get("subject", ""),
        "i18n": {**rendered_shared, **rendered},
        # Pass-through format kwargs so templates can use {{ name }}, {{ url }} etc.
        **format_kwargs,
    }
