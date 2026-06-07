"""Extract structured meeting minutes (agenda / discussion / conclusions /
action items) from raw notes — pasted text or an uploaded .docx/.txt document.

Uses Claude when ANTHROPIC_API_KEY is set; otherwise a deterministic heuristic
parser so the feature works fully offline / in tests. Returns a dict:
    {agenda: [str], discussion: str, conclusions: str,
     actions: [{subject, pic, due}]}
"""
from __future__ import annotations

import json
import os
import re
import zipfile


def extract_text_from_upload(f) -> str:
    """Best-effort plain-text extraction from an uploaded file (.docx or text)."""
    name = (getattr(f, "name", "") or "").lower()
    raw = f.read()
    if name.endswith(".docx"):
        try:
            import io
            z = zipfile.ZipFile(io.BytesIO(raw))
            xml = z.read("word/document.xml").decode("utf-8", "ignore")
            # paragraph breaks → newlines, then strip tags
            xml = re.sub(r"</w:p>", "\n", xml)
            txt = re.sub(r"<[^>]+>", "", xml)
            return re.sub(r"[ \t]+", " ", txt).strip()
        except Exception:
            pass
    try:
        return raw.decode("utf-8", "ignore")
    except Exception:
        return ""


_ISO = re.compile(r"\b(\d{4}-\d{2}-\d{2})\b")


def _heuristic(text: str) -> dict:
    agenda, actions, discussion, conclusions = [], [], [], []
    section = None
    for line in text.splitlines():
        s = line.strip()
        if not s:
            continue
        low = s.lower()
        if low.startswith(("agenda", "agenda points", "agendapunten")):
            section = "agenda"; continue
        if low.startswith(("action", "actions", "agreed", "to do", "todo", "acties", "actiepunten")):
            section = "actions"; continue
        if low.startswith(("conclusion", "conclusions", "summary", "conclusie")):
            section = "conclusions"; continue
        if low.startswith(("discussion", "notes", "discussie")):
            section = "discussion"; continue
        # An action line (explicit marker, @owner, or "- ... due ...")
        if re.search(r"\b(action|todo|@)\b", low) or section == "actions":
            due = _ISO.search(s)
            pic = ""
            m = re.search(r"@([\w .'-]+)", s)
            if m:
                pic = m.group(1).strip()
            subject = re.sub(r"@[\w .'-]+", "", re.sub(r"^[\-\*\d.\)\s]+", "", s)).strip(" -–:")
            subject = _ISO.sub("", subject).strip(" -–:")
            if subject:
                actions.append({"subject": subject[:255], "pic": pic[:120], "due": due.group(1) if due else None})
            continue
        if section == "agenda":
            agenda.append(re.sub(r"^[\-\*\d.\)\s]+", "", s))
        elif section == "conclusions":
            conclusions.append(s)
        else:
            discussion.append(s)
    return {
        "agenda": agenda,
        "discussion": "\n".join(discussion).strip(),
        "conclusions": "\n".join(conclusions).strip(),
        "actions": actions,
    }


def ai_extract_minutes(text: str) -> dict:
    """Structured extraction; Claude if available, else heuristic."""
    text = (text or "").strip()
    if not text:
        return {"agenda": [], "discussion": "", "conclusions": "", "actions": []}

    key = os.getenv("ANTHROPIC_API_KEY")
    if key:
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=key)
            prompt = (
                "Extract meeting minutes from the notes below. Return ONLY valid JSON "
                "with keys: agenda (array of strings), discussion (string), "
                "conclusions (string), actions (array of {subject, pic, due}). "
                "pic = person in charge (name/email if present, else \"\"). "
                "due = ISO date YYYY-MM-DD if a date is given, else null.\n\nNOTES:\n"
                + text[:8000]
            )
            msg = client.messages.create(
                model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-latest"),
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}],
            )
            body = "".join(getattr(b, "text", "") for b in msg.content)
            body = body[body.find("{"): body.rfind("}") + 1]
            data = json.loads(body)
            return {
                "agenda": [str(a) for a in (data.get("agenda") or [])][:25],
                "discussion": str(data.get("discussion") or "")[:5000],
                "conclusions": str(data.get("conclusions") or "")[:5000],
                "actions": [
                    {"subject": str(a.get("subject", ""))[:255],
                     "pic": str(a.get("pic", "") or "")[:120],
                     "due": (a.get("due") or None)}
                    for a in (data.get("actions") or []) if a.get("subject")
                ][:50],
            }
        except Exception:
            pass  # fall through to heuristic
    return _heuristic(text)
