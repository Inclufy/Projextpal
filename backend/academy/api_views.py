from rest_framework import viewsets, serializers
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Course, CourseModule, CourseLesson

class CourseLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseLesson
        fields = [
            'id', 'module', 'title', 'title_nl', 'lesson_type',
            'duration_minutes', 'is_free_preview', 'order',
            'video_url', 'content', 'content_nl',
            'visual_type', 'visual_data',
            'ai_profile', 'simulation_id', 'practice_set_id',
        ]

class CourseModuleSerializer(serializers.ModelSerializer):
    lessons = serializers.SerializerMethodField()

    def get_lessons(self, obj):
        lessons = obj.lessons.all()
        return CourseLessonSerializer(lessons, many=True).data

    class Meta:
        model = CourseModule
        fields = ['id', 'title', 'title_nl', 'description', 'order', 'lessons', 'course']

class CourseSerializer(serializers.ModelSerializer):
    modules = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    instructor_name = serializers.CharField(source='instructor.name', read_only=True, default='')

    def get_modules(self, obj):
        modules = obj.modules.all()
        return CourseModuleSerializer(modules, many=True).data

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'title_nl', 'slug', 'description', 'description_nl',
            'price', 'difficulty', 'duration_hours', 'language',
            'is_featured', 'is_bestseller', 'is_new', 'has_certificate',
            'status', 'category', 'category_name', 'instructor',
            'instructor_name', 'icon', 'color', 'gradient',
            'rating', 'student_count', 'modules',
        ]

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

class CourseModuleViewSet(viewsets.ModelViewSet):
    queryset = CourseModule.objects.all()
    serializer_class = CourseModuleSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = CourseModule.objects.all()
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course=course_id)
        return queryset.order_by('order')

class CourseLessonViewSet(viewsets.ModelViewSet):
    queryset = CourseLesson.objects.all()
    serializer_class = CourseLessonSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = CourseLesson.objects.all()
        module_id = self.request.query_params.get('module')
        if module_id:
            queryset = queryset.filter(module=module_id)
        return queryset.order_by('order')
    
    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated], url_path="quiz")
    def quiz(self, request, pk=None):
        lesson = self.get_object()
        if lesson.lesson_type != "quiz":
            return Response({"error": "Lesson is not a quiz"}, status=400)
        
        questions = lesson.questions.prefetch_related("answers").all()
        lang = request.query_params.get("lang", "en")
        
        data = []
        for q in questions:
            answers = [{
                "id": a.id,
                "text": (a.answer_text_nl if lang == "nl" and a.answer_text_nl else a.answer_text),
                "order": a.order,
            } for a in q.answers.all()]
            
            data.append({
                "id": q.id,
                "question": (q.question_text_nl if lang == "nl" and q.question_text_nl else q.question_text),
                "type": q.question_type,
                "points": q.points,
                "answers": answers,
            })
        
        return Response({
            "questions": data,
            "total_points": sum(q.points for q in questions),
        })


# ===== CRUD endpoints for EnhancedCourseBuilder =====

@api_view(['PATCH'])
def course_update(request, pk):
    """PATCH /api/v1/academy/courses/{id}/update/"""
    try:
        course = Course.objects.get(pk=pk)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    serializer = CourseSerializer(course, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
def course_delete(request, pk):
    """DELETE /api/v1/academy/courses/{id}/delete/"""
    try:
        course = Course.objects.get(pk=pk)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    course.delete()
    return Response({'status': 'deleted'})


@api_view(['POST'])
def course_create_module(request, pk):
    """POST /api/v1/academy/courses/{id}/modules/create/"""
    try:
        course = Course.objects.get(pk=pk)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)
    data = request.data.copy()
    data['course'] = course.id
    serializer = CourseModuleSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PATCH'])
def module_update(request, pk):
    """PATCH /api/v1/academy/modules/{id}/update/"""
    try:
        module = CourseModule.objects.get(pk=pk)
    except CourseModule.DoesNotExist:
        return Response({'error': 'Module not found'}, status=404)
    serializer = CourseModuleSerializer(module, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
def module_delete(request, pk):
    """DELETE /api/v1/academy/modules/{id}/delete/"""
    try:
        module = CourseModule.objects.get(pk=pk)
    except CourseModule.DoesNotExist:
        return Response({'error': 'Module not found'}, status=404)
    module.delete()
    return Response({'status': 'deleted'})


@api_view(['POST'])
def module_create_lesson(request, pk):
    """POST /api/v1/academy/modules/{id}/lessons/create/"""
    try:
        module = CourseModule.objects.get(pk=pk)
    except CourseModule.DoesNotExist:
        return Response({'error': 'Module not found'}, status=404)
    data = request.data.copy()
    data['module'] = module.id
    serializer = CourseLessonSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PATCH'])
def lesson_update(request, pk):
    """PATCH /api/v1/academy/lessons/{id}/update/"""
    try:
        lesson = CourseLesson.objects.get(pk=pk)
    except CourseLesson.DoesNotExist:
        return Response({'error': 'Lesson not found'}, status=404)
    serializer = CourseLessonSerializer(lesson, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
def lesson_delete(request, pk):
    """DELETE /api/v1/academy/lessons/{id}/delete/"""
    try:
        lesson = CourseLesson.objects.get(pk=pk)
    except CourseLesson.DoesNotExist:
        return Response({'error': 'Lesson not found'}, status=404)
    lesson.delete()
    return Response({'status': 'deleted'})


@api_view(['POST'])
def analyze_lesson_for_visual(request):
    """
    Analyze lesson using OpenAI for visual selection.
    POST /api/v1/academy/analyze-lesson/
    """
    from openai import OpenAI
    from django.conf import settings
    import json
    import logging
    
    logger = logging.getLogger(__name__)
    
    try:
        course_title = request.data.get('courseTitle', '')
        module_title = request.data.get('moduleTitle', '')
        lesson_title = request.data.get('lessonTitle', '')
        methodology = request.data.get('methodology', 'generic_pm')
        
        logger.info(f"🤖 Analyzing lesson: {lesson_title}")
        
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        prompt = f"""Analyze this project management lesson and extract key semantic information.

Course: {course_title}
Module: {module_title}  
Lesson: {lesson_title}
Methodology: {methodology}

Extract:
1. Primary concepts (2-4 keywords that capture the core topic)
2. Learning intent (explain_concept, demonstrate_process, compare_approaches, define_role, assess_knowledge)
3. Concept class (framework, tool, role_matrix, process_flow, comparison_chart, assessment)
4. Methodology context detected

Return JSON:
{{
  "primaryConcepts": ["keyword1", "keyword2"],
  "learningIntent": "explain_concept",
  "conceptClass": "framework",
  "methodologyDetected": "{methodology}",
  "confidence": 0.95,
  "reasoning": "Brief explanation"
}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=300,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        logger.info(f"✅ OpenAI analysis complete: {result}")
        
        return Response(result, status=200)
        
    except Exception as e:
        logger.error(f"❌ Error analyzing lesson: {str(e)}")
        
        return Response({
            "primaryConcepts": [lesson_title.lower()],
            "learningIntent": "explain_concept",
            "conceptClass": "framework",
            "methodologyDetected": methodology,
            "confidence": 0.5,
            "reasoning": f"Fallback due to error: {str(e)}"
        }, status=200)