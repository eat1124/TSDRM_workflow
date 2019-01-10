# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2019-01-09 16:37
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('faconstor', '0018_process_level'),
    ]

    operations = [
        migrations.AlterField(
            model_name='process',
            name='level',
            field=models.IntegerField(choices=[(1, '主流程'), (2, '子流程')], default=None, verbose_name='流程级别'),
        ),
    ]
