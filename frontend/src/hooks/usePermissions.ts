import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export function usePermissions() {
  const { user, hasRole } = useAuth();

  return {
    // Admin permissions
    canManageUsers: hasRole('admin'),
    canManageAllProjects: hasRole('admin'),
    canManageAllProperties: hasRole('admin'),
    canViewReports: hasRole(['admin', 'real_estate_manager']),
    canManageCustomers: hasRole(['admin', 'real_estate_manager']),
    
    // Surveyor permissions
    canViewAssignedProjects: hasRole(['admin', 'surveyor']),
    canUpdateProjectProgress: hasRole(['admin', 'surveyor']),
    canUploadDocuments: hasRole(['admin', 'surveyor']),
    
    // Real Estate Manager permissions
    canManageListings: hasRole(['admin', 'real_estate_manager']),
    canManageTransactions: hasRole(['admin', 'real_estate_manager']),
    canManageProperties: hasRole(['admin', 'real_estate_manager']),
    
    // Customer permissions
    canViewOwnProjects: hasRole(['admin', 'customer']),
    canViewOwnProperties: hasRole(['admin', 'customer']),
    
    // Current user info
    currentUser: user,
    userRole: user?.role,
  };
}
