import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

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
  const [loginSettings, setLoginSettings] = useState({
    backgroundColor: "#f3f4f6",
    gradientFrom: "#e5e7eb",
    gradientTo: "#d1d5db",
    useGradient: true,
    backgroundImage: "",
    overlayOpacity: 0.5,
  });

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
        // Set user data in cache immediately to prevent loading state
        queryClient.setQueryData(["/api/auth/verify"], {
          ...result.user,
          _id: result.user.id,
          role: result.user.role,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
        });

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in",
        });

        // Use role-based redirection from server response
        navigate(result.redirectTo || "/dashboard");
      } else {
        setErrors({ submit: result.message || "Invalid email or password" });
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
        setResetSent(true);
        toast({
          title: "Reset link sent",
          description:
            "Please check your email for password reset instructions",
        });
      } else {
        setErrors({
          resetEmail: result.message || "Failed to send reset email",
        });
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
        className="min-h-screen flex items-center justify-end p-4"
        style={generateBackgroundStyle()}
      >
        <div className="max-w-sm w-full mr-8">
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
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-600 mb-6">
                  Hurray, you have successfully created your credentials” Click
                  ‘Login’ to start your efficient task management journey with
                  <span className="font-medium">Tasksetu.com</span>
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
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Log In 
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
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-green-800 text-sm font-medium">
                  {successMessage}
                </span>
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">TS</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">
              Sign in to your TaskSetu account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter your email"
                />
                <Mail className="h-5 w-5 text-gray-400 absolute right-3 top-3.5" />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-md text-xs flex items-start gap-2">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-semibold shadow-lg"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-xs">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
