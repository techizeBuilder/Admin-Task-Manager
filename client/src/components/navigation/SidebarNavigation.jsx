// Let's create a comprehensive sidebar component that will definitely work
import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  User, 
  Crown, 
  Receipt, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronDown,
  ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SidebarNavigation = () => {
  const [location] = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(true);

  const settingsItems = [
    {
      name: 'Profile',
      href: '/settings/profile',
      icon: User
    },
    {
      name: 'License Management',
      href: '/admin/subscription',
      icon: Crown
    },
    {
      name: 'Billing & Invoices',
      href: '/settings/billing',
      icon: Receipt
    },
    {
      name: 'Notifications',
      href: '/settings/notifications',
      icon: Bell
    },
    {
      name: 'Help & Support',
      href: '/help',
      icon: HelpCircle
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      {/* Settings Section */}
      <div className="px-3 py-2">
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          {isSettingsOpen ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          Settings
        </button>
        
        {isSettingsOpen && (
          <div className="mt-1 space-y-1">
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <a className={cn(
                    "group flex items-center pl-6 pr-2 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}>
                    <Icon className={cn(
                      "mr-3 h-4 w-4 flex-shrink-0",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )} />
                    {item.name}
                  </a>
                </Link>
              );
            })}
            
            {/* Logout */}
            <Link href="/logout">
              <a className="group flex items-center pl-6 pr-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">
                <LogOut className="mr-3 h-4 w-4 flex-shrink-0 text-gray-400" />
                Logout
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarNavigation;