/**
 * Feature-Driven Application Framework
 * This demonstrates how all application features should be controlled by license configuration
 * 
 * Key Principles:
 * 1. Every feature check goes through the database
 * 2. No hardcoded limits - all from license_feature_mapping
 * 3. Automatic trial expiry handling
 * 4. Graceful degradation for expired/limited users
 * 5. Clear upgrade paths and messaging
 */

import { hasFeatureAccess, checkFeatureLimit, incrementFeatureUsage } from '../services/subscriptionService.js';
import { Feature, LicenseFeature } from '../models.js';
import TrialManagementService from '../services/trialManagementService.js';

class FeatureDrivenController {
  
  /**
   * Get all available features for an organization with their status
   * This powers feature availability UI, upgrade prompts, and feature gates
   */
  async getOrganizationFeatures(organizationId) {
    try {
      // Check trial status first
      const trialStatus = await TrialManagementService.checkTrialStatus(organizationId);
      if (trialStatus.requiresDowngrade) {
        await TrialManagementService.downgradeExpiredTrial(organizationId);
      }

      // Get all system features
      const allFeatures = await Feature.find({ is_active: true }).sort({ category: 1, feature_code: 1 });
      
      const featureStatus = await Promise.all(
        allFeatures.map(async (feature) => {
          const accessCheck = await hasFeatureAccess(organizationId, feature.feature_code);
          let limitInfo = null;
          
          if (accessCheck.hasAccess) {
            const limitCheck = await checkFeatureLimit(organizationId, feature.feature_code);
            limitInfo = {
              canUse: limitCheck.canUse,
              currentUsage: limitCheck.currentUsage,
              limit: limitCheck.limit,
              isUnlimited: limitCheck.isUnlimited,
              limitPeriod: limitCheck.limitPeriod,
              resetDate: limitCheck.resetDate
            };
          }

          return {
            feature_code: feature.feature_code,
            name: feature.name,
            description: feature.description,
            category: feature.category,
            hasAccess: accessCheck.hasAccess,
            reason: accessCheck.reason,
            limits: limitInfo,
            upgradeRequired: !accessCheck.hasAccess
          };
        })
      );

      // Group by category for better organization
      const featuresByCategory = featureStatus.reduce((acc, feature) => {
        if (!acc[feature.category]) {
          acc[feature.category] = {
            category: feature.category,
            features: [],
            totalFeatures: 0,
            availableFeatures: 0
          };
        }
        
        acc[feature.category].features.push(feature);
        acc[feature.category].totalFeatures++;
        if (feature.hasAccess) {
          acc[feature.category].availableFeatures++;
        }
        
        return acc;
      }, {});

      return {
        organizationId,
        trialStatus: trialStatus.isTrialActive ? {
          daysRemaining: trialStatus.daysRemaining,
          endDate: trialStatus.trialEndDate,
          isExpiring: trialStatus.daysRemaining <= 3
        } : null,
        features: featuresByCategory,
        summary: {
          totalFeatures: allFeatures.length,
          availableFeatures: featureStatus.filter(f => f.hasAccess).length,
          upgradableFeatures: featureStatus.filter(f => !f.hasAccess).length
        }
      };
    } catch (error) {
      console.error('Error getting organization features:', error);
      throw error;
    }
  }

  /**
   * Feature-gated task creation example
   * Shows how to implement feature checks in business logic
   */
  async createTask(organizationId, taskData) {
    try {
      // Check basic task access
      const basicTaskAccess = await checkFeatureLimit(organizationId, 'TASK_BASIC');
      if (!basicTaskAccess.canUse) {
        return {
          success: false,
          error: 'TASK_BASIC_LIMIT_EXCEEDED',
          message: `You've reached your limit of ${basicTaskAccess.limit} basic tasks this ${basicTaskAccess.limitPeriod?.toLowerCase()}. Upgrade for more tasks.`,
          upgradeRequired: true,
          currentUsage: basicTaskAccess.currentUsage,
          limit: basicTaskAccess.limit,
          resetDate: basicTaskAccess.resetDate
        };
      }

      // Check sub-task feature if sub-tasks are being created
      if (taskData.subtasks && taskData.subtasks.length > 0) {
        const subTaskAccess = await checkFeatureLimit(organizationId, 'TASK_SUB');
        if (!subTaskAccess.canUse) {
          return {
            success: false,
            error: 'TASK_SUB_NOT_AVAILABLE',
            message: 'Sub-tasks are not available in your current plan. Upgrade to create sub-tasks.',
            upgradeRequired: true,
            feature: 'TASK_SUB'
          };
        }
      }

      // Check recurring task feature
      if (taskData.isRecurring) {
        const recurringAccess = await hasFeatureAccess(organizationId, 'TASK_RECUR');
        if (!recurringAccess.hasAccess) {
          return {
            success: false,
            error: 'TASK_RECUR_NOT_AVAILABLE',
            message: 'Recurring tasks are not available in your current plan. Upgrade to create recurring tasks.',
            upgradeRequired: true,
            feature: 'TASK_RECUR'
          };
        }
      }

      // Check approval workflow feature
      if (taskData.requiresApproval) {
        const approvalAccess = await hasFeatureAccess(organizationId, 'TASK_APPROVAL');
        if (!approvalAccess.hasAccess) {
          return {
            success: false,
            error: 'TASK_APPROVAL_NOT_AVAILABLE',
            message: 'Approval workflows are not available in your current plan. Upgrade to create approval tasks.',
            upgradeRequired: true,
            feature: 'TASK_APPROVAL'
          };
        }
      }

      // All checks passed - create the task
      // (Here you would implement the actual task creation logic)
      
      // Increment usage counter
      await incrementFeatureUsage(organizationId, 'TASK_BASIC');
      if (taskData.subtasks?.length > 0) {
        await incrementFeatureUsage(organizationId, 'TASK_SUB', taskData.subtasks.length);
      }

      return {
        success: true,
        message: 'Task created successfully',
        taskId: 'generated-task-id', // Would be actual task ID
        featuresUsed: ['TASK_BASIC', ...(taskData.subtasks?.length > 0 ? ['TASK_SUB'] : [])]
      };
    } catch (error) {
      console.error('Error creating feature-gated task:', error);
      throw error;
    }
  }

  /**
   * Feature-gated form creation example
   */
  async createForm(organizationId, formData) {
    try {
      const formAccess = await checkFeatureLimit(organizationId, 'FORM_CREATE');
      if (!formAccess.canUse) {
        return {
          success: false,
          error: 'FORM_CREATE_LIMIT_EXCEEDED',
          message: `You've reached your limit of ${formAccess.limit} forms this ${formAccess.limitPeriod?.toLowerCase()}. Upgrade for more forms.`,
          upgradeRequired: true,
          currentUsage: formAccess.currentUsage,
          limit: formAccess.limit
        };
      }

      // Form creation logic here...
      
      await incrementFeatureUsage(organizationId, 'FORM_CREATE');
      
      return {
        success: true,
        message: 'Form created successfully',
        formId: 'generated-form-id'
      };
    } catch (error) {
      console.error('Error creating feature-gated form:', error);
      throw error;
    }
  }

  /**
   * Generate report with feature checks
   */
  async generateReport(organizationId, reportType = 'basic') {
    try {
      let featureCode = reportType === 'basic' ? 'REPORT_BASIC' : 'REPORT_ADV';
      
      const reportAccess = await checkFeatureLimit(organizationId, featureCode);
      if (!reportAccess.canUse) {
        if (!reportAccess.hasAccess) {
          return {
            success: false,
            error: `${featureCode}_NOT_AVAILABLE`,
            message: `${reportType} reports are not available in your current plan. Upgrade to generate ${reportType} reports.`,
            upgradeRequired: true,
            feature: featureCode
          };
        } else {
          return {
            success: false,
            error: `${featureCode}_LIMIT_EXCEEDED`,
            message: `You've reached your limit of ${reportAccess.limit} ${reportType} reports this ${reportAccess.limitPeriod?.toLowerCase()}.`,
            upgradeRequired: true,
            currentUsage: reportAccess.currentUsage,
            limit: reportAccess.limit
          };
        }
      }

      // Report generation logic here...
      
      await incrementFeatureUsage(organizationId, featureCode);
      
      return {
        success: true,
        message: 'Report generated successfully',
        reportId: 'generated-report-id',
        reportType
      };
    } catch (error) {
      console.error('Error generating feature-gated report:', error);
      throw error;
    }
  }

  /**
   * API access check with rate limiting
   */
  async checkApiAccess(organizationId, apiCalls = 1) {
    try {
      const apiAccess = await checkFeatureLimit(organizationId, 'API_ACCESS');
      if (!apiAccess.canUse) {
        if (!apiAccess.hasAccess) {
          return {
            hasAccess: false,
            error: 'API_ACCESS_NOT_AVAILABLE',
            message: 'API access is not available in your current plan. Upgrade to access APIs.',
            upgradeRequired: true
          };
        } else {
          return {
            hasAccess: false,
            error: 'API_LIMIT_EXCEEDED',
            message: `You've reached your API limit of ${apiAccess.limit} calls this ${apiAccess.limitPeriod?.toLowerCase()}.`,
            currentUsage: apiAccess.currentUsage,
            limit: apiAccess.limit,
            resetDate: apiAccess.resetDate
          };
        }
      }

      return {
        hasAccess: true,
        remainingCalls: apiAccess.isUnlimited ? null : (apiAccess.limit - apiAccess.currentUsage),
        resetDate: apiAccess.resetDate
      };
    } catch (error) {
      console.error('Error checking API access:', error);
      throw error;
    }
  }

  /**
   * Get upgrade suggestions based on usage patterns
   */
  async getUpgradeSuggestions(organizationId) {
    try {
      const features = await this.getOrganizationFeatures(organizationId);
      const suggestions = [];

      // Analyze usage patterns and suggest upgrades
      Object.values(features.features).forEach(category => {
        category.features.forEach(feature => {
          if (!feature.hasAccess) {
            suggestions.push({
              type: 'feature_unavailable',
              feature: feature.feature_code,
              name: feature.name,
              description: feature.description,
              category: feature.category,
              message: `Upgrade to access ${feature.name}`
            });
          } else if (feature.limits && !feature.limits.isUnlimited) {
            const usagePercentage = (feature.limits.currentUsage / feature.limits.limit) * 100;
            if (usagePercentage > 80) {
              suggestions.push({
                type: 'approaching_limit',
                feature: feature.feature_code,
                name: feature.name,
                usage: feature.limits.currentUsage,
                limit: feature.limits.limit,
                percentage: usagePercentage,
                message: `You're using ${Math.round(usagePercentage)}% of your ${feature.name} limit`
              });
            }
          }
        });
      });

      return {
        organizationId,
        suggestions,
        hasUpgradeOpportunities: suggestions.length > 0,
        trialStatus: features.trialStatus
      };
    } catch (error) {
      console.error('Error getting upgrade suggestions:', error);
      throw error;
    }
  }
}

export default new FeatureDrivenController();