from django.db import models
from users.models import CustomUser

# Create your models here.

class Hashtag(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    
class Post(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(blank=True, null=True)  
    image = models.ImageField(upload_to='post_images/', null=True, blank=True) 
    video = models.FileField(upload_to='post_videos/', null=True, blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_reported = models.BooleanField(default=False)  
    is_approved = models.BooleanField(default=True)  
    report_reason = models.CharField(max_length=255, blank=True, null=True) 
    reported_by = models.ManyToManyField(CustomUser, related_name='reported_posts', blank=True) 
    hashtags = models.ManyToManyField(Hashtag, related_name='posts', blank=True)

    def __str__(self):
        return f"Post by {self.user.username} on {self.created_at}"
    
    # Method to get total likes on this post
    @property
    def total_likes(self):
        return self.likes.count()

    # Method to get total comments on this post
    @property
    def total_comments(self):
        return self.comments.count()

    # Method to allow users to report a post
    def report_post(self, user, reason):
        self.is_reported = True
        self.report_reason = reason
        self.reported_by.add(user)
        self.save()

    
    def moderate_post(self, approval_status):
        self.is_approved = approval_status
        self.save()


    
class Comments(models.Model):
    post=models.ForeignKey(Post,on_delete=models.CASCADE,related_name='comments')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.id}"

     # To get the replies for a comment
    def get_replies(self):
        return Comments.objects.filter(parent=self)
    

class Like(models.Model):
        user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
        post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
        created_at = models.DateTimeField(auto_now_add=True)

        class Meta:
            unique_together = ('user', 'post')  # Prevent users from liking the same post multiple times

        def __str__(self):
            return f"{self.user.username} liked post {self.post.id}"


class Bookmark(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE,related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')  # Ensure a user can bookmark a post only once

    def __str__(self):
            return f"{self.user.username} bookmarked post {self.post.id}"

        

class Report(models.Model):
    # Define a set of predefined reasons for reporting a post
        REPORT_REASONS = [
            ('SPAM', 'Spam or misleading'),
            ('INAPPROPRIATE', 'Inappropriate content'),
            ('HARASSMENT', 'Harassment or hate speech'),
            ('VIOLENCE', 'Violence or dangerous behavior'),
            ('COPYRIGHT', 'Copyright infringement'),
            ('OTHER', 'Other'),
        ]

        STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]


        
        
        user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
        post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reports')
        reason = models.CharField(max_length=50, choices=REPORT_REASONS)  # Predefined reasons for reporting
        additional_info = models.TextField(blank=True, null=True)  # Optional field for more information
        created_at = models.DateTimeField(auto_now_add=True)
        status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

        def __str__(self):
            return f"{self.user.username} reported post {self.post.id} for {self.get_reason_display()}"
        


class Message(models.Model):
    sender = models.ForeignKey(CustomUser, related_name='sent_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey(CustomUser, related_name='received_messages', on_delete=models.CASCADE)
    content = models.TextField(blank=True)  # Text content of the message
    image = models.ImageField(upload_to='message_images/', blank=True, null=True)  # Image field
    video = models.FileField(upload_to='message_videos/', blank=True, null=True)  # Video field
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_delivered = models.BooleanField(default=False)  # New field to track if the message has been delivered

    def __str__(self):
        return f'Message from {self.sender} to {self.recipient} at {self.timestamp}'
    

