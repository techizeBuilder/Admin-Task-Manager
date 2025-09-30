import { Receipt } from 'lucide-react';

// Core navigation items configuration
const navigationConfig = {
  settings: [
    { 
      id: 'profile',
      name: 'Profile', 
      href: '/settings/profile', 
      icon: 'UserIcon' 
    },
    { 
      id: 'license',
      name: 'License Management', 
      href: '/admin/subscription', 
      icon: 'CrownIcon' 
    },
    { 
      id: 'billing',
      name: 'Billing & Invoices', 
      href: '/settings/billing', 
      icon: Receipt,
      permissions: ['view_billing']
    },
    { 
      id: 'notifications',
      name: 'Notifications', 
      href: '/settings/notifications', 
      icon: 'BellIcon' 
    },
    { 
      id: 'help',
      name: 'Help & Support', 
      href: '/help', 
      icon: 'QuestionMarkIcon' 
    }
  ]
};

export default navigationConfig;