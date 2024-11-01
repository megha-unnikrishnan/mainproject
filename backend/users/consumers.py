




import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from channels.db import database_sync_to_async

User = get_user_model()

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract token from the query string
        token = self.scope['query_string'].decode().split('=')[1]  # Assumes your URL is of the form /ws/notifications/?token=<token>
        print(f"Token received: {token}")

        # Authenticate user from token
        try:
            decoded_token = AccessToken(token)  # This should be your method to decode the JWT
            user_id = decoded_token['user_id']

            # Get the user asynchronously
            self.user = await self.get_user(user_id)

            if self.user.is_authenticated:
                self.group_name = f"user_{self.user.id}_notifications"
                await self.channel_layer.group_add(self.group_name, self.channel_name)
                await self.accept()
                print(f"WebSocket connection accepted for user: {self.user.id}")
            else:
                print("User is not authenticated. Closing connection.")
                await self.close()
        except Exception as e:
            print(f"Authentication error: {e}")
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass  # Handle any incoming messages if necessary

    async def send_notification(self, event):
        notification = event['notification']
        await self.send(text_data=json.dumps(notification))

    @database_sync_to_async
    def get_user(self, user_id):
        # Get the user by ID
        return User.objects.get(id=user_id)  # Ensure this returns a User object or None

