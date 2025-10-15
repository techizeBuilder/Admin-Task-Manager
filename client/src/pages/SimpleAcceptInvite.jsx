import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getPasswordRequirements,
  validatePassword,
} from "../utils/passwordUtils";

export function SimpleAcceptInvite() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get token from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const [formData, setFormData] = useState({
    // firstName: "",
    // lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isResending, setIsResending] = useState(false);

  // Password requirement checks
  const passwordRequirements = getPasswordRequirements(formData.password);

  // Validate invitation token
  const {
    data: inviteData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/auth/validate-invite", token],
    queryFn: async () => {
      const response = await fetch(`/api/auth/validate-invite?token=${token}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Invalid invitation");
      }
      return response.json();
    },
    enabled: !!token,
    retry: false,
  });

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      const res = await fetch("/api/auth/resend-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to resend invite");
      }
      toast({
        title: "Invite sent",
        description:
          "We emailed you a fresh invite link. Please check your inbox (and spam).",
      });
    } catch (e) {
      toast({
        title: "Unable to resend",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
        setLocation("/login");
      
    }
  };

  // Complete invitation mutation
  const completeInviteMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          ...userData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to complete invitation");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome to TaskSetu!",
        description: "Your account has been created successfully.",
      });

      if (data.token) {
        localStorage.setItem("token", data.token);
        setLocation("/login");
      } else {
        setLocation("/login");
      }
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add a small helper to validate the whole form (for submit)
  const validateForm = (data) => {
    const next = {};

    const { valid } = validatePassword(data.password);
    if (!data.password) next.password = "Password is required.";
    else if (!valid) next.password = "Password does not meet requirements.";
    if (!data.confirmPassword)
      next.confirmPassword = "Please confirm your password.";
    else if (data.password !== data.confirmPassword)
      next.confirmPassword = "Passwords do not match.";
    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validateForm(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    completeInviteMutation.mutate(formData);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>No invitation token provided</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>
              {error?.message || "Invalid invitation link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full mt-4 mb-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Request New Invite"
              )}
            </Button>
            <Button onClick={() => setLocation("/login")} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  console.log("Invite Data:", inviteData.role);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Complete Registration
          </h2>
          <p className="mt-2 text-gray-600">
            Join{" "}
            <span className="font-semibold text-blue-600">
              {inviteData.organizationName}
            </span>
          </p>
        </div>

        {/* Invitation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invitation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm text-gray-600">Organization</Label>
              <p className="font-medium">{inviteData.organizationName}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Email</Label>
              <p className="font-medium">{inviteData.email}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Role</Label>
              <div className="flex flex-wrap gap-2">
                {(
                  inviteData.role || (inviteData.role ? [inviteData.role] : [])
                ).map((r, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize"
                  >
                    {r && r?.replace("_", " ")}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                {/* Password */}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({ ...prev, password: value }));
                        setErrors((prev) => {
                          const next = { ...prev };
                          const { valid } = validatePassword(value);
                          if (!value) next.password = "Password is required.";
                          else if (!valid)
                            next.password =
                              "Password does not meet requirements.";
                          else delete next.password;

                          if (formData.confirmPassword) {
                            if (value !== formData.confirmPassword)
                              next.confirmPassword = "Passwords do not match.";
                            else delete next.confirmPassword;
                          }
                          return next;
                        });
                      }}
                      placeholder="Create a secure password"
                      className={
                        errors.password
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                      aria-invalid={!!errors.password}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      id="password-error"
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.password}
                    </p>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Password requirements
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {passwordRequirements.map((req) => (
                        <li key={req.id} className="flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              req.ok ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                          <span
                            className={
                              req.ok ? "text-green-700" : "text-gray-600"
                            }
                          >
                            {req.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          confirmPassword: value,
                        }));
                        setErrors((prev) => {
                          const next = { ...prev };
                          if (!value)
                            next.confirmPassword =
                              "Please confirm your password.";
                          else if (value !== formData.password)
                            next.confirmPassword = "Passwords do not match.";
                          else delete next.confirmPassword;
                          return next;
                        });
                      }}
                      placeholder="Confirm your password"
                      className={
                        errors.confirmPassword
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={
                        errors.confirmPassword
                          ? "confirmPassword-error"
                          : undefined
                      }
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p
                      id="confirmPassword-error"
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700"
                disabled={completeInviteMutation.isPending}
              >
                {completeInviteMutation.isPending
                  ? "Creating Account..."
                  : "Complete Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SimpleAcceptInvite;
