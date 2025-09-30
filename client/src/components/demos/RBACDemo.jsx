import { useState } from 'react';
import { usePermissions } from '@/features/shared/hooks/usePermissions';
import { PermissionGuard, FieldGuard } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/features/shared/services/rbacService';
import { 
  ProtectedFormField, 
  AssignmentFieldGuard, 
  VisibilityFieldGuard, 
  PriorityFieldGuard 
} from '@/components/forms/ProtectedFormField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Shield, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * RBAC Demo Component
 * Demonstrates how the RBAC system works with different roles
 */
export const RBACDemo = () => {
  const { 
    role, 
    user, 
    hasPermission, 
    canAccessRoute, 
    task, 
    organization, 
    fields 
  } = usePermissions();
  
  const [selectedRole, setSelectedRole] = useState(role);
  
  const demoRoles = [
    { value: 'individual', label: 'Individual User', color: 'bg-gray-500' },
    { value: 'member', label: 'Member', color: 'bg-blue-500' },
    { value: 'employee', label: 'Employee', color: 'bg-green-500' },
    { value: 'manager', label: 'Manager', color: 'bg-yellow-500' },
    { value: 'admin', label: 'Admin', color: 'bg-purple-500' },
    { value: 'super_admin', label: 'Super Admin', color: 'bg-red-500' }
  ];
  
  const demoPermissions = [
    { key: 'CREATE_TASK', label: 'Create Task', permission: PERMISSIONS.CREATE_TASK },
    { key: 'ASSIGN_TASK', label: 'Assign to Others', permission: PERMISSIONS.ASSIGN_TASK },
    { key: 'MANAGE_USERS', label: 'Manage Users', permission: PERMISSIONS.MANAGE_USERS },
    { key: 'MANAGE_ORGANIZATION', label: 'Manage Organization', permission: PERMISSIONS.MANAGE_ORGANIZATION },
    { key: 'SYSTEM_ADMIN', label: 'System Admin', permission: PERMISSIONS.SYSTEM_ADMIN }
  ];
  
  const demoRoutes = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/tasks/create', label: 'Create Task' },
    { path: '/admin/users', label: 'User Management' },
    { path: '/admin/invite-users', label: 'Invite Users' },
    { path: '/admin/org-profile', label: 'Organization Profile' },
    { path: '/super-admin/companies', label: 'Companies (Super Admin)' }
  ];
  
  return (
    <div className="p-6 space-y-6">
      {/* Current User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Current User Role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {role || 'Unknown'}
            </Badge>
            <span className="text-gray-600">
              {user?.email || 'No user data'}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Permission Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoPermissions.map(({ key, label, permission }) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{label}</span>
                {hasPermission(permission) ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Route Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Route Access Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoRoutes.map(({ path, label }) => (
              <div key={path} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-gray-500">{path}</div>
                </div>
                {canAccessRoute(path) ? (
                  <Badge variant="success" className="bg-green-100 text-green-800">
                    Allowed
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    Denied
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Field-Level Protection Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Form Field Protection Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Assignment Field */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Assignment Field (Manager+ can assign to others)
            </label>
            <ProtectedFormField permission={PERMISSIONS.ASSIGN_TASK}>
              <select className="w-full p-2 border rounded-lg">
                <option>Self</option>
                <option>Team Member 1</option>
                <option>Team Member 2</option>
              </select>
            </ProtectedFormField>
            {!fields.canAssignToOthers && (
              <p className="text-sm text-blue-600 mt-1">
                ℹ️ You can only assign to yourself
              </p>
            )}
          </div>
          
          {/* Visibility Field */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Visibility Settings (Manager+ can control)
            </label>
            {fields.canManageVisibility ? (
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="radio" name="visibility" value="private" className="mr-2" />
                  Private
                </label>
                <label className="flex items-center">
                  <input type="radio" name="visibility" value="team" className="mr-2" />
                  Team
                </label>
                <label className="flex items-center">
                  <input type="radio" name="visibility" value="public" className="mr-2" />
                  Public
                </label>
              </div>
            ) : (
              <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                Fixed to Private (no permission to change)
              </div>
            )}
          </div>
          
          {/* Critical Priority */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Priority Selection (Critical requires Manager+)
            </label>
            <select className="w-full p-2 border rounded-lg">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              {fields.canSetCriticalPriority && <option>Critical</option>}
            </select>
            {!fields.canSetCriticalPriority && (
              <p className="text-sm text-blue-600 mt-1">
                ℹ️ Critical priority requires manager role or higher
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Component-Level Guards */}
      <Card>
        <CardHeader>
          <CardTitle>Component-Level Protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Admin Only Button */}
          <PermissionGuard permission={PERMISSIONS.MANAGE_USERS}>
            <Button className="w-full">
              User Management (Admin Only)
            </Button>
          </PermissionGuard>
          
          {/* Manager and Above */}
          <PermissionGuard permission={PERMISSIONS.MANAGE_TEAM_TASKS}>
            <Button variant="outline" className="w-full">
              Team Management (Manager+)
            </Button>
          </PermissionGuard>
          
          {/* Super Admin Only */}
          <PermissionGuard permission={PERMISSIONS.SYSTEM_ADMIN}>
            <Button variant="destructive" className="w-full">
              System Administration (Super Admin Only)
            </Button>
          </PermissionGuard>
          
          {/* Fallback Component */}
          <PermissionGuard 
            permission={PERMISSIONS.SYSTEM_ADMIN}
            fallback={
              <div className="p-3 bg-gray-100 rounded-lg text-gray-600 text-center">
                System Administration not available for your role
              </div>
            }
          >
            <Button variant="destructive" className="w-full">
              System Administration Available
            </Button>
          </PermissionGuard>
        </CardContent>
      </Card>
    </div>
  );
};

export default RBACDemo;