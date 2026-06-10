from django.apps import AppConfig

class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.superadmin.dashboard'
    label = 'superadmin_dashboard'

    def ready(self):
        import apps.superadmin.dashboard.signals
