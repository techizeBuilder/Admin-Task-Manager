import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook for managing authentication state
 * Works with both real backend and mock API
 */
export const useAuth = () => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/verify'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isAuthenticated = !!user && !error;
  
  const logout = () => {
    // Clear auth data and redirect
    window.location.href = '/auth/login';
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
    // User role information
    role: user?.role || 'individual',
    hasOrganization: !!user?.organizationId,
    permissions: user?.permissions || [],
  };
};