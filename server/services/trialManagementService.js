/**
 * Trial Management Service
 * Handles EXPLORE tier 15-day validity and auto-downgrade logic
 * Requirements:
 * - Trial expires 15 days after registration
 * - Auto-downgrade to EXPIRED tier with minimal access
 * - Scheduled job to check and process expired trials
 */

import { Organization, License, LicenseFeature } from '../models.js';

class TrialManagementService {
  /**
   * Check if organization's trial has expired
   * @param {string} organizationId - Organization ID
   * @returns {Object} Trial status information
   */
  async checkTrialStatus(organizationId) {
    try {
      const org = await Organization.findById(organizationId);
      if (!org) {
        throw new Error('Organization not found');
      }

      const now = new Date();
      const trialEndDate = org.trial_end_date;
      const isTrialActive = org.subscription_status === 'trial';
      const isTrialExpired = trialEndDate && now > trialEndDate;

      return {
        organizationId: org._id,
        organizationName: org.name,
        currentLicense: org.current_license,
        subscriptionStatus: org.subscription_status,
        trialEndDate,
        isTrialActive,
        isTrialExpired,
        daysRemaining: trialEndDate ? Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24)) : null,
        requiresDowngrade: isTrialActive && isTrialExpired
      };
    } catch (error) {
      console.error('Error checking trial status:', error);
      throw error;
    }
  }

  /**
   * Auto-downgrade expired trial organizations to EXPIRED tier
   * @param {string} organizationId - Organization ID
   * @returns {Object} Downgrade result
   */
  async downgradeExpiredTrial(organizationId) {
    try {
      const trialStatus = await this.checkTrialStatus(organizationId);
      
      if (!trialStatus.requiresDowngrade) {
        return {
          success: false,
          message: 'Trial has not expired or organization is not on trial',
          trialStatus
        };
      }

      // Update organization to expired status
      const updatedOrg = await Organization.findByIdAndUpdate(
        organizationId,
        {
          current_license: 'EXPIRED',
          subscription_status: 'expired',
          subscription_end_date: new Date() // Mark the end date
        },
        { new: true }
      );

      console.log(`🔽 Auto-downgraded organization ${updatedOrg.name} from trial to EXPIRED tier`);

      return {
        success: true,
        message: 'Trial expired and downgraded to EXPIRED tier',
        organization: {
          id: updatedOrg._id,
          name: updatedOrg.name,
          previousLicense: trialStatus.currentLicense,
          newLicense: updatedOrg.current_license,
          subscriptionStatus: updatedOrg.subscription_status
        }
      };
    } catch (error) {
      console.error('Error downgrading expired trial:', error);
      throw error;
    }
  }

  /**
   * Process all expired trials in the system
   * This should be run as a scheduled job (e.g., daily)
   * @returns {Object} Batch processing results
   */
  async processExpiredTrials() {
    try {
      console.log('🔍 Checking for expired trials...');

      // Find all organizations on trial that have passed their trial end date
      const expiredTrials = await Organization.find({
        subscription_status: 'trial',
        trial_end_date: { $lt: new Date() }
      });

      console.log(`📊 Found ${expiredTrials.length} expired trials to process`);

      const results = {
        total: expiredTrials.length,
        processed: 0,
        errors: [],
        downgraded: []
      };

      // Process each expired trial
      for (const org of expiredTrials) {
        try {
          const downgradeResult = await this.downgradeExpiredTrial(org._id);
          if (downgradeResult.success) {
            results.processed++;
            results.downgraded.push(downgradeResult.organization);
          }
        } catch (error) {
          results.errors.push({
            organizationId: org._id,
            organizationName: org.name,
            error: error.message
          });
        }
      }

      console.log(`✅ Processed ${results.processed}/${results.total} expired trials`);
      if (results.errors.length > 0) {
        console.warn(`⚠️ ${results.errors.length} errors occurred during processing`);
      }

      return results;
    } catch (error) {
      console.error('Error processing expired trials:', error);
      throw error;
    }
  }

  /**
   * Get trial statistics across all organizations
   * @returns {Object} Trial statistics
   */
  async getTrialStatistics() {
    try {
      const stats = await Organization.aggregate([
        {
          $group: {
            _id: '$subscription_status',
            count: { $sum: 1 },
            organizations: { $push: { name: '$name', trialEndDate: '$trial_end_date' }}
          }
        }
      ]);

      const now = new Date();
      const activeTrials = await Organization.find({
        subscription_status: 'trial',
        trial_end_date: { $gt: now }
      }).select('name trial_end_date');

      const expiringSoon = activeTrials.filter(org => {
        const daysLeft = Math.ceil((org.trial_end_date - now) / (1000 * 60 * 60 * 24));
        return daysLeft <= 3; // Expiring in 3 days or less
      });

      return {
        statistics: stats,
        activeTrials: activeTrials.length,
        expiringSoon: expiringSoon.length,
        expiringOrganizations: expiringSoon.map(org => ({
          name: org.name,
          trialEndDate: org.trial_end_date,
          daysRemaining: Math.ceil((org.trial_end_date - now) / (1000 * 60 * 60 * 24))
        }))
      };
    } catch (error) {
      console.error('Error getting trial statistics:', error);
      throw error;
    }
  }

  /**
   * Send trial expiry notifications (for integration with notification system)
   * @param {number} daysBeforeExpiry - Send notifications X days before expiry
   * @returns {Object} Notification results
   */
  async getTrialExpiryNotifications(daysBeforeExpiry = 3) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysBeforeExpiry);

      const organizationsToNotify = await Organization.find({
        subscription_status: 'trial',
        trial_end_date: {
          $gte: new Date(), // Not yet expired
          $lte: futureDate   // But will expire within X days
        }
      }).populate('admin', 'email name'); // Assuming admin field exists

      const notifications = organizationsToNotify.map(org => {
        const daysLeft = Math.ceil((org.trial_end_date - new Date()) / (1000 * 60 * 60 * 24));
        return {
          organizationId: org._id,
          organizationName: org.name,
          adminEmail: org.admin?.email,
          adminName: org.admin?.name,
          trialEndDate: org.trial_end_date,
          daysRemaining: daysLeft,
          urgency: daysLeft <= 1 ? 'high' : daysLeft <= 3 ? 'medium' : 'low'
        };
      });

      return {
        count: notifications.length,
        notifications
      };
    } catch (error) {
      console.error('Error getting trial expiry notifications:', error);
      throw error;
    }
  }

  /**
   * Extend trial period for specific organization (admin function)
   * @param {string} organizationId - Organization ID
   * @param {number} additionalDays - Days to add to trial
   * @returns {Object} Extension result
   */
  async extendTrial(organizationId, additionalDays = 15) {
    try {
      const org = await Organization.findById(organizationId);
      if (!org) {
        throw new Error('Organization not found');
      }

      if (org.subscription_status !== 'trial') {
        throw new Error('Organization is not on trial');
      }

      const currentTrialEnd = org.trial_end_date || new Date();
      const newTrialEnd = new Date(currentTrialEnd);
      newTrialEnd.setDate(newTrialEnd.getDate() + additionalDays);

      const updatedOrg = await Organization.findByIdAndUpdate(
        organizationId,
        { trial_end_date: newTrialEnd },
        { new: true }
      );

      console.log(`📅 Extended trial for ${updatedOrg.name} by ${additionalDays} days until ${newTrialEnd}`);

      return {
        success: true,
        organization: updatedOrg.name,
        previousTrialEnd: currentTrialEnd,
        newTrialEnd: newTrialEnd,
        additionalDays
      };
    } catch (error) {
      console.error('Error extending trial:', error);
      throw error;
    }
  }
}

export default new TrialManagementService();