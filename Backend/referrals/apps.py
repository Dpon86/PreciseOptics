from django.apps import AppConfig


class ReferralsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'referrals'
    verbose_name = 'Referral Management'
    
    def ready(self):
        """Import signals when app is ready"""
        # Import signals here if we add any
        pass
