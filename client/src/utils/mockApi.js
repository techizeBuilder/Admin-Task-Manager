// Mock API responses for testing License Management
export const mockLicenseData = {
  planId: 'execute',
  planName: 'Execute',
  expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
  renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
  status: 'active',
  autoRenew: true,
  trialEndDate: null,
  isExpired: false,
  daysUntilExpiry: 15
};

export const mockUsageData = {
  tasks: 324,
  forms: 28,
  processes: 15,
  reports: 67,
  period: 'monthly'
};

export const mockUserData = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin', // or 'company_admin', 'manager', 'member'
  organizationId: 1
};

// Mock API functions for development/testing
export const mockApiEndpoints = {
  '/api/auth/me': () => Promise.resolve(mockUserData),
  '/api/organization/license': () => Promise.resolve(mockLicenseData),
  '/api/organization/usage': () => Promise.resolve(mockUsageData),
  '/api/organization/upgrade': (data) => {
    console.log('Upgrade request:', data);
    return Promise.resolve({ success: true, message: 'Plan upgraded successfully' });
  },
  '/api/organization/renew': () => {
    console.log('Renew request');
    return Promise.resolve({ success: true, message: 'License renewed successfully' });
  }
};

// Helper function to simulate API delay
export const mockApiCall = (endpoint, data = null) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const handler = mockApiEndpoints[endpoint];
      if (handler) {
        resolve(handler(data));
      } else {
        reject(new Error(`Mock endpoint ${endpoint} not found`));
      }
    }, 500); // Simulate 500ms delay
  });
};