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

    console.log('=== getTasksByType Debug Info ===');
    console.log('User:', { id: user.id, organizationId: user.organizationId });
    console.log('Requested type:', type);
    console.log('Query params:', { status, assignee, priority, page, limit, search, startDate, endDate, category });

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

    console.log('Final filter:', JSON.stringify(filter, null, 2));

    // First, let's get ALL tasks to see what exists in the database
    console.log('=== Debugging: Getting ALL tasks first ===');
    const allTasksFilter = { isDeleted: { $ne: true } };
    if (user.organizationId) {
      allTasksFilter.organization = user.organizationId;
    } else {
      allTasksFilter.createdBy = user.id;
    }
    
    const allTasks = await storage.getTasksByFilter(allTasksFilter, { limit: 1000 });
    console.log('Total tasks in DB for this user/org:', allTasks ? allTasks.length : 0);
    
    // ALSO get ALL tasks including deleted ones to compare
    const allTasksIncludingDeleted = await storage.getTasksByFilter({
      ...(user.organizationId ? { organization: user.organizationId } : { createdBy: user.id })
    }, { limit: 1000 });
    console.log('Total tasks INCLUDING deleted:', allTasksIncludingDeleted ? allTasksIncludingDeleted.length : 0);
    
    if (allTasksIncludingDeleted && allTasksIncludingDeleted.length > 0) {
      const deletedTasks = allTasksIncludingDeleted.filter(task => task.isDeleted);
      console.log('Deleted tasks count:', deletedTasks.length);
      if (deletedTasks.length > 0) {
        console.log('Sample deleted tasks:', deletedTasks.slice(0, 3).map(task => ({
          id: task._id,
          title: task.title,
          isDeleted: task.isDeleted,
          taskType: task.taskType,
          updatedAt: task.updatedAt
        })));
      }
    }
    
    if (allTasks && allTasks.length > 0) {
      console.log('Sample tasks:', allTasks.slice(0, 3).map(task => ({
        id: task._id,
        title: task.title,
        taskType: task.taskType,
        isRecurring: task.isRecurring,
        isMilestone: task.isMilestone,
        isApprovalTask: task.isApprovalTask,
        organization: task.organization,
        createdBy: task.createdBy,
        isDeleted: task.isDeleted
      })));
    }

    // Get tasks using the same method as getTasks
    const tasks = await storage.getTasksByFilter(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    });

    console.log('Raw tasks result:', { 
      type: typeof tasks, 
      isArray: Array.isArray(tasks), 
      length: tasks ? tasks.length : 'no length',
      firstTask: tasks && tasks.length > 0 ? { 
        id: tasks[0]._id, 
        title: tasks[0].title, 
        taskType: tasks[0].taskType,
        isDeleted: tasks[0].isDeleted
      } : 'no tasks'
    });

    // Check if any deleted tasks are in the results
    if (tasks && tasks.length > 0) {
      const deletedInResults = tasks.filter(task => task.isDeleted);
      if (deletedInResults.length > 0) {
        console.error('❌ PROBLEM: Found deleted tasks in results:', deletedInResults.map(task => ({
          id: task._id,
          title: task.title,
          isDeleted: task.isDeleted
        })));
      } else {
        console.log('✅ Good: No deleted tasks found in results');
      }
      
      // Show all task states for debugging
      console.log('All tasks in result with isDeleted status:', tasks.map(task => ({
        id: task._id,
        title: task.title,
        isDeleted: task.isDeleted,
        taskType: task.taskType
      })));
    }

    // Since getTasksByFilter returns a simple array, we need to create pagination manually
    const totalTasks = tasks ? tasks.length : 0;
    const totalPages = Math.ceil(totalTasks / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    // Add type-specific data for each task
    if (tasks && tasks.length > 0) {
      for (let task of tasks) {
        if (task.isApprovalTask) {
          try {
            const approvals = await storage.getTaskApprovals(task._id);
            task.approvalDetails = approvals;
          } catch (approvalError) {
            console.error('Error fetching approvals for task:', task._id, approvalError);
          }
        }
      }
    }

    const response = {
      success: true,
      message: `${getTaskTypeLabel(type)} tasks retrieved successfully`,
      taskType: type,
      data: {
        tasks: tasks || [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: totalPages,
          totalTasks: totalTasks,
          hasNextPage: hasNext,
          hasPrevPage: hasPrev,
          limit: parseInt(limit)
        },
        summary: {
          taskType: type,
          totalCount: totalTasks,
          filters: {
            status,
            assignee,
            priority,
            category,
            search,
            dateRange: startDate && endDate ? { from: startDate, to: endDate } : null
          }
        }
      }
    };

    console.log('Final response summary:', { 
      success: response.success, 
      tasksCount: response.data.tasks.length,
      totalCount: response.data.summary.totalCount 
    });

    res.json(response);

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
    const user = req.user;
    const {
      status,
      priority,
      page = 1,
      limit = 50,
      search
    } = req.query;

    // Support both string and array role
    let userRole = user.role;
    if (Array.isArray(userRole)) {
      userRole = userRole[0];
    }

    const filter = {
      createdByRole: userRole,
      isDeleted: { $ne: true }
    };
    if (status) filter.status = status;
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

    const totalTasks = tasks ? tasks.length : 0;
    const totalPages = Math.ceil(totalTasks / parseInt(limit));
    const hasNext = parseInt(page) < totalPages;
    const hasPrev = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        tasks: tasks || [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: totalPages,
          totalTasks: totalTasks,
          hasNextPage: hasNext,
          hasPrevPage: hasPrev,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
};