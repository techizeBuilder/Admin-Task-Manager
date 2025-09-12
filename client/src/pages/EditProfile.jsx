import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Camera,
  Save,
  ArrowLeft,
  X,
  Shield,
  Clock,
  Key,
  Settings,
  Bell,
  Globe,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuthStore } from "../stores/useAuthStore";

export default function EditProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    department: "",
    manager: "no-manager",
    organizationName: "",
    timeZone: "",
    emailNotifications: true,
    inAppNotifications: true,
    pushNotifications: false,
  });
  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    department: "",
    manager: "no-manager",
    organizationName: "",
    timeZone: "",
    emailNotifications: true,
    inAppNotifications: true,
    pushNotifications: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [hasChanges, setHasChanges] = useState(false);
 const [errors, setErrors] = useState({
    phoneNumber: "",
    firstName: "",
    lastName: "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
 
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const firstPasswordFieldRef = useRef(null);
  // Fetch current user profile - try auth/verify first as fallback
  const { data: authUser } = useQuery({
    queryKey: ["/api/auth/verify"],
    retry: false,
  });

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      // Try to get updated user data from the database using the auth user ID
      if (authUser?.id) {
        const response = await fetch(`/api/users/${authUser.id}`);
        if (response.ok) {
          const userData = await response.json();
          console.log("Fetched user data directly:", userData);
          return userData;
        }
      }
      return null;
    },
    retry: 1,
    enabled: !!authUser?.id,
  });
// Fetch organization details once
const { data: organization,  } = useQuery({
  queryKey: ["/api/organization/details"],
  enabled: !!localStorage.getItem("token"), // Only call if token exists
  queryFn: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const res = await fetch("/api/organization/details", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 401 || res.status === 403) {
      // Token invalid or expired
      localStorage.removeItem("token");
      return null;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  },
  retry: false,
  staleTime: Infinity,  // Keep cached forever
  cacheTime: Infinity,
});

console.log('currentUser',user)
  // Use profile data primarily, fallback to auth data
  const currentUser = user || authUser;

  // Update form data when user data is loaded
  useEffect(() => {
    if (currentUser) {
      const userData = {
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        phoneNumber: currentUser.phoneNumber || "",
        department: currentUser.department || "",
        manager: currentUser.manager || "no-manager",
        organizationName:
          organization?.name ,
        timeZone:"Asia/Kolkata",
        emailNotifications: currentUser.emailNotifications !== false,
        inAppNotifications: currentUser.inAppNotifications !== false,
        pushNotifications: currentUser.pushNotifications === true,
      };
      setFormData(userData);
      setOriginalData(userData);

      // Validate phone number on load
      if (
        userData.phoneNumber &&
        userData.phoneNumber.trim() !== "" &&
        !validatePhoneNumber(userData.phoneNumber)
      ) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: "Please enter a valid phone number (10-15 digits)",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: "",
        }));
      }
    }
  }, [currentUser]);
    useEffect(() => {
    if (showPasswordModal && firstPasswordFieldRef.current) {
      setTimeout(() => firstPasswordFieldRef.current?.focus(), 50);
    }
  }, [showPasswordModal]);
  // Check for changes
  useEffect(() => {
    const hasFormChanges =
      Object.keys(formData).some(
        (key) => formData[key] !== originalData[key]
      ) || selectedFile !== null;
    setHasChanges(hasFormChanges);
  }, [formData, originalData, selectedFile]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data) => {
      // Use direct user update API instead of authenticated profile endpoint
      if (!authUser?.id) {
        throw new Error("User not authenticated");
      }

      const formDataToSend = new FormData();

      // Add text fields
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          formDataToSend.append(key, data[key]);
        }
      });

      // Add image file if selected
      if (selectedFile) {
        formDataToSend.append("profileImage", selectedFile);
      }

      console.log("Updating profile for user ID:", authUser.id);
      console.log("Update data:", data);

      const response = await fetch(`/api/users/${authUser.id}/profile`, {
        method: "PUT",
        body: formDataToSend,
      });

      console.log("Update response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update failed:", errorText);
        throw new Error(errorText || "Failed to update profile");
      }

      const result = await response.json();
      console.log("Update successful:", result);
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      const updatedUserData = {
        ...data.user,
        id: data.user.id || data.user._id,
      };

      // Optimistic cache update (header + edit profile dono refresh ho jayenge)
      queryClient.setQueryData(["/api/auth/verify"], updatedUserData);
      queryClient.setQueryData(["/api/profile"], updatedUserData);

      // Invalidate the header's user data query to trigger immediate header update
      if (data.user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["/api/users", data.user.id],
        });
      }

      // Reset local preview
      setSelectedFile(null);
      setImagePreview(null);

      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (name === "firstName" || name === "lastName") {
      setErrors((prev) => ({
        ...prev,
        [name]: value.trim() ? "" : "This field is required",
      }));
    }

    if (name === "phoneNumber") {
      if (value.trim() === "") {
        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
      } else if (!validatePhoneNumber(value)) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: "Please enter a valid phone number (10-15 digits)",
        }));
      } else {
        setErrors((prev) => ({ ...prev, phoneNumber: "" }));
      }
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };
 const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast({
        title: "Validation Error",
        description: "All password fields are required",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!validatePasswordStrength(passwordData.newPassword)) {
      toast({
        title: "Validation Error",
        description:
          "Password must be at least 8 characters with uppercase, lowercase, and numbers",
        variant: "destructive",
      });
      return;
    }

    try {
      setPasswordSubmitting(true);
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordModal(false);
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a .jpg, .jpeg, .png, or .webp file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    // Clean up previous preview URL to prevent memory leaks
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedFile(file);
    // Create immediate preview using object URL for better performance
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    console.log("Image selected for preview:", previewUrl);
  };

  const handleRemoveImage = () => {
    // Clean up preview URL to prevent memory leaks
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  console.log("Current image preview URL:", errors);
  // Cleanup effect for object URLs
  useEffect(() => {
    return () => {
      // Clean up any remaining object URLs when component unmounts
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

   const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (errors.phoneNumber) {
      newErrors.phoneNumber =
        "Please fix the phone number error before submitting";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setErrors((prev) => ({
      ...prev,
      firstName: "",
      lastName: "",
    }));

    const dataToSend = { ...formData };
    if (isAdminWithReadOnlyOrg()) delete dataToSend.organizationName;
    if (dataToSend.manager === "no-manager") dataToSend.manager = "";
    updateProfile.mutate(dataToSend);
  };

  // Validation functions
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validatePasswordStrength = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  };

  // Helper functions
  const isOrgUser = () => {
    return currentUser?.role !== "individual" && currentUser?.organizationId;
  };

  // Check if user is admin and should have read-only organization info
  const isAdminWithReadOnlyOrg = () => {
    const adminRoles = ["admin", "company_admin", "owner", "super_admin"];
    return adminRoles.includes(currentUser?.role[0]?.toLowerCase());
  };

  // Check if organization section should be shown
  const shouldShowOrgSection = () => {
    return isOrgUser() || isAdminWithReadOnlyOrg();
  };

const getRoleBadgeVariant = (role) => {
  const variants = {
    org_admin: "secondary",
    admin: "secondary",
    manager: "outline",
    employee: "destructive",
    individual: "success",
  };
  return variants[role] || "default";
};

 const getRoleDisplayName = (role) => {
  const names = {
    org_admin: "Organization Admin",
    admin: "Company Admin",
    manager: "Manager",
    employee: "Regular User",
    individual: "Individual",
  };
  return names[role] || role;
};

  const getLicenseDisplayName = (license) => {
    const names = {
      explore_free: "Explore Free",
      plan: "Plan",
      execute: "Execute",
      optimize: "Optimize",
    };
    return names[license] || license;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = () => {
    // Priority 1: Use first and last name initials
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(
        0
      )}`.toUpperCase();
    }

    // Priority 2: Use first name + email prefix if only first name exists
    if (currentUser?.firstName && currentUser?.email) {
      const emailPrefix = currentUser.email.split("@")[0];
      return `${currentUser.firstName.charAt(0)}${emailPrefix.charAt(
        0
      )}`.toUpperCase();
    }

    // Priority 3: Use first two characters of email prefix as fallback
    if (currentUser?.email) {
      const emailPrefix = currentUser.email.split("@")[0];
      return emailPrefix.substring(0, 2).toUpperCase();
    }

    return "U";
  };

  const getCurrentProfileImage = () => {
    if (imagePreview) return imagePreview;
    if (currentUser?.profileImageUrl) return currentUser.profileImageUrl;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebarDark mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-2">
      {/* Header */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your profile details. Email cannot be changed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {/* Show preview first, then current profile image, then initials fallback */}
                <UserAvatar
                  user={{
                    ...currentUser,
                    profileImageUrl:
                      imagePreview || currentUser?.profileImageUrl,
                  }}
                  size="xl"
                  className="h-24 w-24"
                />

                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  {getCurrentProfileImage() ? "Change Photo" : "Upload Photo"}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Accepted formats: .jpg, .jpeg, .png, .webp
                  <br />
                  Maximum size: 2MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <User className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                <div className="w-full">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onBlur={(e) =>
                        setErrors((p) => ({
                          ...p,
                          firstName: e.target.value.trim()
                            ? ""
                            : "First name is required",
                        }))
                      }
                      placeholder="First name"
                      data-testid="input-first-name"
                      className={`w-full  p-2  ${
                        errors.firstName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="w-full">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onBlur={(e) =>
                        setErrors((p) => ({
                          ...p,
                          lastName: e.target.value.trim()
                            ? ""
                            : "Last name is required",
                        }))
                      }
                      placeholder="Last name"
                      data-testid="input-last-name"
                      className={`w-full  p-2  ${
                        errors.lastName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                  {/* Email */}
                  <div className="w-full">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      value={currentUser?.email || ""}
                      disabled={true}
                      readOnly={shouldShowOrgSection()}
                      className={`w-full ${
                        shouldShowOrgSection()
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      data-testid="input-email"
                    />
                    {shouldShowOrgSection() && (
                      <p className="text-xs text-gray-500 mt-1">
                        Email changes are managed by your organization admin
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="w-full">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="10-15 digits"
                      data-testid="input-phone"
                      className={`w-full ${
                        errors.phoneNumber
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {errors.phoneNumber ? (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.phoneNumber}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {shouldShowOrgSection() && (
                <>
                  {/* Organization Information */}
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5" />
                      Organization Information
                    </h3>
                    {isAdminWithReadOnlyOrg() && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-700">
                          <strong>Note:</strong> Organization information is
                          read-only for administrators to maintain data
                          integrity.
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="organizationName">
                          Organization Name
                        </Label>
                        <Input
                          id="organizationName"
                          name="organizationName"
                          value={formData.organizationName}
                          onChange={handleInputChange}
                          disabled={!user.isPrimaryAdmin}
                          className={
                         !user.isPrimaryAdmin
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                          }
                          placeholder={
                          !user.isPrimaryAdmin
                              ? "Enter organization name"
                              : ""
                          }
                          data-testid="input-organization"
                        />
                        {/* {isAdminWithReadOnlyOrg() && (
                          <p className="text-xs text-gray-500 mt-1">
                            Organization information is read-only for
                            administrators
                          </p>
                        )} */}
                        {!user.isPrimaryAdmin && (
                          <p className="text-xs text-gray-500 mt-1">
                            Organization name is managed by administrators
                          </p>
                        )}
                      </div>
                      {/* <div>
                        <Label htmlFor="department">Department/Team</Label>
                        <Input
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          placeholder="e.g., Engineering, Marketing"
                          data-testid="input-department"
                        />
                      </div>
                      {shouldShowOrgSection() && (
                        <div>
                          <Label htmlFor="manager">Manager/Supervisor</Label>
                          <Select
                            name="manager"
                            value={formData.manager}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                manager: value,
                              }))
                            }
                          >
                            <SelectTrigger data-testid="select-manager">
                              <SelectValue placeholder="Select manager" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="no-manager">
                                No manager assigned
                              </SelectItem>
                              <SelectItem value="john-doe">John Doe</SelectItem>
                              <SelectItem value="jane-smith">
                                Jane Smith
                              </SelectItem>
                              <SelectItem value="mike-wilson">
                                Mike Wilson
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )} */}
                    </div>
                  </div>
                </>
              )}

              {/* Access & Roles (Read-only) */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Key className="h-5 w-5" />
                  Access & Roles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Assigned Role</Label>
                   <div className="mt-2 flex flex-wrap gap-2">
  {Array.isArray(currentUser?.role) ? (
    currentUser.role.map((role) => (
      <Badge
        key={role}
        // variant={getRoleBadgeVariant(role)}
        data-testid={`badge-role-${role}`}
        variant="outline"
      >
        {getRoleDisplayName(role)}
      </Badge>
    ))
  ) : (
    <Badge
      // variant={getRoleBadgeVariant(currentUser?.role)}
      variant="outline"
      data-testid="badge-role"
    >
      {getRoleDisplayName(currentUser?.role)}
    </Badge>
  )}
</div>
                  </div>
                  <div>
                    <Label>License Tier</Label>
                    <div className="mt-2">
                      <Badge variant="outline" data-testid="badge-license">
                        {getLicenseDisplayName(
                          currentUser?.license || "explore_free"
                        )}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label>Date of Joining</Label>
                    <p
                      className="text-sm text-gray-600 mt-2"
                      data-testid="text-join-date"
                    >
                      {formatDate(currentUser?.createdAt)}
                    </p>
                  </div>
                  {/* {currentUser?.licenseExpiresAt && ( */}
                    <div>
                      <Label>License Expiring On</Label>
                      <p
                        className="text-sm text-gray-600 mt-2"
                        data-testid="text-license-expiry"
                      >
                        {formatDate(currentUser.licenseExpiresAt)}
                      </p>
                    </div>
                  {/* // )} */}
                </div>
              </div>

              {/* Security Section */}
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5" />
                  Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Last Login</Label>
                    <p
                      className="text-sm text-gray-600 mt-2"
                      data-testid="text-last-login"
                    >
                      {formatDate(currentUser?.lastLoginAt) || "Not available"}
                    </p>
                  </div>
                  <div>
                    <Label>Password</Label>
                    <div className="mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPasswordModal(true)}
                        data-testid="button-change-password"
                      >
                        Change Password
                    </Button>
                    </div>
                  </div>
                </div>

                {/* Password Change Section */}
                  <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-change-password">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password. Make sure to use a strong one.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-4"
            data-testid="form-change-password"
          >
            <div>
              <Label htmlFor="currentPassword">Current Password *</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                ref={firstPasswordFieldRef}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                data-testid="input-current-password"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                data-testid="input-new-password"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be 8+ chars with uppercase, lowercase, and numbers
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                data-testid="input-confirm-password"
              />
            </div>
            <DialogFooter >
              <div className="flex w-full justify-between gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={passwordSubmitting}
                  data-testid="button-cancel-password"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                size="sm"
                className="bg-blue-500 text-white"
                disabled={passwordSubmitting}
                data-testid="button-save-password"
              >
                {passwordSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                    Updating...
                  </div>
                ) : (
                  "Update Password"
                )}
              </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
              </div>

              {/* Preferences Section */}
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5" />
                  Preferences
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timeZone">Time Zone</Label>
                    <Select
                      name="timeZone"
                      value={formData.timeZone}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, timeZone: value }))
                      }
                    >
                      <SelectTrigger data-testid="select-timezone">
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">
                          India (UTC+05:30)
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          Eastern Time (UTC-05:00)
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time (UTC-08:00)
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          London (UTC+00:00)
                        </SelectItem>
                        <SelectItem value="Asia/Tokyo">
                          Tokyo (UTC+09:00)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-4 block">
                      Notification Settings
                    </Label>
                    <div className="space-y-3">
                      <div className="notification-setting">
                        <div className="notification-label">
                          <Label
                            htmlFor="emailNotifications"
                            className="notification-title"
                          >
                            Email Notifications
                          </Label>
                          <p className="notification-description">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={formData.emailNotifications}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              emailNotifications: checked,
                            }))
                          }
                          data-testid="switch-email-notifications"
                        />
                      </div>

                      <div className="notification-setting">
                        <div className="notification-label">
                          <Label
                            htmlFor="inAppNotifications"
                            className="notification-title"
                          >
                            In-App Notifications
                          </Label>
                          <p className="notification-description">
                            Show notifications within the application
                          </p>
                        </div>
                        <Switch
                          id="inAppNotifications"
                          checked={formData.inAppNotifications}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              inAppNotifications: checked,
                            }))
                          }
                          data-testid="switch-in-app-notifications"
                        />
                      </div>

                      <div className="notification-setting">
                        <div className="notification-label">
                          <Label
                            htmlFor="pushNotifications"
                            className="notification-title"
                          >
                            Push Notifications
                          </Label>
                          <p className="notification-description">
                            Receive push notifications on your device
                          </p>
                        </div>
                        <Switch
                          id="pushNotifications"
                          checked={formData.pushNotifications}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              pushNotifications: checked,
                            }))
                          }
                          data-testid="switch-push-notifications"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  updateProfile.isPending || !hasChanges || errors.phoneNumber
                }
                className="bg-blue-800 hover:bg-blue-700 text-white cursor-pointer text-xs"
              >
                {updateProfile.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
