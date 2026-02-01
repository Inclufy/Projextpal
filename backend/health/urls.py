from django.urls import path
from . import views

app_name = "health"

urlpatterns = [
    path("", views.health_check, name="health_check"),
    path("simple/", views.simple_health_check, name="simple_health_check"),
]
