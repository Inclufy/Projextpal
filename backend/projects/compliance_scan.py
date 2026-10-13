"""
Sprint 5 S5-01 — compliance keyword scan.

A deterministic (regex-based) scanner that reads a project's uploaded
``ProjectAIContext.extracted_text`` and surfaces compliance regimes
mentioned in the documents. The output is a sorted, de-duplicated list
of canonical regime slugs stored in ``Project.compliance_flags``.

Design:
  * Deterministic — no LLM call. Compliance detection must be stable
    across runs; false negatives are safer than LLM hallucination.
  * NL + EN keyword variants per regime so a Dutch tender and an English
    GDPR policy both match.
  * Word-boundary matching so "SOC 2" does not match "association" and
    "AVG" does not match a casual "average".
  * Canonical slug per regime — the frontend turns the slug into a chip
    label via the shared i18n table.
"""
from __future__ import annotations

import re
from typing import Iterable, List


# A regime maps to a canonical slug + a set of case-insensitive regex
# patterns. Patterns are compiled lazily and cached in _RULES below.
#
# IMPORTANT: when adding a new regime, pick a slug that is stable across
# NL/EN/FR (the frontend uses the slug as a dict key).
_SPEC = [
    ("avg_gdpr", [
        r"\bAVG\b",
        r"\bGDPR\b",
        r"\bAlgemene\s+Verordening\s+Gegevensbescherming\b",
        r"\bGeneral\s+Data\s+Protection\s+Regulation\b",
    ]),
    ("iso_27001", [
        r"\bISO[\s\-]?27001\b",
        r"\bNEN[\s\-]?7510\b",
    ]),
    ("iso_9001", [
        r"\bISO[\s\-]?9001\b",
    ]),
    ("wkkgz", [
        r"\bWkkgz\b",
        r"\bwet\s+kwaliteit[,\s]+klachten\s+en\s+geschillen",
    ]),
    ("jeugdwet", [
        r"\bJeugdwet\b",
    ]),
    ("wmo", [
        r"\bWmo\b",
        r"\bWet\s+maatschappelijke\s+ondersteuning\b",
    ]),
    ("aanbestedingswet", [
        r"\bAanbestedingswet\b",
    ]),
    ("besluit_informatiebeveiliging", [
        r"\bBesluit\s+informatiebeveiliging\b",
        r"\bBIO\b",            # Baseline Informatiebeveiliging Overheid
    ]),
    ("nis2", [
        r"\bNIS\s?2\b",
        r"\bNIS2[\-\s]?directive\b",
        r"\bNetwork\s+and\s+Information\s+Systems\s+2\b",
    ]),
    ("dora", [
        r"\bDORA\b",
        r"\bDigital\s+Operational\s+Resilience\s+Act\b",
    ]),
    ("soc2", [
        r"\bSOC\s?2\b",
    ]),
    ("pci_dss", [
        r"\bPCI[\-\s]?DSS\b",
    ]),
]

# One compiled list per regime, built once at import time.
_RULES: list[tuple[str, list[re.Pattern]]] = [
    (slug, [re.compile(p, re.IGNORECASE) for p in patterns])
    for slug, patterns in _SPEC
]


def scan_text(text: str) -> List[str]:
    """Return the sorted list of regime slugs that appear in ``text``.

    An empty string / None yields an empty list.
    """
    if not text:
        return []
    found: set[str] = set()
    for slug, patterns in _RULES:
        for pat in patterns:
            if pat.search(text):
                found.add(slug)
                break
    return sorted(found)


def all_known_slugs() -> Iterable[str]:
    """Expose the full regime vocabulary — useful for tests + the UI."""
    return [slug for slug, _ in _SPEC]


def chip_label(slug: str, language: str = "nl") -> str:
    """Return a short display label for a compliance slug.

    The frontend ships its own i18n map and is free to override, but
    this function makes the slug self-describing for logs / audit."""
    labels = {
        "avg_gdpr": {"nl": "AVG/GDPR", "en": "GDPR", "fr": "RGPD"},
        "iso_27001": {"nl": "ISO 27001", "en": "ISO 27001", "fr": "ISO 27001"},
        "iso_9001": {"nl": "ISO 9001", "en": "ISO 9001", "fr": "ISO 9001"},
        "wkkgz": {"nl": "Wkkgz", "en": "Wkkgz (NL healthcare)", "fr": "Wkkgz"},
        "jeugdwet": {"nl": "Jeugdwet", "en": "Youth Care Act (NL)", "fr": "Loi jeunesse (NL)"},
        "wmo": {"nl": "Wmo", "en": "Social Support Act (NL)", "fr": "Loi soutien social (NL)"},
        "aanbestedingswet": {"nl": "Aanbestedingswet", "en": "NL Procurement Act", "fr": "Loi marchés publics (NL)"},
        "besluit_informatiebeveiliging": {
            "nl": "Besluit informatiebeveiliging",
            "en": "NL Govt Information Security Decree",
            "fr": "Décret sécurité de l'information (NL)",
        },
        "nis2": {"nl": "NIS2", "en": "NIS2", "fr": "NIS2"},
        "dora": {"nl": "DORA", "en": "DORA", "fr": "DORA"},
        "soc2": {"nl": "SOC 2", "en": "SOC 2", "fr": "SOC 2"},
        "pci_dss": {"nl": "PCI-DSS", "en": "PCI-DSS", "fr": "PCI-DSS"},
    }
    rec = labels.get(slug, {})
    return rec.get((language or "nl").lower(), rec.get("en", slug))
