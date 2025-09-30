# License & Subscription Management System

This document explains the database structure and API implementation for the subscription-based license management system.

## 📋 Database Schema

### Core Tables

#### 1. `licenses`
Stores available subscription plans
```javascript
{
  license_code: String, // 'EXPLORE', 'PLAN', 'EXECUTE', 'OPTIMIZE'
  name: String, // Display name
  description: String, // Plan description  
  billing_cycle: String, // 'MONTHLY' or 'YEARLY'
  price_monthly: Number, // Monthly price in currency
  price_yearly: Number, // Yearly price in currency
  max_users: Number, // Maximum users allowed (-1 for unlimited)
  is_active: Boolean, // Whether plan is available
  created_at: Date,
  updated_at: Date
}
```

#### 2. `features`
Available system features
```javascript
{
  feature_code: String, // 'TASKS', 'FORMS', 'PROCESSES', 'REPORTS', etc.
  name: String, // Display name
  description: String, // Feature description
  category: String, // 'CORE', 'ADVANCED', 'PREMIUM', 'ENTERPRISE'
  is_active: Boolean
}
```

#### 3. `licensefeatures`
Junction table linking licenses to features with limits
```javascript
{
  license_code: String, // FK to licenses
  feature_code: String, // FK to features
  limit_value: Number, // Usage limit (null = unlimited)
  limit_period: String, // 'DAY', 'MONTH', 'YEAR', 'LIFETIME'
  is_enabled: Boolean
}
```

### Extended Tables

#### 4. `organizations` (Extended)
Added license and subscription fields:
```javascript
{
  // ... existing fields
  current_license: String, // Current license code
  subscription_status: String, // 'active', 'expired', 'trial', 'suspended', 'cancelled'
  subscription_start_date: Date,
  subscription_end_date: Date,
  trial_end_date: Date, // 15 days from creation
  billing_cycle: String, // 'MONTHLY', 'YEARLY'
  auto_renew: Boolean
}
```

#### 5. `subscriptionhistories`
Tracks subscription changes and billing
```javascript
{
  organization: ObjectId, // FK to organizations
  license_code: String, // License at time of transaction
  action: String, // 'CREATED', 'UPGRADED', 'RENEWED', etc.
  billing_cycle: String,
  amount_paid: Number,
  currency: String,
  payment_method: String,
  payment_status: String,
  transaction_id: String,
  period_start: Date,
  period_end: Date,
  notes: String,
  created_by: ObjectId // FK to users
}
```

#### 6. `organizationusages`
Tracks feature usage against limits
```javascript
{
  organization: ObjectId,
  feature_code: String,
  usage_count: Number,
  usage_period: String, // 'DAY', 'MONTH', 'YEAR', 'LIFETIME'
  period_start: Date,
  period_end: Date,
  reset_date: Date,
  last_reset: Date
}
```

## 🚀 Getting Started

### 1. Initialize the Database

Run the seeder to populate initial data:
```bash
cd server
node scripts/seedLicenseData.js
```

This creates:
- 4 license plans (EXPLORE, PLAN, EXECUTE, OPTIMIZE)
- 13 system features  
- License-feature relationships with appropriate limits

### 2. Update Existing Organizations

For existing organizations without license data, run a migration:
```javascript
import { Organization } from './models.js';

// Set all existing orgs to free trial
await Organization.updateMany(
  { current_license: { $exists: false } },
  {
    current_license: 'EXPLORE',
    subscription_status: 'trial',
    subscription_start_date: new Date(),
    trial_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    billing_cycle: 'MONTHLY',
    auto_renew: true
  }
);
```

## 📡 API Endpoints

### License Plans

#### GET `/api/licenses/plans`
Get all available license plans with features
```javascript
// Response
{
  "success": true,
  "data": [
    {
      "license_code": "EXPLORE",
      "name": "Explore (Free)",
      "price_monthly": 0,
      "features": [
        {
          "feature_code": "TASKS",
          "limit_value": 10,
          "limit_period": "MONTH",
          "is_unlimited": false
        }
      ]
    }
  ]
}
```

#### GET `/api/licenses/plans/:licenseCode`
Get specific license plan details

### Subscription Management

#### GET `/api/licenses/subscription/:organizationId`
Get organization's subscription summary
```javascript
// Response
{
  "success": true,
  "data": {
    "current_license": {...},
    "subscription_status": "trial",
    "days_until_expiry": 12,
    "usage_summary": {
      "tasks": {
        "usage": 8,
        "limit": 10,
        "isOverLimit": false,
        "period": "MONTH"
      }
    }
  }
}
```

#### POST `/api/licenses/upgrade`
Upgrade organization subscription
```javascript
// Request
{
  "organizationId": "64f...",
  "licenseCode": "PLAN", 
  "billingCycle": "MONTHLY"
}
```

### Feature Access & Usage

#### GET `/api/licenses/feature/:organizationId/:featureCode/check`
Check feature access and current usage

#### POST `/api/licenses/feature/usage`
Increment feature usage counter
```javascript
// Request
{
  "organizationId": "64f...",
  "featureCode": "TASKS",
  "increment": 1
}
```

## 🔧 Service Functions

### Core Services (`subscriptionService.js`)

```javascript
import { 
  getAllLicensePlans,
  getLicensePlan,
  hasFeatureAccess,
  checkFeatureLimit,
  incrementFeatureUsage,
  upgradeSubscription,
  getSubscriptionSummary
} from './services/subscriptionService.js';

// Check if organization can use a feature
const hasAccess = await hasFeatureAccess(orgId, 'TASKS');

// Check usage limits
const limitCheck = await checkFeatureLimit(orgId, 'TASKS');
// Returns: { hasAccess: true, isOverLimit: false, usage: 8, limit: 10 }

// Increment usage when feature is used
await incrementFeatureUsage(orgId, 'TASKS', 1);

// Upgrade subscription
await upgradeSubscription(orgId, 'PLAN', 'MONTHLY', userId);
```

## 🛡️ Middleware Protection

### Protect Routes with License Checks

```javascript
import { requireFeature, checkSubscriptionStatus } from './middleware/licenseMiddleware.js';

// Require specific feature access
router.post('/tasks', 
  requireFeature('TASKS', 1), // Check access, limits, and auto-increment
  createTask
);

// Check subscription is active
router.use('/api/premium', checkSubscriptionStatus());

// Manual feature checks
router.post('/forms',
  checkFeatureAccess('FORMS'),
  checkFeatureLimit('FORMS'),
  createForm,
  incrementUsage('FORMS', 1) // Auto-increment after success
);
```

### Middleware Options

- `checkFeatureAccess(featureCode)` - Verify feature is in plan
- `checkFeatureLimit(featureCode)` - Verify usage limits not exceeded  
- `incrementUsage(featureCode, amount)` - Increment usage counter
- `requireFeature(featureCode, amount)` - All-in-one: access + limits + usage
- `checkSubscriptionStatus()` - Verify subscription is active

## 📊 Usage Examples

### 1. Task Creation with Limits
```javascript
// In task creation route
router.post('/tasks', 
  requireFeature('TASKS', 1),
  async (req, res) => {
    try {
      const task = await Task.create(req.body);
      res.json({ success: true, data: task });
      // Usage automatically incremented if successful
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
```

### 2. Form Creation with Manual Check
```javascript
router.post('/forms', async (req, res) => {
  try {
    // Manual limit check
    const limitCheck = await checkFeatureLimit(req.user.organizationId, 'FORMS');
    
    if (!limitCheck.hasAccess) {
      return res.status(403).json({ message: 'Upgrade required' });
    }
    
    if (limitCheck.isOverLimit) {
      return res.status(429).json({ 
        message: `Form limit reached: ${limitCheck.usage}/${limitCheck.limit}` 
      });
    }
    
    const form = await Form.create(req.body);
    
    // Manual usage increment
    await incrementFeatureUsage(req.user.organizationId, 'FORMS', 1);
    
    res.json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 3. Frontend Integration
```javascript
// Check feature access before showing UI
const checkFeature = async (featureCode) => {
  const response = await fetch(`/api/licenses/feature/${orgId}/${featureCode}/check`);
  const result = await response.json();
  
  if (!result.data.has_access) {
    showUpgradeModal();
    return false;
  }
  
  if (result.data.isOverLimit) {
    showLimitReachedModal();
    return false;
  }
  
  return true;
};

// Before creating task
if (await checkFeature('TASKS')) {
  // Show task creation UI
} else {
  // Show upgrade/limit message
}
```

## 🎯 Plan Configuration

The system comes pre-configured with these plans:

| Plan | Price | Tasks/Month | Forms | Processes | Reports |
|------|-------|-------------|-------|-----------|---------|
| **Explore** | ₹0 | 10 | 2 | 1 | 3 |
| **Plan** | ₹19 | 100 | 10 | 5 | Unlimited |
| **Execute** | ₹49 | 500 | 50 | 25 | Unlimited |  
| **Optimize** | ₹99 | Unlimited | Unlimited | Unlimited | Unlimited |

All plans include 15-day free trial and can be customized via the database.

## 🔄 Usage Tracking

Usage is automatically tracked per organization:
- **Monthly limits** reset on the 1st of each month
- **Daily limits** reset at midnight  
- **Yearly limits** reset on January 1st
- **Lifetime limits** never reset

The system handles:
- Automatic limit enforcement
- Usage increment on successful operations
- Grace period warnings before hard limits
- Upgrade prompts when limits exceeded

## ⚡ Performance Considerations

- Database indexes on frequently queried fields
- Cached license plan data (recommended)
- Bulk usage updates for high-volume operations
- Async usage tracking to avoid blocking requests

## 🧪 Testing

Test the license system:
```javascript
// Create test organization
const org = await Organization.create({
  name: 'Test Org',
  slug: 'test-org',
  current_license: 'EXPLORE'
});

// Test feature limits  
const limitCheck = await checkFeatureLimit(org._id, 'TASKS');
console.log('Tasks limit:', limitCheck);

// Test usage increment
await incrementFeatureUsage(org._id, 'TASKS', 5);

// Test upgrade
await upgradeSubscription(org._id, 'PLAN', 'MONTHLY');
```

This license system provides complete subscription management with flexible features, usage tracking, and easy integration into existing applications.