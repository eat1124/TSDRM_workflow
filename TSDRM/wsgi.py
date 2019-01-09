"""
WSGI config for cloudDR project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/howto/deployment/wsgi/
"""
import sys

sys.path.append('/var/www/html/cloudDR')

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cloudDR.settings")


application = get_wsgi_application()
