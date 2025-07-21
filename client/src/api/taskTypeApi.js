import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Task Type API functions
export const taskTypeApi = {
  // Create task based on type
  createTask: async (type, data) => {
    try {
      const response = await api.post('/tasks', {
        type,
        data
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create task');
    }
  },

  // Get task by ID
  getTask: async (id) => {
    try {
      const response = await api.get(`/tasks/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch task');
    }
  },

  // Get tasks with optional filtering
  getTasks: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);
      
      const response = await api.get(`/tasks?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
    }
  },

  // Helper functions for specific task types
  createSimpleTask: async (data) => {
    return taskTypeApi.createTask('simple', data);
  },

  createMilestoneTask: async (data) => {
    return taskTypeApi.createTask('milestone', data);
  },

  createRecurringTask: async (data) => {
    return taskTypeApi.createTask('recurring', data);
  },

  createApprovalTask: async (data) => {
    return taskTypeApi.createTask('approval', data);
  },

  // Get tasks by type
  getSimpleTasks: async (limit = 50, offset = 0) => {
    return taskTypeApi.getTasks({ type: 'simple', limit, offset });
  },

  getMilestoneTasks: async (limit = 50, offset = 0) => {
    return taskTypeApi.getTasks({ type: 'milestone', limit, offset });
  },

  getRecurringTasks: async (limit = 50, offset = 0) => {
    return taskTypeApi.getTasks({ type: 'recurring', limit, offset });
  },

  getApprovalTasks: async (limit = 50, offset = 0) => {
    return taskTypeApi.getTasks({ type: 'approval', limit, offset });
  }
};

// Task field definitions matching backend - based on user requirements
export const TASK_FIELDS = {
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

// Validation helper
export const validateTaskData = (type, data) => {
  const allowedFields = TASK_FIELDS[type];
  if (!allowedFields) {
    throw new Error(`Invalid task type: ${type}`);
  }

  // Filter only allowed fields
  const filteredData = {};
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  });

  // Check required fields
  if (!filteredData.title) {
    throw new Error('Title is required');
  }

  return filteredData;
};

export default taskTypeApi;