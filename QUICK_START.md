# 🚀 LSREMS Quick Start Guide

## Current Status

✅ **Backend:** Running at http://127.0.0.1:8000
✅ **Database:** Migrated with admin user
✅ **API:** All endpoints operational
⏳ **Frontend:** Ready to start (needs npm install)

## Step 1: Backend is Already Running! ✅

The Django backend is live at:
- **API Base:** http://127.0.0.1:8000/api
- **Admin Panel:** http://127.0.0.1:8000/admin

**Test it:**
```bash
# Login test
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@lsrems.com\",\"password\":\"admin123\"}"
```

**Admin Credentials:**
- Username: `admin`
- Password: `admin123`
- Email: `admin@lsrems.com`

## Step 2: Start the Frontend

### Option A: If you have disk space

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at: http://localhost:5173

### Option B: If disk space is limited

1. Free up some disk space
2. Then run the commands above

## Step 3: Login to the System

1. Open http://localhost:5173 in your browser
2. Login with:
   - Email: `admin@lsrems.com`
   - Password: `admin123`

## Step 4: Explore the Features

### Dashboard
- View system statistics
- Recent projects and transactions
- Quick actions

### Customers
- Click "Add Customer" to create a new customer
- Fill in: Name, Email, Phone, Address
- View customer cards with contact info

### Survey Projects
- Click "New Project" to create a survey project
- Select customer and surveyor
- Track project status workflow
- View project documents

### Land Titles (Documents)
- Click "Upload Document" to add survey documents
- Select project and document type
- Upload PDF, JPG, or PNG files
- Download documents anytime

### Properties
- Click "Add Property" to register a property
- Enter property details
- Link to land title (optional)
- Track property status

### Property Listings
- Click "Create Listing" to list a property
- Choose "For Sale" or "For Rent"
- Set price
- Track listing status

### Transactions
- Click "New Transaction" to record a sale or rental
- Select property and customer
- Enter transaction details
- View transaction history

### Reports
- Generate various reports
- View recent reports
- Schedule automated reports

## API Endpoints Reference

### Authentication
```bash
# Login
POST /api/auth/login/
Body: {"email": "admin@lsrems.com", "password": "admin123"}

# Logout
POST /api/auth/logout/
Headers: Authorization: Bearer <token>

# Get current user
GET /api/auth/me/
Headers: Authorization: Bearer <token>
```

### Customers
```bash
# List customers
GET /api/customers/
Headers: Authorization: Bearer <token>

# Create customer
POST /api/customers/
Headers: Authorization: Bearer <token>
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

### Projects
```bash
# List projects
GET /api/projects/
Headers: Authorization: Bearer <token>

# Create project
POST /api/projects/
Headers: Authorization: Bearer <token>
Body: {
  "customer_id": 1,
  "surveyor_id": 1,
  "project_name": "Downtown Survey",
  "location": "123 Main St",
  "status": "pending"
}
```

### Properties
```bash
# List properties
GET /api/properties/
Headers: Authorization: Bearer <token>

# Create property
POST /api/properties/
Headers: Authorization: Bearer <token>
Body: {
  "property_name": "Sunset Estate",
  "location": "California",
  "size": "5000 sqft",
  "property_type": "house",
  "status": "available"
}
```

## Troubleshooting

### Backend not responding?
```bash
# Check if server is running
curl http://127.0.0.1:8000/api/auth/login/

# If not, restart it
python manage.py runserver
```

### Frontend can't connect?
1. Check `.env` file in frontend folder
2. Verify `VITE_API_BASE_URL=http://127.0.0.1:8000/api`
3. Restart frontend dev server

### CORS errors?
The backend is already configured for CORS. If you still see errors:
1. Check `lsrems_backend/settings.py`
2. Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL

### Login fails?
1. Verify backend is running
2. Check credentials: `admin@lsrems.com` / `admin123`
3. Check browser console for errors

## Next Steps

1. ✅ Backend running
2. ⏳ Start frontend
3. ⏳ Login to system
4. ⏳ Create sample data:
   - Add 2-3 customers
   - Create 2-3 survey projects
   - Upload some documents
   - Register properties
   - Create listings
   - Record transactions

5. ⏳ Test all features
6. ⏳ Customize as needed

## Useful Commands

### Backend
```bash
# Create superuser
python manage.py createsuperuser

# Make migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Run server
python manage.py runserver

# Access Django shell
python manage.py shell
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Default Test Data

**Admin User:**
- Username: `admin`
- Email: `admin@lsrems.com`
- Password: `admin123`
- Role: `admin`

You can create more users through:
1. Django admin panel: http://127.0.0.1:8000/admin
2. API endpoint: POST /api/users/

## Support

- **Backend API Docs:** `BACKEND_README.md`
- **Frontend Docs:** `frontend/README.md`
- **Deployment Guide:** `DEPLOYMENT_GUIDE.md`
- **Full Project Overview:** `PROJECT_COMPLETE.md`

## Success! 🎉

Once both servers are running:
- Backend: http://127.0.0.1:8000
- Frontend: http://localhost:5173

You have a fully functional Land Surveying & Real Estate Management System!

Happy coding! 🚀
