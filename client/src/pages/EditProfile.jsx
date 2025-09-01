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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Camera, Save, ArrowLeft, X } from "lucide-react";

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
  });
  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
  });
  const [hasChanges, setHasChanges] = useState(false);

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

  // Use profile data primarily, fallback to auth data
  const currentUser = user || authUser;

  // Update form data when user data is loaded
  useEffect(() => {
    if (currentUser) {
      const userData = {
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
      };
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [currentUser]);

  // Check for changes
  useEffect(() => {
    const hasFormChanges =
      formData.firstName !== originalData.firstName ||
      formData.lastName !== originalData.lastName ||
      selectedFile !== null;
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

      // Update form state with new data
      const newUserData = data.user;
      const updatedFormData = {
        firstName: newUserData.firstName || "",
        lastName: newUserData.lastName || "",
      };
      setFormData(updatedFormData);
      setOriginalData(updatedFormData);
      setSelectedFile(null);
      setImagePreview(null);

      // Invalidate all user-related queries with cache busting
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/verify"] });
      
      // Force immediate refetch of profile data to ensure avatar updates
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/profile"] });
      }, 100);
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required",
        variant: "destructive",
      });
      return;
    }

    updateProfile.mutate(formData);
  };

  const getInitials = () => {
    // Priority 1: Use first and last name initials
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
    }
    
    // Priority 2: Use first name + email prefix if only first name exists
    if (currentUser?.firstName && currentUser?.email) {
      const emailPrefix = currentUser.email.split('@')[0];
      return `${currentUser.firstName.charAt(0)}${emailPrefix.charAt(0)}`.toUpperCase();
    }
    
    // Priority 3: Use first two characters of email prefix as fallback
    if (currentUser?.email) {
      const emailPrefix = currentUser.email.split('@')[0];
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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-lg font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Update your personal information and profile picture
        </p>
      </div>

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
                  <UserAvatar 
                    user={currentUser} 
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

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={currentUser?.email || ""}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-2 pt-2">
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
                  disabled={updateProfile.isPending || !hasChanges}
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
