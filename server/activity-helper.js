import mongoose from "mongoose";

// Activity Helper Functions for comprehensive tracking
export class ActivityHelper {
  
  // Activity type constants with icons
  static ACTIVITY_TYPES = {
    // Task activities
    TASK_CREATED: { type: 'task_created', icon: '➕', category: 'task' },
    TASK_UPDATED: { type: 'task_updated', icon: '✏️', category: 'task' },
    TASK_DELETED: { type: 'task_deleted', icon: '🗑️', category: 'task' },
    TASK_STATUS_CHANGED: { type: 'task_status_changed', icon: '🔄', category: 'task' },
    TASK_PRIORITY_CHANGED: { type: 'task_priority_changed', icon: '⚡', category: 'task' },
    TASK_ASSIGNED: { type: 'task_assigned', icon: '👤', category: 'task' },
    TASK_UNASSIGNED: { type: 'task_unassigned', icon: '❌', category: 'task' },
    TASK_DUE_DATE_CHANGED: { type: 'task_due_date_changed', icon: '📅', category: 'task' },
    TASK_COMPLETED: { type: 'task_completed', icon: '✅', category: 'task' },
    TASK_REOPENED: { type: 'task_reopened', icon: '🔓', category: 'task' },
    
    // Subtask activities
    SUBTASK_CREATED: { type: 'subtask_created', icon: '📝', category: 'subtask' },
    SUBTASK_UPDATED: { type: 'subtask_updated', icon: '✏️', category: 'subtask' },
    SUBTASK_DELETED: { type: 'subtask_deleted', icon: '🗑️', category: 'subtask' },
    SUBTASK_COMPLETED: { type: 'subtask_completed', icon: '✅', category: 'subtask' },
    SUBTASK_STATUS_CHANGED: { type: 'subtask_status_changed', icon: '🔄', category: 'subtask' },
    
    // Comment activities
    COMMENT_ADDED: { type: 'comment_added', icon: '💬', category: 'comment' },
    COMMENT_UPDATED: { type: 'comment_updated', icon: '✏️', category: 'comment' },
    COMMENT_DELETED: { type: 'comment_deleted', icon: '🗑️', category: 'comment' },
    
    // Approval activities
    APPROVAL_REQUESTED: { type: 'approval_requested', icon: '🔍', category: 'approval' },
    APPROVAL_APPROVED: { type: 'approval_approved', icon: '✅', category: 'approval' },
    APPROVAL_REJECTED: { type: 'approval_rejected', icon: '❌', category: 'approval' },
    
    // File activities
    FILE_ATTACHED: { type: 'file_attached', icon: '📎', category: 'file' },
    FILE_REMOVED: { type: 'file_removed', icon: '🗑️', category: 'file' },
    
    // Project activities
    PROJECT_CREATED: { type: 'project_created', icon: '📁', category: 'project' },
    PROJECT_UPDATED: { type: 'project_updated', icon: '✏️', category: 'project' },
    PROJECT_ARCHIVED: { type: 'project_archived', icon: '📦', category: 'project' },
    
    // User activities
    USER_JOINED: { type: 'user_joined', icon: '👋', category: 'user' },
    USER_LEFT: { type: 'user_left', icon: '👋', category: 'user' },
    ROLE_CHANGED: { type: 'role_changed', icon: '🔑', category: 'user' }
  };

  /**
   * Generate activity description based on type and data
   */
  static generateDescription(activityType, data = {}) {
    const { taskTitle, oldValue, newValue, userName, assignedTo, comment, fileName } = data;
    
    switch(activityType.type) {
      case 'task_created':
        return `Task "${taskTitle}" was created`;
      
      case 'task_updated':
        return `Task "${taskTitle}" was updated`;
      
      case 'task_deleted':
        return `Task "${taskTitle}" was deleted`;
      
      case 'task_status_changed':
        return `Task "${taskTitle}" status changed from "${oldValue}" to "${newValue}"`;
      
      case 'task_priority_changed':
        return `Task "${taskTitle}" priority changed from "${oldValue}" to "${newValue}"`;
      
      case 'task_assigned':
        return `Task "${taskTitle}" was assigned to ${assignedTo}`;
      
      case 'task_unassigned':
        return `Task "${taskTitle}" was unassigned from ${assignedTo}`;
      
      case 'task_due_date_changed':
        return `Task "${taskTitle}" due date changed to ${newValue}`;
      
      case 'task_completed':
        return `Task "${taskTitle}" was marked as completed`;
      
      case 'task_reopened':
        return `Task "${taskTitle}" was reopened`;
      
      case 'subtask_created':
        return `Subtask "${data.subtaskTitle}" was created in task "${taskTitle}"`;
      
      case 'subtask_updated':
        return `Subtask "${data.subtaskTitle}" was updated in task "${taskTitle}"`;
      
      case 'subtask_deleted':
        return `Subtask "${data.subtaskTitle}" was deleted from task "${taskTitle}"`;
      
      case 'subtask_completed':
        return `Subtask "${data.subtaskTitle}" was completed in task "${taskTitle}"`;
      
      case 'subtask_status_changed':
        return `Subtask "${data.subtaskTitle}" status changed from "${oldValue}" to "${newValue}"`;
      
      case 'comment_added':
        return `Comment was added to task "${taskTitle}"`;
      
      case 'comment_updated':
        return `Comment was updated in task "${taskTitle}"`;
      
      case 'comment_deleted':
        return `Comment was deleted from task "${taskTitle}"`;
      
      case 'approval_requested':
        return `Approval was requested for task "${taskTitle}"`;
      
      case 'approval_approved':
        return `Task "${taskTitle}" was approved`;
      
      case 'approval_rejected':
        return `Task "${taskTitle}" approval was rejected`;
      
      case 'file_attached':
        return `File "${fileName}" was attached to task "${taskTitle}"`;
      
      case 'file_removed':
        return `File "${fileName}" was removed from task "${taskTitle}"`;
      
      case 'project_created':
        return `Project "${data.projectName}" was created`;
      
      case 'project_updated':
        return `Project "${data.projectName}" was updated`;
      
      case 'project_archived':
        return `Project "${data.projectName}" was archived`;
      
      case 'user_joined':
        return `${userName} joined the organization`;
      
      case 'user_left':
        return `${userName} left the organization`;
      
      case 'role_changed':
        return `${userName} role changed from "${oldValue}" to "${newValue}"`;
      
      default:
        return `Activity performed on ${data.entityType || 'item'}`;
    }
  }

  /**
   * Create activity data object
   */
  static createActivityData({
    activityType,
    userId,
    organizationId,
    relatedId,
    relatedType,
    data = {}
  }) {
    const description = this.generateDescription(activityType, data);
    
    return {
      type: activityType.type,
      description,
      user: userId,
      organization: organizationId,
      relatedId,
      relatedType,
      metadata: {
        icon: activityType.icon,
        category: activityType.category,
        data,
        timestamp: new Date()
      }
    };
  }

  /**
   * Format activity for display in feed
   */
  static formatActivityForFeed(activity, user = null) {
    return {
      id: activity._id,
      type: activity.type,
      description: activity.description,
      icon: activity.metadata?.icon || '📝',
      category: activity.metadata?.category || 'general',
      user: user ? {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      } : null,
      timestamp: activity.createdAt,
      relatedId: activity.relatedId,
      relatedType: activity.relatedType,
      metadata: activity.metadata || {}
    };
  }

  /**
   * Get activity type by string
   */
  static getActivityType(typeString) {
    return Object.values(this.ACTIVITY_TYPES).find(type => type.type === typeString);
  }

  /**
   * Create comparison data for update activities
   */
  static createComparisonData(oldData, newData, fields = []) {
    const changes = {};
    
    for (const field of fields) {
      if (oldData[field] !== newData[field]) {
        changes[field] = {
          old: oldData[field],
          new: newData[field]
        };
      }
    }
    
    return changes;
  }
}

export default ActivityHelper;