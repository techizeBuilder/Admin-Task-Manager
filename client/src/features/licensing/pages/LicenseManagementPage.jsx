import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  RefreshCcw,
  Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserRole } from "../../../utils/auth";
import { useToast } from '@/hooks/use-toast';
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
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState("optimize");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExpiryBanner, setShowExpiryBanner] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: user, isAdmin } = useUserRole();

  // Fetch dynamic license plans
  const { data: plansResponse, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/license/plans'],
    queryFn: async () => {
      const response = await fetch('/api/license/plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch plans');
      return response.json();
    }
  });

  // Fetch current subscription data
  const { data: subscriptionResponse, isLoading: subscriptionLoading, error: subscriptionError } = useQuery({
    queryKey: ['/api/organization/subscription'],
    queryFn: async () => {
      const response = await fetch('/api/organization/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch subscription');
      return response.json();
    }
  });

  // Fetch features data
  const { data: featuresResponse, isLoading: featuresLoading } = useQuery({
    queryKey: ['/api/license/features'],
    queryFn: async () => {
      const response = await fetch('/api/license/features', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch features');
      return response.json();
    }
  });

  const plansData = plansResponse?.data || [];
  const subscriptionData = subscriptionResponse?.data;
  const featuresData = featuresResponse?.data || [];

  // Find current plan - the organization stores current_license as a string like "EXPLORE"
  const currentPlan = plansData.find(plan => 
    plan.license_code === subscriptionData?.current_license
  );

  // If no plan found, create a fallback based on current license
  const effectivePlan = currentPlan || {
    license_code: subscriptionData?.current_license || 'EXPLORE',
    license_name: subscriptionData?.current_license || 'Explore (Free Trial)',
    description: 'Trial plan',
    price_monthly: 0,
    price_yearly: 0
  };

  // Stable fallback limits (used while data loads or for missing definitions)
  const fallbackLimits = useMemo(() => ({
    TASK_BASIC: 10,
    FORM_CREATE: 2,
    PROC_CREATE: 1,
    REPORT_BASIC: 5
  }), []);

  // Memo map of feature_code -> normalized limit for active plan
  const featureLimitMap = useMemo(() => {
    if (!effectivePlan || !featuresData || featuresData.length === 0) return fallbackLimits;
    const map = { ...fallbackLimits };
    for (const feature of featuresData) {
      if (!Array.isArray(feature.license_features)) continue;
      const planFeature = feature.license_features.find(lf => lf.license_code === effectivePlan.license_code);
      if (!planFeature) continue;
      const raw = planFeature.usage_limit;
      if (raw === -1) {
        map[feature.feature_code] = -1; // Unlimited
      } else if (raw === null || raw === undefined) {
        // leave fallback
      } else {
        map[feature.feature_code] = raw;
      }
    }
    return map;
  }, [effectivePlan?.license_code, featuresData, fallbackLimits]);

  const getFeatureLimit = (featureCode) => featureLimitMap[featureCode] ?? 0;

  const getUsage = (featureCode) => {
    return subscriptionData?.usage?.[featureCode] || 0;
  };

  const getUsagePercentage = (used, limit) => {
    if (limit === null || limit === -1) return 0;
    if (!limit || limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageStatus = (featureCode) => {
  const rawCurrent = getUsage(featureCode);
  const limit = getFeatureLimit(featureCode);
  // Clamp display current so UI number never exceeds limit (unless unlimited)
  const displayCurrent = (limit > 0 && rawCurrent > limit) ? limit : rawCurrent;
  const percentage = getUsagePercentage(rawCurrent, limit);
    
    // Handle cases where limit might be 0, null, undefined, or -1
    let remaining;
    let isUnlimited;
    
    if (limit === -1) {
      remaining = Infinity;
      isUnlimited = true;
    } else if (limit === 0 || limit === null || limit === undefined || isNaN(limit)) {
      remaining = 0;
      isUnlimited = false;
    } else {
      remaining = Math.max(0, limit - rawCurrent);
      isUnlimited = false;
    }
    
    return {
      rawCurrent: rawCurrent || 0,
      current: displayCurrent || 0,
      // Preserve -1 so UI can detect unlimited instead of converting to 0
      limit: (limit === -1 ? -1 : (limit || 0)),
      remaining,
      percentage: isNaN(percentage) ? 0 : percentage,
      isOverLimit: !isUnlimited && limit > 0 && rawCurrent > limit,
      isNearLimit: !isUnlimited && limit > 0 && percentage > 80,
      isUnlimited
    };
  };

  // Debug logging
  console.log('API Responses:', {
    plansResponse,
    subscriptionResponse,
    featuresResponse,
    subscriptionError
  });

  // Additional debug for features data structure
  console.log('Features Data Structure:', featuresData);
  console.log('Current/Effective Plan:', { currentPlan, effectivePlan });
  if (featuresData && featuresData.length > 0) {
    console.log('Sample feature:', featuresData[0]);
    if (featuresData[0]?.license_features) {
      console.log('Sample license_features:', featuresData[0].license_features);
    }
  }

  // Debug feature limits for current plan
  console.log('Feature Limits Debug:', {
    TASK_BASIC: getFeatureLimit('TASK_BASIC'),
    FORM_CREATE: getFeatureLimit('FORM_CREATE'), 
    PROC_CREATE: getFeatureLimit('PROC_CREATE'),
    REPORT_BASIC: getFeatureLimit('REPORT_BASIC')
  });

  // Calculate days until expiry
  const calculateDaysUntilExpiry = () => {
    if (subscriptionData?.subscription_status === 'trial' && subscriptionData?.trial_end) {
      const expiry = new Date(subscriptionData.trial_end);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    if (subscriptionData?.subscription_end_date) {
      const expiry = new Date(subscriptionData.subscription_end_date);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const daysUntilExpiry = calculateDaysUntilExpiry();
  const isOnTrial = subscriptionData?.subscription_status === 'trial';
  const isExpired = daysUntilExpiry <= 0;
  const isExpiringSoon = daysUntilExpiry <= 5 && daysUntilExpiry > 0;

  // Upgrade mutation
  const upgradeSubscription = useMutation({
    mutationFn: async ({ newLicenseCode, billingCycle }) => {
      const response = await fetch('/api/organization/upgrade-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newLicenseCode, billingCycle })
      });
      
      if (!response.ok) throw new Error('Failed to upgrade subscription');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Subscription Upgraded!',
        description: 'Your new plan is now active.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organization/subscription'] });
    },
    onError: (error) => {
      toast({
        title: 'Upgrade Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Convert backend data to frontend format for display
  const convertPlansForDisplay = () => {
    return plansData
      .filter(plan => plan.license_code !== 'EXPIRED') // Don't show EXPIRED plan to users
      .reduce((acc, plan) => {
        const planKey = plan.license_code.toLowerCase();
        const features = featuresData.filter(feature => 
          feature.license_features.some(lf => lf.license_code === plan.license_code)
        );

      acc[planKey] = {
        name: plan.license_name,
        description: plan.description || `${plan.license_name} plan`,
        price: {
          monthly: plan.price_monthly || 0,
          yearly: plan.price_yearly || 0
        },
        features: features.map(feature => {
          const planFeature = feature.license_features.find(
            lf => lf.license_code === plan.license_code
          );
          const limit = planFeature?.usage_limit;
          // Handle undefined, null, and numeric values properly
          let displayLimit;
          if (limit === undefined || limit === null) {
            displayLimit = '0';
          } else if (limit === -1) {
            displayLimit = 'Unlimited';
          } else {
            displayLimit = limit.toString();
          }
          return `${displayLimit} ${feature.feature_name}`;
        }),
        table_data: features.reduce((data, feature) => {
          const planFeature = feature.license_features.find(
            lf => lf.license_code === plan.license_code
          );
          const limit = planFeature?.usage_limit;
          // Handle undefined, null, and numeric values properly
          if (limit === undefined || limit === null) {
            data[feature.feature_name] = '0';
          } else if (limit === -1) {
            data[feature.feature_name] = 'Unlimited';
          } else {
            data[feature.feature_name] = limit.toString();
          }
          return data;
        }, {}),
        popular: plan.license_code === 'OPTIMIZE'
      };
      
      return acc;
    }, {});
  };

  const plans = convertPlansForDisplay();

  if (plansLoading || subscriptionLoading || featuresLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
          {isAdmin && (
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
        {(isExpired || isExpiringSoon) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-800 mb-3">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">License Alert</span>
            </div>
            <div className="text-sm text-yellow-700">
              {isExpired ? (
                <span className="font-medium">
                  Your license has expired! Please renew to continue using all features.
                </span>
              ) : (
                <span className="font-medium">
                  Your license expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}!
                </span>
              )}
            </div>
          </div>
        )}

        {/* Usage Limit Warnings */}
        {(() => {
          const nearLimitFeatures = [
            { key: "TASK_BASIC", label: "tasks" },
            { key: "FORM_CREATE", label: "forms" },
            { key: "PROC_CREATE", label: "processes" },
            { key: "REPORT_BASIC", label: "reports" }
          ].filter(({ key }) => {
            const status = getUsageStatus(key);
            return !status.isUnlimited && (status.isOverLimit || status.remaining <= 3);
          });

          if (nearLimitFeatures.length === 0) return null;

          return (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-orange-800 mb-3">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Usage Alert</span>
              </div>
              <div className="text-sm text-orange-700">
                <span className="font-medium">
                  You're approaching limits for: {nearLimitFeatures.map(f => f.label).join(', ')}
                </span>
                <div className="mt-2">
                  <Link to="/admin/upgrade">
                    <button className="text-sm px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition">
                      Upgrade Plan
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Usage Overview and Trial Countdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Usage Overview Section - Left 8 columns */}
          <div className="lg:col-span-8">
            { (plansLoading || featuresLoading || subscriptionLoading) ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-500">
                Loading usage data...
              </div>
            ) : (
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
    { key: "TASK_BASIC", label: "Tasks created", Icon: CheckSquare },
    { key: "FORM_CREATE", label: "Forms created", Icon: FileText },
    { key: "PROC_CREATE", label: "Processes created", Icon: Workflow },
    { key: "REPORT_BASIC", label: "Reports generated", Icon: BarChart3 },
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
            {status.current}/{status.isUnlimited ? "∞" : (status.limit === -1 ? "∞" : status.limit || 0)}
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
              width: `${Math.min(status.percentage || 0, 100)}%`,
            }}
          />
        </div>

        {/* Usage info and remaining */}
        <div className="flex justify-between text-xs">
          <div className="text-gray-500">
            <span>{Math.round(status.percentage || 0)}% used</span>
            {status.isOverLimit && (
              <span className="text-red-600 font-semibold ml-2">Over limit</span>
            )}
          </div>
          <div className={cn(
            "font-medium",
            status.isUnlimited ? "text-green-600" :
            status.limit === 0 ? "text-gray-400" :
            status.remaining <= 0 ? "text-red-600" :
            status.remaining <= 5 ? "text-yellow-600" : "text-gray-600"
          )}>
            {status.isUnlimited ? "Unlimited" :
             (status.limit === 0 ? "Not available" :
              isFinite(status.remaining) ? `${status.remaining} left` : "0 left")}
          </div>
        </div>
      </div>
      </Card>
    );
  })}
</div>
              </div>
            </div>
            )}
          </div>

          {/* Trial Countdown and Quick Actions - Right 4 columns */}
        <div className="lg:col-span-4 space-y-4">
  {/* Expiry Card */}
  <div className={cn(
    "border rounded-lg p-5 shadow-sm",
    isExpired ? "bg-red-50 border-red-300" : isExpiringSoon ? "bg-yellow-50 border-yellow-300" : "bg-green-50 border-green-300"
  )}>
    <div className="flex items-center justify-between mb-2">
      <span className={cn(
        "text-sm font-medium",
        isExpired ? "text-red-700" : isExpiringSoon ? "text-yellow-700" : "text-green-700"
      )}>
        {isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Active"}
      </span>
      <Clock className={cn(
        "h-4 w-4",
        isExpired ? "text-red-600" : isExpiringSoon ? "text-yellow-600" : "text-green-600"
      )} />
    </div>
    <div className="text-lg font-semibold text-gray-900">
      {isOnTrial ? "Trial" : "License"} {isExpired ? "Expired" : "Expires"}: 
      <span className={cn(
        "ml-1",
        isExpired ? "text-red-600" : isExpiringSoon ? "text-yellow-600" : "text-gray-900"
      )}>
        {subscriptionData?.trial_end || subscriptionData?.subscription_end_date 
          ? new Date(subscriptionData.trial_end || subscriptionData.subscription_end_date).toLocaleDateString()
          : 'Never'
        }
      </span>
    </div>
    <div className="flex justify-between items-center">
      <div className="text-xs text-gray-600 mt-1">
        <span className={cn(
          "font-medium",
          isExpired ? "text-red-600" : isExpiringSoon ? "text-yellow-600" : "text-green-600"
        )}>
          {Math.abs(daysUntilExpiry)} day{Math.abs(daysUntilExpiry) !== 1 ? 's' : ''}
        </span> 
        {isExpired ? " overdue" : " left"}
      </div>
      {isAdmin && (isExpired || isExpiringSoon) && (
        <Link to="/admin/upgrade?action=renew">
          <button className={cn(
            "mt-3 text-white text-xs font-medium py-1.5 px-3 rounded-md transition",
            isExpired ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700"
          )}>
            {isExpired ? "Renew Now" : "Renew"}
          </button>
        </Link>
      )}
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
    {effectivePlan?.license_name || subscriptionData?.current_license || 'No Plan'}
  </div>

  {/* Plan Amount + Trial */}
  <div className="flex items-center justify-between mt-1">
    <span className="text-sm font-medium text-gray-700">
      ₹{effectivePlan?.price_monthly || 0}/{billingCycle === "yearly" ? "yr" : "mo"}
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
    <span className="font-medium text-blue-600">{daysUntilExpiry} days</span> left
  </div>
</div>

  {/* Renewal Date Card */}
  <div className="bg-white rounded-lg p-5 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className=" text-sm font-medium">
        {isOnTrial ? "Trial Started" : "Last Renewal"}
      </span>
      <RefreshCcw className="h-4 w-4 text-blue-600" />
    </div>
    <div className="text-lg font-semibold text-gray-900">
      {subscriptionData?.subscription_start_date || subscriptionData?.trial_start_date
        ? new Date(subscriptionData.subscription_start_date || subscriptionData.trial_start_date).toLocaleDateString()
        : 'N/A'
      }
    </div>
    <div className="text-xs text-blue-600 mt-1">
      {isOnTrial ? "Trial period started" : "Last renewal for this plan"}
    </div>
  </div>

  {/* Feature Limits Summary Card */}
  <div className="bg-white rounded-lg p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-gray-900">Your Plan Limits</span>
      <Info className="h-4 w-4 text-blue-600" />
    </div>
    
    <div className="space-y-2">
      {[
        { key: "TASK_BASIC", label: "Tasks", icon: "📋" },
        { key: "FORM_CREATE", label: "Forms", icon: "📝" },
        { key: "PROC_CREATE", label: "Processes", icon: "⚙️" },
        { key: "REPORT_BASIC", label: "Reports", icon: "📊" },
      ].map(({ key, label, icon }) => {
        const status = getUsageStatus(key);
        return (
          <div key={key} className="flex justify-between items-center text-xs">
            <span className="text-gray-600 flex items-center">
              <span className="mr-2">{icon}</span>
              {label}
            </span>
            <span className={cn(
              "font-medium",
              status.isUnlimited ? "text-green-600" :
              status.remaining <= 0 ? "text-red-600" :
              status.remaining <= 5 ? "text-yellow-600" : "text-gray-800"
            )}>
              {status.isUnlimited ? "Unlimited" : 
               status.remaining <= 0 ? "Over limit!" : 
               `${status.remaining} remaining`}
            </span>
          </div>
        );
      })}
    </div>
    
    {/* Upgrade prompt if near limits */}
    {Object.values([
      getUsageStatus("TASK_BASIC"),
      getUsageStatus("FORM_CREATE"), 
      getUsageStatus("PROC_CREATE"),
      getUsageStatus("REPORT_BASIC")
    ]).some(status => !status.isUnlimited && (status.remaining <= 5 || status.isOverLimit)) && (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <Link to="/admin/upgrade">
          <button className="w-full text-xs py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Upgrade for more limits
          </button>
        </Link>
      </div>
    )}
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
                    const isCurrent = currentPlan?.license_code?.toLowerCase() === planKey;
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
                          {billingCycle === "yearly" && plan.price.monthly > 0 && (
                            <div className="text-sm text-green-600 font-medium">
                              Save ₹{plan.price.monthly * 12 - plan.price.yearly}/year
                            </div>
                          )}
                        </div>

                        {/* CTA pinned to bottom */}
                        <div className="mt-auto">
                          {isCurrent ? (
                            <button
                              disabled
                              className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
                            >
                              Your Current Plan
                            </button>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                upgradeSubscription.mutate({
                                  newLicenseCode: planKey.toUpperCase(),
                                  billingCycle: billingCycle.toUpperCase()
                                });
                              }}
                              disabled={upgradeSubscription.isPending}
                              className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                            >
                              {upgradeSubscription.isPending ? 'Upgrading...' : 'Upgrade'}
                            </button>
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
        </>
      )}
      </div>
    </div>
  );
}
