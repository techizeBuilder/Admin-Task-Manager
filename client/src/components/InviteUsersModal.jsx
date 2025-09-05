import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  UserPlus,
  AlertCircle,
  User,
  Building2,
  MapPin,
  Phone,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function InviteUsersModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    licenseId: "",
    department: "",
    designation: "",
    location: "",
    phone: "",
    sendInvitationEmail: true,
  });
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get organization license info
  const { data: licenseInfo } = useQuery({
    queryKey: ["/api/organization/license"],
    enabled: isOpen,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        email: "",
        role: "",
        licenseId: "",
        department: "",
        designation: "",
        location: "",
        phone: "",
        sendInvitationEmail: true,
      });
      setErrors({});
      setIsSubmitting(false);
      setIsValidating(false);
    }
  }, [isOpen]);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  };

  // Check if email exists in organization
  const checkEmailExists = async (email) => {
    try {
      const response = await fetch("/api/organization/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  // Validate field length
  const validateField = (fieldName, value) => {
    if (value && value.length > 100) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than 100 characters`;
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

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await fetch("/api/organization/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add user");
      }

      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "User Added Successfully!",
        description: `${formData.name} has been added to your organization.${formData.sendInvitationEmail ? ' An invitation email has been sent.' : ''}`,
        variant: "default",
        duration: 5000,
      });

      onClose();
      queryClient.invalidateQueries({
        queryKey: ["/api/organization/users"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/organization/license"],
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add user",
        description: error.message,
        variant: "destructive",
        duration: 8000,
      });
    },
  });

  // Validation state for form submission
  const isFormValid = formData.name.trim() && formData.email.trim() && formData.licenseId && Object.keys(errors).length === 0;

  // Submit user form with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        newErrors.email = emailError;
      }
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
      // Check email uniqueness
      setIsValidating(true);
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setErrors({ email: "Email already exists in the system" });
        setIsSubmitting(false);
        setIsValidating(false);
        return;
      }
      setIsValidating(false);

      // Submit user data
      await addUserMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Error adding user:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl font-semibold">
            <UserPlus className="h-5 w-5 text-blue-600" />
            <span>Add New User</span>
          </DialogTitle>
          <DialogDescription>
            Add a new user to your organization with appropriate role and license assignment.
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
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                    disabled={isValidating}
                  />
                  {isValidating && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <Label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className={errors.role ? "border-red-300 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular User">Regular User</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Company Admin">Company Admin</SelectItem>
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
                <Select value={formData.licenseId} onValueChange={(value) => handleInputChange('licenseId', value)}>
                  <SelectTrigger className={errors.licenseId ? "border-red-300 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Select license" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Explore (Free)">Explore (Free)</SelectItem>
                    <SelectItem value="Plan">Plan</SelectItem>
                    <SelectItem value="Execute">Execute</SelectItem>
                    <SelectItem value="Optimize">Optimize</SelectItem>
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
              <div>
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
                  />
                </div>
                {errors.location && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {errors.location}
                  </p>
                )}
              </div>

              {/* Phone Input */}
              <div>
                <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`pl-10 ${errors.phone ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Send Invitation Email Checkbox */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendInvitationEmail"
                    checked={formData.sendInvitationEmail}
                    onCheckedChange={(checked) => handleInputChange('sendInvitationEmail', checked)}
                  />
                  <Label
                    htmlFor="sendInvitationEmail"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Send Invitation Email (default: ON)
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Add user to your organization
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
                {isSubmitting ? "Saving..." : "Save User"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}