#!/usr/bin/env python
"""
Script to create sample data for testing - DISABLED BY DEFAULT
Run with --create-sample flag to actually create sample data
"""
import os
import sys
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lsrems_backend.settings')
os.environ['USE_SQLITE'] = 'True'
django.setup()

from django.contrib.auth import get_user_model
from customers.models import Customer
from projects.models import SurveyProject, ProjectUpdate
from properties.models import Property, PropertyListing
from transactions.models import PropertyTransaction

User = get_user_model()

def create_sample_data():
    print("🚀 Creating sample data...")
    
    # Get admin user
    try:
        admin = User.objects.get(username='admin')
    except User.DoesNotExist:
        print("❌ Admin user not found. Please create admin user first.")
        return
    
    # Create surveyor user
    surveyor, created = User.objects.get_or_create(
        username='surveyor1',
        defaults={
            'email': 'surveyor@lsrems.com',
            'first_name': 'Sarah',
            'last_name': 'Williams',
            'role': 'surveyor'
        }
    )
    if created:
        surveyor.set_password('surveyor123')
        surveyor.save()
        print("✅ Created surveyor user")
    
    # Create customers
    customers_data = [
        {
            'name': 'John Anderson',
            'email': 'john.anderson@email.com',
            'phone': '+1 (555) 123-4567',
            'address': '123 Main Street, New York, NY 10001'
        },
        {
            'name': 'Emily Chen',
            'email': 'emily.chen@email.com',
            'phone': '+1 (555) 234-5678',
            'address': '456 Oak Avenue, Los Angeles, CA 90001'
        },
        {
            'name': 'Robert Davis',
            'email': 'robert.davis@email.com',
            'phone': '+1 (555) 345-6789',
            'address': '789 Pine Road, Chicago, IL 60601'
        }
    ]
    
    customers = []
    for data in customers_data:
        customer, created = Customer.objects.get_or_create(
            email=data['email'],
            defaults=data
        )
        customers.append(customer)
        if created:
            print(f"✅ Created customer: {customer.name}")
    
    # Create survey projects
    projects_data = [
        {
            'customer': customers[0],
            'surveyor': surveyor,
            'project_name': 'Downtown Plot Survey',
            'location': '123 Main St, New York',
            'status': 'survey_in_progress'
        },
        {
            'customer': customers[1],
            'surveyor': surveyor,
            'project_name': 'Residential Property Survey',
            'location': '456 Oak Ave, Los Angeles',
            'status': 'pending'
        },
        {
            'customer': customers[2],
            'surveyor': surveyor,
            'project_name': 'Subdivision Survey',
            'location': '789 Pine Rd, Chicago',
            'status': 'completed'
        }
    ]
    
    projects = []
    for data in projects_data:
        project, created = SurveyProject.objects.get_or_create(
            project_name=data['project_name'],
            defaults=data
        )
        projects.append(project)
        if created:
            print(f"✅ Created project: {project.project_name}")
    
    # Create properties
    properties_data = [
        {
            'property_name': 'Sunset Valley Estate',
            'location': 'Arizona, Phoenix',
            'size': '5,000 sqft',
            'property_type': 'land',
            'status': 'available'
        },
        {
            'property_name': 'Oceanview Heights',
            'location': 'California, Malibu',
            'size': '3,500 sqft',
            'property_type': 'house',
            'status': 'available'
        },
        {
            'property_name': 'Downtown Office Tower',
            'location': 'New York, Manhattan',
            'size': '15,000 sqft',
            'property_type': 'commercial',
            'status': 'sold'
        },
        {
            'property_name': 'Riverside Apartments',
            'location': 'Texas, Austin',
            'size': '2,200 sqft',
            'property_type': 'apartment',
            'status': 'rented'
        }
    ]
    
    properties = []
    for data in properties_data:
        prop, created = Property.objects.get_or_create(
            property_name=data['property_name'],
            defaults=data
        )
        properties.append(prop)
        if created:
            print(f"✅ Created property: {prop.property_name}")
    
    # Create property listings
    listings_data = [
        {
            'property': properties[0],
            'listing_type': 'for_sale',
            'price': 2500000,
            'status': 'active'
        },
        {
            'property': properties[1],
            'listing_type': 'for_sale',
            'price': 3800000,
            'status': 'active'
        },
        {
            'property': properties[3],
            'listing_type': 'for_rent',
            'price': 3500,
            'status': 'rented'
        }
    ]
    
    for data in listings_data:
        listing, created = PropertyListing.objects.get_or_create(
            property=data['property'],
            listing_type=data['listing_type'],
            defaults=data
        )
        if created:
            print(f"✅ Created listing: {listing.property.property_name}")
    
    # Create transactions
    transactions_data = [
        {
            'property': properties[2],
            'customer': customers[0],
            'transaction_type': 'sale',
            'price': 2500000,
            'transaction_date': date.today() - timedelta(days=10)
        },
        {
            'property': properties[3],
            'customer': customers[1],
            'transaction_type': 'rental',
            'price': 3500,
            'transaction_date': date.today() - timedelta(days=5)
        }
    ]
    
    for data in transactions_data:
        transaction, created = PropertyTransaction.objects.get_or_create(
            property=data['property'],
            customer=data['customer'],
            transaction_type=data['transaction_type'],
            defaults=data
        )
        if created:
            print(f"✅ Created transaction: {transaction.property.property_name}")
    
    print("\n🎉 Sample data created successfully!")
    print("\n📊 Summary:")
    print(f"   - Users: {User.objects.count()}")
    print(f"   - Customers: {Customer.objects.count()}")
    print(f"   - Projects: {SurveyProject.objects.count()}")
    print(f"   - Properties: {Property.objects.count()}")
    print(f"   - Listings: {PropertyListing.objects.count()}")
    print(f"   - Transactions: {PropertyTransaction.objects.count()}")
    print("\n✅ You can now test the system with real data!")

def clear_sample_data():
    print("🧹 Clearing all sample data...")
    
    # Delete in reverse order to avoid foreign key constraints
    PropertyTransaction.objects.all().delete()
    PropertyListing.objects.all().delete()
    Property.objects.all().delete()
    ProjectUpdate.objects.all().delete()
    SurveyProject.objects.all().delete()
    Customer.objects.all().delete()
    
    # Delete sample users (keep admin)
    User.objects.exclude(username='admin').delete()
    
    print("✅ All sample data cleared!")
    print("📊 Current counts:")
    print(f"   - Users: {User.objects.count()}")
    print(f"   - Customers: {Customer.objects.count()}")
    print(f"   - Projects: {SurveyProject.objects.count()}")
    print(f"   - Properties: {Property.objects.count()}")
    print(f"   - Listings: {PropertyListing.objects.count()}")
    print(f"   - Transactions: {PropertyTransaction.objects.count()}")

if __name__ == '__main__':
    if '--create-sample' in sys.argv:
        create_sample_data()
    elif '--clear-data' in sys.argv:
        clear_sample_data()
    else:
        print("📋 Sample Data Management Script")
        print("\nOptions:")
        print("  --create-sample  Create sample data for testing")
        print("  --clear-data     Remove all sample data")
        print("\nExample:")
        print("  python create_sample_data.py --create-sample")
        print("  python create_sample_data.py --clear-data")
        print("\n⚠️  By default, no sample data is created.")
        print("    This allows you to start with a clean system.")
