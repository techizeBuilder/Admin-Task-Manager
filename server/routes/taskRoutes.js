import express from "express";
import { storage } from "../mongodb-storage.js";
import { authenticateToken } from "../middleware/roleAuth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'uploads', 'task-attachments');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: uploadStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Allow common file types
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

const router = express.Router();

// Create a new task (all types: regular, recurring, milestone, approval)
router.post("/create-task", authenticateToken, upload.array('attachments', 5), async (req, res) => {
  try {
    const user = req.user;
    const taskData = req.body;
    
    // Parse JSON fields that come as strings from FormData
    const parsedTaskData = {
      ...taskData,
      // Parse arrays and objects
      tags: taskData.tags ? JSON.parse(taskData.tags) : [],
      collaboratorIds: taskData.collaboratorIds ? JSON.parse(taskData.collaboratorIds) : [],
      dependsOnTaskIds: taskData.dependsOnTaskIds ? JSON.parse(taskData.dependsOnTaskIds) : [],
      // Parse specific task type data
      recurrencePattern: taskData.recurrencePattern ? JSON.parse(taskData.recurrencePattern) : null,
      milestoneData: taskData.milestoneData ? JSON.parse(taskData.milestoneData) : null,
      approvalData: taskData.approvalData ? JSON.parse(taskData.approvalData) : null,
      approverIds: taskData.approverIds ? JSON.parse(taskData.approverIds) : [],
      linkedTaskIds: taskData.linkedTaskIds ? JSON.parse(taskData.linkedTaskIds) : []
    };

    console.log('Task data received:', {
      title: parsedTaskData.title,
      category: parsedTaskData.category,
      taskType: parsedTaskData.taskType,
      mainTaskType: parsedTaskData.mainTaskType,
      taskTypeAdvanced: parsedTaskData.taskTypeAdvanced,
      referenceProcess: parsedTaskData.referenceProcess,
      customForm: parsedTaskData.customForm,
      dependencies: parsedTaskData.dependsOnTaskIds
    });

    // Handle file attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.originalname,
        filename: file.filename,
        size: file.size,
        type: file.mimetype,
        url: `/uploads/task-attachments/${file.filename}`
      }));
    }

    // Build comprehensive task object based on task type
    const baseTask = {
      title: parsedTaskData.title,
      description: parsedTaskData.description || '',
      createdBy: user.id,
      assignedTo: parsedTaskData.assignedTo || user.id,
      status: parsedTaskData.status || 'todo',
      priority: parsedTaskData.priority || 'medium',
      dueDate: parsedTaskData.dueDate ? new Date(parsedTaskData.dueDate) : null,
      startDate: parsedTaskData.startDate ? new Date(parsedTaskData.startDate) : null,
      taskType: parsedTaskData.taskType || 'regular',
      mainTaskType: parsedTaskData.mainTaskType || parsedTaskData.taskType, // Clear identification of task category
      taskTypeAdvanced: parsedTaskData.taskTypeAdvanced || 'simple', // Simple/Complex classification
      tags: parsedTaskData.tags,
      category: parsedTaskData.category,
      visibility: parsedTaskData.visibility || 'private',
      collaborators: parsedTaskData.collaboratorIds,
      dependencies: parsedTaskData.dependsOnTaskIds,
      attachments: attachments,
      customFields: {},
      // Advanced options - always save these fields
      referenceProcess: parsedTaskData.referenceProcess || null,
      customForm: parsedTaskData.customForm || null,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add organization only if user has one (for org users, not individual users)
    if (user.organizationId) {
      baseTask.organization = user.organizationId;
    }

    // Add task type specific fields
    switch (parsedTaskData.taskType) {
      case 'recurring':
        baseTask.isRecurring = true;
        baseTask.recurrencePattern = parsedTaskData.recurrencePattern;
        baseTask.nextDueDate = calculateNextDueDate(parsedTaskData.recurrencePattern, baseTask.dueDate);
        break;
        
      case 'milestone':
        baseTask.isMilestone = true;
        baseTask.milestoneType = parsedTaskData.milestoneType || 'standalone';
        baseTask.milestoneData = parsedTaskData.milestoneData;
        if (parsedTaskData.linkedTaskIds && parsedTaskData.linkedTaskIds.length > 0) {
          baseTask.linkedTasks = parsedTaskData.linkedTaskIds;
        }
        break;
        
      case 'approval':
        baseTask.isApprovalTask = true;
        baseTask.approvalMode = parsedTaskData.approvalMode || 'any';
        baseTask.approvalStatus = 'pending';
        baseTask.approvers = parsedTaskData.approverIds || [];
        baseTask.autoApproveEnabled = parsedTaskData.autoApproveEnabled || false;
        baseTask.autoApproveAfter = parsedTaskData.autoApproveAfter;
        break;
    }

    // Save task to database
    const createdTask = await storage.createTask(baseTask);

    // If this is an approval task, create approval records for each approver
    if (parsedTaskData.taskType === 'approval' && parsedTaskData.approverIds) {
      for (const approverId of parsedTaskData.approverIds) {
        await storage.createTaskApproval({
          taskId: createdTask._id,
          approverId: approverId,
          status: 'pending',
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
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
});

// Get tasks by organization
router.get("/tasks", authenticateToken, async (req, res) => {
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
});

// Get single task by ID
router.get("/tasks/:id", authenticateToken, async (req, res) => {
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
    if (task.organization.toString() !== user.organization.toString()) {
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
});

// Update task
router.put("/tasks/:id", authenticateToken, async (req, res) => {
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
    if (task.organization.toString() !== user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
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

    const updatedTask = await storage.updateTask(id, updateData);

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
});

// Delete task
router.delete("/tasks/:id", authenticateToken, async (req, res) => {
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

    // Check permissions
    if (task.organization.toString() !== user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete
    await storage.updateTask(id, { 
      isDeleted: true, 
      updatedAt: new Date() 
    });

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
});

// Approve/Reject approval task
router.post("/tasks/:id/approve", authenticateToken, async (req, res) => {
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
});

// Helper functions
function calculateNextDueDate(recurrencePattern, currentDueDate) {
  if (!recurrencePattern || !currentDueDate) return null;
  
  const date = new Date(currentDueDate);
  
  switch (recurrencePattern.frequency) {
    case 'daily':
      date.setDate(date.getDate() + (recurrencePattern.interval || 1));
      break;
    case 'weekly':
      date.setDate(date.getDate() + (7 * (recurrencePattern.interval || 1)));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + (recurrencePattern.interval || 1));
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + (recurrencePattern.interval || 1));
      break;
  }
  
  return date;
}

function getTaskTypeLabel(taskType) {
  const labels = {
    regular: 'Regular task',
    recurring: 'Recurring task',
    milestone: 'Milestone',
    approval: 'Approval task'
  };
  return labels[taskType] || 'Task';
}

export { router as taskRoutes };