from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.db import OperationalError, ProgrammingError
import requests
import os
import json
import logging

logger = logging.getLogger(__name__)

from .models import LessonVisual, Course, CourseLesson
from .serializers_visual import (
    LessonVisualSerializer,
    GenerateVisualsSerializer,
    ApproveVisualSerializer,
    RejectVisualSerializer
)


class LessonVisualViewSet(viewsets.ModelViewSet):
    queryset = LessonVisual.objects.all()
    serializer_class = LessonVisualSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        # Admin-only actions
        if self.action in ['create', 'update', 'partial_update', 'destroy', 
                          'generate_visuals', 'approve', 'reject', 'regenerate', 
                          'generate_preview_image']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = LessonVisual.objects.all()
        course_id = self.request.query_params.get('course_id')
        status_filter = self.request.query_params.get('status')
        
        if course_id:
            queryset = queryset.filter(lesson__module__course_id=course_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset.select_related('lesson', 'lesson__module', 'approved_by')
    
    @action(detail=False, methods=['get'])
    def by_lesson(self, request):
        """Get approved visual for a specific lesson (by ID only)"""
        lesson_id = request.query_params.get('lesson_id')
        if not lesson_id:
            return Response({'error': 'lesson_id required'}, status=400)

        try:
            # Only support numeric ID
            lesson = CourseLesson.objects.get(id=lesson_id)

            # Get approved visual for this lesson
            visual = LessonVisual.objects.get(lesson=lesson, status='approved')
            serializer = self.get_serializer(visual)
            return Response(serializer.data)

        except CourseLesson.DoesNotExist:
            return Response({'error': f'Lesson not found: {lesson_id}'}, status=404)
        except LessonVisual.DoesNotExist:
            # Visual is optional - return empty object instead of error
            return Response({}, status=200)
        except ValueError:
            return Response({'error': f'Invalid lesson_id: {lesson_id}'}, status=400)
        except (OperationalError, ProgrammingError) as e:
            # Table may not exist yet (migration not applied)
            logger.warning(f'LessonVisual table error for lesson {lesson_id}: {e}')
            return Response({}, status=200)
        except Exception as e:
            logger.error(f'Unexpected error in by_lesson for lesson_id={lesson_id}: {e}', exc_info=True)
            return Response({'error': str(e)}, status=500)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def generate_visuals(self, request):
        """Generate AI visuals for all lessons in a course"""
        serializer = GenerateVisualsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        course_id = serializer.validated_data['course_id']
        regenerate = serializer.validated_data['regenerate']
        
        course = get_object_or_404(Course, id=course_id)
        lessons = CourseLesson.objects.filter(module__course=course).select_related('module')
        
        generated_count = 0
        skipped_count = 0
        errors = []
        
        for lesson in lessons:
            # Skip if already exists and not regenerating
            if not regenerate and hasattr(lesson, 'visual'):
                skipped_count += 1
                continue
            
            try:
                # Call AI analysis
                result = self._analyze_lesson(course, lesson)
                
                # Create or update LessonVisual
                visual, created = LessonVisual.objects.update_or_create(
                    lesson=lesson,
                    defaults={
                        'visual_id': result['visual_id'],
                        'ai_confidence': result['confidence'],
                        'ai_concepts': result.get('concepts', []),
                        'ai_intent': result.get('intent', ''),
                        'ai_methodology': result.get('methodology', ''),
                        'status': 'pending'
                    }
                )
                generated_count += 1
                
            except Exception as e:
                errors.append(f"Lesson {lesson.id} - {lesson.title}: {str(e)}")
        
        return Response({
            'success': True,
            'generated': generated_count,
            'skipped': skipped_count,
            'errors': errors
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        """Approve a visual"""
        visual = self.get_object()
        visual.approve(request.user)
        serializer = self.get_serializer(visual)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        """Reject a visual with optional custom keywords"""
        visual = self.get_object()
        custom_keywords = request.data.get('custom_keywords', '')
        visual.reject(custom_keywords)
        serializer = self.get_serializer(visual)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def regenerate(self, request, pk=None):
        """Regenerate visual with custom keywords using OpenAI"""
        visual = self.get_object()
        lesson = visual.lesson
        course = lesson.module.course
        custom_keywords = request.data.get('custom_keywords', '').strip()
        
        if not custom_keywords:
            return Response(
                {'error': 'Custom keywords are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            api_key = os.getenv('OPENAI_API_KEY')
            if not api_key:
                return Response(
                    {'error': 'OPENAI_API_KEY not configured'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            prompt = f"""Generate visual metadata for a learning video/animation.

LESSON: {course.title} - {lesson.module.title} - {lesson.title}
TYPE: {lesson.lesson_type}
DURATION: {lesson.duration_minutes} min

CUSTOM REQUIREMENTS: {custom_keywords}

Return JSON with: visual_id, confidence (0-100), concepts (array), intent, methodology"""

            response = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'gpt-4o-mini',
                    'messages': [
                        {'role': 'system', 'content': 'Generate visual metadata. Return valid JSON only.'},
                        {'role': 'user', 'content': prompt}
                    ],
                    'response_format': {'type': 'json_object'},
                    'temperature': 0.7
                },
                timeout=60
            )
            
            response.raise_for_status()
            data = response.json()
            visual_data = json.loads(data['choices'][0]['message']['content'])
            
            visual.visual_id = visual_data.get('visual_id', visual.visual_id)[:200]
            visual.ai_confidence = min(100, max(0, visual_data.get('confidence', visual.ai_confidence)))
            visual.ai_concepts = visual_data.get('concepts', visual.ai_concepts)
            visual.ai_intent = visual_data.get('intent', visual.ai_intent)[:500]
            visual.ai_methodology = visual_data.get('methodology', visual.ai_methodology)[:500]
            visual.custom_keywords = custom_keywords
            visual.status = 'pending'
            visual.preview_image_url = ''
            visual.save()
            
            serializer = self.get_serializer(visual)
            return Response({
                'success': True,
                'message': 'Visual regenerated successfully',
                'visual': serializer.data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Regeneration failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def generate_preview_image(self, request, pk=None):
        """Generate DALL-E preview image"""
        visual = self.get_object()
        
        try:
            preview_url = self._generate_preview_for_visual(visual)
            
            serializer = self.get_serializer(visual)
            return Response({
                'success': True,
                'image_url': preview_url,
                'visual': serializer.data
            })
            
        except Exception as e:
            return Response(
                {'error': f'Preview generation failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _generate_preview_for_visual(self, visual):
        """Generate DALL-E preview"""
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise Exception('OPENAI_API_KEY not configured')
        
        dalle_prompt = f"""Educational visual for project management.
Style: Modern, professional, clean
Type: {visual.visual_id.replace('_', ' ')}
Purpose: {visual.ai_intent or 'Educational'}
Elements: {', '.join(visual.ai_concepts) if visual.ai_concepts else 'Key concepts'}
Design: {visual.ai_methodology or 'Professional style'}
Requirements: Blue/purple colors, icons, minimalist, e-learning suitable, no text"""

        response = requests.post(
            'https://api.openai.com/v1/images/generations',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'dall-e-3',
                'prompt': dalle_prompt,
                'n': 1,
                'size': '1024x1024',
                'quality': 'standard',
                'style': 'natural'
            },
            timeout=60
        )
        
        response.raise_for_status()
        data = response.json()
        image_url = data['data'][0]['url']
        
        visual.preview_image_url = image_url
        visual.save()
        
        return image_url
    
    def _analyze_lesson(self, course, lesson):
        """Analyze lesson using OpenAI"""
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise Exception("OPENAI_API_KEY not configured")
        
        prompt = f"""Course: {course.title}
Module: {lesson.module.title}
Lesson: {lesson.title}
Type: {lesson.lesson_type}
Duration: {lesson.duration_minutes} min

Suggest visual and return JSON with: visual_id, confidence, concepts, intent, methodology"""
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'Suggest visual for PM lesson. Return valid JSON.'},
                    {'role': 'user', 'content': prompt}
                ],
                'response_format': {'type': 'json_object'},
                'temperature': 0.7
            },
            timeout=30
        )
        
        response.raise_for_status()
        data = response.json()
        result = json.loads(data['choices'][0]['message']['content'])
        
        return {
            'visual_id': result.get('visual_id', 'lifecycle'),
            'confidence': min(100, max(0, result.get('confidence', 70))),
            'concepts': result.get('concepts', []),
            'intent': result.get('intent', 'explain'),
            'methodology': result.get('methodology', 'pm')
        }