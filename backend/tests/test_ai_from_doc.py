"""Tests for projects.ai_from_doc.plan_from_documents.

Calls the view function directly via APIRequestFactory so the test doesn't
need the full URL conf (which pulls in bot.ai → langchain.agents, a heavy
optional dep that may be absent in this environment)."""
import pytest
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIRequestFactory, force_authenticate

from projects.ai_from_doc import plan_from_documents


URL = "/api/v1/projects/plan-from-documents/"


def _post(user, data=None):
    factory = APIRequestFactory()
    req = factory.post(URL, data or {}, format="multipart")
    if user is not None:
        force_authenticate(req, user=user)
    return plan_from_documents(req)


class TestPlanFromDocuments:
    def test_requires_auth(self):
        resp = _post(None)
        assert resp.status_code == 401

    def test_400_when_no_files(self, user):
        resp = _post(user, {})
        assert resp.status_code == 400
        detail = resp.data["detail"].lower()
        assert "field name" in detail or "bestand" in detail

    def test_too_many_files_rejected(self, user):
        files = [
            SimpleUploadedFile(f"f{i}.txt", b"content", content_type="text/plain")
            for i in range(11)
        ]
        resp = _post(user, {"files": files})
        assert resp.status_code == 400

    def test_scanned_pdf_no_text_returns_422(self, user):
        with patch("projects.ai_from_doc._extract_text_any", return_value=("", 0)):
            f = SimpleUploadedFile("scan.pdf", b"%PDF-1.4 fake", content_type="application/pdf")
            resp = _post(user, {"files": [f]})
        assert resp.status_code == 422
        d = resp.data["detail"].lower()
        assert "tekst" in d or "text" in d

    def test_fallback_when_no_llm_key(self, user):
        txt = b"Aanbestedingsdocument Jeugdhulp 2027\n\nDe gemeente zoekt een partner voor Wmo-ondersteuning in Heerenveen."
        f = SimpleUploadedFile("tender.txt", txt, content_type="text/plain")
        with (
            patch("projects.ai_from_doc.get_openai_client", return_value=None),
            patch("projects.ai_from_doc.get_anthropic_client", return_value=None),
        ):
            resp = _post(user, {"files": [f]})
        assert resp.status_code == 200
        body = resp.data
        assert body["source"] == "fallback"
        assert body["name"]
        assert body["extracted_pages"] >= 1
        preview = body["extracted_text_preview"].lower()
        assert "aanbestedingsdocument" in preview

    def test_llm_response_shape_is_normalised(self, user):
        bad_json = {
            "name": "X" * 500,
            "description": "Y" * 5000,
            "scope_in": "in",
            "scope_out": "out",
            "deliverables": ["a"] * 50,
            "suggested_milestones": [
                {"name": f"m{i}", "description": "", "due_offset_weeks": i}
                for i in range(20)
            ],
        }
        f = SimpleUploadedFile("x.txt", b"any text", content_type="text/plain")
        with patch("projects.ai_from_doc._call_llm", return_value=bad_json):
            resp = _post(user, {"files": [f]})
        assert resp.status_code == 200
        body = resp.data
        assert len(body["name"]) <= 80
        assert len(body["description"]) <= 1200
        assert len(body["deliverables"]) <= 10
        assert len(body["suggested_milestones"]) <= 6
        assert body["source"] == "ai"
