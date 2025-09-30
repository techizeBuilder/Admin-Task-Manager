// Find and update the actual navigation configuration
import { Receipt } from 'lucide-react';

// Settings navigation configuration
export const settingsNavigation = [
  {
    name: 'Profile',
    href: '/settings/profile',
    icon: UserIcon,
  },
  {
    name: 'License Management',
    href: '/admin/subscription',
    icon: CrownIcon,
  },
  {
    name: 'Billing & Invoices',
    href: '/settings/billing',
    icon: Receipt,
    permissions: ['view_billing']
  },
  {
    name: 'Notifications',
    href: '/settings/notifications',
    icon: BellIcon,
  },
  {
    name: 'Help & Support',
    href: '/help',
    icon: QuestionMarkIcon,
  }
];