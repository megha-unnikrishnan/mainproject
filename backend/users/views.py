from django.conf import settings
from jwt import InvalidTokenError
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer


from .serializers import   ActivityLogSerializer, BlockUserSerializer, CustomUserSerializer, NotificationSerializer, PasswordResetSerializer, UnblockUserSerializer, UpdatePasswordSerializer, UserFollowSerializer, UserProfileSerializer, UserSerializer, RegisterSerializer, AdminSerializer,UserProfileEachSerializer,FollowListSerializer

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from.models import ActivityLog, CustomUser, Notifications_type
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import CustomUser
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from .utils import email_verification_token
from rest_framework.permissions import AllowAny
import logging
from django.db.models import Q
from google.oauth2 import id_token
from google.auth.transport import requests
from django.contrib.auth import authenticate, login
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import GoogleLoginSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import status
import base64
from google.auth.transport import requests
# from .models import Follower
from asgiref.sync import async_to_sync
logger = logging.getLogger(__name__)
User = get_user_model()
from rest_framework.decorators import api_view
from django.utils.encoding import force_bytes,force_str
from django.contrib.auth import authenticate, update_session_auth_hash
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from .models import CustomUser,Follow
import jwt
import google.oauth2.id_token
import google.auth.transport.requests
from rest_framework.authtoken.models import Token
import requests
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from google.auth.transport import requests as google_requests
from .serializers import FollowSerializer
from asgiref.sync import sync_to_async
def download_image_from_url(url):
    response = requests.get(url)
    if response.status_code == 200:
        return ContentFile(response.content, name='profile_picture.jpg')
    return None







logger = logging.getLogger(__name__)

class FollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, followed_id):
        follower = request.user
        followed = get_object_or_404(CustomUser, id=followed_id)

        # Prevent following oneself
        if follower == followed:
            return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the follow relationship already exists
        if Follow.objects.filter(user=follower, followed_user=followed).exists():
            return Response({"detail": "You are already following this user."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the follow relationship
        follow_relation = Follow.objects.create(user=follower, followed_user=followed)

        ActivityLog.objects.create(user=follower, action=f'Followed {followed.username}')

        # Create a notification for the followed user
        message = f"{follower.first_name} started following you."
        notification = Notifications_type.objects.create(
            recipient=followed,
            sender=follower,
            message=message,
            notification_type='follow'
        )

        # Log notification creation
        logger.info(f'Notification created: {notification}')
        print(f'Notification created: {notification}')

        

        # Prepare notification data for WebSocket
        notification_data = {
            'id': notification.id,
            'sender': {
                'id': follower.id,
                'first_name': follower.first_name,
                'profile_picture': self.get_profile_picture_url(follower)
                
            },
            'message': message,
            'is_read': notification.is_read,
            'created_at': notification.created_at.isoformat(),
            'notification_type': notification.notification_type,
        }

        # Log the notification data being sent
        logger.info(f'Sending notification via WebSocket: {notification_data}')
        print(f'Sending notification via WebSocket: {notification_data}')

        # Send notification via WebSocket
        self.send_notification(followed.id, notification_data)

        # Serialize the follow relation and return it
        serializer = FollowSerializer(follow_relation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def send_notification(self, user_id, notification_data):
        group_name = f"user_{user_id}_notifications"
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'send_notification',
                'notification': notification_data
            }
        )
    def get_profile_picture_url(self, user):
        # Return the absolute URL of the profile picture
        return user.profile_picture.url if user.profile_picture else None







    

class UnfollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, followed_id):
        follower = request.user
        followed = get_object_or_404(CustomUser, id=followed_id)

        # Check for the existing follow relationship
        follow_relation = Follow.objects.filter(user=follower, followed_user=followed)
        
        if follow_relation.exists():
            # Delete the follow relationship
            follow_relation.delete()

            # Remove the "follow" notification for the unfollow action
            Notifications_type.objects.filter(
                recipient=followed,  # The user who was unfollowed
                sender=follower,     # The user who unfollowed
                notification_type='follow'  # The type of notification to remove
            ).delete()

            # Send notification to the followed user about unfollowing
            message = f"{follower.first_name} has unfollowed you."
            notification_data = {
                'sender': {
                    'id': follower.id,
                    'first_name': follower.first_name,
                },
                'message': message,
                'notification_type': 'unfollow',
                'is_read': False,  # Assuming a new notification is unread
               
            }
            self.send_notification(followed.id, notification_data)

            # Log the unfollow action
            logger.info(f'{follower.first_name} unfollowed {followed.first_name}')
            
            # Return success response
            return Response({"detail": "User unfollowed successfully."}, status=status.HTTP_200_OK)

        # Return error response if not following
        return Response({"detail": "You are not following this user."}, status=status.HTTP_400_BAD_REQUEST)

    def send_notification(self, user_id, notification_data):
        group_name = f"user_{user_id}_notifications"
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'send_notification',
                'notification': notification_data
            }
        )


class FollowersListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        followers = Follow.objects.filter(followed_user=user)
        serializer = FollowSerializer(followers, many=True)
        return Response(serializer.data)




logger = logging.getLogger(__name__)

class FollowListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get users followed by the logged-in user
        following = Follow.objects.filter(user=request.user).select_related('followed_user')

        # Get users who are following the logged-in user
        logged_in_user=request.user
        followers =  Follow.objects.filter(followed_user=logged_in_user).select_related('user')

        # Serialize data
        following_data = FollowListSerializer(following, many=True).data
        followers_data = FollowListSerializer(followers, many=True).data

        # Log for debugging
        logger.debug(f'Following: {following_data}, Followers: {followers_data}')

        # Return response
        return Response({
            "following": following_data,
            "followers": followers_data,
        })




class UserDetailView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserFollowSerializer

    def get(self, request):
        user = request.user

        # Ensure the user is properly authenticated and identified
        if not user.is_authenticated:
            return Response({'detail': 'Authentication credentials were not provided.'}, status=403)

        # Get following and follower data
        following = Follow.objects.filter(user=user).select_related('followed_user')
        followers = Follow.objects.filter(followed_user=user).select_related('user')

        following_users = [follow.followed_user for follow in following]
        follower_users = [follow.user for follow in followers]

        following_data = UserFollowSerializer(following_users, many=True).data
        followers_data = UserFollowSerializer(follower_users, many=True).data

        return Response({
            'following': following_data,
            'followers': followers_data,
        })


    


class FollowerListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        return Follow.objects.filter(followed_user=user).select_related('user')  # Get followers for the logged-in user


class FollowingListView(generics.ListAPIView):
    serializer_class = FollowSerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Follow.objects.filter(follower__id=user_id)




class NotificationListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # Get notifications for the logged-in user (recipient)
        return Notifications_type.objects.filter(recipient=self.request.user).order_by('-created_at')


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    queryset = Notifications_type.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    # def update(self, request, *args, **kwargs):
    #     notification = self.get_object()
    #     # Only mark as read if it is not already read
    #     if not notification.is_read:
    #         notification.is_read = True
    #         notification.save()
        
    #     serializer = self.get_serializer(notification)
    #     return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    # Use recipient instead of user
    notifications = Notifications_type.objects.filter(recipient=request.user, is_read=False)
    notifications.update(is_read=True)
    return Response({'status': 'success', 'message': 'All notifications marked as read.'})
    
    
class NotificationViewSet(viewsets.ViewSet):
    def create(self, request):
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            notification = serializer.save()
            # Send to WebSocket group
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{notification.recipient.id}",
                {
                    'type': 'send_notification',
                    'message': notification.message,
                    'sender': notification.sender.id,
                }
            )
            return Response({'status': 'Notification sent!'}, status=201)
        return Response(serializer.errors, status=400)

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        # Log detailed errors
        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



    
class UserListViewfollow(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser] 

    def get_queryset(self):
        # Exclude users with admin status
        return CustomUser.objects.filter(is_superuser=False)
    


class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    
    def get_queryset(self):
        search_term = self.request.query_params.get('q', None)
        if search_term:
            return CustomUser.objects.filter(
                Q(first_name__icontains=search_term) |
                Q(username__icontains=search_term) |
                Q(email__icontains=search_term)
            )
        return CustomUser.objects.all()
    
class UserListView(generics.ListAPIView):
    """
    API view to list all non-superuser users.
    """
    queryset = CustomUser.objects.filter(is_superuser=False)
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAdminUser]  # Only admins can access

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])  # Only admins can perform
def block_user(request, user_id):
    """
    API view to block a user.
    """
    try:
        user = CustomUser.objects.get(id=user_id, is_superuser=False)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found or cannot block superuser'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = BlockUserSerializer(user, data={'is_suspended': True}, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'status': 'User blocked'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])  # Only admins can perform
def unblock_user(request, user_id):
    """
    API view to unblock a user.
    """
    try:
        user = CustomUser.objects.get(id=user_id, is_superuser=False)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found or cannot unblock superuser'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = UnblockUserSerializer(user, data={'is_suspended': False}, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'status': 'User unblocked'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = AdminSerializer
    permission_classes = [permissions.IsAdminUser]
    
@permission_classes([IsAuthenticated])
class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_pictures(request):
    user = request.user
    cover_picture = request.data.get('cover_picture')
    profile_picture = request.data.get('profile_picture')

    if cover_picture:
        format, img_str = cover_picture.split(';base64,')
        ext = format.split('/')[-1]
        image = ContentFile(base64.b64decode(img_str), name='cover_picture.' + ext)
        user.cover_picture.save(image.name, image)

    if profile_picture:
        format, img_str = profile_picture.split(';base64,')
        ext = format.split('/')[-1]
        image = ContentFile(base64.b64decode(img_str), name='profile_picture.' + ext)
        user.profile_picture.save(image.name, image)

    user.save()
    return Response({'cover_picture': user.cover_picture.url, 'profile_picture': user.profile_picture.url}, status=status.HTTP_200_OK)



class UpdatePasswordView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UpdatePasswordSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'detail': 'Password updated successfully.'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    ...
    def validate(self, attrs):
        print("Validating user credentials...")
        data = super().validate(attrs)
        request = self.context['request']
        user = self.user

        print("User is_active:", user.is_active)
        print("User is_superuser:", user.is_superuser)

        if not user.is_active:
            raise InvalidToken('No active account found with the given credentials')

        if user.is_superuser and not request.path.endswith('/admin/token/'):
            raise InvalidToken('Superuser credentials are not allowed for regular user login.')
        if user is None:
             return InvalidToken('Invalid credentials')
    
        if not user.is_active:
              return InvalidToken('Account is inactive')
    
        if user.is_suspended:
             return InvalidToken('Account is suspended')
    
        elif not user.is_superuser and request.path.endswith('/admin/token/'):
            raise InvalidToken('Regular user credentials are not allowed for admin login.')
       
        # Log the activity after successful validation
        full_name = f"{user.first_name} ".strip()  # Construct the full name
        ActivityLog.objects.create(user=user, action=f'{full_name} logged in')

        data.update({
            'userId': user.id
        })
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class AdminTokenObtainPairView(CustomTokenObtainPairView):
    pass




@api_view(['GET'])
def search_users(request):
    query = request.GET.get('q', '')  # Updated to match the frontend query parameter
    if not query:
        return Response({'error': 'Query parameter is missing'}, status=status.HTTP_400_BAD_REQUEST)

    users = User.objects.filter(
        Q(username__icontains=query) | 
        Q(first_name__icontains=query) | 
        Q(email__icontains=query)
    ).values('username', 'first_name', 'email')  # Get specific fields if needed

    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id, token, *args, **kwargs):
        user = get_object_or_404(User, pk=user_id)
        if email_verification_token.check_token(user, token):
            user.is_active = True
            user.is_email_verified = True
            user.save()
            return Response({"message": "Email verified successfully!"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)


class ViewSearch(generics.ListAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')  # Get the search query from the URL
        return CustomUser.objects.filter(
            Q(first_name__icontains=query) | 
            Q(username__icontains=query) | 
            Q(email__icontains=query)
        )

class GoogleLoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        id_token_str = request.data.get('idToken')
        

        if not id_token_str:
            return Response({'error': 'ID token missing'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            GOOGLE_CLIENT_ID = settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY
            # Use google_requests.Request() correctly
            id_info = id_token.verify_oauth2_token(id_token_str, google_requests.Request(), GOOGLE_CLIENT_ID)
            
            logger.info(f"Google ID token verified successfully: {id_info}")
            print(id_info)

            user_details = {
                'user_id': id_info.get('sub'),
                'first_name': id_info.get('name'),
                'email': id_info.get('email'),
                'profile_picture': id_info.get('picture'),
            }

            user, created = CustomUser.objects.get_or_create(email=user_details['email'])
            if created:
                user.username = user_details['email']
                user.first_name = user_details['first_name']

                # Handle profile picture
                profile_picture_url = user_details.get('profile_picture')
                if profile_picture_url:
                    image_content = download_image_from_url(profile_picture_url)
                    if image_content:
                        user.profile_picture.save('profile_picture.jpg', image_content, save=True)

                user.save()

            token, created = Token.objects.get_or_create(user=user)

            response_data = {
                'token': token.key,
                'userId': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'profile_picture': user.profile_picture.url if user.profile_picture else None,
                'isAdmin': False
            }
            return Response(response_data, status=status.HTTP_200_OK)

        except ValueError as e:
            logger.error(f"Token verification failed: {e}")
            return Response({'error': f'Invalid token: {e}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def google_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        id_token_str = data.get('idToken')
        if not id_token_str:
            return JsonResponse({'error': 'ID token missing'}, status=400)

        try:
            id_info = id_token.verify_oauth2_token(id_token_str, requests.Request(), settings.GOOGLE_CLIENT_ID)
            logger.info(f"Google ID token verified successfully: {id_info}")
            return JsonResponse({'data': id_info})
        except ValueError as e:
            logger.error(f"Token verification failed: {e}")
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=405)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        user = get_object_or_404(CustomUser, email=email)

        token = default_token_generator.make_token(user)
        user_id = user.id  # Use user.id directly

        # Link should redirect to the frontend URL
        reset_link = request.build_absolute_uri(f'http://localhost/reset-password/{user_id}/{token}/')

        subject = 'Password Reset Request'
        message = f'Hi {user.first_name},\n\n' \
                  f'We received a request to reset your password. Click the link below to reset your password:\n' \
                  f'{reset_link}\n\n' \
                  f'If you did not request this change, please ignore this email.\n\n' \
                  f'Thank you!'

        send_mail(
            subject,
            message,
            'no-reply@yourdomain.com',
            [user.email],
            fail_silently=False,
        )

        return Response({"message": "Password reset email sent!"}, status=status.HTTP_200_OK)

class PasswordResetView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            password = serializer.validated_data['password']

            user = self.get_user_from_token(token)
            if user and default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({"message": "Password reset successful!"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_user_from_token(self, token):
        # Since token doesn't contain user info directly, return None if token validation fails
        for user in CustomUser.objects.all():
            if default_token_generator.check_token(user, token):
                return user
        return None
    


class UserProfileEachView(generics.RetrieveUpdateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserProfileEachSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'


from rest_framework import generics
from django.utils import timezone
from .models import CustomUser
from .serializers import UserGrowthSerializer, EngagementMetricsSerializer
from django.db.models import Count
from posts.models import Comments, Post

class UserGrowthView(generics.ListAPIView):
    serializer_class = UserGrowthSerializer

    def get_queryset(self):
        # Return users created in the last 30 days
        return CustomUser.objects.filter(created_at__gte=timezone.now() - timezone.timedelta(days=30))

class EngagementMetricsView(generics.ListAPIView):
    serializer_class = EngagementMetricsSerializer

    def get_queryset(self):
        # Use values() with annotate to get total_likes, total_comments and the username
        return Post.objects.annotate(
            total_likes=Count('likes'),
            total_comments=Count('comments')
        ).values('content', 'user__username', 'total_likes', 'total_comments')


class UserCountView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can access this

    def get(self, request):
        total_users = CustomUser.objects.count()  # Get total number of users
        total_posts = Post.objects.count()  # Get total number of posts
        total_comments=Comments.objects.count()
        return Response({'total_users': total_users, 'total_posts': total_posts,'total_comments':total_comments})  # Return both counts in a single dictionary
    


class ActivityFeedView(generics.ListAPIView):
    queryset = ActivityLog.objects.order_by('-created_at')[:10]
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]  # Require authentication

class TopUsersView(generics.ListAPIView):
    serializer_class = CustomUserSerializer

    def get_queryset(self):
        return CustomUser.objects.annotate(post_count=Count('posts')).order_by('-post_count')[:5]  # Top 5 users