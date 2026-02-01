from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .methodology_templates import get_all_methodologies, get_methodology_template, METHODOLOGY_TEMPLATES


class MethodologyListView(APIView):
    """List all available project methodologies"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        methodologies = get_all_methodologies()
        return Response(methodologies)


class MethodologyDetailView(APIView):
    """Get detailed template for a specific methodology"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, code):
        template = get_methodology_template(code)
        if not template:
            return Response({'error': 'Methodology not found'}, status=404)
        return Response({'code': code, **template})


class MethodologyTemplateView(APIView):
    """Get all methodology templates"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response(METHODOLOGY_TEMPLATES)
