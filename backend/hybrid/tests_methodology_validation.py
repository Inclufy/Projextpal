"""Behavioural tests for Hybrid methodology validation (backlog #33, P1-11).

The methodology fields on Hybrid models were free-text CharFields with no
constraint, so a phase could be assigned a methodology that doesn't exist
(or a programme-level one like 'pmi'/'safe'/'msp' that has no project engine).
Validation now lives at the serializer (no migration). These tests prove:
  #1 a valid project-level methodology is accepted on a phase.
  #2 a programme-level methodology (pmi) is rejected.
  #3 an unknown methodology is rejected.
  #4 the configuration secondary list is validated element-wise.

Runs on the in-memory SQLite test DB — no Docker needed.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import Company
from projects.models import Project
from hybrid.models import PhaseMethodology
from hybrid.constants import HYBRID_METHODOLOGIES


class HybridMethodologyValidationTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.company = Company.objects.create(name="HybridCo")
        self.user = User.objects.create_user(
            email="hy@example.com", password="testpass123",
            username="hy", company=self.company, role="admin",
        )
        self.project = Project.objects.create(
            name="Hybrid Project", company=self.company,
            methodology="hybrid", created_by=self.user,
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def _phase_url(self):
        return f"/api/v1/hybrid/projects/{self.project.id}/phase-methodologies/"

    def _config_url(self):
        return f"/api/v1/hybrid/projects/{self.project.id}/configs/"

    # ---- #1 valid methodology accepted ----------------------------------
    def test_valid_phase_methodology_accepted(self):
        resp = self.client.post(self._phase_url(), {"phase": "Discovery", "methodology": "scrum"}, format="json")
        self.assertEqual(resp.status_code, 201, resp.content)
        self.assertTrue(PhaseMethodology.objects.filter(project=self.project, methodology="scrum").exists())

    # ---- #2 programme-level methodology rejected ------------------------
    def test_programme_level_methodology_rejected(self):
        resp = self.client.post(self._phase_url(), {"phase": "Delivery", "methodology": "pmi"}, format="json")
        self.assertEqual(resp.status_code, 400, resp.content)
        self.assertIn("methodology", resp.json())
        self.assertFalse(PhaseMethodology.objects.filter(project=self.project, methodology="pmi").exists())

    # ---- #3 unknown methodology rejected --------------------------------
    def test_unknown_methodology_rejected(self):
        resp = self.client.post(self._phase_url(), {"phase": "Delivery", "methodology": "foobar"}, format="json")
        self.assertEqual(resp.status_code, 400, resp.content)
        self.assertFalse(PhaseMethodology.objects.filter(project=self.project, methodology="foobar").exists())

    # ---- #4 configuration secondary list validated element-wise ---------
    def test_config_secondary_methodologies_validated(self):
        resp = self.client.post(
            self._config_url(),
            {"primary_methodology": "prince2", "secondary_methodologies": ["scrum", "msp"]},
            format="json",
        )
        self.assertEqual(resp.status_code, 400, resp.content)
        self.assertIn("secondary_methodologies", resp.json())

    # ---- canonical list is exactly the 7 project methodologies ----------
    def test_canonical_list_shape(self):
        self.assertEqual(len(HYBRID_METHODOLOGIES), 7)
        self.assertNotIn("hybrid", HYBRID_METHODOLOGIES)
        self.assertNotIn("program", HYBRID_METHODOLOGIES)
