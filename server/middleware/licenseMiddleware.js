import { hasFeatureAccess, checkFeatureLimit, incrementFeatureUsage } from '../services/subscriptionService.js';
import TrialManagementService from '../services/trialManagementService.js';

/**
 * Middleware to check if organization has access to a feature
 * Enhanced with automatic trial expiry processing
 */
export function checkFeatureAccess(featureCode) {
  return async (req, res, next) => {
    try {
      const organizationId = req.user?.organizationId || req.body?.organizationId || req.params?.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required',
          error_code: 'MISSING_ORGANIZATION'
        });
      }

      // Check and process trial expiry automatically
      const trialStatus = await TrialManagementService.checkTrialStatus(organizationId);
      if (trialStatus.requiresDowngrade) {
        console.log(`🔽 Auto-processing expired trial for ${trialStatus.organizationName}`);
        await TrialManagementService.downgradeExpiredTrial(organizationId);
      }

      const accessCheck = await hasFeatureAccess(organizationId, featureCode);
      
      if (!accessCheck.hasAccess) {
        const errorResponse = {
          success: false,
          message: `Feature '${featureCode}' is not available in your current plan`,
          feature_code: featureCode,
          upgrade_required: true,
          reason: accessCheck.reason
        };

        if (accessCheck.reason === 'subscription_inactive') {
          errorResponse.message = 'Your subscription is inactive. Please reactivate to continue.';
        }

        return res.status(403).json(errorResponse);
      }

      req.organizationId = organizationId;
      req.featureCode = featureCode;
      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check feature access',
        error: error.message
      });
    }
  };
}

/**
 * Middleware to check feature limits before allowing action
 * Usage: checkFeatureLimit('TASKS')
 */
export function checkFeatureLimit(featureCode) {
  return async (req, res, next) => {
    try {
      const organizationId = req.user?.organizationId || req.body?.organizationId || req.params?.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const limitCheck = await checkFeatureLimit(organizationId, featureCode);
      
      if (!limitCheck.hasAccess) {
        return res.status(403).json({
          success: false,
          message: `Feature '${featureCode}' is not available in your current plan`,
          feature_code: featureCode,
          upgrade_required: true
        });
      }

      if (limitCheck.isOverLimit) {
        return res.status(429).json({
          success: false,
          message: `Feature usage limit exceeded for '${featureCode}'`,
          feature_code: featureCode,
          usage: limitCheck.usage,
          limit: limitCheck.limit,
          period: limitCheck.period,
          upgrade_required: true
        });
      }

      req.organizationId = organizationId;
      req.featureCode = featureCode;
      req.limitCheck = limitCheck;
      next();
    } catch (error) {
      console.error('Error checking feature limit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check feature limit',
        error: error.message
      });
    }
  };
}

/**
 * Middleware to automatically increment usage after successful action
 * Should be used after the main route handler
 * Usage: incrementUsage('TASKS', 1)
 */
export function incrementUsage(featureCode, incrementBy = 1) {
  return async (req, res, next) => {
    try {
      const organizationId = req.organizationId || req.user?.organizationId;
      
      if (!organizationId) {
        return next(); // Skip if no organization ID
      }

      // Only increment if the response was successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await incrementFeatureUsage(organizationId, featureCode, incrementBy);
      }

      next();
    } catch (error) {
      console.error('Error incrementing usage:', error);
      // Don't fail the request if usage tracking fails
      next();
    }
  };
}

/**
 * Middleware that combines feature access check, limit check, and auto usage increment
 * Usage: requireFeature('TASKS', 1)
 */
export function requireFeature(featureCode, incrementBy = 1) {
  return [
    checkFeatureAccess(featureCode),
    checkFeatureLimit(featureCode),
    // Increment usage after response is sent
    (req, res, next) => {
      res.on('finish', async () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            await incrementFeatureUsage(req.organizationId, featureCode, incrementBy);
          }
        } catch (error) {
          console.error('Error auto-incrementing usage:', error);
        }
      });
      next();
    }
  ];
}

/**
 * Middleware to check subscription status
 */
export function checkSubscriptionStatus() {
  return async (req, res, next) => {
    try {
      const organizationId = req.user?.organizationId || req.body?.organizationId || req.params?.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required'
        });
      }

      const { Organization } = await import('../models.js');
      const organization = await Organization.findById(organizationId);
      
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organization not found'
        });
      }

      // Check if subscription is active or trial
      const now = new Date();
      let isExpired = false;
      let expiryDate = null;

      if (organization.subscription_status === 'trial') {
        expiryDate = organization.trial_end_date;
        isExpired = expiryDate < now;
      } else if (organization.subscription_status === 'active') {
        expiryDate = organization.subscription_end_date;
        isExpired = expiryDate < now;
      } else {
        isExpired = true;
      }

      if (isExpired && organization.subscription_status !== 'expired') {
        // Update status to expired
        await Organization.findByIdAndUpdate(organizationId, {
          subscription_status: 'expired'
        });
        organization.subscription_status = 'expired';
      }

      if (organization.subscription_status === 'expired' || organization.subscription_status === 'cancelled') {
        return res.status(402).json({
          success: false,
          message: 'Subscription has expired or been cancelled',
          subscription_status: organization.subscription_status,
          payment_required: true
        });
      }

      req.organization = organization;
      req.organizationId = organizationId;
      next();
    } catch (error) {
      console.error('Error checking subscription status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check subscription status',
        error: error.message
      });
    }
  };
}

export {
  checkFeatureAccess,
  checkFeatureLimit,
  incrementUsage,
  requireFeature,
  checkSubscriptionStatus
};