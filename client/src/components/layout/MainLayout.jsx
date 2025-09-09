import React from 'react';
import { Crown, Receipt, Settings, User, Bell } from 'lucide-react';

// Complete MainLayout structure with both License Management and Billing & Invoices
const navigationItems = [
  {
    section: 'Settings',
    items: [
      {
        name: 'Profile',
        href: '/settings/profile',
        icon: User,
        requiredPermissions: ['view_profile']
      },
      {
        name: 'License Management',
        href: '/admin/subscription',
        icon: Crown,
        requiredPermissions: ['view_license']
      },
      {
        name: 'Billing & Invoices',
        href: '/settings/billing',
        icon: Receipt,
        requiredPermissions: ['view_billing']
      },
      {
        name: 'Notifications',
        href: '/settings/notifications',
        icon: Bell,
        requiredPermissions: ['view_notifications']
      }
    ]
  }
];

// ...rest of component...