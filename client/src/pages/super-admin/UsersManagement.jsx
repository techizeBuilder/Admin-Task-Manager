import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Shield, Building2, Mail, Calendar, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UsersManagement() {
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["/api/super-admin/users"],
    retry: false,
  });
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");

  // Debug logging
  console.log("=== USERS MANAGEMENT DEBUG ===");
  console.log("Users data:", users);
  console.log("Users length:", users?.length);
  console.log("Loading state:", isLoading);
  console.log("Error state:", error);
  console.log("Auth token exists:", !!localStorage.getItem('token'));

  const handleAssignAdmin = async (userId, companyId) => {
    try {
      // This would be implemented when admin assignment functionality is needed
      toast({
        title: "Info",
        description: "Admin assignment functionality coming soon",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign admin role",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organizationName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    const matchesCompany = companyFilter === "all" || 
                          (user.organization === companyFilter) ||
                          (user.organizationId === companyFilter);
    
    return matchesSearch && matchesRole && matchesCompany;
  }) || [];

  const companies = [...new Set(users?.map(u => u.organizationName || u.organization).filter(Boolean))] || [];

  const getRoleBadge = (role) => {
    const styles = {
      super_admin: "bg-red-100 text-red-800",
      admin: "bg-blue-100 text-blue-800",
      member: "bg-gray-100 text-gray-800"
    };
    return styles[role] || styles.member;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          View and manage all users across the platform
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Companies</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {user.organizationId?.name || 'No Company'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role === 'super_admin' ? 'Super Admin' : 
                       user.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? 'Active' : user.status || 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user.role !== 'super_admin' && user.role !== 'admin' && user.organizationId && (
                        <button
                          onClick={() => handleAssignAdmin(user._id, user.organizationId._id)}
                          disabled={false}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          <Shield className="h-3 w-3" />
                          Make Admin
                        </button>
                      )}
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                        View Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">
            {users.length === 0 
              ? "No users have been registered yet." 
              : "No users match your current filters."
            }
          </p>
          {users.length === 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Users will appear here once they register or are invited to organizations.
            </div>
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{filteredUsers.length}</p>
            <p className="text-sm text-gray-600">Filtered Users</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {filteredUsers.filter(u => u.role === 'super_admin').length}
            </p>
            <p className="text-sm text-gray-600">Super Admins</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {filteredUsers.filter(u => u.role === 'admin').length}
            </p>
            <p className="text-sm text-gray-600">Company Admins</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {filteredUsers.filter(u => u.isActive).length}
            </p>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>
        </div>
      </div>
    </div>
  );
}