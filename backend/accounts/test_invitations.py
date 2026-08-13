"""Regression tests for BUG-005: POST /api/v1/auth/invitations/create/ returned 500.

The bug had two lives:
1. token='' on create + unique constraint -> IntegrityError on the 2nd invite ever.
2. After that fix: the real token is a JWT embedding the invitee's email, which
   exceeded the old varchar(255) token column for emails longer than ~27 chars
   -> Postgres StringDataRightTruncation -> 500. SQLite (used in tests) does not
   enforce max_length, so the endpoint tests alone could not catch life #2 —
   hence the explicit column-capacity test below.
"""
import pytest
from rest_framework.test import APIClient

from accounts.invitation_utils import generate_invitation_token
from accounts.models import CustomUser, TeamInvitation


@pytest.fixture
def admin_user(db):
    return CustomUser.objects.create_user(
        username="inviter",
        email="inviter@example.com",
        password="testpass123",
        first_name="Inge",
        last_name="Inviter",
        role="admin",
    )


@pytest.fixture
def auth_client(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


@pytest.mark.django_db
class TestCreateInvitation:
    URL = "/api/v1/auth/invitations/create/"

    def test_create_invitation_returns_201(self, auth_client):
        resp = auth_client.post(
            self.URL,
            {"email": "test+invite@example.com", "role": "contributor"},
            format="json",
        )
        assert resp.status_code == 201, resp.content
        assert TeamInvitation.objects.filter(email="test+invite@example.com").exists()

    def test_second_invitation_returns_201(self, auth_client):
        """Original BUG-005 root cause: unique token collision on 2nd invite."""
        for email in ("a+1@example.com", "a+2@example.com"):
            resp = auth_client.post(self.URL, {"email": email, "role": "contributor"}, format="json")
            assert resp.status_code == 201, resp.content

    def test_long_email_returns_201(self, auth_client):
        """BUG-005 second life: long email -> JWT token > 255 chars -> 500 on Postgres."""
        long_email = f"regression-sweep-bug005-{'x' * 40}@example-subdomain.example.com"
        resp = auth_client.post(self.URL, {"email": long_email, "role": "contributor"}, format="json")
        assert resp.status_code == 201, resp.content
        invitation = TeamInvitation.objects.get(email=long_email)
        assert len(invitation.token) > 255  # proves this test exercises the regression

    def test_token_column_fits_max_length_email(self, admin_user):
        """The token column must hold a JWT for the longest legal email (254 chars).

        SQLite ignores max_length, so an endpoint test can't catch a too-narrow
        column — assert directly against the field definition instead.
        """
        import uuid as uuid_mod

        max_email = "a" * 242 + "@example.com"  # 254 chars, RFC max
        token = generate_invitation_token(uuid_mod.uuid4(), max_email)
        field = TeamInvitation._meta.get_field("token")
        max_length = getattr(field, "max_length", None)
        assert max_length is None or len(token) <= max_length, (
            f"JWT for a max-length email is {len(token)} chars but the token "
            f"column only holds {max_length} — Postgres will 500 on create"
        )

    def test_unauthenticated_returns_401(self):
        resp = APIClient().post(self.URL, {"email": "x@example.com"}, format="json")
        assert resp.status_code == 401
