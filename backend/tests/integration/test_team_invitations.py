"""
Tests for Team Invitation Workflow
===================================

Covers: TeamInvitation model lifecycle, invitation creation,
        listing, acceptance, token expiry, role assignment,
        and duplicate-prevention logic.

Endpoints under /api/v1/auth/:
    GET  /invitations/              - ListInvitationsView
    POST /invitations/create/       - CreateInvitationView
    GET  /invitations/accept/<tok>/ - view invitation details
    POST /invitations/accept/<tok>/ - accept invitation
"""

import pytest
from datetime import timedelta
from unittest.mock import patch

from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status

from accounts.models import TeamInvitation
from accounts.invitation_utils import generate_invitation_token, verify_invitation_token

User = get_user_model()

# ------------------------------------------------------------------ helpers
BASE_URL = "/api/v1/auth"
CREATE_URL = f"{BASE_URL}/invitations/create/"
LIST_URL = f"{BASE_URL}/invitations/"


def _accept_url(token):
    return f"{BASE_URL}/invitations/accept/{token}/"


# ============================================================
# Model-level tests
# ============================================================

@pytest.mark.django_db
class TestTeamInvitationModel:
    """Direct model / property tests for TeamInvitation."""

    def test_default_status_is_pending(self, admin_user, waterfall_project):
        """Newly created invitations default to 'pending'."""
        invitation = TeamInvitation.objects.create(
            email="newuser@example.com",
            role="guest",
            invited_by=admin_user,
            project=waterfall_project,
            token="test-token-001",
        )
        assert invitation.status == "pending"

    def test_expires_at_auto_set_to_seven_days(self, admin_user, waterfall_project):
        """If expires_at is not provided, save() sets it ~7 days from now."""
        before = timezone.now()
        invitation = TeamInvitation.objects.create(
            email="auto@example.com",
            role="guest",
            invited_by=admin_user,
            project=waterfall_project,
            token="test-token-002",
        )
        after = timezone.now()

        expected_lower = before + timedelta(days=7)
        expected_upper = after + timedelta(days=7)

        assert expected_lower <= invitation.expires_at <= expected_upper

    def test_is_expired_property_false_for_fresh(self, admin_user, waterfall_project):
        """A freshly created invitation is NOT expired."""
        invitation = TeamInvitation.objects.create(
            email="fresh@example.com",
            role="guest",
            invited_by=admin_user,
            project=waterfall_project,
            token="test-token-003",
        )
        assert invitation.is_expired is False

    def test_is_expired_property_true_when_past(self, admin_user, waterfall_project):
        """An invitation whose expires_at is in the past IS expired."""
        invitation = TeamInvitation.objects.create(
            email="old@example.com",
            role="guest",
            invited_by=admin_user,
            project=waterfall_project,
            token="test-token-004",
            expires_at=timezone.now() - timedelta(hours=1),
        )
        assert invitation.is_expired is True

    def test_can_be_accepted_true_for_valid(self, admin_user, waterfall_project):
        """can_be_accepted is True when status=pending and not expired."""
        invitation = TeamInvitation.objects.create(
            email="valid@example.com",
            role="guest",
            invited_by=admin_user,
            project=waterfall_project,
            token="test-token-005",
        )
        assert invitation.can_be_accepted is True

    def test_can_be_accepted_false_when_already_accepted(
        self, admin_user, waterfall_project
    ):
        """Once accepted, can_be_accepted is False."""
        invitation = TeamInvitation.objects.create(
            email="done@example.com",
            role="guest",
            invited_by=admin_user,
            project=waterfall_project,
            token="test-token-006",
            status="accepted",
        )
        assert invitation.can_be_accepted is False

    def test_can_be_accepted_false_when_expired(self, admin_user, waterfall_project):
        """An expired invitation cannot be accepted."""
        invitation = TeamInvitation.objects.create(
            email="expired@example.com",
            role="guest",
            invited_by=admin_user,
            project=waterfall_project,
            token="test-token-007",
            expires_at=timezone.now() - timedelta(days=1),
        )
        assert invitation.can_be_accepted is False

    def test_str_representation(self, admin_user, waterfall_project):
        """__str__ contains the email and project/program."""
        invitation = TeamInvitation.objects.create(
            email="strtest@example.com",
            role="guest",
            invited_by=admin_user,
            project=waterfall_project,
            token="test-token-008",
        )
        text = str(invitation)
        assert "strtest@example.com" in text

    def test_ordering_by_created_at_desc(self, admin_user, waterfall_project):
        """Invitations are ordered most-recent-first."""
        inv1 = TeamInvitation.objects.create(
            email="first@example.com",
            role="guest",
            invited_by=admin_user,
            project=waterfall_project,
            token="order-token-1",
        )
        inv2 = TeamInvitation.objects.create(
            email="second@example.com",
            role="guest",
            invited_by=admin_user,
            project=waterfall_project,
            token="order-token-2",
        )
        qs = TeamInvitation.objects.all()
        assert list(qs) == [inv2, inv1]

    def test_invitation_with_program_no_project(self, admin_user):
        """An invitation can reference a program instead of a project."""
        try:
            from programs.models import Program
            program = Program.objects.create(
                name="Test Program for Invitations",
                company=admin_user.company,
                program_manager=admin_user,
                methodology="safe",
            )
            invitation = TeamInvitation.objects.create(
                email="prog@example.com",
                role="pm",
                invited_by=admin_user,
                program=program,
                token="test-token-program-001",
            )
            assert invitation.project is None
            assert invitation.program == program
        except ImportError:
            pytest.skip("programs.Program model not available")


# ============================================================
# Token utility tests
# ============================================================

@pytest.mark.django_db
class TestInvitationTokenUtils:
    """Tests for generate_invitation_token / verify_invitation_token."""

    def test_round_trip(self, admin_user, waterfall_project):
        """Generating a token then verifying it returns the original payload."""
        invitation = TeamInvitation.objects.create(
            email="roundtrip@example.com",
            invited_by=admin_user,
            project=waterfall_project,
            token="placeholder",
        )
        token = generate_invitation_token(invitation.id, invitation.email)
        payload = verify_invitation_token(token)

        assert payload is not None
        assert payload["email"] == "roundtrip@example.com"
        assert payload["invitation_id"] == str(invitation.id)

    def test_invalid_token_returns_none(self):
        """A garbage string returns None."""
        assert verify_invitation_token("not-a-valid-jwt-token") is None

    def test_expired_token_returns_none(self):
        """A token generated with a past expiry returns None."""
        import jwt
        from django.conf import settings

        payload = {
            "invitation_id": "some-uuid",
            "email": "expired@example.com",
            "exp": timezone.now() - timedelta(hours=1),
            "iat": timezone.now() - timedelta(days=8),
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
        assert verify_invitation_token(token) is None


# ============================================================
# API endpoint tests
# ============================================================

@pytest.mark.django_db
class TestCreateInvitationAPI:
    """POST /api/v1/auth/invitations/create/"""

    @patch("accounts.invitation_views.send_mail")
    def test_create_invitation_as_admin(
        self, mock_mail, authenticated_admin_client, waterfall_project
    ):
        """Admin can create an invitation and gets 201 back."""
        data = {
            "email": "invitee@example.com",
            "role": "guest",
            "project_id": waterfall_project.id,
            "message": "Welcome aboard!",
        }
        response = authenticated_admin_client.post(CREATE_URL, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["email"] == "invitee@example.com"
        assert "invitation_link" in response.data

        # Verify DB record
        invitation = TeamInvitation.objects.get(email="invitee@example.com")
        assert invitation.status == "pending"
        assert invitation.role == "guest"
        assert invitation.project == waterfall_project

    @patch("accounts.invitation_views.send_mail")
    def test_create_invitation_sends_email(
        self, mock_mail, authenticated_admin_client, waterfall_project
    ):
        """Creating an invitation triggers an email."""
        data = {
            "email": "emailcheck@example.com",
            "role": "guest",
            "project_id": waterfall_project.id,
        }
        authenticated_admin_client.post(CREATE_URL, data, format="json")
        mock_mail.assert_called_once()

    @patch("accounts.invitation_views.send_mail")
    def test_create_invitation_with_pm_role(
        self, mock_mail, authenticated_admin_client, waterfall_project
    ):
        """An invitation can specify the 'pm' role."""
        data = {
            "email": "pm@example.com",
            "role": "pm",
            "project_id": waterfall_project.id,
        }
        response = authenticated_admin_client.post(CREATE_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        invitation = TeamInvitation.objects.get(email="pm@example.com")
        assert invitation.role == "pm"

    @patch("accounts.invitation_views.send_mail")
    def test_create_invitation_with_admin_role(
        self, mock_mail, authenticated_admin_client, waterfall_project
    ):
        """An invitation can specify the 'admin' role."""
        data = {
            "email": "newadmin@example.com",
            "role": "admin",
            "project_id": waterfall_project.id,
        }
        response = authenticated_admin_client.post(CREATE_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        invitation = TeamInvitation.objects.get(email="newadmin@example.com")
        assert invitation.role == "admin"

    def test_create_invitation_missing_email_returns_400(
        self, authenticated_admin_client, waterfall_project
    ):
        """Omitting the email field returns 400."""
        data = {"role": "guest", "project_id": waterfall_project.id}
        response = authenticated_admin_client.post(CREATE_URL, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_invitation_unauthenticated(self, api_client, waterfall_project):
        """Unauthenticated users cannot create invitations."""
        data = {
            "email": "anon@example.com",
            "role": "guest",
            "project_id": waterfall_project.id,
        }
        response = api_client.post(CREATE_URL, data, format="json")
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

    @patch("accounts.invitation_views.send_mail")
    def test_create_invitation_default_role_is_guest(
        self, mock_mail, authenticated_admin_client, waterfall_project
    ):
        """When role is omitted the default is 'guest'."""
        data = {"email": "default@example.com", "project_id": waterfall_project.id}
        response = authenticated_admin_client.post(CREATE_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        invitation = TeamInvitation.objects.get(email="default@example.com")
        assert invitation.role == "guest"

    @patch("accounts.invitation_views.send_mail")
    def test_create_invitation_with_message(
        self, mock_mail, authenticated_admin_client, waterfall_project
    ):
        """Personal message is stored on the invitation."""
        msg = "Looking forward to collaborating!"
        data = {
            "email": "msg@example.com",
            "role": "guest",
            "project_id": waterfall_project.id,
            "message": msg,
        }
        response = authenticated_admin_client.post(CREATE_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

        invitation = TeamInvitation.objects.get(email="msg@example.com")
        assert invitation.message == msg


@pytest.mark.django_db
class TestListInvitationsAPI:
    """GET /api/v1/auth/invitations/"""

    @patch("accounts.invitation_views.send_mail")
    def test_list_sent_invitations(
        self, mock_mail, authenticated_admin_client, admin_user, waterfall_project
    ):
        """Listing returns invitations sent by the authenticated user."""
        # Create two invitations as admin
        for email in ["a@example.com", "b@example.com"]:
            authenticated_admin_client.post(
                CREATE_URL,
                {"email": email, "project_id": waterfall_project.id},
                format="json",
            )

        response = authenticated_admin_client.get(LIST_URL)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["sent"]) == 2

    @patch("accounts.invitation_views.send_mail")
    def test_list_received_invitations(
        self, mock_mail, authenticated_admin_client, authenticated_client, user, waterfall_project
    ):
        """A user who has been invited sees the invitation under 'received'."""
        # Admin invites the regular user
        authenticated_admin_client.post(
            CREATE_URL,
            {"email": user.email, "project_id": waterfall_project.id},
            format="json",
        )

        response = authenticated_client.get(LIST_URL)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["received"]) >= 1

    def test_list_invitations_unauthenticated(self, api_client):
        """Unauthenticated users cannot list invitations."""
        response = api_client.get(LIST_URL)
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

    @patch("accounts.invitation_views.send_mail")
    def test_list_invitations_empty_for_new_user(
        self, mock_mail, db, company
    ):
        """A user with no invitations gets empty lists."""
        new_user = User.objects.create_user(
            username="lonely",
            email="lonely@example.com",
            password="pass1234",
        )
        if hasattr(new_user, "company"):
            new_user.company = company
            new_user.save()

        client = __import__("rest_framework.test", fromlist=["APIClient"]).APIClient()
        client.force_authenticate(user=new_user)

        response = client.get(LIST_URL)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["sent"]) == 0
        assert len(response.data["received"]) == 0


@pytest.mark.django_db
class TestAcceptInvitationAPI:
    """GET / POST /api/v1/auth/invitations/accept/<token>/"""

    def _create_invitation_with_token(self, admin_user, waterfall_project, email="accept@example.com"):
        """Helper: create a pending invitation with a valid JWT token."""
        invitation = TeamInvitation.objects.create(
            email=email,
            role="guest",
            invited_by=admin_user,
            project=waterfall_project,
            token="placeholder",
        )
        token = generate_invitation_token(invitation.id, email)
        invitation.token = token
        invitation.save()
        return invitation, token

    def test_view_invitation_details_via_get(
        self, api_client, admin_user, waterfall_project
    ):
        """GET with a valid token returns invitation details."""
        invitation, token = self._create_invitation_with_token(
            admin_user, waterfall_project
        )
        response = api_client.get(_accept_url(token))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == "accept@example.com"
        assert response.data["role"] == "guest"

    def test_accept_invitation_via_post(
        self, authenticated_client, admin_user, waterfall_project
    ):
        """POST with a valid token marks the invitation as accepted."""
        invitation, token = self._create_invitation_with_token(
            admin_user, waterfall_project
        )
        response = authenticated_client.post(_accept_url(token))

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Invitation accepted successfully"

        invitation.refresh_from_db()
        assert invitation.status == "accepted"
        assert invitation.accepted_at is not None

    def test_accept_invitation_sets_accepted_by(
        self, authenticated_client, user, admin_user, waterfall_project
    ):
        """The user who POSTs is recorded as accepted_by."""
        invitation, token = self._create_invitation_with_token(
            admin_user, waterfall_project
        )
        authenticated_client.post(_accept_url(token))

        invitation.refresh_from_db()
        assert invitation.accepted_by == user

    def test_accept_expired_invitation_fails(
        self, authenticated_client, admin_user, waterfall_project
    ):
        """An expired invitation cannot be accepted."""
        invitation = TeamInvitation.objects.create(
            email="expired@example.com",
            role="guest",
            invited_by=admin_user,
            project=waterfall_project,
            token="placeholder-exp",
            expires_at=timezone.now() - timedelta(days=1),
        )
        token = generate_invitation_token(invitation.id, invitation.email)
        invitation.token = token
        invitation.save()

        response = authenticated_client.get(_accept_url(token))
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_accept_already_accepted_invitation_fails(
        self, authenticated_client, admin_user, waterfall_project
    ):
        """Cannot accept an invitation that was already accepted."""
        invitation, token = self._create_invitation_with_token(
            admin_user, waterfall_project, email="alreadydone@example.com"
        )
        invitation.status = "accepted"
        invitation.save()

        response = authenticated_client.post(_accept_url(token))
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_token_returns_400(self, api_client):
        """A fabricated/corrupt token returns 400."""
        response = api_client.get(_accept_url("garbage-token"))
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_accept_invitation_redirect_contains_project_id(
        self, authenticated_client, admin_user, waterfall_project
    ):
        """The response after acceptance includes a redirect path with the project id."""
        invitation, token = self._create_invitation_with_token(
            admin_user, waterfall_project, email="redirect@example.com"
        )
        response = authenticated_client.post(_accept_url(token))
        assert response.status_code == status.HTTP_200_OK
        assert str(waterfall_project.id) in response.data.get("redirect_to", "")


@pytest.mark.django_db
class TestInvitationRoleAssignment:
    """Verify the role stored on the invitation survives the full flow."""

    @patch("accounts.invitation_views.send_mail")
    def test_role_persists_after_creation(
        self, mock_mail, authenticated_admin_client, waterfall_project
    ):
        """Role chosen at creation time is stored on the invitation."""
        for role in ("guest", "pm", "admin"):
            email = f"role-{role}@example.com"
            response = authenticated_admin_client.post(
                CREATE_URL,
                {"email": email, "role": role, "project_id": waterfall_project.id},
                format="json",
            )
            assert response.status_code == status.HTTP_201_CREATED
            inv = TeamInvitation.objects.get(email=email)
            assert inv.role == role

    @patch("accounts.invitation_views.send_mail")
    def test_role_visible_when_viewing_invitation(
        self, mock_mail, api_client, authenticated_admin_client, admin_user, waterfall_project
    ):
        """GET on accept endpoint shows the assigned role."""
        authenticated_admin_client.post(
            CREATE_URL,
            {
                "email": "seerole@example.com",
                "role": "pm",
                "project_id": waterfall_project.id,
            },
            format="json",
        )
        invitation = TeamInvitation.objects.get(email="seerole@example.com")

        response = api_client.get(_accept_url(invitation.token))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["role"] == "pm"


@pytest.mark.django_db
class TestDuplicateInvitationPrevention:
    """Ensure the system handles duplicate invitations correctly."""

    @patch("accounts.invitation_views.send_mail")
    def test_two_invitations_same_email_different_tokens(
        self, mock_mail, authenticated_admin_client, waterfall_project
    ):
        """
        The API currently allows multiple invitations to the same email.
        Each invitation gets its own unique token.
        """
        email = "dupcheck@example.com"
        for _ in range(2):
            response = authenticated_admin_client.post(
                CREATE_URL,
                {"email": email, "project_id": waterfall_project.id},
                format="json",
            )
            assert response.status_code == status.HTTP_201_CREATED

        invitations = TeamInvitation.objects.filter(email=email)
        assert invitations.count() == 2
        tokens = invitations.values_list("token", flat=True)
        assert len(set(tokens)) == 2  # tokens are unique

    @patch("accounts.invitation_views.send_mail")
    def test_unique_token_constraint(
        self, mock_mail, admin_user, waterfall_project
    ):
        """Token field has a unique constraint at the DB level."""
        TeamInvitation.objects.create(
            email="u1@example.com",
            invited_by=admin_user,
            project=waterfall_project,
            token="unique-token-xyz",
        )
        from django.db import IntegrityError

        with pytest.raises(IntegrityError):
            TeamInvitation.objects.create(
                email="u2@example.com",
                invited_by=admin_user,
                project=waterfall_project,
                token="unique-token-xyz",  # duplicate
            )
