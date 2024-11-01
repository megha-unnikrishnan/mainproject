from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        # extra_fields.setdefault('is_active', True)  # Make sure the user is active
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    first_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True,max_length=350)
    dob = models.DateField(null=True,blank=True)
    mobile = models.CharField(max_length=15, unique=True, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pics', blank=True)
    cover_picture = models.ImageField(upload_to='cover_pics', blank=True)
    is_active = models.BooleanField(default=True )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_suspended = models.BooleanField(default=False, help_text="Designates whether this user is suspended or not.")
    is_online=models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    warning_count = models.PositiveIntegerField(default=0)  

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # No additional required fields

    objects = CustomUserManager()

    def __str__(self):
        return self.first_name
    

    
class Follow(models.Model):
        user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='following')
        followed_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='followers')
        created_at = models.DateTimeField(auto_now_add=True)

        class Meta:
            unique_together = ('user', 'followed_user')

        def __str__(self):
            return f'{self.user} follows {self.followed_user}'


# class Notifications(models.Model):
    
#     recipient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')  # User receiving the notification
#     sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_notifications')  # User sending the notification
#     message = models.CharField(max_length=255)
#     is_read = models.BooleanField(default=False)
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f'Notification for {self.recipient}: {self.message}'
    

class Notifications_type(models.Model):
    NOTIFICATION_TYPES = (
        ('follow', 'Follow'),
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('chat', 'Chat'),
        ('videocall','Videocall')
    )

    recipient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_notifications')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)

    def __str__(self):
        return f'Notification for {self.recipient}: {self.message} [{self.notification_type}]'


            
class ActivityLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.created_at}"