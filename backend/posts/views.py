




















from django.shortcuts import get_object_or_404
from users.models import  Notifications_type,ActivityLog
from .models import CustomUser
from users.serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework import generics,serializers
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from .models import Comments, Hashtag, Like, Post,Message, Report
from .serializers import MessageSerializer, CommentSerializer, HashtagSerializer, LikeSerializer, PostSerializer, PostSerializers, ReportSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import viewsets, status
from rest_framework import generics, permissions
import logging

logger = logging.getLogger(__name__)

import re

class PostCreateView(generics.CreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializers
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can create posts
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer(self, *args, **kwargs):
        """ Override get_serializer to include request context """
        kwargs['context'] = self.get_serializer_context()
        return super().get_serializer(*args, **kwargs)

    def post(self, request, *args, **kwargs):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response({'detail': 'Authentication credentials were not provided.'},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Parse hashtags from content
        content = request.data.get('content', '')
        hashtags = self.extract_hashtags(content)

        # Initialize the serializer with the request data
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save()  # Save the post

            # Handle the hashtags
            ActivityLog.objects.create(user=request.user, action='Created a post')
            
            if hashtags:
                for hashtag_name in hashtags:
                    hashtag, created = Hashtag.objects.get_or_create(name=hashtag_name)
                    post.hashtags.add(hashtag)  # Associate hashtag with the post
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def extract_hashtags(self, content):
        """Extract hashtags from content"""
        import re
        return re.findall(r'#(\w+)', content)
    


class TagCreateView(generics.CreateAPIView):
    queryset = Hashtag.objects.all()
    serializer_class = HashtagSerializer
    permission_classes = [IsAuthenticated]  # Ensure only authenticated users can create tags

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tag = serializer.save()  # Save the tag
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class HashtagPostListView(generics.ListAPIView):
    serializer_class = PostSerializer

    def get_queryset(self):
        hashtag_name = self.kwargs['hashtag']
        print(f"Received hashtag: {hashtag_name}")  # Log the received hashtag
        return Post.objects.filter(hashtags__name=hashtag_name)
class HashtagListView(generics.ListAPIView):
    serializer_class = HashtagSerializer

    def get_queryset(self):
        search = self.request.query_params.get('search', None)
        if search:
            # Remove the '#' character if it exists and filter based on the remaining part
            search = search.lstrip('#')  # Remove '#' if it is present
            return Hashtag.objects.filter(name__icontains=search)
        return Hashtag.objects.all()

class PostDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializers
    permission_classes = [IsAuthenticated]
   
    

    def perform_update(self, serializer):
        # Ensure the post being edited belongs to the logged-in user
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        # Ensure the post being deleted belongs to the logged-in user
        instance.delete()


class LoggedInUserPostsView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get_queryset(self):
        # Filter posts by the logged-in user
        user = self.request.user
        return Post.objects.filter(user=user)





class UserPostsView(generics.ListAPIView):
    serializer_class = PostSerializers

    def get_queryset(self):
        user_id = self.kwargs['user_id']  # Retrieve the user ID from URL kwargs
        return Post.objects.filter(user__id=user_id).order_by('-created_at')    # Return posts for that user
    


    




class UserProfilePostView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all()
    lookup_field = 'pk' 

    def get(self, request, *args, **kwargs):
        user = self.get_object()  # Fetch user based on the URL parameter
        user_data = UserSerializer(user).data

        # Fetch the posts for the user
        posts = Post.objects.filter(user=user)
        posts_data = PostSerializer(posts, many=True).data

        # Combine user data with posts
        return Response({
            'user': user_data,
            'posts': posts_data
        })





from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync




from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class LikeViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request, post_id):
        """Like a post."""
        post = get_object_or_404(Post, id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post_id=post_id)
        
        if created:
            ActivityLog.objects.create(user=request.user, action='Liked a post')
            total_likes = post.likes.count() 
            if post.user != request.user:  # Avoid self-notification
                notification = Notifications_type.objects.create(
                    recipient=post.user,
                    sender=request.user,
                    message=f"{request.user.first_name} liked your post.",
                    notification_type='like'
                )

                # Prepare notification data for WebSocket
                profile_picture_url = (
                    self.request.user.profile_picture.url if self.request.user.profile_picture else None
                    )
                print(f"Sender profile picture URL: {profile_picture_url}")
                notification_data = {
                    'id': notification.id,
                     'sender': {
                    'first_name': self.request.user.first_name,
                    'profile_picture': profile_picture_url,  # Send only the URL or None
                },
                    'message': f"{request.user.first_name} liked your post.",
                    'created_at': notification.created_at.isoformat(),
                    'is_read': False,
                }

                # Send the notification via WebSocket
                self.send_notification(post.user.id, notification_data)

            return Response({'message': 'Post liked.', 'total_likes': total_likes}, status=status.HTTP_201_CREATED)

        return Response({'message': 'You already liked this post.'}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, post_id):
        """Unlike a post."""
        post = get_object_or_404(Post, id=post_id)
        try:
            like = Like.objects.get(user=request.user, post_id=post_id)
            total_likes = post.likes.count()  
            like.delete()
            notification = Notifications_type.objects.filter(
            recipient=post.user,
            sender=request.user,
            notification_type='like',
            message__icontains=f"{request.user.first_name} liked your post."  # Use first_name instead of username
        ).first()
            if notification:
                notification.delete()
                print(f"Notification deleted: {notification}")  # Debugging output
            else:
                print("No notification found to delete.")  # Debugging output
          
            return Response({'message': 'Post unliked.', 'total_likes': total_likes}, status=status.HTTP_204_NO_CONTENT)
        except Like.DoesNotExist:
            return Response({'message': 'You have not liked this post.'}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, post_id):
        """List all likes for a post."""
        post = get_object_or_404(Post, id=post_id)
        likes = post.likes.all()  # Assuming 'likes' is a related name for the Like model
        liked_usernames = [like.user.username for like in likes]
        total_likes = likes.count()

        return Response({'liked_users': liked_usernames, 'total_likes': total_likes}, status=status.HTTP_200_OK)

    def send_notification(self, user_id, notification_data):
        """Send a notification to a user via WebSocket."""
        group_name = f"user_{user_id}_notifications"
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'send_notification',
                'notification': notification_data
            }
        )




from rest_framework import generics, permissions
from .models import Bookmark
from .serializers import BookmarkSerializer

class BookmarkPostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
            bookmark, created = Bookmark.objects.get_or_create(user=request.user, post=post)
            return Response({"postId": post_id}, status=status.HTTP_201_CREATED)  # Return postId
        except Post.DoesNotExist:
            return Response({"error": "Post not found"}, status=status.HTTP_404_NOT_FOUND)


class DeleteBookmarkView(generics.DestroyAPIView):
    queryset = Bookmark.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, post_id):
        bookmark = get_object_or_404(Bookmark, user=request.user, post_id=post_id)
        bookmark.delete()
        return Response({'postId': post_id}, status=status.HTTP_204_NO_CONTENT)  # Return postId
    


class UserBookmarksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch bookmarks for the logged-in user
        bookmarks = Bookmark.objects.filter(user=request.user)
        post_ids = [bookmark.post.id for bookmark in bookmarks]
        
        # Fetch posts for the bookmarked post IDs
        posts = Post.objects.filter(id__in=post_ids)
        serializer = PostSerializer(posts, many=True)  # Serialize the posts
        return Response(serializer.data, status=status.HTTP_200_OK)
    




from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class CommentsForPostView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comments.objects.filter(post__id=post_id)

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = Post.objects.get(id=post_id)
        
        # Extract the parent_id from request data
        parent_id = self.request.data.get('parent', None)
        
        # Debug print statement
        print(f"Creating comment for post_id: {post_id} with parent_id: {parent_id}")
        
        if parent_id:
            try:
                parent_comment = Comments.objects.get(id=parent_id)
                serializer.save(user=self.request.user, post=post, parent=parent_comment)
            except Comments.DoesNotExist:
                return Response({'error': 'Parent comment does not exist'}, status=404)
        else:
            serializer.save(user=self.request.user, post=post)
        
        # Create notification for the post owner
        ActivityLog.objects.create(user=self.request.user, action='Commented on a post')
        self.create_notification(post)

    def create_notification(self, post):
        """Creates a notification for the post owner when a comment is made."""
        
        notification_message = f"{self.request.user.first_name} commented on your post."
        print(notification_message)

        if post.user != self.request.user:  # Avoid self-notification
            notification = Notifications_type.objects.create(
                recipient=post.user,  # The post owner's user object
                sender=self.request.user,  # The user who commented
                message=notification_message,
                notification_type='comment',
            )
           
            # Send the notification through WebSocket
            profile_picture_url = (
                self.request.user.profile_picture.url if self.request.user.profile_picture else None
            )
            print(f"Sender profile picture URL: {profile_picture_url}")
            self.send_notification(post.user.id, {
                'id': notification.id,
                'sender': {
                    
                    'first_name': self.request.user.first_name,
                     'profile_picture': profile_picture_url,  # Include profile picture URL
                },
                'message': notification_message,
                'created_at': notification.created_at.isoformat(),
                'is_read': False,
                
            })

    def send_notification(self, user_id, notification_data):
        """Send a notification to a user via WebSocket."""
        group_name = f"user_{user_id}_notifications"
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'send_notification',
                'notification': notification_data
            }
        )


from rest_framework.exceptions import PermissionDenied
# Retrieve, Update, and Delete a specific Comment
class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comments.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        comment = self.get_object()
        if comment.user != self.request.user:
            raise PermissionDenied("You do not have permission to edit this comment.")
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionDenied("You do not have permission to delete this comment.")
        notification = self.get_associated_notification(instance)
        if notification:
            notification.delete()  # Delete the associated notification if exists
        instance.delete()
    def get_associated_notification(self, comment):
        """Retrieve the associated notification for the comment."""
        return Notifications_type.objects.filter(
            sender=comment.user,
            message__icontains=f"{comment.user.first_name} commented on your post.",
            notification_type='comment'
        ).first()


class CommentListView(generics.ListAPIView):  # Use ListAPIView if you only want to get comments
    serializer_class = CommentSerializer

    def get_queryset(self):
        post_id = self.kwargs['pk']
        return Comments.objects.filter(post_id=post_id)



class CommentDeleteView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def delete(self, request, comment_id):
        try:
            # Fetch the comment object
            comment = Comments.objects.get(id=comment_id)

            # Check if the user is the author of the comment
            if comment.user.id != request.user.id:
                return Response({"detail": "You do not have permission to delete this comment."}, status=status.HTTP_403_FORBIDDEN)

            # Delete the comment
            comment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)  # No content returned on successful delete

        except Comments.DoesNotExist:
            raise NotFound("Comment not found.")
    








class HashtagListView(APIView): 
    def get(self, request):
        query = request.GET.get('q', '')  # Get the 'q' parameter from the URL query string
        print(f"Received query: {query}")  # Debug statement
        if query:
            hashtags = Hashtag.objects.filter(name__icontains=query)  # Filter hashtags based on the query
        else:
            hashtags = Hashtag.objects.all()  # Return all hashtags if no query

        serializer = HashtagSerializer(hashtags, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



    
class PostPagination(PageNumberPagination):
    page_size = 10  # Default number of posts per page
    page_size_query_param = 'limit'
    max_page_size = 100 
        
class PostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes=[permissions.IsAuthenticated]
    pagination_class = PostPagination  # Set the pagination class
 # To protect this API

    def get_queryset(self):
        # Order posts by most recent first (chronological feed)
        return Post.objects.all().order_by('-created_at')
    def list(self, request, *args, **kwargs):
        # Call the default list method to handle pagination
        response = super().list(request, *args, **kwargs)
        return response





    


# class MessageCreateView(generics.CreateAPIView):
#     parser_classes = (MultiPartParser, FormParser)
#     queryset = Message.objects.all()
#     serializer_class = MessageSerializer
#     permission_classes = [permissions.IsAuthenticated]
    

#     def perform_create(self, serializer):
#         recipient_id = self.request.data.get('recipient_id')
#         if not recipient_id:
#             raise serializers.ValidationError({"recipient_id": "This field is required."})
#         try:
#             recipient = CustomUser.objects.get(id=recipient_id)
#         except CustomUser.DoesNotExist:
#             raise serializers.ValidationError({"recipient_id": "Invalid recipient."})
#         serializer.save(sender=self.request.user, recipient=recipient)

#     def create(self, request, *args, **kwargs):
#         # Custom create method to log validation errors
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         self.perform_create(serializer)
#         headers = self.get_success_headers(serializer.data)
#         return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)




class MessageCreateView(generics.CreateAPIView):
    parser_classes = (MultiPartParser, FormParser)
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        recipient_id = self.request.data.get('recipient_id')
        if not recipient_id:
            logger.error("Recipient ID is missing.")
            raise serializers.ValidationError({"recipient_id": "This field is required."})

        try:
            recipient = CustomUser.objects.get(id=recipient_id)
        except CustomUser.DoesNotExist:
            logger.error(f"Recipient with ID {recipient_id} does not exist.")
            raise serializers.ValidationError({"recipient_id": "Invalid recipient."})

        # Save the message
        message = serializer.save(sender=self.request.user, recipient=recipient)
        logger.info(f"Message created by {self.request.user.username} for {recipient.username}: {message.content}")

        # Create notification for the message recipient
        self.create_notification(recipient, message)

    def create_notification(self, recipient, message):
        """Creates a notification for the message recipient when a message is sent."""
        notification_message = f"You have a new message from {self.request.user.first_name}: '{message.content}'"
        
        # Create notification in the database
        notification = Notifications_type.objects.create(
            recipient=recipient,  # The message recipient
            sender=self.request.user,  # The user who sent the message
            message=notification_message,
            notification_type='chat'
        )

        # Log notification creation
        logger.info(f'Notification created for {recipient.username} by {self.request.user.username}: {notification_message}')
        print(f'Notification created: {notification_message}')

        # Prepare notification data for WebSocket
        notification_data = {
            'id': notification.id,
            'sender': {
                'id': self.request.user.id,
                'first_name': self.request.user.first_name,
            },
            'message': notification_message,
            'is_read': notification.is_read,
            'created_at': notification.created_at.isoformat(),
            'notification_type': notification.notification_type,
        }

        # Log the notification data being sent
        logger.info(f'Sending notification via WebSocket to {recipient.username}: {notification_data}')
        print(f'Sending notification via WebSocket: {notification_data}')

        # Send notification via WebSocket
        self.send_notification(recipient.id, notification_data)

    def send_notification(self, user_id, notification_data):
        """Send a notification to a user via WebSocket."""
        group_name = f"user_{user_id}_notifications"
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'send_notification',
                'notification': notification_data
            }
        )
        logger.info(f"Notification sent to WebSocket group {group_name}")

    def create(self, request, *args, **kwargs):
        """Custom create method to log validation errors."""
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Message creation failed with errors: {serializer.errors}")
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        logger.info(f"Message creation successful for {self.request.user.username}")
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

# class MessageUpdateView(generics.UpdateAPIView):
#     queryset = Message.objects.all()
#     serializer_class = MessageSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         serializer.is_valid(raise_exception=True)
#         self.perform_update(serializer)
#         return Response(serializer.data, status=status.HTTP_200_OK)

class MessageUpdateView(generics.UpdateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        logger.debug("Updating message ID: %s with data: %s", instance.id, request.data)

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        logger.debug("Message updated successfully: %s", serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class MessageDeleteView(generics.DestroyAPIView):
    queryset = Message.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        # Optionally, you can perform additional checks here before deletion
        instance.delete()


from django.db.models import Q
# class UserMessagesView(generics.ListAPIView):
#     serializer_class = MessageSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def get_queryset(self):
#         user_id = self.kwargs['userId']
#         return Message.objects.filter(
#             Q(sender=self.request.user, recipient=user_id) | Q(sender=user_id, recipient=self.request.user)
#         )
class UserMessagesView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['userId']
        return Message.objects.filter(
            Q(sender=self.request.user, recipient=user_id) | Q(sender=user_id, recipient=self.request.user)
        )
class UserListChatView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    # def get_queryset(self):
    #     # Exclude the logged-in user from the user list
    #     return CustomUser.objects.exclude(id=self.request.user.id)
    def get_queryset(self):
        # Get the logged-in user
        user = self.request.user

        
        following_users = CustomUser.objects.filter(followers__user=user)

        
        followers_of_user = CustomUser.objects.filter(following__followed_user=user)

       
        combined_users = following_users | followers_of_user.exclude(id=user.id)

        return combined_users.distinct()  # Use distinct() to avoid duplicate entries
    
class UserRetrieveView(generics.RetrieveAPIView):
    queryset = CustomUser.objects.all()  # All users
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated
    lookup_field = 'id'  # Look up user by 'id' field




# class ReportCreateView(generics.CreateAPIView):
#     queryset = Report.objects.all()
#     serializer_class = ReportSerializer
#     permission_classes = [permissions.IsAuthenticated]

#     def perform_create(self, serializer):
#         report = serializer.save(user=self.request.user)
#         # Update the post's reporting status
#         post = report.post
#         post.is_reported = True
#         post.reported_by.add(self.request.user)  # Optionally track users who reported
#         post.save()

from rest_framework.exceptions import ValidationError

class ReportCreateView(generics.CreateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post = serializer.validated_data['post']

        # Prevent reporting one's own post
        if post.user == self.request.user:
            raise ValidationError({'detail': 'You cannot report your own post.'})

        # Proceed to create the report if validation passes
        report = serializer.save(user=self.request.user)

        # Update the post's reporting status
        post.is_reported = True
        post.reported_by.add(self.request.user)  # Optionally track users who reported
        post.save()

        return Response({'detail': 'Post reported successfully.'}, status=status.HTTP_201_CREATED)

class ReportListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Report.objects.filter(post__id=post_id)

    def get(self, request, *args, **kwargs):
        post_id = self.kwargs['post_id']
        reports = self.get_queryset()
        
        # Check if the current user has flagged the post
        user_flagged = reports.filter(user=request.user).exists()
        
        return Response({
            'reports': ReportSerializer(reports, many=True).data,
            'user_flagged': user_flagged
        })

from rest_framework import generics, permissions, filters
class ReportPagination(PageNumberPagination):
    page_size = 10  # Adjust as needed
    page_size_query_param = 'page_size'
    max_page_size = 100

class AdminReportListView(generics.ListAPIView):
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = ReportPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['status', 'reason']

# class ReportActionView(generics.UpdateAPIView):
#     queryset = Report.objects.all()
#     serializer_class = ReportSerializer
#     permission_classes = [permissions.IsAdminUser]

#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         action = request.data.get('action')

#         if action == 'approve':
#             instance.status = 'APPROVED'
#         elif action == 'reject':
#             instance.status = 'REJECTED'
#         else:
#             return Response({"error": "Invalid action"}, status=400)

#         instance.save()
#         return Response({'status': instance.status})
from django.core.mail import send_mail 
from django.conf import settings 
class ReportActionView(generics.UpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAdminUser]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        action = request.data.get('action')
        
        # Get the user who owns the post (the post owner)
        post_owner = instance.post.user  

        if action == 'approve':
            instance.status = 'APPROVED'
            report_reason = instance.reason  # Get the reason from the report instance
            
            # Send warning email to the post owner
            send_mail(
                'Warning: Your Post Has Been Reported',
                f'Dear {post_owner.username},\n\n'
                f'We hope this message finds you well.\n\n'
                f'We want to inform you that your post titled "{instance.post.content}" '
                f'has been flagged for violating our community guidelines. Specifically, it was reported for: {report_reason}.\n\n'
                'As a result, we have issued a warning for this violation. Please be aware that if you receive three warnings, '
                'your account may be subject to suspension or other actions.\n\n'
                'We encourage you to review our community guidelines and ensure that your future posts align with our standards.\n\n'
                'Thank you for your understanding.\n\n'
                'Best regards,\n'
                '[Admininstration] Moderation Team',
                settings.DEFAULT_FROM_EMAIL,
                [post_owner.email],  # Send email to the post owner
                fail_silently=False,
            )
            
            # Increment the warning count for the post owner
            post_owner.warning_count += 1
            post_owner.save()

            # Block the post owner if they have 3 warnings
            if post_owner.warning_count >= 3:
                post_owner.is_active = False  # Block only the owner of the post
                post_owner.save()
                return Response({"error": "User has been blocked due to three warnings."}, status=403)

        elif action == 'reject':
            instance.status = 'REJECTED'
        else:
            return Response({"error": "Invalid action"}, status=400)

        instance.save()
        return Response({'status': instance.status})