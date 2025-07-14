import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Plus, Edit, Trash2, Users, Check, X, Save, UserCog } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function RoleManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({ name: "", description: "", permissions: [] });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/roles"],
  });

  // Get organization users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/organization/users-detailed"],
  });

  // Create role mutation
  const createRoleMutation = useMutation({
    mutationFn: async (roleData) => {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(roleData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create role");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role created successfully",
        description: "The new role has been created and is ready to use",
      });
      setIsCreateModalOpen(false);
      setNewRole({ name: "", description: "", permissions: [] });
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, ...roleData }) => {
      const response = await fetch(`/api/roles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(roleData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role updated successfully",
        description: "The role has been updated",
      });
      setEditingRole(null);
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId) => {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete role");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role deleted successfully",
        description: "The role has been removed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }) => {
      const response = await fetch("/api/roles/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId, roleId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to assign role");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role assigned successfully",
        description: "The user's role has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/organization/users-detailed"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to assign role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const availablePermissions = [
    "read_tasks", "create_tasks", "edit_tasks", "delete_tasks",
    "read_projects", "create_projects", "edit_projects", "delete_projects",
    "read_users", "invite_users", "edit_users", "delete_users",
    "read_reports", "create_reports", "edit_reports", "delete_reports"
  ];

  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newRole.name.trim()) {
      toast({
        title: "Role name required",
        description: "Please enter a name for the role",
        variant: "destructive",
      });
      return;
    }
    createRoleMutation.mutate(newRole);
  };

  const handleUpdateRole = (role) => {
    updateRoleMutation.mutate(role);
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm("Are you sure you want to delete this role? Users with this role will need to be reassigned.")) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  const handleAssignRole = (userId, roleId) => {
    assignRoleMutation.mutate({ userId, roleId });
  };

  const togglePermission = (permission, isNewRole = false) => {
    if (isNewRole) {
      const permissions = newRole.permissions.includes(permission)
        ? newRole.permissions.filter(p => p !== permission)
        : [...newRole.permissions, permission];
      setNewRole({ ...newRole, permissions });
    } else if (editingRole) {
      const permissions = editingRole.permissions.includes(permission)
        ? editingRole.permissions.filter(p => p !== permission)
        : [...editingRole.permissions, permission];
      setEditingRole({ ...editingRole, permissions });
    }
  };

  if (rolesLoading || usersLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Role Management</h1>
          <p className="text-gray-400 mt-1">
            Manage roles and permissions for your organization
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </button>
      </div>

      {/* Roles List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-100 mb-4">Organization Roles</h3>
          
          {roles.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No custom roles created yet</p>
              <p className="text-sm">Create your first role to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role._id} className="border border-gray-600 rounded-lg p-4">
                  {editingRole && editingRole._id === role._id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Role Name
                          </label>
                          <input
                            type="text"
                            value={editingRole.name}
                            onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Description
                          </label>
                          <input
                            type="text"
                            value={editingRole.description}
                            onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Permissions
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {availablePermissions.map((permission) => (
                            <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingRole.permissions.includes(permission)}
                                onChange={() => togglePermission(permission)}
                                className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                              />
                              <span className="text-sm text-gray-300">{permission.replace(/_/g, ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingRole(null)}
                          className="px-3 py-1 text-gray-300 hover:text-gray-100 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateRole(editingRole)}
                          disabled={updateRoleMutation.isPending}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-100">{role.name}</h4>
                        <p className="text-sm text-gray-400">{role.description}</p>
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            {role.permissions?.length || 0} permissions
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingRole(role)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role._id)}
                          disabled={deleteRoleMutation.isPending}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded disabled:opacity-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Role Assignments */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-100 mb-4">User Role Assignments</h3>
          
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 border border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <UserCog className="h-4 w-4 text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-100">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <select
                      value={user.role || "employee"}
                      onChange={(e) => {
                        const roleId = e.target.value === "employee" || e.target.value === "org_admin" 
                          ? e.target.value 
                          : roles.find(r => r.name === e.target.value)?._id;
                        if (roleId) {
                          handleAssignRole(user._id, roleId);
                        }
                      }}
                      disabled={assignRoleMutation.isPending}
                      className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="employee">Employee</option>
                      <option value="org_admin">Admin</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isActive 
                        ? "bg-green-900 text-green-300" 
                        : "bg-red-900 text-red-300"
                    }`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl mx-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-100 mb-4">Create New Role</h2>
              
              <form onSubmit={handleCreateRole} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availablePermissions.map((permission) => (
                      <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRole.permissions.includes(permission)}
                          onChange={() => togglePermission(permission, true)}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                        />
                        <span className="text-sm text-gray-300">{permission.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setNewRole({ name: "", description: "", permissions: [] });
                    }}
                    className="px-4 py-2 text-gray-300 hover:text-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createRoleMutation.isPending}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {createRoleMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Create Role
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}