// Import License Management Page
import LicenseManagementPage from '@/features/licensing/pages/LicenseManagementPage';

// Add route for License Management
export const routes = [
  // ...existing routes...
  {
    path: '/admin/subscription',
    component: LicenseManagementPage,
    protected: true,
    permissions: ['view_license']
  },
  // ...existing routes...
];