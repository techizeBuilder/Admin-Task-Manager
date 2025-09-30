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
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

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

  // Confirmation dialog state
  const [isRoleChangeDialogOpen, setIsRoleChangeDialogOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState(null);

  const { toast } = useToast();
  const originalRole = user?.role;

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
      setPendingRole(null);
      setIsRoleChangeDialogOpen(false);
    }
  }, [isOpen, user]);

  const validateField = (fieldName, value) => {
    if (value && value.length > 50) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than 50 characters`;
    }
    return null;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleRoleSelect = (newRole) => {
    if (newRole === formData.role) return;
    setPendingRole(newRole);
    setIsRoleChangeDialogOpen(true);
  };

  const confirmPendingRole = () => {
    setFormData((prev) => ({ ...prev, role: pendingRole }));
    toast({
      title: "Role Changed",
      description: `Role updated to ${pendingRole}. Remember to save changes.`,
    });
    setPendingRole(null);
    setIsRoleChangeDialogOpen(false);
  };

  const cancelPendingRole = () => {
    setPendingRole(null);
    setIsRoleChangeDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.length > 50) newErrors.name = "Name must be less than 50 characters";
    if (!formData.role) newErrors.role = "Role selection is required";
    if (!formData.licenseId) newErrors.licenseId = "License selection is required";

    ["department", "designation", "location"].forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) newErrors[f] = err;
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const updatedUser = {
      ...user,
      name: formData.name,
      role: formData.role,
      license: formData.licenseId,
      department: formData.department,
      designation: formData.designation,
      location: formData.location,
    };

    if (onUserUpdated) onUserUpdated(updatedUser, originalRole);

    toast({
      title: "User Updated",
      description: "User details saved successfully.",
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  maxLength={50}
                  className={errors.name ? "border-red-300 focus:border-red-500" : ""}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={user?.email || ""} disabled className="bg-gray-50 text-gray-500" />
                <p className="mt-1 text-xs text-gray-500">Email ID cannot be edited</p>
              </div>

              {/* Role */}
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={handleRoleSelect}>
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
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.role}
                  </p>
                )}
              </div>

              {/* License */}
              <div>
                <Label htmlFor="licenseId">License Type *</Label>
                <Select value={formData.licenseId} onValueChange={(value) => handleInputChange("licenseId", value)}>
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
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.licenseId}
                  </p>
                )}
              </div>

              {/* Other fields */}
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  type="text"
                  placeholder="Enter department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  type="text"
                  placeholder="Enter designation"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white hover:bg-blue-700">
                {isSubmitting ? "Updating..." : "Update User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation Modal */}
      <AlertDialog open={isRoleChangeDialogOpen} onOpenChange={setIsRoleChangeDialogOpen}>
        <AlertDialogContent className='bg-white'>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Role Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are changing role to <strong>{pendingRole}</strong>.  
              This will update their access rights and permissions.  
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelPendingRole}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPendingRole} className="bg-amber-600 hover:bg-amber-700">
              Confirm Role Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
