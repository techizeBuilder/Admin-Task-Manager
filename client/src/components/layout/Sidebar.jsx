import { Receipt } from 'lucide-react';

// ...existing code...

const settingsNavItems = [
  // ...existing settings items...
  {
    name: 'Billing & Invoices',
    href: '/settings/billing',
    icon: Receipt,
    permissions: ['view_billing']
  }
  // ...existing settings items...
];