import { useState } from "react";
import { useCreateSuperAdmin } from "@/hooks/super-admin/useSuperAdmin";
import { Shield, Plus, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminManagement() {
  const createSuperAdminMutation = useCreateSuperAdmin();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSuperAdminMutation.mutateAsync(formData);
      toast({
        title: "Success",
        description: "Super admin created successfully",
      });
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
      setShowForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create super admin",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage super administrators with platform-wide access
        </p>
      </div>

      {/* Warning Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Security Notice</h3>
            <p className="text-sm text-red-700 mt-1">
              Super administrators have complete access to all companies, users, and system settings. 
              Only create super admin accounts for trusted personnel who require platform-wide control.
            </p>
          </div>
        </div>
      </div>

      {/* Create Super Admin Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create Super Administrator</h2>
            <p className="text-sm text-gray-600">Add new super admin with full platform access</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Create Super Admin'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter first name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter secure password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createSuperAdminMutation.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Shield className="h-4 w-4" />
                {createSuperAdminMutation.isPending ? 'Creating...' : 'Create Super Admin'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Super Admin Guidelines */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Super Administrator Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Responsibilities</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Monitor platform-wide activity and performance</li>
              <li>• Manage company accounts and administrators</li>
              <li>• Review system logs and security events</li>
              <li>• Configure system-wide settings and policies</li>
              <li>• Handle escalated support requests</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Access Permissions</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Full access to all company data</li>
              <li>• User management across all organizations</li>
              <li>• System configuration and settings</li>
              <li>• Analytics and reporting for all companies</li>
              <li>• Audit logs and security monitoring</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Best Practices */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Security Best Practices</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use strong, unique passwords for all super admin accounts</li>
          <li>• Enable two-factor authentication when available</li>
          <li>• Regularly review and audit super admin activities</li>
          <li>• Limit the number of super admin accounts to essential personnel only</li>
          <li>• Monitor login patterns and report suspicious activities</li>
        </ul>
      </div>
    </div>
  );
}