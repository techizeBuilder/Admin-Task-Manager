import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  Workflow,
  AlertTriangle,
  Crown,
  Check,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LicenseManagement = () => {
  const [billingPeriod, setBillingPeriod] = useState('yearly');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user and role
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/me']
  });

  // Get license plans from API
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

  // Get current subscription data
  const { data: subscriptionResponse, isLoading: subscriptionLoading } = useQuery({
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

  // Get features data for limits
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

  const isLoading = plansLoading || subscriptionLoading || featuresLoading;
  const plansData = plansResponse?.data || [];
  const subscriptionData = subscriptionResponse?.data;
  const featuresData = featuresResponse?.data || [];

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'company_admin';

  // Transform API data into the format expected by the UI
  const plans = plansData.map(plan => ({
    id: plan.license_code.toLowerCase(),
    name: plan.license_name,
    description: plan.description,
    monthlyPrice: plan.price_monthly,
    yearlyPrice: plan.price_yearly,
    features: plan.features || [],
    limits: {
      tasks: getFeatureLimit('BASIC_TASKS', plan.license_code),
      forms: getFeatureLimit('FORM_CREATION', plan.license_code), 
      processes: getFeatureLimit('PROCESS_CREATION', plan.license_code),
      reports: getFeatureLimit('REPORTS', plan.license_code)
    },
    recommended: plan.license_code === 'EXECUTE',
    trial: plan.license_code === 'EXPLORE',
    trialDays: 30
  }));

  // Helper function to get feature limits
  function getFeatureLimit(featureCode, licenseCode) {
    const feature = featuresData.find(f => f.feature_code === featureCode);
    if (!feature) return 0;
    
    const planFeature = feature.license_features.find(
      lf => lf.license_code === licenseCode
    );
    return planFeature ? planFeature.usage_limit : 0;
  }

  const currentPlan = plans.find(plan => plan.id === subscriptionData?.current_license?.toLowerCase()) || plans[0];

  const calculateDaysUntilExpiry = () => {
    if (subscriptionData?.trial_end) {
      const expiry = new Date(subscriptionData.trial_end);
      const now = new Date();
      const timeDiff = expiry.getTime() - now.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    if (subscriptionData?.subscription_end_date) {
      const expiry = new Date(subscriptionData.subscription_end_date);
      const now = new Date();
      const timeDiff = expiry.getTime() - now.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    return 0;
  };

  const daysUntilExpiry = calculateDaysUntilExpiry();
  const isExpired = daysUntilExpiry <= 0;
  const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;

  const getUsagePercentage = (used, limit) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const upgradeMutation = useMutation({
    mutationFn: async ({ planId, billingPeriod }) => {
      const response = await fetch('/api/organization/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ planId, billingPeriod })
      });
      
      if (!response.ok) {
        throw new Error('Failed to upgrade plan');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Plan Upgraded Successfully!',
        description: 'Your new plan is now active.',
        variant: 'default'
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

  const renewMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/organization/renew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to renew license');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'License Renewed Successfully!',
        description: 'Your license has been extended.',
        variant: 'default'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/organization/subscription'] });
    },
    onError: (error) => {
      toast({
        title: 'Renewal Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleUpgrade = (planId) => {
    if (!isAdmin) return;
    upgradeMutation.mutate({ planId, billingPeriod });
  };

  const handleRenew = () => {
    if (!isAdmin) return;
    renewMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">License Management</h1>
          <p className="text-gray-600 mt-1">Manage your subscription and monitor usage</p>
        </div>
        <Badge variant={isExpired ? 'destructive' : isExpiringSoon ? 'secondary' : 'default'}>
          <Shield className="w-4 h-4 mr-1" />
          {currentPlan.name}
        </Badge>
      </div>

      {/* Expiry Warning Banner */}
      {(isExpired || isExpiringSoon) && (
        <Alert variant={isExpired ? 'destructive' : 'default'} className="border-l-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isExpired ? (
              <span>
                Your license has expired! Upgrade now to continue using all features.
                {isAdmin && (
                  <Button 
                    variant="link" 
                    className="ml-2 p-0 h-auto text-red-600"
                    onClick={handleRenew}
                  >
                    Renew Now
                  </Button>
                )}
              </span>
            ) : (
              <span>
                Your license expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}!
                {isAdmin && (
                  <Button 
                    variant="link" 
                    className="ml-2 p-0 h-auto"
                    onClick={handleRenew}
                  >
                    Renew Now
                  </Button>
                )}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Current License Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Current License Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500">Current Plan</div>
              <div className="text-xl font-semibold">{currentPlan.name}</div>
              {currentPlan.trial && (
                <Badge variant="secondary" className="mt-1">Trial</Badge>
              )}
            </div>
            <div>
              <div className="text-sm text-gray-500">Expiry Date</div>
              <div className="text-xl font-semibold flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {subscriptionData?.trial_end ? 
                  new Date(subscriptionData.trial_end).toLocaleDateString() : 
                  subscriptionData?.subscription_end_date ?
                  new Date(subscriptionData.subscription_end_date).toLocaleDateString() :
                  'N/A'
                }
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">License Status</div>
              <div className="text-xl font-semibold">
                {subscriptionData?.license_expired ? 'Expired' : 'Active'}
              </div>
            </div>
          </div>

          {/* Usage Meters */}
          <div>
            <h3 className="text-lg font-medium mb-4">Usage Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tasks Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Tasks Created</span>
                    <Info className="w-3 h-3 ml-1 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {subscriptionData?.usage?.tasks || 0}
                    {currentPlan.limits.tasks === -1 ? '' : ` / ${currentPlan.limits.tasks}`}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscriptionData?.usage?.tasks || 0, currentPlan.limits.tasks)}
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  {currentPlan.limits.tasks === -1 ? 'Unlimited' : 
                    `${getUsagePercentage(subscriptionData?.usage?.tasks || 0, currentPlan.limits.tasks).toFixed(1)}% used`
                  }
                </div>
              </div>

              {/* Forms Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Forms Created</span>
                    <Info className="w-3 h-3 ml-1 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {subscriptionData?.usage?.forms || 0}
                    {currentPlan.limits.forms === -1 ? '' : ` / ${currentPlan.limits.forms}`}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscriptionData?.usage?.forms || 0, currentPlan.limits.forms)}
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  {currentPlan.limits.forms === -1 ? 'Unlimited' : 
                    `${getUsagePercentage(subscriptionData?.usage?.forms || 0, currentPlan.limits.forms).toFixed(1)}% used`
                  }
                </div>
              </div>

              {/* Processes Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Workflow className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Processes Created</span>
                    <Info className="w-3 h-3 ml-1 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {subscriptionData?.usage?.processes || 0}
                    {currentPlan.limits.processes === -1 ? '' : ` / ${currentPlan.limits.processes}`}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscriptionData?.usage?.processes || 0, currentPlan.limits.processes)}
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  {currentPlan.limits.processes === -1 ? 'Unlimited' : 
                    `${getUsagePercentage(subscriptionData?.usage?.processes || 0, currentPlan.limits.processes).toFixed(1)}% used`
                  }
                </div>
              </div>

              {/* Reports Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Reports Generated</span>
                    <Info className="w-3 h-3 ml-1 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-600">
                    {subscriptionData?.usage?.reports || 0}
                    {currentPlan.limits.reports === -1 ? '' : ` / ${currentPlan.limits.reports}`}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscriptionData?.usage?.reports || 0, currentPlan.limits.reports)}
                  className="h-2"
                />
                <div className="text-xs text-gray-500">
                  {currentPlan.limits.reports === -1 ? 'Unlimited' : 
                    `${getUsagePercentage(subscriptionData?.usage?.reports || 0, currentPlan.limits.reports).toFixed(1)}% used`
                  }
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Selection */}
      {isAdmin && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Available Plans</h2>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${billingPeriod === 'monthly' ? 'font-semibold' : ''}`}>
                Monthly
              </span>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${billingPeriod === 'yearly' ? 'font-semibold' : ''}`}>
                Yearly
              </span>
              {billingPeriod === 'yearly' && (
                <Badge variant="secondary" className="ml-2">Save 16%</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.recommended ? 'ring-2 ring-blue-500' : ''} ${
                  currentPlan.id === plan.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      ₹{billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-500">
                      /{billingPeriod === 'yearly' ? 'year' : 'month'}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && plan.monthlyPrice > 0 && (
                    <div className="text-sm text-gray-500">
                      ₹{(plan.yearlyPrice / 12).toFixed(2)}/month billed annually
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className="w-full"
                    variant={currentPlan.id === plan.id ? 'secondary' : 'default'}
                    disabled={currentPlan.id === plan.id || upgradeMutation.isPending}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {currentPlan.id === plan.id ? 'Your Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Read-only info for non-admins */}
      {!isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Plan Information</CardTitle>
            <CardDescription>
              Contact your administrator to upgrade or modify your organization's plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>You don't have permission to manage licenses.</p>
              <p>Contact your administrator for plan changes.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LicenseManagement;