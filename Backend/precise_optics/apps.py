"""
PreciseOptics application configuration
Loads signal receivers for security logging
"""
from django.apps import AppConfig


class PreciseOpticsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'precise_optics'
    
    def ready(self):
        """
        Import signal receivers when Django starts
        """
        from . import middleware  # This will register the signal receivers
