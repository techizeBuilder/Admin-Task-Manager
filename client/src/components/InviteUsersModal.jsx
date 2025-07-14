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
  const [inviteList, setInviteList] = useState([
    {
      email: "",
      roles: ["member"],
      emailError: "",
      existsError: "",
      licenseError: "",
      isValid: false,
      isChecking: false,
    },
  ]);
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
      setInviteList([
        {
          email: "",
          roles: ["member"],
          emailError: "",
          existsError: "",
          licenseError: "",
          isValid: false,
          isChecking: false,
        },
      ]);
      setIsSubmitting(false);
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

  // Email validation function
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

  // Check email uniqueness
  const checkEmailExists = async (email, organizationId) => {
    try {
      const response = await fetch(`/api/organization/check-email-exists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email, organizationId }),
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

  // Calculate license requirements for roles
  const calculateLicenseRequirement = (roles) => {
    // Member role is always included and counts as 1 license
    // Additional roles like admin, manager might require additional licenses
    const additionalRoles = roles.filter((role) => role !== "member");
    return 1 + additionalRoles.length * 0; // For now, each user needs 1 license regardless of roles
  };

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

  // Add new invite row
  const addInviteRow = () => {
    setInviteList((prev) => [
      ...prev,
      {
        email: "",
        roles: ["member"],
        emailError: "",
        existsError: "",
        licenseError: "",
        isValid: false,
        isChecking: false,
      },
    ]);
  };

  // Remove invite row
  const removeInviteRow = (index) => {
    if (inviteList.length > 1) {
      setInviteList((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Invite users mutation
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
        // Handle server errors with context
        if (result.errors && result.errors.length > 0) {
          const errorDetails = result.errors
            .map((err) => `${err.email}: ${err.error}`)
            .join("\n");
          throw new Error(`${result.message}\n\nDetails:\n${errorDetails}`);
        }
        throw new Error(result.message || "Failed to send invitations");
      }

      return result;
    },
    onSuccess: (data) => {
      console.log("Invite success response:", data);

      // Handle partial success cases
      if (data.errors && data.errors.length > 0) {
        // Partial success - some failed
        const errorList = data.errors
          .map((err) => `• ${err.email}: ${err.error}`)
          .join("\n");

        console.log("Showing partial success toast");
        toast({
          title: "Partial Success",
          description: `${data.successCount} invitation${data.successCount !== 1 ? "s" : ""} sent successfully, but ${data.errors.length} failed:\n\n${errorList}`,
          variant: "default",
          duration: 8000,
        });
      } else {
        // Complete success
        const successMessage =
          data.successCount === 1
            ? `1 invitation sent successfully`
            : `${data.successCount} invitations sent successfully`;

        console.log("Showing success toast:", successMessage);
        toast({
          title: "Invitations Sent!",
          description: successMessage,
          variant: "default",
          duration: 5000,
        });
      }

      onClose();
      queryClient.invalidateQueries({
        queryKey: ["/api/organization/users-detailed"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/organization/license"],
      });
    },
    onError: (error) => {
      console.log("Invite error:", error);
      toast({
        title: "Failed to send invitations",
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

  // Submit invitations with comprehensive validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // First, validate all emails against database
    const emailsToValidate = inviteList.filter(invite => invite.email.trim() !== "");
    
    // Check each email for existing invitations
    for (let i = 0; i < emailsToValidate.length; i++) {
      const invite = emailsToValidate[i];
      const index = inviteList.findIndex(inv => inv.email === invite.email);
      
      if (index !== -1) {
        await checkExistingInvitation(index, invite.email.trim());
      }
    }

    // Wait a moment for all validations to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Separate valid and invalid invites after validation
    const validInvites = inviteList.filter(
      (invite) =>
        invite.isValid &&
        invite.email.trim() !== "" &&
        !invite.emailError &&
        !invite.existsError &&
        !invite.licenseError,
    );

    const invalidInvites = inviteList.filter(
      (invite) =>
        invite.email.trim() !== "" &&
        (!invite.isValid ||
          invite.emailError ||
          invite.existsError ||
          invite.licenseError),
    );

    const emptyInvites = inviteList.filter(
      (invite) => invite.email.trim() === "",
    );

    // Show validation summary
    if (invalidInvites.length > 0) {
      const errorMessages = [];

      invalidInvites.forEach((invite) => {
        if (invite.emailError)
          errorMessages.push(`${invite.email}: ${invite.emailError}`);
        if (invite.existsError)
          errorMessages.push(`${invite.email}: ${invite.existsError}`);
        if (invite.licenseError)
          errorMessages.push(`${invite.email}: ${invite.licenseError}`);
      });

      // Show toast with validation errors summary
      toast({
        title: "Please fix the following errors",
        description: `${invalidInvites.length} invitation${invalidInvites.length > 1 ? "s have" : " has"} validation errors. Check the form above for details.`,
        variant: "destructive",
        className: "border-red-200 bg-red-50 text-red-800 shadow-lg",
        duration: 5000,
      });
      return;
    }

    if (validInvites.length === 0) {
      toast({
        title: "No valid invitations to send",
        description:
          "Please enter at least one valid email address with proper roles assigned.",
        variant: "destructive",
        className: "border-red-200 bg-red-50 text-red-800 shadow-lg",
        duration: 5000,
      });
      return;
    }

    // Final license check
    const totalLicensesNeeded = validInvites.reduce(
      (total, invite) => total + calculateLicenseRequirement(invite.roles),
      0,
    );

    if (licenseInfo && totalLicensesNeeded > licenseInfo.availableSlots) {
      toast({
        title: "License limit exceeded",
        description: `You need ${totalLicensesNeeded} licenses but only have ${licenseInfo.availableSlots} available. Upgrade your plan or reduce invitations.`,
        variant: "destructive",
        className: "border-red-200 bg-red-50 text-red-800 shadow-lg",
        duration: 6000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Use test endpoint for email functionality testing
      const response = await fetch("/api/organization/invite-users-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invites: validInvites }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.errors && data.errors.length > 0) {
          toast({
            title: "Partial Success",
            description: `${data.successCount} invitations sent. ${data.errors.length} failed.`,
            variant: "default",
            duration: 8000,
          });
        } else {
          const successMessage =
            data.successCount === 1
              ? `1 invitation sent successfully`
              : `${data.successCount} invitations sent successfully`;

          toast({
            title: "Invitations Sent!",
            description: successMessage,
            variant: "default",
            duration: 5000,
          });
        }

        onClose();
        queryClient.invalidateQueries({
          queryKey: ["/api/organization/users-detailed"],
        });
        queryClient.invalidateQueries({
          queryKey: ["/api/organization/license"],
        });
      } else {
        throw new Error(data.message || "Failed to send invitations");
      }
    } catch (error) {
      console.error("Invite error:", error);
      toast({
        title: "Failed to send invitations",
        description: error.message,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const isFormValid =
    inviteList.some((invite) => invite.isValid) &&
    inviteList.every((invite) => invite.email === "" || invite.isValid);

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
          {/* Invitation Rows */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Team Members to Invite
              </h3>
              <span className="text-sm text-gray-500">
                {inviteList.length} invitation
                {inviteList.length !== 1 ? "s" : ""}
              </span>
            </div>

            {inviteList.map((invite, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-700">
                    Invitation #{index + 1}
                  </h4>
                  {inviteList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInviteRow(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email Input */}
                  <div>
                    <Label
                      htmlFor={`email-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        id={`email-${index}`}
                        type="email"
                        placeholder="Enter email address"
                        value={invite.email}
                        onChange={(e) => {
                          const email = e.target.value;
                          updateInviteEmailImmediate(index, email);
                          debouncedValidateEmail(index, email);
                        }}
                        onBlur={(e) => handleEmailBlur(index, e.target.value)}
                        disabled={invite.isChecking}
                        className={`pl-10 ${
                          invite.emailError ||
                          invite.existsError ||
                          invite.licenseError
                            ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                            : invite.isValid
                              ? "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-200"
                              : "border-gray-300 focus:border-slate-400 focus:ring-slate-200"
                        }`}
                      />
                      {invite.isChecking && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                        </div>
                      )}
                      {invite.isValid && !invite.isChecking && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <Check className="h-4 w-4 text-emerald-600" />
                        </div>
                      )}
                    </div>

                    {/* Display all validation errors */}
                    <div className="space-y-1">
                      {invite.emailError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-1">
                          <p className="text-sm text-red-700 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                            {invite.emailError}
                          </p>
                        </div>
                      )}
                      {invite.existsError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-1">
                          <p className="text-sm text-red-700 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                            {invite.existsError}
                          </p>
                        </div>
                      )}
                      {invite.licenseError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-2 mt-1">
                          <p className="text-sm text-red-700 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                            {invite.licenseError}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Assignment
                    </Label>
                    <div className="space-y-3">
                      {/* Member Role (Required) */}
                      <div className="flex items-center">
                        <Checkbox
                          id={`member-${index}`}
                          checked={invite.roles.includes("member")}
                          disabled={true}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-500 mr-2" />
                          <Label
                            htmlFor={`member-${index}`}
                            className="text-sm text-gray-700"
                          >
                            Member{" "}
                            <span className="text-xs text-gray-500">
                              (Required)
                            </span>
                          </Label>
                        </div>
                      </div>

                      {/* Manager Role (Optional) */}
                      <div className="flex items-center">
                        <Checkbox
                          id={`manager-${index}`}
                          checked={invite.roles.includes("manager")}
                          onCheckedChange={() => toggleRole(index, "manager")}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-slate-600 mr-2" />
                          <Label
                            htmlFor={`manager-${index}`}
                            className="text-sm text-gray-700"
                          >
                            Manager
                          </Label>
                        </div>
                      </div>

                      {/* Admin Role (Optional) */}
                      <div className="flex items-center">
                        <Checkbox
                          id={`admin-${index}`}
                          checked={invite.roles.includes("admin")}
                          onCheckedChange={() => toggleRole(index, "admin")}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-slate-600 mr-2" />
                          <Label
                            htmlFor={`admin-${index}`}
                            className="text-sm text-gray-700"
                          >
                            Admin
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={addInviteRow}
              className="flex items-center space-x-2 border-dashed border-2 border-gray-300 hover:border-slate-400 hover:bg-slate-50"
            >
              <Plus className="h-4 w-4" />
              <span>Add Another User</span>
            </Button>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {inviteList.filter((invite) => invite.isValid).length} valid
              invitation
              {inviteList.filter((invite) => invite.isValid).length !== 1
                ? "s"
                : ""}{" "}
              ready to send
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
                disabled={!isFormValid || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Invitations...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send Invitations
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
