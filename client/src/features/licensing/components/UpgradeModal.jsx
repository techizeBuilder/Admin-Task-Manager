import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, ArrowUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * UpgradeModal - Upgrade prompts and confirmation modals
 */
export default function UpgradeModal({ 
  open, 
  onOpenChange, 
  currentPlan, 
  targetPlan,
  billingCycle = 'monthly',
  reason,
  onConfirm,
  loading = false 
}) {
  if (!targetPlan) return null;
  
  const currentPrice = billingCycle === 'yearly' ? currentPlan.price.yearly : currentPlan.price.monthly;
  const targetPrice = billingCycle === 'yearly' ? targetPlan.price.yearly : targetPlan.price.monthly;
  const priceDiff = targetPrice - currentPrice;
  const monthlyDiff = billingCycle === 'yearly' ? Math.round(priceDiff / 12) : priceDiff;
  
  const getReasonMessage = () => {
    switch(reason) {
      case 'users': return 'You\'ve reached your user limit. Upgrade to add more team members.';
      case 'projects': return 'You\'ve reached your project limit. Upgrade to create more projects.';
      case 'storage': return 'You\'ve reached your storage limit. Upgrade for more space.';
      case 'tasks': return 'You\'ve reached your task limit. Upgrade to create more tasks.';
      default: return `Unlock more features and higher limits with ${targetPlan.name}.`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="upgrade-modal">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl" data-testid="upgrade-modal-title">
                Upgrade Your Plan
              </DialogTitle>
              <DialogDescription data-testid="upgrade-description">
                {getReasonMessage()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Comparison */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <Badge variant="outline" className="mb-2" data-testid="current-plan-badge">
                  Current
                </Badge>
                <div className="font-semibold text-gray-700 dark:text-gray-300">
                  {currentPlan.name}
                </div>
                <div className="text-sm text-gray-500">
                  ${currentPrice}{billingCycle === 'yearly' ? '/year' : '/month'}
                </div>
              </div>
              
              <ArrowUp className="h-8 w-8 text-blue-500 mx-4" />
              
              <div className="text-center">
                <Badge className="bg-blue-600 text-white mb-2" data-testid="target-plan-badge">
                  Recommended
                </Badge>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {targetPlan.name}
                </div>
                <div className="text-sm text-gray-600">
                  ${targetPrice}{billingCycle === 'yearly' ? '/year' : '/month'}
                </div>
              </div>
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">What you'll get:</h4>
            
            {/* Limits comparison */}
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(targetPlan.limits).map(([key, value]) => {
                const currentValue = currentPlan.limits[key];
                const isUpgrade = value === 'Unlimited' || (currentValue !== 'Unlimited' && parseInt(value) > parseInt(currentValue));
                
                return (
                  <div key={key} className={cn(
                    'flex items-center justify-between p-3 rounded border',
                    isUpgrade ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-gray-50 border-gray-200'
                  )} data-testid={`feature-comparison-${key}`}>
                    <div className="flex items-center space-x-2">
                      {isUpgrade && <Check className="h-4 w-4 text-green-500" />}
                      <span className="capitalize font-medium">{key}:</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{value}</div>
                      {isUpgrade && (
                        <div className="text-xs text-green-600">
                          Up from {currentValue}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Additional features */}
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700 dark:text-gray-300">Additional features:</h5>
              <ul className="space-y-1">
                {targetPlan.features.slice(currentPlan.features.length).map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm" data-testid={`additional-feature-${index}`}>
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Additional cost:</span>
                <span className="font-semibold">
                  +${priceDiff}{billingCycle === 'yearly' ? '/year' : '/month'}
                </span>
              </div>
              {billingCycle === 'yearly' && (
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Monthly equivalent:</span>
                  <span>+${monthlyDiff}/month</span>
                </div>
              )}
              <div className="text-xs text-blue-600 dark:text-blue-400 pt-2 border-t border-blue-200">
                Upgrade takes effect immediately. You'll be charged the prorated amount for this billing cycle.
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
            data-testid="upgrade-cancel-button"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="upgrade-confirm-button"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                <span>Processing...</span>
              </div>
            ) : (
              <>Upgrade to {targetPlan.name}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}