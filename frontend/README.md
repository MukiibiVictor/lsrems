# LSREMS Frontend

Land Surveying & Real Estate Management System - Frontend Application

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Routing:** React Router v7
- **UI Components:** shadcn/ui (Radix UI + Tailwind CSS)
- **Icons:** Lucide React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4
- **Notifications:** Sonner (toast)

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── forms/          # Reusable form components
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── MainLayout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/              # Page components
│   │   ├── App.tsx
│   │   └── routes.ts
│   ├── services/               # API service layer
│   ├── contexts/               # React contexts
│   ├── hooks/                  # Custom hooks
│   ├── types/                  # TypeScript types
│   ├── styles/                 # Global styles
│   └── main.tsx
├── .env                        # Environment variables
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
pnpm build
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Features Implemented

### Core Modules

1. **Authentication & Authorization**
   - Login/logout functionality
   - Role-based access control (Admin, Surveyor, Real Estate Manager, Customer)
   - Protected routes
   - Permission-based UI rendering

2. **Customer Management**
   - Create, view, update customers
   - Customer profile cards
   - Search and filter
   - Link to projects and properties

3. **Survey Project Management**
   - Create and manage survey projects
   - Assign surveyors to projects
   - Project status workflow (Pending → Survey In Progress → Submitted to Land Office → Completed)
   - Link projects to customers
   - Track project documents

4. **Land Title Documents** ✨ NEW
   - Upload survey maps, land titles, boundary reports
   - Link documents to projects
   - Download documents
   - Document type filtering
   - Documents grouped by project

5. **Property Management**
   - Register properties
   - Property types (Land, House, Commercial, Apartment)
   - Link properties to land titles
   - Property status tracking
   - Type and status filtering

6. **Property Listings** ✨ NEW
   - Create listings for sale or rent
   - Price management
   - Listing status (Active, Sold, Rented)
   - View tracking
   - Separate from property inventory

7. **Transaction Management**
   - Record property sales
   - Record rental agreements
   - Link transactions to customers and properties
   - Transaction history
   - Revenue tracking

8. **Dashboard & Reports**
   - System overview statistics
   - Recent projects and transactions
   - Quick actions
   - Report generation

## User Roles & Permissions

### Admin
- Full access to all features
- Manage users, customers, projects, properties, listings, transactions
- View all reports

### Surveyor
- View assigned survey projects
- Update project progress
- Upload survey documents
- View project history

### Real Estate Manager
- Manage property listings
- Manage properties
- Track sales and rentals
- Manage customers
- View reports

### Customer
- View own survey projects
- View own properties
- View transaction history

## API Integration

All pages are ready for API integration. The service layer is complete with:

- Authentication service
- Customer service
- Project service
- Land title service
- Property service
- Listing service
- Transaction service
- Dashboard service

### Example API Usage

```typescript
import { customerService } from '../services';

// Get all customers
const customers = await customerService.getAll({ search: 'John' });

// Create customer
const newCustomer = await customerService.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  address: '123 Main St'
});

// Update customer
await customerService.update(1, { phone: '+0987654321' });

// Delete customer
await customerService.delete(1);
```

## Form Components

Reusable form components with validation:

- **CustomerForm** - Customer creation/editing
- **ProjectForm** - Survey project creation/editing
- **PropertyForm** - Property registration/editing
- **TransactionForm** - Transaction recording

All forms include:
- Field validation
- Error messages
- Loading states
- Cancel/submit actions

## Next Steps

### Integration Tasks

1. **Connect to Backend API**
   - Replace mock data with actual API calls
   - Implement data fetching with loading states
   - Add error handling and retry logic

2. **Implement Search & Filters**
   - Connect search inputs to API
   - Add debouncing for search
   - Implement pagination

3. **Add Detail Views**
   - Create detail pages for each entity
   - Show related data
   - Add edit/delete actions

4. **Enhance Dashboard**
   - Real-time statistics
   - Charts and graphs
   - Activity feed

5. **Role-Based UI**
   - Apply permission checks
   - Hide/show features based on role
   - Role-specific dashboards

### Future Enhancements

- File preview for documents
- Bulk operations
- Advanced filtering
- Export to PDF/Excel
- Email notifications
- Activity logs
- Mobile app
- Dark mode

## Development Guidelines

### Adding a New Page

1. Create page component in `src/app/pages/`
2. Add route in `src/app/routes.ts`
3. Add navigation link in `MainLayout.tsx`
4. Create service if needed in `src/services/`
5. Add types in `src/types/index.ts`

### Adding a New Form

1. Create form component in `src/app/components/forms/`
2. Define form data interface
3. Add validation logic
4. Include in parent page with dialog

### Using Permissions

```typescript
import { usePermissions } from '../hooks/usePermissions';

function MyComponent() {
  const { canManageCustomers, userRole } = usePermissions();

  return (
    <>
      {canManageCustomers && (
        <Button>Add Customer</Button>
      )}
    </>
  );
}
```

## Troubleshooting

### API Connection Issues

- Verify backend is running on `http://localhost:8000`
- Check `.env` file has correct `VITE_API_BASE_URL`
- Check browser console for CORS errors

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## License

Proprietary - All rights reserved
