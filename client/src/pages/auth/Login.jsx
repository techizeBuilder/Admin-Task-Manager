import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import LockoutModal from "@/components/LockoutModal";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [showLockoutModal, setShowLockoutModal] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);
  const [checkingLockout, setCheckingLockout] = useState(false);
  const [fieldValidation, setFieldValidation] = useState({
    email: { isValid: false, message: "", touched: false },
    password: { isValid: false, message: "", touched: false }
  });
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const firstErrorFieldRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [loginSettings, setLoginSettings] = useState({
    backgroundColor: "#f3f4f6",
    gradientFrom: "#e5e7eb",
    gradientTo: "#d1d5db",
    useGradient: true,
    backgroundImage: "",
    overlayOpacity: 0.5,
  });

  // If already authenticated, redirect away from login
  const { data: verifiedUser } = useQuery({
    queryKey: ["/api/auth/verify"],
    // Don't aggressively refetch here; just read if available
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!localStorage.getItem("token"),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const cachedUser = verifiedUser || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null);
    if (token && cachedUser) {
      // Determine destination based on role
      const roles = Array.isArray(cachedUser.role)
        ? cachedUser.role
        : cachedUser.role
        ? [cachedUser.role]
        : [];

      if (roles.includes("super_admin") || roles.includes("superadmin")) {
        navigate("/super-admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [verifiedUser, navigate]);

  // Fetch login settings on component mount
  useEffect(() => {
    const fetchLoginSettings = async () => {
      try {
        const response = await fetch("/api/public/login-settings");
        if (response.ok) {
          const settings = await response.json();
          setLoginSettings(settings);
        }
      } catch (error) {
        console.log("Using default login settings");
      }
    };

    fetchLoginSettings();
  }, []);

  // Check for success message in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("message");
    if (message) {
      setSuccessMessage(message);
      // Clean up URL without the message parameter
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  // Check lockout status when page loads or email changes
  useEffect(() => {
    const checkLockoutStatus = async () => {
      if (!formData.email || !validateEmail(formData.email)) return;
      
      setCheckingLockout(true);
      try {
        const response = await fetch("/api/auth/check-lockout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });

        const result = await response.json();
        if (response.ok && result.success && result.locked) {
          setLockoutTimeLeft(result.timeLeft);
          setShowLockoutModal(true);
        }
      } catch (error) {
        console.error("Error checking lockout status:", error);
      } finally {
        setCheckingLockout(false);
      }
    };

    // Only check if email is valid and not currently loading
    if (formData.email && validateEmail(formData.email) && !isLoading) {
      const debounceTimer = setTimeout(checkLockoutStatus, 500); // Debounce
      return () => clearTimeout(debounceTimer);
    }
  }, [formData.email, isLoading]);

  const generateBackgroundStyle = () => {
    if (loginSettings.backgroundImage) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,${loginSettings.overlayOpacity}), rgba(0,0,0,${loginSettings.overlayOpacity})), url(${loginSettings.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };
    } else if (loginSettings.useGradient) {
      return {
        background: `linear-gradient(135deg, ${loginSettings.gradientFrom}, ${loginSettings.gradientTo})`,
      };
    } else {
      return {
        backgroundColor: loginSettings.backgroundColor,
      };
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Inline validation functions
  const validateField = (fieldName, value) => {
    let isValid = false;
    let message = "";

    switch (fieldName) {
      case "email":
        if (!value.trim()) {
          message = "Email address is required";
        } else if (!validateEmail(value)) {
          message = "Invalid format, please use something like name@company.com";
        } else {
          isValid = true;
          message = "";
        }
        break;
      case "password":
        if (!value.trim()) {
          message = "Password is required";
        } else if (value.length < 8) {
          message = "Must be at least 8 characters long";
        } else {
          isValid = true;
          message = "";
        }
        break;
    }

    return { isValid, message };
  };

  const handleFieldValidation = (fieldName, value) => {
    const validation = validateField(fieldName, value);
    setFieldValidation(prev => ({
      ...prev,
      [fieldName]: {
        ...validation,
        touched: true
      }
    }));
    return validation;
  };

  // Rate limiting check
  const checkRateLimit = () => {
    const now = Date.now();
    const timeDiff = now - lastAttemptTime;
    const oneMinute = 60 * 1000;

    if (timeDiff < oneMinute && attemptCount >= 10) {
      return {
        isBlocked: true,
        message: "Too many login attempts. Please try again in a few minutes."
      };
    }

    if (timeDiff >= oneMinute) {
      setAttemptCount(0);
    }

    return { isBlocked: false, message: "" };
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear previous errors
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Real-time validation on typing (debounced)
    if (fieldValidation[field].touched) {
      const validation = validateField(field, value);
      setFieldValidation(prev => ({
        ...prev,
        [field]: {
          ...validation,
          touched: true
        }
      }));
    }
  };

  const handleFieldBlur = (field, value) => {
    handleFieldValidation(field, value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Check if user is currently locked out
    if (showLockoutModal) {
      return;
    }

    // Check rate limiting
    const rateLimitCheck = checkRateLimit();
    if (rateLimitCheck.isBlocked) {
      setErrors({ submit: rateLimitCheck.message });
      return;
    }

    // Validate all fields
    const emailValidation = handleFieldValidation("email", formData.email);
    const passwordValidation = handleFieldValidation("password", formData.password);

    const hasErrors = !emailValidation.isValid || !passwordValidation.isValid;

    if (hasErrors) {
      // Focus on first error field
      if (!emailValidation.isValid && emailInputRef.current) {
        emailInputRef.current.focus();
        firstErrorFieldRef.current = emailInputRef.current;
      } else if (!passwordValidation.isValid && passwordInputRef.current) {
        passwordInputRef.current.focus();
        firstErrorFieldRef.current = passwordInputRef.current;
      }

      // Announce error for screen readers
      if (firstErrorFieldRef.current) {
        firstErrorFieldRef.current.setAttribute('aria-describedby', 'form-error');
        firstErrorFieldRef.current.setAttribute('aria-invalid', 'true');
      }

      return;
    }

    // Update rate limiting counters
    setAttemptCount(prev => prev + 1);
    setLastAttemptTime(Date.now());

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      console.log("login user : ", result);
      if (response.ok) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("role", JSON.stringify(result.user.role));
        
        // Create consistent user data object with profile image prioritized
        const userDataForCache = {
          ...result.user,
          _id: result.user.id,
          id: result.user.id,
          role: result.user.role,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          profileImageUrl: result.user.profileImageUrl || null, // Ensure it's set even if null
        };

        // Set user data in both caches immediately to prevent loading state
        queryClient.setQueryData(["/api/auth/verify"], userDataForCache);
        queryClient.setQueryData(["/api/profile"], userDataForCache);

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in",
        });

        // Use role-based redirection from server response
        navigate(result.redirectTo || "/dashboard");
      } else {
        // Handle lockout scenario
        if (response.status === 423 && result.isLockout) {
          setLockoutTimeLeft(result.timeLeft);
          setShowLockoutModal(true);
          setErrors({}); // Clear form errors when showing lockout modal
        } else {
          // Handle remaining attempts warning or regular error
          setErrors({ submit: result.message || "Invalid email or password" });
        }
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail.trim()) {
      setErrors({ resetEmail: "Email is required" });
      return;
    }

    if (!validateEmail(resetEmail)) {
      setErrors({ resetEmail: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const result = await response.json();

      if (response.ok) {
        // Persist for ResetPassword to reuse
        localStorage.setItem("lastResetEmail", resetEmail);

        setResetSent(true);
        toast({
          title: "Reset link sent",
          description: "Please check your email for password reset instructions",
        });
      } else {
        setErrors({ resetEmail: result.message || "Failed to send reset email" });
      }
    } catch (error) {
      setErrors({ resetEmail: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={generateBackgroundStyle()}
      >
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-lg">
            {!resetSent ? (
              <>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Reset Password
                  </h2>
                  <p className="text-gray-600 mt-2 text-sm">
                    Enter your email address and we'll send you a link to reset
                    your password
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => {
                          setResetEmail(e.target.value);
                          if (errors.resetEmail) {
                            setErrors((prev) => ({ ...prev, resetEmail: "" }));
                          }
                        }}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.resetEmail
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.resetEmail && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.resetEmail}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-gray-600 hover:text-gray-900 py-2 text-sm"
                  >
                    Back to Sign In
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-600 mb-4">
                  We've sent a password reset link to <strong>{resetEmail}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Please check your email and click the reset link to create a new password. The link will expire in 30 minutes for security reasons.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  The link will expire in 30 minutes for security reasons.
                </p>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                    setResetEmail("");
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={generateBackgroundStyle()}
    >
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xl">
          {/* Success Message */}
          {/* {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-green-800 text-sm font-medium">
                  {successMessage}
                </span>
              </div>
            </div>
          )} */}

          <div className="text-center mb-4">
  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mx-auto mb-2">
    <span className="text-white font-bold text-xl">TS</span>
  </div>
  <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
  <p className="text-gray-600 text-sm mt-1">Sign in to your TaskSetu account</p>
</div>

<form onSubmit={handleLogin} className="space-y-3">
  {/* Email Field */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
    <div className="relative">
      <input
        ref={emailInputRef}
        id="email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
        onBlur={(e) => handleFieldBlur("email", e.target.value)}
        className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 text-sm transition-colors ${
          fieldValidation.email.touched
            ? fieldValidation.email.isValid
              ? "border-green-300 focus:border-green-500 focus:ring-green-200"
              : "border-red-300 focus:border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
        }`}
        placeholder="Enter your email"
        aria-describedby={
          fieldValidation.email.touched && !fieldValidation.email.isValid
            ? "email-error"
            : undefined
        }
        aria-invalid={fieldValidation.email.touched && !fieldValidation.email.isValid}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {fieldValidation.email.touched &&
          (fieldValidation.email.isValid ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          ))}
        <Mail className="h-4 w-4 text-gray-400" />
      </div>
    </div>
    {fieldValidation.email.touched && !fieldValidation.email.isValid && (
      <div
        id="email-error"
        className="flex items-start gap-1.5 text-xs text-red-600 mt-1.5"
        role="alert"
      >
        <XCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        <span>{fieldValidation.email.message}</span>
      </div>
    )}
  </div>

  {/* Password Field */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
    <div className="relative">
      <input
        ref={passwordInputRef}
        id="password"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={(e) => handleInputChange("password", e.target.value)}
        onBlur={(e) => handleFieldBlur("password", e.target.value)}
        className={`w-full px-3 py-2 pr-16 border rounded-md focus:ring-2 text-sm transition-colors ${
          fieldValidation.password.touched
            ? fieldValidation.password.isValid
              ? "border-green-300 focus:border-green-500 focus:ring-green-200"
              : "border-red-300 focus:border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
        }`}
        placeholder="Enter your password"
        aria-describedby={
          fieldValidation.password.touched && !fieldValidation.password.isValid
            ? "password-error"
            : undefined
        }
        aria-invalid={fieldValidation.password.touched && !fieldValidation.password.isValid}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
        {fieldValidation.password.touched &&
          (fieldValidation.password.isValid ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          ))}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-gray-400 hover:text-gray-600 p-0.5"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
    {fieldValidation.password.touched && !fieldValidation.password.isValid && (
      <div
        id="password-error"
        className="flex items-start gap-1.5 text-xs text-red-600 mt-1.5"
        role="alert"
      >
        <XCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
        <span>{fieldValidation.password.message}</span>
      </div>
    )}
  </div>

  {/* Remember + Forgot */}
  <div className="flex items-center justify-between">
    <label className="flex items-center text-sm text-gray-700 gap-2">
      <input
        id="remember-me"
        name="remember-me"
        type="checkbox"
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      Remember me
    </label>
    <button
      type="button"
      onClick={() => setShowForgotPassword(true)}
      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
    >
      Forgot password?
    </button>
  </div>

  {/* Error Message */}
  {errors.submit && (
    <div
      className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-md text-xs flex items-start gap-2"
      role="alert"
    >
      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <span>{errors.submit}</span>
    </div>
  )}

  {/* Submit Button */}
  <div className="relative">
    <button
      type="submit"
      disabled={
        isLoading ||
        showLockoutModal ||
        !fieldValidation.email.isValid ||
        !fieldValidation.password.isValid ||
        !formData.email.trim() ||
        !formData.password.trim()
      }
      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-3 rounded-md hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-semibold shadow-md"
      title={
        isLoading
          ? "Signing in..."
          : showLockoutModal
          ? "Account is temporarily locked"
          : !formData.email.trim() ||
            !formData.password.trim() ||
            !fieldValidation.email.isValid ||
            !fieldValidation.password.isValid
          ? "Please fill in all fields correctly to continue"
          : "Sign in to your account"
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Signing in...
        </div>
      ) : showLockoutModal ? (
        "Account Locked"
      ) : (
        "Sign In"
      )}
    </button>
  </div>
</form>

<div className="text-center mt-3 pt-3 border-t border-gray-200">
  <p className="text-gray-600 text-xs">
    Don’t have an account?{" "}
    <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
      Create one here
    </Link>
  </p>
</div>

        </div>
      </div>

      {/* Lockout Modal */}
      <LockoutModal
        isOpen={showLockoutModal}
        timeLeft={lockoutTimeLeft}
        onClose={() => setShowLockoutModal(false)}
      />
    </div>
  );
}
