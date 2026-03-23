import { useState } from "react";
import { HelpCircle, Search, Book, MessageCircle, Phone, Mail, ExternalLink, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { WhatsAppContact } from "./WhatsAppContact";

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  articles: HelpArticle[];
}

interface HelpCenterProps {
  className?: string;
}

export function HelpCenter({ className = "" }: HelpCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      description: 'Learn the basics of using LSREMS',
      icon: '🚀',
      articles: [
        {
          id: '1',
          title: 'How to Login to LSREMS',
          content: `
# How to Login to LSREMS

## Step 1: Access the Login Page
1. Open your web browser
2. Navigate to the LSREMS application URL
3. Click on "Sign In" button

## Step 2: Enter Your Credentials
1. Enter your email address
2. Enter your password
3. Click "Sign In"

## Step 3: Dashboard Access
After successful login, you'll be redirected to your dashboard based on your role:
- **Admin**: Full system dashboard
- **Surveyor**: Project management dashboard
- **Real Estate Manager**: Property management dashboard
- **Customer**: Customer portal

## Troubleshooting
- **Forgot Password**: Contact your administrator
- **Account Locked**: Contact support via WhatsApp
- **Login Issues**: Check your internet connection

## Need Help?
Contact the developer via WhatsApp for immediate assistance.
          `,
          category: 'getting-started',
          tags: ['login', 'authentication', 'access'],
          lastUpdated: '2026-03-21'
        },
        {
          id: '2',
          title: 'Understanding User Roles',
          content: `
# Understanding User Roles in LSREMS

## Admin Role
- **Full System Access**: Manage all aspects of the system
- **User Management**: Create, edit, and delete user accounts
- **System Settings**: Configure system preferences
- **Reports**: Access all reports and analytics

## Surveyor Role
- **Project Management**: Manage assigned survey projects
- **Document Upload**: Upload survey maps and reports
- **Status Updates**: Update project progress
- **Customer Communication**: Interact with project customers

## Real Estate Manager Role
- **Property Management**: Manage property inventory
- **Listings**: Create and manage property listings
- **Transactions**: Record sales and rental transactions
- **Customer Relations**: Manage customer relationships

## Customer Role
- **View Projects**: See assigned survey projects
- **Track Progress**: Monitor project status
- **Download Documents**: Access completed survey documents
- **Profile Management**: Update personal information

## Role-Based Navigation
Each role sees different menu items and has access to different features based on their permissions.
          `,
          category: 'getting-started',
          tags: ['roles', 'permissions', 'access'],
          lastUpdated: '2026-03-21'
        }
      ]
    },
    {
      id: 'projects',
      name: 'Survey Projects',
      description: 'Managing land surveying projects',
      icon: '📋',
      articles: [
        {
          id: '3',
          title: 'Creating a New Survey Project',
          content: `
# Creating a New Survey Project

## Prerequisites
- You must have Surveyor or Admin role
- Customer must be registered in the system

## Step-by-Step Guide

### Step 1: Navigate to Projects
1. Click on "Projects" in the sidebar
2. Click the "New Project" button

### Step 2: Fill Project Details
1. **Project Name**: Enter a descriptive name
2. **Customer**: Select from existing customers
3. **Surveyor**: Assign a surveyor (Admin only)
4. **Location**: Enter the survey location
5. **Status**: Usually starts as "Pending"

### Step 3: Save and Manage
1. Click "Create Project"
2. Project will appear in the projects list
3. You can now add updates and documents

## Project Status Workflow
1. **Pending**: Project created, awaiting start
2. **Survey In Progress**: Active surveying work
3. **Submitted to Land Office**: Documents submitted
4. **Completed**: Project finished

## Best Practices
- Use clear, descriptive project names
- Include GPS coordinates in location if available
- Regular status updates keep customers informed
- Upload documents as soon as available
          `,
          category: 'projects',
          tags: ['create', 'project', 'survey', 'workflow'],
          lastUpdated: '2026-03-21'
        },
        {
          id: '4',
          title: 'Uploading Survey Documents',
          content: `
# Uploading Survey Documents

## Document Types
LSREMS supports three types of survey documents:
- **Survey Maps**: Detailed property boundary maps
- **Land Titles**: Official land ownership documents
- **Boundary Reports**: Technical survey reports

## Upload Process

### Step 1: Access Project
1. Go to "Projects" page
2. Click on the project you want to add documents to
3. Click "View Details" or "Edit"

### Step 2: Upload Documents
1. Click "Upload Document" button
2. Select document type from dropdown
3. Choose file from your computer
4. Add description (optional)
5. Click "Upload"

## File Requirements
- **Supported Formats**: PDF, JPG, PNG, TIFF
- **Maximum Size**: 10MB per file
- **Naming Convention**: Use descriptive filenames

## Document Management
- View uploaded documents in project details
- Download documents for sharing
- Delete outdated documents (Admin only)
- Version control for updated documents

## Security
- All documents are securely stored
- Access controlled by user roles
- Audit trail for document changes
          `,
          category: 'projects',
          tags: ['documents', 'upload', 'files', 'survey'],
          lastUpdated: '2026-03-21'
        }
      ]
    },
    {
      id: 'properties',
      name: 'Property Management',
      description: 'Managing property inventory and listings',
      icon: '🏠',
      articles: [
        {
          id: '5',
          title: 'Adding Properties to Inventory',
          content: `
# Adding Properties to Inventory

## Overview
The property inventory is separate from listings. Properties are your available assets that can later be listed for sale or rent.

## Adding a New Property

### Step 1: Navigate to Properties
1. Click "Properties" in the sidebar
2. Click "Add Property" button

### Step 2: Property Details
1. **Property Name**: Unique identifier
2. **Location**: Full address or area description
3. **Property Type**: Land, House, Commercial, or Apartment
4. **Size**: Area in square feet or acres
5. **Status**: Available, Sold, Rented, or Reserved
6. **Land Title**: Link to survey documents (optional)

### Step 3: Save Property
1. Review all information
2. Click "Create Property"
3. Property appears in inventory

## Property Types Explained
- **Land**: Undeveloped plots or agricultural land
- **House**: Residential properties
- **Commercial**: Office buildings, shops, warehouses
- **Apartment**: Multi-unit residential buildings

## Property Status
- **Available**: Ready for listing or sale
- **Sold**: Property has been sold
- **Rented**: Property is currently rented
- **Reserved**: Property is on hold

## Linking to Survey Projects
Properties can be linked to completed survey projects to maintain documentation chain.
          `,
          category: 'properties',
          tags: ['property', 'inventory', 'add', 'management'],
          lastUpdated: '2026-03-21'
        }
      ]
    },
    {
      id: 'transactions',
      name: 'Transactions',
      description: 'Recording sales and rental transactions',
      icon: '💰',
      articles: [
        {
          id: '6',
          title: 'Recording Property Transactions',
          content: `
# Recording Property Transactions

## Transaction Types
LSREMS supports two types of property transactions:
- **Sales**: One-time property purchases
- **Rentals**: Recurring property leases

## Recording a Sale Transaction

### Step 1: Access Transactions
1. Go to "Transactions" page
2. Click "New Transaction"

### Step 2: Transaction Details
1. **Property**: Select from available properties
2. **Customer**: Choose the buyer
3. **Transaction Type**: Select "Sale"
4. **Price**: Enter sale amount
5. **Transaction Date**: Date of completion

### Step 3: Complete Transaction
1. Review all details
2. Click "Record Transaction"
3. Property status automatically updates to "Sold"

## Recording a Rental Transaction

### Similar Process
1. Select "Rental" as transaction type
2. Enter monthly/yearly rental amount
3. Property status updates to "Rented"

## Transaction History
- View all transactions in chronological order
- Filter by type, customer, or property
- Export transaction reports
- Track revenue and performance

## Best Practices
- Record transactions immediately after completion
- Include all relevant details
- Keep supporting documents
- Regular reconciliation with financial records
          `,
          category: 'transactions',
          tags: ['transactions', 'sales', 'rentals', 'recording'],
          lastUpdated: '2026-03-21'
        }
      ]
    },
    {
      id: 'reports',
      name: 'Reports & Analytics',
      description: 'Generating and downloading system reports',
      icon: '📊',
      articles: [
        {
          id: '7',
          title: 'Generating System Reports',
          content: `
# Generating System Reports

## Available Report Types
LSREMS provides several types of reports:
- **Revenue Reports**: Financial performance analysis
- **Project Status Reports**: Survey project summaries
- **Property Inventory**: Complete property listings
- **Customer Reports**: Customer demographics and activity

## Generating Reports

### Step 1: Access Reports
1. Navigate to "Reports" page
2. Select report type from available options

### Step 2: Configure Report
1. Choose date range (if applicable)
2. Select filters (customer, property type, etc.)
3. Choose format (CSV, PDF)

### Step 3: Generate and Download
1. Click "Generate Report"
2. Wait for processing
3. Download automatically starts
4. Save file to desired location

## Scheduled Reports
- Set up automatic weekly/monthly reports
- Email delivery to specified recipients
- Customizable report content
- Archive of historical reports

## Report Customization
- Filter by date ranges
- Include/exclude specific data
- Custom formatting options
- Add company branding

## Using Report Data
- Import into Excel for analysis
- Share with stakeholders
- Track business performance
- Make data-driven decisions
          `,
          category: 'reports',
          tags: ['reports', 'analytics', 'download', 'data'],
          lastUpdated: '2026-03-21'
        }
      ]
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: '🔧',
      articles: [
        {
          id: '8',
          title: 'Common Issues and Solutions',
          content: `
# Common Issues and Solutions

## Login Problems

### Issue: Cannot Login
**Symptoms**: Error message when trying to login
**Solutions**:
1. Check email and password spelling
2. Ensure Caps Lock is off
3. Clear browser cache and cookies
4. Try different browser
5. Contact administrator if account is locked

### Issue: Forgot Password
**Solution**: Contact your system administrator to reset password

## Performance Issues

### Issue: Slow Loading
**Solutions**:
1. Check internet connection
2. Close unnecessary browser tabs
3. Clear browser cache
4. Restart browser
5. Contact support if problem persists

### Issue: Page Not Loading
**Solutions**:
1. Refresh the page (F5)
2. Check if server is running
3. Verify URL is correct
4. Try accessing from different device

## File Upload Issues

### Issue: Cannot Upload Documents
**Solutions**:
1. Check file size (max 10MB)
2. Verify file format (PDF, JPG, PNG, TIFF)
3. Ensure stable internet connection
4. Try uploading smaller files first

### Issue: Upload Fails
**Solutions**:
1. Check available storage space
2. Rename file (remove special characters)
3. Try different file format
4. Contact support for server issues

## Data Issues

### Issue: Missing Data
**Solutions**:
1. Check user permissions
2. Verify correct date range
3. Clear browser cache
4. Contact administrator

### Issue: Incorrect Information
**Solutions**:
1. Verify data entry
2. Check for typos
3. Update information if needed
4. Contact support for system errors

## Getting Additional Help
If these solutions don't resolve your issue:
1. Contact developer via WhatsApp
2. Provide detailed description of problem
3. Include screenshots if possible
4. Mention your user role and browser
          `,
          category: 'troubleshooting',
          tags: ['troubleshooting', 'issues', 'solutions', 'help'],
          lastUpdated: '2026-03-21'
        }
      ]
    }
  ];

  const filteredArticles = helpCategories
    .flatMap(category => category.articles)
    .filter(article => 
      searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const selectedCategoryData = selectedCategory 
    ? helpCategories.find(cat => cat.id === selectedCategory)
    : null;

  const renderContent = () => {
    if (selectedArticle) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedArticle(null)}
              className="p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{selectedArticle.title}</h2>
              <p className="text-sm text-gray-500">
                Last updated: {selectedArticle.lastUpdated}
              </p>
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-96">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {selectedArticle.content}
              </pre>
            </div>
          </ScrollArea>
        </div>
      );
    }

    if (selectedCategory && selectedCategoryData) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">{selectedCategoryData.icon}</span>
                {selectedCategoryData.name}
              </h2>
              <p className="text-sm text-gray-600">{selectedCategoryData.description}</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            {selectedCategoryData.articles.map((article) => (
              <Card
                key={article.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{article.title}</h3>
                    <div className="flex gap-1 mt-1">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (searchQuery) {
      return (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Search Results</h2>
            <p className="text-sm text-gray-600">
              Found {filteredArticles.length} articles matching "{searchQuery}"
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{article.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{article.category}</p>
                    <div className="flex gap-1 mt-1">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">How can we help you?</h2>
          <p className="text-gray-600 text-sm">
            Browse our help categories or search for specific topics
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {helpCategories.map((category) => (
            <Card
              key={category.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-xs text-gray-600">{category.description}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {category.articles.length} articles
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-semibold">Need More Help?</h3>
          <div className="grid grid-cols-1 gap-3">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium">Contact Developer</h4>
                    <p className="text-sm text-gray-600">Get immediate help via WhatsApp</p>
                  </div>
                </div>
                <WhatsAppContact 
                  message="Hello! I need help with the LSREMS system. Can you assist me?"
                  className="text-sm"
                />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">Email Support</h4>
                  <p className="text-sm text-gray-600">support@lsrems.com</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="font-medium">Phone Support</h4>
                  <p className="text-sm text-gray-600">+256751768901</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`hover:bg-gray-100 transition-colors duration-200 ${className}`}
        >
          <HelpCircle className="w-5 h-5 text-gray-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Help Center
          </DialogTitle>
          <DialogDescription>
            Find answers to common questions and learn how to use LSREMS effectively
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}