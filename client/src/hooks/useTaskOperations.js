import { useState } from 'react';
import { taskService } from '../services/taskService';
import { hasAccess } from '../utils/auth';

export const useTaskOperations = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get current user role for createdByRole field
    const getCurrentUserRole = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (hasAccess(['super_admin'])) return 'super_admin';
        if (hasAccess(['org_admin'])) return 'org_admin';
        if (hasAccess(['manager'])) return 'manager';
        if (hasAccess(['employee'])) return 'employee';
        if (hasAccess(['individual'])) return 'individual';
        return user.role?.[0] || 'individual';
    };

    // Get current user ID for assignedTo field
    const getCurrentUserId = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id || user._id || null;
    };

    // Map form values to API enum values
    const mapPriority = (priority) => {
        const priorityMap = {
            'Low': 'low',
            'Medium': 'medium',
            'High': 'high',
            'Critical': 'critical',
            'Urgent': 'urgent'
        };
        return priorityMap[priority] || 'low';
    }; const mapTaskType = (taskType) => {
        const taskTypeMap = {
            'Simple': 'regular',
            'Regular': 'regular',
            'Recurring': 'recurring',
            'Approval': 'approval',
            'Milestone': 'milestone'
        };
        return taskTypeMap[taskType] || 'regular';
    };

    const mapVisibility = (visibility) => {
        const visibilityMap = {
            'private': 'private',
            'public': 'team', // Map public to team since public doesn't exist
            'team': 'team',
            'organization': 'organization'
        };
        return visibilityMap[visibility] || 'private';
    };

    const mapAssignedTo = (assignedTo) => {
        if (assignedTo === 'self') {
            const userId = getCurrentUserId();
            if (!userId) {
                console.warn('⚠️ User ID not found, using assignedTo as is');
                return 'self'; // Fallback - backend should handle this
            }
            return userId;
        }
        return assignedTo;
    };

    const createTask = async (taskData) => {
        setLoading(true);
        setError(null);

        try {
            // Transform form data to API format according to Swagger spec
            const apiData = {
                // Required fields
                title: taskData.taskName || taskData.title,
                taskType: mapTaskType(taskData.taskType?.value || taskData.taskType || 'Simple'),
                mainTaskType: mapTaskType(taskData.taskType?.value || taskData.taskType || 'Simple'),
                createdByRole: getCurrentUserRole(),

                // Optional fields
                description: taskData.description || '',
                priority: mapPriority(taskData.priority?.value || taskData.priority || 'Low'),
                dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
                startDate: taskData.startDate ? new Date(taskData.startDate).toISOString() : null,
                category: taskData.category || '',
                assignedTo: mapAssignedTo(taskData.assignedTo?.value || taskData.assignedTo || 'self'),
                status: taskData.status || 'todo',
                visibility: mapVisibility(taskData.visibility || 'private'),

                // Arrays (will be converted to JSON strings in service)
                tags: taskData.tags?.map(tag => typeof tag === 'string' ? tag : tag.value) || [],
                collaboratorIds: taskData.collaboratorIds || [],
                dependsOnTaskIds: taskData.dependencies?.map(dep => dep.value) || [],
                approverIds: taskData.approverIds || [],
                linkedTaskIds: taskData.linkedTaskIds || [],

                // JSON objects for specialized task types
                recurrencePattern: taskData.recurrencePattern || null,
                milestoneData: taskData.milestoneData || null,
                approvalData: taskData.approvalData || null,

                // Advanced fields
                referenceProcess: taskData.referenceProcess?.value || taskData.referenceProcess || null,
                customForm: taskData.customForm?.value || taskData.customForm || null,

                // File attachments
                attachments: taskData.attachments || []
            };

            console.log('🚀 Sending API Data:', JSON.stringify(apiData, null, 2));
            const response = await taskService.createTask(apiData);

            return {
                success: true,
                data: response,
                message: response.message || 'Task created successfully'
            };
        } catch (err) {
            setError(err.message);
            return {
                success: false,
                error: err.message
            };
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (taskId, taskData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await taskService.updateTask(taskId, taskData);
            return {
                success: true,
                data: response,
                message: 'Task updated successfully'
            };
        } catch (err) {
            setError(err.message);
            return {
                success: false,
                error: err.message
            };
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async (taskId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await taskService.deleteTask(taskId);
            return {
                success: true,
                data: response,
                message: 'Task deleted successfully'
            };
        } catch (err) {
            setError(err.message);
            return {
                success: false,
                error: err.message
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        createTask,
        updateTask,
        deleteTask,
        loading,
        error,
        clearError: () => setError(null)
    };
};

export default useTaskOperations;