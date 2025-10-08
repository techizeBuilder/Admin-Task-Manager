import { License, Feature, LicenseFeature, Organization, SubscriptionHistory, OrganizationUsage } from '../models.js';

/**
 * License and Subscription Management Utilities
 * Provides functions for managing subscriptions, checking limits, and tracking usage
 */

/**
 * Get all available license plans with their features
 */
export async function getAllLicensePlans() {
  try {
    const licenses = await License.find({ is_active: true }).sort({ price_monthly: 1 });
    
    const licensesWithFeatures = await Promise.all(
      licenses.map(async (license) => {
        const features = await LicenseFeature.find({ 
          license_code: license.license_code,
          is_enabled: true 
        }).populate('feature_code');

        return {
          ...license.toObject(),
          features: features.map(feature => ({
            feature_code: feature.feature_code,
            limit_value: feature.limit_value,
            limit_period: feature.limit_period,
            is_unlimited: feature.limit_value === null
          }))
        };
      })
    );

    return licensesWithFeatures;
  } catch (error) {
    console.error('Error fetching license plans:', error);
    throw error;
  }
}

/**
 * Get a specific license plan by code
 */
export async function getLicensePlan(licenseCode) {
  try {
    const license = await License.findOne({ 
      license_code: licenseCode.toUpperCase(),
      is_active: true 
    });

    if (!license) {
      throw new Error(`License plan ${licenseCode} not found`);
    }

    const features = await LicenseFeature.find({ 
      license_code: license.license_code,
      is_enabled: true 
    }).populate('feature_code');

    return {
      ...license.toObject(),
      features: features.map(feature => ({
        feature_code: feature.feature_code,
        limit_value: feature.limit_value,
        limit_period: feature.limit_period,
        is_unlimited: feature.limit_value === null
      }))
    };
  } catch (error) {
    console.error('Error fetching license plan:', error);
    throw error;
  }
}

/**
 * Check if an organization has access to a specific feature
 * Fully database-driven - no hardcoded limits
 */
export async function hasFeatureAccess(organizationId, featureCode) {
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Auto-check trial expiry and downgrade if needed
    if (organization.subscription_status === 'trial' && organization.trial_end_date < new Date()) {
      // Auto-downgrade expired trial
      await Organization.findByIdAndUpdate(organizationId, {
        current_license: 'EXPIRED',
        subscription_status: 'expired',
        subscription_end_date: new Date()
      });
      
      console.log(`⏰ Auto-downgraded expired trial: ${organization.name} -> EXPIRED`);
      
      // Re-fetch updated organization
      organization.current_license = 'EXPIRED';
      organization.subscription_status = 'expired';
    }

    // Check if subscription allows access (expired subscriptions use EXPIRED license)
    if (organization.subscription_status === 'cancelled' || organization.subscription_status === 'suspended') {
      return { hasAccess: false, reason: 'subscription_inactive' };
    }

    const licenseFeature = await LicenseFeature.findOne({
      license_code: organization.current_license,
      feature_code: featureCode.toUpperCase(),
      is_enabled: true
    });

    return { 
      hasAccess: !!licenseFeature,
      licenseFeature,
      reason: licenseFeature ? 'access_granted' : 'feature_not_available'
    };
  } catch (error) {
    console.error('Error checking feature access:', error);
    throw error;
  }
}

/**
 * Get current usage for an organization and feature
 */
export async function getFeatureUsage(organizationId, featureCode, period = 'MONTH') {
  try {
    const now = new Date();
    let periodStart, periodEnd;

    switch (period) {
      case 'DAY':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 1);
        break;
      case 'MONTH':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        break;
      case 'YEAR':
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(periodStart);
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        break;
      case 'LIFETIME':
        periodStart = new Date(0); // Beginning of time
        periodEnd = new Date('2099-12-31'); // Far future
        break;
      default:
        throw new Error('Invalid period specified');
    }

    const usage = await OrganizationUsage.findOne({
      organization: organizationId,
      feature_code: featureCode.toUpperCase(),
      usage_period: period,
      period_start: { $lte: periodStart },
      period_end: { $gte: periodEnd }
    });

    return usage ? usage.usage_count : 0;
  } catch (error) {
    console.error('Error getting feature usage:', error);
    throw error;
  }
}

/**
 * Check if organization has exceeded limits for a feature
 */
export async function checkFeatureLimit(organizationId, featureCode) {
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    const licenseFeature = await LicenseFeature.findOne({
      license_code: organization.current_license,
      feature_code: featureCode.toUpperCase(),
      is_enabled: true
    });

    if (!licenseFeature) {
      return { hasAccess: false, isOverLimit: true, usage: 0, limit: 0 };
    }

    // If unlimited (null limit), always allow
    if (licenseFeature.limit_value === null) {
      return { hasAccess: true, isOverLimit: false, usage: 0, limit: null };
    }

    const usage = await getFeatureUsage(organizationId, featureCode, licenseFeature.limit_period);
    const isOverLimit = usage >= licenseFeature.limit_value;

    return {
      hasAccess: true,
      isOverLimit,
      usage,
      limit: licenseFeature.limit_value,
      period: licenseFeature.limit_period
    };
  } catch (error) {
    console.error('Error checking feature limit:', error);
    throw error;
  }
}

/**
 * Increment usage counter for a feature
 */
export async function incrementFeatureUsage(organizationId, featureCode, incrementBy = 1) {
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    const licenseFeature = await LicenseFeature.findOne({
      license_code: organization.current_license,
      feature_code: featureCode.toUpperCase(),
      is_enabled: true
    });

    if (!licenseFeature || !licenseFeature.limit_period) {
      // No limits to track
      return;
    }

    const now = new Date();
    let periodStart, periodEnd, resetDate;

    switch (licenseFeature.limit_period) {
      case 'DAY':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 1);
        resetDate = periodEnd;
        break;
      case 'MONTH':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        resetDate = periodEnd;
        break;
      case 'YEAR':
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(periodStart);
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        resetDate = periodEnd;
        break;
      case 'LIFETIME':
        periodStart = new Date(0);
        periodEnd = new Date('2099-12-31');
        resetDate = null;
        break;
    }

    await OrganizationUsage.findOneAndUpdate(
      {
        organization: organizationId,
        feature_code: featureCode.toUpperCase(),
        usage_period: licenseFeature.limit_period,
        period_start: periodStart,
        period_end: periodEnd
      },
      {
        $inc: { usage_count: incrementBy },
        $setOnInsert: {
          organization: organizationId,
          feature_code: featureCode.toUpperCase(),
          usage_period: licenseFeature.limit_period,
          period_start: periodStart,
          period_end: periodEnd,
          reset_date: resetDate
        }
      },
      {
        upsert: true,
        new: true
      }
    );
  } catch (error) {
    console.error('Error incrementing feature usage:', error);
    throw error;
  }
}

/**
 * Upgrade organization subscription
 */
export async function upgradeSubscription(organizationId, newLicenseCode, billingCycle, userId = null) {
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    const newLicense = await License.findOne({ 
      license_code: newLicenseCode.toUpperCase(),
      is_active: true 
    });
    
    if (!newLicense) {
      throw new Error(`License ${newLicenseCode} not found`);
    }

    const oldLicenseCode = organization.current_license;
    
    // Calculate subscription period
    const now = new Date();
    const periodStart = now;
    const periodEnd = new Date(now);
    
    if (billingCycle === 'YEARLY') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Update organization
    await Organization.findByIdAndUpdate(organizationId, {
      current_license: newLicense.license_code,
      subscription_status: 'active',
      subscription_start_date: periodStart,
      subscription_end_date: periodEnd,
      billing_cycle: billingCycle,
      auto_renew: true
    });

    // Record subscription history
    await SubscriptionHistory.create({
      organization: organizationId,
      license_code: newLicense.license_code,
      action: oldLicenseCode === newLicense.license_code ? 'RENEWED' : 'UPGRADED',
      billing_cycle: billingCycle,
      amount_paid: billingCycle === 'YEARLY' ? newLicense.price_yearly : newLicense.price_monthly,
      currency: 'INR',
      payment_status: 'COMPLETED',
      period_start: periodStart,
      period_end: periodEnd,
      created_by: userId,
      notes: `Subscription ${oldLicenseCode === newLicense.license_code ? 'renewed' : 'upgraded from ' + oldLicenseCode} to ${newLicense.license_code}`
    });

    return {
      success: true,
      message: `Subscription ${oldLicenseCode === newLicense.license_code ? 'renewed' : 'upgraded'} successfully`,
      subscription: {
        license_code: newLicense.license_code,
        billing_cycle: billingCycle,
        period_start: periodStart,
        period_end: periodEnd
      }
    };
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    throw error;
  }
}

/**
 * Get subscription status and usage summary for an organization
 */
export async function getSubscriptionSummary(organizationId) {
  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    const license = await getLicensePlan(organization.current_license);
    
    // Get usage for key features
    const usageSummary = {};
    const keyFeatures = ['TASKS', 'FORMS', 'PROCESSES', 'REPORTS'];
    
    for (const feature of keyFeatures) {
      const featureLimit = await checkFeatureLimit(organizationId, feature);
      if (featureLimit.hasAccess) {
        usageSummary[feature.toLowerCase()] = {
          usage: featureLimit.usage,
          limit: featureLimit.limit,
          isOverLimit: featureLimit.isOverLimit,
          period: featureLimit.period
        };
      }
    }

    // Calculate days until expiry
    let daysUntilExpiry = null;
    let expiryDate = null;
    
    if (organization.subscription_status === 'trial') {
      expiryDate = organization.trial_end_date;
    } else if (organization.subscription_end_date) {
      expiryDate = organization.subscription_end_date;
    }
    
    if (expiryDate) {
      const diffTime = expiryDate.getTime() - new Date().getTime();
      daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      organization_id: organizationId,
      current_license: license,
      subscription_status: organization.subscription_status,
      billing_cycle: organization.billing_cycle,
      subscription_start_date: organization.subscription_start_date,
      subscription_end_date: organization.subscription_end_date,
      trial_end_date: organization.trial_end_date,
      days_until_expiry: daysUntilExpiry,
      auto_renew: organization.auto_renew,
      usage_summary: usageSummary
    };
  } catch (error) {
    console.error('Error getting subscription summary:', error);
    throw error;
  }
}

export {
  getAllLicensePlans,
  getLicensePlan,
  hasFeatureAccess,
  getFeatureUsage,
  checkFeatureLimit,
  incrementFeatureUsage,
  upgradeSubscription,
  getSubscriptionSummary
};