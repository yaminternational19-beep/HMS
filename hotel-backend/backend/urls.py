"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/', include('apps.testing.urls')),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/rooms/', include('apps.superadmin.rooms.urls')),
    path('api/shifts/', include('apps.superadmin.shifts.urls')),
    path('api/staff/', include('apps.superadmin.staff.urls')),
    path('api/frontoffice/rooms/', include('apps.frontoffice.rooms.urls')),
    path('api/frontoffice/bookings/', include('apps.frontoffice.booking.urls')),
    path('api/frontoffice/dashboard/', include('apps.frontoffice.dashboard.urls')),
]

# Serve uploaded media files during development (Vite/React accessible)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Global custom error handlers for API uniformity
handler404 = 'core.utils.exception_handler.handler404'
handler500 = 'core.utils.exception_handler.handler500'
