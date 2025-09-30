/**
 * Enhanced License System Data Structure
 * Based on 5 key requirements:
 * 1. Feature master table with descriptions
 * 2. License-feature mapping with configurable limits
 * 3. Database-driven configuration (no hardcoded values)
 * 4. EXPLORE tier with 15-day validity and auto-downgrade
 * 5. Feature-driven application control
 */

// LICENSE PLANS - Enhanced with trial management
export const LICENSE_PLANS = [
  {
    license_code: 'EXPLORE',
    name: 'Explore (Free Trial)',
    description: 'First-time users trial mode - 15 days from registration',
    billing_cycle: 'TRIAL',
    price_monthly: 0,
    price_yearly: 0,
    max_users: 10,
    trial_days: 15,
    auto_downgrade_to: 'EXPIRED', // After trial expires
    is_active: true
  },
  {
    license_code: 'PLAN',
    name: 'Plan',
    description: 'Perfect for individuals and small teams',
    billing_cycle: 'MONTHLY',
    price_monthly: 19,
    price_yearly: 190, // ~17% discount
    max_users: 25,
    trial_days: 0,
    is_active: true
  },
  {
    license_code: 'EXECUTE',
    name: 'Execute',
    description: 'Designed for growing teams and collaboration',
    billing_cycle: 'MONTHLY',
    price_monthly: 49,
    price_yearly: 490, // ~17% discount
    max_users: 100,
    trial_days: 0,
    is_active: true
  },
  {
    license_code: 'OPTIMIZE',
    name: 'Optimize',
    description: 'Enterprise solution for large organizations',
    billing_cycle: 'MONTHLY',
    price_monthly: 99,
    price_yearly: 990, // ~17% discount
    max_users: -1, // Unlimited
    trial_days: 0,
    is_active: true
  },
  {
    license_code: 'EXPIRED',
    name: 'Expired Trial',
    description: 'Expired trial with minimal access',
    billing_cycle: 'NONE',
    price_monthly: 0,
    price_yearly: 0,
    max_users: 1, // Only admin can access
    trial_days: 0,
    is_active: true
  }
];

// SYSTEM FEATURES - Master Table with Comprehensive Descriptions
export const SYSTEM_FEATURES = [
  // CORE Features - Foundation features available in all active plans
  {
    feature_code: 'TASK_BASIC',
    name: 'Basic Task Management',
    description: 'Create, edit, delete, and manage basic tasks with due dates, priorities, assignees, and status tracking. Core functionality for task management.',
    category: 'CORE'
  },
  {
    feature_code: 'TASK_SUB',
    name: 'Sub-task Organization',
    description: 'Break down complex tasks into manageable sub-tasks with hierarchical structure, progress tracking, and completion dependencies.',
    category: 'CORE'
  },
  {
    feature_code: 'TASK_QUICK',
    name: 'Quick Task Entry',
    description: 'Create simple one-liner tasks and checklist items for rapid task capture without complex forms or setup.',
    category: 'CORE'
  },
  {
    feature_code: 'NOTIF_BASIC',
    name: 'Basic Notifications',
    description: 'Receive email and in-app notifications for task assignments, due date reminders, and basic status changes.',
    category: 'CORE'
  },
  {
    feature_code: 'REPORT_BASIC',
    name: 'Basic Reporting',
    description: 'Generate simple reports on task completion rates, overdue tasks, and basic team productivity metrics.',
    category: 'CORE'
  },

  // ADVANCED Features - Enhanced functionality for growing teams
  {
    feature_code: 'TASK_RECUR',
    name: 'Recurring Tasks',
    description: 'Set up automated recurring tasks with flexible scheduling patterns including daily, weekly, monthly, and custom intervals.',
    category: 'ADVANCED'
  },
  {
    feature_code: 'TASK_APPROVAL',
    name: 'Approval Workflows',
    description: 'Create approval-based tasks with multi-level approval chains, voting mechanisms, and automatic workflow routing.',
    category: 'ADVANCED'
  },
  {
    feature_code: 'TASK_MSTONE',
    name: 'Milestone Management',
    description: 'Create milestone tasks with project dependencies, progress tracking, and automatic project phase management.',
    category: 'ADVANCED'
  },
  {
    feature_code: 'TASK_CAL',
    name: 'Calendar Integration',
    description: 'Sync tasks with calendar applications, schedule time blocks, view tasks in calendar format, and create tasks from calendar events.',
    category: 'ADVANCED'
  },
  {
    feature_code: 'TASK_EMAIL',
    name: 'Email Task Creation',
    description: 'Create tasks directly from email messages, convert emails to actionable tasks, and manage email-based workflows.',
    category: 'ADVANCED'
  },
  {
    feature_code: 'FORM_CREATE',
    name: 'Custom Form Builder',
    description: 'Create custom forms for data collection, standardized task templates, and structured information gathering.',
    category: 'ADVANCED'
  },
  {
    feature_code: 'NOTIF_ADV',
    name: 'Advanced Notifications',
    description: 'Customize notification preferences, create conditional notification rules, and integrate with Slack, Teams, and other platforms.',
    category: 'ADVANCED'
  },

  // PREMIUM Features - Professional features for established teams
  {
    feature_code: 'PROC_CREATE',
    name: 'Process Automation',
    description: 'Design and automate business processes by linking tasks, forms, approvals, and workflows into streamlined operations.',
    category: 'PREMIUM'
  },
  {
    feature_code: 'API_ACCESS',
    name: 'API Integration',
    description: 'Access REST APIs for custom integrations, third-party tool connections, automated data synchronization, and webhook support.',
    category: 'PREMIUM'
  },
  {
    feature_code: 'REPORT_ADV',
    name: 'Advanced Analytics',
    description: 'Create detailed reports, custom dashboards, data visualization, performance analytics, and exportable business intelligence.',
    category: 'PREMIUM'
  },

  // ENTERPRISE Features - Enterprise-grade features for large organizations
  {
    feature_code: 'SSO_LOGIN',
    name: 'Single Sign-On',
    description: 'Enterprise SSO integration with SAML, OAuth, Active Directory, LDAP, and custom authentication provider support.',
    category: 'ENTERPRISE'
  },
  {
    feature_code: 'DED_SUPPORT',
    name: 'Dedicated Support',
    description: 'Priority customer support with dedicated account manager, phone support, SLA guarantees, and priority issue resolution.',
    category: 'ENTERPRISE'
  }
];

// FEATURE TO LICENSE MAPPING WITH CONFIGURABLE LIMITS
// This table drives all feature availability and usage limits
export const LICENSE_FEATURE_MAPPING = [
  // EXPLORE (Free Trial - 15 days) - Limited access to test core features
  { license_code: 'EXPLORE', feature_code: 'TASK_BASIC', limit_value: 20, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'TASK_SUB', limit_value: 10, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'TASK_QUICK', limit_value: 30, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'NOTIF_BASIC', limit_value: 50, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'REPORT_BASIC', limit_value: 5, limit_period: 'MONTH', is_enabled: true },
  
  // Advanced features - disabled in trial
  { license_code: 'EXPLORE', feature_code: 'TASK_RECUR', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPLORE', feature_code: 'TASK_APPROVAL', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPLORE', feature_code: 'TASK_MSTONE', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPLORE', feature_code: 'TASK_CAL', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPLORE', feature_code: 'TASK_EMAIL', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPLORE', feature_code: 'FORM_CREATE', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPLORE', feature_code: 'NOTIF_ADV', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  
  // Premium features - disabled in trial
  { license_code: 'EXPLORE', feature_code: 'PROC_CREATE', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPLORE', feature_code: 'API_ACCESS', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPLORE', feature_code: 'REPORT_ADV', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  
  // Enterprise features - disabled in trial
  { license_code: 'EXPLORE', feature_code: 'SSO_LOGIN', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPLORE', feature_code: 'DED_SUPPORT', limit_value: 0, limit_period: 'MONTH', is_enabled: false },

  // PLAN (₹19/month) - Individual/small team features
  { license_code: 'PLAN', feature_code: 'TASK_BASIC', limit_value: 200, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'TASK_SUB', limit_value: 100, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'TASK_QUICK', limit_value: 300, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'NOTIF_BASIC', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'PLAN', feature_code: 'REPORT_BASIC', limit_value: 20, limit_period: 'MONTH', is_enabled: true },
  
  // Advanced features - some enabled with limits
  { license_code: 'PLAN', feature_code: 'TASK_RECUR', limit_value: 10, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'TASK_APPROVAL', limit_value: 5, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'TASK_MSTONE', limit_value: 5, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'TASK_CAL', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'PLAN', feature_code: 'TASK_EMAIL', limit_value: 20, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'FORM_CREATE', limit_value: 3, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'NOTIF_ADV', limit_value: 50, limit_period: 'MONTH', is_enabled: true },
  
  // Premium features - disabled
  { license_code: 'PLAN', feature_code: 'PROC_CREATE', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'PLAN', feature_code: 'API_ACCESS', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'PLAN', feature_code: 'REPORT_ADV', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  
  // Enterprise features - disabled
  { license_code: 'PLAN', feature_code: 'SSO_LOGIN', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'PLAN', feature_code: 'DED_SUPPORT', limit_value: 0, limit_period: 'MONTH', is_enabled: false },

  // EXECUTE (₹49/month) - Growing teams
  { license_code: 'EXECUTE', feature_code: 'TASK_BASIC', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'TASK_SUB', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'TASK_QUICK', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'NOTIF_BASIC', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'REPORT_BASIC', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  
  // Advanced features - generous limits
  { license_code: 'EXECUTE', feature_code: 'TASK_RECUR', limit_value: 100, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXECUTE', feature_code: 'TASK_APPROVAL', limit_value: 50, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXECUTE', feature_code: 'TASK_MSTONE', limit_value: 20, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXECUTE', feature_code: 'TASK_CAL', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'TASK_EMAIL', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'FORM_CREATE', limit_value: 25, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXECUTE', feature_code: 'NOTIF_ADV', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  
  // Premium features - enabled with limits
  { license_code: 'EXECUTE', feature_code: 'PROC_CREATE', limit_value: 10, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXECUTE', feature_code: 'API_ACCESS', limit_value: 1000, limit_period: 'MONTH', is_enabled: true }, // API calls
  { license_code: 'EXECUTE', feature_code: 'REPORT_ADV', limit_value: 50, limit_period: 'MONTH', is_enabled: true },
  
  // Enterprise features - disabled
  { license_code: 'EXECUTE', feature_code: 'SSO_LOGIN', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXECUTE', feature_code: 'DED_SUPPORT', limit_value: 0, limit_period: 'MONTH', is_enabled: false },

  // OPTIMIZE (₹99/month) - Enterprise - Everything unlimited or high limits
  { license_code: 'OPTIMIZE', feature_code: 'TASK_BASIC', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_SUB', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_QUICK', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'NOTIF_BASIC', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'REPORT_BASIC', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  
  // Advanced features - unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_RECUR', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_APPROVAL', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_MSTONE', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_CAL', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_EMAIL', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'FORM_CREATE', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'NOTIF_ADV', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  
  // Premium features - unlimited
  { license_code: 'OPTIMIZE', feature_code: 'PROC_CREATE', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'API_ACCESS', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'REPORT_ADV', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  
  // Enterprise features - unlimited
  { license_code: 'OPTIMIZE', feature_code: 'SSO_LOGIN', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'DED_SUPPORT', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited

  // EXPIRED (Post-trial) - Very minimal access
  { license_code: 'EXPIRED', feature_code: 'TASK_BASIC', limit_value: 5, limit_period: 'MONTH', is_enabled: true }, // Very limited
  { license_code: 'EXPIRED', feature_code: 'TASK_SUB', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPIRED', feature_code: 'TASK_QUICK', limit_value: 5, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXPIRED', feature_code: 'NOTIF_BASIC', limit_value: 10, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXPIRED', feature_code: 'REPORT_BASIC', limit_value: 1, limit_period: 'MONTH', is_enabled: true },
  
  // All other features disabled
  { license_code: 'EXPIRED', feature_code: 'TASK_RECUR', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPIRED', feature_code: 'TASK_APPROVAL', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPIRED', feature_code: 'TASK_MSTONE', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPIRED', feature_code: 'TASK_CAL', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPIRED', feature_code: 'TASK_EMAIL', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPIRED', feature_code: 'FORM_CREATE', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPIRED', feature_code: 'NOTIF_ADV', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPIRED', feature_code: 'PROC_CREATE', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPIRED', feature_code: 'API_ACCESS', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPIRED', feature_code: 'REPORT_ADV', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPIRED', feature_code: 'SSO_LOGIN', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
  { license_code: 'EXPIRED', feature_code: 'DED_SUPPORT', limit_value: 0, limit_period: 'MONTH', is_enabled: false },
];