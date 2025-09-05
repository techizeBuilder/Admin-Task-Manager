import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  User,
  Building2,
  MapPin,
  Briefcase,
  AlertCircle,
  Edit3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function EditUserModal({ isOpen, onClose, user, onUserUpdated }) {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    licenseId: "",
    department: "",
    designation: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const originalRole = user?.role;

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || "",
        role: user.role || "",
        licenseId: user.license || "",
        department: user.department || "",
        designation: user.designation || "",
        location: user.location || "",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, user]);

  // Validate field length
  const validateField = (fieldName, value) => {
    if (value && value.length > 50) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than 50 characters`;
    }
    return null;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear any existing error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }
    
    if (!formData.role) {
      newErrors.role = "Role selection is required";
    }
    
    if (!formData.licenseId) {
      newErrors.licenseId = "License selection is required";
    }

    // Check for field length errors
    const fieldErrors = [
      validateField('department', formData.department),
      validateField('designation', formData.designation),
      validateField('location', formData.location),
    ].filter(error => error);
    
    if (fieldErrors.length > 0) {
      fieldErrors.forEach(error => {
        const field = error.toLowerCase().split(' ')[0];
        newErrors[field] = error;
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Create updated user object
      const updatedUser = {
        ...user,
        name: formData.name,
        role: formData.role,
        license: formData.licenseId,
        department: formData.department,
        designation: formData.designation,
        location: formData.location,
      };

      // Call the callback to update user
      if (onUserUpdated) {
        onUserUpdated(updatedUser, originalRole);
      }
      
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-50">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl font-semibold">
            <Edit3 className="h-5 w-5 text-blue-600" />
            <span>Edit User Details</span>
          </DialogTitle>
          <DialogDescription>
            Update user information. Email ID cannot be edited (use "Replace User" process for email change).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              User Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Input */}
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  maxLength={50}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Input (Read-only) */}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="pl-10 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Email ID cannot be edited</p>
              </div>

              {/* Role Selection */}
              <div>
                <Label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                >
                  <SelectTrigger className={errors.role ? "border-red-300 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="Regular User" className="bg-white hover:bg-gray-100">Regular User</SelectItem>
                    <SelectItem value="Manager" className="bg-white hover:bg-gray-100">Manager</SelectItem>
                    <SelectItem value="Company Admin" className="bg-white hover:bg-gray-100">Company Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {errors.role}
                  </p>
                )}
              </div>

              {/* License Selection */}
              <div>
                <Label htmlFor="licenseId" className="block text-sm font-medium text-gray-700 mb-2">
                  License Type *
                </Label>
                <Select
                  value={formData.licenseId}
                  onValueChange={(value) => handleInputChange("licenseId", value)}
                >
                  <SelectTrigger className={errors.licenseId ? "border-red-300 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Select license" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="Explore (Free)" className="bg-white hover:bg-gray-100">Explore (Free)</SelectItem>
                    <SelectItem value="Plan" className="bg-white hover:bg-gray-100">Plan</SelectItem>
                    <SelectItem value="Execute" className="bg-white hover:bg-gray-100">Execute</SelectItem>
                    <SelectItem value="Optimize" className="bg-white hover:bg-gray-100">Optimize</SelectItem>
                  </SelectContent>
                </Select>
                {errors.licenseId && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {errors.licenseId}
                  </p>
                )}
              </div>

              {/* Department Input */}
              <div>
                <Label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Enter department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`pl-10 ${errors.department ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                    maxLength={50}
                  />
                </div>
                {errors.department && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Designation Input */}
              <div>
                <Label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="designation"
                    type="text"
                    placeholder="Enter designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className={`pl-10 ${errors.designation ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                    maxLength={50}
                  />
                </div>
                {errors.designation && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {errors.designation}
                  </p>
                )}
              </div>

              {/* Location Input */}
              <div className="md:col-span-2">
                <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`pl-10 ${errors.location ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                    maxLength={50}
                  />
                </div>
                {errors.location && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {errors.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {formData.role !== originalRole && (
                <span className="text-amber-600 font-medium">
                  ⚠️ Role change will trigger confirmation dialog
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Updating..." : "Update User"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}