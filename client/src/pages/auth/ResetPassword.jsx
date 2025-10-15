import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({}); 
  const [tokenValid, setTokenValid] = useState(null);
  const [isValidating, setIsValidating] = useState(true);
  const [resetComplete, setResetComplete] = useState(false);
  const [isResending, setIsResending] = useState(false); // added
  // New state for resending flow
  const [resendEmail, setResendEmail] = useState("");
  const [resendError, setResendError] = useState("");
  const [forceEmailInput, setForceEmailInput] = useState(false); // allow switching to manual entry

  useEffect(() => {
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get("token");

    if (!resetToken) {
      setTokenValid(false);
      setIsValidating(false);
      return;
    }

    setToken(resetToken);
    validateToken(resetToken);
  }, []);

  const validateToken = async (resetToken) => {
    try {
      const response = await fetch("/api/auth/validate-reset-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken }),
      });

      const result = await response.json();
      setTokenValid(response.ok);

      if (!response.ok) {
        setErrors({
          token: result.message || "Invalid or expired reset token",
        });
      }
    } catch (error) {
      setTokenValid(false);
      setErrors({ token: "Unable to validate reset token" });
    } finally {
      setIsValidating(false);
    }
  };

  // Centralized password rules used by both UI and validation
  const PASSWORD_RULES = [
    { key: "len", test: (p) => p.length >= 8, text: "At least 8 characters" },
    {
      key: "upper",
      test: (p) => /[A-Z]/.test(p),
      text: "Contains uppercase letter",
    },
    {
      key: "lower",
      test: (p) => /[a-z]/.test(p),
      text: "Contains lowercase letter",
    },
    { key: "number", test: (p) => /[0-9]/.test(p), text: "Contains a number" },
    {
      key: "special",
      test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
      text: "Contains special character",
    },
  ];

  // Returns validity and the list of missing requirements
  const evaluatePassword = (password) => {
    const missing = PASSWORD_RULES.filter((r) => !r.test(password)).map(
      (r) => r.text
    );
    return { isValid: missing.length === 0, missing };
  };

  // Returns UI-ready rule status for the current password
  const getPasswordStrengthText = () =>
    PASSWORD_RULES.map((r) => ({
      test: r.test(formData.password),
      text: r.text,
    }));

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const { isValid, missing } = evaluatePassword(formData.password);
      if (!isValid) {
        newErrors.password = `Password requirements not met: ${missing.join(
          ", "
        )}`;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setResetComplete(true);
        toast({
          title: "Password reset successful",
          description: "You can now sign in with your new password",
        });
      } else {
        setErrors({ submit: result.message || "Failed to reset password" });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Simple email validator
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Prefill email from Login's forgot flow (if available)
  useEffect(() => {
    const saved = localStorage.getItem("lastResetEmail");
    if (saved && validateEmail(saved)) {
      setResendEmail(saved);
    }
  }, []);

  // New: resend reset link when token is invalid/expired
  const handleResendResetLink = async (e) => {
    e.preventDefault();

    if (!resendEmail.trim()) {
      setResendError("Email is required");
      return;
    }
    if (!validateEmail(resendEmail)) {
      setResendError("Please enter a valid email address");
      return;
    }

    setIsResending(true);
    setResendError("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });
      const result = await response.json();

      if (response.ok) {
        // persist email for future visits
        localStorage.setItem("lastResetEmail", resendEmail);
        toast({
          title: "Reset link sent",
          description: "Please check your email for password reset instructions",
        });
        const msg = encodeURIComponent("Reset link sent. Please check your email.");
        setLocation(`/login?message=${msg}`);
      } else {
        setResendError(result.message || "Failed to send reset email");
      }
    } catch {
      setResendError("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">
              Validating reset link...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center p-8 bg-white border border-gray-200 rounded-2xl shadow-lg">
          <div className="flex flex-col items-center space-y-5">
            {/* Icon */}
            <div className="bg-red-50 rounded-full p-5">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold text-gray-900">
              Invalid Reset Link
            </h2>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              {errors.token ||
                "This password reset link is invalid or has expired. Please request a new one to reset your password."}
            </p>

            {/* Email handling */}
            {resendEmail && validateEmail(resendEmail) &&
              <div className="w-full text-left text-sm text-gray-700">
                We will send a new reset link to{" "}
                <span className="font-medium">{resendEmail}</span>.
             
              </div>
             }

            {/* Primary Button */}
            <button
              onClick={handleResendResetLink}
              disabled={isResending}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Request New Link"
              )}
            </button>

            {/* Secondary Button */}
            <button
              onClick={() => setLocation("/login")}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors mt-2"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resetComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Password Reset Complete
              </h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully updated. You can now sign in
                with your new password.
              </p>
              <Link href="/login">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Sign In Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create New Password
            </h2>
            <p className="text-gray-600 mt-2">Enter your new password below</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">
                  Password requirements:
                </p>
                <div className="space-y-1">
                  {getPasswordStrengthText().map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          req.test ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                      <span
                        className={`text-xs ${
                          req.test ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Updating password..." : "Update Password"}
            </button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 text-sm"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
