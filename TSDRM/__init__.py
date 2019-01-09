from __future__ import absolute_import
from .celery import app as celery_app
import pymysql
import win_unicode_console

win_unicode_console.enable()

pymysql.install_as_MySQLdb()
