from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, get_user_model
from .serializers import UserSerializer, UserCreateSerializer, LoginSerializer

User = get_user_model()


class AuthViewSet(viewsets.GenericViewSet):
    """
    ViewSet for authentication operations
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """
        Login endpoint
        """
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            username=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        if not user:
            # Try with email
            try:
                user_obj = User.objects.get(email=serializer.validated_data['email'])
                user = authenticate(
                    username=user_obj.username,
                    password=serializer.validated_data['password']
                )
            except User.DoesNotExist:
                pass
        
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        
        return Response(
            {'detail': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """
        Logout endpoint - deletes the user's auth token
        """
        try:
            # Delete the user's token
            request.user.auth_token.delete()
        except Exception as e:
            # Token might not exist, but that's okay
            pass
        return Response({'detail': 'Successfully logged out'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Get current user endpoint
        """
        return Response(UserSerializer(request.user).data)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User CRUD operations
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
