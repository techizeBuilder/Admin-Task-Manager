/**
 * Task Validation Utilities
 * Comprehensive validation for task operations and status transitions
 */

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  BLOCKED: 'blocked',
  IN_REVIEW: 'in-review',
  DONE: 'done',
  CANCELLED: 'cancelled'
};

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const TASK_TYPES = {
  STANDARD: 'standard',
  MILESTONE: 'milestone',
  APPROVAL: 'approval',
  RECURRING: 'recurring'
};

/**
 * Validate status transition rules
 */
export const validateStatusTransition = (currentStatus, newStatus, userRole, isAssignee, isCreator) => {
  const errors = [];

  // Define valid transitions
  const validTransitions = {
    [TASK_STATUSES.TODO]: [TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.CANCELLED],
    [TASK_STATUSES.IN_PROGRESS]: [TASK_STATUSES.TODO, TASK_STATUSES.BLOCKED, TASK_STATUSES.IN_REVIEW, TASK_STATUSES.DONE, TASK_STATUSES.CANCELLED],
    [TASK_STATUSES.BLOCKED]: [TASK_STATUSES.TODO, TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.CANCELLED],
    [TASK_STATUSES.IN_REVIEW]: [TASK_STATUSES.IN_PROGRESS, TASK_STATUSES.DONE, TASK_STATUSES.TODO],
    [TASK_STATUSES.DONE]: [TASK_STATUSES.IN_REVIEW], // Can reopen for review
    [TASK_STATUSES.CANCELLED]: [] // Cannot transition from cancelled
  };

  // Check if transition is valid
  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    errors.push(`Cannot transition from ${currentStatus} to ${newStatus}`);
  }

  // Role-based restrictions
  if (newStatus === TASK_STATUSES.DONE) {
    // Only assignee or admin can mark as done
    if (!isAssignee && !['admin', 'manager'].includes(userRole)) {
      errors.push('Only the assignee or managers can mark a task as completed');
    }
  }

  if (newStatus === TASK_STATUSES.CANCELLED) {
    // Only creator or admin can cancel
    if (!isCreator && !['admin', 'manager'].includes(userRole)) {
      errors.push('Only the creator or managers can cancel a task');
    }
  }

  if (newStatus === TASK_STATUSES.IN_REVIEW) {
    // Only assignee can request review
    if (!isAssignee) {
      errors.push('Only the assignee can request a review');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate task before deletion
 */
export const validateTaskDeletion = (task, subtasks = [], userRole, isCreator) => {
  const errors = [];

  // Check for incomplete subtasks
  const incompleteSubtasks = subtasks.filter(s => s.status !== TASK_STATUSES.DONE);
  if (incompleteSubtasks.length > 0) {
    errors.push(`Cannot delete task with ${incompleteSubtasks.length} incomplete subtasks`);
  }

  // Check if task is a milestone with dependencies
  if (task.type === TASK_TYPES.MILESTONE && task.dependentTasks?.length > 0) {
    errors.push('Cannot delete milestone task with dependent tasks');
  }

  // Role-based deletion rules
  if (task.status === TASK_STATUSES.DONE && !['admin'].includes(userRole)) {
    errors.push('Cannot delete completed tasks');
  }

  if (!isCreator && !['admin', 'manager'].includes(userRole)) {
    errors.push('Only the creator or managers can delete this task');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate file upload
 */
export const validateFileUpload = (file, maxSizeBytes = 10 * 1024 * 1024) => {
  const errors = [];

  // File size validation
  if (file.size > maxSizeBytes) {
    errors.push(`File size must be less than ${maxSizeBytes / (1024 * 1024)}MB`);
  }

  // File type validation (basic)
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-zip-compressed'
  ];

  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not supported');
  }

  // File name validation
  if (file.name.length > 255) {
    errors.push('File name too long');
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(file.name.replace(/\.[^/.]+$/, ""))) {
    errors.push('File name contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate comment content
 */
export const validateComment = (content, maxLength = 1000) => {
  const errors = [];

  if (!content || content.trim().length === 0) {
    errors.push('Comment content is required');
  }

  if (content.length > maxLength) {
    errors.push(`Comment must be less than ${maxLength} characters`);
  }

  // Basic content validation (no script tags, etc.)
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(content)) {
    errors.push('Comment contains invalid content');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate task assignment
 */
export const validateTaskAssignment = (assigneeId, users, currentUserRole, organizationId) => {
  const errors = [];

  if (!assigneeId) {
    errors.push('Assignee is required');
    return { isValid: false, errors };
  }

  const assignee = users.find(u => u.id === assigneeId);
  if (!assignee) {
    errors.push('Invalid assignee selected');
    return { isValid: false, errors };
  }

  // Check if assignee is in same organization (for org users)
  if (organizationId && assignee.organizationId !== organizationId) {
    errors.push('Cannot assign to users outside your organization');
  }

  // Role-based assignment rules
  if (currentUserRole === 'employee' && assignee.id !== assigneeId) {
    errors.push('Employees can only assign tasks to themselves');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate task dates
 */
export const validateTaskDates = (startDate, dueDate) => {
  const errors = [];

  if (startDate && dueDate) {
    const start = new Date(startDate);
    const due = new Date(dueDate);

    if (start >= due) {
      errors.push('Start date must be before due date');
    }
  }

  if (dueDate) {
    const due = new Date(dueDate);
    const now = new Date();
    
    // Allow past due dates for existing tasks, but warn for new tasks
    if (due < now) {
      errors.push('Due date cannot be in the past');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate task priority based on user role
 */
export const validateTaskPriority = (priority, userRole) => {
  const errors = [];

  if (!Object.values(TASK_PRIORITIES).includes(priority)) {
    errors.push('Invalid priority selected');
  }

  // Only managers and above can set critical priority
  if (priority === TASK_PRIORITIES.CRITICAL && !['manager', 'admin'].includes(userRole)) {
    errors.push('Only managers and above can set critical priority');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Comprehensive task validation
 */
export const validateTask = (taskData, userRole, organizationId, users = []) => {
  const allErrors = [];

  // Validate dates
  const dateValidation = validateTaskDates(taskData.startDate, taskData.dueDate);
  allErrors.push(...dateValidation.errors);

  // Validate priority
  const priorityValidation = validateTaskPriority(taskData.priority, userRole);
  allErrors.push(...priorityValidation.errors);

  // Validate assignment if provided
  if (taskData.assigneeId) {
    const assignmentValidation = validateTaskAssignment(
      taskData.assigneeId, 
      users, 
      userRole, 
      organizationId
    );
    allErrors.push(...assignmentValidation.errors);
  }

  // Basic field validation
  if (!taskData.title || taskData.title.trim().length === 0) {
    allErrors.push('Task title is required');
  }

  if (taskData.title && taskData.title.length > 255) {
    allErrors.push('Task title must be less than 255 characters');
  }

  if (taskData.description && taskData.description.length > 5000) {
    allErrors.push('Task description must be less than 5000 characters');
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

export default {
  validateStatusTransition,
  validateTaskDeletion,
  validateFileUpload,
  validateComment,
  validateTaskAssignment,
  validateTaskDates,
  validateTaskPriority,
  validateTask,
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_TYPES
};