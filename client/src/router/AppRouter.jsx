// Import License Management Pages
import LicenseManagementPage from '@/features/licensing/pages/LicenseManagementPage';
import PurchaseUpgradePage from '@/features/licensing/pages/PurchaseUpgradePage';
import BillingPage from '@/features/licensing/pages/BillingPage';
import QuickTaskPage from '@/pages/QuickTaskPage';

// Add routes for License Management
export const routes = [
  // ...existing routes...
  {
    path: '/admin/subscription',
    component: LicenseManagementPage,
    protected: true,
    permissions: ['view_license']
  },
  {
    path: '/admin/subscription/upgrade',
    component: PurchaseUpgradePage,
    protected: true,
    permissions: ['upgrade_license']
  },
  {
    path: '/admin/billing',
    component: BillingPage,
    protected: true,
    permissions: ['view_billing']
  },
  {
    path: '/settings/billing',
    component: BillingPage,
    protected: true,
    permissions: ['view_billing']
  },
  {
    path: '/quick-tasks',
    component: QuickTaskPage,
    protected: true,
    permissions: ['create_tasks']
  },
  // ...existing routes...
];