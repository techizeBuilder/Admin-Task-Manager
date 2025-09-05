import { useState, useEffect, useCallback, useRef } from "react";
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
  Plus,
  Mail,
  X,
  UserPlus,
  Check,
  AlertCircle,
  Users,
  Shield,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function InviteUsersModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Regular User",
    licenseId: "",
    department: "",
    designation: "",
    location: "",
    sendInvitationEmail: true,
  });
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const validationTimers = useRef({});

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
        role: "Regular User",
        licenseId: "",
        department: "",
        designation: "",
        location: "",
        sendInvitationEmail: true,
      });
      setErrors({});
      setIsSubmitting(false);
      setIsValidating(false);
    }
  }, [isOpen]);

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  // Form validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.length > 50) {
      return "Name cannot exceed 50 characters";
    }
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      return "Email is required";
    }
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validateField = (field, value) => {
    if (!value && ['department', 'designation', 'location'].includes(field)) {
      return ""; // Optional fields
    }
    if (value && value.length > 50) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed 50 characters`;
    }
    return "";
  };

  // Check email uniqueness across entire platform
  const checkEmailExists = async (email) => {
    try {
      const response = await fetch(`/api/users/check-email-exists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Validate field in real-time
    let error = "";
    if (field === 'name') {
      error = validateName(value);
    } else if (field === 'email') {
      error = validateEmail(value);
    } else {
      error = validateField(field, value);
    }

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Get available licenses
  const { data: availableLicenses = [] } = useQuery({
    queryKey: ["/api/organization/available-licenses"],
    enabled: isOpen,
  });

  // Role options as per client specs
  const roleOptions = [
    { value: "Regular User", label: "Regular User" },
    { value: "Manager", label: "Manager" },
    { value: "Company Admin", label: "Company Admin" },
  ];

  // Validate license availability
  const validateLicenseAvailability = (currentInvites, licenseInfo) => {
    if (!licenseInfo) return true;

    const totalLicensesNeeded = currentInvites.reduce((total, invite) => {
      if (invite.email && !invite.emailError && !invite.existsError) {
        return total + calculateLicenseRequirement(invite.roles);
      }
      return total;
    }, 0);

    return totalLicensesNeeded <= licenseInfo.availableSlots;
  };

  // Immediate email update without validation to prevent focus loss
  const updateInviteEmailImmediate = (index, email) => {
    setInviteList((prev) =>
      prev.map((invite, i) =>
        i === index
          ? {
              ...invite,
              email,
              // Clear errors only if email is being changed
              emailError: "",
              existsError: "",
              licenseError: "",
              isValid: false,
              isChecking: false,
            }
          : invite,
      ),
    );
  };

  // Debounced validation function
  const debouncedValidateEmail = useCallback(
    async (index, email) => {
      // Clear any existing timer for this index
      if (validationTimers.current[index]) {
        clearTimeout(validationTimers.current[index]);
      }

      // Set a new timer
      validationTimers.current[index] = setTimeout(async () => {
        await validateEmailAsync(index, email);
      }, 800); // Wait 800ms after user stops typing
    },
    [inviteList, licenseInfo],
  );

  // Comprehensive email validation (async)
  const validateEmailAsync = async (index, email) => {
    if (!email.trim()) {
      return;
    }

    // Set checking state
    setInviteList((prev) =>
      prev.map((invite, i) =>
        i === index
          ? {
              ...invite,
              isChecking: true,
              emailError: "",
              existsError: "",
              licenseError: "",
            }
          : invite,
      ),
    );

    // Basic email format validation
    const emailError = validateEmail(email);

    if (emailError) {
      setInviteList((prev) =>
        prev.map((invite, i) =>
          i === index
            ? {
                ...invite,
                emailError,
                isValid: false,
                isChecking: false,
              }
            : invite,
        ),
      );
      return;
    }

    // Check for duplicates within current invite list
    const currentEmails = inviteList
      .map((invite, i) => ({
        email: invite.email.toLowerCase().trim(),
        index: i,
      }))
      .filter((item) => item.email !== "");

    const duplicateExists = currentEmails.some(
      (item) =>
        item.email === email.toLowerCase().trim() && item.index !== index,
    );

    if (duplicateExists) {
      setInviteList((prev) =>
        prev.map((invite, i) =>
          i === index
            ? {
                ...invite,
                existsError:
                  "This email is already added in another invitation row",
                isValid: false,
                isChecking: false,
              }
            : invite,
        ),
      );
      return;
    }

    // Check if email exists in organization
    const emailExists = await checkEmailExists(
      email,
      licenseInfo?.organizationId,
    );

    if (emailExists) {
      setInviteList((prev) =>
        prev.map((invite, i) =>
          i === index
            ? {
                ...invite,
                existsError: `${email} already exists. That user will not be reinvited.`,
                isValid: false,
                isChecking: false,
              }
            : invite,
        ),
      );
      return;
    }

    // Validate license availability
    const updatedInvites = [...inviteList];
    updatedInvites[index] = {
      ...updatedInvites[index],
      email,
      emailError: "",
      existsError: "",
    };

    const licenseValid = validateLicenseAvailability(
      updatedInvites,
      licenseInfo,
    );
    const licenseError = licenseValid
      ? ""
      : "Not enough licenses available for the selected role(s).";

    // Final validation state
    const isValid = !emailError && !emailExists && licenseValid && email.trim() !== "";

    setInviteList((prev) =>
      prev.map((invite, i) =>
        i === index
          ? {
              ...invite,
              emailError,
              existsError: "",
              licenseError,
              isValid,
              isChecking: false,
            }
          : invite,
      ),
    );
  };

  // Validate email on blur
  const handleEmailBlur = async (index, email) => {
    // Clear any pending debounced validation
    if (validationTimers.current[index]) {
      clearTimeout(validationTimers.current[index]);
    }
    
    // Don't validate empty emails
    if (!email.trim()) {
      return;
    }

    // Check for existing invitations
    await checkExistingInvitation(index, email.trim());
  };

  // Check if email has already been invited
  const checkExistingInvitation = async (index, email) => {
    try {
      setInviteList((prev) =>
        prev.map((invite, i) =>
          i === index
            ? { ...invite, isChecking: true, existsError: "" }
            : invite,
        ),
      );

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch("/api/organization/check-invitation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      setInviteList((prev) =>
        prev.map((invite, i) =>
          i === index
            ? {
                ...invite,
                isChecking: false,
                existsError: data.exists ? data.message : "",
                isValid: !data.exists && invite.email && !invite.emailError,
              }
            : invite,
        ),
      );
    } catch (error) {
      console.error("Error checking invitation:", error);
      setInviteList((prev) =>
        prev.map((invite, i) =>
          i === index
            ? {
                ...invite,
                isChecking: false,
                existsError: `Unable to verify email: ${error.message}`,
                isValid: false,
              }
            : invite,
        ),
      );
    }
  };

  // Toggle role selection with license validation
  const toggleRole = async (index, role) => {
    setInviteList((prev) =>
      prev.map((invite, i) => {
        if (i !== index) return invite;

        const currentRoles = invite.roles;
        if (role === "member") {
          // Member role cannot be removed
          return invite;
        }

        const hasRole = currentRoles.includes(role);
        const newRoles = hasRole
          ? currentRoles.filter((r) => r !== role)
          : [...currentRoles, role];

        // Validate license requirements with new roles
        const updatedInvites = [...prev];
        updatedInvites[index] = { ...invite, roles: newRoles };

        const licenseValid = validateLicenseAvailability(
          updatedInvites,
          licenseInfo,
        );
        const licenseError = licenseValid
          ? ""
          : "Not enough licenses available for the selected role(s).";

        const isValid =
          invite.email &&
          !invite.emailError &&
          !invite.existsError &&
          licenseValid;

        return {
          ...invite,
          roles: newRoles,
          licenseError,
          isValid,
        };
      }),
    );
  };

  // Validation state for form submission
  const isFormValid = formData.name.trim() && formData.email.trim() && formData.licenseId && Object.keys(errors).length === 0;

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

  // Test toast function
  const testToast = () => {
    console.log("Testing toast functionality");
    toast({
      title: "Test Toast",
      description:
        "If you can see this, the toast system is working correctly.",
      variant: "default",
      duration: 3000,
    });
  };

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
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            Invite Users
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 mt-2">
            Send invitations to new team members. They'll receive an email with
            instructions to join your organization.
          </DialogDescription>
        </DialogHeader>

        {/* License Information */}
        {licenseInfo && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-slate-600" />
              <div>
                <h3 className="text-sm font-medium text-slate-800">
                  License Usage
                </h3>
                <p className="text-sm text-slate-700">
                  {licenseInfo.usedLicenses} of {licenseInfo.totalLicenses}{" "}
                  licenses used •{licenseInfo.availableSlots} slots available
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Add User Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New User
              </h3>
            </div>

            {/* User Details Form */}
            <div className="border border-gray-200 rounded-lg p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field - Mandatory */}
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
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

                {/* Email Field - Mandatory */}
                <div className="md:col-span-2">
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email ID <span className="text-red-500">*</span>
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
                    />
                    {isValidating && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
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

                {/* Role Field - Mandatory */}
                <div>
                  <Label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* License Assignment - Mandatory */}
                <div>
                  <Label htmlFor="licenseId" className="block text-sm font-medium text-gray-700 mb-2">
                    License Assignment <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="licenseId"
                    value={formData.licenseId}
                    onChange={(e) => handleInputChange('licenseId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select License</option>
                    {availableLicenses.map(license => (
                      <option key={license.id} value={license.id}>
                        {license.name} - {license.duration}
                      </option>
                    ))}
                  </select>
                  {errors.licenseId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      {errors.licenseId}
                    </p>
                  )}
                </div>

                {/* Department - Optional */}
                <div>
                  <Label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Enter department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    maxLength={50}
                    className={errors.department ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.department && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Designation - Optional */}
                <div>
                  <Label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                    Designation
                  </Label>
                  <Input
                    id="designation"
                    type="text"
                    placeholder="Enter designation"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    maxLength={50}
                    className={errors.designation ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.designation && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      {errors.designation}
                    </p>
                  )}
                </div>

                {/* Location - Optional */}
                <div className="md:col-span-2">
                  <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    maxLength={50}
                    className={errors.location ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}
                  />
                  {errors.location && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      {errors.location}
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
