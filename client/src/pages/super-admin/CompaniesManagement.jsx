import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Users, FolderOpen, FileText, MoreVertical, Eye, Settings, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SuperAdminLayout from "@/components/super-admin/SuperAdminLayout";
import axios from "axios";

export default function CompaniesManagement() {
  const { data: companies = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/super-admin/companies"],
    retry: false,
  });
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Debug logging
  console.log("=== COMPANIES MANAGEMENT DEBUG ===");
  console.log("Companies data:", companies);
  console.log("Companies length:", companies?.length);
  console.log("Loading state:", isLoading);
  console.log("Error state:", error);
  console.log("Auth token exists:", !!localStorage.getItem('token'));

  const handleStatusChange = async (companyId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const newStatus = isActive ? 'active' : 'inactive';
      console.log(`CompaniesManagement: Updating company ${companyId} status to ${newStatus}`);

      // API call to update company status
      const response = await axios.patch(
        `${baseUrl}/api/companies/${companyId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('CompaniesManagement: Status update successful:', response.data);

      // Refetch data to update the UI
      await refetch();

      toast({
        title: "Success",
        description: `Company status updated to ${newStatus}`,
      });

    } catch (error) {
      console.error('CompaniesManagement: Error updating status:', error);
      
      let errorMessage = 'Failed to update company status';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update company status.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Company not found.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const filteredCompanies = companies?.filter(company => {
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && company.status === 'active') ||
                         (statusFilter === "inactive" && company.status !== 'active');
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <SuperAdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Companies Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Monitor and manage all companies on the platform
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-500">@{company.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  company.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {company.status === 'active' ? 'Active' : company.status || 'Inactive'}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <p className="text-sm text-gray-600">{company.description || 'No description provided'}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{company.userCount || company.stats?.users || 0} users</span>
                </div>
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{company.projectCount || company.stats?.projects || 0} projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{company.taskCount || company.stats?.tasks || 0} tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{company.formCount || company.stats?.forms || 0} forms</span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Created: {new Date(company.createdAt).toLocaleDateString()}
                {company.createdBy && (
                  <span className="block">
                    By: {company.createdBy.firstName} {company.createdBy.lastName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.location.href = `/super-admin/companies/${company._id}`}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
              <button
                onClick={() => handleStatusChange(company._id, company.status !== 'active')}
                disabled={false}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  company.status === 'active'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {company.status === 'active' ? (
                  <>
                    <Ban className="h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Activate
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-600">
            {companies.length === 0 
              ? "No companies have been registered yet." 
              : "No companies match your current filters."
            }
          </p>
          {companies.length === 0 && (
            <div className="mt-4 text-sm text-gray-500">
              Companies will appear here once organizations register on the platform.
            </div>
          )}
        </div>
      )}
      </div>
    </SuperAdminLayout>
  );
}