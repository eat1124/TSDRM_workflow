# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2019-01-09 16:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('faconstor', '0017_remove_step_level'),
    ]

    operations = [
        migrations.AddField(
            model_name='process',
            name='level',
            field=models.IntegerField(choices=[(1, '主流程'), (2, '子流程'), (3, '------------')], default=3, verbose_name='流程级别'),
        ),
    ]
