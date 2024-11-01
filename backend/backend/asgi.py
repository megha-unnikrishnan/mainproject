

# import os
# from channels.auth import AuthMiddlewareStack
# from channels.routing import ProtocolTypeRouter, URLRouter
# from django.core.asgi import get_asgi_application
# from users.routing import websocket_urlpatterns

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": AuthMiddlewareStack(
#         URLRouter(
#             websocket_urlpatterns
#         )
#     ),
# })






import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from users.routing import websocket_urlpatterns as user_websocket_patterns
from posts.routing import websocket_urlpatterns as chat_websocket_patterns
from posts.routing import websocket_urlpatterns as chatcall_websocket_patterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')


websocket_urlpatterns = user_websocket_patterns + chat_websocket_patterns + chatcall_websocket_patterns

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})


