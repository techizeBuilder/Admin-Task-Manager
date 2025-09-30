import express from 'express';
import { 
  getAllLicensePlans,
  getLicensePlan,
  getSubscriptionSummary,
  upgradeSubscription,
  checkFeatureLimit,
  incrementFeatureUsage,
  hasFeatureAccess 
} from '../services/subscriptionService.js';
import { Organization } from '../models.js';

const router = express.Router();

/**
 * GET /api/licenses/plans
 * Get all available license plans with features
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = await getAllLicensePlans();
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching license plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch license plans',
      error: error.message
    });
  }
});

/**
 * GET /api/licenses/plans/:licenseCode
 * Get specific license plan details
 */
router.get('/plans/:licenseCode', async (req, res) => {
  try {
    const { licenseCode } = req.params;
    const plan = await getLicensePlan(licenseCode);
    
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error fetching license plan:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to fetch license plan',
      error: error.message
    });
  }
});

/**
 * GET /api/licenses/subscription/:organizationId
 * Get organization's current subscription summary
 */
router.get('/subscription/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const summary = await getSubscriptionSummary(organizationId);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching subscription summary:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: 'Failed to fetch subscription summary',
      error: error.message
    });
  }
});

/**
 * POST /api/licenses/upgrade
 * Upgrade organization subscription
 * Body: { organizationId, licenseCode, billingCycle }
 */
router.post('/upgrade', async (req, res) => {
  try {
    const { organizationId, licenseCode, billingCycle } = req.body;
    const userId = req.user?.id; // Assuming user is attached to request by auth middleware
    
    if (!organizationId || !licenseCode || !billingCycle) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID, license code, and billing cycle are required'
      });
    }

    if (!['MONTHLY', 'YEARLY'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        message: 'Billing cycle must be MONTHLY or YEARLY'
      });
    }

    const result = await upgradeSubscription(organizationId, licenseCode, billingCycle, userId);
    
    res.json({
      success: true,
      message: result.message,
      data: result.subscription
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade subscription',
      error: error.message
    });
  }
});

/**
 * GET /api/licenses/feature/:organizationId/:featureCode/check
 * Check if organization has access to a feature and usage limits
 */
router.get('/feature/:organizationId/:featureCode/check', async (req, res) => {
  try {
    const { organizationId, featureCode } = req.params;
    
    const hasAccess = await hasFeatureAccess(organizationId, featureCode);
    const limitCheck = await checkFeatureLimit(organizationId, featureCode);
    
    res.json({
      success: true,
      data: {
        feature_code: featureCode.toUpperCase(),
        has_access: hasAccess,
        ...limitCheck
      }
    });
  } catch (error) {
    console.error('Error checking feature access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check feature access',
      error: error.message
    });
  }
});

/**
 * POST /api/licenses/feature/usage
 * Increment usage counter for a feature
 * Body: { organizationId, featureCode, increment }
 */
router.post('/feature/usage', async (req, res) => {
  try {
    const { organizationId, featureCode, increment = 1 } = req.body;
    
    if (!organizationId || !featureCode) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID and feature code are required'
      });
    }

    // Check if they have access and aren't over limit first
    const limitCheck = await checkFeatureLimit(organizationId, featureCode);
    
    if (!limitCheck.hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Feature not available in current plan'
      });
    }

    if (limitCheck.isOverLimit) {
      return res.status(429).json({
        success: false,
        message: `Feature usage limit exceeded. Current usage: ${limitCheck.usage}/${limitCheck.limit}`,
        data: limitCheck
      });
    }

    await incrementFeatureUsage(organizationId, featureCode, increment);
    
    // Get updated usage
    const updatedCheck = await checkFeatureLimit(organizationId, featureCode);
    
    res.json({
      success: true,
      message: 'Usage incremented successfully',
      data: updatedCheck
    });
  } catch (error) {
    console.error('Error incrementing feature usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to increment feature usage',
      error: error.message
    });
  }
});

/**
 * GET /api/licenses/subscription/:organizationId/history
 * Get subscription history for organization
 */
router.get('/subscription/:organizationId/history', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { SubscriptionHistory } = await import('../models.js');
    
    const history = await SubscriptionHistory.find({ organization: organizationId })
      .populate('created_by', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await SubscriptionHistory.countDocuments({ organization: organizationId });

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription history',
      error: error.message
    });
  }
});

/**
 * POST /api/licenses/trial/extend
 * Extend trial period (admin only)
 * Body: { organizationId, extensionDays }
 */
router.post('/trial/extend', async (req, res) => {
  try {
    const { organizationId, extensionDays } = req.body;
    
    if (!organizationId || !extensionDays) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID and extension days are required'
      });
    }

    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (organization.subscription_status !== 'trial') {
      return res.status(400).json({
        success: false,
        message: 'Organization is not on trial'
      });
    }

    const newTrialEndDate = new Date(organization.trial_end_date);
    newTrialEndDate.setDate(newTrialEndDate.getDate() + parseInt(extensionDays));

    await Organization.findByIdAndUpdate(organizationId, {
      trial_end_date: newTrialEndDate
    });

    res.json({
      success: true,
      message: `Trial extended by ${extensionDays} days`,
      data: {
        new_trial_end_date: newTrialEndDate,
        days_until_expiry: Math.ceil((newTrialEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('Error extending trial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extend trial',
      error: error.message
    });
  }
});

export default router;