import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  User,
  Building2,
  ArrowRight,
  Shield,
  Target,
  Users,
  BarChart3,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organizationName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleTypeSelection = (type) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedType(type);
      setIsTransitioning(false);
    }, 200);
  };

  const handleBackToChoice = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedType(null);
      setIsTransitioning(false);
    }, 200);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (selectedType === "organization" && !formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const endpoint =
        selectedType === "individual"
          ? "/api/auth/register/individual"
          : "/api/auth/register/organization";

      const payload =
        selectedType === "individual"
          ? {
              email: formData.email,
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
            }
          : {
              organizationName: formData.organizationName.trim(),
              email: formData.email,
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.autoAuthenticated && result.token) {
          localStorage.setItem("token", result.token);
          toast({
            title:
              selectedType === "organization"
                ? "Organization created successfully"
                : "Registration successful",
            description:
              result.message ||
              "Welcome to TaskSetu! Auto-authenticated for testing.",
          });
          setLocation("/dashboard");
        } else {
          localStorage.setItem("verificationEmail", formData.email);
          localStorage.setItem("registrationEmail", formData.email);
          localStorage.setItem("registrationType", selectedType);

          setLocation(
            `/registration-success?email=${encodeURIComponent(formData.email)}&type=${selectedType}`,
          );
        }
      } else {
        setErrors({ submit: result.message || "Registration failed" });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Choice Selection View
  if (!selectedType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#253140] to-[#1a252f] flex">
        {/* Left Side - TaskSetu Information */}
        <div className="flex-1 text-white p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border border-blue-400 rounded-full"></div>
            <div className="absolute top-40 right-20 w-24 h-24 border border-blue-400 rounded-full"></div>
            <div className="absolute bottom-40 left-20 w-20 h-20 border border-blue-400 rounded-full"></div>
            <div className="absolute bottom-20 right-40 w-16 h-16 border border-blue-400 rounded-full"></div>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h1 className="text-5xl font-bold mb-8 text-blue-400 text-center">
              Welcome to TaskSetu
            </h1>
            <p className="text-2xl text-blue-100 mb-12 text-center leading-relaxed">
              Streamline your workflow and boost productivity with our
              comprehensive task management platform
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-400 rounded-xl">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl text-blue-400 font-semibold mb-2">
                    Smart Task Management
                  </h3>
                  <p className="text-blue-100">
                    Organize, prioritize, and track tasks with intelligent
                    automation
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl text-blue-400 font-semibold mb-2">
                    Team Collaboration
                  </h3>
                  <p className="text-blue-100">
                    Seamless communication and project coordination
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl text-blue-400 font-semibold mb-2">
                    Analytics & Insights
                  </h3>
                  <p className="text-blue-100">
                    Data-driven decisions with comprehensive reporting
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl text-blue-400 font-semibold mb-2">
                    Enterprise Security
                  </h3>
                  <p className="text-blue-100">
                    Bank-level security with role-based access control
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Options */}
        <div className="w-96 bg-white flex items-center justify-center p-6 shadow-2xl">
          <div
            className={`w-full max-w-sm transition-all duration-300 ease-in-out ${isTransitioning ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"}`}
          >
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#253140] rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">TS</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Get Started
              </h2>
              <p className="text-sm text-gray-600">
                Choose your account type to begin
              </p>
            </div>

            <div className="space-y-3">
              {/* Individual User Option */}
              <button
                onClick={() => handleTypeSelection("individual")}
                className="w-full text-left p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-300 group transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Individual User
                    </h3>
                    <p className="text-xs text-gray-600">
                      Personal task management
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>

              {/* Organization Option */}
              <button
                onClick={() => handleTypeSelection("organization")}
                className="w-full text-left p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all duration-300 group transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Organization
                    </h3>
                    <p className="text-xs text-gray-600">
                      Complete workspace for teams
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </button>
            </div>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in here
                </Link>
              </p>

              <div className="text-xs text-gray-500">
                <Link href="/super-admin" className="hover:text-gray-700">
                  Platform Administrator Access
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Individual Registration Form
  if (selectedType === "individual") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#253140] to-[#1a252f] flex">
        {/* Left Side - TaskSetu Information */}
        <div className="flex-1 text-white p-12 flex flex-col justify-center items-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border border-blue-400 rounded-full"></div>
            <div className="absolute top-40 right-20 w-24 h-24 border border-blue-400 rounded-full"></div>
            <div className="absolute bottom-40 left-20 w-20 h-20 border border-blue-400 rounded-full"></div>
            <div className="absolute bottom-20 right-40 w-16 h-16 border border-blue-400 rounded-full"></div>
          </div>

          <div className="relative z-10 max-w-md">
            <h1 className="text-4xl font-bold text-blue-400 mb-6">
              Welcome to TaskSetu
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of professionals managing their tasks efficiently
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">
                    Personal Task Management
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Organize your personal tasks and collaborate when needed
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-blue-400">
                    Team Collaboration
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Join organization workspaces and collaborate seamlessly
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-blue-400">
                    Progress Tracking
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Monitor your productivity and task completion rates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-80 bg-white flex items-center justify-center p-3 shadow-2xl">
          <div className="w-full max-w-xs animate-in slide-in-from-right-5 duration-500 ease-in-out">
            <div className="mb-3">
              <button
                onClick={handleBackToChoice}
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 mb-2 transition-colors text-xs"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to options
              </button>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-100 rounded">
                  <User className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Individual Account
                  </h2>
                  <p className="text-gray-600 text-[9px]">
                    Create your personal TaskSetu account
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 p-2 shadow-sm transition-all duration-500 min-h-[250px] flex flex-col justify-between">
              <form onSubmit={handleRegister} className="space-y-1 flex-1">
                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="block text-[8px] font-medium text-gray-700 mb-0.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`w-full px-1.5 py-0.5 text-[9px] border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.firstName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="First name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-[7px] mt-0.5">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[8px] font-medium text-gray-700 mb-0.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`w-full px-1.5 py-0.5 text-[9px] border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.lastName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-[7px] mt-0.5">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-medium text-gray-700 mb-0.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-1.5 py-0.5 text-[9px] border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[7px] mt-0.5">
                      {errors.email}
                    </p>
                  )}
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-1.5 rounded text-[9px] flex items-start gap-1">
                    <AlertCircle className="h-2.5 w-2.5 mt-0.5 flex-shrink-0" />
                    {errors.submit}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-1 px-2 text-[10px] rounded hover:bg-blue-700 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </button>
                </div>
              </form>

              <div className="text-center mt-1.5 pt-1.5 border-t border-gray-100">
                <p className="text-gray-600 text-[9px]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Organization Registration Form
  if (selectedType === "organization") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#253140] to-[#1a252f] flex">
        {/* Left Side - TaskSetu Information */}
        <div className="flex-1 text-white p-12 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border border-blue-400 rounded-full"></div>
            <div className="absolute top-40 right-20 w-24 h-24 border border-blue-400 rounded-full"></div>
            <div className="absolute bottom-40 left-20 w-20 h-20 border border-blue-400 rounded-full"></div>
            <div className="absolute bottom-20 right-40 w-16 h-16 border border-blue-400 rounded-full"></div>
          </div>

          <div className="relative z-10 max-w-md">
            <h1 className="text-4xl font-bold mb-6 text-blue-400">
              Welcome to TaskSetu
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Create your organization workspace and empower your team with
              comprehensive task management
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">
                    Enterprise Task Management
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Complete project and task management for your entire
                    organization
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-blue-400">
                    Team Management
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Invite team members, assign roles, and manage permissions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-blue-400">
                    Advanced Analytics
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Comprehensive reporting and insights for data-driven
                    decisions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-80 bg-white flex items-center justify-center p-3 shadow-2xl">
          <div className="w-full max-w-xs animate-in slide-in-from-right-5 duration-500 ease-in-out">
            <div className="mb-3">
              <button
                onClick={handleBackToChoice}
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 mb-2 transition-colors text-xs"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to options
              </button>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-100 rounded">
                  <Building2 className="h-3 w-3 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Organization Account
                  </h2>
                  <p className="text-gray-600 text-[9px]">
                    Set up your company workspace
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 p-2.5 shadow-sm transition-all duration-500 min-h-[320px] flex flex-col justify-between">
              <form onSubmit={handleRegister} className="space-y-1.5 flex-1">
                <div>
                  <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) =>
                      handleInputChange("organizationName", e.target.value)
                    }
                    className={`w-full px-1 py-1 text-[10px] border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.organizationName
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter organization name"
                  />
                  {errors.organizationName && (
                    <p className="text-red-500 text-[8px] mt-0.5">
                      {errors.organizationName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div>
                    <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`w-full px-1 py-1 text-[10px] border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.firstName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-[8px] mt-0.5">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className={`w-full px-1 py-1 text-[10px] border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                        errors.lastName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-[8px] mt-0.5">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-medium text-gray-700 mb-0.5">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-1 py-1 text-[10px] border rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter admin email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[8px] mt-0.5">
                      {errors.email}
                    </p>
                  )}
                  <p className="text-[8px] text-gray-500 mt-0.5">
                    This will be the admin account for your organization
                  </p>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-1.5 rounded text-[9px] flex items-start gap-1">
                    <AlertCircle className="h-2.5 w-2.5 mt-0.5 flex-shrink-0" />
                    {errors.submit}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-1 px-2 text-[10px] rounded hover:bg-indigo-700 focus:ring-1 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isLoading
                      ? "Creating organization..."
                      : "Create Organization"}
                  </button>
                </div>
              </form>

              <div className="text-center mt-1.5 pt-1.5 border-t border-gray-100">
                <p className="text-gray-600 text-[9px]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
