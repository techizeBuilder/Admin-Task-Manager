// Quick Tasks API Service
// This file provides API functions for Quick Tasks management

const API_BASE_URL = '/api/quick-tasks';

class QuickTasksAPI {
  constructor() {
    this.mockData = [
      {
        id: '1',
        title: 'Review daily reports',
        createdBy: 'user123',
        priority: 'medium',
        dueDate: new Date('2025-01-05').toISOString(),
        status: 'open',
        createdAt: new Date('2025-01-04T09:00:00Z').toISOString(),
        updatedAt: new Date('2025-01-04T09:00:00Z').toISOString(),
        completedAt: null
      },
      {
        id: '2',
        title: 'Call client for follow-up',
        createdBy: 'user123',
        priority: 'high',
        dueDate: new Date('2025-01-04').toISOString(),
        status: 'open',
        createdAt: new Date('2025-01-04T08:30:00Z').toISOString(),
        updatedAt: new Date('2025-01-04T08:30:00Z').toISOString(),
        completedAt: null
      },
      {
        id: '3',
        title: 'Update project documentation',
        createdBy: 'user123',
        priority: 'low',
        dueDate: null,
        status: 'done',
        createdAt: new Date('2025-01-03T14:20:00Z').toISOString(),
        updatedAt: new Date('2025-01-04T10:15:00Z').toISOString(),
        completedAt: new Date('2025-01-04T10:15:00Z').toISOString()
      },
      {
        id: '4',
        title: 'Prepare presentation slides',
        createdBy: 'user123',
        priority: 'high',
        dueDate: new Date('2025-01-06').toISOString(),
        status: 'open',
        createdAt: new Date('2025-01-04T11:00:00Z').toISOString(),
        updatedAt: new Date('2025-01-04T11:00:00Z').toISOString(),
        completedAt: null
      }
    ];
  }

  // Get authentication token
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Get auth headers
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // GET /api/quick-tasks - Fetch all quick tasks for current user
  async fetchQuickTasks(params = {}) {
    try {
      const hasToken = !!this.getAuthToken();
      console.log('🔐 Has auth token:', hasToken);
      
      // For development/mock - return mock data
      if (!hasToken) {
        console.log('📝 Using mock data (no auth token)');
        let filteredData = [...this.mockData];
        
        // Apply filters
        if (params.status && params.status !== 'all') {
          filteredData = filteredData.filter(t => t.status === params.status);
        }
        if (params.priority && params.priority !== 'all') {
          filteredData = filteredData.filter(t => t.priority === params.priority);
        }
        if (params.search) {
          const search = params.search.toLowerCase();
          filteredData = filteredData.filter(t => 
            t.title.toLowerCase().includes(search)
          );
        }
        
        console.log('✅ Mock data returned:', filteredData);
        return {
          success: true,
          quickTasks: filteredData,
          data: filteredData, // Keep both for compatibility
          message: 'Quick tasks fetched successfully (mock data)',
          pagination: {
            total: filteredData.length,
            page: 1,
            limit: 50,
            pages: 1
          }
        };
      }

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== 'all') queryParams.append(key, value);
      });
      
      const url = queryParams.toString() ? `${API_BASE_URL}?${queryParams}` : API_BASE_URL;
      console.log('🔗 API URL:', url);
      console.log('🔑 Auth headers:', this.getAuthHeaders());
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });
      
      console.log('📡 Fetch response status:', response.status);
      console.log('📡 Fetch response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Fetch API Error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Fetch API Success:', result);
      return result;
    } catch (error) {
      console.error('Error fetching quick tasks:', error);
      throw new Error('Failed to fetch quick tasks');
    }
  }

  // POST /api/quick-tasks - Create new quick task
  async createQuickTask(taskData) {
    try {
      console.log('🚀 Frontend - Creating Quick Task');
      console.log('📋 taskData:', taskData);
      console.log('🔑 Auth token exists:', !!this.getAuthToken());
      console.log('🔑 Auth headers:', this.getAuthHeaders());
      
      const hasToken = !!this.getAuthToken();
      console.log('🔐 Create - Has auth token:', hasToken);
      
      const newTask = {
        id: Date.now().toString(),
        title: taskData.title,
        createdBy: 'current-user-id',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || null,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
      };

      // For development/mock
      if (!hasToken) {
        console.log('📝 Using mock create (no auth token)');
        this.mockData.unshift(newTask);
        this.mockData.unshift(newTask);
        console.log('✅ Mock task created:', newTask);
        return {
          success: true,
          quickTask: newTask,
          data: newTask, // Keep both for compatibility
          message: 'Quick task created successfully (mock)'
        };
      }

      console.log('🚀 Making real API call to create task');
      console.log('📤 Request URL:', API_BASE_URL);
      console.log('📤 Request headers:', this.getAuthHeaders());
      console.log('📤 Request body:', JSON.stringify(taskData));
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(taskData)
      });
      
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ API Success Response:', result);
      return result;
    } catch (error) {
      console.error('Error creating quick task:', error);
      throw new Error('Failed to create quick task');
    }
  }

  // PATCH /api/quick-tasks/:id - Update quick task
  async updateQuickTask(taskId, updates) {
    try {
      // For development/mock
      if (process.env.NODE_ENV === 'development' && !this.getAuthToken()) {
        const taskIndex = this.mockData.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
          throw new Error('Task not found');
        }

        this.mockData[taskIndex] = {
          ...this.mockData[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };

        return {
          success: true,
          data: this.mockData[taskIndex],
          message: 'Quick task updated successfully (mock)'
        };
      }

      const response = await fetch(`${API_BASE_URL}/${taskId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating quick task:', error);
      throw new Error('Failed to update quick task');
    }
  }

  // PATCH /api/quick-tasks/:id/status - Update task status
  async updateTaskStatus(taskId, status) {
    try {
      const updates = {
        status,
        completedAt: status === 'done' ? new Date().toISOString() : null
      };

      // For development/mock
      if (process.env.NODE_ENV === 'development' && !this.getAuthToken()) {
        const taskIndex = this.mockData.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
          throw new Error('Task not found');
        }

        this.mockData[taskIndex] = {
          ...this.mockData[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };

        return {
          success: true,
          data: this.mockData[taskIndex],
          message: `Task marked as ${status} successfully (mock)`
        };
      }

      const response = await fetch(`${API_BASE_URL}/${taskId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  }

  // DELETE /api/quick-tasks/:id - Delete quick task
  async deleteQuickTask(taskId) {
    try {
      // For development/mock
      if (process.env.NODE_ENV === 'development' && !this.getAuthToken()) {
        const taskIndex = this.mockData.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
          throw new Error('Task not found');
        }

        const deletedTask = this.mockData.splice(taskIndex, 1)[0];
        return {
          success: true,
          data: deletedTask,
          message: 'Quick task deleted successfully (mock)'
        };
      }

      const response = await fetch(`${API_BASE_URL}/${taskId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting quick task:', error);
      throw new Error('Failed to delete quick task');
    }
  }

  // POST /api/quick-tasks/:id/convert - Convert quick task to full task
  async convertToFullTask(taskId, taskType = 'regular', additionalData = {}) {
    try {
      const conversionData = {
        taskType,
        ...additionalData
      };

      // For development/mock
      if (process.env.NODE_ENV === 'development' && !this.getAuthToken()) {
        const task = this.mockData.find(t => t.id === taskId);
        if (!task) {
          throw new Error('Task not found');
        }

        // Mark as converted
        const updatedTask = {
          ...task,
          conversionFlag: {
            isConverted: true,
            convertedToTaskId: `task-${Date.now()}`,
            convertedToTaskType: taskType,
            convertedAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        };

        const taskIndex = this.mockData.findIndex(t => t.id === taskId);
        this.mockData[taskIndex] = updatedTask;

        return {
          success: true,
          data: {
            quickTask: updatedTask,
            newTaskId: updatedTask.conversionFlag.convertedToTaskId,
            taskType
          },
          message: 'Quick task converted to full task successfully (mock)'
        };
      }

      const response = await fetch(`${API_BASE_URL}/${taskId}/convert`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(conversionData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error converting quick task:', error);
      throw new Error('Failed to convert quick task to full task');
    }
  }

  // GET /api/quick-tasks/stats - Get quick tasks statistics
  async getQuickTaskStats() {
    try {
      // For development/mock
      if (process.env.NODE_ENV === 'development' && !this.getAuthToken()) {
        const total = this.mockData.length;
        const completed = this.mockData.filter(t => t.status === 'done').length;
        const pending = this.mockData.filter(t => t.status === 'open').length;
        const archived = this.mockData.filter(t => t.status === 'archived').length;
        const highPriority = this.mockData.filter(t => t.priority === 'high' && t.status !== 'done').length;
        const overdue = this.mockData.filter(t => {
          if (!t.dueDate || t.status === 'done') return false;
          return new Date(t.dueDate) < new Date();
        }).length;

        return {
          success: true,
          data: {
            total,
            completed,
            pending,
            archived,
            highPriority,
            overdue
          },
          message: 'Quick task statistics fetched successfully (mock)'
        };
      }

      const response = await fetch(`${API_BASE_URL}/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching quick task stats:', error);
      throw new Error('Failed to fetch quick task statistics');
    }
  }
}

// Export singleton instance
export const quickTasksAPI = new QuickTasksAPI();
export default quickTasksAPI;