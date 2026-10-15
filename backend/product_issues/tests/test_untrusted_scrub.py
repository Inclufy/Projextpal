"""Legt het BEREIK van de sanitizer vast, niet de schrijfwijze.

De aanleiding, 15 oktober 2026: SonarQube markeerde `_UNTRUSTED_CTRL_RE` zelf als
kwetsbaarheid (text:S6389) omdat de definitie van het bereik de bidi-tekens letterlijk
bevatte. De makkelijkste manier om die melding kwijt te raken is die tekens weghalen -- en
dan sloop je precies de bescherming tegen prompt-injectie die het commentaar beschrijft.
Een kleine, plausibele diff die geen enkele vangrail zou tegenhouden.

Deze test staat daarom op wat er GEVANGEN moet worden. Herschrijf de regex gerust;
verklein hem niet.
"""
import pytest

from product_issues.serializers import _UNTRUSTED_CTRL_RE, _scrub_untrusted


BIDI = {
    "LRE": 0x202A, "RLE": 0x202B, "PDF": 0x202C, "LRO": 0x202D, "RLO": 0x202E,
    "LRI": 0x2066, "RLI": 0x2067, "FSI": 0x2068, "PDI": 0x2069,
}


@pytest.mark.parametrize("naam,codepoint", sorted(BIDI.items()))
def test_bidi_overrides_worden_gevangen(naam, codepoint):
    """Dit zijn de tekens waar Trojan Source en prompt-injectie op draaien."""
    assert _UNTRUSTED_CTRL_RE.search(chr(codepoint)), f"{naam} ontsnapt"


@pytest.mark.parametrize("codepoint", [0x00, 0x08, 0x0B, 0x0C, 0x0E, 0x1F, 0x7F])
def test_ascii_stuurtekens_worden_gevangen(codepoint):
    assert _UNTRUSTED_CTRL_RE.search(chr(codepoint))


@pytest.mark.parametrize("teken", ["a", "Z", "9", " ", "\t", "\n", "\r", "é", "—", "→"])
def test_gewone_tekst_blijft_ongemoeid(teken):
    """Een filter dat alles vangt is net zo stuk als een filter dat niets vangt.

    \\t \\n en \\r staan er bewust bij: het commentaar in serializers.py zegt expliciet
    dat die behouden blijven.
    """
    assert not _UNTRUSTED_CTRL_RE.search(teken)


@pytest.mark.parametrize("codepoint", [0x2029, 0x202F, 0x2065, 0x206A])
def test_de_randen_van_de_bereiken_blijven_buiten(codepoint):
    """Net voor en net na elk bereik mag niets gevangen worden."""
    assert not _UNTRUSTED_CTRL_RE.search(chr(codepoint))


def test_scrub_haalt_een_verborgen_override_weg():
    verdacht = "rm -rf " + chr(0x202E) + "harmless"
    assert _scrub_untrusted(verdacht) == "rm -rf harmless"


def test_scrub_laat_schone_tekst_met_rust():
    assert _scrub_untrusted("gewone melding — met leestekens") == "gewone melding — met leestekens"
