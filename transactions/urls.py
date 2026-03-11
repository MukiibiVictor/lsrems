from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyTransactionViewSet

router = DefaultRouter()
router.register(r'', PropertyTransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]
