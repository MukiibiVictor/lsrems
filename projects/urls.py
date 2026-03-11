from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SurveyProjectViewSet, ProjectUpdateViewSet, LandTitleViewSet

router = DefaultRouter()
router.register(r'projects', SurveyProjectViewSet, basename='project')
router.register(r'project-updates', ProjectUpdateViewSet, basename='project-update')
router.register(r'land-titles', LandTitleViewSet, basename='land-title')

urlpatterns = [
    path('', include(router.urls)),
]
