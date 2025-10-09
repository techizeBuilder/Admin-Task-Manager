import { useQuery } from '@tanstack/react-query';
import { useActiveRole } from '../../../components/RoleSwitcher';

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

  const { activeRole } = useActiveRole();

  const isAuthenticated = !!user && !error;
  
  const logout = () => {
    // Clear auth data and redirect
    window.location.href = '/auth/login';
  };

  // Determine the current role - use activeRole from context, or first role from array, or default
  const getCurrentRole = () => {
    if (activeRole) return activeRole;
    if (Array.isArray(user?.role) && user.role.length > 0) return user.role[0];
    if (user?.role && typeof user.role === 'string') return user.role;
    return 'individual';
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
    // User role information
    role: getCurrentRole(),
    hasOrganization: !!user?.organizationId,
    permissions: user?.permissions || [],
  };
};