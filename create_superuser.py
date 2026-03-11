#!/usr/bin/env python
"""
Script to create a superuser for development
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lsrems_backend.settings')
os.environ['USE_SQLITE'] = 'True'
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@lsrems.com',
        password='admin123',
        role='admin',
        first_name='Admin',
        last_name='User'
    )
    print("✅ Superuser created successfully!")
    print("Username: admin")
    print("Password: admin123")
    print("Email: admin@lsrems.com")
else:
    print("⚠️  Superuser already exists")
