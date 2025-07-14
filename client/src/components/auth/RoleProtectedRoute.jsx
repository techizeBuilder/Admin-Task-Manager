import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export function RoleProtectedRoute({ children, allowedRoles = [], redirectTo = '/login' }) {
  const [, setLocation] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        setLocation('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        
        if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
          setIsAuthorized(true);
        } else {
          // Redirect based on user's actual role
          const redirectMap = {
            'superadmin': '/super-admin',
            'super_admin': '/super-admin',
            'admin': '/dashboard',
            'employee': '/dashboard'
          };
          
          setLocation(redirectMap[user.role] || '/dashboard');
        }
      } catch (error) {
        console.error('Invalid user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLocation('/login');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [allowedRoles, setLocation, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Verifying access...</p>
      </div>
    );
  }

  return isAuthorized ? children : null;
}

export function RequireSuperAdmin({ children }) {
  return (
    <RoleProtectedRoute allowedRoles={['superadmin']}>
      {children}
    </RoleProtectedRoute>
  );
}

export function RequireAdmin({ children }) {
  return (
    <RoleProtectedRoute allowedRoles={['superadmin', 'admin']}>
      {children}
    </RoleProtectedRoute>
  );
}

export function RequireEmployee({ children }) {
  return (
    <RoleProtectedRoute allowedRoles={['superadmin', 'admin', 'employee']}>
      {children}
    </RoleProtectedRoute>
  );
}