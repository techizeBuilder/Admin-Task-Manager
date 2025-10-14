import { storage } from "../mongodb-storage.js";
import { calculateNextDueDate, getTaskTypeLabel, getTaskOrganizationId, createNextRecurringOccurrence } from "../utils/helperFunction.js";
import { User } from "../modals/userModal.js";
import Task from "../modals/taskModal.js";

// 🎨 Centralized Status Color Mapping for TaskSetu
// Based on Tasksetu Requirement Specification (Module 4.7 – Task Status Management)
const STATUS_COLOR_MAP = {
  // Core Task Statuses
  'open': '#3B82F6',           // Blue - Task created, work not started
  'in-progress': '#F59E0B',    // Yellow/Orange - Actively working
  'in_progress': '#F59E0B',    // Alternative format
  'INPROGRESS': '#F59E0B',     // Database format
  'on-hold': '#6B7280',        // Gray - Temporarily paused
  'ONHOLD': '#6B7280',         // Database format
  'completed': '#10B981',      // Green - Successfully finished
  'done': '#10B981',           // Alternative format
  'cancelled': '#EF4444',      // Red - Intentionally terminated
  'rejected': '#DC2626',       // Dark Red - Rejected/declined
  
  // Review & Approval Statuses
  'review': '#8B5CF6',         // Purple - Under review
  'pending': '#F97316',        // Orange - Waiting for action
  'approved': '#059669',       // Dark Green - Approved
  'partially_approved': '#8B5CF6', // Purple - Some approvals received
  'pending_approval': '#F59E0B',    // Orange - Waiting for approval
  'auto_approved': '#6366F1',       // Indigo - System auto-approved
  
  // Additional Common Statuses
  'todo': '#9CA3AF',           // Light Gray - To do
  'new': '#3B82F6',            // Blue - Newly created
  'active': '#F59E0B',         // Orange - Currently active
  'blocked': '#F59E0B',        // Orange - Blocked by dependency
  'overdue': '#DC2626',        // Red - Past due date
  'paused': '#6B7280',         // Gray - Paused
  'closed': '#10B981',         // Green - Closed/finished
  
  // Priority Status Colors (if needed)
  'low': '#22C55E',            // Green - Low priority
  'medium': '#F59E0B',         // Orange - Medium priority
  'high': '#F97316',           // Dark Orange - High priority
  'critical': '#EF4444',       // Red - Critical priority
  
  // Task Type Colors (if needed)
  'regular': '#3B82F6',        // Blue
  'recurring': '#8B5CF6',      // Violet
  'milestone': '#F97316',      // Orange
  'approval': '#059669'        // Emerald
};

// Helper: recalc assigned/completed counters for a user (counts non-deleted tasks; includes subtasks)
async function recalcUserTaskCounters(userId) {
  try {
    if (!userId) return;
    const uid = userId.toString ? userId.toString() : userId;
    const assignedCount = await Task.countDocuments({
      assignedTo: uid,
      isDeleted: { $ne: true }
    });
    const completedCount = await Task.countDocuments({
      assignedTo: uid,
      status: "completed",
      isDeleted: { $ne: true }
    });
    await User.findByIdAndUpdate(uid, {
      assignedTasks: assignedCount,
      completedTasks: completedCount
    });
  } catch (err) {
    console.error("recalcUserTaskCounters error:", { userId, error: err.message });
  }
}

export const createTask = async (req, res) => {
  try {
    const user = req.user;
    const taskData = req.body;

    // Parse JSON fields
    const parsedTaskData = {
      ...taskData,
      tags: taskData.tags ? JSON.parse(taskData.tags) : [],
      collaboratorIds: taskData.collaboratorIds ? JSON.parse(taskData.collaboratorIds) : [],
      dependsOnTaskIds: taskData.dependsOnTaskIds
        ? (typeof taskData.dependsOnTaskIds === "string"
          ? JSON.parse(taskData.dependsOnTaskIds)
          : taskData.dependsOnTaskIds)
        : [],
      recurrencePattern: taskData.recurrencePattern ? JSON.parse(taskData.recurrencePattern) : null,
      milestoneData: taskData.milestoneData ? JSON.parse(taskData.milestoneData) : null,
      approvalData: taskData.approvalData ? JSON.parse(taskData.approvalData) : null,
      approverIds: taskData.approverIds ? JSON.parse(taskData.approverIds) : [],
      linkedTaskIds: taskData.linkedTaskIds ? JSON.parse(taskData.linkedTaskIds) : []
    };

    // Handle attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.originalname,
        filename: file.filename,
        size: file.size,
        type: file.mimetype,
        url: `/uploads/task-attachments/${file.filename}`
      }));
    }

    console.log('DEBUG - parsedTaskData.createdByRole:', parsedTaskData.createdByRole);
    console.log('DEBUG - user.role:', user.role);
    console.log('DEBUG - user.role type:', typeof user.role);

    // Determine the createdByRole - prefer request data, then handle user role array
    let createdByRole = parsedTaskData.createdByRole;
    if (!createdByRole) {
      if (Array.isArray(user.role)) {
        // If user has multiple roles, pick the highest priority one
        const rolePriority = ["super_admin", "org_admin", "manager", "employee", "individual"];
        createdByRole = user.role.find(role => rolePriority.includes(role)) || "employee";
      } else {
        createdByRole = user.role || "employee";
      }
    }

    console.log('DEBUG - final createdByRole:', createdByRole);


    // Base Task (with improved recurring logic)
    let baseTask = {
      title: parsedTaskData.title,
      description: parsedTaskData.description || "",
      createdBy: user.id,
      createdByRole: createdByRole,
      assignedTo: parsedTaskData.assignedTo || user.id,
      status: parsedTaskData.status || "open",
      priority: parsedTaskData.priority || "medium",
      dueDate: parsedTaskData.dueDate ? new Date(parsedTaskData.dueDate) : null,
      startDate: parsedTaskData.startDate ? new Date(parsedTaskData.startDate) : null,
      taskType: parsedTaskData.taskType || "regular",
      mainTaskType: parsedTaskData.mainTaskType || parsedTaskData.taskType,
      taskTypeAdvanced: parsedTaskData.taskTypeAdvanced || "simple",
      tags: parsedTaskData.tags,
      category: parsedTaskData.category,
      visibility: parsedTaskData.visibility || "private",
      collaborators: parsedTaskData.collaboratorIds,
      dependencies:
        parsedTaskData.dependsOnTaskIds && parsedTaskData.dependsOnTaskIds.length > 0
          ? parsedTaskData.dependsOnTaskIds
          : [],
      attachments: attachments,
      customFields: {},
      referenceProcess: parsedTaskData.referenceProcess || null,
      customForm: parsedTaskData.customForm || null,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (user.organizationId) {
      baseTask.organization = user.organizationId;
    }

    // Task type specific fields
    switch (parsedTaskData.taskType) {
      case "recurring": {
        baseTask.isRecurring = true;
        baseTask.recurrencePattern = parsedTaskData.recurrencePattern;

        // If dueDate is missing, try to set from startDate or today
        if (!baseTask.dueDate) {
          if (baseTask.startDate) {
            baseTask.dueDate = new Date(baseTask.startDate);
          } else {
            baseTask.dueDate = new Date();
          }
        }

        // Calculate nextDueDate using enhanced logic
        if (baseTask.recurrencePattern) {
          baseTask.nextDueDate = calculateNextDueDate(
            baseTask.recurrencePattern,
            baseTask.dueDate,
            baseTask.recurrencePattern.anchorField || 'startDate'
          );
        } else {
          baseTask.nextDueDate = null;
        }

        // Debug log
        console.log('🔄 Recurring Task Created (improved):', {
          title: baseTask.title,
          startDate: baseTask.startDate,
          dueDate: baseTask.dueDate,
          nextDueDate: baseTask.nextDueDate,
          frequency: baseTask.recurrencePattern?.frequency,
          interval: baseTask.recurrencePattern?.interval,
          anchorField: baseTask.recurrencePattern?.anchorField || 'startDate'
        });
        break;
      }
      case "milestone":
        baseTask.isMilestone = true;
        baseTask.milestoneType = parsedTaskData.milestoneType || "standalone";
        baseTask.milestoneData = parsedTaskData.milestoneData;
        if (parsedTaskData.linkedTaskIds && parsedTaskData.linkedTaskIds.length > 0) {
          baseTask.linkedTasks = parsedTaskData.linkedTaskIds;
        }
        break;
      case "approval":
        baseTask.isApprovalTask = true;
        baseTask.approvalMode = parsedTaskData.approvalMode || "any";
        baseTask.approvalStatus = "pending";
        baseTask.approvers = parsedTaskData.approverIds || [];
        baseTask.autoApproveEnabled = parsedTaskData.autoApproveEnabled || false;
        baseTask.autoApproveAfter = parsedTaskData.autoApproveAfter;
        break;
    }

    // Save task
    const createdTask = await storage.createTask(baseTask);

    // 🔄 Enhanced Debug: Log created task details with complete analysis
    if (createdTask.isRecurring) {
      console.log('🔄 === RECURRING TASK CREATION ANALYSIS ===');
      console.log('🔄 Task Created Successfully:', {
        taskId: createdTask._id,
        title: createdTask.title,
        isRecurring: createdTask.isRecurring,
        taskType: createdTask.taskType,
        
        // Due Date Analysis
        originalDueDate: createdTask.dueDate,
        originalDueDateType: typeof createdTask.dueDate,
        originalDueDateValue: createdTask.dueDate ? createdTask.dueDate.toString() : 'NULL',
        
        nextDueDate: createdTask.nextDueDate,
        nextDueDateType: typeof createdTask.nextDueDate,
        nextDueDateValue: createdTask.nextDueDate ? createdTask.nextDueDate.toString() : 'NULL',
        
        // Pattern Analysis
        recurrencePattern: createdTask.recurrencePattern,
        frequency: createdTask.recurrencePattern?.frequency,
        interval: createdTask.recurrencePattern?.interval,
        anchorField: createdTask.recurrencePattern?.anchorField,
        
        // Validation
        hasValidDueDate: !!createdTask.dueDate,
        hasValidNextDueDate: !!createdTask.nextDueDate,
        hasValidPattern: !!createdTask.recurrencePattern,
        
        // Frontend Display Logic Test
        displayDateForFrontend: createdTask.nextDueDate || createdTask.dueDate,
        shouldShowInTable: !!(createdTask.nextDueDate || createdTask.dueDate),
        
        // MongoDB State
        mongoState: {
          _id: createdTask._id,
          dueDate: createdTask.dueDate,
          nextDueDate: createdTask.nextDueDate,
          isRecurring: createdTask.isRecurring
        }
      });
      
      // Additional validation checks
      if (!createdTask.dueDate && !createdTask.nextDueDate) {
        console.log('⚠️  WARNING: Recurring task created without any due date!');
      }
      
      if (!createdTask.recurrencePattern) {
        console.log('⚠️  WARNING: Recurring task created without recurrence pattern!');
      }
      
      console.log('🔄 === END RECURRING TASK CREATION ANALYSIS ===');
    } else {
      // Also log regular tasks for comparison
      console.log('📝 Regular Task Created:', {
        taskId: createdTask._id,
        title: createdTask.title,
        taskType: createdTask.taskType,
        dueDate: createdTask.dueDate,
        hasDueDate: !!createdTask.dueDate
      });
    }

    // If approval task, create approval records
    if (parsedTaskData.taskType === "approval" && parsedTaskData.approverIds) {
      for (const approverId of parsedTaskData.approverIds) {
        await storage.createTaskApproval({
          taskId: createdTask._id,
          approverId: approverId,
          status: "pending",
          createdAt: new Date()
        });
      }
    }

    // Recalculate counters for assignee
    await recalcUserTaskCounters(createdTask?.assignedTo);

    res.status(201).json({
      success: true,
      message: `${getTaskTypeLabel(parsedTaskData.taskType)} created successfully`,
      task: createdTask
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message
    });
  }
};

export const createSubtask = async (req, res) => {
  try {
    const user = req.user;
    const { parentTaskId } = req.params;
    const taskData = req.body;

    // Validate parent task exists
    const parentTask = await storage.getTaskById(parentTaskId);
    if (!parentTask) {
      return res.status(404).json({
        success: false,
        message: 'Parent task not found'
      });
    }

    // Check if user has permission to create subtask for this parent task
    if (parentTask.organization && user.organizationId) {
      const taskOrgId = getTaskOrganizationId(parentTask.organization);
      const userOrgId = user.organizationId?.toString() || user.organizationId;

      if (taskOrgId !== userOrgId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (!parentTask.organization && !user.organizationId) {
      // For individual users without organization, check if they created the parent task
      if (parentTask.createdBy && user.id && parentTask.createdBy.toString() !== user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Parse JSON fields
    const parsedTaskData = {
      ...taskData,
      tags: taskData.tags ? JSON.parse(taskData.tags) : [],
      collaboratorIds: taskData.collaboratorIds ? JSON.parse(taskData.collaboratorIds) : [],
      dependsOnTaskIds: taskData.dependsOnTaskIds
        ? (typeof taskData.dependsOnTaskIds === "string"
          ? JSON.parse(taskData.dependsOnTaskIds)
          : taskData.dependsOnTaskIds)
        : []
    };

    // Handle attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.originalname,
        filename: file.filename,
        size: file.size,
        type: file.mimetype,
        url: `/uploads/task-attachments/${file.filename}`
      }));
    }

    // Determine the createdByRole
    let createdByRole = parsedTaskData.createdByRole;
    if (!createdByRole) {
      if (Array.isArray(user.role)) {
        const rolePriority = ["super_admin", "org_admin", "manager", "employee", "individual"];
        createdByRole = user.role.find(role => rolePriority.includes(role)) || "employee";
      } else {
        createdByRole = user.role || "employee";
      }
    }

    // Create subtask with parent task reference
    const subtaskData = {
      title: parsedTaskData.title,
      description: parsedTaskData.description || "",
      createdBy: user.id,
      createdByRole: createdByRole,
      assignedTo: parsedTaskData.assignedTo || user.id,
      status: parsedTaskData.status || "open",
      priority: parsedTaskData.priority || "medium",
      dueDate: parsedTaskData.dueDate ? new Date(parsedTaskData.dueDate) : null,
      startDate: parsedTaskData.startDate ? new Date(parsedTaskData.startDate) : null,
      taskType: "subtask",
      mainTaskType: "subtask",
      taskTypeAdvanced: "simple",
      parentTaskId: parentTaskId, // Reference to parent task
      tags: parsedTaskData.tags,
      category: parsedTaskData.category,
      visibility: parsedTaskData.visibility || "private",
      collaborators: parsedTaskData.collaboratorIds,
      dependencies: parsedTaskData.dependsOnTaskIds && parsedTaskData.dependsOnTaskIds.length > 0
        ? parsedTaskData.dependsOnTaskIds : [],
      attachments: attachments,
      customFields: {},
      referenceProcess: parsedTaskData.referenceProcess || null,
      customForm: parsedTaskData.customForm || null,
      isSubtask: true,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Inherit organization from parent task
    if (parentTask.organization) {
      subtaskData.organization = parentTask.organization;
    }

    // Save subtask
    const createdSubtask = await storage.createTask(subtaskData);

    // Recalculate counters for subtask assignee
    await recalcUserTaskCounters(createdSubtask?.assignedTo);

    res.status(201).json({
      success: true,
      message: "Subtask created successfully",
      subtask: createdSubtask,
      parentTask: {
        _id: parentTask._id,
        title: parentTask.title
      }
    });
  } catch (error) {
    console.error("Error creating subtask:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subtask",
      error: error.message
    });
  }
};

export const getSubtasks = async (req, res) => {
  try {
    const user = req.user;
    const { parentTaskId } = req.params;
    const {
      status,
      priority,
      page = 1,
      limit = 50,
      search
    } = req.query;

    // Validate parent task exists and user has access
    const parentTask = await storage.getTaskById(parentTaskId);
    if (!parentTask) {
      return res.status(404).json({
        success: false,
        message: 'Parent task not found'
      });
    }

    // Check permissions
    if (parentTask.organization && user.organizationId) {
      const taskOrgId = getTaskOrganizationId(parentTask.organization);
      const userOrgId = user.organizationId?.toString() || user.organizationId;

      if (taskOrgId !== userOrgId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (!parentTask.organization && !user.organizationId) {
      if (parentTask.createdBy && user.id && parentTask.createdBy.toString() !== user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Build filter for subtasks
    const filter = {
      parentTaskId: parentTaskId,
      isSubtask: true,
      isDeleted: { $ne: true }
    };

    // Apply additional filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get subtasks
    const subtasks = await storage.getTasksByFilter(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    });

    // Count total subtasks for pagination
    const totalSubtasks = await storage.countTasksByFilter(filter);
    const totalPages = Math.ceil(totalSubtasks / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    res.json({
      success: true,
      message: 'Subtasks retrieved successfully',
      data: {
        parentTask: {
          _id: parentTask._id,
          title: parentTask.title,
          status: parentTask.status
        },
        subtasks: subtasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalSubtasks,
          hasNextPage: hasNext,
          hasPrevPage: hasPrev,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching subtasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subtasks',
      error: error.message
    });
  }
};

export const updateSubtask = async (req, res) => {
  try {
    const { parentTaskId, subtaskId } = req.params;
    const user = req.user;
    const updates = req.body;

    // Validate parent task exists and user has access
    const parentTask = await storage.getTaskById(parentTaskId);
    if (!parentTask) {
      return res.status(404).json({
        success: false,
        message: 'Parent task not found'
      });
    }

    // Check parent task permissions
    if (parentTask.organization && user.organizationId) {
      const taskOrgId = getTaskOrganizationId(parentTask.organization);
      const userOrgId = user.organizationId?.toString() || user.organizationId;

      if (taskOrgId !== userOrgId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (!parentTask.organization && !user.organizationId) {
      if (parentTask.createdBy && user.id && parentTask.createdBy.toString() !== user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Get and validate subtask
    const subtask = await storage.getTaskById(subtaskId);
    if (!subtask || !subtask.isSubtask || subtask.parentTaskId?.toString() !== parentTaskId) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found or does not belong to this parent task'
      });
    }

    // Track previous assignee for counter adjustments
    const prevAssignee = subtask.assignedTo?.toString();

    // Prepare update data
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    if (updates.dueDate) updateData.dueDate = new Date(updates.dueDate);
    if (updates.startDate) updateData.startDate = new Date(updates.startDate);

    // Update subtask
    const updatedSubtask = await storage.updateTask(subtaskId, updateData, user.id);

    // Recalculate counters for affected users (old and new assignee if changed)
    const newAssignee = (updates.assignedTo || updatedSubtask?.assignedTo || prevAssignee);
    await recalcUserTaskCounters(prevAssignee);
    await recalcUserTaskCounters(newAssignee);

    res.json({
      success: true,
      message: 'Subtask updated successfully',
      data: {
        subtask: updatedSubtask,
        parentTask: {
          _id: parentTask._id,
          title: parentTask.title
        }
      }
    });

  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subtask',
      error: error.message
    });
  }
};

export const deleteSubtask = async (req, res) => {
  try {
    const { parentTaskId, subtaskId } = req.params;
    const user = req.user;

    console.log('=== DELETE SUBTASK DEBUG ===');
    console.log('Parent Task ID:', parentTaskId);
    console.log('Subtask ID to delete:', subtaskId);
    console.log('User attempting delete:', { id: user.id, organizationId: user.organizationId });

    // Validate parent task exists and user has access
    const parentTask = await storage.getTaskById(parentTaskId);
    if (!parentTask) {
      console.log('Parent task not found');
      return res.status(404).json({
        success: false,
        message: 'Parent task not found'
      });
    }

    console.log('Found parent task:', {
      id: parentTask._id,
      title: parentTask.title,
      organization: parentTask.organization
    });

    // Check parent task permissions
    if (parentTask.organization && user.organizationId) {
      const taskOrgId = getTaskOrganizationId(parentTask.organization);
      const userOrgId = user.organizationId?.toString() || user.organizationId;
      console.log('Organization check:', { taskOrgId, userOrgId, match: taskOrgId === userOrgId });

      if (taskOrgId !== userOrgId) {
        console.log('Access denied: Organization mismatch');
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (!parentTask.organization && !user.organizationId) {
      const taskCreatedBy = parentTask.createdBy?.toString();
      const userId = user.id?.toString();
      console.log('Individual user check:', { taskCreatedBy, userId, match: taskCreatedBy === userId });

      if (parentTask.createdBy && user.id && taskCreatedBy !== userId) {
        console.log('Access denied: Not the creator');
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Get and validate subtask
    const subtask = await storage.getTaskById(subtaskId);
    console.log('Found subtask:', subtask ? {
      id: subtask._id,
      title: subtask.title,
      parentTaskId: subtask.parentTaskId,
      isSubtask: subtask.isSubtask,
      isDeleted: subtask.isDeleted
    } : 'Not found');

    if (!subtask || !subtask.isSubtask || subtask.parentTaskId?.toString() !== parentTaskId) {
      console.log('Subtask validation failed');
      return res.status(404).json({
        success: false,
        message: 'Subtask not found or does not belong to this parent task'
      });
    }

    console.log('Permissions passed, proceeding with soft delete...');

    // Keep assignee for counter recalculation
    const assignee = subtask?.assignedTo;

    // Soft delete subtask
    const updateResult = await storage.updateTask(subtaskId, {
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date()
    }, user.id);

    console.log('Subtask soft delete result:', updateResult);
    console.log('=== DELETE SUBTASK COMPLETE ===');

    // Recalculate counters for subtask assignee after delete
    await recalcUserTaskCounters(assignee);

    res.json({
      success: true,
      message: 'Subtask deleted successfully',
      data: {
        deletedSubtaskId: subtaskId,
        parentTask: {
          _id: parentTask._id,
          title: parentTask.title
        }
      }
    });

  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subtask',
      error: error.message
    });
  }
};

// Subtask Comment Functions
export const addSubtaskComment = async (req, res) => {
  try {
    const { parentTaskId, subtaskId } = req.params;
    const { content, comment, mentions, parentId } = req.body;
    const user = req.user;

    // Handle both 'content' and 'comment' fields for compatibility
    const commentContent = content || comment;

    console.log('DEBUG - addSubtaskComment called:', {
      parentTaskId,
      subtaskId,
      userId: user.id,
      content: commentContent,
      rawBody: req.body,
      hasContent: !!content,
      hasComment: !!comment
    }); if (!commentContent || commentContent.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Get parent task to check permissions
    const parentTask = await storage.getTaskById(parentTaskId);
    if (!parentTask) {
      return res.status(404).json({
        success: false,
        message: 'Parent task not found'
      });
    }

    // Get subtask to validate it exists and belongs to parent
    const subtask = await storage.getTaskById(subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    // Check if user has permission to comment
    const canComment = checkCommentPermission(user, parentTask);
    if (!canComment) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to comment on this subtask'
      });
    }

    // Create comment object for MongoDB
    const newComment = {
      _id: new Date().getTime().toString(),
      content: commentContent.trim(),
      author: {
        _id: user.id,
        id: user.id,
        firstName: user.firstName || user.name?.split(' ')[0] || 'Unknown',
        lastName: user.lastName || user.name?.split(' ')[1] || 'User',
        email: user.email,
        role: user.role
      },
      mentions: mentions || [],
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false
    };

    console.log('DEBUG - Creating subtask comment with data:', newComment);

    // Add comment to subtask
    if (!subtask.comments) subtask.comments = [];
    subtask.comments.push(newComment);

    // Update subtask with new comment
    await storage.updateTask(subtaskId, { comments: subtask.comments }, user.id);

    console.log('DEBUG - Subtask comment added successfully'); res.status(201).json({
      success: true,
      message: 'Subtask comment added successfully',
      data: newComment
    });

  } catch (error) {
    console.error('Error adding subtask comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add subtask comment',
      error: error.message
    });
  }
};

export const getSubtaskComments = async (req, res) => {
  try {
    const { parentTaskId, subtaskId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const user = req.user;

    console.log('DEBUG - getSubtaskComments called:', { parentTaskId, subtaskId, userId: user.id });

    // Get parent task to check permissions
    const parentTask = await storage.getTaskById(parentTaskId);
    if (!parentTask) {
      return res.status(404).json({
        success: false,
        message: 'Parent task not found'
      });
    }

    // Get subtask to validate it exists
    const subtask = await storage.getTaskById(subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    // Check if user has permission to view comments
    const canComment = checkCommentPermission(user, parentTask);
    if (!canComment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get comments from MongoDB subtask
    const comments = subtask.comments || [];

    console.log('DEBUG - Found subtask comments:', comments.length);

    // Apply pagination to comments
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedComments = comments.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        comments: paginatedComments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: comments.length,
          totalPages: Math.ceil(comments.length / limit)
        },
        subtask: {
          id: subtask._id,
          title: subtask.title
        },
        parentTask: {
          id: parentTask._id,
          title: parentTask.title
        }
      }
    });

  } catch (error) {
    console.error('Error getting subtask comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subtask comments',
      error: error.message
    });
  }
};

export const updateSubtaskComment = async (req, res) => {
  try {
    const { parentTaskId, subtaskId, commentId } = req.params;
    const { comment } = req.body;
    const user = req.user;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    // Validate parent task exists and user has access
    const parentTask = await storage.getTaskById(parentTaskId);
    if (!parentTask) {
      return res.status(404).json({
        success: false,
        message: 'Parent task not found'
      });
    }

    // Get and validate subtask
    const subtask = await storage.getTaskById(subtaskId);
    if (!subtask || !subtask.isSubtask || subtask.parentTaskId?.toString() !== parentTaskId) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found or does not belong to this parent task'
      });
    }

    // Find the comment
    const comments = subtask.comments || [];
    const commentIndex = comments.findIndex(c => c._id === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const existingComment = comments[commentIndex];

    // Check if user is the author of the comment
    if (existingComment.author.toString() !== user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments'
      });
    }

    // Update the comment
    comments[commentIndex] = {
      ...existingComment,
      text: comment.trim(),
      updatedAt: new Date(),
      isEdited: true
    };

    // Update the subtask with modified comments
    await storage.updateTask(subtaskId, {
      comments: comments,
      updatedAt: new Date()
    }, user.id);

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        comment: comments[commentIndex],
        subtask: {
          _id: subtask._id,
          title: subtask.title
        },
        parentTask: {
          _id: parentTask._id,
          title: parentTask.title
        }
      }
    });

  } catch (error) {
    console.error('Error updating subtask comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment',
      error: error.message
    });
  }
};

export const deleteSubtaskComment = async (req, res) => {
  try {
    const { parentTaskId, subtaskId, commentId } = req.params;
    const user = req.user;

    // Validate parent task exists and user has access
    const parentTask = await storage.getTaskById(parentTaskId);
    if (!parentTask) {
      return res.status(404).json({
        success: false,
        message: 'Parent task not found'
      });
    }

    // Get and validate subtask
    const subtask = await storage.getTaskById(subtaskId);
    if (!subtask || !subtask.isSubtask || subtask.parentTaskId?.toString() !== parentTaskId) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found or does not belong to this parent task'
      });
    }

    // Find the comment
    const comments = subtask.comments || [];
    const commentIndex = comments.findIndex(c => c._id === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const existingComment = comments[commentIndex];

    // Check if user is the author of the comment or has admin privileges
    const canDelete = existingComment.author.toString() === user.id.toString() ||
      user.role === 'org_admin' ||
      Array.isArray(user.role) && user.role.includes('org_admin');

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments or need admin privileges'
      });
    }

    // Remove the comment
    comments.splice(commentIndex, 1);

    // Update the subtask with modified comments
    await storage.updateTask(subtaskId, {
      comments: comments,
      updatedAt: new Date()
    }, user.id);

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      data: {
        deletedCommentId: commentId,
        subtask: {
          _id: subtask._id,
          title: subtask.title
        },
        parentTask: {
          _id: parentTask._id,
          title: parentTask.title
        }
      }
    });

  } catch (error) {
    console.error('Error deleting subtask comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};

// Reply to Subtask Comment API
export const replyToSubtaskComment = async (req, res) => {
  try {
    const { parentTaskId, subtaskId, commentId } = req.params;
    const { content, mentions } = req.body;
    const user = req.user;

    console.log('DEBUG - replyToSubtaskComment called:', {
      parentTaskId,
      subtaskId,
      commentId,
      userId: user.id,
      content: content?.substring(0, 50)
    });

    // Validate input
    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    // Get parent task first
    const parentTask = await storage.getTaskById(parentTaskId);
    if (!parentTask) {
      return res.status(404).json({
        success: false,
        message: 'Parent task not found'
      });
    }

    // Find the subtask
    const subtask = parentTask.subtasks?.find(st => st._id.toString() === subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    // Check permissions using parent task
    if (!checkCommentPermission(user, parentTask)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find the parent comment
    const parentComment = subtask.comments?.find(c => c._id.toString() === commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found'
      });
    }

    // Get user data for the reply author
    const replyAuthor = await storage.getUser(user.id);
    if (!replyAuthor) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create the reply
    const reply = {
      _id: new mongoose.Types.ObjectId(),
      text: content,
      content: content,
      author: user.id,
      mentions: mentions || [],
      parentId: commentId, // Reference to parent comment
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false
    };

    // Add reply to subtask comments
    subtask.comments.push(reply);

    // Save the parent task
    await parentTask.save();

    console.log('DEBUG - Subtask reply added successfully:', {
      replyId: reply._id,
      parentCommentId: commentId,
      subtaskId,
      parentTaskId
    });

    // Return the reply with populated author data
    const responseReply = {
      ...reply.toObject(),
      author: {
        _id: replyAuthor._id,
        firstName: replyAuthor.firstName || 'Unknown',
        lastName: replyAuthor.lastName || 'User',
        email: replyAuthor.email || ''
      }
    };

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: {
        reply: responseReply
      }
    });

  } catch (error) {
    console.error('Error adding subtask reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
};

// Task Comment Functions
export const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content, comment, mentions, parentId } = req.body;
    const user = req.user;

    // Handle both 'content' and 'comment' fields for compatibility
    const commentContent = content || comment;

    console.log('DEBUG - addTaskComment called:', {
      taskId,
      userId: user.id,
      content: commentContent,
      rawBody: req.body,
      hasContent: !!content,
      hasComment: !!comment
    });

    if (!commentContent || commentContent.trim() === '') {
      console.log('DEBUG - Task comment validation failed:', { content, comment, commentContent });
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
        debug: { receivedContent: content, receivedComment: comment }
      });
    }

    // Get the task to check permissions
    const task = await storage.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has permission to comment on this task
    const canComment = checkCommentPermission(user, task);
    if (!canComment) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to comment on this task'
      });
    }

    // Get full user data for the comment author
    let authorData = null;
    try {
      // Try to get full user data from storage
      authorData = await storage.getUser(user.id);
      console.log('DEBUG - addTaskComment - User data from storage:', authorData ? {
        id: authorData._id,
        firstName: authorData.firstName,
        lastName: authorData.lastName,
        email: authorData.email
      } : 'NOT FOUND');
      
      // If storage fails, try direct User model lookup
      if (!authorData) {
        console.log('DEBUG - addTaskComment - Trying direct User lookup');
        authorData = await User.findById(user.id).select('firstName lastName email');
        console.log('DEBUG - addTaskComment - Direct User lookup result:', authorData ? {
          id: authorData._id,
          firstName: authorData.firstName,
          lastName: authorData.lastName,
          email: authorData.email
        } : 'NOT FOUND');
      }
    } catch (error) {
      console.log('DEBUG - addTaskComment - Error fetching user data:', error.message);
    }

    // Create comment object for MongoDB according to schema
    // Note: author should be ObjectId reference as per schema, not complete object
    const newComment = {
      _id: new Date().getTime().toString(),
      text: commentContent.trim(), // Use 'text' field as per schema
      content: commentContent.trim(), // Also add content field for compatibility
      author: user.id, // Save only ObjectId reference as per schema
      mentions: mentions || [],
      parentId: parentId ? parentId.toString() : null, // Ensure parentId is string or null
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false
    };

    console.log('DEBUG - Creating task comment with data:', newComment);

    // Add comment to task
    if (!task.comments) task.comments = [];
    task.comments.push(newComment);

    // Update task with new comment
    await storage.updateTask(taskId, { comments: task.comments }, user.id);

    console.log('DEBUG - Task comment added successfully');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });

  } catch (error) {
    console.error('Error adding task comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};// Helper function to check comment permissions
function checkCommentPermission(user, task) {
  console.log('DEBUG - checkCommentPermission:', {
    userRole: user.role,
    userId: user.id,
    taskId: task._id,
    taskAssignedTo: task.assignedTo,
    taskCreatedBy: task.createdBy
  });

  // Handle user role - it might be an array, use first role or check if user has role
  const userRole = Array.isArray(user.role) ? user.role[0] : user.role;
  const userRoles = Array.isArray(user.role) ? user.role : [user.role];

  // Tasksetu Admin (platform level)
  if (userRoles.includes('tasksetu-admin') || userRoles.includes('super-admin')) {
    console.log('DEBUG - Permission granted: Tasksetu Admin');
    return true;
  }

  // Company Admin (org_admin) - all company tasks
  if (userRoles.includes('org_admin') || userRoles.includes('company-admin') || userRoles.includes('admin')) {
    console.log('DEBUG - Permission granted: Company Admin');
    return true;
  }

  // Extract user ID for comparison
  const userId = user.id?.toString() || user._id?.toString();

  // Check if user is task assignee or creator
  // Handle both string IDs and populated objects
  const getIdFromField = (field) => {
    if (!field) return null;
    if (typeof field === 'string') return field;
    if (field._id) return field._id.toString();
    if (field.toString) return field.toString();
    return null;
  };

  const taskAssignedToId = getIdFromField(task.assignedTo);
  const taskCreatedById = getIdFromField(task.createdBy);

  const isTaskAssignee = taskAssignedToId === userId;
  const isTaskCreator = taskCreatedById === userId;

  // Check if user is tagged as contributor
  const isTaggedContributor = task.contributors && task.contributors.some(c => {
    const contributorId = getIdFromField(c);
    return contributorId === userId;
  });

  // Check if user is tagged as collaborator
  const isCollaboratorInTask = task.collaborators && task.collaborators.some(c => {
    const collaboratorId = getIdFromField(c);
    return collaboratorId === userId;
  });

  console.log('DEBUG - Permission checks:', {
    isTaskAssignee,
    isTaskCreator,
    isTaggedContributor,
    isCollaboratorInTask,
    userId,
    taskAssignedToId,
    taskCreatedById,
    userRole,
    userRoles
  });

  // Manager - own tasks + subordinates' tasks
  if (userRoles.includes('manager')) {
    // Own task
    if (isTaskAssignee || isTaskCreator) {
      console.log('DEBUG - Permission granted: Manager own task');
      return true;
    }

    // Subordinate's task (task assigned to employee under this manager)
    if (task.assignedToRole === 'employee' || task.createdByRole === 'employee') {
      console.log('DEBUG - Permission granted: Manager subordinate task');
      return true;
    }

    // Tagged as contributor/collaborator
    if (isTaggedContributor || isCollaboratorInTask) {
      console.log('DEBUG - Permission granted: Manager tagged as contributor');
      return true;
    }
  }

  // Employee (Normal User) - only own tasks or when tagged
  if (userRoles.includes('employee') || userRoles.includes('normal-user') || userRoles.includes('user') || !userRole) {
    // Own task
    if (isTaskAssignee || isTaskCreator) {
      console.log('DEBUG - Permission granted: Employee own task');
      return true;
    }

    // Tagged as contributor/collaborator
    if (isTaggedContributor || isCollaboratorInTask) {
      console.log('DEBUG - Permission granted: Employee tagged as contributor');
      return true;
    }
  }

  console.log('DEBUG - Permission denied: No matching conditions');
  // Default - no permission
  return false;
}

export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const user = req.user;

    console.log('DEBUG - getTaskComments called:', { taskId, userId: user.id });
    console.log('DEBUG - Server restarted with enhanced debugging');

    // Get task to check permissions
    const task = await storage.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has permission to view comments
    const canComment = checkCommentPermission(user, task);
    if (!canComment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get task with populated comment authors using explicit population
    let populatedTask;
    try {
      populatedTask = await Task.findById(taskId).populate({
        path: 'comments.author',
        model: 'User',
        select: 'firstName lastName email'
      }).exec();
      console.log('DEBUG - Population attempt result:', {
        foundTask: !!populatedTask,
        commentsCount: populatedTask?.comments?.length || 0,
        firstCommentAuthor: populatedTask?.comments?.[0]?.author || 'None',
        rawCommentsWithParentId: populatedTask?.comments?.map(c => ({
          id: c._id,
          parentId: c.parentId,
          hasParentId: !!c.parentId,
          text: c.text?.substring(0, 30)
        })) || []
      });
    } catch (populateError) {
      console.error('DEBUG - Population failed:', populateError);
      populatedTask = null;
    }
    
    const comments = populatedTask?.comments || task.comments || [];

    console.log('DEBUG - Found task comments:', comments.length);
    console.log('DEBUG - Raw comments with parentId check:', comments.map(c => ({ 
      id: c._id, 
      content: c.content, 
      text: c.text, 
      parentId: c.parentId,
      hasParentId: !!c.parentId,
      hasContent: !!(c.content || c.text),
      author: c.author,
      fullCommentObject: c
    })));

    // Process comments with populated author data
    const processedComments = comments.map((comment) => {
      // Handle both content and text fields for backward compatibility
      const text = comment.content || comment.text || '[Content not available]';
      
      console.log('DEBUG - Processing comment:', {
        id: comment._id,
        hasContent: !!(comment.content),
        hasText: !!(comment.text),
        finalText: text,
        parentId: comment.parentId,
        rawAuthor: comment.author,
        authorType: typeof comment.author,
        authorPopulated: comment.author && typeof comment.author === 'object' && comment.author.firstName,
        authorData: comment.author && typeof comment.author === 'object' ? {
          id: comment.author._id,
          firstName: comment.author.firstName,
          lastName: comment.author.lastName,
          email: comment.author.email
        } : 'Not populated'
      });
      
      // Handle author information based on whether it's populated or not
      let authorInfo;
      
      if (comment.author && typeof comment.author === 'object' && comment.author.firstName) {
        // Author is populated from our populate query
        authorInfo = {
          _id: comment.author._id,
          firstName: comment.author.firstName || 'Unknown',
          lastName: comment.author.lastName || 'User',
          email: comment.author.email || ''
        };
        console.log('DEBUG - Using populated author data:', authorInfo);
      } else {
        // Author is ObjectId reference - fallback to Unknown
        console.log('DEBUG - Author not populated, using fallback');
        authorInfo = {
          _id: comment.author,
          firstName: 'Unknown',
          lastName: 'User',
          email: ''
        };
      }

      const processedComment = {
        _id: comment._id,
        text: text,
        content: text, // Include both for compatibility
        author: authorInfo,
        mentions: comment.mentions || [],
        parentId: comment.parentId || null,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        isEdited: comment.isEdited || false
      };
      
      console.log('DEBUG - Final processed comment:', {
        id: processedComment._id,
        hasText: !!processedComment.text,
        parentId: processedComment.parentId,
        isReply: !!processedComment.parentId,
        authorName: `${processedComment.author.firstName} ${processedComment.author.lastName}`,
        authorId: processedComment.author._id,
        authorPopulated: processedComment.author.firstName !== 'Unknown'
      });
      
      return processedComment;
    });

    // Organize comments with nested replies structure
    console.log('DEBUG - Starting to organize comments:', {
      totalProcessedComments: processedComments.length,
      commentsWithParentId: processedComments.filter(c => c.parentId).length,
      commentsWithoutParentId: processedComments.filter(c => !c.parentId).length,
      allComments: processedComments.map(c => ({
        id: c._id,
        parentId: c.parentId,
        text: c.text?.substring(0, 30)
      }))
    });

    // Create a map to hold all comments
    const commentMap = new Map();
    
    // Initialize all comments in the map with empty replies array
    processedComments.forEach(comment => {
      commentMap.set(comment._id.toString(), {
        ...comment,
        replies: []
      });
    });

    console.log('DEBUG - Comment map initialized:', {
      mapSize: commentMap.size,
      commentIds: Array.from(commentMap.keys())
    });

    // Separate top-level comments from replies and nest replies
    const topLevelComments = [];
    
    processedComments.forEach(comment => {
      const commentId = comment._id.toString();
      const parentId = comment.parentId?.toString();

      console.log('DEBUG - Processing comment for nesting:', {
        commentId,
        parentId,
        isReply: !!parentId,
        text: comment.text?.substring(0, 30)
      });

      if (!parentId || parentId === 'null' || parentId === '') {
        // This is a top-level comment
        topLevelComments.push(commentId);
        console.log('DEBUG - Added to top-level:', commentId);
      } else {
        // This is a reply - add it to parent's replies array
        const parentComment = commentMap.get(parentId);
        
        console.log('DEBUG - Reply processing:', {
          replyId: commentId,
          parentId,
          parentFound: !!parentComment,
          availableParents: Array.from(commentMap.keys())
        });

        if (parentComment) {
          const replyData = commentMap.get(commentId);
          if (replyData) {
            parentComment.replies.push(replyData);
            console.log('DEBUG - Reply nested successfully:', {
              replyId: commentId,
              parentId,
              parentRepliesCount: parentComment.replies.length
            });
          }
        } else {
          console.log('DEBUG - MISSING PARENT for reply:', {
            replyId: commentId,
            expectedParentId: parentId,
            availableParents: Array.from(commentMap.keys())
          });
        }
      }
    });

    console.log('DEBUG - After processing all comments:', {
      topLevelCommentsCount: topLevelComments.length,
      topLevelIds: topLevelComments,
      commentsWithReplies: Array.from(commentMap.values()).filter(c => c.replies.length > 0).map(c => ({
        id: c._id,
        repliesCount: c.replies.length,
        replies: c.replies.map(r => ({ id: r._id, text: r.text?.substring(0, 20) }))
      }))
    });

    // Get final nested structure - only top-level comments with their replies nested
    const nestedComments = topLevelComments.map(id => {
      const comment = commentMap.get(id);
      if (comment && comment.replies && comment.replies.length > 0) {
        // Sort replies by creation date (oldest first)
        comment.replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        console.log('DEBUG - Sorted replies for comment:', {
          commentId: id,
          repliesCount: comment.replies.length,
          replies: comment.replies.map(r => ({
            id: r._id,
            createdAt: r.createdAt,
            text: r.text?.substring(0, 20)
          }))
        });
      }
      return comment;
    }).filter(comment => comment !== null && comment !== undefined);

    console.log('DEBUG - Final nested structure BEFORE sending response:', {
      totalProcessedComments: processedComments.length,
      topLevelCommentsAfterNesting: nestedComments.length,
      commentsWithReplies: nestedComments.filter(c => c && c.replies && c.replies.length > 0).length,
      firstCommentReplies: nestedComments[0]?.replies?.length || 0,
      finalStructure: nestedComments.map(c => ({
        commentId: c?._id,
        text: c?.text?.substring(0, 40),
        isTopLevel: !c?.parentId,
        repliesCount: c?.replies?.length || 0,
        actualReplies: c?.replies?.map(r => ({
          replyId: r._id,
          parentId: r.parentId,
          author: `${r.author?.firstName} ${r.author?.lastName}`,
          text: r.text?.substring(0, 40)
        })) || []
      })),
      responsePreview: nestedComments.map(c => ({
        _id: c._id,
        text: c.text?.substring(0, 30),
        repliesLength: c.replies?.length || 0
      }))
    });

    // Apply pagination to top-level comments only (replies stay with parent)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedComments = nestedComments.slice(startIndex, endIndex);

    // Calculate total replies count
    const totalRepliesCount = nestedComments.reduce((count, comment) => {
      return count + (comment.replies?.length || 0);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        comments: paginatedComments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: nestedComments.length, // Count of top-level comments
          totalPages: Math.ceil(nestedComments.length / limit),
          totalCommentsWithReplies: nestedComments.length, // Only top-level comments count, not including replies
          totalReplies: totalRepliesCount // Count of replies only
        },
        summary: {
          topLevelComments: nestedComments.length,
          totalReplies: totalRepliesCount,
          commentsWithReplies: nestedComments.filter(c => c.replies && c.replies.length > 0).length
        }
      }
    });

  } catch (error) {
    console.error('Error getting task comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comments',
      error: error.message
    });
  }
};

export const updateTaskComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { content, mentions } = req.body;
    const user = req.user;

    console.log('DEBUG - updateTaskComment called:', { taskId, commentId, userId: user.id });

    // Get the task
    const task = await storage.getTaskById(taskId, user.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    // Find the comment
    const comment = task.comments?.find(c => c._id === commentId || c.id === commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check permissions - user can edit own comments or moderators can edit any
    const canEdit = checkCommentEditPermission(user, task, comment);
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this comment'
      });
    }

    // Update comment - save in both content and text fields for compatibility
    comment.text = content; // Schema uses 'text' field
    comment.content = content; // Frontend compatibility
    comment.mentions = mentions || comment.mentions;
    comment.updatedAt = new Date();
    comment.isEdited = true;

    console.log('DEBUG - Updating comment with data:', {
      commentId: comment._id,
      newText: content,
      newContent: content,
      updatedAt: comment.updatedAt,
      isEdited: comment.isEdited
    });

    // Update task with modified comment
    await storage.updateTask(taskId, { comments: task.comments }, user.id);

    console.log('DEBUG - Comment updated successfully');

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: comment
    });

  } catch (error) {
    console.error('Error updating task comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment',
      error: error.message
    });
  }
};

export const deleteTaskComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const user = req.user;

    console.log('DEBUG - deleteTaskComment called:', { taskId, commentId, userId: user.id });

    // Get the task
    const task = await storage.getTaskById(taskId, user.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    // Find the comment
    const commentIndex = task.comments?.findIndex(c => c._id === commentId || c.id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const comment = task.comments[commentIndex];

    // Check permissions - user can delete own comments or moderators can delete any
    const canDelete = checkCommentDeletePermission(user, task, comment);
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment'
      });
    }

    // Remove comment
    task.comments.splice(commentIndex, 1);

    // Update task without the deleted comment
    await storage.updateTask(taskId, { comments: task.comments }, user.id);

    console.log('DEBUG - Comment deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};

// Helper function to check comment edit permissions
function checkCommentEditPermission(user, task, comment) {
  console.log('DEBUG - checkCommentEditPermission:', {
    userRole: user.role,
    userId: user.id,
    commentAuthor: comment.author,
    commentId: comment._id
  });

  // Handle role as array or string - Tasksetu Admin or Company Admin can edit any comment
  const userRoles = Array.isArray(user.role) ? user.role : [user.role];
  if (userRoles.includes('tasksetu-admin') || userRoles.includes('super-admin') ||
      userRoles.includes('company-admin') || userRoles.includes('admin') ||
      userRoles.includes('org_admin')) {
    console.log('DEBUG - Edit permission granted: Admin role');
    return true;
  }

  // User can edit their own comments if they have comment access to the task
  // Handle both populated and non-populated author objects
  let isOwnComment = false;
  if (comment.author) {
    const commentAuthorId = comment.author._id || comment.author.id || comment.author;
    const currentUserId = user._id || user.id;
    isOwnComment = commentAuthorId.toString() === currentUserId.toString();
    console.log('DEBUG - Comment ownership check:', {
      commentAuthorId: commentAuthorId.toString(),
      currentUserId: currentUserId.toString(),
      isOwnComment
    });
  }

  if (isOwnComment && checkCommentPermission(user, task)) {
    console.log('DEBUG - Edit permission granted: Own comment');
    return true;
  }

  console.log('DEBUG - Edit permission denied');
  return false;
}

// Helper function to check comment delete permissions
function checkCommentDeletePermission(user, task, comment) {
  console.log('DEBUG - checkCommentDeletePermission:', {
    userRole: user.role,
    userId: user.id,
    commentAuthor: comment.author,
    commentId: comment._id
  });

  // Handle role as array or string - Tasksetu Admin or Company Admin can delete any comment (moderation)
  const userRoles = Array.isArray(user.role) ? user.role : [user.role];
  if (userRoles.includes('tasksetu-admin') || userRoles.includes('super-admin') ||
      userRoles.includes('company-admin') || userRoles.includes('admin') ||
      userRoles.includes('org_admin')) {
    console.log('DEBUG - Delete permission granted: Admin role');
    return true;
  }

  // User can delete their own comments if they have comment access to the task
  // Handle both populated and non-populated author objects
  let isOwnComment = false;
  if (comment.author) {
    const commentAuthorId = comment.author._id || comment.author.id || comment.author;
    const currentUserId = user._id || user.id;
    isOwnComment = commentAuthorId.toString() === currentUserId.toString();
    console.log('DEBUG - Comment ownership check:', {
      commentAuthorId: commentAuthorId.toString(),
      currentUserId: currentUserId.toString(),
      isOwnComment
    });
  }

  if (isOwnComment && checkCommentPermission(user, task)) {
    console.log('DEBUG - Delete permission granted: Own comment');
    return true;
  }

  console.log('DEBUG - Delete permission denied');
  return false;
}

// Reply to Task Comment API
export const replyToTaskComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { content, comment, mentions } = req.body;
    const user = req.user;

    // Handle both 'content' and 'comment' fields for compatibility
    const replyContent = content || comment;

    console.log('DEBUG - replyToTaskComment called:', {
      taskId,
      commentId,
      userId: user.id,
      content: replyContent,
      rawBody: req.body,
      hasContent: !!content,
      hasComment: !!comment
    });

    if (!replyContent || replyContent.trim() === '') {
      console.log('DEBUG - Reply validation failed:', { content, comment, replyContent });
      return res.status(400).json({
        success: false,
        message: 'Reply content is required',
        debug: { receivedContent: content, receivedComment: comment }
      });
    }

    // Get the task to check permissions
    const task = await storage.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if parent comment exists
    const parentComment = task.comments?.find(c => c._id === commentId || c.id === commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found'
      });
    }

    // Check if user has permission to comment on this task
    const canComment = checkCommentPermission(user, task);
    if (!canComment) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reply to comments on this task'
      });
    }

    // Get full user data for the reply author
    let authorData = null;
    try {
      authorData = await storage.getUser(user.id);
      console.log('DEBUG - replyToTaskComment - User data from storage:', authorData ? {
        id: authorData._id,
        firstName: authorData.firstName,
        lastName: authorData.lastName,
        email: authorData.email
      } : 'NOT FOUND');
    } catch (error) {
      console.log('DEBUG - replyToTaskComment - Error fetching user data:', error.message);
    }

    // Create reply object for MongoDB according to schema
    const newReply = {
      _id: new Date().getTime().toString(),
      text: replyContent.trim(), // Use 'text' field as per schema
      content: replyContent.trim(), // Also add content field for compatibility
      author: user.id, // Save only ObjectId reference as per schema
      mentions: mentions || [],
      parentId: commentId.toString(), // Ensure parentId is a string and link to parent comment
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false
    };

    console.log('DEBUG - Creating task reply with data:', {
      ...newReply,
      parentIdType: typeof newReply.parentId,
      parentIdValue: newReply.parentId
    });

    // Add reply to task comments
    if (!task.comments) task.comments = [];
    task.comments.push(newReply);

    // Update task with new reply
    await storage.updateTask(taskId, { comments: task.comments }, user.id);

    console.log('DEBUG - Task reply added successfully, total comments now:', task.comments.length);

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: newReply
    });

  } catch (error) {
    console.error('Error adding task reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const user = req.user;
    const {
      type,
      status,
      assignee,
      project,
      priority,
      page = 1,
      limit = 50,
      search
    } = req.query;

    console.log('🔍 GET TASKS API CALLED - Enhanced Debug Mode');

    const filter = {
      isDeleted: { $ne: true }
    };

    // Filter by organization for org users, or by creator for individual users
    if (user.organizationId) {
      filter.organization = user.organizationId;
    } else {
      filter.createdBy = user.id;
    }

    // Apply filters
    if (type) filter.taskType = type;
    if (status) filter.status = status;
    if (assignee) filter.assignedTo = assignee;
    if (project) filter.project = project;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('🔍 Applied Filter:', filter);

    const tasks = await storage.getTasksByFilter(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    });

    console.log('🔍 Total Tasks Found:', tasks ? tasks.length : 0);

    // 🔄 Enhanced Debug: Log ALL task data with focus on recurring tasks
    if (tasks && tasks.length > 0) {
      console.log('🔄 === COMPLETE TASK DEBUG ANALYSIS ===');
      
      tasks.forEach((task, index) => {
        console.log(`🔍 Task ${index + 1}:`, {
          id: task._id,
          title: task.title,
          taskType: task.taskType,
          isRecurring: task.isRecurring,
          status: task.status,
          
          // Due Date Fields Debug
          dueDate: task.dueDate,
          dueDateType: typeof task.dueDate,
          dueDateValue: task.dueDate ? task.dueDate.toString() : 'NULL',
          
          // Recurring Specific Fields
          nextDueDate: task.nextDueDate,
          nextDueDateType: typeof task.nextDueDate,
          nextDueDateValue: task.nextDueDate ? task.nextDueDate.toString() : 'NULL',
          
          // Recurrence Pattern
          recurrencePattern: task.recurrencePattern,
          hasRecurrencePattern: !!task.recurrencePattern,
          
          // Date Analysis
          hasDueDate: !!task.dueDate,
          hasNextDueDate: !!task.nextDueDate,
          isValidDueDate: task.dueDate instanceof Date,
          isValidNextDueDate: task.nextDueDate instanceof Date,
          
          // Frontend Display Logic Test
          calculatedDisplayDate: task.isRecurring 
            ? (task.nextDueDate || task.dueDate) 
            : task.dueDate,
          
          // Complete Raw Object for Debugging
          fullTask: JSON.stringify(task, null, 2)
        });
        
        // Special focus on recurring tasks
        if (task.isRecurring) {
          console.log('🔄 RECURRING TASK DEEP ANALYSIS:', {
            taskId: task._id,
            title: task.title,
            
            // Date Validation
            originalDueDateExists: !!task.dueDate,
            nextDueDateExists: !!task.nextDueDate,
            
            // Date Values
            originalDueDate: task.dueDate,
            nextDueDate: task.nextDueDate,
            
            // Pattern Analysis
            recurrencePattern: task.recurrencePattern,
            frequency: task.recurrencePattern?.frequency,
            interval: task.recurrencePattern?.interval,
            
            // Status
            currentStatus: task.status,
            
            // What Frontend Should Display
            shouldDisplayDate: task.nextDueDate || task.dueDate,
            shouldDisplayDateFormatted: task.nextDueDate 
              ? new Date(task.nextDueDate).toLocaleDateString() 
              : (task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'),
              
            // Database State Check
            mongoDbState: {
              _id: task._id,
              dueDate: task.dueDate,
              nextDueDate: task.nextDueDate,
              isRecurring: task.isRecurring,
              taskType: task.taskType
            }
          });
        }
      });
      
      // Summary Analysis
      const recurringTasks = tasks.filter(task => task.isRecurring);
      const tasksWithDueDate = tasks.filter(task => task.dueDate);
      const tasksWithNextDueDate = tasks.filter(task => task.nextDueDate);
      const recurringTasksWithDueDate = recurringTasks.filter(task => task.dueDate);
      const recurringTasksWithNextDueDate = recurringTasks.filter(task => task.nextDueDate);
      
      console.log('📊 TASK SUMMARY ANALYSIS:', {
        totalTasks: tasks.length,
        recurringTasks: recurringTasks.length,
        tasksWithDueDate: tasksWithDueDate.length,
        tasksWithNextDueDate: tasksWithNextDueDate.length,
        recurringTasksWithDueDate: recurringTasksWithDueDate.length,
        recurringTasksWithNextDueDate: recurringTasksWithNextDueDate.length,
        
        // Problem Detection
        recurringTasksWithoutAnyDate: recurringTasks.filter(task => !task.dueDate && !task.nextDueDate).length,
        problemTasks: recurringTasks.filter(task => !task.dueDate && !task.nextDueDate).map(task => ({
          id: task._id,
          title: task.title,
          taskType: task.taskType,
          isRecurring: task.isRecurring
        }))
      });
      
      console.log('🔄 === END TASK DEBUG ANALYSIS ===');
    }

    console.log('✅ Sending response to frontend with', tasks ? tasks.length : 0, 'tasks');

    res.json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log('DEBUG - getTaskById controller called with id:', id);
    const task = await storage.getTaskById(id);
    console.log('DEBUG - Controller received task with subtasks:', task?.subtasks ? task.subtasks.length : 'undefined');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to this task
    // Handle organization-based access control with proper null checks
    if (task.organization && user.organizationId) {
      // Handle both populated and non-populated organization field
      const taskOrgId = getTaskOrganizationId(task.organization);
      const userOrgId = user.organizationId?.toString() || user.organizationId;

      if (taskOrgId !== userOrgId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (!task.organization && !user.organizationId) {
      // For individual users without organization, check if they created the task
      if (task.createdBy && user.id && task.createdBy.toString() !== user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If it's an approval task, get approval details
    if (task.isApprovalTask) {
      const approvals = await storage.getTaskApprovals(id);
      task.approvalDetails = approvals;
    }

    // Get recent activities for this task
    const activities = await storage.getActivitiesForTask(id, 20);
    task.activities = activities;

    console.log('DEBUG - Final task response has subtasks:', task?.subtasks ? task.subtasks.length : 'undefined');

    res.json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: error.message
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const updates = req.body;

    const task = await storage.getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    if (task.organization && user.organizationId) {
      const taskOrgId = getTaskOrganizationId(task.organization);
      const userOrgId = user.organizationId?.toString() || user.organizationId;

      if (taskOrgId !== userOrgId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (!task.organization && !user.organizationId) {
      // For individual users without organization, check if they created the task
      if (task.createdBy && user.id && task.createdBy.toString() !== user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const prevAssignee = task.assignedTo?.toString();
    const prevStatus = task.status;

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    if (updates.dueDate) updateData.dueDate = new Date(updates.dueDate);
    if (updates.startDate) updateData.startDate = new Date(updates.startDate);

    const updatedTask = await storage.updateTask(id, updateData, user.id);

    // Recalculate counters if assignee or status possibly changed
    const newAssignee = (updates.assignedTo || updatedTask?.assignedTo || prevAssignee);
    if (newAssignee) {
      await recalcUserTaskCounters(prevAssignee);
      await recalcUserTaskCounters(newAssignee);
    } else {
      // If only status changed without reassignment, still recalc assignee
      await recalcUserTaskCounters(prevAssignee);
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });

  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    console.log('🔍 UPDATE TASK STATUS API CALLED:', {
      taskId: id,
      newStatus: status,
      userId: user?.id,
      userName: user?.firstName + ' ' + user?.lastName,
      userRole: user?.role,
      timestamp: new Date().toISOString()
    });

    if (!status) {
      console.log('❌ Status validation failed - no status provided');
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    console.log('🔍 Fetching task from database...');
    const task = await storage.getTaskById(id);

    if (!task) {
      console.log('❌ Task not found in database:', id);
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    console.log('✅ Task found:', {
      taskId: task._id,
      currentStatus: task.status,
      newStatus: status,
      title: task.title,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy
    });

    // Check permissions
    console.log('🔍 Checking permissions...');
    if (task.organization && user.organizationId) {
      const taskOrgId = getTaskOrganizationId(task.organization);
      const userOrgId = user.organizationId?.toString() || user.organizationId;
      
      console.log('🔍 Organization permission check:', { taskOrgId, userOrgId });

      if (taskOrgId !== userOrgId) {
        console.log('❌ Access denied - organization mismatch');
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (!task.organization && !user.organizationId) {
      // For individual users without organization, check if they created the task or are assigned to it
      const userId = user.id?.toString() || user.id;
      const taskCreatedBy = task.createdBy?.toString() || task.createdBy;
      const taskAssignedTo = task.assignedTo?.toString() || task.assignedTo;
      
      console.log('🔍 Individual user permission check:', { userId, taskCreatedBy, taskAssignedTo });

      if (taskCreatedBy !== userId && taskAssignedTo !== userId) {
        console.log('❌ Access denied - not creator or assignee');
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    console.log('✅ Permission check passed');
    
    // Prepare update data with completion fields if status is completed
    const updateData = {
      status: status,
      updatedAt: new Date()
    };
    
    // Add completion data for completed status
    if (status === 'completed') {
      updateData.completedDate = new Date();
      updateData.completedBy = user.id;
      
      // 🔄 Handle Recurring Task Auto-generation on Completion
      if (task.isRecurring && task.recurrencePattern) {
        console.log('🔄 Processing recurring task completion:', {
          taskId: task._id,
          title: task.title,
          currentDueDate: task.dueDate,
          completedDate: updateData.completedDate
        });
        
        try {
          // Create next occurrence using enhanced logic
          const nextOccurrence = createNextRecurringOccurrence(task, updateData.completedDate);
          
          if (nextOccurrence) {
            // Save next occurrence
            const createdNextTask = await storage.createTask(nextOccurrence);
            
            console.log('✅ Next recurring occurrence created:', {
              originalTaskId: task._id,
              nextTaskId: createdNextTask._id,
              nextDueDate: createdNextTask.dueDate,
              nextNextDueDate: createdNextTask.nextDueDate
            });
            
            // Add activity log for recurrence
            if (!task.comments) task.comments = [];
            task.comments.push({
              _id: Date.now().toString() + Math.random(),
              text: `🔄 Recurring Task: Next occurrence generated with due date ${new Date(createdNextTask.dueDate).toLocaleDateString()}`,
              author: user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
              isEdited: false
            });
            
            updateData.comments = task.comments;
            
          } else {
            console.log('🏁 Recurring task sequence ended - no more occurrences');
            
            // Add completion log for ended recurrence
            if (!task.comments) task.comments = [];
            task.comments.push({
              _id: Date.now().toString() + Math.random(),
              text: `🏁 Recurring Task: Sequence completed - no more occurrences scheduled`,
              author: user.id,
              createdAt: new Date(),
              updatedAt: new Date(),
              isEdited: false
            });
            
            updateData.comments = task.comments;
          }
          
        } catch (recurringError) {
          console.error('❌ Error creating next recurring occurrence:', recurringError);
          
          // Add error log but don't fail the completion
          if (!task.comments) task.comments = [];
          task.comments.push({
            _id: Date.now().toString() + Math.random(),
            text: `⚠️ Recurring Task: Error creating next occurrence - ${recurringError.message}`,
            author: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            isEdited: false
          });
          
          updateData.comments = task.comments;
        }
      }
    }
    
    console.log('🔍 Updating task with data:', updateData);

    // Update only the status
    const updatedTask = await storage.updateTask(id, updateData, user.id);
    
    console.log('✅ Task updated successfully:', {
      taskId: updatedTask?._id,
      oldStatus: task.status,
      newStatus: updatedTask?.status,
      completedDate: updatedTask?.completedDate,
      completedBy: updatedTask?.completedBy
    });

    // Recalculate counters for current assignee
    await recalcUserTaskCounters(updatedTask?.assignedTo);

    console.log('✅ Sending success response to client');
    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: updatedTask
    });

  } catch (error) {
    console.error('❌ ERROR in updateTaskStatus:', {
      error: error.message,
      stack: error.stack,
      taskId: req.params?.id,
      status: req.body?.status,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
      error: error.message
    });
  }
};

// 🔄 Scheduled Recurring Task Generation (Cron Job Function)
export const generateScheduledRecurringTasks = async () => {
  try {
    console.log('🔄 Starting scheduled recurring task generation...');
    
    // Find all active recurring tasks that need next occurrence
    const recurringTasks = await storage.getAllTasks({
      isRecurring: true,
      status: { $ne: 'cancelled' },
      nextDueDate: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) } // Within next 24 hours
    });
    
    console.log(`🔍 Found ${recurringTasks.length} recurring tasks to process`);
    
    let processedCount = 0;
    let errorCount = 0;
    
    for (const task of recurringTasks) {
      try {
        // Check if next occurrence already exists
        const existingNextTask = await storage.getAllTasks({
          title: task.title,
          dueDate: task.nextDueDate,
          createdBy: task.createdBy,
          isRecurring: true
        });
        
        if (existingNextTask.length === 0) {
          // Create next occurrence
          const nextOccurrence = createNextRecurringOccurrence(task);
          
          if (nextOccurrence) {
            await storage.createTask(nextOccurrence);
            processedCount++;
            
            console.log(`✅ Created scheduled occurrence for: ${task.title} (Due: ${nextOccurrence.dueDate})`);
          }
        } else {
          console.log(`⏭️  Next occurrence already exists for: ${task.title}`);
        }
        
      } catch (taskError) {
        console.error(`❌ Error processing recurring task ${task._id}:`, taskError);
        errorCount++;
      }
    }
    
    console.log(`🔄 Recurring task generation completed: ${processedCount} created, ${errorCount} errors`);
    
    return {
      success: true,
      processed: processedCount,
      errors: errorCount,
      total: recurringTasks.length
    };
    
  } catch (error) {
    console.error('❌ Error in scheduled recurring task generation:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// 🔄 Manual Skip Recurring Task Occurrence
export const skipRecurringTaskOccurrence = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;
    
    const task = await storage.getTaskById(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    if (!task.isRecurring) {
      return res.status(400).json({
        success: false,
        message: 'This is not a recurring task'
      });
    }
    
    // Calculate next occurrence after skipping current one
    const skippedDueDate = task.nextDueDate;
    const newNextDueDate = calculateNextDueDate(
      task.recurrencePattern,
      skippedDueDate,
      task.recurrencePattern.anchorField || 'startDate'
    );
    
    // Update task with new next due date
    const updateData = {
      nextDueDate: newNextDueDate,
      updatedAt: new Date()
    };
    
    // Add skip activity log
    if (!task.comments) task.comments = [];
    task.comments.push({
      _id: Date.now().toString() + Math.random(),
      text: `⏭️ Recurring Task: Occurrence skipped for ${new Date(skippedDueDate).toLocaleDateString()}${reason ? ` - Reason: ${reason}` : ''}`,
      author: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false
    });
    
    updateData.comments = task.comments;
    
    const updatedTask = await storage.updateTask(id, updateData, user.id);
    
    res.json({
      success: true,
      message: 'Recurring task occurrence skipped successfully',
      data: {
        skippedDate: skippedDueDate,
        nextDueDate: newNextDueDate,
        task: updatedTask
      }
    });
    
  } catch (error) {
    console.error('Error skipping recurring task occurrence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to skip recurring task occurrence',
      error: error.message
    });
  }
};

// 🔄 Stop/Pause Recurring Task
export const stopRecurringTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user;
    
    const task = await storage.getTaskById(id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    if (!task.isRecurring) {
      return res.status(400).json({
        success: false,
        message: 'This is not a recurring task'
      });
    }
    
    // Stop recurrence by removing nextDueDate and adding end date
    const updateData = {
      nextDueDate: null,
      'recurrencePattern.endDate': new Date(),
      updatedAt: new Date()
    };
    
    // Add stop activity log
    if (!task.comments) task.comments = [];
    task.comments.push({
      _id: Date.now().toString() + Math.random(),
      text: `🛑 Recurring Task: Recurrence stopped manually${reason ? ` - Reason: ${reason}` : ''}`,
      author: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false
    });
    
    updateData.comments = task.comments;
    
    const updatedTask = await storage.updateTask(id, updateData, user.id);
    
    res.json({
      success: true,
      message: 'Recurring task stopped successfully',
      data: updatedTask
    });
    
  } catch (error) {
    console.error('Error stopping recurring task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop recurring task',
      error: error.message
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    console.log('=== DELETE TASK DEBUG ===');
    console.log('Task ID to delete:', id);
    console.log('User attempting delete:', { id: user.id, organizationId: user.organizationId });

    const task = await storage.getTaskById(id);
    console.log('Found task:', task ? {
      id: task._id,
      title: task.title,
      createdBy: task.createdBy,
      organization: task.organization,
      isDeleted: task.isDeleted
    } : 'Not found');

    if (!task) {
      console.log('Task not found in database');
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    if (task.organization && user.organizationId) {
      const taskOrgId = getTaskOrganizationId(task.organization);
      const userOrgId = user.organizationId?.toString() || user.organizationId;
      console.log('Organization check:', { taskOrgId, userOrgId, match: taskOrgId === userOrgId });

      if (taskOrgId !== userOrgId) {
        console.log('Access denied: Organization mismatch');
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (!task.organization && !user.organizationId) {
      // For individual users without organization, check if they created the task
      const taskCreatedBy = task.createdBy?.toString();
      const userId = user.id?.toString();
      console.log('Individual user check:', { taskCreatedBy, userId, match: taskCreatedBy === userId });

      if (task.createdBy && user.id && taskCreatedBy !== userId) {
        console.log('Access denied: Not the creator');
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    console.log('Permissions passed, proceeding with soft delete...');

    // Keep assignee for counter recalculation
    const assignee = task?.assignedTo;

    // Soft delete
    const updateResult = await storage.updateTask(id, {
      isDeleted: true,
      updatedAt: new Date()
    }, user.id);

    // Verify the update by fetching the task again
    const updatedTask = await storage.getTaskById(id);
    console.log('Task state AFTER update:', {
      id: updatedTask?._id,
      title: updatedTask?.title,
      isDeleted: updatedTask?.isDeleted,
      updatedAt: updatedTask?.updatedAt
    });

    // Double check with direct database query
    if (updatedTask && !updatedTask.isDeleted) {
      console.error('❌ WARNING: Task was not properly marked as deleted!');
      console.error('Expected isDeleted: true, but got:', updatedTask.isDeleted);
    } else if (updatedTask && updatedTask.isDeleted) {
      console.log('✅ Task successfully marked as deleted in database');
    } else {
      console.error('❌ ERROR: Could not retrieve updated task from database');
    }

    // ADDITIONAL DATABASE VERIFICATION - Direct MongoDB check
    try {
      const directDbCheck = await storage.directTaskCheck(id);
      console.log('🔍 DIRECT DATABASE CHECK:', directDbCheck);
    } catch (dbError) {
      console.error('Error in direct database check:', dbError);
    }

    // Recalculate counters for assignee after delete
    await recalcUserTaskCounters(assignee);

    console.log('=== DELETE TASK COMPLETE ===');

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};

export const approveOrRejectTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comment } = req.body; // action: 'approve' or 'reject'
    const user = req.user;

    const task = await storage.getTaskById(id);

    if (!task || !task.isApprovalTask) {
      return res.status(404).json({
        success: false,
        message: 'Approval task not found'
      });
    }

    // Check if user is an approver
    if (!task.approvers.includes(user.id)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve this task'
      });
    }

    // Update approval record
    const approval = await storage.getTaskApprovalByTaskAndUser(id, user.id);
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Approval record not found'
      });
    }

    const updateData = {
      status: action,
      comment: comment,
    };

    if (action === 'approve') {
      updateData.approvedAt = new Date();
    } else if (action === 'reject') {
      updateData.rejectedAt = new Date();
    }

    // Generate approval ID for embedded document
    const approvalUpdate = await storage.getTaskApprovalByTaskAndUser(id, user.id);
    if (approvalUpdate) {
      const task = await storage.getTaskById(id);
      const approvalIndex = task.approvalRecords.findIndex(a =>
        a.approverId.toString() === user.id.toString()
      );
      if (approvalIndex !== -1) {
        task.approvalRecords[approvalIndex] = { ...task.approvalRecords[approvalIndex], ...updateData };
        await storage.updateTask(id, { approvalRecords: task.approvalRecords });
      }
    }

    // Check if task is fully approved/rejected
    const allApprovals = await storage.getTaskApprovals(id);
    const approvedCount = allApprovals.filter(a => a.status === 'approve').length;
    const rejectedCount = allApprovals.filter(a => a.status === 'reject').length;

    let newTaskStatus = task.status;
    let approvalStatus = 'pending';

    if (task.approvalMode === 'any' && approvedCount > 0) {
      approvalStatus = 'approved';
      newTaskStatus = 'approved';
    } else if (task.approvalMode === 'all' && approvedCount === task.approvers.length) {
      approvalStatus = 'approved';
      newTaskStatus = 'approved';
    } else if (rejectedCount > 0) {
      approvalStatus = 'rejected';
      newTaskStatus = 'rejected';
    }

    // Update task status if needed
    if (newTaskStatus !== task.status) {
      await storage.updateTask(id, {
        status: newTaskStatus,
        approvalStatus: approvalStatus,
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      message: `Task ${action}d successfully`,
      approvalStatus: approvalStatus
    });

  } catch (error) {
    console.error('Error processing approval:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process approval',
      error: error.message
    });
  }
};

export const getTasksByType = async (req, res) => {
  try {
    const user = req.user;
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    const { type } = req.params;
    const {
      status,
      assignee,
      priority,
      page = 1,
      limit = 50,
      search,
      startDate,
      endDate,
      category
    } = req.query;

    console.log('🔍 GET TASKS BY TYPE API CALLED:', {
      type,
      status,
      priority,
      page,
      limit,
      search,
      timestamp: new Date().toISOString()
    });

    console.log('🎨 Using centralized status color mapping with', Object.keys(STATUS_COLOR_MAP).length, 'status mappings');

    // Validate taskType parameter
    const validTaskTypes = ["regular", "recurring", "milestone", "approval"];
    if (!validTaskTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task type. Must be one of: regular, recurring, milestone, approval',
        validTypes: validTaskTypes
      });
    }


    const filter = {
      taskType: type,
      isDeleted: { $ne: true }
    };

    // Role-based filtering
    if (userRoles.includes('org_admin')) {
      // Org admin: show tasks for their organization
      if (user.organizationId) {
        filter.organization = user.organizationId;
      }
    } else if (userRoles.includes('manager') || userRoles.includes('employee')) {
      // Manager/Employee: show tasks assigned to or created by them
      filter.$or = [
        { assignedTo: user.id },
        { createdBy: user.id }
      ];
    } else {
      // Default: show only tasks created by the user
      filter.createdBy = user.id;
    }

    // Debug log for filter and user info
    console.log('🔍 getTasksByType - User:', {
      userId: user.id,
      userRoles,
      organizationId: user.organizationId
    });
    console.log('🔍 getTasksByType - Final Filter:', filter);

    // Apply additional filters
    if (status) filter.status = status;
    if (assignee) filter.assignedTo = assignee;
    if (priority) filter.priority = priority;
    if (category) filter.category = { $regex: category, $options: 'i' };

    // Date range filter
    if (startDate && endDate) {
      filter.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      filter.dueDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.dueDate = { $lte: new Date(endDate) };
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Add type-specific filters
    switch (type) {
      case 'recurring':
        filter.isRecurring = true;
        break;
      case 'milestone':
        filter.isMilestone = true;
        break;
      case 'approval':
        filter.isApprovalTask = true;
        break;
    }

    // Get tasks
    const tasks = await storage.getTasksByFilter(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    });

    // Group tasks by createdByRole
    const roleList = ["super_admin", "org_admin", "manager", "individual", "employee"];
    const groupedTasks = {};
    roleList.forEach((role) => {
      groupedTasks[role] = [];
    });

    if (tasks && tasks.length > 0) {
      for (let task of tasks) {
        // Add status color to each task using centralized mapping
        task.statusColor = STATUS_COLOR_MAP[task.status] || '#6B7280'; // Default gray if status not found
        
        console.log('🔍 Processing task:', {
          taskId: task._id,
          title: task.title,
          status: task.status,
          statusColor: task.statusColor,
          createdByRole: task.createdByRole
        });

        if (groupedTasks[task.createdByRole]) {
          groupedTasks[task.createdByRole].push(task);
        }
        
        // Add approval details if needed
        if (task.isApprovalTask) {
          try {
            const approvals = await storage.getTaskApprovals(task._id);
            task.approvalDetails = approvals;
          } catch (err) {
            console.error("Error fetching approvals for task:", task._id, err);
          }
        }
      }
    }

    // Pagination
    const totalTasks = tasks ? tasks.length : 0;
    const totalPages = Math.ceil(totalTasks / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    // Log summary for debugging
    console.log('✅ Final task summary for type:', type, {
      totalTasksFound: totalTasks,
      tasksByRole: Object.keys(groupedTasks).reduce((acc, role) => {
        acc[role] = groupedTasks[role].length;
        return acc;
      }, {}),
      pagination: { 
        currentPage: parseInt(page), 
        totalPages, 
        hasNext, 
        hasPrev 
      }
    });

    // Response (grouped by roles)
    res.json({
      success: true,
      data: {
        roles: groupedTasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTasks,
          hasNextPage: hasNext,
          hasPrevPage: hasPrev,
          limit: parseInt(limit),
        },
        statusColorMap: STATUS_COLOR_MAP // Include centralized color mapping in response for frontend reference
      },
    });
  } catch (error) {
    console.error('Error fetching tasks by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks by type',
      error: error.message
    });
  }
};


export const getMyTasks = async (req, res) => {
  try {

    const {
      status,
      priority,
      page = 1,
      limit = 50,
      search,
      role // 👈 frontend se filter role aa sakta hai
    } = req.query;

    const user = req.user;
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    console.log('🔍 GET MY TASKS API CALLED - Enhanced Debug Mode:', {
      status,
      priority,
      page,
      limit,
      search,
      role,
      userId: user.id,
      userRoles,
      organizationId: user.organizationId,
      timestamp: new Date().toISOString()
    });

    console.log('🎨 Using centralized status color mapping with', Object.keys(STATUS_COLOR_MAP).length, 'status mappings');

    // Base filter for main tasks only (exclude subtasks)
    const filter = {
      isDeleted: { $ne: true },
      isSubtask: { $ne: true } // Only get main tasks, not subtasks
    };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Role-based filtering for "My Tasks"
    if (userRoles.includes('org_admin')) {
      // Org admin: show tasks for their organization
      if (user.organizationId) {
        filter.organization = user.organizationId;
      }
    } else if (userRoles.includes('manager') || userRoles.includes('employee')) {
      // Manager/Employee: show tasks assigned to or created by them
      filter.$or = [
        { assignedTo: user.id },
        { createdBy: user.id }
      ];
    } else {
      // Default: show only tasks created by the user
      filter.createdBy = user.id;
    }

    // Optionally, allow frontend to further filter by createdByRole if needed
    if (role) {
      filter.createdByRole = role;
    }

    console.log('🔍 MyTasks Filter Applied:', filter);

    // Get main tasks
    const tasks = await storage.getTasksByFilter(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    });

    console.log('🔍 MyTasks - Total Main Tasks Found:', tasks ? tasks.length : 0);

    // Initialize all roles
    const roleList = ["super_admin", "org_admin", "manager", "individual", "employee"];
    const groupedTasks = {};
    roleList.forEach((r) => {
      groupedTasks[r] = [];
    });

    // Group tasks by createdByRole and fetch subtasks for each task
    for (const task of tasks) {
      console.log(`🔍 Processing Main Task: ${task.title}`, {
        id: task._id,
        taskType: task.taskType,
        isRecurring: task.isRecurring,
        dueDate: task.dueDate,
        dueDateType: typeof task.dueDate,
        nextDueDate: task.nextDueDate,
        nextDueDateType: typeof task.nextDueDate,
        recurrencePattern: task.recurrencePattern,
        
        // Due Date Analysis for MyTasks
        hasDueDate: !!task.dueDate,
        hasNextDueDate: !!task.nextDueDate,
        calculatedDisplayDate: task.isRecurring 
          ? (task.nextDueDate || task.dueDate) 
          : task.dueDate
      });
      
      // Get subtasks for this main task
      const subtasksFilter = {
        parentTaskId: task._id.toString(),
        isSubtask: true,
        isDeleted: { $ne: true }
      };

      const subtasks = await storage.getTasksByFilter(subtasksFilter, {
        sort: { createdAt: -1 }
      });

      console.log(`🔍 Found ${subtasks.length} subtasks for task: ${task.title}`);

      // Enhance subtasks with additional action status and due date debug
      const enhancedSubtasks = subtasks.map(subtask => ({
        ...subtask,
        // Snooze fields
        isSnooze: subtask.isSnooze || false,
        snoozeUntil: subtask.snoozeUntil || null,
        snoozeReason: subtask.snoozeReason || null,
        snoozedBy: subtask.snoozedBy || null,
        snoozedAt: subtask.snoozedAt || null,
        
        // Risk fields
        isRisk: subtask.isRisk || false,
        riskLevel: subtask.riskLevel || null,
        riskReason: subtask.riskReason || null,
        riskMarkedBy: subtask.riskMarkedBy || null,
        riskMarkedAt: subtask.riskMarkedAt || null,
        
        // Completion fields
        completedDate: subtask.completedDate || null,
        completedBy: subtask.completedBy || null,
        completionNotes: subtask.completionNotes || null,
        
        // Status color mapping using centralized constant
        statusColor: STATUS_COLOR_MAP[subtask.status] || '#6B7280' // Default gray if status not found
      }));

      // Log subtask due date info
      if (enhancedSubtasks.length > 0) {
        enhancedSubtasks.forEach((subtask, index) => {
          console.log(`  🔍 Subtask ${index + 1}: ${subtask.title}`, {
            dueDate: subtask.dueDate,
            dueDateType: typeof subtask.dueDate,
            hasDueDate: !!subtask.dueDate,
            status: subtask.status
          });
        });
      }

      console.log('🔍 Processing task with complete data:', {
        taskId: task._id,
        title: task.title,
        status: task.status,
        statusColor: STATUS_COLOR_MAP[task.status],
        subtasksCount: enhancedSubtasks.length,
        createdByRole: task.createdByRole,
        
        // Main Task Due Date Debug
        mainTaskDueDate: task.dueDate,
        mainTaskNextDueDate: task.nextDueDate,
        isMainTaskRecurring: task.isRecurring,
        mainTaskDisplayDate: task.isRecurring 
          ? (task.nextDueDate || task.dueDate) 
          : task.dueDate
      });

      // Add subtasks to the main task with additional action status
      const taskWithSubtasks = {
        ...task,
        subtasks: enhancedSubtasks || [],
        
        // Snooze fields for main task
        isSnooze: task.isSnooze || false,
        snoozeUntil: task.snoozeUntil || null,
        snoozeReason: task.snoozeReason || null,
        snoozedBy: task.snoozedBy || null,
        snoozedAt: task.snoozedAt || null,
        
        // Risk fields for main task
        isRisk: task.isRisk || false,
        riskLevel: task.riskLevel || null,
        riskReason: task.riskReason || null,
        riskMarkedBy: task.riskMarkedBy || null,
        riskMarkedAt: task.riskMarkedAt || null,
        
        // Completion fields for main task
        completedDate: task.completedDate || null,
        completedBy: task.completedBy || null,
        completionNotes: task.completionNotes || null,
        
        // Status color mapping for main task using centralized constant
        statusColor: STATUS_COLOR_MAP[task.status] || '#6B7280' // Default gray if status not found
      };

      // Group by createdByRole
      const roles = Array.isArray(task.createdByRole) ? task.createdByRole : [task.createdByRole];
      roles.forEach((role) => {
        if (groupedTasks[role]) {
          groupedTasks[role].push(taskWithSubtasks);
        }
      });
    }

    // Pagination (sirf fetched main tasks ke basis pe)
    const totalTasks = tasks ? tasks.length : 0;
    const totalPages = Math.ceil(totalTasks / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    // Enhanced Summary with Due Date Analysis
    const recurringTasksCount = tasks.filter(task => task.isRecurring).length;
    const recurringTasksWithDueDate = tasks.filter(task => task.isRecurring && task.dueDate).length;
    const recurringTasksWithNextDueDate = tasks.filter(task => task.isRecurring && task.nextDueDate).length;

    console.log('✅ Final MyTasks grouped tasks summary:', {
      totalTasksFound: totalTasks,
      recurringTasksCount,
      recurringTasksWithDueDate,
      recurringTasksWithNextDueDate,
      tasksByRole: Object.keys(groupedTasks).reduce((acc, role) => {
        acc[role] = groupedTasks[role].length;
        return acc;
      }, {}),
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        hasNext,
        hasPrev
      }
    });

    // Response
    res.json({
      success: true,
      data: {
        roles: groupedTasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: totalPages,
          totalTasks: totalTasks,
          hasNextPage: hasNext,
          hasPrevPage: hasPrev,
          limit: parseInt(limit),
        },
        statusColorMap: STATUS_COLOR_MAP // Include centralized color mapping in response for frontend reference
      },
    });
  } catch (error) {
    console.error('❌ Error fetching MyTasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks by type',
      error: error.message
    });
  }
};

// Snooze Task API
export const snoozeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { snoozeUntil, reason } = req.body;
    const user = req.user;

    console.log('🔍 SNOOZE API DEBUG:', {
      taskId,
      snoozeUntil,
      reason,
      userId: user?.id,
      userIdType: typeof user?.id,
      userName: user?.firstName + ' ' + user?.lastName
    });

    // Validate required fields
    if (!snoozeUntil) {
      return res.status(400).json({
        success: false,
        message: "Snooze until date is required"
      });
    }

    const task = await storage.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    console.log('🔍 TASK FOUND:', {
      taskId: task._id,
      assignedTo: task.assignedTo,
      assignedToType: typeof task.assignedTo,
      collaboratorIds: task.collaboratorIds
    });

    // Check permissions (assignee, collaborator, or org admin)
    const hasPermission = task.assignedTo?.toString() === user.id.toString() ||
      task.collaboratorIds?.includes(user.id.toString()) ||
      user.role === "org_admin" ||
      Array.isArray(user.role) && user.role.includes("org_admin");

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to snooze this task"
      });
    }

    // Update task with snooze data
    const updatedTask = await storage.updateTask(taskId, {
      isSnooze: true,
      snoozeUntil: new Date(snoozeUntil),
      snoozeReason: reason || null,
      snoozedBy: user.id,
      snoozedAt: new Date(),
      updatedBy: user.id,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: "Task snoozed successfully",
      data: updatedTask
    });

  } catch (error) {
    console.error("Error snoozing task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to snooze task",
      error: error.message
    });
  }
};

// Unsnooze Task API
export const unsnoozeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = req.user;

    const task = await storage.getTask(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check permissions
    const hasPermission = task.assignedTo?.toString() === user.id.toString() ||
      task.collaboratorIds?.includes(user.id.toString()) ||
      user.role === "org_admin" ||
      Array.isArray(user.role) && user.role.includes("org_admin");

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to unsnooze this task"
      });
    }

    // Remove snooze data
    const updatedTask = await storage.updateTask(taskId, {
      isSnooze: false,
      snoozeUntil: null,
      snoozeReason: null,
      snoozedBy: null,
      snoozedAt: null,
      updatedBy: user.id,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: "Task unsnooze successfully",
      data: updatedTask
    });

  } catch (error) {
    console.error("Error unsnoozing task:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unsnooze task",
      error: error.message
    });
  }
};

// Mark Task as Risk API
export const markTaskAsRisk = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { riskReason, riskLevel } = req.body;
    const user = req.user;

    const task = await storage.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check permissions
    const hasPermission = task.assignedTo?.toString() === user.id.toString() ||
      task.collaboratorIds?.includes(user.id.toString()) ||
      user.role === "org_admin" ||
      Array.isArray(user.role) && user.role.includes("org_admin");

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to mark this task as risk"
      });
    }

    // Update task with risk data
    const updatedTask = await storage.updateTask(taskId, {
      isRisk: true,
      riskLevel: riskLevel || 'medium', // low, medium, high
      riskReason: riskReason || null,
      riskMarkedBy: user.id,
      riskMarkedAt: new Date(),
      updatedBy: user.id,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: "Task marked as risk successfully",
      data: updatedTask
    });

  } catch (error) {
    console.error("Error marking task as risk:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark task as risk",
      error: error.message
    });
  }
};

// Unmark Task as Risk API
export const unmarkTaskAsRisk = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = req.user;

    const task = await storage.getTask(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check permissions
    const hasPermission = task.assignedTo?.toString() === user.id.toString() ||
      task.collaboratorIds?.includes(user.id.toString()) ||
      user.role === "org_admin" ||
      Array.isArray(user.role) && user.role.includes("org_admin");

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to unmark this task as risk"
      });
    }

    // Remove risk data
    const updatedTask = await storage.updateTask(taskId, {
      isRisk: false,
      riskLevel: null,
      riskReason: null,
      riskMarkedBy: null,
      riskMarkedAt: null,
      updatedBy: user.id,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: "Task unmarked as risk successfully",
      data: updatedTask
    });

  } catch (error) {
    console.error("Error unmarking task as risk:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unmark task as risk",
      error: error.message
    });
  }
};

// Quick Mark Task as Done API
export const quickMarkAsDone = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completionNotes } = req.body;
    const user = req.user;

    const task = await storage.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check permissions
    const hasPermission = task.assignedTo?.toString() === user.id.toString() ||
      task.collaboratorIds?.includes(user.id.toString()) ||
      user.role === "org_admin" ||
      Array.isArray(user.role) && user.role.includes("org_admin");

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to complete this task"
      });
    }

    // Check if task can be marked as done (no incomplete subtasks)
    const subtasks = await storage.getTasksByFilter({ parentTask: taskId });
    const incompleteSubtasks = subtasks.filter(
      subtask => subtask.status !== 'completed' && subtask.status !== 'cancelled'
    );

    if (incompleteSubtasks.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot complete task. ${incompleteSubtasks.length} subtask(s) are still incomplete.`
      });
    }

    // Update task to completed status
    const updatedTask = await storage.updateTask(taskId, {
      status: 'completed',
      completedDate: new Date(),
      completedBy: user.id,
      completionNotes: completionNotes || null,
      updatedBy: user.id,
      updatedAt: new Date()
    });

    // Recalculate counters for current assignee
    await recalcUserTaskCounters(updatedTask?.assignedTo);

    res.json({
      success: true,
      message: "Task marked as completed successfully",
      data: updatedTask
    });

  } catch (error) {
    console.error("Error marking task as done:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark task as done",
      error: error.message
    });
  }
};

// Activity Feed Endpoints
export const getTaskActivities = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { limit = 20 } = req.query;
    const user = req.user;

    // Check if user has access to this task
    const task = await storage.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions (similar to getTaskById)
    if (task.organization && user.organizationId) {
      const taskOrgId = getTaskOrganizationId(task.organization);
      const userOrgId = user.organizationId?.toString() || user.organizationId;

      if (taskOrgId !== userOrgId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const activities = await storage.getActivitiesForTask(taskId, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        activities,
        taskTitle: task.title,
        taskId: taskId
      }
    });

  } catch (error) {
    console.error('Error fetching task activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task activities',
      error: error.message
    });
  }
};

export const getOrganizationActivities = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const user = req.user;

    if (!user.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Organization access required'
      });
    }

    const activities = await storage.getActivitiesForOrganization(user.organizationId, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        activities,
        organizationId: user.organizationId
      }
    });

  } catch (error) {
    console.error('Error fetching organization activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch organization activities',
      error: error.message
    });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const activities = await storage.getRecentActivities(parseInt(limit));
    
    res.json({
      success: true,
      data: {
        activities
      }
    });

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities',
      error: error.message
    });
  }
};
