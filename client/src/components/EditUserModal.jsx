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
import MultiSelect from "@/components/ui/MultiSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Edit3 } from "lucide-react";

export function EditUserModal({ isOpen, onClose, user, onUserUpdated }) {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    role: [],
    licenseId: "",
    department: "",
    designation: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect primary admin
  const isPrimaryAdmin = user?.isPrimaryAdmin;

  const roleOptions = [
    { value: "employee", label: "Employee" },
    { value: "manager", label: "Manager" },
    { value: "org_admin", label: "Company Admin" },
  ];

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstname: user.firstName || "",
        lastname: user.lastName || "",
        role: Array.isArray(user.role) ? user.role : [user.role].filter(Boolean),
        licenseId: user.license || "Plan",
        department: user.department || "",
        designation: user.designation || "",
        location: user.location || "",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, user]);

  const validateField = (fieldName, value) => {
    if (value && value.length > 50) {
      return `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      } must be less than 50 characters`;
    }
    return null;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // New: handle roles change inline, prevent removing last role
  const handleRolesChange = (newRoles) => {
    if (!Array.isArray(newRoles)) newRoles = [newRoles].filter(Boolean);
    if (newRoles.length === 0) {
      setErrors((prev) => ({ ...prev, role: "At least one role is required" }));
      return; // keep previous roles
    }
    setFormData((prev) => ({ ...prev, role: newRoles }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = {};
    if (!formData.firstname.trim())
      newErrors.firstname = "First name is required";
    else if (formData.firstname.length > 50)
      newErrors.firstname = "First name must be less than 50 characters";
    if (formData.lastname && formData.lastname.length > 50)
      newErrors.lastname = "Last name must be less than 50 characters";

    // changed: validate role using unified key and array
    if (!Array.isArray(formData.role) || formData.role.length === 0)
      newErrors.role = "At least one role is required";

    if (!formData.licenseId || formData.licenseId.length === 0)
      newErrors.licenseId = "License is required";

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
      firstName: formData.firstname,
      lastName: formData.lastname,
      role: formData.role, // already an array
      designation: formData.designation,
      department: formData.department,
      location: formData.location,
    };

    if (onUserUpdated) onUserUpdated(updatedUser);

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
              Update user information. Email ID cannot be edited (use "Replace
              User" process for email change).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <Label htmlFor="firstname">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstname"
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstname}
                  onChange={(e) =>
                    handleInputChange("firstname", e.target.value)
                  }
                  maxLength={50}
                  className={
                    errors.firstname
                      ? "border-red-300 focus:border-red-500"
                      : ""
                  }
                />
                {errors.firstname && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.firstname}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="lastname">Last Name</Label>
                <Input
                  id="lastname"
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastname}
                  onChange={(e) =>
                    handleInputChange("lastname", e.target.value)
                  }
                  maxLength={50}
                  className={
                    errors.lastname ? "border-red-300 focus:border-red-500" : ""
                  }
                />
                {errors.lastname && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.lastname}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email ID cannot be edited
                </p>
              </div>

              {/* Role */}
              <div>
                <Label
                  htmlFor={`role_${user.id}`}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role <span className="text-red-500">*</span>
                </Label>

                <MultiSelect
                  options={roleOptions}
                  value={Array.isArray(formData.role) ? formData.role : [formData.role].filter(Boolean)}
                  onChange={handleRolesChange}
                  placeholder="Select role(s)"
              disabled={isPrimaryAdmin} // 👈 pass this prop to control interactivity
  className={isPrimaryAdmin ? "opacity-60 cursor-not-allowed" : ""}    />

                {isPrimaryAdmin && (
                  <p className="mt-1 text-xs text-gray-500">
                    Primary admin role cannot be changed
                  </p>
                )}

                {errors.role && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.role}
                  </p>
                )}
              </div>

              {/* License */}
              <div>
                <Label htmlFor="licenseId">
                  License Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.licenseId}
                  onValueChange={(value) => handleInputChange("licenseId", value)}
                  disabled={isPrimaryAdmin}
                >
                  <SelectTrigger
                    className={
                      errors.licenseId
                        ? "border-red-300 focus:border-red-500"
                        : ""
                    }
                  >
                    <SelectValue placeholder="Select license" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Explore (Free)">Explore (Free)</SelectItem>
                    <SelectItem value="Plan">Plan</SelectItem>
                    <SelectItem value="Execute">Execute</SelectItem>
                    <SelectItem value="Optimize">Optimize</SelectItem>
                  </SelectContent>
                </Select>

                {isPrimaryAdmin && (
                  <p className="mt-1 text-xs text-gray-500">
                    Primary admin license cannot be changed
                  </p>
                )}

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
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  type="text"
                  placeholder="Enter designation"
                  value={formData.designation}
                  onChange={(e) =>
                    handleInputChange("designation", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting ? "Updating..." : "Update User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
