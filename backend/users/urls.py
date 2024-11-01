from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('users/', views.UserListView.as_view(), name='user_list_create'),
    
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    path('token/', views.CustomTokenObtainPairView.as_view(), name='get_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('admin/token/', views.AdminTokenObtainPairView.as_view(), name='admin_get_token'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('api/verify-email/<int:user_id>/<str:token>/', views.VerifyEmailView.as_view(), name='verify-email'),
    # path('api/auth/google/', views.GoogleLoginView.as_view(), name='google_login'),
    path('auth/google/', views.GoogleLoginAPIView.as_view(), name='google_login'),
    path('reset-password-request/', views.PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('reset-password/', views.PasswordResetView.as_view(), name='reset-password'),
    path('change-password/',views.UpdatePasswordView.as_view(),name='change-password'),
    path('user-view/',views.UserListView.as_view(),name='user-view'),
    path('user-view-follow/',views.UserListViewfollow.as_view(),name='user-view-follow'),
    path('users/<int:user_id>/block/', views.block_user, name='block_user'),
    path('users/<int:user_id>/unblock/', views.unblock_user, name='unblock_user'),
     path('update-pictures/', views.update_pictures, name='update_pictures'),
     path('search/', views.search_users, name='user-search'),
   
     path('follow/<int:followed_id>/', views.FollowUserView.as_view(), name='follow-user'),
    path('unfollow/<int:followed_id>/', views.UnfollowUserView.as_view(), name='unfollow-user'),

      path('userdetail/', views.FollowListView.as_view(), name='userdetail'),

    path('followers/<int:user_id>/', views.FollowersListView.as_view(), name='followers-list'),
    path('following/<int:user_id>', views.FollowingListView.as_view(), name='following-list'),

     path('profile/<int:user_id>/', views.UserProfileEachView.as_view(), name='user-profile-id'),
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
     path('notifications/<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
     path('notifications/mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),


     path('user_growth/', views.UserGrowthView.as_view(), name='user-growth'),
    path('engagement_metrics/', views.EngagementMetricsView.as_view(), name='engagement-metrics'),
     path('user-count/', views.UserCountView.as_view(), name='user-count'),
    path('activity-feed/', views.ActivityFeedView.as_view(), name='activity-feed'),
    path('top-users/', views.TopUsersView.as_view(), name='top-users'),
    # path('notifications/', views.NotificationViewSet.as_view({'post': 'create'}), name='notification-create'),
    path('user-list-find/',views.ViewSearch.as_view(),name='usersearch-find')
]