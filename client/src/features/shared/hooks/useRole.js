import { useAuth } from './useAuth';

/**
 * Custom hook for role-based functionality
 * Determines user capabilities and access levels
 */
export const useRole = () => {
  const { user, role, hasOrganization } = useAuth();

  // Role hierarchy and permissions
  const roleHierarchy = {
    'individual': 1,
    'member': 1,
    'employee': 2,
    'org_member': 2,
    'admin': 3,
    'org_admin': 3,
    'superadmin': 4,
    'super_admin': 4,
  };

  const getRoleLevel = (roleToCheck = role) => {
    return roleHierarchy[roleToCheck] || 1;
  };

  const hasPermission = (requiredRole) => {
    return getRoleLevel() >= getRoleLevel(requiredRole);
  };

  // Feature access permissions
  const canAccessFeature = (feature) => {
    const featurePermissions = {
      'dashboard': true, // All roles can access dashboard
      'tasks': true, // All roles can manage tasks
      'calendar': true, // All roles can access calendar
      'reports': getRoleLevel() >= 2, // Employee level and above
      'user_management': getRoleLevel() >= 3, // Admin level and above
      'system_config': getRoleLevel() >= 4, // SuperAdmin only
    };
    
    return featurePermissions[feature] || false;
  };

  // UI context for role-based rendering
  const getUIContext = () => {
    if (getRoleLevel() >= 4) return 'superadmin';
    if (getRoleLevel() >= 3) return 'organization';
    if (hasOrganization) return 'orgMember';
    return 'individual';
  };

  return {
    role,
    roleLevel: getRoleLevel(),
    hasOrganization,
    hasPermission,
    canAccessFeature,
    uiContext: getUIContext(),
    isIndividual: !hasOrganization && getRoleLevel() <= 2,
    isOrgMember: hasOrganization && getRoleLevel() <= 2,
    isAdmin: getRoleLevel() >= 3,
    isSuperAdmin: getRoleLevel() >= 4,
  };
};