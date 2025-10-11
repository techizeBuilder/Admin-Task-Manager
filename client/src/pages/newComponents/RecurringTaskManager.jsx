import React, { useMemo, useState } from 'react';
// Exported form model for recurring tasks (for RecurringTaskEdit.jsx)
export const recurringTaskFormModel = [
  {
    name: 'title',
    label: 'Task Title',
    type: 'text',
    required: true,
    placeholder: 'Enter task title',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Enter description',
  },
  {
    name: 'frequency',
    label: 'Frequency',
    type: 'select',
    required: true,
    options: [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'yearly', label: 'Yearly' },
    ],
    placeholder: 'Select frequency',
  },
  {
    name: 'priority',
    label: 'Priority',
    type: 'select',
    required: true,
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ],
    placeholder: 'Select priority',
  },
  {
    name: 'nextDue',
    label: 'Next Due Date',
    type: 'date',
    required: false,
    placeholder: '',
  },
  {
    name: 'estimatedTime',
    label: 'Estimated Time (minutes)',
    type: 'number',
    required: false,
    placeholder: 'Enter estimated time',
  },
  {
    name: 'tags',
    label: 'Tags',
    type: 'text',
    required: false,
    placeholder: 'Comma separated tags',
  },
];
import { useActiveRole } from "../../components/RoleSwitcher";
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Filter,
  Grid3X3,
  List,
  Pause,
  Play,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Tag,
  MoreVertical,
  MoreVerticalIcon,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { RecurringTaskIcon } from '../../components/common/TaskIcons';
import { apiClient } from '../../utils/apiClient';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useShowToast } from '../../utils/ToastMessage';
const RecurringTaskManager = () => {
  const { showSuccessToast, showErrorToast } = useShowToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | paused
  const [priorityFilter, setPriorityFilter] = useState('all'); // all | low | medium | high
  const [frequencyFilter, setFrequencyFilter] = useState('all'); // all | daily | weekly | monthly | quarterly | yearly
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(20);

  // Local tasks state for immediate UI updates
  const [localTasks, setLocalTasks] = useState(null);

  // Edit modal state
  const [editingTask, setEditingTask] = useState(null);
  // Initialize editForm with all fields from recurringTaskFormModel
  const initialEditForm = Object.fromEntries(
    recurringTaskFormModel.map(field => [field.name, ''])
  );
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    taskId: null,
    taskTitle: '',
  });

  // Edit confirmation modal state
  const [editConfirmation, setEditConfirmation] = useState({
    isOpen: false,
    task: null,
  });

 

  // Fetch recurring tasks from API
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['recurring-tasks', currentPage, pageLimit, statusFilter, priorityFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageLimit.toString(),
      });

      // Add filters if they're not 'all'
      if (statusFilter !== 'all') {
        // Map status filter to API status
        const statusMap = {
          'active': 'todo', // or 'in-progress' depending on your logic
          'paused': 'on-hold'
        };
        if (statusMap[statusFilter]) {
          params.append('status', statusMap[statusFilter]);
        }
      }

      if (priorityFilter !== 'all') {
        params.append('priority', priorityFilter);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await apiClient.get(`/api/tasks/filter/recurring?${params.toString()}`);
      console.log('Full API Response:', response);
      console.log('Response data structure:', {
        hasSuccess: !!response.success,
        hasData: !!response.data,
        hasTasks: !!response.data?.tasks,
        tasksLength: response.data?.tasks?.length,
        fullData: response.data
      });
      return response;
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  // Transform API data to match component expectations
  const transformApiTask = (apiTask) => {
    console.log('Transforming API task:', apiTask);
    const transformed = {
      id: apiTask._id,
      title: apiTask.title,
      description: apiTask.description,
      frequency: apiTask.recurrencePattern?.frequency || 'daily', // Map from API recurrence pattern
      nextDue: apiTask.dueDate || apiTask.nextDueDate,
      isActive: apiTask.status !== 'on-hold' && apiTask.status !== 'cancelled', // Map status to active/paused
      priority: apiTask.priority,
      estimatedTime: apiTask.customFields?.estimatedTime || null,
      tags: apiTask.tags || [],
      createdBy: apiTask.createdBy ? `${apiTask.createdBy.firstName} ${apiTask.createdBy.lastName}` : 'Unknown',
      createdByRole: apiTask.createdByRole || ["employee"], // User role who created the task
      lastGenerated: apiTask.updatedAt,
      status: apiTask.status,
      category: apiTask.category,
      visibility: apiTask.visibility,
      attachments: apiTask.attachments || [],
      // Additional API fields that might be useful
      _id: apiTask._id,
      organization: apiTask.organization,
      assignedTo: apiTask.assignedTo,
      createdAt: apiTask.createdAt,
      updatedAt: apiTask.updatedAt,
      isRecurring: apiTask.isRecurring,
      recurrencePattern: apiTask.recurrencePattern,
    };
    console.log('Transformed task:', transformed);
    return transformed;
  };

  // Get tasks from API or fallback to mock data
  console.log('apiResponse:', apiResponse);
  console.log('Checking data paths:', {
    'apiResponse?.data': !!apiResponse?.data,
    'apiResponse?.data?.tasks': !!apiResponse?.data?.tasks,
    'apiResponse?.data?.data': !!apiResponse?.data?.data,
    'apiResponse?.data?.data?.tasks': !!apiResponse?.data?.data?.tasks,
    'tasksFromDirectPath': apiResponse?.data?.tasks,
    'tasksFromNestedPath': apiResponse?.data?.data?.tasks
  });

  // Get active role from context
  const { activeRole } = useActiveRole();
  // Fallback to first available role if not set
  const currentRole = activeRole || Object.keys(apiResponse?.data?.data?.roles || {})[0] || "employee";

  // Get tasks for current role from API response
  const tasksArray = apiResponse?.data?.data?.roles?.[currentRole] || [];
  console.log('Final tasks array:', tasksArray);

  const recurringTasks = tasksArray.map(transformApiTask) || [];
  const pagination = apiResponse?.data?.data?.pagination || {};
  const summary = apiResponse?.data?.data?.summary || {};

  // Mock data for development/fallback
  const mockRecurringTasks = [
    {
      id: 1,
      title: 'Weekly Team Standup Preparation',
      description: 'Prepare agenda and notes for weekly standup meeting',
      frequency: 'weekly',
      nextDue: '2025-09-10',
      isActive: true,
      priority: 'medium',
      estimatedTime: '30 minutes',
      tags: ['meeting', 'preparation'],
      createdBy: 'You',
      lastGenerated: '2025-09-03',
    },
    {
      id: 2,
      title: 'Monthly Progress Report',
      description: 'Compile and submit monthly progress report',
      frequency: 'monthly',
      nextDue: '2025-09-30',
      isActive: true,
      priority: 'high',
      estimatedTime: '2 hours',
      tags: ['report', 'monthly'],
      createdBy: 'You',
      lastGenerated: '2025-08-30',
    },
    {
      id: 3,
      title: 'Daily Task Review',
      description: 'Review and prioritize daily tasks',
      frequency: 'daily',
      nextDue: '2025-09-04',
      isActive: false,
      priority: 'low',
      estimatedTime: '15 minutes',
      tags: ['review', 'daily'],
      createdBy: 'You',
      lastGenerated: '2025-09-03',
    }
  ];

  const currentTasks = localTasks ?? ((recurringTasks && recurringTasks.length > 0) ? recurringTasks : mockRecurringTasks);

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return labels[frequency] || frequency || 'Not Set';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusPill = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const now = new Date();
  const inDays = (dateStr) => {
    const d = new Date(dateStr);
    return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  };

  const stats = useMemo(() => {
    console.log('Stats calculation - currentTasks:', currentTasks);
    console.log('Stats calculation - apiResponse:', apiResponse);

    // Use currentTasks which includes local updates
    const activeTasks = currentTasks;

    // Use real data from API if available, otherwise calculate from current tasks
    if (apiResponse?.data?.data?.summary && !localTasks) {
      const apiSummary = apiResponse.data.data.summary;
      const total = apiSummary.totalCount || activeTasks.length;
      const active = activeTasks.filter(t => t.isActive).length;
      const paused = activeTasks.filter(t => !t.isActive).length;
      const overdue = activeTasks.filter(t => t.nextDue && new Date(t.nextDue) < now).length;
      const dueSoon = activeTasks.filter(t => t.nextDue && inDays(t.nextDue) >= 0 && inDays(t.nextDue) <= 7).length;
      return { total, active, paused, overdue, dueSoon };
    } else {
      // Fallback to calculating from current tasks (includes local updates)
      const total = activeTasks.length;
      const active = activeTasks.filter(t => t.isActive).length;
      const paused = activeTasks.filter(t => !t.isActive).length;
      const overdue = activeTasks.filter(t => t.nextDue && new Date(t.nextDue) < now).length;
      const dueSoon = activeTasks.filter(t => t.nextDue && inDays(t.nextDue) >= 0 && inDays(t.nextDue) <= 7).length;
      return { total, active, paused, overdue, dueSoon };
    }
  }, [currentTasks, apiResponse, localTasks]);

  const filteredTasks = currentTasks.filter(task => {
    const matchesSearch =
      !searchTerm ||
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && task.isActive) ||
      (statusFilter === 'paused' && !task.isActive);

    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter;

    const matchesFrequency =
      frequencyFilter === 'all' || task.frequency === frequencyFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesFrequency;
  });

  const handleToggleActive = async (id) => {
    try {
      const task = currentTasks.find(t => t.id === id || t._id === id);
      if (!task) return;

      const newStatus = task.isActive ? 'on-hold' : 'todo';

      // Update local state immediately for better UX
      setLocalTasks(prev => {
        const currentList = prev ?? currentTasks;
        return currentList.map(t =>
          (t.id === id || t._id === id)
            ? { ...t, isActive: !t.isActive, status: newStatus }
            : t
        );
      });

      await apiClient.patch(`/api/tasks/${task._id || id}/status`, {
        status: newStatus
      });

      // Show success message
      showSuccessToast(`Task "${task.title}" ${newStatus === 'on-hold' ? 'paused' : 'activated'} successfully!`);

      // Background sync to ensure consistency
      refetch();
    } catch (error) {
      console.error('Error toggling task status:', error);
      showErrorToast(`Error toggling task status: ${error.message}`);
      // Revert local changes on error
      setLocalTasks(prev => {
        const currentList = prev ?? currentTasks;
        return currentList.map(t =>
          (t.id === id || t._id === id)
            ? { ...t, isActive: !t.isActive }
            : t
        );
      });
    }
  };

  const handleEdit = (id) => {
    const task = currentTasks.find(t => t.id === id || t._id === id);
    if (!task) return;

    // Show edit confirmation first
    setEditConfirmation({
      isOpen: true,
      task: task,
    });
  };

  const confirmEditModal = (task) => {
    setEditingTask(task);
    // Populate editForm with all fields from recurringTaskFormModel
    const newForm = {};
    recurringTaskFormModel.forEach(field => {
      if (field.name === 'tags') {
        newForm.tags = Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || '');
      } else if (field.name === 'estimatedTime') {
        newForm.estimatedTime = task.estimatedTime || '';
      } else if (field.name === 'nextDue') {
        newForm.nextDue = task.nextDue ? new Date(task.nextDue).toISOString().slice(0, 10) : '';
      } else {
        newForm[field.name] = task[field.name] || '';
      }
    });
    setEditForm(newForm);

    // Close edit confirmation
    setEditConfirmation({
      isOpen: false,
      task: null,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingTask) return;
    setEditLoading(true);
    try {
      // Prepare payload from editForm using the correct API format
      const payload = {};
      recurringTaskFormModel.forEach(field => {
        if (field.name === 'tags') {
          payload.tags = editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        } else if (field.name === 'estimatedTime') {
          payload.estimatedTime = editForm.estimatedTime;
        } else if (field.name === 'nextDue') {
          payload.dueDate = editForm.nextDue ? new Date(editForm.nextDue).toISOString() : null;
        } else if (field.name === 'title') {
          payload.title = editForm[field.name];
        } else {
          payload[field.name] = editForm[field.name];
        }
      });

      // Use PUT method with correct endpoint
      console.log('Sending update request with payload:', payload);
      const response = await apiClient.put(`/api/tasks/${editingTask._id || editingTask.id}`, payload);
      console.log('Update response:', response);

      // Check if response is successful (axios returns status 200-299 as success)
      if (response.status >= 200 && response.status < 300) {
        // Check if response has explicit success field or assume success based on status
        const isSuccess = response.data.success !== false; // Consider success unless explicitly false

        if (isSuccess) {
          // Update local tasks state immediately for better UX
          const updatedTask = {
            ...editingTask,
            title: editForm.title,
            description: editForm.description,
            priority: editForm.priority,
            frequency: editForm.frequency,
            nextDue: editForm.nextDue,
            estimatedTime: editForm.estimatedTime,
            tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          };

          setLocalTasks(prev => {
            const currentList = prev ?? currentTasks;
            return currentList.map(task =>
              (task.id === editingTask.id || task._id === editingTask._id)
                ? updatedTask
                : task
            );
          });

          // Show success message
          showSuccessToast(`Task "${editForm.title}" updated successfully!`);

          // Close modal automatically
          setEditingTask(null);

          // Background sync to ensure consistency (after UI update for better UX)
          setTimeout(() => {
            refetch();
          }, 500);
        } else {
          const errorMessage = response.data?.message || "Failed to update task.";
          showErrorToast(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error updating recurring task:', error);

      // Handle different error response structures
      let errorMessage = "Error updating recurring task.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showErrorToast(errorMessage);
    }
    setEditLoading(false);
  };

  const handleEditModalClose = () => {
    setEditingTask(null);
  };

  const handleDelete = async (id) => {
    const task = currentTasks.find(t => t.id === id || t._id === id);
    if (!task) return;

    // Show delete confirmation
    setDeleteConfirmation({
      isOpen: true,
      taskId: id,
      taskTitle: task.title,
    });
  };

  const confirmDelete = async (taskId) => {
    try {
      const task = currentTasks.find(t => t.id === taskId || t._id === taskId);
      const actualTaskId = task?._id || taskId;

      console.log('Deleting task with ID:', actualTaskId);
      console.log('Delete API URL:', `/api/tasks/delete/${actualTaskId}`);

      // Update local state immediately for better UX
      setLocalTasks(prev => {
        const currentList = prev ?? currentTasks;
        return currentList.filter(t => t.id !== taskId && t._id !== taskId);
      });

      const response = await apiClient.delete(`/api/tasks/delete/${actualTaskId}`);
      console.log('Delete response:', response);

      // Close confirmation modal
      setDeleteConfirmation({
        isOpen: false,
        taskId: null,
        taskTitle: '',
      });

      // Show success message
      showSuccessToast(`Task "${deleteConfirmation.taskTitle}" deleted successfully!`);

      // Background sync to ensure consistency
      refetch();
      console.log('Task deleted successfully, refetching data...');
    } catch (error) {
      console.error('Error deleting task:', error);
      console.error('Error details:', error.response?.data || error.message);
      showErrorToast(`Error deleting task: ${error.response?.data?.message || error.message}`);

      // Revert local changes on error - refetch to get current state
      refetch();
    }
  };

  const handleCreateNew = () => {
    window.location.href = '/tasks/create?type=recurring';
  };

  // Handle search with debounced API calls
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePriorityFilterChange = (e) => {
    setPriorityFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Show loading state
  if (isLoading && !currentTasks.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recurring tasks...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !currentTasks.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading recurring tasks: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">Confirm Delete</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete the recurring task "<strong>{deleteConfirmation.taskTitle}</strong>"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setDeleteConfirmation({ isOpen: false, taskId: null, taskTitle: '' })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                onClick={() => confirmDelete(deleteConfirmation.taskId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {editConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-purple-600 mb-4">Confirm Edit</h2>
            <p className="text-gray-700 mb-6">
              Do you want to edit the recurring task "<strong>{editConfirmation.task?.title}</strong>"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setEditConfirmation({ isOpen: false, task: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                onClick={() => confirmEditModal(editConfirmation.task)}
              >
                Continue to Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md relative flex flex-col"
            style={{ maxHeight: '80vh' }}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={handleEditModalClose}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 px-6 pt-6">Edit Recurring Task</h2>
            <form
              onSubmit={handleEditFormSubmit}
              className="space-y-4 px-6 pb-6 overflow-y-auto"
              style={{ maxHeight: '60vh' }}
            >
              {recurringTaskFormModel.map(field => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={editForm[field.name]}
                      onChange={handleEditFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={editForm[field.name]}
                      onChange={handleEditFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required={field.required}
                    >
                      <option value="">{field.placeholder}</option>
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={editForm[field.name]}
                      onChange={handleEditFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleEditModalClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-lg bg-purple-500 flex items-center justify-center">
                <RecurringTaskIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Recurring Tasks</h1>
                <p className="text-sm text-gray-600">Manage recurring task templates and schedules</p>
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
              data-testid="button-create-recurring-task"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recurring Task
            </button>
          </div>

          {/* Loading indicator and refresh button */}
          <div className="flex items-center justify-between">
            {isLoading && (
              <div className="flex items-center text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                Loading recurring tasks...
              </div>
            )}

            {error && (
              <div className="flex items-center text-sm text-red-600">
                <span className="mr-2">Error loading tasks</span>
                <button
                  onClick={() => refetch()}
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !error && (
              <button
                onClick={() => refetch()}
                className="text-sm text-gray-600 hover:text-gray-800"
                title="Refresh tasks"
              >
                🔄 Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <RecurringTaskIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Play className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paused</p>
                <p className="text-2xl font-bold text-gray-600">{stats.paused}</p>
              </div>
              <Pause className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due Soon</p>
                <p className="text-2xl font-bold text-blue-600">{stats.dueSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <Calendar className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters and View Controls */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <input
                type="text"
                placeholder="Search recurring tasks..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                data-testid="input-search-recurring-tasks"
              />

              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                data-testid="filter-status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>

              <select
                value={priorityFilter}
                onChange={handlePriorityFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                data-testid="filter-priority"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <select
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                data-testid="filter-frequency"
              >
                <option value="all">All Frequency</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 self-start md:self-auto">
              <div className="flex items-center bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col justify-between bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                data-testid={`recurring-task-card-${task.id}`}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    {/* Left section */}
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <RecurringTaskIcon className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{task.title}</h3>
                        <p className="text-xs text-gray-600">{getFrequencyLabel(task.frequency)}</p>
                      </div>
                    </div>

                    {/* Actions - 3-dot menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVerticalIcon className="h-4 w-4 text-gray-600" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 bg-white">
                        <DropdownMenuItem onClick={() => handleToggleActive(task.id)}>
                          {task.isActive ? (
                            <>
                              <Pause className="h-3.5 w-3.5 mr-2 text-gray-600" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5 mr-2 text-green-600" /> Resume
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(task.id)}>
                          <Edit3 className="h-3.5 w-3.5 mr-2 text-gray-600" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(task.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-2 text-red-600" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 mb-2">{task.description}</p>

                  {/* Status + Priority */}
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusPill(
                        task.isActive
                      )}`}
                    >
                      {task.isActive ? "ACTIVE" : "PAUSED"}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority?.toUpperCase() || "N/A"}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      <Tag className="h-3 w-3 mr-1" />
                      {getFrequencyLabel(task.frequency)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">
                        Next Due: {task.nextDue ? new Date(task.nextDue).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">Est. Time: {task.estimatedTime || "—"}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Tag className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">Created By: {task.createdBy || "—"}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">
                        Last Gen: {task.lastGenerated ? new Date(task.lastGenerated).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-1">Tags</h4>
                      <div className="flex items-center flex-wrap gap-1.5">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-md">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleToggleActive(task.id)}
                      className="inline-flex items-center px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {task.isActive ? <Pause className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
                      {task.isActive ? "Pause" : "Resume"}
                    </button>
                    <button
                      onClick={() => handleEdit(task.id)}
                      className="inline-flex items-center px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="inline-flex items-center px-2.5 py-1 text-xs text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <RecurringTaskIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusPill(task.isActive)}`}>
                            {task.isActive ? 'ACTIVE' : 'PAUSED'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority?.toUpperCase() || 'N/A'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            {getFrequencyLabel(task.frequency)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Next Due: {task.nextDue ? new Date(task.nextDue).toLocaleDateString() : '—'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Est. Time: {task.estimatedTime || '—'}</span>
                          </span>
                          {task.tags?.length ? (
                            <span className="flex items-center gap-1">
                              <Tag className="h-4 w-4" />
                              <span>{task.tags.slice(0, 2).join(', ')}{task.tags.length > 2 ? ` +${task.tags.length - 2}` : ''}</span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(task.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={task.isActive ? 'Pause' : 'Resume'}
                      >
                        {task.isActive ? <Pause className="h-4 w-4 text-gray-600" /> : <Play className="h-4 w-4 text-green-600" />}
                      </button>
                      <button
                        onClick={() => handleEdit(task.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring tasks found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && viewMode === 'grid' && !isLoading && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring tasks found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first recurring task template.</p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recurring Task
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing page {pagination.currentPage} of {pagination.totalPages}
                ({pagination.totalTasks} total tasks)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                if (pageNum > pagination.totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${pageNum === pagination.currentPage
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

 
    </div>
  );
};

export default RecurringTaskManager;