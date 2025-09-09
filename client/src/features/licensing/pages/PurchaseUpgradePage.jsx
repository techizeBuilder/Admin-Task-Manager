import React, { useState, useEffect } from 'react';
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

/**
 * Purchase/Upgrade Page - Upgrade plan with payment integration
 */
export default function PurchaseUpgradePage() {
  const [location] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState('execute');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle URL parameters for plan pre-selection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    if (planParam && plans[planParam]) {
      setSelectedPlan(planParam);
    }
  }, [location]);

  // Mock current plan data
  const currentPlan = {
    name: 'Explore',
    key: 'explore',
    price: { monthly: 0, yearly: 0 },
    expiryDate: '2024-09-23',
    isOnTrial: true,
    daysLeft: 5
  };

  // Mock plans data
  const plans = {
    plan: {
      name: 'Plan',
      description: 'Individuals / small teams',
      price: { monthly: 19, yearly: 190 },
      features: [
        '100 tasks/month',
        '10 custom forms',
        '5 processes',
        'Unlimited reports',
        'Email support',
        'Basic analytics'
      ],
      popular: false
    },
    execute: {
      name: 'Execute',
      description: 'Growing teams',
      price: { monthly: 49, yearly: 490 },
      features: [
        '500 tasks/month',
        '50 custom forms',
        '25 processes',
        'Unlimited reports',
        'Priority support',
        'Advanced analytics',
        'Team collaboration',
        'Custom workflows'
      ],
      popular: true
    },
    optimize: {
      name: 'Optimize',
      description: 'Large organizations',
      price: { monthly: 99, yearly: 990 },
      features: [
        'Unlimited tasks',
        'Unlimited custom forms',
        'Unlimited processes',
        'Unlimited reports',
        '24/7 priority support',
        'Dedicated account manager',
        'Advanced security',
        'API access',
        'Custom integrations',
        'White-label options'
      ],
      popular: false
    }
  };

  const getSavingsPercentage = () => {
    return Math.round(((12 - 10) / 12) * 100); // 17% savings for yearly
  };

  const getSelectedPlanPrice = () => {
    const plan = plans[selectedPlan];
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
      // Redirect to success page or show success state
    }, 2000);
  };

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
                  ${currentPlan.price[billingCycle]}/{billingCycle === 'yearly' ? 'year' : 'month'}
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
                  {Object.entries(plans).map(([planKey, plan]) => (
                    <div 
                      key={planKey}
                      onClick={() => setSelectedPlan(planKey)}
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
                          ${plan.price[billingCycle]}
                        </div>
                        <div className="text-sm text-gray-600">
                          per {billingCycle === 'yearly' ? 'year' : 'month'}
                        </div>
                        {billingCycle === 'yearly' && (
                          <div className="text-sm text-green-600 font-medium">
                            Save ${(plan.price.monthly * 12) - plan.price.yearly}/year
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
                  ))}
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
                  <span className="font-medium">{plans[selectedPlan]?.name}</span>
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
                    <span>-${(plans[selectedPlan]?.price.monthly * 12) - plans[selectedPlan]?.price.yearly}</span>
                  </div>
                )}
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>${getSelectedPlanPrice()}</span>
                </div>
              </div>
            </div>

            {/* Coupon Code Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
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
            </div>

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
            Why Upgrade to {plans[selectedPlan]?.name}?
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
    </div>
  );
}