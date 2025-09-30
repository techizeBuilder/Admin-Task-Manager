import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link, useLocation } from 'wouter';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  AlertTriangle, 
  CreditCard,
  Shield,
  Zap,
  Users,
  Database,
  FolderOpen,
  CheckSquare,
  Star,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

/**
 * Purchase/Upgrade Page - Upgrade plan with payment integration
 */
export default function PurchaseUpgradePage() {
  const [location, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState('execute');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
 const [showPlanLimitDialog, setShowPlanLimitDialog] = useState(false);
   const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [pendingPlan, setPendingPlan] = useState(null);
  // Handle URL parameters for plan pre-selection
   useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const actionParam = urlParams.get('action');
    const planParam = urlParams.get('plan');

    if (actionParam === 'renew') {
      // If renewing, pick the most popular plan
      const popularEntry = Object.entries(finalPlans).find(([, p]) => p.popular);
      if (popularEntry) {
        setSelectedPlan(popularEntry[0]);
      }
    } else if (planParam && finalPlans[planParam]) {
      // If plan is passed, select it
      setSelectedPlan(planParam);
    }
  }, [location]);

  // Fetch user's organization subscription data
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
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

  // Fetch license plans
  const { data: availablePlansResponse, isLoading: availablePlansLoading } = useQuery({
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

  // Calculate days until expiry
  const calculateDaysUntilExpiry = () => {
    if (!subscriptionData?.data) return 0;
    
    const data = subscriptionData.data;
    let expiryDate = null;
    
    if (data.subscription_status === 'trial' && data.trial_end) {
      expiryDate = new Date(data.trial_end);
    } else if (data.subscription_end_date) {
      expiryDate = new Date(data.subscription_end_date);
    }
    
    if (!expiryDate) return 0;
    
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get current plan data dynamically
  const getCurrentPlan = () => {
    if (!subscriptionData?.data || !availablePlansResponse?.data) {
      return {
        name: 'Loading...',
        key: 'explore',
        price: { monthly: 0, yearly: 0 },
        expiryDate: 'Loading...',
        isOnTrial: false,
        daysLeft: 0
      };
    }

    const data = subscriptionData.data;
    const currentPlanData = availablePlansResponse.data.find(plan => 
      plan.license_code === data.current_license
    );

    const daysLeft = calculateDaysUntilExpiry();
    const isOnTrial = data.subscription_status === 'trial';
    
    let expiryDateString = 'No expiry';
    if (isOnTrial && data.trial_end) {
      expiryDateString = new Date(data.trial_end).toLocaleDateString();
    } else if (data.subscription_end_date) {
      expiryDateString = new Date(data.subscription_end_date).toLocaleDateString();
    }

    return {
      name: currentPlanData?.license_name || data.current_license || 'Explore',
      key: data.current_license?.toLowerCase() || 'explore',
      price: { 
        monthly: currentPlanData?.price_monthly || 0, 
        yearly: currentPlanData?.price_yearly || 0 
      },
      expiryDate: expiryDateString,
      isOnTrial,
      daysLeft: Math.max(0, daysLeft)
    };
  };

  const currentPlan = getCurrentPlan();
  const currentUsage = {
    tasksPerMonth: 1200,
    customForms: 80,
    processes: 40,
    reports: 50
  };
  const planLimits = {
    plan: { tasksPerMonth: 100, customForms: 10, processes: 5, reports: Infinity },
    execute: { tasksPerMonth: 500, customForms: 50, processes: 25, reports: Infinity },
    optimize: { tasksPerMonth: Infinity, customForms: Infinity, processes: Infinity, reports: Infinity }
  };
  const formatLimit = (val) => (val === Infinity ? 'Unlimited' : val.toLocaleString());
  const isOver = (usage, limit) => limit !== Infinity && usage > limit;
  const comparisonRows = [
    { key: 'tasksPerMonth', label: 'Tasks / month' },
    { key: 'customForms', label: 'Custom forms' },
    { key: 'processes', label: 'Processes' },
    { key: 'reports', label: 'Reports' }
  ].map(row => ({
    ...row,
    usage: currentUsage[row.key],
    executeLimit: planLimits.execute[row.key],
    optimizeLimit: planLimits.optimize[row.key],
    executeOver: isOver(currentUsage[row.key], planLimits.execute[row.key])
  }));
  // Fetch available license plans
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

  // Fetch license features for plan details
  const { data: featuresResponse } = useQuery({
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
  const featuresData = featuresResponse?.data || [];

  // Transform backend data to frontend format
  const plans = plansData.reduce((acc, plan) => {
    // Skip EXPIRED and EXPLORE (trial) plans from upgrade page
    if (plan.license_code === 'EXPIRED' || plan.license_code === 'EXPLORE') return acc;
    
    const planKey = plan.license_code.toLowerCase();
    
    // Get features for this plan
    const planFeatures = featuresData
      .map(feature => {
        const planFeature = feature.license_features?.find(
          lf => lf.license_code === plan.license_code
        );
        if (!planFeature) return null;
        
        const limit = planFeature.usage_limit;
        let displayLimit;
        if (limit === -1) {
          displayLimit = 'Unlimited';
        } else if (limit === null || limit === undefined) {
          displayLimit = 'Not included';
        } else {
          displayLimit = limit.toString();
        }
        
        return `${displayLimit} ${feature.feature_name.toLowerCase()}`;
      })
      .filter(Boolean);

    acc[planKey] = {
      name: plan.license_name || plan.name,
      description: plan.description || `${plan.license_name} plan`,
      price: { 
        monthly: plan.price_monthly || 0, 
        yearly: plan.price_yearly || 0 
      },
      features: planFeatures,
      popular: plan.license_code === 'OPTIMIZE' // Mark OPTIMIZE as popular
    };
    
    return acc;
  }, {});

  // Fallback to empty object if no plans data
  const finalPlans = Object.keys(plans).length > 0 ? plans : {};

  const getSavingsPercentage = () => {
    return Math.round(((12 - 10) / 12) * 100); // 17% savings for yearly
  };

  const getSelectedPlanPrice = () => {
    const plan = finalPlans[selectedPlan];
    return plan ? plan.price[billingCycle] : 0;
  };

  const handleCouponApply = () => {
    // Mock coupon validation
    if (couponCode.toLowerCase() === 'save20') {
      setCouponError('');
      // Apply discount logic here
    } else if (couponCode) {
      setCouponError('Invalid coupon code');
    } else {
      setCouponError('Please enter a coupon code');
    }
  };

  const handleUpgrade = () => {
    setIsProcessing(true);
    // Mock payment processing
    setTimeout(() => {
      setIsProcessing(false);
          setLocation(`/admin/upgrade-success?plan=${finalPlans[selectedPlan]?.name}`);
      // Redirect to success page or show success state
    }, 2000);
  };

  // Show loading state while fetching data
  if (subscriptionLoading || availablePlansLoading || plansLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-600">Loading subscription data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header Section */}
           <Button variant="outline" size="sm" asChild>
              <Link to="/admin/subscription">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to License
              </Link>
            </Button>
        <div className="flex items-center justify-between">

          <div className="flex items-center space-x-4">
         
            <div className="p-3 bg-blue-100 rounded-xl">
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Upgrade Your Plan
              </h1>
              <p className="text-gray-600 mt-1">
                Choose the plan that fits your needs and complete your upgrade
              </p>
            </div>
          </div>
        </div>

        {/* Current Plan Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
            {currentPlan.isOnTrial && (
              <Badge className="bg-orange-100 text-orange-700">
                {currentPlan.daysLeft} days left in trial
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Crown className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">{currentPlan.name}</div>
                <div className="text-sm text-gray-600">Current plan</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">
                  ₹{currentPlan.price[billingCycle]}/{billingCycle === 'yearly' ? 'year' : 'month'}
                </div>
                <div className="text-sm text-gray-600">Current billing</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <div className="font-medium text-gray-900">{currentPlan.expiryDate}</div>
                <div className="text-sm text-gray-600">
                  {currentPlan.isOnTrial ? 'Trial expires' : 'Next billing'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Plan Selection - Left 8 columns */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Choose Your Plan</h2>
                    <p className="text-sm text-gray-600 mt-1">Select the plan that best fits your needs</p>
                  </div>
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={cn(
                        "px-3 py-1 text-sm rounded-md transition-colors",
                        billingCycle === 'monthly' 
                          ? "bg-white text-gray-900 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={cn(
                        "px-3 py-1 text-sm rounded-md transition-colors",
                        billingCycle === 'yearly' 
                          ? "bg-white text-gray-900 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      Yearly
                      {billingCycle === 'yearly' && (
                        <span className="ml-1 text-xs text-green-600 font-medium">
                          Save {getSavingsPercentage()}%
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Plan Cards */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {Object.entries(finalPlans).length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No plans available at the moment. Please contact support.</p>
                    </div>
                  ) : (
                    Object.entries(finalPlans).map(([planKey, plan]) => (
                    <div 
                      key={planKey}
              onClick={() => {
                        if (planKey === 'plan') {
                          setShowPlanLimitDialog(true);
                          return;
                        }
                        // NEW: show comparison dialog when moving Optimize -> Execute
                        if (selectedPlan === 'optimize' && planKey === 'execute') {
                          setPendingPlan('execute');
                          setShowComparisonDialog(true);
                          return;
                        }
                        setSelectedPlan(planKey);
                      }}
                      className={cn(
                        "border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md relative",
                        selectedPlan === planKey 
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200" 
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
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </div>
                      
                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-gray-900 mb-1">
                          ₹{plan.price[billingCycle]}
                        </div>
                        <div className="text-sm text-gray-600">
                          per {billingCycle === 'yearly' ? 'year' : 'month'}
                        </div>
                        {billingCycle === 'yearly' && (
                          <div className="text-sm text-green-600 font-medium">
                            Save ₹{(plan.price.monthly * 12) - plan.price.yearly}/year
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {selectedPlan === planKey && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary - Right 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium">{finalPlans[selectedPlan]?.name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Billing</span>
                  <span className="font-medium capitalize">{billingCycle}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium">${getSelectedPlanPrice()}</span>
                </div>
                
                {billingCycle === 'yearly' && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Yearly Discount</span>
                    <span>-₹{(finalPlans[selectedPlan]?.price.monthly * 12) - finalPlans[selectedPlan]?.price.yearly}</span>
                  </div>
                )}
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{getSelectedPlanPrice()}</span>
                </div>
              </div>
            </div>

            {/* Coupon Code Card */}
            {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Gift className="h-5 w-5 mr-2" />
                Promo Code
              </h3>
              
              <div className="space-y-3">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    if (couponError) setCouponError('');
                  }}
                  className={cn(
                    couponError ? "border-red-300 focus:border-red-500" : ""
                  )}
                />
                
                {couponError && (
                  <div className="text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {couponError}
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleCouponApply}
                  disabled={!couponCode}
                >
                  Apply Code
                </Button>
              </div>
            </div> */}

            {/* Upgrade Action Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold"
                onClick={handleUpgrade}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
              
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment with 256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
            Why Upgrade to {finalPlans[selectedPlan]?.name}?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enhanced Performance</h3>
              <p className="text-sm text-gray-600">
                Get faster processing, better reliability, and improved user experience.
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-sm text-gray-600">
                Advanced team features, real-time collaboration, and role-based permissions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-xl w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Priority Support</h3>
              <p className="text-sm text-gray-600">
                Get priority customer support, dedicated assistance, and faster response times.
              </p>
            </div>
          </div>
        </div>
      </div>
          {/* Plan limit dialog */}
      <Dialog open={showPlanLimitDialog} onOpenChange={setShowPlanLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Can’t switch to Plan</DialogTitle>
            <DialogDescription>
              You currently have 500 tasks. Plan allows 100 tasks. Please reduce tasks or choose a higher plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter >
            <div className='flex justify-between w-full'>

            <Button variant="outline" onClick={() => setShowPlanLimitDialog(false)}>
              Close
            </Button>
          
            <Button
              variant="secondary"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
        
                setShowPlanLimitDialog(false);
              }}
            >
              Choose Other
            </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          <Dialog open={showComparisonDialog} onOpenChange={setShowComparisonDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Crown className="h-5 w-5 text-purple-600 mr-2" />
              Thinking about switching to Execute?
            </DialogTitle>
            <DialogDescription>
              Based on your current usage, Execute may limit your team in these areas. Optimize keeps everything unlimited.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500">
              <div>Your usage</div>
              <div className="text-center">Execute limits</div>
              <div className="text-center">Optimize limits</div>
            </div>

            <div className="space-y-3">
              {comparisonRows.map((row) => (
                <div key={row.key} className="grid grid-cols-3 gap-2 items-center">
                  <div className="text-sm text-gray-800">
                    {row.label}
                    <div className="text-gray-500">{row.usage.toLocaleString()}</div>
                  </div>

                  <div className="text-sm">
                    <div
                      className={cn(
                        "w-full text-center px-2 py-1 rounded-md",
                        row.executeOver
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-green-50 text-green-700 border border-green-200"
                      )}
                    >
                      {formatLimit(row.executeLimit)}
                    </div>
                    {row.executeOver && (
                      <div className="mt-1 flex items-center justify-center text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Over current usage
                      </div>
                    )}
                  </div>

                  <div className="text-sm">
                    <div className="w-full text-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      {formatLimit(row.optimizeLimit)}
                    </div>
                    <div className="mt-1 flex items-center justify-center text-xs text-purple-600">
                      <Check className="h-3 w-3 mr-1" />
                      Room to grow
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
              Tip: Optimize includes unlimited tasks, forms, and processes with priority support.
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => {
                  setShowComparisonDialog(false);
                  setPendingPlan(null);
                  setSelectedPlan('optimize');
                }}
              >
                Stay with Optimize
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowComparisonDialog(false);
                  if (pendingPlan) setSelectedPlan(pendingPlan);
                  setPendingPlan(null);
                }}
              >
                Switch to Execute anyway
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}