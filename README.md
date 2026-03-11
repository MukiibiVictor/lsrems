# 🏢 LSREMS - Land Surveying & Real Estate Management System

A comprehensive full-stack web application for managing land surveying operations and real estate business processes.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Backend](https://img.shields.io/badge/backend-Django%204.2-success)
![Frontend](https://img.shields.io/badge/frontend-React%2018-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Overview

LSREMS is a modern, full-featured management system designed for surveying companies and real estate businesses. It provides tools for managing survey projects, land title documents, property listings, customer relationships, and transactions.

## ✨ Features

### Core Modules
- 🔐 **User Management** - Role-based access control (Admin, Surveyor, Real Estate Manager, Customer)
- 👥 **Customer Management** - Comprehensive client relationship management
- 📋 **Survey Project Management** - Track projects through complete workflow
- 📄 **Land Title Documents** - Upload, store, and manage survey documents
- 🏠 **Property Management** - Manage real estate inventory
- 💰 **Property Listings** - List properties for sale or rent
- 💳 **Transaction Management** - Track sales and rental agreements
- 📊 **Dashboard & Reports** - Real-time statistics and reporting

### Technical Features
- RESTful API with 40+ endpoints
- Token-based authentication
- File upload/download
- Search, filtering, and pagination
- Responsive modern UI
- Real-time data updates
- Form validation
- Role-based permissions

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 4.2.4
- **API:** Django REST Framework 3.14.0
- **Database:** PostgreSQL / SQLite
- **Authentication:** Token Authentication
- **File Storage:** Local / AWS S3

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** React Router v7
- **UI Library:** shadcn/ui (Radix UI + Tailwind CSS)
- **State Management:** React Context API
- **HTTP Client:** Fetch API
- **Build Tool:** Vite

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL (optional, can use SQLite)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/lsrems.git
cd lsrems

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variable for SQLite (optional)
export USE_SQLITE=True  # On Windows: set USE_SQLITE=True

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create sample data (optional)
python create_sample_data.py

# Run development server
python manage.py runserver
```

Backend will be available at http://127.0.0.1:8000

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at http://localhost:5173

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get started in 5 minutes
- **[Backend API Documentation](BACKEND_README.md)** - Complete API reference
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Project Overview](PROJECT_COMPLETE.md)** - Detailed project documentation

## 🔑 Default Credentials

After running `create_sample_data.py`:

**Admin User:**
- Email: `admin@lsrems.com`
- Password: `admin123`

**Surveyor User:**
- Email: `surveyor@lsrems.com`
- Password: `surveyor123`

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Survey Projects
![Projects](docs/screenshots/projects.png)

### Property Listings
![Listings](docs/screenshots/listings.png)

## 🏗️ Project Structure

```
lsrems/
├── accounts/              # User authentication & management
├── customers/             # Customer management
├── projects/              # Survey projects & land titles
├── properties/            # Properties & listings
├── transactions/          # Transaction management
├── lsrems_backend/        # Django settings
├── frontend/              # React frontend
│   ├── src/
│   │   ├── app/          # Pages & components
│   │   ├── services/     # API services
│   │   ├── contexts/     # React contexts
│   │   └── types/        # TypeScript types
│   └── package.json
├── media/                 # Uploaded files
├── manage.py
├── requirements.txt
└── README.md
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login/          # Login
POST   /api/auth/logout/         # Logout
GET    /api/auth/me/             # Get current user
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
```

[See full API documentation](BACKEND_README.md)

## 🧪 Testing

### Backend Tests
```bash
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🚢 Deployment

### Using Docker
```bash
docker-compose up -d
```

### Manual Deployment
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Django REST Framework
- React and the React community
- shadcn/ui for beautiful components
- All contributors and supporters

## 📞 Support

For support, email support@lsrems.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] GIS mapping integration
- [ ] Government land registry integration
- [ ] Payment gateway integration
- [ ] Advanced analytics and reporting
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Dark mode

## 📊 Project Status

- ✅ Backend: Complete and operational
- ✅ Frontend: Complete and ready
- ✅ API Integration: Configured
- ✅ Documentation: Comprehensive
- ✅ Sample Data: Available
- 🚀 Status: Production Ready

---

**Built with ❤️ for the surveying and real estate industry**
