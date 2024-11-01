# urls.py
from django.urls import path
from .views import  ReportActionView,AdminReportListView,ReportListView,MessageDeleteView,ReportCreateView,MessageUpdateView,UserRetrieveView,MessageCreateView,UserListChatView,UserMessagesView,HashtagPostListView,TagCreateView,PostListView,HashtagListView,CommentDeleteView,CommentListView, CommentDetailView,CommentsForPostView,UserBookmarksView,DeleteBookmarkView, BookmarkPostView, PostCreateView,PostDetail,LoggedInUserPostsView,UserPostsView,UserProfilePostView,LikeViewSet

urlpatterns = [
    path('post-create/', PostCreateView.as_view(), name='post-list-create'),
     path('posts-detail/<int:pk>/', PostDetail.as_view(), name='post-detail'),
     path('fetch-posts/',LoggedInUserPostsView.as_view(),name='fetch-users'),
     path('users-posts/<int:user_id>/', UserPostsView.as_view(), name='user-posts'),
     path('users-post-profile/<int:pk>/',UserProfilePostView.as_view(),name='users-post-profile'),
       path('posts-like/<int:post_id>/like/', LikeViewSet.as_view({'post': 'create'}), name='like-post'),
    path('posts-unlike/<int:post_id>/unlike/', LikeViewSet.as_view({'delete': 'destroy'}), name='unlike-post'),
       path('postslikeslist/<int:post_id>/likes/', LikeViewSet.as_view({'get':'list'}), name='list-likes'), 
    path('bookmark/<int:post_id>/', BookmarkPostView.as_view(), name='bookmark_post'),
    path('bookmarks/<int:post_id>/', DeleteBookmarkView.as_view(), name='bookmark-delete'),
     path('bookmarks/', UserBookmarksView.as_view(), name='user_bookmarks'),
     path('posts-comments-create/<int:post_id>/comments/', CommentsForPostView.as_view(), name='comments-for-post'),  # List and create comments for a specific post
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'), 
      path('comments-list/<int:pk>/', CommentListView.as_view(), name='comment-detail'), 
      path('delete/comments/<int:comment_id>/', CommentDeleteView.as_view(), name='comment-delete'),
      path('tags/create/', TagCreateView.as_view(), name='hashtag-create'),
      path('hashtag/<str:hashtag>/', HashtagPostListView.as_view(), name='posts-by-hashtag'),
      path('fetch-all-posts/', PostListView.as_view(), name='posts'),
      path('messages/create/', MessageCreateView.as_view(), name='message-create'),
       path('messages/<int:userId>/', UserMessagesView.as_view(), name='user-messages'),

       path('messages/<int:pk>/edit/', MessageUpdateView.as_view(), name='message-update'),
    path('messages/<int:pk>/delete/', MessageDeleteView.as_view(), name='message-delete'),
      path('hashtags/', HashtagListView.as_view(), name='hashtag-list'),
      path('users/', UserListChatView.as_view(), name='user-list'),
      path('users/<int:id>/', UserRetrieveView.as_view(), name='user-detail'),
      path('reports/', ReportCreateView.as_view(), name='report-create'),
      path('reports/<int:post_id>/', ReportListView.as_view(), name='report-list'),
       path('admin/reports/', AdminReportListView.as_view(), name='admin-reports'),
    path('admin/reports/<int:pk>/action/', ReportActionView.as_view(), name='admin-report-action'),
    

 
]
