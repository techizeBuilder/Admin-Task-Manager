import { storage } from "../mongodb-storage.js";
import { calculateNextDueDate, getTaskTypeLabel, getTaskOrganizationId } from "../utils/helperFunction.js";

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

    // Base Task
    const baseTask = {
      title: parsedTaskData.title,
      description: parsedTaskData.description || "",
      createdBy: user.id,
      createdByRole: createdByRole,
      assignedTo: parsedTaskData.assignedTo || user.id,
      status: parsedTaskData.status || "todo",
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
      case "recurring":
        baseTask.isRecurring = true;
        baseTask.recurrencePattern = parsedTaskData.recurrencePattern;
        baseTask.nextDueDate = calculateNextDueDate(
          parsedTaskData.recurrencePattern,
          baseTask.dueDate
        );
        break;

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
      status: parsedTaskData.status || "todo",
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

    // Prepare update data
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Handle date fields
    if (updates.dueDate) updateData.dueDate = new Date(updates.dueDate);
    if (updates.startDate) updateData.startDate = new Date(updates.startDate);

    // Update subtask
    const updatedSubtask = await storage.updateTask(subtaskId, updateData, user.id);

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

    // Soft delete subtask
    const updateResult = await storage.updateTask(subtaskId, {
      isDeleted: true,
      deletedAt: new Date(),
      updatedAt: new Date()
    }, user.id);

    console.log('Subtask soft delete result:', updateResult);
    console.log('=== DELETE SUBTASK COMPLETE ===');

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
    const { comment, mentions } = req.body;
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

    // Create comment object
    const newComment = {
      _id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
      text: comment.trim(),
      author: user.id,
      authorName: `${user.firstName} ${user.lastName}`,
      authorEmail: user.email,
      mentions: mentions || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false
    };

    // Add comment to subtask
    const updatedSubtask = await storage.updateTask(subtaskId, {
      $push: { comments: newComment },
      updatedAt: new Date()
    }, user.id);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: newComment,
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
    console.error('Error adding subtask comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

export const getSubtaskComments = async (req, res) => {
  try {
    const { parentTaskId, subtaskId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const user = req.user;

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

    // Get and validate subtask
    const subtask = await storage.getTaskById(subtaskId);
    if (!subtask || !subtask.isSubtask || subtask.parentTaskId?.toString() !== parentTaskId) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found or does not belong to this parent task'
      });
    }

    // Get comments with pagination
    const comments = subtask.comments || [];
    const sortedComments = comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedComments = sortedComments.slice(startIndex, endIndex);

    const totalComments = comments.length;
    const totalPages = Math.ceil(totalComments / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    res.json({
      success: true,
      message: 'Comments retrieved successfully',
      data: {
        subtask: {
          _id: subtask._id,
          title: subtask.title
        },
        parentTask: {
          _id: parentTask._id,
          title: parentTask.title
        },
        comments: paginatedComments,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalComments,
          hasNextPage: hasNext,
          hasPrevPage: hasPrev,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching subtask comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
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

    const tasks = await storage.getTasksByFilter(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    });

    res.json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
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

    const task = await storage.getTaskById(id);

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

    // Prepare update data
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Handle date fields
    if (updates.dueDate) updateData.dueDate = new Date(updates.dueDate);
    if (updates.startDate) updateData.startDate = new Date(updates.startDate);

    const updatedTask = await storage.updateTask(id, updateData, user.id);

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

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

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
      // For individual users without organization, check if they created the task or are assigned to it
      const userId = user.id?.toString() || user.id;
      const taskCreatedBy = task.createdBy?.toString() || task.createdBy;
      const taskAssignedTo = task.assignedTo?.toString() || task.assignedTo;

      if (taskCreatedBy !== userId && taskAssignedTo !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Update only the status
    const updatedTask = await storage.updateTask(id, {
      status: status,
      updatedAt: new Date()
    }, user.id);

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: updatedTask
    });

  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status',
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

    // Check task state before update
    console.log('Task state BEFORE update:', {
      id: task._id,
      title: task.title,
      isDeleted: task.isDeleted,
      updatedAt: task.updatedAt
    });

    // Soft delete
    console.log('Calling storage.updateTask with:', {
      id: id,
      updateData: {
        isDeleted: true,
        updatedAt: new Date()
      },
      userId: user.id
    });

    const updateResult = await storage.updateTask(id, {
      isDeleted: true,
      updatedAt: new Date()
    }, user.id);

    console.log('Update result from storage:', updateResult);

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

    // Filter by organization for org users, or by creator for individual users
    if (user.organizationId) {
      filter.organization = user.organizationId;
    } else {
      filter.createdBy = user.id;
    }

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

    // Response (grouped by roles)
    res.json({
      success: true,
      message: `${type} tasks retrieved successfully`,
      taskType: type,
      data: {
        roles: groupedTasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalTasks,
          hasNextPage: hasNext,
          hasPrevPage: hasPrev,
          limit: parseInt(limit)
        }
      }
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
    if (role) {
      // 👈 agar query me role diya hai to us role ka hi filter
      filter.createdByRole = role;
    }

    // Get main tasks
    const tasks = await storage.getTasksByFilter(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    });

    // Initialize all roles
    const roleList = ["super_admin", "org_admin", "manager", "individual", "employee"];
    const groupedTasks = {};
    roleList.forEach((r) => {
      groupedTasks[r] = [];
    });

    // Group tasks by createdByRole and fetch subtasks for each task
    for (const task of tasks) {
      // Get subtasks for this main task
      const subtasksFilter = {
        parentTaskId: task._id.toString(),
        isSubtask: true,
        isDeleted: { $ne: true }
      };

      const subtasks = await storage.getTasksByFilter(subtasksFilter, {
        sort: { createdAt: -1 }
      });

      // Add subtasks to the main task
      const taskWithSubtasks = {
        ...task,
        subtasks: subtasks || []
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
      },
    });
  } catch (error) {
    console.error("Error fetching my tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

// Snooze Task API
export const snoozeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { snoozeUntil, reason } = req.body;
    const user = req.user;

    // Validate required fields
    if (!snoozeUntil) {
      return res.status(400).json({
        success: false,
        message: "Snooze until date is required"
      });
    }

    const task = await storage.getTask(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check permissions (assignee, collaborator, or org admin)
    const hasPermission = task.assignedTo?.toString() === user._id.toString() ||
      task.collaboratorIds?.includes(user._id.toString()) ||
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
      snoozedBy: user._id,
      snoozedAt: new Date(),
      updatedBy: user._id,
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
    const hasPermission = task.assignedTo?.toString() === user._id.toString() ||
      task.collaboratorIds?.includes(user._id.toString()) ||
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
      updatedBy: user._id,
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

    const task = await storage.getTask(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check permissions
    const hasPermission = task.assignedTo?.toString() === user._id.toString() ||
      task.collaboratorIds?.includes(user._id.toString()) ||
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
      riskMarkedBy: user._id,
      riskMarkedAt: new Date(),
      updatedBy: user._id,
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
    const hasPermission = task.assignedTo?.toString() === user._id.toString() ||
      task.collaboratorIds?.includes(user._id.toString()) ||
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
      updatedBy: user._id,
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

    const task = await storage.getTask(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check permissions
    const hasPermission = task.assignedTo?.toString() === user._id.toString() ||
      task.collaboratorIds?.includes(user._id.toString()) ||
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
      completedBy: user._id,
      completionNotes: completionNotes || null,
      updatedBy: user._id,
      updatedAt: new Date()
    });

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