import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { IndividualDashboard, OrganizationDashboard, SuperAdminDashboard } from '../dashboard';

/**
 * Dynamic Dashboard Router - Renders appropriate dashboard based on user role
 * This component automatically detects user role and shows the correct dashboard
 */
const Dashboard = () => {
  // Get current user data to determine role
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
  });

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state if user data couldn't be fetched
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
            <button 
              onClick={() => window.location.href = "/login"}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  const renderDashboard = () => {
    const userRole = user.role?.toLowerCase();

    switch (userRole) {
      case 'superadmin':
      case 'super_admin':
        return <SuperAdminDashboard />;
      
      case 'admin':
      case 'org_admin':
        return <OrganizationDashboard />;
      
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