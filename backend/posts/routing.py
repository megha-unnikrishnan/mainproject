from django.urls import re_path,path
from . import consumers

websocket_urlpatterns = [
    re_path(r'chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
    path('ws/video-call/<int:user_id>/<int:caller_id>/', consumers.VideoCallConsumer.as_asgi()),
    # path("ws/video-call/<str:room_name>/", consumers.VideoCallConsumer.as_asgi()),
    # re_path(r'ws/chat/(?P<room_name>\d+)/$', consumers.ChatConsumer.as_asgi()),
     
    # Add more WebSocket routes here
]
