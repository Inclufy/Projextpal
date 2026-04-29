from .views import PostProjectViewSet
from django.urls import path

# Mount the viewset directly at the include root so that
# `GET /api/v1/postproject/` returns a JSON list of PostProject objects.
#
# Earlier this used DefaultRouter, which produced a confusing API-root
# response (`{"post-projects": "<url>"}`) — clients that iterated that
# value got a per-character string list. See audit P3-C (2026-04-28).

list_create = PostProjectViewSet.as_view({'get': 'list', 'post': 'create'})
detail = PostProjectViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

urlpatterns = [
    path('', list_create, name='postproject-list'),
    path('<int:pk>/', detail, name='postproject-detail'),
    # Backward-compat alias for the previous router prefix.
    path('post-projects/', list_create, name='postproject-list-legacy'),
    path('post-projects/<int:pk>/', detail, name='postproject-detail-legacy'),
]
