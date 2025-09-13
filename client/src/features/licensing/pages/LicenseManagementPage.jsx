import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  Zap,
  Users,
  Database,
  FolderOpen,

  AlertCircle,
  Crown,
  TrendingUp,
  Check,
  Star,
  Gift,
  CreditCard,
  Shield,
  Clock,CheckSquare, FileText, Workflow, BarChart3,
  RefreshCcw
} from "lucide-react";
import useLicensing from "../hooks/useLicensing";
import usePlanLimits from "../hooks/usePlanLimits";
import UsageMeter from "../components/UsageMeter";
import TrialCountdown from "../components/TrialCountdown";
import BillingToggle from "../components/BillingToggle";
import PlanCard from "../components/PlanCard";
import { Input } from "@/components/ui/input";


import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils"; // if you already use cn helper

import { useUserRole } from "../../../utils/auth";
/**
 * License Management Page - In-app summary with usage meters, trial countdown, plan comparison cards
 */ function ComparisonTable({ plans }) {
  const [expanded, setExpanded] = useState(false);

  // Get all feature names
  const allFeatures = Object.keys(
    Object.values(plans).reduce(
      (acc, plan) => ({ ...acc, ...plan.features }),
      {}
    )
  );

  // Show first 3 features only in collapsed mode
  const visibleFeatures = expanded ? allFeatures : allFeatures.slice(0, 3);

  return (
<div className="bg-white rounded-2xl shadow-md border border-gray-200 mt-8 overflow-hidden">
  {/* Heading */}
  <div className="px-6 py-4 border-b border-gray-200">
    <h2 className="text-xl font-bold text-gray-900 ">
      Compare Our Plans
    </h2>
    <p className="text-sm text-gray-500  mt-1">
      Choose the plan that best fits your needs
    </p>
  </div>

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left border-collapse">
      {/* Header Row */}
      <thead>
        <tr>
          {Object.values(plans).map((plan) => (
            <th
              key={plan.name}
              className="p-6 text-center align-top border-l border-gray-200 first:border-l-0"
            >
              <div className="text-lg font-semibold text-gray-900">
                {plan.name}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {plan.description}
              </div>
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {/* Feature Rows */}
        {visibleFeatures.map((feature, idx) => (
          <tr key={idx} className="border-t border-gray-200">
            {Object.values(plans).map((plan) => (
              <td
                key={plan.name + feature}
                className="p-4 text-center border-l border-gray-200 first:border-l-0"
              >
                <span className="text-gray-900 font-medium">
                  {plan.features[feature] || "—"}
                </span>
              </td>
            ))}
          </tr>
        ))}

        {/* Expand/Collapse Toggle Row */}
        <tr className="border-t border-gray-100 bg-gray-50">
          <td colSpan={Object.keys(plans).length} className="p-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              {expanded ? "Hide Detailed Features" : "Show Detailed Features"}
            </button>
          </td>
        </tr>

        {/* Price Row */}
        <tr className="border-t border-gray-300 bg-gray-50">
          {Object.values(plans).map((plan) => (
            <td
              key={plan.name + "price"}
              className="p-6 text-center border-l border-gray-200 first:border-l-0"
            >
              <div className="text-2xl font-bold text-gray-900">
                ₹{plan.price.monthly}
              </div>
              <div className="text-sm text-gray-600">per month</div>
            </td>
          ))}
        </tr>

        {/* CTA Row */}
       <tr className="bg-gray-50">
          {Object.entries(plans).map(([planKey, plan]) => (
            <td
              key={planKey + "cta"}
              className="p-6 text-center border-l border-gray-200 first:border-l-0"
            >
              {planKey === "explore" ? (
                <button
                  disabled
                  className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
                >
                  Your Current Plan
                </button>
              ) : (
                <Link to={`/admin/upgrade?plan=${encodeURIComponent(planKey)}`}>
                  <button className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition">
                    I want this
                  </button>
                </Link>
              )}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
</div>


  );
}
export default function LicenseManagementPage() {
  const {
    currentPlan: currentPlanKey,

    usage,
    trialDaysLeft,
    isLoading,

    getCurrentPlan,
    getUsagePercentage,
    isOverLimit,
    canUpgrade,
    upgradePlan,

    getSavingsPercentage,
    hasAccess,
    getUsageStatus,
  } = useLicensing();
 
  const { getFeatureStatus, getLimitWarnings } = usePlanLimits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState(null);
  const [upgradeReason, setUpgradeReason] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("optimize");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
 
  const { data: user,isAdmin } = useUserRole();
  const currentPlan = getCurrentPlan();
  const isOnTrial = currentPlanKey === "explore";
  const warnings = getLimitWarnings;
  const hasWarnings = warnings.length > 0;
  const detailedKeys = ["tasks", "forms", "processes", "reports"];
  const overLimitKeys = detailedKeys.filter(
    (k) => getUsageStatus(k).isOverLimit
  );

  const hasAnyOverLimit = overLimitKeys.length > 0;
  const plans = {
    explore: {
      name: "Explore (Free)",
      description: "First-time users, trial mode",
      price: { monthly: 0, yearly: 0 }, // Free plan
      features: [
        "All features available",
        "10 tasks/month",
        "2 custom forms",
        "1 process",
        "3 reports",
      ],
      table_data: {
   "Tasks / month": "10",
      "Custom forms": "2",
      "Processes": "1",
      "Reports": "3",
      "Support": "—",
      "Analytics": "—",
    },
      duration: "15 days trial only → after expiry, prompt to upgrade",
      popular: false,
    }, optimize: {
      name: "Optimize",
      description: "Large organizations",
      price: { monthly: 99, yearly: 990 },
      features: [
        "Unlimited tasks",
        "Unlimited custom forms",
        "Unlimited processes",
        "Unlimited reports",
        "24/7 priority support",
        "Dedicated account manager",
        "Advanced security",
        // "API access",
        "Custom integrations",
        // "White-label options",
      ],
        table_data: {
    "Tasks / month": "Unlimited",
      "Custom forms": "Unlimited",
      "Processes": "Unlimited",
      "Reports": "Unlimited",
      "Support": "24/7 Priority",
      "Account Manager": "Dedicated",
      "Security": "Advanced",
      "Integrations": "Custom",
    },
      popular: true,
    },
    plan: {
      name: "Plan",
      description: "Individuals / small teams",
      price: { monthly: 19, yearly: 190 },
      features: [
        "100 tasks/month",
        "10 custom forms",
        "5 processes",
        "Unlimited reports",
        "Email support",
        "Basic analytics",
      ],
        table_data: {
   "Tasks / month": "100",
      "Custom forms": "10",
      "Processes": "5",
      "Reports": "Unlimited",
      "Support": "Email",
      "Analytics": "Basic",
    },
      popular: false,
    },
    execute: {
      name: "Execute",
      description: "Growing teams",
      price: { monthly: 49, yearly: 490 },
      features: [
        "500 tasks/month",
        "50 custom forms",
        "25 processes",
        "Unlimited reports",
        "Priority support",
        "Advanced analytics",
        "Team collaboration",
        "Custom workflows",
      ],
        table_data: {
   "Tasks / month": "Unlimited",
      "Custom forms": "Unlimited",
      "Processes": "Unlimited",
      "Reports": "Unlimited",
      "Support": "24/7 Priority",
      "Account Manager": "Dedicated",
      "Security": "Advanced",
      "Integrations": "Custom",
    },
      popular: false,
    },
   
  };

  const getSelectedPlanPrice = () => {
    const plan = plans[selectedPlan];
    return plan ? plan.price[billingCycle] : 0;
  };
  const handleCouponApply = () => {
    if (couponCode.toLowerCase() === "save20") {
      setCouponError("");
      // Apply discount logic if needed
    } else if (couponCode) {
      setCouponError("Invalid coupon code");
    } else {
      setCouponError("Please enter a coupon code");
    }
  };
  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      // Add success handling if needed
    }, 2000);
  };
  // Handle upgrade modal trigger from usage limits
  React.useEffect(() => {
    const handleShowUpgradeModal = (event) => {
      const { reason } = event.detail;
      setUpgradeReason(reason);
      // Auto-suggest next tier up
      const planKeys = ["explore", "starter", "professional", "enterprise"];
      const currentIndex = planKeys.indexOf(currentPlanKey);
      if (currentIndex < planKeys.length - 1) {
        setSelectedUpgradePlan(plans[planKeys[currentIndex + 1]]);
        setShowUpgradeModal(true);
      }
    };

    window.addEventListener("showUpgradeModal", handleShowUpgradeModal);
    return () =>
      window.removeEventListener("showUpgradeModal", handleShowUpgradeModal);
  }, [currentPlanKey, plans]);

  const handleUpgradeClick = (planKey) => {
    setSelectedUpgradePlan(plans[planKey]);
    setUpgradeReason("manual");
    setShowUpgradeModal(true);
  };

  const handleConfirmUpgrade = async () => {
    if (selectedUpgradePlan) {
      const planKey = Object.keys(plans).find(
        (key) => plans[key] === selectedUpgradePlan
      );
      await upgradePlan(planKey);
      setShowUpgradeModal(false);
      setSelectedUpgradePlan(null);
    }
  };
// Add: sticky expiry banner state and logic
  const [showExpiryBanner, setShowExpiryBanner] = useState(false);
  // Show banner if trial is ending soon (<= 5 days). Plug in your real license expiry logic as needed.
  const isExpiringSoon = isOnTrial && typeof trialDaysLeft === "number" && trialDaysLeft <= 5;

  return (
    <div className="min-h-screen bg-gray-50">
        
      <div
        className="max-w-7xl mx-auto p-6 space-y-6"
        data-testid="license-management-page"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4"> {showExpiryBanner && isExpiringSoon && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="mx-auto max-w-7xl">
            <div className="m-2 rounded-md border border-amber-200 bg-amber-50 text-amber-900 px-4 py-2 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm">
                  Your {isOnTrial ? "trial" : "license"} will expire in{" "}
                  <span className="font-semibold">{trialDaysLeft}</span>{" "}
                  {trialDaysLeft === 1 ? "day" : "days"}. Please renew.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/admin/upgrade?action=renew">
                  <Button
                    size="sm"
                    className="h-7 px-3 bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Renew now
                  </Button>
                </Link>
                <button
                  aria-label="Dismiss"
                  onClick={() => setShowExpiryBanner(false)}
                  className="p-1 rounded hover:bg-amber-100"
                >
                  <X className="h-4 w-4 text-amber-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
            <div className="p-3 bg-blue-100 rounded-xl">
              <Crown className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                data-testid="page-title"
              >
                License & Subscription
              </h1>
              <p className="text-gray-600 mt-1" data-testid="page-description">
                Manage your subscription plan and monitor usage
              </p>
            </div>
          </div>
          {hasAccess("billing") && (
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              data-testid="view-billing-button"
            >
              <Link to="/admin/billing">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Billing
              </Link>
            </Button>
          )}
        </div>

        {/* Warning Alerts */}
        {hasWarnings && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-800 mb-3">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Usage Alerts</span>
            </div>
            <div className="space-y-2">
              {warnings.map((warning, index) => (
                <div
                  key={index}
                  className="text-sm text-yellow-700"
                  data-testid={`warning-${index}`}
                >
                  <span className="font-medium">
                    {warning.feature.charAt(0).toUpperCase() +
                      warning.feature.slice(1)}
                    :
                  </span>{" "}
                  {warning.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Overview and Trial Countdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Usage Overview Section - Left 8 columns */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Usage Overview
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Monitor your current usage against plan limits
                </p>
              </div>

              {/* Usage Meters Grid - Flex grow to fill remaining space */}
              <div className="p-6 flex-1 flex items-center">
           
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
  {[
    { key: "tasks", label: "Tasks created", Icon: CheckSquare },
    { key: "forms", label: "Forms created", Icon: FileText },
    { key: "processes", label: "Processes created", Icon: Workflow },
    { key: "reports", label: "Reports generated", Icon: BarChart3 },
  ].map(({ key, label, Icon }) => {
    const status = getUsageStatus(key);
    return (
      <Card className="w-full p-6" key={key}>
      <div
        key={key}
        className="space-y-3"
        data-testid={`usage-meter-${key}`}
      >
        <div className="flex items-center justify-between">
          {/* Label with icon */}
          <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4 text-gray-600" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-700">
              {label}
            </span>
          </div>

          {/* Usage numbers */}
          <span className="text-sm text-gray-600">
            {status.current}/{status.limit === -1 ? "∞" : status.limit}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all",
              status.isOverLimit
                ? "bg-red-500"
                : status.isNearLimit
                ? "bg-yellow-500"
                : "bg-green-500"
            )}
            style={{
              width: `${Math.min(status.percentage, 100)}%`,
            }}
          />
        </div>

        {/* Percentage + warning */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>{Math.round(status.percentage)}% used</span>
          {status.isOverLimit && (
            <span className="text-red-600 font-semibold">Over limit</span>
          )}
        </div>
      </div>
      </Card>
    );
  })}
</div>
              </div>
            </div>
          </div>

          {/* Trial Countdown and Quick Actions - Right 4 columns */}
        <div className="lg:col-span-4 space-y-4">
  {/* Expiry Card */}
  <div className="bg-red-50 border border-red-300 rounded-lg p-5 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="text-red-700 text-sm font-medium">Expiring Soon</span>
      <Clock className="h-4 w-4 text-red-600" />
    </div>
    <div className="text-lg font-semibold text-gray-900">
      Expires: <span className="text-red-600">15 Sept 2025</span>
    </div>
    <div className="flex justify-between items-center ">

    <div className="text-xs text-gray-600 mt-1">
      <span className="font-medium text-red-600">2 days</span> left
    </div>
    {
      isAdmin && (
         <Link to="/admin/upgrade?action=renew">
                
        <button className="mt-3 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 px-3 rounded-md transition">
        Renew
      </button>
      </Link>
      )
    }

    </div>
  </div>

  {/* Current Plan Card */}
<div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
  <div className="flex items-center justify-between mb-2">
    <span className="text-gray-600 text-sm">Current Plan</span>
    <Crown className="h-4 w-4 text-blue-600" />
  </div>

  {/* Plan Name */}
  <div className="text-lg font-semibold text-gray-900">
    {currentPlan.name}
  </div>

  {/* Plan Amount + Trial */}
  <div className="flex items-center justify-between mt-1">
    <span className="text-sm font-medium text-gray-700">
      ₹{currentPlan.price[billingCycle]}/{billingCycle === "yearly" ? "yr" : "mo"}
    </span>
    {isOnTrial && (
      <Badge
        onClick={() => setShowExpiryBanner(true)}
        className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5"
      >
        Trial
      </Badge>
    )}
  </div>

  {/* Days Left */}
  <div className="text-xs text-gray-600 mt-1">
    <span className="font-medium text-blue-600">5 days</span> left
  </div>
</div>


  {/* Renewal Date Card */}
  <div className="bg-white rounded-lg p-5 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className=" text-sm font-medium">Last Renewal</span>
      <RefreshCcw className="h-4 w-4 text-blue-600" />
    </div>
    <div className="text-lg font-semibold text-gray-900">
      15 Sept 2024
    </div>
    <div className="text-xs text-blue-600 mt-1">
  Last renewal for this plan
</div>
  </div>
</div>

        </div>
{
  isAdmin && (

    <>
        {/* Added: Plan Selection + Order Summary (top) */}
        <div className="grid grid-cols-1">
          {/* Plan Selection - Left 8 columns */}
    
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Choose Your Plan
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Select the plan that best fits your needs
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setBillingCycle("monthly")}
                      className={cn(
                        "px-3 py-1 text-sm rounded-md transition-colors",
                        billingCycle === "monthly"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle("yearly")}
                      className={cn(
                        "px-3 py-1 text-sm rounded-md transition-colors",
                        billingCycle === "yearly"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      Yearly
                   
                    </button>
                  </div>
                </div>
              </div>

              {/* Plan Cards */}
               <div className="p-6">
                {/* Ensure cards stretch to equal height */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {Object.entries(plans).map(([planKey, plan]) => {
                    const isCurrent = planKey === currentPlanKey;
                    return (
                      <div
                        key={planKey}
                        onClick={() => setSelectedPlan(planKey)}
                        className={cn(
                          // Make each card a full-height flex column
                          "border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md relative h-full flex flex-col",
                          isCurrent && "bg-gray-50", // light background for current plan only
                          selectedPlan === planKey
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-purple-100 text-purple-700 text-xs px-3 py-1">
                              <Star className="h-3 w-3 mr-1" />
                              Most Popular
                            </Badge>
                          </div>
                        )}

                        <div className="text-center mb-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {plan.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {plan.description}
                          </p>
                        </div>

                        <div className="text-center mb-6">
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            ₹{plan.price[billingCycle]}
                          </div>
                          <div className="text-sm text-gray-600">
                            per {billingCycle === "yearly" ? "year" : "month"}
                          </div>
                          {billingCycle === "yearly" && (
                            <div className="text-sm text-green-600 font-medium">
                              Save ₹{plan.price.monthly * 12 - plan.price.yearly}
                              /year
                            </div>
                          )}
                        </div>

                        {/* Content above CTA */}
                        {/* <div className="space-y-3 mb-6">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div> */}

                        {/* CTA pinned to bottom */}
                    <div className="mt-auto">
                          {plan.name === "Explore (Free)" ? (
                            <button
                              disabled
                              className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
                            >
                              Your Current Plan
                            </button>
                          ) : (
                            <Link to={`/admin/upgrade?plan=${encodeURIComponent(planKey)}`}>
                              <button className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition">
                                Upgrade
                              </button>
                            </Link>
                          )}
                        </div>

                        {selectedPlan === planKey && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
         
        </div>


          {/* Collapsible comparison table → expands to show detailed feature breakdown.
           */}
           <ComparisonTable plans={plans}/>
     </>)
}
      </div>
    </div>
  );
}
