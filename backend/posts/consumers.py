
 






import json
from channels.generic.websocket import AsyncWebsocketConsumer

from users.models import Notifications_type

class PostConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("post_updates", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("post_updates", self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Handle the data, e.g., save a new post, broadcast to group
        await self.channel_layer.group_send(
            "post_updates",
            {
                'type': 'new_post',
                'content': data['content'],  # Assuming data contains the content
                'user': data['user'],  # Add more fields as necessary
            }
        )

    async def new_post(self, event):
        await self.send(text_data=json.dumps({
            'content': event['content'],
            'user': event['user'],
        }))




import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from .models import Message

import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from .models import Message,CustomUser
import base64
from django.core.files.base import ContentFile













import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.core.files.base import ContentFile
from .models import Message, CustomUser

  




from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        query_string = self.scope['query_string'].decode()
        token = self.get_token_from_query(query_string)

        if not token:
            print("No token provided. Closing connection.")
            await self.close()
            return

        try:
            decoded_token = AccessToken(token)
            user_id = decoded_token['user_id']
            self.user = await self.get_user(user_id)

            if not self.user or not self.user.is_authenticated:
                print("User is not authenticated. Closing connection.")
                await self.close()
                return

            recipient_id = self.scope['url_route']['kwargs']['room_name']
            
            print(f"Recipient ID from URL route: {recipient_id}")
            self.recipient = await self.get_user(recipient_id)
            print(self.recipient)
            if not self.recipient:
                print(f"Recipient with ID {recipient_id} does not exist.")
                await self.close()
                return

            self.room_name = self.get_room_name(self.user.id, self.recipient.id)
            self.group_name = f'chat_{self.room_name}'

            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            print(f"WebSocket connection accepted for user: {self.user.id} in room: {self.group_name}")

        except Exception as e:
            print(f"Authentication error: {e}")
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            print(f"WebSocket connection closed for room: {self.group_name}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
        except json.JSONDecodeError:
            print("Invalid JSON received.")
            return
        text_data_json = json.loads(text_data)
        # print(f"Received data: {text_data_json}")
        action = text_data_json.get('action')

        if action == 'start_video_call':
            recipient_id = self.recipient.id
            
            # Ensure both sender and recipient are available
            if self.user.id != recipient_id:
                print(f"Video call initiated from sender ID: {self.user.id} to recipient ID: {recipient_id}")
                await self.handle_start_video_call(text_data_json)
            return

        # Handle video call answer
        elif action == 'answer_video_call':
            await self.handle_answer_video_call(text_data_json)
            return

        # Handle ICE candidate exchange
        elif action == 'ice_candidate':
            await self.handle_ice_candidate(text_data_json)
            return
        elif action == 'end_call':
            print(f"End call received from sender ID: {self.user.id}")
            await self.handle_end_call(text_data_json)
            return
        elif action == 'call_accepted':
            # Ensure handling for the call accepted action if required
            print(f"Call accepted from sender ID:  {self.user.id}")
            # Any additional handling logic if necessary
            return
        elif action == 'delete_message':
            await self.handle_delete_message(text_data_json)
        
        elif action == 'edit_message':
            await self.handle_edit_message(text_data_json)
            return
            
        message_content = text_data_json.get('message')
        image = text_data_json.get('image')  
        video = text_data_json.get('video')  
        sender_id = text_data_json.get('sender_id')
        is_delivered = text_data_json.get('is_delivered')
        is_read = text_data_json.get('is_read')

        if not message_content and not image and not video:
            print("Received message is missing the 'message', 'image', or 'video' key.")
            return

        print(f"Message received from sender ID: {sender_id} to recipient ID: {self.recipient.id}")

        image_file = None
        video_file = None

        if image:
            try:
                image_data = base64.b64decode(image)
                image_file = ContentFile(image_data, name='image.jpg')
            except Exception as e:
                print(f"Error processing image: {e}")
                await self.send(text_data=json.dumps({
                    'error': 'Failed to process image.'
                }))
                return

        if video:
            try:
                video_data = base64.b64decode(video)
                video_file = ContentFile(video_data, name='video.mp4')
            except Exception as e:
                print(f"Error processing video: {e}")
                await self.send(text_data=json.dumps({
                    'error': 'Failed to process video.'
                }))
                return
            
       

        message = await self.save_message(self.user, self.recipient, message_content, image_file, video_file, is_delivered=True, is_read=False)
         # Create a notification for the recipient
        await self.create_notification( message)
        message.is_delivered = is_delivered
        message.is_read = is_read

        await database_sync_to_async(message.save)()
        image_url = self.get_image_url(message.image)
        video_url = self.get_video_url(message.video)

        print(f"Broadcasting message from sender ID: {sender_id} to recipient ID: {self.recipient.id}")
     
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'id': message.id,
                'message': message.content,
                'user_id': sender_id,
                'recipient_id': self.recipient.id,
                'image': image_url,
                'video': video_url,
                'timestamp': message.timestamp.isoformat(),
                 'is_delivered': True,  # Ensure this is set as True when sending
            'is_read': False  # Initially set to False until confirmed read
            }
        )

        

        # Notify the recipient with the unread count
       
    @database_sync_to_async
    def create_notification(self, message):
        """Creates a notification for the message recipient."""
        notification_message = f"You have a new message from {self.user.first_name}: '{message.content}'"
        
        if message.recipient != self.user:  # Avoid self-notification
            notification = Notifications_type.objects.create(
                recipient=message.recipient,
                sender=self.user,
                message=notification_message,
                notification_type='chat'
            )
            profile_picture_url = (
            self.user.profile_picture.url if self.user.profile_picture else None
            )
            print(f"Sender profile picture URL: {profile_picture_url}")

            # Send notification via WebSocket
            self.send_notification(message.recipient.id, {
                'id': notification.id,
                 'sender': {
                    'username': self.user.username,
                    'first_name': self.user.first_name,
                    'profile_picture': profile_picture_url,  # Include profile picture URL
                },
                'message': notification_message,
                'created_at': notification.created_at.isoformat(),
                'is_read': False
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


    async def mark_as_read(self, message_id):
        message = await self.get_message(message_id)
        
        if message and message.recipient == self.user:
            # Mark the message as read
            message.is_read = True
            await database_sync_to_async(message.save)()

            # Notify only the sender that the message was read
            sender_channel_name = f"user_{message.sender.id}"  # Assuming you have a channel name pattern for each user
            
            await self.channel_layer.send(
                sender_channel_name,
                {
                    'type': 'read_receipt',  # Use a specific event type for read receipts
                    'message_id': message.id,
                    'is_read': message.is_read
                }
            )

    
    async def handle_edit_message(self, data):
            message_id = data.get("message_id")
            new_content = data.get("new_content")
            new_image = data.get("image")
            new_video = data.get("video")

            # Fetch the message
            message = await self.get_message(message_id)

            # Check if the message exists and if the current user is the sender
            if message and message.sender_id == self.user.id:
                # Update the message content and any media
                if new_content:
                    message.content = new_content
                
                if new_image:
                    # Decode and update image
                    image_data = base64.b64decode(new_image)
                    await database_sync_to_async(message.image.save)('image.jpg', ContentFile(image_data), save=True)
                
                if new_video:
                    # Decode and update video
                    video_data = base64.b64decode(new_video)
                    await database_sync_to_async(message.video.save)('video.mp4', ContentFile(video_data), save=True)

                # Save the message after edits
                await database_sync_to_async(message.save)()

                # Send update to the group
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'chat_edit_message',
                        'action': 'edit_message',
                        'id': message.id,  # Message ID
                        'message': message.content,  # Updated message content
                        'image': self.get_image_url(message.image),  # Updated image URL
                        'video': self.get_video_url(message.video),  # Updated video URL
                    }
                )



        

    async def handle_delete_message(self, data):
        message_id = data.get("id")
        print("message ID:", message_id)

        # Check if message ID is valid
        if not message_id:
            await self.send_json({"error": "No message ID provided for deletion."})
            return
        
        # Attempt to retrieve the message
        message = await self.get_message(message_id)

        # Check if the message exists and if the user is authorized to delete it
        if message:
            if message.sender_id == self.user.id or message.recipient_id == self.user.id:
                print(f"Deleting message ID {message_id} by user ID {self.user.id}")

                # Delete the message
                await database_sync_to_async(message.delete)()

                # Notify clients about the deletion
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "message_delete",
                        "message_id": message_id
                    }
                )
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'id': event['id'],
            'message': event['message'],
            'user_id': event['user_id'],
            'recipient_id': event['recipient_id'],
            'image': event['image'],
            'video': event['video'],
             'timestamp': event['timestamp'], 
            'is_delivered': event.get('is_delivered', False),  # Default to False if not present
            'is_read': event.get('is_read', False)  # Default to False if not present
        }))

    @staticmethod
    def get_room_name(user1_id, user2_id):
        return f"{min(user1_id, user2_id)}_{max(user1_id, user2_id)}"

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return None

    @database_sync_to_async
    def get_message(self, message_id):
        try:
            return Message.objects.get(id=message_id)
        except Message.DoesNotExist:
            return None  # Return None if the message does not exist



    @database_sync_to_async
    def save_message(self, sender, recipient, content, image, video,is_delivered=False, is_read=False):
        message = Message.objects.create(
            sender=sender,
            recipient=recipient,
            content=content,
            image=image,
            video=video,
            is_delivered=is_delivered,
            is_read=is_read
        )
        return message

    async def message_delete(self, event):
        message_id = event["message_id"]
        
        # Send message deletion event to WebSocket clients
        await self.send(text_data=json.dumps({
            "action": "message_delete",
            "message_id": message_id
        }))





    def get_token_from_query(self, query_string):
        if 'token=' in query_string:
            return query_string.split('=')[1]
        return None

    def get_image_url(self, image_field):
        if image_field and hasattr(image_field, 'url'):
            host = None
            for header in self.scope['headers']:
                if header[0].lower() == b'host':
                    host = header[1].decode('utf-8')
                    break
            if host:
                scheme = 'https' if self.scope.get('scheme') == 'https' else 'http'
                return f"{scheme}://{host}{image_field.url}"
        return None

    def get_video_url(self, video_field):
        if video_field and hasattr(video_field, 'url'):
            host = None
            for header in self.scope['headers']:
                if header[0].lower() == b'host':
                    host = header[1].decode('utf-8')
                    break
            if host:
                scheme = 'https' if self.scope.get('scheme') == 'https' else 'http'
                return f"{scheme}://{host}{video_field.url}"
        return None
    async def mark_as_delivered(self, message_id):
        message = await self.get_message(message_id)
        if message and message.recipient == self.user:
            message.is_delivered = True
            await database_sync_to_async(message.save)()
            # Notify the sender about the delivered status
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'chat_message',
                    'id': message.id,
                    'is_delivered': True
                }
            )


    
    async def handle_start_video_call(self, data):
        offer = data.get('offer')
        recipient_id = self.recipient.id

        # Send the offer to the recipient via WebSocket
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'video_call_offer',
                'offer': offer,
                'sender_id': self.user.id,
                'recipient_id': recipient_id,
                 'caller': True  # Indicate that the sender is the caller
            }
        )

        # Send call notification to the recipient
        await self.channel_layer.group_send(
            f'user_{recipient_id}',  # Group name for the recipient
            {
                 'type': 'call_accepted',
                'sender_id': self.user.id,
                'recipient_id': recipient_id,
               
            }
        )


    async def chat_edit_message(self, event):
        # Access the fields, including 'message', safely
        message_data = {
            'id': event.get('id'),
            'action': event.get('action'),
            'message': event.get('message'),  # Avoid KeyError by using .get()
            'new_content': event.get('new_content'),
            'message_id': event.get('message_id'),
            'image': event.get('image'),
            'video': event.get('video'),
        }

    # Send message data to WebSocket
        await self.send(text_data=json.dumps(message_data))


    
    async def handle_answer_video_call(self, data):
        answer = data.get('answer')
        sender_id = self.user.id

        if not self.recipient:
            print("Error: Recipient not set when answering the call!")
            return  # or handle error appropriately

        recipient_id = self.recipient.id
        print(f"Handling answer video call from {sender_id} to {recipient_id}")

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'video_call_answer',
                'answer': answer,
                'sender_id': sender_id,
                'recipient_id': recipient_id
            }
        )

   

    async def handle_end_call(self, data):
        sender_id = self.user.id
        recipient_id = self.recipient.id if self.recipient else None

        # Broadcast end call event to both participants, but only once
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'end_call',
                'sender_id': sender_id,
                'recipient_id': recipient_id,
            }
        )

    async def end_call(self, event):
        # When the backend sends the 'end_call' action, stop any further events
        print(f"End call received by backend from sender {event['sender_id']}, notifying recipient {event['recipient_id']}")

        await self.send(text_data=json.dumps({
            'action': 'end_call',
            'sender_id': event['sender_id'],
            'recipient_id': event['recipient_id'],
        }))
        
        # Optionally, you can terminate the connection or disable sending further messages
        await self.close()  # This will close the WebSocket connection


    async def handle_ice_candidate(self, data):
        candidate = data.get('candidate')

        if not self.recipient:
            print("Error: Recipient not set when sending ICE candidate!")
            return  # or handle error appropriately

        recipient_id = self.recipient.id
        print(f"Handling ICE candidate from {self.user.id} to {recipient_id}")

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'ice_candidate',
                'candidate': candidate,
                'sender_id': self.user.id,
                'recipient_id': recipient_id
            }
        )

    # Broadcast offer, answer, and ICE candidates to peers
    async def video_call_offer(self, event):
        await self.send(text_data=json.dumps({
            'action': 'video_call_offer',
            'offer': event['offer'],
            'sender_id': event['sender_id'],
            'recipient_id': event['recipient_id'],
            'caller': event.get('caller', False),  # Pass caller flag to frontend
        }))

    async def video_call_answer(self, event):
        await self.send(text_data=json.dumps({
            'action': 'video_call_answer',
            'answer': event['answer'],
            'sender_id': event['sender_id'],
            'recipient_id': event['recipient_id'],
        }))

    async def ice_candidate(self, event):
        await self.send(text_data=json.dumps({
            'action': 'ice_candidate',
            'candidate': event['candidate'],
            'sender_id': event['sender_id'],
            'recipient_id': event['recipient_id'],
        }))

    async def call_accepted(self, event):
        await self.send(text_data=json.dumps({
            'action': 'call_accepted',
            'sender_id': event['sender_id'],
            'recipient_id': event['recipient_id'],
        }))

  


# class VideoCallConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.user_id = self.scope['url_route']['kwargs']['user_id']
#         self.caller_id = self.scope['url_route']['kwargs']['caller_id']
#         sorted_ids = sorted([self.user_id, self.caller_id])
#         self.room_group_name = f"video_call_{sorted_ids[0]}_{sorted_ids[1]}"
#         print(self.room_group_name)
#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         action = data.get('action')

#         if action == 'video_call_offer':
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'send_offer',
#                     'offer': data['offer'],
#                     'recipient_id': data['recipient_id']
#                 }
#             )

#         elif action == 'video_call_answer':
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'send_answer',
#                     'answer': data['answer'],
#                     'recipient_id': data['recipient_id']
#                 }
#             )

#         elif action == 'ice_candidate':
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'send_candidate',
#                     'candidate': data['candidate'],
#                     'recipient_id': data['recipient_id']
#                 }
#             )

#         elif action == 'end_call':
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'call_ended',
#                     'sender_id': data['sender_id'],
#                     'recipient_id': data['recipient_id']
#                 }
#             )

#     async def send_offer(self, event):
#         await self.send(text_data=json.dumps({
#             'action': 'video_call_offer',
#             'offer': event['offer']
#         }))

#     async def send_answer(self, event):
#         await self.send(text_data=json.dumps({
#             'action': 'video_call_answer',
#             'answer': event['answer']
#         }))

#     async def send_candidate(self, event):
#         await self.send(text_data=json.dumps({
#             'action': 'ice_candidate',
#             'candidate': event['candidate']
#         }))

#     async def call_ended(self, event):
#         await self.send(text_data=json.dumps({
#             'action': 'end_call',
#             'sender_id': event['sender_id']
#         }))
    



class VideoCallConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.caller_id = self.scope['url_route']['kwargs']['caller_id']
        sorted_ids = sorted([self.user_id, self.caller_id])
        self.room_group_name = f"video_call_{sorted_ids[0]}_{sorted_ids[1]}"
        print(self.room_group_name)

        # Add the channel to the group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Remove the channel from the group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        recipient_id = data.get('recipient_id')

        if action == 'video_call_offer':
            await self.create_notification(recipient_id, "You have a new video call from {}".format(self.user_id))
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_offer',
                'offer': data['offer'],
                'recipient_id': recipient_id
            })

        elif action == 'video_call_answer':
            await self.create_notification(recipient_id, "Your video call has been answered by {}".format(self.caller_id))
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_answer',
                'answer': data['answer'],
                'recipient_id': recipient_id
            })

        elif action == 'ice_candidate':
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'send_candidate',
                'candidate': data['candidate'],
                'recipient_id': recipient_id
            })

        elif action == 'end_call':
            await self.create_notification(recipient_id, "The video call has ended.")
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'call_ended',
                'sender_id': self.user_id,
                'recipient_id': recipient_id
            })

    @database_sync_to_async
    def create_notification(self, recipient_id, message):
        """Creates a notification for the message recipient."""
        notification_message =  notification_message = f"You have a video call from {self.user_id}: "
        
        # Avoid self-notification
        if recipient_id != self.user_id:
            notification = Notifications_type.objects.create(
                recipient_id=recipient_id,
                sender_id=self.user_id,
                message=notification_message,
                notification_type='video_call'
            )

            # Prepare notification data
            notification_data = {
                'id': notification.id,
                'sender': {
                    'user_id': self.user_id,
                      # Add profile picture URL if needed
                },
                'message': notification_message,
                'created_at': notification.created_at.isoformat(),
                'is_read': False
            }

            # Send notification via WebSocket
            # Use 'await' to call the async method
            return self.send_notification(recipient_id, notification_data)

    async def send_notification(self, user_id, notification_data):
        """Send a notification to a user via WebSocket."""
        group_name = f"user_{user_id}_notifications"
        channel_layer = get_channel_layer()

        await self.channel_layer.group_send(
            group_name,
            {
                'type': 'send_notification',
                'notification': notification_data
            }
        )

    async def send_offer(self, event):
        await self.send(text_data=json.dumps({
            'action': 'video_call_offer',
            'offer': event['offer']
        }))

    async def send_answer(self, event):
        await self.send(text_data=json.dumps({
            'action': 'video_call_answer',
            'answer': event['answer']
        }))

    async def send_candidate(self, event):
        await self.send(text_data=json.dumps({
            'action': 'ice_candidate',
            'candidate': event['candidate']
        }))

    async def call_ended(self, event):
        await self.send(text_data=json.dumps({
            'action': 'end_call',
            'sender_id': event['sender_id']
        }))