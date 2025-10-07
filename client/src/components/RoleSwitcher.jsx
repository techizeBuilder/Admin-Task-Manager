import React, { useState, useContext, createContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import {
  UserCheck,
  Crown,
  Users,
  User,
  Shield,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { useLocation } from "wouter";
// Create context for role switching
const RoleContext = createContext();

// Role Context Provider
export const RoleProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState(() => {
    // Initialize activeRole from localStorage
    return localStorage.getItem('activeRole') || null;
  });

  return (
    <RoleContext.Provider value={{ activeRole, setActiveRole }}>
      {children}
    </RoleContext.Provider>
  );
};

// Hook to use role context
export const useActiveRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useActiveRole must be used within a RoleProvider');
  }
  return context;
};

// Role icon mapping
const getRoleIcon = (role) => {
  switch (role.toLowerCase()) {
    case 'super_admin':
    case 'superadmin':
      return Crown;
    case 'org_admin':
    case 'admin':
    case 'company_admin':
      return Shield;
    case 'manager':
      return Users;
    case 'employee':
      return User;
    case 'individual':
      return UserCheck;
    default:
      return User;
  }
};

// Role display name mapping
const getRoleDisplayName = (role) => {
  switch (role.toLowerCase()) {
    case 'super_admin':
      return 'Super Admin';
    case 'org_admin':
      return 'Organization Admin';
    case 'manager':
      return 'Manager';
    case 'employee':
      return 'Employee';
    case 'individual':
      return 'Individual User';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

// Role Switcher Component
const RoleSwitcher = () => {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
  });
  const [, navigate] = useLocation(); // navigate function from wouter
  const { activeRole, setActiveRole } = useActiveRole();
  const queryClient = useQueryClient();

  // Get current active role or default to first role
  const currentRole = activeRole || user?.role?.[0];
  const userRoles = user?.role || [];

  // Auto-set default role if not already set
  React.useEffect(() => {
    if (user?.role?.[0] && !activeRole) {
      const defaultRole = user.role[0];
      setActiveRole(defaultRole);
      localStorage.setItem('activeRole', defaultRole);
    }
  }, [user, activeRole, setActiveRole]);

  // Show switcher for development - remove the multiple roles check temporarily
  if (!user) {
    return null;
  }

  // For development: always show the switcher to test it
  // if (!user || userRoles.length <= 1) {
  //   return null;
  // }

  const handleRoleSwitch = (newRole) => {
    setActiveRole(newRole);
    
    // Store activeRole in localStorage for persistence
    localStorage.setItem('activeRole', newRole);

    // Update user data in cache with new active role
    queryClient.setQueryData(["/api/auth/verify"], (oldData) => ({
      ...oldData,
      activeRole: newRole
    }));
    
    // Refresh the page to apply new role context
    // window.location.reload();
  };

  const CurrentRoleIcon = getRoleIcon(currentRole);

  return (
    <div className="flex items-center bg-white">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            title="Switch User Role"
          >
            <CurrentRoleIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline text-sm">
              {getRoleDisplayName(currentRole)}
            </span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 bg-white">
          <div className="px-3 py-2 text-xs bg-white font-medium text-gray-500 border-b">
            Switch Role
          </div>

          {userRoles.map((role) => {
            const RoleIcon = getRoleIcon(role);
            const isActive = role === currentRole;

            return (
              <DropdownMenuItem
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className={`cursor-pointer ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <RoleIcon className="h-4 w-4 mr-3" />
                <div className="flex flex-col">
                  <span className="font-medium">
                    {getRoleDisplayName(role)}
                  </span>
                  {isActive && (
                    <span className="text-xs text-blue-600">
                      Currently Active
                    </span>
                  )}
                </div>
                {isActive && (
                  <div className="ml-auto">
                    <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </DropdownMenuItem>
            );
          })}

          <div className="border-t pt-2 mt-2">
            <DropdownMenuItem
              onClick={() => window.location.reload()}
              className="cursor-pointer text-gray-600 hover:bg-gray-100"
            >
              <RotateCcw className="h-4 w-4 mr-3" />
              <span className="text-sm">Refresh Page</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RoleSwitcher;
