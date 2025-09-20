// Task API Service
const API_BASE_URL = '/api/tasks';

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Create headers with auth token (for multipart form data)
const createFormDataHeaders = () => {
    const token = getAuthToken();
    return {
        // Don't set Content-Type for FormData, browser will set it automatically with boundary
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Create headers with auth token (for JSON)
const createHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const taskService = {
    // Create task (supports all types: regular, recurring, milestone, approval)
    async createTask(taskData) {
        try {
            // Create FormData for multipart/form-data
            const formData = new FormData();

            // Add all required and optional fields to FormData
            formData.append('title', taskData.title || '');
            formData.append('taskType', taskData.taskType || 'regular');
            formData.append('createdByRole', taskData.createdByRole || 'individual');

            // Optional fields
            if (taskData.description) formData.append('description', taskData.description);
            if (taskData.dueDate) formData.append('dueDate', taskData.dueDate);
            if (taskData.startDate) formData.append('startDate', taskData.startDate);
            if (taskData.priority) formData.append('priority', taskData.priority);
            if (taskData.category) formData.append('category', taskData.category);
            if (taskData.assignedTo) formData.append('assignedTo', taskData.assignedTo);
            if (taskData.status) formData.append('status', taskData.status);
            if (taskData.visibility) formData.append('visibility', taskData.visibility);

            // JSON array strings
            if (taskData.tags && Array.isArray(taskData.tags)) {
                formData.append('tags', JSON.stringify(taskData.tags));
            }
            if (taskData.collaboratorIds && Array.isArray(taskData.collaboratorIds)) {
                formData.append('collaboratorIds', JSON.stringify(taskData.collaboratorIds));
            }
            if (taskData.dependsOnTaskIds && Array.isArray(taskData.dependsOnTaskIds)) {
                formData.append('dependsOnTaskIds', JSON.stringify(taskData.dependsOnTaskIds));
            }
            if (taskData.approverIds && Array.isArray(taskData.approverIds)) {
                formData.append('approverIds', JSON.stringify(taskData.approverIds));
            }
            if (taskData.linkedTaskIds && Array.isArray(taskData.linkedTaskIds)) {
                formData.append('linkedTaskIds', JSON.stringify(taskData.linkedTaskIds));
            }

            // JSON object strings
            if (taskData.recurrencePattern) {
                formData.append('recurrencePattern', JSON.stringify(taskData.recurrencePattern));
            }
            if (taskData.milestoneData) {
                formData.append('milestoneData', JSON.stringify(taskData.milestoneData));
            }
            if (taskData.approvalData) {
                formData.append('approvalData', JSON.stringify(taskData.approvalData));
            }

            // Other optional fields
            if (taskData.referenceProcess) formData.append('referenceProcess', taskData.referenceProcess);
            if (taskData.customForm) formData.append('customForm', taskData.customForm);

            // File attachments
            if (taskData.attachments && Array.isArray(taskData.attachments)) {
                taskData.attachments.forEach((file, index) => {
                    if (file.file instanceof File) {
                        formData.append('attachments', file.file);
                    }
                });
            }

            const response = await fetch('/api/create-task', {
                method: 'POST',
                headers: createFormDataHeaders(),
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || errorData.error || 'Failed to create task');
            }

            return await response.json();
        } catch (error) {
            console.error('Create task error:', error);
            throw error;
        }
    },

    // Legacy method for backward compatibility
    async createRegularTask(taskData) {
        return this.createTask({
            ...taskData,
            taskType: 'regular'
        });
    },

    // Get all tasks
    async getTasks() {
        try {
            const response = await fetch(API_BASE_URL, {
                headers: createHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch tasks error:', error);
            throw error;
        }
    },

    // Update task
    async updateTask(taskId, updateData) {
        try {
            const response = await fetch(`${API_BASE_URL}/${taskId}`, {
                method: 'PUT',
                headers: createHeaders(),
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update task');
            }

            return await response.json();
        } catch (error) {
            console.error('Update task error:', error);
            throw error;
        }
    },

    // Delete task
    async deleteTask(taskId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${taskId}`, {
                method: 'DELETE',
                headers: createHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete task');
            }

            return await response.json();
        } catch (error) {
            console.error('Delete task error:', error);
            throw error;
        }
    }
};

export default taskService;
