import React from 'react';
import { Link, useRoute } from 'wouter';
import { Settings, User, Shield, Bell, Database, CreditCard, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsMenuItems = [
  {
    title: 'General',
    href: '/settings',
    icon: Settings,
    description: 'Basic application settings'
  },
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
    description: 'Manage your profile information'
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: Shield,
    description: 'Password and security settings'
  },
  {
    title: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    description: 'Configure notification preferences'
  },
  {
    title: 'License Management',
    href: '/admin/subscription',
    icon: Crown,
    description: 'Manage subscription and usage'
  },
  {
    title: 'Data & Storage',
    href: '/settings/data',
    icon: Database,
    description: 'Data export and storage settings'
  },
  {
    title: 'Billing',
    href: '/admin/billing',
    icon: CreditCard,
    description: 'Billing and payment information'
  }
];

export default function SettingsMenu() {
  const [isActive] = useRoute('/settings/:path*');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
      <nav className="space-y-2">
        {settingsMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive && window.location.pathname === item.href
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}