import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/features/shared/hooks/usePermissions";
import RBACService from "@/features/shared/services/rbacService";

/**
 * Enhanced Protected Route with RBAC support
 * Replaces the existing ProtectedRoute with better permission checking
 */
export default function EnhancedProtectedRoute({ 
  children, 
  requiredRole = null, 
  allowedRoles = [],
  requiredPermission = null,
  route = null 
}) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { canAccessRoute, hasPermission, hasRoleLevel } = usePermissions();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
          
          // Enhanced role and permission checking
          let hasAccess = true;
          let accessDeniedReason = "";
          
          // Check specific role requirement
          if (requiredRole && userData.role !== requiredRole) {
            hasAccess = false;
            accessDeniedReason = `This page requires ${requiredRole} role`;
          }
          
          // Check allowed roles list
          if (hasAccess && allowedRoles.length > 0 && !allowedRoles.includes(userData.role)) {
            hasAccess = false;
            accessDeniedReason = "You don't have the required role to access this page";
          }
          
          // Check specific permission
          if (hasAccess && requiredPermission && !RBACService.hasPermission(userData.role, requiredPermission)) {
            hasAccess = false;
            accessDeniedReason = "You don't have the required permission to access this page";
          }
          
          // Check route access using RBAC
          if (hasAccess && route && !RBACService.canAccessRoute(userData.role, route)) {
            hasAccess = false;
            accessDeniedReason = "You don't have access to this page";
          }
          
          if (!hasAccess) {
            toast({
              title: "Access Denied",
              description: accessDeniedReason,
              variant: "destructive"
            });
            
            // Redirect to appropriate dashboard based on role
            const redirectPath = RBACService.getRedirectPath(userData.role);
            setLocation(redirectPath);
            return;
          }
          
        } else {
          // Invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive"
          });
          setLocation('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLocation('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole, allowedRoles, requiredPermission, route, setLocation, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return children;
}

/**
 * Quick access components for common protection patterns
 */
export function RequireManager({ children }) {
  return (
    <EnhancedProtectedRoute requiredRole="manager">
      {children}
    </EnhancedProtectedRoute>
  );
}

export function RequireAdmin({ children }) {
  return (
    <EnhancedProtectedRoute allowedRoles={["admin", "org_admin"]}>
      {children}
    </EnhancedProtectedRoute>
  );
}

export function RequireSuperAdmin({ children }) {
  return (
    <EnhancedProtectedRoute allowedRoles={["super_admin", "superadmin"]}>
      {children}
    </EnhancedProtectedRoute>
  );
}