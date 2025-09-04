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
import UpgradeModal from '../components/UpgradeModal';
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
    hasAccess
  } = useLicensing();
  
  const { getFeatureStatus, getLimitWarnings } = usePlanLimits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState(null);
  const [upgradeReason, setUpgradeReason] = useState(null);

  const currentPlan = getCurrentPlan();
  const isOnTrial = currentPlanKey === 'explore';
  const warnings = getLimitWarnings();
  const hasWarnings = warnings.length > 0;

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
    <div className="container mx-auto p-6 space-y-6" data-testid="license-management-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
            License & Subscription
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1" data-testid="page-description">
            Manage your plan, view usage, and upgrade when needed
          </p>
        </div>
        {hasAccess('billing') && (
          <Button asChild variant="outline" data-testid="view-billing-button">
            <Link to="/admin/billing">View Billing</Link>
          </Button>
        )}
      </div>

      {/* Warnings */}
      {hasWarnings && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="h-5 w-5" />
              <span>Usage Warnings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {warnings.map((warning, index) => (
              <div key={index} className={cn(
                'p-3 rounded flex items-start space-x-3',
                warning.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
              )} data-testid={`warning-${index}`}>
                <AlertCircle className={cn(
                  'h-4 w-4 mt-0.5 flex-shrink-0',
                  warning.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                )} />
                <div className="text-sm">
                  <div className="font-medium">{warning.feature.charAt(0).toUpperCase() + warning.feature.slice(1)}</div>
                  <div className="text-gray-600">{warning.message}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan & Usage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan Summary */}
          <Card data-testid="current-plan-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>Current Plan</span>
                      <Badge variant={isOnTrial ? "secondary" : "default"} data-testid="plan-status-badge">
                        {isOnTrial ? 'Trial' : 'Active'}
                      </Badge>
                    </CardTitle>
                    <CardDescription data-testid="plan-name">
                      {currentPlan.name} - ${currentPlan.price[billingCycle]}{billingCycle === 'yearly' ? '/year' : '/month'}
                    </CardDescription>
                  </div>
                </div>
                {canUpgrade() && (
                  <Button onClick={() => handleUpgradeClick('starter')} data-testid="quick-upgrade-button">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Usage Meters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(usage).map(([key, value]) => {
                  const status = getFeatureStatus(key);
                  return (
                    <UsageMeter
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      current={status.current}
                      limit={status.limit}
                      percentage={status.percentage}
                      isOverLimit={status.isOverLimit}
                      isNearLimit={status.isNearLimit}
                      unit={key === 'storage' ? '' : ''}
                      tooltip={`Your current ${key} usage vs plan limits`}
                      data-testid={`usage-meter-${key}`}
                    />
                  )}
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plan Comparison Cards */}
          <Card data-testid="plan-comparison-card">
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>
                Choose the plan that fits your team's needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Billing Toggle */}
              <BillingToggle
                billingCycle={billingCycle}
                onToggle={setBillingCycle}
                savingsPercentage={getSavingsPercentage()}
                disabled={isLoading}
                data-testid="billing-cycle-toggle"
              />
              
              {/* Plan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(plans).map(([planKey, plan]) => (
                  <PlanCard
                    key={planKey}
                    plan={plan}
                    planKey={planKey}
                    billingCycle={billingCycle}
                    isCurrentPlan={planKey === currentPlanKey}
                    isPopular={planKey === 'professional'}
                    onSelect={handleUpgradeClick}
                    loading={isLoading}
                    disabled={!hasAccess('upgrade') && planKey !== currentPlanKey}
                    data-testid={`plan-card-${planKey}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trial Countdown (if applicable) */}
          {isOnTrial && (
            <TrialCountdown
              daysLeft={trialDaysLeft}
              onUpgrade={() => handleUpgradeClick('starter')}
              data-testid="trial-countdown"
            />
          )}

          {/* Quick Stats */}
          <Card data-testid="quick-stats-card">
            <CardHeader>
              <CardTitle className="text-lg">Usage Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'users', icon: Users, label: 'Team Members' },
                { key: 'projects', icon: FolderOpen, label: 'Projects' },
                { key: 'storage', icon: Database, label: 'Storage' },
                { key: 'tasks', icon: CheckSquare, label: 'Tasks' }
              ].map(({ key, icon: Icon, label }) => {
                const status = getFeatureStatus(key);
                return (
                  <div key={key} className="flex items-center justify-between" data-testid={`stat-${key}`}>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{label}</span>
                    </div>
                    <div className="text-sm font-medium">
                      {status.current}/{status.limit}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Upgrade CTA (for non-admin users) */}
          {!hasAccess('upgrade') && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" data-testid="upgrade-cta-card">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Need More?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                  Contact your administrator to upgrade your plan and unlock more features.
                </p>
                <Button variant="outline" size="sm" className="w-full" disabled data-testid="contact-admin-button">
                  Contact Admin
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        currentPlan={currentPlan}
        targetPlan={selectedUpgradePlan}
        billingCycle={billingCycle}
        reason={upgradeReason}
        onConfirm={handleConfirmUpgrade}
        loading={isLoading}
      />
    </div>
  );
}