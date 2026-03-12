// User Types
export type UserRole = 'admin' | 'surveyor' | 'real_estate_manager' | 'customer';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  date_joined: string;
}

// Customer Types
export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

// Survey Project Types
export type ProjectStatus = 'pending' | 'survey_in_progress' | 'submitted_to_land_office' | 'completed';

export interface SurveyProject {
  id: number;
  customer_id: number;
  customer?: Customer;
  surveyor_id: number;
  surveyor?: User;
  project_name: string;
  location: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectUpdate {
  id: number;
  project_id: number;
  status: ProjectStatus;
  notes: string;
  updated_by: number;
  timestamp: string;
}

// Land Title Types
export interface LandTitle {
  id: number;
  project_id: number;
  project?: SurveyProject;
  document_file: string;
  document_type: 'survey_map' | 'land_title' | 'boundary_report';
  uploaded_at: string;
}

// Property Types
export type PropertyStatus = 'available' | 'sold' | 'rented' | 'reserved';

export interface Property {
  id: number;
  property_name: string;
  location: string;
  size: string;
  land_title_id?: number;
  land_title?: LandTitle;
  property_type: 'land' | 'house' | 'commercial' | 'apartment';
  status: PropertyStatus;
  created_at: string;
}

// Property Listing Types
export type ListingType = 'for_sale' | 'for_rent';
export type ListingStatus = 'active' | 'sold' | 'rented' | 'inactive';

export interface PropertyListing {
  id: number;
  property_id: number;
  property?: Property;
  listing_type: ListingType;
  price: number;
  listed_date: string;
  status: ListingStatus;
}

// Transaction Types
export type TransactionType = 'sale' | 'rental';

export interface PropertyTransaction {
  id: number;
  property_id: number;
  property?: Property;
  customer_id: number;
  customer?: Customer;
  transaction_type: TransactionType;
  price: number;
  transaction_date: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_properties: number;
  active_survey_projects: number;
  properties_for_sale: number;
  properties_for_rent: number;
  recent_transactions: PropertyTransaction[];
  recent_projects: SurveyProject[];
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail: string;
  errors?: Record<string, string[]>;
}
