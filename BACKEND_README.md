# LSREMS Backend API

Django REST Framework backend for the Land Surveying & Real Estate Management System.

## Features

- ✅ User authentication with role-based access control
- ✅ Customer management
- ✅ Survey project management with status workflow
- ✅ Land title document upload/download
- ✅ Property management
- ✅ Property listings (for sale/rent)
- ✅ Transaction tracking (sales & rentals)
- ✅ RESTful API with pagination, filtering, and search
- ✅ Token-based authentication
- ✅ CORS enabled for frontend integration

## Tech Stack

- **Framework:** Django 4.2.4
- **API:** Django REST Framework 3.14.0
- **Database:** PostgreSQL (with SQLite fallback)
- **Authentication:** Token Authentication
- **File Storage:** Local file system (configurable to S3)

## Project Structure

```
lsrems_backend/
├── accounts/           # User authentication & management
├── customers/          # Customer management
├── projects/           # Survey projects, updates, land titles
├── properties/         # Properties & listings
├── transactions/       # Property transactions
├── lsrems_backend/     # Main project settings
├── media/              # Uploaded files
├── manage.py
└── requirements.txt
```

## Installation

### Prerequisites

- Python 3.8+
- PostgreSQL (optional, can use SQLite)

### Setup

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Environment Configuration:**

Create a `.env` file (optional):
```env
USE_SQLITE=True  # Set to False to use PostgreSQL
SECRET_KEY=your-secret-key-here
DEBUG=True
```

4. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create superuser:**
```bash
python manage.py createsuperuser
```

6. **Run development server:**
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
```
POST   /api/auth/login/          # Login
POST   /api/auth/logout/         # Logout
GET    /api/auth/me/             # Get current user
```

### Users
```
GET    /api/users/               # List users
POST   /api/users/               # Create user
GET    /api/users/{id}/          # Get user
PATCH  /api/users/{id}/          # Update user
DELETE /api/users/{id}/          # Delete user
```

### Customers
```
GET    /api/customers/           # List customers
POST   /api/customers/           # Create customer
GET    /api/customers/{id}/      # Get customer
PATCH  /api/customers/{id}/      # Update customer
DELETE /api/customers/{id}/      # Delete customer
```

### Survey Projects
```
GET    /api/projects/            # List projects
POST   /api/projects/            # Create project
GET    /api/projects/{id}/       # Get project
PATCH  /api/projects/{id}/       # Update project
DELETE /api/projects/{id}/       # Delete project
GET    /api/projects/{id}/updates/  # Get project updates
```

### Project Updates
```
GET    /api/project-updates/     # List updates
POST   /api/project-updates/     # Create update
```

### Land Titles
```
GET    /api/land-titles/         # List documents
POST   /api/land-titles/         # Upload document
GET    /api/land-titles/{id}/    # Get document
DELETE /api/land-titles/{id}/    # Delete document
GET    /api/land-titles/{id}/download/  # Download document
```

### Properties
```
GET    /api/properties/          # List properties
POST   /api/properties/          # Create property
GET    /api/properties/{id}/     # Get property
PATCH  /api/properties/{id}/     # Update property
DELETE /api/properties/{id}/     # Delete property
```

### Property Listings
```
GET    /api/listings/            # List listings
POST   /api/listings/            # Create listing
GET    /api/listings/{id}/       # Get listing
PATCH  /api/listings/{id}/       # Update listing
DELETE /api/listings/{id}/       # Delete listing
```

### Transactions
```
GET    /api/transactions/        # List transactions
POST   /api/transactions/        # Create transaction
GET    /api/transactions/{id}/   # Get transaction
DELETE /api/transactions/{id}/   # Delete transaction
```

## API Features

### Pagination
All list endpoints support pagination:
```
GET /api/customers/?page=2
```

### Search
Endpoints with search support:
```
GET /api/customers/?search=john
GET /api/projects/?search=downtown
GET /api/properties/?search=estate
```

### Filtering
```
GET /api/projects/?status=pending
GET /api/properties/?property_type=house&status=available
GET /api/listings/?listing_type=for_sale
GET /api/transactions/?transaction_type=sale
```

### Ordering
```
GET /api/customers/?ordering=-created_at
GET /api/properties/?ordering=property_name
```

## Authentication

The API uses Token Authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

### Login Example
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

Response:
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

## User Roles

- **admin** - Full system access
- **surveyor** - Manage assigned projects and documents
- **real_estate_manager** - Manage properties, listings, transactions
- **customer** - View own projects and properties

## Database Models

### User
- username, email, password
- role (admin, surveyor, real_estate_manager, customer)
- phone

### Customer
- name, email, phone, address

### SurveyProject
- customer, surveyor
- project_name, location
- status (pending, survey_in_progress, submitted_to_land_office, completed)

### ProjectUpdate
- project, status, notes
- updated_by, timestamp

### LandTitle
- project, document_type, document_file
- document_type (survey_map, land_title, boundary_report)

### Property
- property_name, location, size
- land_title (optional)
- property_type (land, house, commercial, apartment)
- status (available, sold, rented, reserved)

### PropertyListing
- property, listing_type, price
- listing_type (for_sale, for_rent)
- status (active, sold, rented, inactive)

### PropertyTransaction
- property, customer
- transaction_type (sale, rental)
- price, transaction_date

## Admin Panel

Access the Django admin at `http://localhost:8000/admin/`

All models are registered and can be managed through the admin interface.

## Testing

Run tests:
```bash
python manage.py test
```

## Deployment

### Production Settings

1. Set `DEBUG=False`
2. Configure `ALLOWED_HOSTS`
3. Use PostgreSQL database
4. Configure static/media file serving
5. Use environment variables for sensitive data
6. Enable HTTPS
7. Configure proper CORS settings

### Recommended Stack
- **Web Server:** Nginx
- **WSGI Server:** Gunicorn
- **Database:** PostgreSQL
- **File Storage:** AWS S3 or DigitalOcean Spaces
- **Hosting:** DigitalOcean, AWS, or Heroku

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in settings.py
- Or set `USE_SQLITE=True` in environment

### CORS Errors
- Verify frontend URL is in `CORS_ALLOWED_ORIGINS`
- Check that `corsheaders` middleware is enabled

### File Upload Issues
- Ensure `MEDIA_ROOT` directory exists and is writable
- Check file size limits in settings

## License

Proprietary - All rights reserved
