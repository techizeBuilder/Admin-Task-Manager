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
export const getRoleDisplayName = (role) => {
  if (!role) return "";
  
  // Handle array or object cases safely
  if (Array.isArray(role)) {
    role = role[0] || "";
  } else if (typeof role !== "string") {
    role = String(role || "");
  }

  const normalized = role.toLowerCase();

  switch (normalized) {
    case "super_admin":
    case "superadmin":
      return "Super Admin";
    case "org_admin":
    case "admin":
    case "company_admin":
      return "Organization Admin";
    case "manager":
      return "Manager";
    case "employee":
      return "Employee";
    case "individual":
      return "Individual User";
    default:
      return ''
      // return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
};

// Role Switcher Component
const RoleSwitcher = () => {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
  });
  const [location, navigate] = useLocation(); // navigate function from wouter
  const { activeRole, setActiveRole } = useActiveRole();
  const queryClient = useQueryClient();

  // Check if current page is a billing/upgrade/payment page where role switching should be disabled
  const isBillingPage = location.includes('/billing') || 
                       location.includes('/upgrade') || 
                       location.includes('/payment') ||
                       location.includes('/subscription');
  
  // Get roles safely and ensure currentRole is always one of userRoles
  const userRoles = Array.isArray(user?.role) ? user.role : [];

  // Ensure initial selection matches sidebar's default (first role)
  const didInitRef = React.useRef(false);
  React.useEffect(() => {
    if (!userRoles.length) return;

    if (!didInitRef.current) {
      const defaultRole = userRoles[0];
      setActiveRole(defaultRole);
      localStorage.setItem('activeRole', defaultRole);
      didInitRef.current = true;
      return;
    }

    // If current stored role is no longer valid, fall back to first role
    if (activeRole && !userRoles.includes(activeRole)) {
      const fallbackRole = userRoles[0];
      setActiveRole(fallbackRole);
      localStorage.setItem('activeRole', fallbackRole);
    }
  }, [userRoles, activeRole, setActiveRole]);

  // Derive currentRole only from allowed roles
  const currentRole = userRoles.includes(activeRole) ? activeRole : userRoles[0];

  // Show switcher for development - remove the multiple roles check temporarily
  if (!user || isBillingPage) {
    return null;
  }

  const handleRoleSwitch = (newRole) => {
    // Prevent role switching on billing/payment pages for security
    if (location.includes('/billing') || 
        location.includes('/upgrade') || 
        location.includes('/payment') ||
        location.includes('/subscription')) {
      console.warn('Role switching disabled on billing/payment pages');
      return;
    }

    // Ignore switching to a role not available to the user
    if (!userRoles.includes(newRole)) {
      console.warn('Selected role not available for this user');
      const fallback = userRoles[0];
      setActiveRole(fallback);
      localStorage.setItem('activeRole', fallback);
      return;
    }
    
    setActiveRole(newRole);
    localStorage.setItem('activeRole', newRole);

    queryClient.setQueryData(["/api/auth/verify"], (oldData) => ({
      ...oldData,
      activeRole: newRole
    }));
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
            const isActive = (role || "").toLowerCase() === (currentRole || "").toLowerCase();

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
