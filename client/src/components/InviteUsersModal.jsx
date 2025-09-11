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
import MultiSelect from "@/components/ui/MultiSelect"
import {
  Mail,
  UserPlus,
  AlertCircle,
  User,
  Building2,
  MapPin,
  Phone,
  Briefcase,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AddUserModal({ isOpen, onClose, onUserAdded }) {
  const [users, setUsers] = useState([{
    id: 1,
    name: "",
    email: "",
    role: [], // Changed from role to roles array
    licenseId: "",
    department: "",
    designation: "",
    location: "",
    phone: "",
    sendInvitationEmail: true,
  }]);
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

const roleOptions = [
  { value: "employee", label: "Regular User" },
  { value: "manager", label: "Manager" },
  { value: "org_admin", label: "Company Admin" },
]
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setUsers([{
        id: 1,
        name: "",
        email: "",
        role: "",
        licenseId: "",
        department: "",
        designation: "",
        location: "",
        phone: "",
        sendInvitationEmail: true,
      }]);
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

  // Check if email can be invited
  const checkEmailExists = async (email) => {
    try {
      const response = await fetch("/api/organization/check-invitation", {
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

  // Add new user row
  const addUserRow = () => {
    const newId = Math.max(...users.map(u => u.id)) + 1;
    setUsers([...users, {
      id: newId,
      name: "",
      email: "",
      role: "",
      licenseId: "",
      department: "",
      designation: "",
      location: "",
      phone: "",
      sendInvitationEmail: true,
    }]);
  };

  // Remove user row
  const removeUserRow = (id) => {
    if (users.length > 1) {
      setUsers(users.filter(user => user.id !== id));
      // Clear errors for removed user
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`user_${id}_`)) {
          delete newErrors[key];
        }
      });
      setErrors(newErrors);
    }
  };

  // Handle user input changes
  const handleUserChange = (id, field, value) => {
    console.log('handleUserChange called:', { id, field, value }); // Debug log
    setUsers(users.map(user => 
      user.id === id ? { ...user, [field]: value } : user
    ));

    // Clear error for this field
    const errorKey = `user_${id}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Invitation mutation
  const inviteUsersMutation = useMutation({
    mutationFn: async (inviteData) => {
     
      const response = await fetch("/api/organization/invite-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ invites: inviteData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to send invitations");
      }

      return result;
    },
    onSuccess: (data) => {
      const successCount = data.success?.length || 0;
      const errorCount = data.errors?.length || 0;
      
      if (successCount > 0 && errorCount === 0) {
        toast({
          title: "Invitations Sent Successfully!",
          description: `${successCount} user${successCount > 1 ? 's have' : ' has'} been invited to your organization.`,
          variant: "default",
          duration: 5000,
        });
      } else if (successCount > 0 && errorCount > 0) {
        toast({
          title: "Partial Success",
          description: `${successCount} invitations sent successfully, ${errorCount} failed.`,
          variant: "default",
          duration: 8000,
        });
      }

      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/organization/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organization/license"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Invitations",
        description: error.message,
        variant: "destructive",
        duration: 8000,
      });
    },
  });

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);



    try {
      let inviteData = [];
      const newErrors = {};
      console.log('invitied--user',users)
      // Validate multiple users
      for (const user of users) {
        const userPrefix = `user_${user.id}_`;
        
        if (!user.name.trim()) {
          newErrors[`${userPrefix}name`] = "Name is required";
        }
        
        if (!user.email.trim()) {
          newErrors[`${userPrefix}email`] = "Email is required";
        } else {
          const emailError = validateEmail(user.email);
          if (emailError) {
            newErrors[`${userPrefix}email`] = emailError;
          }
        }
        
        if (!user.role) {
          newErrors[`${userPrefix}role`] = "Role is required";
        }
        
        if (!user.licenseId) {
          newErrors[`${userPrefix}licenseId`] = "License is required";
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      // Check for duplicate emails within the form
      const emails = users.map(u => u.email.toLowerCase().trim());
      const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
      if (duplicates.length > 0) {
        toast({
          title: "Duplicate Emails",
          description: "Please remove duplicate email addresses.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check existing emails
      for (const user of users) {
        const emailExists = await checkEmailExists(user.email);
        if (emailExists) {
          newErrors[`user_${user.id}_email`] = "This email already exists or has been invited";
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      inviteData = users.map(user => ({
        name: user.name.trim(),
        email: user.email.toLowerCase().trim(),
        role: user.role,
        licenseId: user.licenseId,
        department: user.department?.trim() || null,
        designation: user.designation?.trim() || null,
        location: user.location?.trim() || null,
        phone: user.phone?.trim() || null,
        sendEmail: user.sendInvitationEmail
      }));


   
      await inviteUsersMutation.mutateAsync(inviteData);
      setIsSubmitting(false);

    } catch (error) {
      console.error("Error inviting users:", error);
      setIsSubmitting(false);
    }
  };

  const renderUserRow = (user, index) => (
    <div key={user.id} className="p-4 border border-gray-200 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">User {index + 1}</h4>
        {users.length > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeUserRow(user.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <Label htmlFor={`name_${user.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </Label>
          <Input
            id={`name_${user.id}`}
            type="text"
            placeholder="Enter full name"
            value={user.name}
            onChange={(e) => handleUserChange(user.id, "name", e.target.value)}
            className={errors[`user_${user.id}_name`] ? "border-red-300" : ""}
          />
          {errors[`user_${user.id}_name`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`user_${user.id}_name`]}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor={`email_${user.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </Label>
          <Input
            id={`email_${user.id}`}
            type="email"
            placeholder="Enter email address"
            value={user.email}
            onChange={(e) => handleUserChange(user.id, "email", e.target.value)}
            className={errors[`user_${user.id}_email`] ? "border-red-300" : ""}
          />
          {errors[`user_${user.id}_email`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`user_${user.id}_email`]}</p>
          )}
        </div>

        {/* Role */}
          <div>
      <Label htmlFor={`role_${user.id}`} className="block text-sm font-medium text-gray-700 mb-1">
        Role *
      </Label>

      <MultiSelect
        options={roleOptions}
        value={user.role || []} // expecting array
        onChange={(newRoles) => {
          console.log("MultiSelect changed:", { userId: user.id, newRoles })
          handleUserChange(user.id, "role", newRoles)
        }}
        placeholder="Select role(s)"
        dataTestId={`user_${user.id}_role`}
      />

      {errors[`user_${user.id}_role`] && (
        <p className="mt-1 text-sm text-red-600">
          {errors[`user_${user.id}_role`]}
        </p>
      )}
    </div>

        {/* License */}
        <div>
          <Label htmlFor={`license_${user.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            License Type *
          </Label>
          <Select
            key={`license_${user.id}`}
            value={user.licenseId}
            onValueChange={(value) => {
              console.log('License onValueChange:', { userId: user.id, value });
              handleUserChange(user.id, "licenseId", value);
            }}
          >
            <SelectTrigger className={errors[`user_${user.id}_licenseId`] ? "border-red-300" : ""}>
              <SelectValue placeholder="Select license" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Explore (Free)">Explore (Free)</SelectItem>
              <SelectItem value="Plan">Plan</SelectItem>
              <SelectItem value="Execute">Execute</SelectItem>
              <SelectItem value="Optimize">Optimize</SelectItem>
            </SelectContent>
          </Select>
          {errors[`user_${user.id}_licenseId`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`user_${user.id}_licenseId`]}</p>
          )}
        </div>

        {/* Department */}
        <div>
          <Label htmlFor={`department_${user.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </Label>
          <Input
            id={`department_${user.id}`}
            type="text"
            placeholder="Enter department"
            value={user.department}
            onChange={(e) => handleUserChange(user.id, "department", e.target.value)}
          />
        </div>

        {/* Designation */}
        <div>
          <Label htmlFor={`designation_${user.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Designation
          </Label>
          <Input
            id={`designation_${user.id}`}
            type="text"
            placeholder="Enter designation"
            value={user.designation}
            onChange={(e) => handleUserChange(user.id, "designation", e.target.value)}
          />
        </div>

        {/* Location */}
        <div>
          <Label htmlFor={`location_${user.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </Label>
          <Input
            id={`location_${user.id}`}
            type="text"
            placeholder="Enter location"
            value={user.location}
            onChange={(e) => handleUserChange(user.id, "location", e.target.value)}
          />
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor={`phone_${user.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </Label>
          <Input
            id={`phone_${user.id}`}
            type="tel"
            placeholder="Enter phone number"
            value={user.phone}
            onChange={(e) => handleUserChange(user.id, "phone", e.target.value)}
          />
        </div>
      </div>

      {/* Send Email Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`sendEmail_${user.id}`}
          checked={user.sendInvitationEmail}
          onCheckedChange={(checked) => handleUserChange(user.id, "sendInvitationEmail", checked)}
        />
        <Label htmlFor={`sendEmail_${user.id}`} className="text-sm font-medium text-gray-700">
          Send Invitation Email
        </Label>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl font-semibold">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Invite Users</span>
          </DialogTitle>
          <DialogDescription>
            Invite single or multiple users to your organization. Users will be created in Pending state until invitation is accepted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {users.map((user, index) => renderUserRow(user, index))}
          </div>

        <div className="flex justify-end">
  <Button
    type="button"
    variant="outline"
    onClick={addUserRow}
    className="w-30 border-dashed border-2 border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 py-3"
  >
    <Plus className="h-4 w-4 mr-2" />
    Add More
  </Button>
</div>


          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {users.length} user{users.length !== 1 ? 's' : ''} will be invited
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
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {isSubmitting ? "Sending Invitations..." : 
                 `Invite ${users.length} User${users.length !== 1 ? 's' : ''}`
                }
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}