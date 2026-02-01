import json
import logging
import re

from bot.ai.utils.session_context import (
    clear_user_session,
    get_user_session,
    set_user_session,
)
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from bot.ai import ERPAIAgent
from bot.ai.tools import ToolRegistry
from bot.ai.tools.project_analysis_tools import get_project_analysis
from bot.models import Chat, ChatMessage
from bot.serializers import ChatCreateSerializer, ChatMessageSerializer, ChatSerializer

# Initialize the AI agent
tools = ToolRegistry.get_tools()
ai_agent = ERPAIAgent(tools=tools)
logger = logging.getLogger("bot.views")


def detect_language(text: str) -> str:
    """
    Simple language detection based on common words.
    Returns 'nl' for Dutch, 'en' for English, 'unknown' if uncertain.
    """
    # Common Dutch words and patterns
    dutch_patterns = [
        r'\b(de|het|een|van|in|op|met|voor|aan|te|naar|als|bij|nog|wel|maar|dan|ook|om|tot|uit|door|over|onder|tussen|na|tegen|tijdens|zonder|binnen|buiten)\b',
        r'\b(is|zijn|was|waren|wordt|worden|heeft|hebben|had|hadden|kan|kunnen|kon|konden|zal|zullen|zou|zouden|mag|mogen|moet|moeten)\b',
        r'\b(ik|jij|je|hij|zij|ze|wij|we|jullie|hun|mijn|jouw|zijn|haar|ons|onze)\b',
        r'\b(dit|dat|deze|die|welke|wat|wie|waar|wanneer|waarom|hoe)\b',
        r'\b(niet|geen|niets|niemand|nooit|nergens)\b',
        r'\b(ja|nee|alsjeblieft|bedankt|graag|prima|goed|slecht)\b',
        r'\b(project|projecten|programma|rapport|samenvatting|overzicht|analyse|budget|team|taak|taken|geef|toon|maak|creëer)\b',
    ]
    
    # Common English words
    english_patterns = [
        r'\b(the|a|an|of|in|on|with|for|to|at|from|as|by|about|into|through|during|before|after|above|below|between)\b',
        r'\b(is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|must|can)\b',
        r'\b(I|you|he|she|it|we|they|my|your|his|her|its|our|their)\b',
        r'\b(this|that|these|those|which|what|who|where|when|why|how)\b',
        r'\b(not|no|nothing|nobody|never|nowhere)\b',
        r'\b(yes|please|thank|thanks|good|bad|great|nice)\b',
        r'\b(project|projects|program|report|summary|overview|analysis|budget|team|task|tasks|give|show|make|create)\b',
    ]
    
    text_lower = text.lower()
    
    dutch_score = 0
    english_score = 0
    
    for pattern in dutch_patterns:
        dutch_score += len(re.findall(pattern, text_lower, re.IGNORECASE))
    
    for pattern in english_patterns:
        english_score += len(re.findall(pattern, text_lower, re.IGNORECASE))
    
    # Calculate confidence - need clear difference to override website language
    total_score = dutch_score + english_score
    
    # If very few words detected, return unknown (will use website default)
    if total_score < 2:
        return 'unknown'
    
    # Need significant difference to be confident
    if dutch_score > english_score * 1.5:
        return 'nl'
    elif english_score > dutch_score * 1.5:
        return 'en'
    else:
        # Not confident enough, return unknown to use website default
        return 'unknown'


def get_language_instruction(language: str) -> str:
    """
    Get the language instruction to prepend to messages.
    """
    if language == 'nl':
        return "[BELANGRIJK: Antwoord volledig in het Nederlands] "
    else:
        return "[IMPORTANT: Respond entirely in English] "


class ChatViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer

    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user).order_by("-updated_at")

    def get_serializer_class(self):
        if self.action == "create":
            return ChatCreateSerializer
        return ChatSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        page = int(request.query_params.get("page", 1))
        size = int(request.query_params.get("size", 5))
        queryset = self.get_queryset()
        total = queryset.count()
        start = (page - 1) * size
        end = start + size
        paginated_queryset = queryset[start:end]
        serializer = self.get_serializer(paginated_queryset, many=True)
        return Response(
            {"chats": serializer.data, "total": total, "page": page, "size": size}
        )

    @action(detail=True, methods=["post"])
    def send_message(self, request, pk=None):
        chat = self.get_object()
        message = request.data.get("message")
        user_details = request.user
        
        # Get website language from frontend (default: 'nl')
        website_language = request.data.get("language", "nl")

        if not message:
            return Response(
                {"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Use website language as default, but detect from message if clearly different
        detected_language = detect_language(message)
        
        # If message language is clearly detected, use it. Otherwise use website language.
        # This allows users to type in a different language than the website if they want.
        final_language = detected_language if detected_language != 'unknown' else website_language
        
        # If detection is uncertain, fall back to website language
        if detected_language == website_language or detected_language == 'unknown':
            final_language = website_language
            
        language_instruction = get_language_instruction(final_language)
        
        # Get authentication token from request
        token = None
        if hasattr(request, "auth") and request.auth:
            token = str(request.auth)
        elif "HTTP_AUTHORIZATION" in request.META:
            auth_header = request.META["HTTP_AUTHORIZATION"]
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]

        if user_details and token:
            set_user_session(token, user_details)
        else:
            clear_user_session()

        try:
            # Save user message (original, without language instruction)
            user_message = ChatMessage.objects.create(
                chat=chat, role="user", content=message
            )

            # Get chat history for context
            chat_history = [
                {"role": msg.role, "content": msg.content}
                for msg in chat.messages.all().order_by("created_at")
            ]

            # Create user-specific AI agent and set user context
            # Debug: Check what type of user object we have
            print(f"DEBUG: request.user type: {type(request.user)}")
            print(f"DEBUG: request.user: {request.user}")
            print(
                f"DEBUG: request.user.is_authenticated: {request.user.is_authenticated}"
            )
            if hasattr(request.user, "role"):
                print(f"DEBUG: request.user.role: {request.user.role}")

            # Check if we have user_details from the request
            print(f"DEBUG: user_details from request: {request.data.get('user')}")
            print(f"DEBUG: Detected language: {detected_language}")

            # Use the authenticated user if available, otherwise try to get user from session
            user_for_context = request.user
            if not request.user.is_authenticated or str(request.user) == "default_user":
                # Try to get user from session context
                session_data = get_user_session()
                print(f"DEBUG: session_data: {session_data}")
                if session_data and session_data.get("user"):
                    user_for_context = session_data["user"]
                    print(
                        f"DEBUG: Using user from session: {type(user_for_context)} - {user_for_context}"
                    )

            user_ai_agent = ERPAIAgent(tools=tools, user=user_for_context)

            # Add language instruction to the message for AI processing
            message_with_language = f"{language_instruction}{message}"
            
            # Get AI response with language-aware message
            ai_response = user_ai_agent.process_message(message_with_language, chat_history)

            # Check if AI response is a form initiation JSON and convert to user-friendly message
            display_content = ai_response
            try:
                # Only attempt .strip() and JSON parsing if ai_response is a string
                if (
                    isinstance(ai_response, str)
                    and ai_response.strip().startswith("{")
                    and ai_response.strip().endswith("}")
                ):
                    parsed_response = json.loads(ai_response)
                    if parsed_response.get("form_type"):
                        # Convert form type to user-friendly message (language-aware)
                        form_type = parsed_response["form_type"]
                        if final_language == 'nl':
                            if form_type == "company_registration":
                                display_content = "Het bedrijfsregistratieformulier is gestart."
                            elif form_type == "company_update":
                                display_content = "Het bedrijfsupdateformulier is gestart."
                            elif form_type == "project_creation":
                                display_content = "Het projectaanmaakformulier is gestart."
                            elif form_type == "task_creation":
                                display_content = "Het taakaanmaakformulier is gestart."
                            else:
                                display_content = f"Het {form_type.replace('_', ' ')} formulier is gestart."
                        else:
                            if form_type == "company_registration":
                                display_content = "Company registration form has been initiated."
                            elif form_type == "company_update":
                                display_content = "Company update form has been initiated."
                            elif form_type == "project_creation":
                                display_content = "Project creation form has been initiated."
                            elif form_type == "task_creation":
                                display_content = "Task creation form has been initiated."
                            else:
                                display_content = f"{form_type.replace('_', ' ').title()} form has been initiated."
                    elif parsed_response.get("view"):
                        display_content = parsed_response["content"]

            except (json.JSONDecodeError, KeyError, TypeError):
                # If parsing fails or no form_type, keep original response
                pass

            # Save AI response with user-friendly content and original response
            ai_message = ChatMessage.objects.create(
                chat=chat,
                role="assistant",
                content=display_content,
                original_ai_response=(
                    ai_response if display_content != ai_response else None
                ),
            )

            # Prepare response
            response_data = {
                "user_message": ChatMessageSerializer(user_message).data,
                "ai_response": ChatMessageSerializer(ai_message).data,
            }

            return Response(response_data)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["get"])
    def history(self, request, pk=None):
        chat = self.get_object()
        messages = chat.messages.all().order_by("created_at")
        return Response(
            {
                "chat_id": chat.id,
                "messages": ChatMessageSerializer(messages, many=True).data,
            }
        )

    @action(detail=False, methods=["get"])
    def search(self, request):
        query = request.query_params.get("q", "").strip()
        page = int(request.query_params.get("page", 1))
        size = int(request.query_params.get("size", 5))

        if not query:
            return Response({"chats": [], "total": 0, "page": page, "size": size})

        # Search chats by title (case-insensitive)
        queryset = Chat.objects.filter(
            user=request.user, title__icontains=query
        ).order_by("-updated_at")

        total = queryset.count()

        # Calculate start and end indices
        start = (page - 1) * size
        end = start + size

        # Get paginated data
        paginated_queryset = queryset[start:end]

        # Serialize the data
        serializer = self.get_serializer(paginated_queryset, many=True)

        return Response(
            {"chats": serializer.data, "total": total, "page": page, "size": size}
        )

    @action(detail=True, methods=["post"])
    def edit_message(self, request, pk=None):
        """Edit a user message and optionally regenerate AI response"""
        chat = self.get_object()
        message_id = request.data.get("message_id")
        new_content = request.data.get("content")
        regenerate_ai = request.data.get("regenerate_ai", False)

        if not message_id or not new_content:
            return Response(
                {"error": "message_id and content are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Find the message to edit
            message = ChatMessage.objects.get(id=message_id, chat=chat)

            # Only allow editing user messages
            if message.role != "user":
                return Response(
                    {"error": "Only user messages can be edited"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update the message content
            message.content = new_content
            message.save()

            # If regenerate_ai is True, delete all messages that came after this user message
            if regenerate_ai:
                # Get website language from frontend (default: 'nl')
                website_language = request.data.get("language", "nl")
                
                # Detect language from the new content
                detected_language = detect_language(new_content)
                final_language = detected_language if detected_language != 'unknown' else website_language
                language_instruction = get_language_instruction(final_language)
                
                # Find all messages (both user and AI) that came after this user message
                subsequent_messages = ChatMessage.objects.filter(
                    chat=chat, created_at__gt=message.created_at
                ).order_by("created_at")

                # Delete all messages that came after this user message
                subsequent_messages.delete()

                # Get authentication token from request
                token = None
                if hasattr(request, "auth") and request.auth:
                    token = str(request.auth)
                elif "HTTP_AUTHORIZATION" in request.META:
                    auth_header = request.META["HTTP_AUTHORIZATION"]
                    if auth_header.startswith("Bearer "):
                        token = auth_header[7:]

                if request.user and token:
                    set_user_session(token, request.user)
                else:
                    clear_user_session()

                # Get chat history for context (up to the edited message)
                chat_history = [
                    {"role": msg.role, "content": msg.content}
                    for msg in chat.messages.filter(
                        created_at__lte=message.created_at
                    ).order_by("created_at")
                ]

                # Create user-specific AI agent and set user context
                user_for_context = request.user
                if (
                    not request.user.is_authenticated
                    or str(request.user) == "default_user"
                ):
                    session_data = get_user_session()
                    if session_data and session_data.get("user"):
                        user_for_context = session_data["user"]

                user_ai_agent = ERPAIAgent(tools=tools, user=user_for_context)

                # Add language instruction to the message
                message_with_language = f"{language_instruction}{new_content}"
                
                # Get AI response
                ai_response = user_ai_agent.process_message(message_with_language, chat_history)

                # Check if AI response is a form initiation JSON and convert to user-friendly message
                display_content = ai_response
                try:
                    if (
                        isinstance(ai_response, str)
                        and ai_response.strip().startswith("{")
                        and ai_response.strip().endswith("}")
                    ):
                        parsed_response = json.loads(ai_response)
                        if parsed_response.get("form_type"):
                            form_type = parsed_response["form_type"]
                            if final_language == 'nl':
                                if form_type == "company_registration":
                                    display_content = "Het bedrijfsregistratieformulier is gestart."
                                elif form_type == "company_update":
                                    display_content = "Het bedrijfsupdateformulier is gestart."
                                else:
                                    display_content = f"Het {form_type.replace('_', ' ')} formulier is gestart."
                            else:
                                if form_type == "company_registration":
                                    display_content = "Company registration form has been initiated."
                                elif form_type == "company_update":
                                    display_content = "Company update form has been initiated."
                                else:
                                    display_content = f"{form_type.replace('_', ' ').title()} form has been initiated."
                        elif parsed_response.get("view"):
                            display_content = parsed_response["content"]
                except (json.JSONDecodeError, KeyError, TypeError):
                    pass

                # Save AI response
                ai_message = ChatMessage.objects.create(
                    chat=chat,
                    role="assistant",
                    content=display_content,
                    original_ai_response=(
                        ai_response if display_content != ai_response else None
                    ),
                )

                return Response(
                    {
                        "edited_message": ChatMessageSerializer(message).data,
                        "ai_response": ChatMessageSerializer(ai_message).data,
                    }
                )

            return Response(
                {
                    "edited_message": ChatMessageSerializer(message).data,
                }
            )

        except ChatMessage.DoesNotExist:
            return Response(
                {"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProjectAnalysisAPIView(APIView):
    """
    API endpoint for comprehensive project analysis.

    GET /api/bot/project-analysis/<project_id>/?filter=day|week|month|overall
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        """
        Get comprehensive project analysis with AI insights.

        Args:
            project_id: Project ID from URL
            filter: Query parameter for time filter (day, week, month, overall)

        Returns:
            JSON response with complete analysis
        """
        # Get time filter from query params
        time_filter = request.query_params.get("filter", "overall")

        # Validate time filter
        valid_filters = ["day", "week", "month", "overall"]
        if time_filter not in valid_filters:
            return Response(
                {
                    "error": f"Invalid filter. Must be one of: {', '.join(valid_filters)}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Set up user session for permission checking
        token = None
        if hasattr(request, "auth") and request.auth:
            token = str(request.auth)
        elif "HTTP_AUTHORIZATION" in request.META:
            auth_header = request.META["HTTP_AUTHORIZATION"]
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]

        if request.user and token:
            set_user_session(token, request.user)
        else:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            # Get the analysis
            analysis = get_project_analysis(str(project_id), time_filter)

            # Check for errors
            if "error" in analysis:
                return Response(
                    {"error": analysis["error"]}, status=status.HTTP_400_BAD_REQUEST
                )

            # Return successful analysis
            return Response(analysis, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in project analysis API: {str(e)}", exc_info=True)
            return Response(
                {"error": f"An error occurred during analysis: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        finally:
            # Clean up session
            clear_user_session()