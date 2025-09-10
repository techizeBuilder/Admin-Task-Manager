import { useState, useEffect } from 'react';
import { useAuth } from '@features-shared/hooks/useAuth';

// Mock data for development - replace with API calls later
const MOCK_PLANS = {
  explore: {
    name: 'Explore',
    price: { monthly: 0, yearly: 0 },
    limits: {
      users: 3,
      projects: 2,
      storage: '1GB',
      tasks: 50
    },
    features: ['Basic task management', 'Email support', '7-day trial']
  },
  starter: {
    name: 'Starter',
    price: { monthly: 29, yearly: 290 },
    limits: {
      users: 10,
      projects: 10,
      storage: '10GB',
      tasks: 500
    },
    features: ['Advanced task management', 'Team collaboration', 'Priority support', 'Custom fields']
  },
  professional: {
    name: 'Professional',
    price: { monthly: 59, yearly: 590 },
    limits: {
      users: 50,
      projects: 50,
      storage: '100GB',
      tasks: 2000
    },
    features: ['All Starter features', 'Advanced analytics', 'API access', 'Custom integrations']
  },
  enterprise: {
    name: 'Enterprise',
    price: { monthly: 129, yearly: 1290 },
    limits: {
      users: 'Unlimited',
      projects: 'Unlimited',
      storage: '1TB',
      tasks: 'Unlimited'
    },
    features: ['All Professional features', 'SSO integration', 'Dedicated support', 'Custom deployment']
  }
};

export default function useLicensing() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState('explore');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [usage, setUsage] = useState({
    users: 2,
    projects: 1,
    storage: '0.5GB',
    tasks: 25
  });
  const [trialDaysLeft, setTrialDaysLeft] = useState(5);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock billing history for demo
  useEffect(() => {
    if (currentPlan !== 'explore') {
      setInvoices([
        {
          id: 'INV-001',
          date: '2024-03-01',
          amount: MOCK_PLANS[currentPlan].price[billingCycle],
          status: 'paid',
          plan: MOCK_PLANS[currentPlan].name,
          period: billingCycle
        },
        {
          id: 'INV-002',
          date: '2024-02-01',
          amount: MOCK_PLANS[currentPlan].price[billingCycle],
          status: 'paid',
          plan: MOCK_PLANS[currentPlan].name,
          period: billingCycle
        }
      ]);
    }
  }, [currentPlan, billingCycle]);

  const getCurrentPlan = () => MOCK_PLANS[currentPlan];
  
  const getUsagePercentage = (type) => {
    const current = usage[type];
    const limit = getCurrentPlan().limits[type];
    
    if (limit === 'Unlimited') return 0;
    if (type === 'storage') {
      const currentGB = parseFloat(current.replace('GB', ''));
      const limitGB = parseFloat(limit.replace('GB', ''));
      return (currentGB / limitGB) * 100;
    }
    return (current / limit) * 100;
  };
  
  const isOverLimit = (type) => getUsagePercentage(type) > 100;
  
  const canUpgrade = () => {
    const plans = ['explore', 'starter', 'professional', 'enterprise'];
    const currentIndex = plans.indexOf(currentPlan);
    return currentIndex < plans.length - 1;
  };
  
  const canDowngrade = () => {
    const plans = ['explore', 'starter', 'professional', 'enterprise'];
    const currentIndex = plans.indexOf(currentPlan);
    return currentIndex > 0;
  };
  
  const upgradePlan = async (planKey) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentPlan(planKey);
    setIsLoading(false);
  };
  
  const downgradePlan = async (planKey) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentPlan(planKey);
    setIsLoading(false);
  };
  
  const getSavingsPercentage = () => {
    const plan = getCurrentPlan();
    const monthlyCost = plan.price.monthly * 12;
    const yearlyCost = plan.price.yearly;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };
  
  const hasAccess = (feature) => {
    // Role-based access control
    if (user?.role.includes('org_admin')) return true;
    if (user?.role.includes('super_admin')) return true;
    return false; // Regular users and managers have read-only access
  };

  return {
    // State
    currentPlan,
    billingCycle,
    usage,
    trialDaysLeft,
    invoices,
    isLoading,
    
    // Plan data
    plans: MOCK_PLANS,
    getCurrentPlan,
    
    // Usage calculations
    getUsagePercentage,
    isOverLimit,
    
    // Plan management
    canUpgrade,
    canDowngrade,
    upgradePlan,
    downgradePlan,
    
    // Billing
    setBillingCycle,
    getSavingsPercentage,
    
    // Access control
    hasAccess,
    
    // Actions
    setCurrentPlan,
    setUsage
  };
}