import express from 'express';
import { MongoStorage } from '../mongodb-storage.js';
import { authenticateToken } from '../middleware/roleAuth.js';

const router = express.Router();
const storage = new MongoStorage();

// Task type field definitions based on user requirements
const TASK_TYPE_FIELDS = {
  simple: [
    // Basic fields for Simple Task
    'title', 'description', 'assignedTo', 'priority', 'category', 
    'status', 'dueDate', 'tags', 'attachments',
    // Advanced options for Simple Task
    'referenceProcess', 'customForm', 'dependencies', 'taskTypeAdvanced'
  ],
  milestone: [
    'title', 'description', 'priority', 'dueDate', 'assignedTo',
    'category', 'tags', 'status', 'milestoneType',
    'completionCriteria', 'linkedTasks', 'projectPhase',
    'referenceProcess', 'customForm', 'dependencies'
  ],
  recurring: [
    'title', 'description', 'priority', 'assignedTo', 'category',
    'tags', 'status', 'recurrencePattern', 'frequency',
    'interval', 'endDate', 'maxOccurrences', 'nextDueDate',
    'referenceProcess', 'customForm', 'dependencies'
  ],
  approval: [
    'title', 'description', 'priority', 'dueDate', 'assignedTo',
    'category', 'tags', 'status', 'approvers',
    'approvalMode', 'autoApproveEnabled', 'autoApproveAfter',
    'approvalCriteria', 'referenceProcess', 'customForm', 'dependencies'
  ]
};

// Validation schemas for each task type
const validateTaskData = (type, data) => {
  const allowedFields = TASK_TYPE_FIELDS[type];
  if (!allowedFields) {
    throw new Error(`Invalid task type: ${type}`);
  }

  // Filter only allowed fields for this task type
  const filteredData = {};
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  });

  // Required fields validation
  const requiredFields = ['title'];
  for (const field of requiredFields) {
    if (!filteredData[field]) {
      throw new Error(`Required field missing: ${field}`);
    }
  }

  return filteredData;
};

// POST /api/tasks - Create task based on type
router.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { type, data } = req.body;
    const user = req.user;

    console.log('Task creation request:', {
      type,
      dataKeys: Object.keys(data || {}),
      userId: user.id
    });

    // Validate task type
    if (!type || !['simple', 'milestone', 'recurring', 'approval'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing task type. Must be: simple, milestone, recurring, or approval'
      });
    }

    // Validate and filter data based on task type
    const validatedData = validateTaskData(type, data || {});

    // Map task types to valid MongoDB enum values
    const taskTypeMapping = {
      'simple': 'regular',
      'milestone': 'milestone', 
      'recurring': 'recurring',
      'approval': 'approval'
    };
    
    // Build task object with common structure
    const taskObj = {
      type: type,
      mainTaskType: taskTypeMapping[type] || 'regular',
      taskType: taskTypeMapping[type] || 'regular',
      taskTypeAdvanced: type,
      fields: validatedData,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Spread validated fields into main object for compatibility
      ...validatedData,
      
      // Set defaults for common fields  
      status: validatedData.status || 'todo',
      priority: validatedData.priority || 'medium',
      visibility: 'private', // Always set to private for validation compatibility
      tags: Array.isArray(validatedData.tags) ? validatedData.tags : [],
      
      // Handle organization for different user types
      ...(user.organizationId ? { organization: user.organizationId } : {}),
    };

    // Add type-specific processing
    switch (type) {
      case 'milestone':
        taskObj.isMilestone = true;
        taskObj.milestoneType = validatedData.milestoneType || 'standalone';
        if (validatedData.linkedTasks) {
          taskObj.linkedTasks = Array.isArray(validatedData.linkedTasks) 
            ? validatedData.linkedTasks 
            : [validatedData.linkedTasks];
        }
        if (validatedData.completionCriteria) {
          taskObj.milestoneData = {
            type: validatedData.milestoneType || 'standalone',
            completionCriteria: Array.isArray(validatedData.completionCriteria)
              ? validatedData.completionCriteria
              : [validatedData.completionCriteria]
          };
        }
        break;

      case 'recurring':
        taskObj.isRecurring = true;
        if (validatedData.recurrencePattern) {
          taskObj.recurrencePattern = validatedData.recurrencePattern;
        } else if (validatedData.frequency) {
          taskObj.recurrencePattern = {
            frequency: validatedData.frequency,
            interval: validatedData.interval || 1,
            endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
            maxOccurrences: validatedData.maxOccurrences || null
          };
        }
        if (validatedData.nextDueDate) {
          taskObj.nextDueDate = new Date(validatedData.nextDueDate);
        }
        break;

      case 'approval':
        taskObj.isApprovalTask = true;
        
        // Validate and set approval mode
        const validApprovalModes = ['any', 'all', 'majority'];
        taskObj.approvalMode = validApprovalModes.includes(validatedData.approvalMode) 
          ? validatedData.approvalMode 
          : 'any';
          
        taskObj.approvalStatus = 'pending';
        
        // Handle approvers - ensure they're ObjectIds or empty array
        taskObj.approvers = [];
        if (validatedData.approvers && Array.isArray(validatedData.approvers)) {
          // Filter out invalid ObjectIds for now, in production you'd validate these exist
          taskObj.approvers = validatedData.approvers.filter(approver => 
            typeof approver === 'string' && approver.length === 24
          );
        }
        
        taskObj.autoApproveEnabled = validatedData.autoApproveEnabled || false;
        if (validatedData.autoApproveAfter) {
          taskObj.autoApproveAfter = parseInt(validatedData.autoApproveAfter);
        }
        break;
    }

    // Handle date fields
    if (validatedData.dueDate) {
      taskObj.dueDate = new Date(validatedData.dueDate);
    }

    console.log('Processed task object:', {
      type: taskObj.type,
      title: taskObj.title,
      hasFields: !!taskObj.fields,
      fieldsCount: Object.keys(taskObj.fields || {}).length
    });

    // Save to database
    const savedTask = await storage.createTask(taskObj);

    res.status(201).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} task created successfully`,
      data: {
        id: savedTask._id,
        type: savedTask.type,
        title: savedTask.title,
        fields: savedTask.fields,
        createdAt: savedTask.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create task',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/tasks/:id - Get task by ID
router.get('/tasks/:id', authenticateToken, async (req, res) => {
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
    const hasAccess = task.createdBy?.toString() === user.id.toString() ||
                     task.assignedTo?.toString() === user.id.toString() ||
                     (user.organizationId && task.organization?.toString() === user.organizationId.toString()) ||
                     !task.organization; // Allow access to tasks without organization for individual users

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        id: task._id,
        type: task.type || task.taskType,
        fields: task.fields || extractFieldsFromTask(task),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task'
    });
  }
});

// GET /api/tasks - Get tasks with filtering by type
router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { type, limit = 50, offset = 0 } = req.query;

    const filter = {
      $or: [
        { createdBy: user.id },
        { assignedTo: user.id },
        ...(user.organizationId ? [{ organization: user.organizationId }] : [])
      ]
    };

    if (type) {
      filter.$and = [
        { $or: filter.$or },
        { 
          $or: [
            { type: type },
            { taskType: type === 'simple' ? 'regular' : type },
            { mainTaskType: type === 'simple' ? 'regular' : type }
          ]
        }
      ];
      delete filter.$or;
    }

    const tasks = await storage.getTasks(filter, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      sort: { createdAt: -1 }
    });

    const formattedTasks = tasks.map(task => ({
      id: task._id,
      type: task.type || task.taskType || task.mainTaskType,
      title: task.title,
      status: task.status,
      priority: task.priority,
      fields: task.fields || extractFieldsFromTask(task),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }));

    res.json({
      success: true,
      data: formattedTasks,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: formattedTasks.length
      }
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
});

// Helper function to extract fields from existing task structure
function extractFieldsFromTask(task) {
  const commonFields = ['title', 'description', 'priority', 'status', 'category', 'tags', 'visibility'];
  const fields = {};
  
  commonFields.forEach(field => {
    if (task[field] !== undefined) {
      fields[field] = task[field];
    }
  });

  // Add type-specific fields
  if (task.isMilestone) {
    fields.milestoneType = task.milestoneType;
    fields.completionCriteria = task.milestoneData?.completionCriteria;
    fields.linkedTasks = task.linkedTasks;
  }

  if (task.isRecurring) {
    fields.recurrencePattern = task.recurrencePattern;
    fields.nextDueDate = task.nextDueDate;
  }

  if (task.isApprovalTask) {
    fields.approvers = task.approvers;
    fields.approvalMode = task.approvalMode;
    fields.autoApproveEnabled = task.autoApproveEnabled;
    fields.autoApproveAfter = task.autoApproveAfter;
  }

  return fields;
}

export { router as taskTypeRoutes };