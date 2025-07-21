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

// Task field definitions for frontend validation
export const TASK_FIELDS = {
  simple: [
    'title', 'description', 'priority', 'dueDate', 'assignedTo', 
    'category', 'tags', 'status', 'visibility'
  ],
  milestone: [
    'title', 'description', 'priority', 'dueDate', 'assignedTo',
    'category', 'tags', 'status', 'visibility', 'milestoneType',
    'completionCriteria', 'linkedTasks', 'projectPhase'
  ],
  recurring: [
    'title', 'description', 'priority', 'assignedTo', 'category',
    'tags', 'status', 'visibility', 'recurrencePattern', 'frequency',
    'interval', 'endDate', 'maxOccurrences', 'nextDueDate'
  ],
  approval: [
    'title', 'description', 'priority', 'dueDate', 'assignedTo',
    'category', 'tags', 'status', 'visibility', 'approvers',
    'approvalMode', 'autoApproveEnabled', 'autoApproveAfter',
    'approvalCriteria', 'requiredApprovals'
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