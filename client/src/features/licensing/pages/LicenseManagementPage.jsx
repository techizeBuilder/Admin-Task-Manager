import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';
import { Zap, Users, Database, FolderOpen, CheckSquare, AlertCircle, Crown, TrendingUp } from 'lucide-react';
import useLicensing from '../hooks/useLicensing';
import usePlanLimits from '../hooks/usePlanLimits';
import UsageMeter from '../components/UsageMeter';
import TrialCountdown from '../components/TrialCountdown';
import BillingToggle from '../components/BillingToggle';
import PlanCard from '../components/PlanCard';

import { cn } from '@/lib/utils';

/**
 * License Management Page - In-app summary with usage meters, trial countdown, plan comparison cards
 */
export default function LicenseManagementPage() {
  const {
    currentPlan: currentPlanKey,
    billingCycle,
    usage,
    trialDaysLeft,
    isLoading,
    plans,
    getCurrentPlan,
    getUsagePercentage,
    isOverLimit,
    canUpgrade,
    upgradePlan,
    setBillingCycle,
    getSavingsPercentage,
    hasAccess,
    getUsageStatus 
  } = useLicensing();
  
  const { getFeatureStatus, getLimitWarnings } = usePlanLimits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState(null);
  const [upgradeReason, setUpgradeReason] = useState(null);

  const currentPlan = getCurrentPlan();
  const isOnTrial = currentPlanKey === 'explore';
  const warnings = getLimitWarnings;
  const hasWarnings = warnings.length > 0;
  const detailedKeys = ['tasks','forms','processes','reports'];
  const overLimitKeys = detailedKeys.filter(k => getUsageStatus(k).isOverLimit);
  const hasAnyOverLimit = overLimitKeys.length > 0;
  // Handle upgrade modal trigger from usage limits
  React.useEffect(() => {
    const handleShowUpgradeModal = (event) => {
      const { reason } = event.detail;
      setUpgradeReason(reason);
      // Auto-suggest next tier up
      const planKeys = ['explore', 'starter', 'professional', 'enterprise'];
      const currentIndex = planKeys.indexOf(currentPlanKey);
      if (currentIndex < planKeys.length - 1) {
        setSelectedUpgradePlan(plans[planKeys[currentIndex + 1]]);
        setShowUpgradeModal(true);
      }
    };

    window.addEventListener('showUpgradeModal', handleShowUpgradeModal);
    return () => window.removeEventListener('showUpgradeModal', handleShowUpgradeModal);
  }, [currentPlanKey, plans]);

  const handleUpgradeClick = (planKey) => {
    setSelectedUpgradePlan(plans[planKey]);
    setUpgradeReason('manual');
    setShowUpgradeModal(true);
  };

  const handleConfirmUpgrade = async () => {
    if (selectedUpgradePlan) {
      const planKey = Object.keys(plans).find(key => plans[key] === selectedUpgradePlan);
      await upgradePlan(planKey);
      setShowUpgradeModal(false);
      setSelectedUpgradePlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6" data-testid="license-management-page">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Crown className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
                License & Subscription
              </h1>
              <p className="text-gray-600 mt-1" data-testid="page-description">
                Manage your subscription plan and monitor usage
              </p>
            </div>
          </div>
          {hasAccess('billing') && (
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
                <div key={index} className="text-sm text-yellow-700" data-testid={`warning-${index}`}>
                  <span className="font-medium">
                    {warning.feature.charAt(0).toUpperCase() + warning.feature.slice(1)}:
                  </span>{' '}
                  {warning.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Plan Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600 text-sm">Current Plan</div>
              <Crown className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {currentPlan.name}
            </div>
            <div className="text-sm text-gray-600">
              ${currentPlan.price[billingCycle]}/{billingCycle === 'yearly' ? 'year' : 'month'}
            </div>
            {isOnTrial && (
              <Badge className="mt-2 bg-blue-100 text-blue-700 text-xs w-15">
                Trial
              </Badge>
            )}
          </div>

          {/* Usage Stats Cards */}
          {[
            { key: 'users', icon: Users, label: 'Team Members', color: 'text-green-600' },
            { key: 'projects', icon: FolderOpen, label: 'Projects', color: 'text-blue-600' },
            { key: 'tasks', icon: CheckSquare, label: 'Tasks', color: 'text-purple-600' }
          ].map(({ key, icon: Icon, label, color }) => {
            const status = getFeatureStatus(key);
            return (
              <div key={key} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-gray-600 text-sm">{label}</div>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {status.current}
                </div>
                <div className="text-sm text-gray-600">
                  {status.limit === -1 ? 'Unlimited' : `of ${status.limit}`}
                </div>
                {status.percentage > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full",
                          status.percentage >= 80 ? "bg-red-500" :
                          status.percentage >= 60 ? "bg-yellow-500" :
                          "bg-green-500"
                        )}
                        style={{ width: `${Math.min(status.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Usage Overview and Trial Countdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Usage Overview Section - Left 8 columns */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Usage Overview</h2>
                <p className="text-sm text-gray-600 mt-1">Monitor your current usage against plan limits</p>
              </div>
              
               {/* Usage Meters Grid - Flex grow to fill remaining space */}
              <div className="p-6 flex-1 flex items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {[
                    { key: 'tasks', label: 'Tasks created' },
                    { key: 'forms', label: 'Forms created' },
                    { key: 'processes', label: 'Processes created' },
                    { key: 'reports', label: 'Reports generated' }
                  ].map(({ key, label }) => {
                    const status = getUsageStatus(key);
                    return (
                      <div key={key} className="space-y-3" data-testid={`usage-meter-${key}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {label}
                          </span>
                          <span className="text-sm text-gray-600">
                            {status.current}/{status.limit === -1 ? '∞' : status.limit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              "h-2 rounded-full transition-all",
                              status.isOverLimit ? "bg-red-500" :
                              status.isNearLimit ? "bg-yellow-500" :
                              "bg-green-500"
                            )}
                            style={{ width: `${Math.min(status.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{Math.round(status.percentage)}% used</span>
                          {status.isOverLimit && (
                            <span className="text-red-600 font-semibold">Over limit</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Trial Countdown and Quick Actions - Right 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            {/* Trial Countdown Card - Top */}
            {isOnTrial && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {trialDaysLeft}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    days left in trial 
                  </div>
                  <Button 
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    asChild
                  >
                    <Link to="/admin/upgrade">
                      Upgrade Now
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Actions Card - Bottom */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
           
              <div className="space-y-3">
                {hasAccess('upgrade') ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-10"
                      asChild
                    >
                      <Link to="/admin/subscription/upgrade">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Upgrade Plan
                      </Link>
                    </Button>
                    {hasAccess('billing') && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start h-10"
                        asChild
                      >
                        <Link to="/admin/billing">
                          <Database className="h-4 w-4 mr-2" />
                          View Billing
                        </Link>
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-3">
                      Contact your administrator to upgrade
                    </p>
                    <Button variant="outline" size="sm" disabled className="h-8">
                      Contact Admin
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

     

     


        
      </div>
    </div>
  );
}