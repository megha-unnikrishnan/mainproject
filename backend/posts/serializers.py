
















# from rest_framework import serializers
# from .models import Bookmark, Comments, Hashtag, Post,Like,Message
# from users.serializers import UserSerializer
# class PostSerializer(serializers.ModelSerializer):
#     user=UserSerializer()
#     total_likes = serializers.SerializerMethodField()
#     total_comments = total_comments = serializers.SerializerMethodField()
#     class Meta:
#         model = Post
#         fields = ['id','user','content' ,'image', 'video','created_at','total_likes','total_comments']  # Specify only the required fields

#     def create(self, validated_data):
#         # Ensure the user is authenticated
#         user = self.context['request'].user  # Get user from the request context
#         if not user.is_authenticated:
#             raise serializers.ValidationError('User must be authenticated to create a post.')
        
#         post = Post.objects.create(user=user, **validated_data)
#         return post


#     def update(self, instance, validated_data):
#         # instance.content = validated_data.get('content', instance.content)
#         if 'content' in validated_data:
#             instance.content=validated_data['content']
#         if 'image' in validated_data:
#             instance.image = validated_data['image']
#         if 'video' in validated_data:
#             instance.video = validated_data['video']
#         instance.save()
#         return instance
    
#     def get_total_likes(self, obj):
#         return obj.total_likes
#     def get_total_comments(self, obj):
#         return obj.total_comments  # Access total_comments as a property
    




# class CommentSerializer(serializers.ModelSerializer):
#     replies = serializers.SerializerMethodField()
#     user = serializers.StringRelatedField()

#     class Meta:
#         model = Comments
#         fields = ['id', 'content', 'post', 'parent','replies','user']  # Ensure 'user' is not included here
#         read_only_fields = ['user','post','replies']  # Make 'user' a read-only field

#     def get_replies(self, obj):
#         replies = Comments.objects.filter(parent=obj)
#         return CommentSerializer(replies, many=True).data
    
#     def validate_content(self, value):
#         if not value:
#             raise serializers.ValidationError("Content cannot be empty.")
#         return value

# class HashtagSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Hashtag
#         fields = ['id', 'name']  # Include id and name in the serialized output
    
# class PostSerializers(serializers.ModelSerializer):
    
   

#     class Meta:
#         model = Post
#         fields = ['id', 'content', 'image', 'video']  # Specify only the required fields

#     def create(self, validated_data):
#         # Ensure the user is authenticated
#         user = self.context['request'].user  # Get user from the request context
      
#         if not user.is_authenticated:
#             raise serializers.ValidationError('User must be authenticated to create a post.')
        
#         post = Post.objects.create(user=user, **validated_data)  # Assign the user to the post
       
#         return post

#     def update(self, instance, validated_data):
#         if 'content' in validated_data:
#             instance.content = validated_data['content']
#         if 'image' in validated_data:
#             instance.image = validated_data['image']
#         if 'video' in validated_data:
#             instance.video = validated_data['video']
        
#         instance.save()
#         return instance
    
#     # Method to fetch total likes
    
#     def get_comments(self, obj):
#         # Serialize the comments related to the post if you need the full comment objects
#         return CommentSerializer(obj.comments.all(), many=True).data  # Use your Comment serializer here



# class LikeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Like
#         fields = ['id','user', 'post', 'created_at']
#         read_only_fields = ['id', 'created_at']

# class BookmarkSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Bookmark
#         fields = ['id', 'user', 'post', 'created_at']
#         read_only_fields = ['id', 'user', 'created_at']



# class PostAllSerializer(serializers.ModelSerializer):
#     user = serializers.StringRelatedField()  # Displays the username of the post owner

#     class Meta:
#         model = Post
#         fields = ['id', 'user', 'content', 'created_at']


# class MessageSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Message
#         fields = ['id', 'sender', 'recipient', 'content', 'image', 'video', 'timestamp', 'is_read']
#         read_only_fields = ['id', 'sender', 'timestamp', 'is_read']

#     def create(self, validated_data):
#         return Message.objects.create(**validated_data)

































from rest_framework import serializers
from .models import Bookmark, Comments, Hashtag, Post,Like,Message, Report
from users.serializers import UserSerializer
class PostSerializer(serializers.ModelSerializer):
    user=UserSerializer()
    total_likes = serializers.SerializerMethodField()
    total_comments = total_comments = serializers.SerializerMethodField()
    class Meta:
        model = Post
        fields = ['id','user','content' ,'image', 'video','created_at','total_likes','total_comments']  # Specify only the required fields

    def create(self, validated_data):
        # Ensure the user is authenticated
        user = self.context['request'].user  # Get user from the request context
        if not user.is_authenticated:
            raise serializers.ValidationError('User must be authenticated to create a post.')
        
        post = Post.objects.create(user=user, **validated_data)
        return post


    def update(self, instance, validated_data):
        # instance.content = validated_data.get('content', instance.content)
        if 'content' in validated_data:
            instance.content=validated_data['content']
        if 'image' in validated_data:
            instance.image = validated_data['image']
        if 'video' in validated_data:
            instance.video = validated_data['video']
        instance.save()
        return instance
    
    def get_total_likes(self, obj):
        return obj.total_likes
    def get_total_comments(self, obj):
        return obj.total_comments  # Access total_comments as a property
    




class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    user = serializers.StringRelatedField()

    class Meta:
        model = Comments
        fields = ['id', 'content', 'post', 'parent','replies','user']  # Ensure 'user' is not included here
        read_only_fields = ['user','post','replies']  # Make 'user' a read-only field

    def get_replies(self, obj):
        replies = Comments.objects.filter(parent=obj)
        return CommentSerializer(replies, many=True).data
    
    def validate_content(self, value):
        if not value:
            raise serializers.ValidationError("Content cannot be empty.")
        return value

class HashtagSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Hashtag
        fields = ['id', 'name']  # Include id and name in the serialized output
    
class PostSerializers(serializers.ModelSerializer):
    
    hashtags = HashtagSerializer(many=True, read_only=True)
    tags = HashtagSerializer(many=True, required=False) 
    user = UserSerializer(read_only=True) 
    
   
    class Meta:
        model = Post
        fields = ['id', 'content', 'image', 'video','hashtags', 'tags','user','created_at']  # Specify only the required fields

    def create(self, validated_data):
        tags_data = validated_data.pop('tags', []) 
        # Ensure the user is authenticated
        user = self.context['request'].user  # Get user from the request context
      
        if not user.is_authenticated:
            raise serializers.ValidationError('User must be authenticated to create a post.')
        
        
        
        post = Post.objects.create(user=user, **validated_data)  # Assign the user to the post
       
        for tag_name in tags_data:
            tag, created = Hashtag.objects.get_or_create(name=tag_name)
            post.tags.add(tag)  # Associate tag with the post
        return post

    def update(self, instance, validated_data):
        if 'content' in validated_data:
            instance.content = validated_data['content']
        if 'image' in validated_data:
            instance.image = validated_data['image']
        if 'video' in validated_data:
            instance.video = validated_data['video']
        
        instance.save()
        return instance
    
    # Method to fetch total likes
    
    def get_comments(self, obj):
        # Serialize the comments related to the post if you need the full comment objects
        return CommentSerializer(obj.comments.all(), many=True).data  # Use your Comment serializer here



class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id','user', 'post', 'created_at']
        read_only_fields = ['id', 'created_at']

class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']



class PostAllSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Displays the username of the post owner

    class Meta:
        model = Post
        fields = ['id', 'user', 'content', 'created_at']


# serializers.py
from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.PrimaryKeyRelatedField(source='sender', read_only=True)
    recipient_id = serializers.PrimaryKeyRelatedField(source='recipient', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender','sender_id', 'recipient','recipient_id', 'content', 'image', 'video', 'timestamp', 'is_read', 'is_delivered']
        read_only_fields = ['id', 'sender', 'timestamp', 'is_read', 'is_delivered']


    def get_sender_id(self, obj):
        return obj.sender.id


class ReportSerializer(serializers.ModelSerializer):
    post_title = serializers.CharField(source='post.id', read_only=True)
    user_username = serializers.CharField(source='user.first_name', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'user_username', 'post_title', 'post', 'reason', 'additional_info', 'created_at', 'status']
        read_only_fields = ['id', 'user_username', 'post_title', 'created_at', 'status']













