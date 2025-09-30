import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Users, 
  Bell, 
  Lock,
  CreditCard 
} from 'lucide-react';
import LicenseManagement from './LicenseManagement';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('license');

  const tabs = [
    {
      id: 'license',
      name: 'License Management',
      icon: Shield,
      component: LicenseManagement
    },
    {
      id: 'users',
      name: 'User Management',
      icon: Users,
      component: () => <div className="p-6">User Management - Coming Soon</div>
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      component: () => <div className="p-6">Notifications - Coming Soon</div>
    },
    {
      id: 'security',
      name: 'Security',
      icon: Lock,
      component: () => <div className="p-6">Security Settings - Coming Soon</div>
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: CreditCard,
      component: () => <div className="p-6">Billing History - Coming Soon</div>
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || LicenseManagement;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6 border-b">
            <div className="flex items-center">
              <SettingsIcon className="w-6 h-6 mr-2 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default Settings;