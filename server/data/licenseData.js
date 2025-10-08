/**
 * License System Data Structure
 * Based on your detailed feature mapping specification
 * 
 * This file contains all the data structures needed for the license system.
 * You can use this to populate your database manually or adapt it to your ORM.
 */

// LICENSE PLANS
export const LICENSE_PLANS = [
  {
    license_code: 'EXPLORE',
    name: 'Explore (Free)',
    description: 'First-time users, trial mode - 15 days only',
    billing_cycle: 'MONTHLY',
    price_monthly: 0,
    price_yearly: 0,
    max_users: 10,
    is_active: true,
    trial_days: 15
  },
  {
    license_code: 'PLAN',
    name: 'Plan',
    description: 'Individuals / small teams',
    billing_cycle: 'MONTHLY',
    price_monthly: 19,
    price_yearly: 190, // ~17% discount
    max_users: 25,
    is_active: true
  },
  {
    license_code: 'EXECUTE',
    name: 'Execute',
    description: 'Growing teams',
    billing_cycle: 'MONTHLY',
    price_monthly: 49,
    price_yearly: 490, // ~17% discount
    max_users: 100,
    is_active: true
  },
  {
    license_code: 'OPTIMIZE',
    name: 'Optimize',
    description: 'Large organizations',
    billing_cycle: 'MONTHLY',
    price_monthly: 99,
    price_yearly: 990, // ~17% discount
    max_users: -1, // Unlimited
    is_active: true
  }
];

// SYSTEM FEATURES - Master Table with Detailed Descriptions
export const SYSTEM_FEATURES = [
  // CORE Features - Available in all plans
  {
    feature_code: 'TASK_BASIC',
    name: 'Basic Task Management',
    description: 'Create, edit, and manage basic tasks with due dates, priorities, and assignees. Foundation of task management system.',
    category: 'CORE'
  },
  {
    feature_code: 'TASK_SUB',
    name: 'Sub-task Organization',
    description: 'Break down complex tasks into manageable sub-tasks with hierarchical structure and progress tracking.',
    category: 'CORE'
  },
  {
    feature_code: 'TASK_QUICK',
    name: 'Quick Task Entry',
    description: 'Create simple one-liner tasks and checklist items for rapid task capture and management.',
    category: 'CORE'
  },
  {
    feature_code: 'NOTIF_BASIC',
    name: 'Basic Notifications',
    description: 'Receive email and in-app notifications for task assignments, due dates, and status changes.',
    category: 'CORE'
  },
  {
    feature_code: 'REPORT_BASIC',
    name: 'Basic Reporting',
    description: 'Generate simple reports on task completion, team productivity, and basic project metrics.',
    category: 'CORE'
  },

  // ADVANCED Features - Available from PLAN tier and above
  {
    feature_code: 'TASK_RECUR',
    name: 'Recurring Tasks',
    description: 'Set up automated recurring tasks with flexible scheduling patterns (daily, weekly, monthly, custom intervals).',
    category: 'ADVANCED'
  },
  {
    feature_code: 'TASK_APPROVAL',
    name: 'Approval Workflows',
    description: 'Create approval-based tasks with multi-level approval chains, voting mechanisms, and automatic routing.',
    category: 'ADVANCED'
  },
  {
    feature_code: 'TASK_MSTONE',
    name: 'Milestone Management',
    description: 'Create milestone tasks with dependencies, progress tracking, and automatic project phase management.',
    category: 'ADVANCED'
  },
  {
    feature_code: 'TASK_CAL',
    name: 'Calendar Integration',
    description: 'Sync tasks with calendar applications, schedule time blocks, and view tasks in calendar format.',
    category: 'ADVANCED'
  },
  {
    feature_code: 'TASK_EMAIL',
    name: 'Email Task Creation',
    description: 'Create tasks directly from email, convert emails to tasks, and manage email-based workflows.',
    category: 'ADVANCED'
  },
  {
    feature_code: 'FORM_CREATE',
    name: 'Custom Form Builder',
    description: 'Create custom forms for data collection, task templates, and standardized information gathering.',
    category: 'ADVANCED'
  },
  {
    feature_code: 'NOTIF_ADV',
    name: 'Advanced Notifications',
    description: 'Customize notification preferences, create notification rules, and integrate with messaging platforms.',
    category: 'ADVANCED'
  },

  // PREMIUM Features - Available from EXECUTE tier and above
  {
    feature_code: 'PROC_CREATE',
    name: 'Process Automation',
    description: 'Process creation (link tasks + forms)',
    category: 'PREMIUM'
  },
  {
    feature_code: 'TASK_EMAIL',
    name: 'Email Integration',
    description: 'Task creation via email integration',
    category: 'ADVANCED'
  },
  {
    feature_code: 'TASK_CAL',
    name: 'Calendar Integration',
    description: 'Calendar integration (view + create task from date)',
    category: 'ADVANCED'
  },
  {
    feature_code: 'REPORT_BASIC',
    name: 'Basic Reporting',
    description: 'Basic reporting (task completion, overdue count)',
    category: 'CORE'
  },
  {
    feature_code: 'REPORT_ADV',
    name: 'Advanced Reporting',
    description: 'Advanced reporting & analytics',
    category: 'PREMIUM'
  },
  {
    feature_code: 'NOTIF_BASIC',
    name: 'Basic Notifications',
    description: 'System notifications (web, email)',
    category: 'CORE'
  },
  {
    feature_code: 'NOTIF_ADV',
    name: 'Advanced Notifications',
    description: 'Customizable notifications & reminders',
    category: 'ADVANCED'
  },
  {
    feature_code: 'API_ACCESS',
    name: 'API Access',
    description: 'API integrations (Phase II)',
    category: 'PREMIUM'
  },
  {
    feature_code: 'SSO_LOGIN',
    name: 'Single Sign-On',
    description: 'Single sign-on (SSO) authentication',
    category: 'ENTERPRISE'
  },
  {
    feature_code: 'DED_SUPPORT',
    name: 'Dedicated Support',
    description: 'Dedicated customer support',
    category: 'ENTERPRISE'
  }
];

// FEATURE TO LICENSE MAPPING WITH LIMITS
// Based on your specification table
export const LICENSE_FEATURE_MAPPING = [
  // EXPLORE (Free - 15 days trial)
  { license_code: 'EXPLORE', feature_code: 'TASK_BASIC', limit_value: 20, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'TASK_SUB', limit_value: 10, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'TASK_RECUR', limit_value: 1, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'TASK_APPROVAL', limit_value: 0, limit_period: 'MONTH', is_enabled: false }, // Not available
  { license_code: 'EXPLORE', feature_code: 'TASK_MSTONE', limit_value: 0, limit_period: 'MONTH', is_enabled: false }, // Not available
  { license_code: 'EXPLORE', feature_code: 'TASK_QUICK', limit_value: 50, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'FORM_CREATE', limit_value: 2, limit_period: 'LIFETIME', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'PROC_CREATE', limit_value: 1, limit_period: 'LIFETIME', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'TASK_EMAIL', limit_value: 10, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'TASK_CAL', limit_value: null, limit_period: null, is_enabled: true }, // Basic calendar view
  { license_code: 'EXPLORE', feature_code: 'REPORT_BASIC', limit_value: null, limit_period: null, is_enabled: true }, // Standard only
  { license_code: 'EXPLORE', feature_code: 'REPORT_ADV', limit_value: 3, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'NOTIF_BASIC', limit_value: null, limit_period: null, is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'NOTIF_ADV', limit_value: 0, limit_period: 'MONTH', is_enabled: false }, // Not available
  { license_code: 'EXPLORE', feature_code: 'API_ACCESS', limit_value: 5, limit_period: 'DAY', is_enabled: true },
  { license_code: 'EXPLORE', feature_code: 'SSO_LOGIN', limit_value: 0, limit_period: 'MONTH', is_enabled: false }, // Not available
  { license_code: 'EXPLORE', feature_code: 'DED_SUPPORT', limit_value: 0, limit_period: 'MONTH', is_enabled: false }, // Not available

  // PLAN (Individuals / small teams)
  { license_code: 'PLAN', feature_code: 'TASK_BASIC', limit_value: 100, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'TASK_SUB', limit_value: 50, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'TASK_RECUR', limit_value: 10, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'TASK_APPROVAL', limit_value: 20, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'TASK_MSTONE', limit_value: 5, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'TASK_QUICK', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'PLAN', feature_code: 'FORM_CREATE', limit_value: 10, limit_period: 'LIFETIME', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'PROC_CREATE', limit_value: 5, limit_period: 'LIFETIME', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'TASK_EMAIL', limit_value: 100, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'TASK_CAL', limit_value: null, limit_period: null, is_enabled: true }, // Full calendar, create tasks
  { license_code: 'PLAN', feature_code: 'REPORT_BASIC', limit_value: null, limit_period: null, is_enabled: true },
  { license_code: 'PLAN', feature_code: 'REPORT_ADV', limit_value: 10, limit_period: 'MONTH', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'NOTIF_BASIC', limit_value: null, limit_period: null, is_enabled: true },
  { license_code: 'PLAN', feature_code: 'NOTIF_ADV', limit_value: null, limit_period: null, is_enabled: true },
  { license_code: 'PLAN', feature_code: 'API_ACCESS', limit_value: 500, limit_period: 'DAY', is_enabled: true },
  { license_code: 'PLAN', feature_code: 'SSO_LOGIN', limit_value: 0, limit_period: 'MONTH', is_enabled: false }, // Not available
  { license_code: 'PLAN', feature_code: 'DED_SUPPORT', limit_value: 0, limit_period: 'MONTH', is_enabled: false }, // Not available

  // EXECUTE (Growing teams)
  { license_code: 'EXECUTE', feature_code: 'TASK_BASIC', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'TASK_SUB', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'TASK_RECUR', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'TASK_APPROVAL', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'TASK_MSTONE', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'TASK_QUICK', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'FORM_CREATE', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'PROC_CREATE', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'TASK_EMAIL', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'TASK_CAL', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited with reminders
  { license_code: 'EXECUTE', feature_code: 'REPORT_BASIC', limit_value: null, limit_period: null, is_enabled: true },
  { license_code: 'EXECUTE', feature_code: 'REPORT_ADV', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'NOTIF_BASIC', limit_value: null, limit_period: null, is_enabled: true },
  { license_code: 'EXECUTE', feature_code: 'NOTIF_ADV', limit_value: null, limit_period: null, is_enabled: true },
  { license_code: 'EXECUTE', feature_code: 'API_ACCESS', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'EXECUTE', feature_code: 'SSO_LOGIN', limit_value: 0, limit_period: 'MONTH', is_enabled: false }, // Not available
  { license_code: 'EXECUTE', feature_code: 'DED_SUPPORT', limit_value: 0, limit_period: 'MONTH', is_enabled: false }, // Not available

  // OPTIMIZE (Large organizations)
  { license_code: 'OPTIMIZE', feature_code: 'TASK_BASIC', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_SUB', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_RECUR', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_APPROVAL', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_MSTONE', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_QUICK', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'FORM_CREATE', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'PROC_CREATE', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_EMAIL', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited
  { license_code: 'OPTIMIZE', feature_code: 'TASK_CAL', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited + analytics overlay
  { license_code: 'OPTIMIZE', feature_code: 'REPORT_BASIC', limit_value: null, limit_period: null, is_enabled: true },
  { license_code: 'OPTIMIZE', feature_code: 'REPORT_ADV', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited + export to PDF/Excel
  { license_code: 'OPTIMIZE', feature_code: 'NOTIF_BASIC', limit_value: null, limit_period: null, is_enabled: true },
  { license_code: 'OPTIMIZE', feature_code: 'NOTIF_ADV', limit_value: null, limit_period: null, is_enabled: true }, // With SLA alerts
  { license_code: 'OPTIMIZE', feature_code: 'API_ACCESS', limit_value: null, limit_period: null, is_enabled: true }, // Unlimited + priority
  { license_code: 'OPTIMIZE', feature_code: 'SSO_LOGIN', limit_value: null, limit_period: null, is_enabled: true }, // Available
  { license_code: 'OPTIMIZE', feature_code: 'DED_SUPPORT', limit_value: null, limit_period: null, is_enabled: true } // Available
];

// SUMMARY STATISTICS
export function getDataSummary() {
  const licenseCount = LICENSE_PLANS.length;
  const featureCount = SYSTEM_FEATURES.length;
  const mappingCount = LICENSE_FEATURE_MAPPING.length;

  const featuresByCategory = SYSTEM_FEATURES.reduce((acc, feature) => {
    acc[feature.category] = (acc[feature.category] || 0) + 1;
    return acc;
  }, {});

  const featuresByLicense = LICENSE_FEATURE_MAPPING.reduce((acc, mapping) => {
    if (!acc[mapping.license_code]) acc[mapping.license_code] = { enabled: 0, disabled: 0 };
    if (mapping.is_enabled) {
      acc[mapping.license_code].enabled++;
    } else {
      acc[mapping.license_code].disabled++;
    }
    return acc;
  }, {});

  return {
    licenses: licenseCount,
    features: featureCount,
    mappings: mappingCount,
    featuresByCategory,
    featuresByLicense
  };
}

// FEATURE MATRIX FOR EASY REFERENCE
export const FEATURE_MATRIX = {
  'TASK_BASIC': {
    'EXPLORE': { limit: 20, period: 'MONTH', enabled: true },
    'PLAN': { limit: 100, period: 'MONTH', enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true }, // Unlimited
    'OPTIMIZE': { limit: null, period: null, enabled: true } // Unlimited
  },
  'TASK_SUB': {
    'EXPLORE': { limit: 10, period: 'MONTH', enabled: true },
    'PLAN': { limit: 50, period: 'MONTH', enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true }
  },
  'TASK_RECUR': {
    'EXPLORE': { limit: 1, period: 'MONTH', enabled: true },
    'PLAN': { limit: 10, period: 'MONTH', enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true }
  },
  'TASK_APPROVAL': {
    'EXPLORE': { limit: 0, period: 'MONTH', enabled: false }, // Not available
    'PLAN': { limit: 20, period: 'MONTH', enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true }
  },
  'TASK_MSTONE': {
    'EXPLORE': { limit: 0, period: 'MONTH', enabled: false }, // Not available
    'PLAN': { limit: 5, period: 'MONTH', enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true }
  },
  'TASK_QUICK': {
    'EXPLORE': { limit: 50, period: 'MONTH', enabled: true },
    'PLAN': { limit: null, period: null, enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true }
  },
  'FORM_CREATE': {
    'EXPLORE': { limit: 2, period: 'LIFETIME', enabled: true },
    'PLAN': { limit: 10, period: 'LIFETIME', enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true }
  },
  'PROC_CREATE': {
    'EXPLORE': { limit: 1, period: 'LIFETIME', enabled: true },
    'PLAN': { limit: 5, period: 'LIFETIME', enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true }
  },
  'TASK_EMAIL': {
    'EXPLORE': { limit: 10, period: 'MONTH', enabled: true },
    'PLAN': { limit: 100, period: 'MONTH', enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true }
  },
  'TASK_CAL': {
    'EXPLORE': { limit: null, period: null, enabled: true, note: 'Basic calendar view' },
    'PLAN': { limit: null, period: null, enabled: true, note: 'Full calendar, create tasks' },
    'EXECUTE': { limit: null, period: null, enabled: true, note: 'Unlimited with reminders' },
    'OPTIMIZE': { limit: null, period: null, enabled: true, note: 'Unlimited + analytics overlay' }
  },
  'REPORT_BASIC': {
    'EXPLORE': { limit: null, period: null, enabled: true, note: 'Standard only' },
    'PLAN': { limit: null, period: null, enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true }
  },
  'REPORT_ADV': {
    'EXPLORE': { limit: 3, period: 'MONTH', enabled: true },
    'PLAN': { limit: 10, period: 'MONTH', enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true, note: 'Unlimited + export to PDF/Excel' }
  },
  'NOTIF_BASIC': {
    'EXPLORE': { limit: null, period: null, enabled: true },
    'PLAN': { limit: null, period: null, enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true }
  },
  'NOTIF_ADV': {
    'EXPLORE': { limit: 0, period: 'MONTH', enabled: false }, // Not available
    'PLAN': { limit: null, period: null, enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true, note: 'With SLA alerts' }
  },
  'API_ACCESS': {
    'EXPLORE': { limit: 5, period: 'DAY', enabled: true },
    'PLAN': { limit: 500, period: 'DAY', enabled: true },
    'EXECUTE': { limit: null, period: null, enabled: true },
    'OPTIMIZE': { limit: null, period: null, enabled: true, note: 'Unlimited + priority' }
  },
  'SSO_LOGIN': {
    'EXPLORE': { limit: 0, period: 'MONTH', enabled: false }, // Not available
    'PLAN': { limit: 0, period: 'MONTH', enabled: false }, // Not available
    'EXECUTE': { limit: 0, period: 'MONTH', enabled: false }, // Not available
    'OPTIMIZE': { limit: null, period: null, enabled: true }
  },
  'DED_SUPPORT': {
    'EXPLORE': { limit: 0, period: 'MONTH', enabled: false }, // Not available
    'PLAN': { limit: 0, period: 'MONTH', enabled: false }, // Not available
    'EXECUTE': { limit: 0, period: 'MONTH', enabled: false }, // Not available
    'OPTIMIZE': { limit: null, period: null, enabled: true }
  }
};

console.log('📋 License System Data Structure Loaded');
console.log('📊 Summary:', getDataSummary());