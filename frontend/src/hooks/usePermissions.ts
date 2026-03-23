import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

/**
 * Role hierarchy:
 *  admin              — full access
 *  real_estate_manager — most features, no user management
 *  surveyor           — projects, documents, dashboard; no reports/transactions
 *  worker             — data entry: customers, projects, expenses; no reports/users
 *  customer           — portal only
 */
export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role as UserRole | undefined;

  const is = (roles: UserRole[]) => !!role && roles.includes(role);

  return {
    canViewReports:       is(['admin', 'real_estate_manager']),
    canManageUsers:       is(['admin']),
    canManageExpenses:    is(['admin', 'worker', 'real_estate_manager', 'surveyor']),
    canViewExpenses:      is(['admin', 'worker', 'real_estate_manager', 'surveyor']),
    canManageTransactions:is(['admin', 'real_estate_manager']),
    canViewTransactions:  is(['admin', 'real_estate_manager', 'worker']),
    canManageProperties:  is(['admin', 'real_estate_manager']),
    canManageProjects:    is(['admin', 'surveyor', 'worker']),
    canManageCustomers:   is(['admin', 'real_estate_manager', 'worker']),
    isAdmin:              is(['admin']),
    isWorker:             is(['worker']),
    isSurveyor:           is(['surveyor']),
    role,
  };
}
