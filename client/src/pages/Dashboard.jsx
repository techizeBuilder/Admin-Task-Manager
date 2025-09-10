import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { IndividualDashboard, OrganizationDashboard, SuperAdminDashboard, ManagerDashboard } from '../dashboard';
import { useActiveRole } from '../components/RoleSwitcher';

/**
 * Dynamic Dashboard Router - Renders appropriate dashboard based on user role
 * This component automatically detects user role and shows the correct dashboard
 * Note: Authentication is handled by AdminLayout, so this component assumes user is already authenticated
 */
const Dashboard = () => {
  // Get current user data to determine role (already authenticated by AdminLayout)
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
    retry: false,
  });

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  const renderDashboard = () => {
    // Get the current active role from context or use the first role as default
    const activeRole = user?.activeRole || user?.role?.[0];
    const userRole = activeRole?.toLowerCase();

    switch (userRole) {
      case 'superadmin':
      case 'super_admin':
        return <SuperAdminDashboard />;
      
      case 'admin':
      case 'org_admin':
      case 'company_admin':
      case 'owner':
        return <OrganizationDashboard />;
      
      case 'manager':
        return <ManagerDashboard />;
      
      case 'member':
      case 'employee':
      case 'individual':
      default:
        return <IndividualDashboard />;
    }
  };

  return (
    <div data-testid="dashboard-container">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;