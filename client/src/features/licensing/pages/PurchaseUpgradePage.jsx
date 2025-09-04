import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, CreditCard } from 'lucide-react';
import useLicensing from '../hooks/useLicensing';
import usePlanLimits from '../hooks/usePlanLimits';
import BillingToggle from '../components/BillingToggle';
import PlanCard from '../components/PlanCard';
import UpgradeModal from '../components/UpgradeModal';
import DowngradeWarningModal from '../components/DowngradeWarningModal';
import { useToast } from '@/hooks/use-toast';

/**
 * Purchase/Upgrade Page - Plan selection with upgrade/downgrade confirmation
 */
export default function PurchaseUpgradePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const {
    currentPlan: currentPlanKey,
    billingCycle,
    isLoading,
    plans,
    getCurrentPlan,
    canUpgrade,
    canDowngrade,
    upgradePlan,
    downgradePlan,
    setBillingCycle,
    getSavingsPercentage,
    hasAccess
  } = useLicensing();
  
  const { getLimitWarnings } = usePlanLimits();
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPlanKey, setSelectedPlanKey] = useState(null);
  const [isUpgrade, setIsUpgrade] = useState(true);
  const [usageWarnings, setUsageWarnings] = useState([]);

  const currentPlan = getCurrentPlan();
  const planKeys = ['explore', 'starter', 'professional', 'enterprise'];
  const currentIndex = planKeys.indexOf(currentPlanKey);

  const handleSelectPlan = (planKey) => {
    const targetPlan = plans[planKey];
    const targetIndex = planKeys.indexOf(planKey);
    
    setSelectedPlan(targetPlan);
    setSelectedPlanKey(planKey);
    
    if (targetIndex > currentIndex) {
      // Upgrade
      setIsUpgrade(true);
      setShowUpgradeModal(true);
    } else if (targetIndex < currentIndex) {
      // Downgrade - check for warnings
      setIsUpgrade(false);
      const warnings = checkDowngradeWarnings(targetPlan);
      setUsageWarnings(warnings);
      setShowDowngradeModal(true);
    }
    // Same plan - do nothing
  };

  const checkDowngradeWarnings = (targetPlan) => {
    const warnings = [];
    const allWarnings = getLimitWarnings();
    
    // Check if current usage would exceed target plan limits
    Object.entries(targetPlan.limits).forEach(([feature, limit]) => {
      const currentUsage = getCurrentUsage(feature);
      if (limit !== 'Unlimited' && currentUsage > parseInt(limit)) {
        warnings.push({
          type: 'error',
          feature,
          message: `Current usage (${currentUsage}) exceeds ${targetPlan.name} limit (${limit})`
        });
      }
    });
    
    return warnings;
  };

  const getCurrentUsage = (feature) => {
    // This would come from actual usage data
    const mockUsage = { users: 5, projects: 3, storage: 2, tasks: 75 };
    return mockUsage[feature] || 0;
  };

  const handleConfirmUpgrade = async () => {
    try {
      await upgradePlan(selectedPlanKey);
      toast({
        title: "Plan Upgraded!",
        description: `Successfully upgraded to ${selectedPlan.name}`,
      });
      setShowUpgradeModal(false);
      setLocation('/admin/subscription');
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "There was an error upgrading your plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmDowngrade = async () => {
    try {
      await downgradePlan(selectedPlanKey);
      toast({
        title: "Plan Changed",
        description: `Successfully changed to ${selectedPlan.name}`,
      });
      setShowDowngradeModal(false);
      setLocation('/admin/subscription');
    } catch (error) {
      toast({
        title: "Plan Change Failed",
        description: "There was an error changing your plan. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Check access
  if (!hasAccess('upgrade')) {
    return (
      <div className="container mx-auto p-6" data-testid="upgrade-access-denied">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <CreditCard className="h-5 w-5" />
              <span>Access Denied</span>
            </CardTitle>
            <CardDescription>
              You don't have permission to manage subscription plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Contact your organization administrator to upgrade your plan.
            </p>
            <Button variant="outline" onClick={() => setLocation('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="purchase-upgrade-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/admin/subscription')}
            data-testid="back-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
              Upgrade Your Plan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1" data-testid="page-description">
              Choose the plan that best fits your team's needs
            </p>
          </div>
        </div>
      </div>

      {/* Current Plan Info */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" data-testid="current-plan-info">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-blue-600" />
            <span>Current Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg text-blue-900 dark:text-blue-100" data-testid="current-plan-name">
                {currentPlan.name}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                ${currentPlan.price[billingCycle]}{billingCycle === 'yearly' ? '/year' : '/month'}
              </div>
            </div>
            <Badge className="bg-blue-600 text-white" data-testid="active-badge">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <BillingToggle
          billingCycle={billingCycle}
          onToggle={setBillingCycle}
          savingsPercentage={getSavingsPercentage()}
          disabled={isLoading}
          className="max-w-md"
          data-testid="billing-toggle"
        />
      </div>

      {/* Plan Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center" data-testid="plan-selection-title">
          Choose Your New Plan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(plans).map(([planKey, plan]) => {
            const planIndex = planKeys.indexOf(planKey);
            const isCurrentPlan = planKey === currentPlanKey;
            const isUpgradeOption = planIndex > currentIndex;
            const isDowngradeOption = planIndex < currentIndex;
            
            return (
              <PlanCard
                key={planKey}
                plan={plan}
                planKey={planKey}
                billingCycle={billingCycle}
                isCurrentPlan={isCurrentPlan}
                isPopular={planKey === 'professional'}
                onSelect={handleSelectPlan}
                loading={isLoading}
                disabled={isCurrentPlan}
                className={`
                  ${isUpgradeOption ? 'ring-1 ring-green-300 bg-green-50/50' : ''}
                  ${isDowngradeOption ? 'ring-1 ring-yellow-300 bg-yellow-50/50' : ''}
                  ${isCurrentPlan ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                `}
                data-testid={`plan-option-${planKey}`}
              />
            );
          })}
        </div>
      </div>

      {/* Upgrade Benefits */}
      {canUpgrade() && (
        <Card data-testid="upgrade-benefits">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300">
              Why Upgrade?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-green-600 mb-2">More Limits</div>
                <p className="text-sm text-gray-600">Higher limits for users, projects, storage, and tasks</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-green-600 mb-2">Better Support</div>
                <p className="text-sm text-gray-600">Priority support and faster response times</p>
              </div>
              <div className="text-center p-4">
                <div className="text-2xl font-bold text-green-600 mb-2">Advanced Features</div>
                <p className="text-sm text-gray-600">Analytics, integrations, and powerful team tools</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        currentPlan={currentPlan}
        targetPlan={selectedPlan}
        billingCycle={billingCycle}
        reason="manual"
        onConfirm={handleConfirmUpgrade}
        loading={isLoading}
      />

      <DowngradeWarningModal
        open={showDowngradeModal}
        onOpenChange={setShowDowngradeModal}
        currentPlan={currentPlan}
        targetPlan={selectedPlan}
        usageWarnings={usageWarnings}
        onConfirm={handleConfirmDowngrade}
        loading={isLoading}
      />
    </div>
  );
}