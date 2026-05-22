"""
AI Meeting Minutes endpoint (Yanmar Sprint 0 + Sprint 1 persistence).

POST /api/v1/communication/projects/<project_id>/meetings/ai-minutes/

Body:
  {
    "transcript": "...",                  // required
    "previous_actions": [...],            // optional, overrides DB carry-forward
    "previous_meeting_id": <int>,         // optional -- pull open actions from it
    "persist": true,                      // optional -- create Meeting + attendees + actions in DB
    "meeting_name": "..."                 // optional override
  }

Returns:
  - Without `persist`:   DOCX download.
  - With `persist=true`: JSON {meeting_id, action_item_ids, attendee_ids, docx_url}
                         and the DOCX is also saved to /tmp.

Sprint 1 additions:
  - Pulls open MeetingActionItems from `previous_meeting_id` into the prompt,
    so the LLM doesn't re-invent them.
  - When `persist=true`, writes generated MinutesData to MeetingAttendee +
    MeetingActionItem rows linked to a new Meeting (with previous_meeting FK).
"""

from __future__ import annotations

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse
from django.utils.text import slugify
from django.utils import timezone

from .ai_minutes import ActionItem, render_minutes_docx, transcript_to_minutes


class AIMeetingMinutesView(APIView):
    """POST a transcript, get a Yanmar-format Meeting Minutes DOCX back."""

    permission_classes = [IsAuthenticated]

    def post(self, request, project_id: int):
        transcript = (request.data.get("transcript") or "").strip()
        if not transcript:
            return Response(
                {"detail": "transcript is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        persist = bool(request.data.get("persist", False))
        previous_meeting_id = request.data.get("previous_meeting_id")
        explicit_prev_actions = request.data.get("previous_actions")

        from projects.models import Project
        try:
            project = Project.objects.get(pk=project_id)
            project_name = project.name
        except Project.DoesNotExist:
            project_name = ""
            project = None

        # Resolve the LLM key — prefer the company's BYO key (Yanmar
        # compliance), fall back to the Inclufy multi-tenant pool.
        from core.llm_keys import get_llm_key
        company = getattr(project, "company", None) if project else None
        resolution = get_llm_key(company, provider="anthropic", user=request.user)
        if not resolution.ok:
            return Response(
                {"detail": (
                    "No Anthropic API key configured for this company. "
                    "Configure one in Settings → API Keys (preferred), "
                    "or have an admin set CompanyAIKey.anthropic_api_key, "
                    "or set settings.ANTHROPIC_API_KEY as platform fallback."
                )},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # 1) Determine "previous actions" — explicit payload wins; otherwise
        #    pull open actions from the linked previous Meeting.
        from .models import Meeting, MeetingAttendee, MeetingActionItem
        previous_meeting = None
        if previous_meeting_id:
            previous_meeting = Meeting.objects.filter(
                pk=previous_meeting_id, project_id=project_id,
            ).first()

        if explicit_prev_actions is not None:
            previous_actions = [
                ActionItem(
                    no=int(p.get("no", i + 1)),
                    subject=p.get("subject", ""),
                    pic=p.get("pic", ""),
                    action_due=p.get("action_due", ""),
                )
                for i, p in enumerate(explicit_prev_actions)
            ]
        elif previous_meeting:
            previous_actions = [
                ActionItem(
                    no=ai.no or (i + 1),
                    subject=ai.subject,
                    pic=(
                        getattr(ai.pic_user, "email", "") or ai.pic_text or ""
                    ),
                    action_due=ai.action_due,
                )
                for i, ai in enumerate(
                    previous_meeting.action_items.filter(status="open").order_by("no", "id")
                )
            ]
        else:
            previous_actions = []

        # 2) LLM call (BYO key passed in).
        try:
            data = transcript_to_minutes(
                transcript,
                project_name=project_name,
                previous_actions=previous_actions,
                api_key=resolution.api_key,
                base_url=resolution.base_url or None,
            )
        except RuntimeError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # 3) Render DOCX (always produced).
        docx_bytes = render_minutes_docx(data)
        filename = "minutes-{}-{}.docx".format(
            slugify(project_name or "project"),
            (data.meeting_date or timezone.now().date()).isoformat(),
        )

        # 4) Persist to DB if requested.
        persisted = None
        if persist and project is not None:
            from datetime import time as _time
            meeting = Meeting.objects.create(
                project=project,
                name=data.meeting_name or request.data.get(
                    "meeting_name", "AI-generated meeting"
                ),
                type="onetime",
                frequency="adhoc",
                date=data.meeting_date or timezone.now().date(),
                time=_time(0, 0),  # transcript-derived
                location=data.location or "",
                customer_supplier=data.customer_supplier or "",
                yanmar_meeting_room=data.yanmar_meeting_room or "",
                prepared_by=data.prepared_by or "",
                reason=data.reason or "",
                discussion_notes="\n".join(data.discussion_points or []),
                conclusions=data.conclusions or "",
                agenda=list(data.agenda_points or []),
                participants=[a.name for a in data.attendees if a.name],
                previous_meeting=previous_meeting,
            )
            attendee_ids = [
                MeetingAttendee.objects.create(
                    meeting=meeting,
                    name_text=a.name,
                    position=a.position,
                    contact_info=a.contact,
                    presence=a.presence,
                ).id
                for a in data.attendees
            ]
            # Carry forward open actions from previous_meeting that the LLM
            # didn't already close.
            new_action_ids = []
            for i, act in enumerate(data.new_actions):
                row = MeetingActionItem.objects.create(
                    meeting=meeting,
                    no=act.no or (i + 1),
                    subject=act.subject,
                    pic_text=act.pic,
                    action_due=act.action_due,
                    status="open",
                )
                new_action_ids.append(row.id)
            persisted = {
                "meeting_id": meeting.id,
                "attendee_ids": attendee_ids,
                "action_item_ids": new_action_ids,
            }

        if persist:
            # Return JSON metadata + base64-less link to download (caller
            # can call GET on the meeting export endpoint to fetch DOCX).
            return Response({
                "filename": filename,
                "persisted": persisted,
                "preview": {
                    "meeting_name": data.meeting_name,
                    "meeting_date": (
                        data.meeting_date.isoformat() if data.meeting_date else None
                    ),
                    "attendees_count": len(data.attendees),
                    "new_actions_count": len(data.new_actions),
                    "conclusions": data.conclusions[:200],
                },
            })

        response = HttpResponse(
            docx_bytes,
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        return response
