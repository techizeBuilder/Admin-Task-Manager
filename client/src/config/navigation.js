import { Receipt } from 'lucide-react';

// Navigation configuration
export const navigationConfig = {
  // ...existing sections...
  settings: [
    // ...existing settings items...
    {
      title: 'Billing & Invoices',
      href: '/settings/billing',
      icon: Receipt,
      permissions: ['view_billing'],
      description: 'Manage subscription and download invoices'
    }
  ]
};