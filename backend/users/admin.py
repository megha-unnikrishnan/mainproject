from django.contrib import admin
from .models import CustomUser,Follow,Notifications_type,ActivityLog
admin.site.register(CustomUser)
admin.site.register(Follow)
# admin.site.register(Notifications)
admin.site.register(Notifications_type)
admin.site.register(ActivityLog)

# Register your models here.
