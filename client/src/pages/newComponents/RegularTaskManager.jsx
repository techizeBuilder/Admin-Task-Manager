import React, { useState, useMemo } from "react";
// Exported form model for regular tasks (for RecurringTaskEdit.jsx)
export const regularTaskFormModel = [
  {
    name: 'taskName',
    label: 'Task Name',
    type: 'text',
    required: true,
    placeholder: 'Enter task name',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    placeholder: 'Enter description',
  },
  {
    name: 'assignedTo',
    label: 'Assigned To',
    type: 'select',
    required: false,
    placeholder: 'Select assignee',
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
      { value: 'critical', label: 'Critical' },
    ],
    placeholder: 'Select priority',
  },
  {
    name: 'dueDate',
    label: 'Due Date',
    type: 'date',
    required: true,
    placeholder: '',
  },
  {
    name: 'visibility',
    label: 'Visibility',
    type: 'select',
    required: true,
    options: [
      { value: 'private', label: 'Private' },
      { value: 'public', label: 'Public' },
    ],
    placeholder: 'Select visibility',
  },
  {
    name: 'labels',
    label: 'Labels',
    type: 'text',
    required: false,
    placeholder: 'Comma separated labels',
  },
];

import { useActiveRole } from "../../components/RoleSwitcher";
import { useQuery } from '@tanstack/react-query';
import { createPortal } from "react-dom";
import {
  Plus,
  Target,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Edit3,
  Share2,
  X,
  File,
  Tag,
  Paperclip,
  MoreVerticalIcon,
  Play,
  Trash2
} from "lucide-react";
import { apiClient } from '../../utils/apiClient';
import { RegularTaskIcon } from "../../components/common/TaskIcons";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
// THEME: Regular Task uses teal; Milestone uses purple
const RT = {
  // base
  primary: "teal",
  // color utility classes
  btn: "bg-teal-600 hover:bg-teal-700 text-white",
  chip: {
    primary: "bg-teal-100 text-teal-800 border border-teal-200",
  },
  icon: "text-teal-600",
  panelHeader: "border-b border-gray-200",
  headerBg: "bg-white",
  headerBorder: "border-b border-gray-200",
};

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

// Helpers
const getStatusColor = (status) => {
  const colors = {
    not_started: "bg-gray-100 text-gray-800 border-gray-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getPriorityColor = (priority) => {
  const colors = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    critical: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[priority] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getStatusIcon = (status) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-blue-600" />;
    case "overdue":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

// Auto due date based on priority (can be tweaked/plugged to backend logic)
const dueDateFromPriority = (priority) => {
  const base = new Date();
  const addDays = (d) => {
    const dt = new Date(base);
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().slice(0, 10);
  };
  switch (priority) {
    case "low":
      return addDays(7);
    case "medium":
      return addDays(3);
    case "high":
      return addDays(1);
    case "critical":
      return addDays(0);
    default:
      return addDays(7);
  }
};

export default function RegularTaskManager() {
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Edit modal state
  const [editingTask, setEditingTask] = useState(null);
  // Initialize editForm with all fields from regularTaskFormModel
  const initialEditForm = Object.fromEntries(
    regularTaskFormModel.map(field => [field.name, ''])
  );
  initialEditForm.assignedToId = '';
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Fetch regular tasks from API
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['regular-tasks', currentPage, pageLimit, statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageLimit.toString(),
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      const response = await apiClient.get(`/api/tasks/filter/regular?${params.toString()}`);
      return response;
    },
    retry: 1,
    staleTime: 30000,
  });

  // Fetch team members for assignment dropdown
  const { data: teamMembersResponse } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await apiClient.get('/api/team-members');
      return response;
    },
    retry: 1,
    staleTime: 300000, // 5 minutes
  });

  const teamMembers = teamMembersResponse?.data || [];

  // Get active role from context
  const { activeRole } = useActiveRole();
  // Fallback to first available role if not set
  const currentRole = activeRole || Object.keys(apiResponse?.data?.data?.roles || {})[0] || "employee";
  // Transform API data to match component expectations
  const transformApiTask = (apiTask) => ({
    id: apiTask._id,
    taskName: apiTask.title,
    description: apiTask.description,
    assignedTo: typeof apiTask.assignedTo === 'object' && apiTask.assignedTo !== null
      ? (apiTask.assignedTo.firstName ? `${apiTask.assignedTo.firstName} ${apiTask.assignedTo.lastName || ''}`.trim() : (apiTask.assignedTo.name || apiTask.assignedTo.username || apiTask.assignedTo.email || 'User'))
      : (apiTask.assignedTo || 'Self'),
    assignedToId: typeof apiTask.assignedTo === 'object' && apiTask.assignedTo !== null
      ? apiTask.assignedTo._id
      : apiTask.assignedTo,
    priority: apiTask.priority,
    dueDate: apiTask.dueDate,
    visibility: apiTask.visibility,
    labels: apiTask.tags || [],
    attachments: apiTask.attachments || [],
    status: apiTask.status,
    taskType: apiTask.taskType || 'regular',
    progress: apiTask.progress || 0,
  });

  // Get tasks for current role from API response
  const tasksArray = apiResponse?.data?.data?.roles?.[currentRole] || [];
  const tasks = tasksArray.map(transformApiTask) || [];
  const pagination = apiResponse?.data?.data?.pagination || {};

  // State for local task management
  const [localTasks, setLocalTasks] = useState(null);
  const currentTasks = localTasks ?? tasks;

  // Form state
  const [form, setForm] = useState({
    taskName: "",
    description: "",
    assignedTo: "Self", // default Self
    priority: "low", // default Low
    dueDate: dueDateFromPriority("low"), // auto-filled
    visibility: "private", // default Private
    labels: [],
    labelInput: "",
    attachments: [],
    taskType: "simple", // default Simple
    // Advanced
    referenceProcess: "",
    customForm: "",
    dependencies: [],
  });
  const [attachmentsBytes, setAttachmentsBytes] = useState(0);
  const maxBytes = 5 * 1024 * 1024; // 5MB

  // Edit modal helpers
  const openEditModal = (taskId) => {
    const task = currentTasks.find((t) => t.id === taskId);
    if (!task) return;

    // Show edit confirmation first
    setEditConfirmation({
      isOpen: true,
      task: task,
    });
  };

  const confirmEditModal = (task) => {
    setEditingTask(task);
    setEditForm({
      taskName: task.taskName,
      description: task.description,
      assignedTo: task.assignedTo,
      assignedToId: task.assignedToId,
      priority: task.priority,
      dueDate: task.dueDate,
      visibility: task.visibility,
      labels: task.labels || [],
      labelInput: "",
      attachments: task.attachments || [],
      taskType: task.taskType || "regular",
      referenceProcess: task.referenceProcess || "",
      customForm: task.customForm || "",
      dependencies: task.dependencies || [],
    });
    setEditModalOpen(true);
    setEditError(null);

    // Close edit confirmation
    setEditConfirmation({
      isOpen: false,
      task: null,
    });
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingTask(null);
    setEditForm(null);
    setEditError(null);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (field === "priority") {
      setEditForm((prev) => ({ ...prev, dueDate: dueDateFromPriority(value) }));
    }
  };

  const handleEditLabelsKeyDown = (e) => {
    if (e.key === "Enter" && editForm.labelInput.trim()) {
      e.preventDefault();
      const val = editForm.labelInput.trim();
      if (!editForm.labels.includes(val)) {
        setEditForm((f) => ({ ...f, labels: [...f.labels, val], labelInput: "" }));
      } else {
        setEditForm((f) => ({ ...f, labelInput: "" }));
      }
    }
  };

  const handleEditRemoveLabel = (label) => {
    setEditForm((f) => ({ ...f, labels: f.labels.filter((l) => l !== label) }));
  };

  const handleEditFilesSelected = (files) => {
    const arr = Array.from(files);
    const total = arr.reduce((sum, f) => sum + f.size, 0);
    if (total > maxBytes) {
      alert("Attachments exceed 5 MB total limit.");
      return;
    }
    setEditForm((f) => ({ ...f, attachments: arr }));
  };

  const validateEditForm = () => {
    if (!editForm.taskName.trim()) return "Task Name is required.";
    if (editForm.taskName.length > 20) return "Task Name must be <= 20 characters.";
    // No validation needed for assignedTo since it can be empty (self-assigned)
    if (!editForm.priority) return "Priority is required.";
    if (!editForm.dueDate) return "Due Date is required.";
    if (!editForm.taskType) return "Task Type is required.";
    return null;
  };

  const handleEditSave = async () => {
    const err = validateEditForm();
    if (err) {
      setEditError(err);
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      // Prepare payload using the correct API format
      const payload = {
        title: editForm.taskName,
        description: editForm.description,
        assignedTo: editForm.assignedToId || null, // Send ID if available, null for self-assignment
        priority: editForm.priority,
        dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : null,
        visibility: editForm.visibility,
        tags: Array.isArray(editForm.labels) ? editForm.labels : [],
      };

      // Use PUT method with correct endpoint
      console.log('Sending update request with payload:', payload);
      const response = await apiClient.put(`/api/tasks/${editingTask.id}`, payload);
      console.log('Update response:', response);

      // Check if response is successful (axios returns status 200-299 as success)
      if (response.status >= 200 && response.status < 300) {
        // Check if response has explicit success field or assume success based on status
        const isSuccess = response.data.success !== false; // Consider success unless explicitly false

        if (isSuccess) {
          // Update local tasks state immediately for better UX
          const updatedTask = {
            ...editingTask,
            taskName: editForm.taskName,
            description: editForm.description,
            assignedTo: editForm.assignedTo,
            assignedToId: editForm.assignedToId,
            priority: editForm.priority,
            dueDate: editForm.dueDate,
            visibility: editForm.visibility,
            labels: editForm.labels,
          };

          setLocalTasks((prev) => {
            const currentList = prev ?? tasks;
            return currentList.map(task => task.id === editingTask.id ? updatedTask : task);
          });

          // Show success message
          showSuccessToast(`Task "${editForm.taskName}" updated successfully!`, 'success');

          // Close modal automatically
          closeEditModal();

          // Refetch data to ensure consistency (after UI update for better UX)
          setTimeout(() => {
            refetch();
          }, 500);
        } else {
          const errorMessage = response.data?.message || "Failed to update task.";
          setEditError(errorMessage);
          showSuccessToast(errorMessage, 'error');
        }
      }
    } catch (err) {
      console.error('Error updating task:', err);

      // Handle different error response structures
      let errorMessage = "Error updating task.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setEditError(errorMessage);
      showSuccessToast(errorMessage, 'error');
    }
    setEditLoading(false);
  };

  const resetForm = () => {
    setForm({
      taskName: "",
      description: "",
      assignedTo: "Self",
      priority: "low",
      dueDate: dueDateFromPriority("low"),
      visibility: "private",
      labels: [],
      labelInput: "",
      attachments: [],
      taskType: "simple",
      referenceProcess: "",
      customForm: "",
      dependencies: [],
    });
    setAttachmentsBytes(0);
  };


  // Filtering (API already filters, but keep for local fallback)
  const filteredTasks = currentTasks;


  // Stats (calculate from tasks and update when localTasks changes)
  const stats = useMemo(() => {
    const activeTasks = currentTasks;
    return {
      total: activeTasks.length,
      completed: activeTasks.filter((t) => t.status === "completed").length,
      inProgress: activeTasks.filter((t) => t.status === "in_progress").length,
      notStarted: activeTasks.filter((t) => t.status === "not_started").length,
      overdue: activeTasks.filter((t) => t.status === "overdue").length,
    };
  }, [currentTasks]);

  // Form handlers
  const onPriorityChange = (priority) => {
    setForm((f) => ({
      ...f,
      priority,
      dueDate: dueDateFromPriority(priority), // auto-set; user can edit later
    }));
  };

  const onLabelsKeyDown = (e) => {
    if (e.key === "Enter" && form.labelInput.trim()) {
      e.preventDefault();
      const val = form.labelInput.trim();
      if (!form.labels.includes(val)) {
        setForm((f) => ({ ...f, labels: [...f.labels, val], labelInput: "" }));
      } else {
        setForm((f) => ({ ...f, labelInput: "" }));
      }
    }
  };

  const removeLabel = (label) => {
    setForm((f) => ({ ...f, labels: f.labels.filter((l) => l !== label) }));
  };

  const onFilesSelected = (files) => {
    const arr = Array.from(files);
    const total = arr.reduce((sum, f) => sum + f.size, 0);
    if (total > maxBytes) {
      alert("Attachments exceed 5 MB total limit.");
      return;
    }
    setForm((f) => ({ ...f, attachments: arr }));
    setAttachmentsBytes(total);
  };

  const validateForm = () => {
    if (!form.taskName.trim()) return "Task Name is required.";
    if (form.taskName.length > 20) return "Task Name must be <= 20 characters.";
    // No validation needed for assignedTo since it can be empty (self-assigned)
    if (!form.priority) return "Priority is required.";
    if (!form.dueDate) return "Due Date is required.";
    if (!form.taskType) return "Task Type is required.";
    if (attachmentsBytes > maxBytes) return "Attachments exceed 5 MB total limit.";
    return null;
    // Visibility rules (solo vs org) can be applied here if needed.
  };

  const onSave = () => {
    const err = validateForm();
    if (err) {
      alert(err);
      return;
    }
    const newTask = {
      id: Date.now(),
      taskName: form.taskName.trim(),
      description: form.description,
      assignedTo: form.assignedTo,
      priority: form.priority,
      dueDate: form.dueDate,
      visibility: form.visibility,
      labels: form.labels,
      attachments: form.attachments.map((f) => ({ name: f.name, size: f.size })),
      status: "not_started",
      taskType: form.taskType,
      progress: 0,
      // Advanced (stored for future use)
      referenceProcess: form.referenceProcess,
      customForm: form.customForm,
      dependencies: form.dependencies,
    };
    setTasks((prev) => [newTask, ...prev]);

    setShowAdvanced(false);
    resetForm();
  };

  // State for local task deletion feedback
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Update task status locally without refresh
  const updateTaskStatusLocally = (taskId, newStatus) => {
    setLocalTasks((prev) => {
      const currentList = prev ?? tasks;
      return currentList.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus }
          : task
      );
    });
  };  // Success toast state
  const [successToast, setSuccessToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  });

  // Show success toast
  const showSuccessToast = (message, type = 'success') => {
    setSuccessToast({
      isVisible: true,
      message: message,
      type: type
    });

    // Auto hide after different durations based on type
    const duration = type === 'error' ? 5000 : 3000; // Errors shown longer
    setTimeout(() => {
      setSuccessToast({
        isVisible: false,
        message: '',
        type: 'success'
      });
    }, duration);
  };

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

  // Show delete confirmation
  const showDeleteConfirmation = (taskId) => {
    const task = currentTasks.find((t) => t.id === taskId);
    if (!task) return;

    setDeleteConfirmation({
      isOpen: true,
      taskId: taskId,
      taskTitle: task.taskName,
    });
  };

  // Show edit confirmation  
  const showEditConfirmation = (taskId) => {
    const task = currentTasks.find((t) => t.id === taskId);
    if (!task) return;

    setEditConfirmation({
      isOpen: true,
      task: task,
    });
  };

  // Delete task API logic
  const handleDeleteTask = async (taskId) => {
    setDeletingTaskId(taskId);
    setDeleteError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setDeleteError("Authorization token not found.");
        setDeletingTaskId(null);
        return;
      }
      const res = await fetch(`/api/tasks/delete/${taskId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        setDeleteError("Unauthorized: Please login again.");
        setDeletingTaskId(null);
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.message || "Failed to delete task.");
        setDeletingTaskId(null);
        return;
      }

      // Update local tasks state immediately for better UX
      setLocalTasks((prev) => (prev ? prev.filter((t) => t.id !== taskId) : currentTasks.filter((t) => t.id !== taskId)));

      // Also refetch data to ensure consistency
      refetch();

      // Close confirmation modal
      setDeleteConfirmation({
        isOpen: false,
        taskId: null,
        taskTitle: '',
      });

      // Show success message
      showSuccessToast(`Task "${deleteConfirmation.taskTitle}" deleted successfully!`);

      setDeletingTaskId(null);
    } catch (err) {
      console.error('Delete task error:', err);
      setDeleteError(err.message || "Error deleting task.");
      showSuccessToast(`Error deleting task: ${err.message || 'Unknown error'}`, 'error');
      setDeletingTaskId(null);
    }
  };

  // Loading state
  if (isLoading && !tasks.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading regular tasks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !tasks.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading regular tasks: {error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
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
              Are you sure you want to delete the task "<strong>{deleteConfirmation.taskTitle}</strong>"?
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
                onClick={() => handleDeleteTask(deleteConfirmation.taskId)}
                disabled={deletingTaskId === deleteConfirmation.taskId}
              >
                {deletingTaskId === deleteConfirmation.taskId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {editConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4">Confirm Edit</h2>
            <p className="text-gray-700 mb-6">
              Do you want to edit the task "<strong>{editConfirmation.task?.taskName}</strong>"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setEditConfirmation({ isOpen: false, task: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => confirmEditModal(editConfirmation.task)}
              >
                Continue to Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative" style={{ maxHeight: '80vh', overflow: 'hidden' }}>
            <button
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
              onClick={closeEditModal}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Regular Task</h2>
            {editError && <div className="text-red-600 mb-2 text-sm">{editError}</div>}
            {editForm && (
              <form
                onSubmit={e => { e.preventDefault(); handleEditSave(); }}
                className="space-y-4 overflow-y-auto"
                style={{ maxHeight: '60vh', paddingRight: '8px' }}
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Task Name</label>
                  <input
                    type="text"
                    value={editForm.taskName}
                    onChange={e => handleEditFormChange("taskName", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    maxLength={20}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={e => handleEditFormChange("description", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Assigned To</label>
                  <select
                    value={editForm.assignedToId || ''}
                    onChange={e => {
                      const selectedUserId = e.target.value;
                      const selectedUser = teamMembers.find(member => member.id === selectedUserId);
                      handleEditFormChange("assignedToId", selectedUserId);
                      handleEditFormChange("assignedTo", selectedUser ? selectedUser.fullName : 'Self');
                    }}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Self</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.fullName || `${member.firstName} ${member.lastName}`.trim()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={e => handleEditFormChange("priority", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={e => handleEditFormChange("dueDate", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Visibility</label>
                  <select
                    value={editForm.visibility}
                    onChange={e => handleEditFormChange("visibility", e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Labels</label>
                  <div className="flex gap-2 mb-1 flex-wrap">
                    {editForm.labels.map((label, idx) => (
                      <span key={label + idx} className="bg-gray-200 px-2 py-1 rounded text-xs flex items-center gap-1">
                        {label}
                        <button type="button" className="ml-1 text-red-500" onClick={() => handleEditRemoveLabel(label)}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editForm.labelInput}
                    onChange={e => handleEditFormChange("labelInput", e.target.value)}
                    onKeyDown={handleEditLabelsKeyDown}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Add label and press Enter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Attachments</label>
                  <input
                    type="file"
                    multiple
                    onChange={e => handleEditFilesSelected(e.target.files)}
                    className="w-full border rounded px-3 py-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {editForm.attachments.length} file(s) selected
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded"
                    onClick={closeEditModal}
                  >Cancel</button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded"
                    disabled={editLoading}
                  >{editLoading ? "Saving..." : "Save Changes"}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Header */}
      <div className={`${RT.headerBg} ${RT.headerBorder}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-teal-600 flex items-center justify-center">
                <RegularTaskIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Regular Task</h1>
                <p className="text-sm text-gray-600">Track and manage simple tasks</p>
              </div>
            </div>
            <Link href="/tasks/create?type=regular">
              <button

                className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${RT.btn}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Regular Task
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Not Started</p>
                <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters and View Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-teal-600" : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-teal-600" : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                {/* Card Header */}
                <div className={`p-4 ${RT.panelHeader}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center">
                        <File className={`h-4 w-4 ${RT.icon}`} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{task.taskName}</h3>
                        <p className="text-xs text-gray-600 capitalize">{task.taskType}</p>
                      </div>
                    </div>

                    {/* Actions - now in 3-dot menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVerticalIcon className="h-4 w-4 text-gray-600" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 bg-white">
                        <DropdownMenuItem onClick={() => showEditConfirmation(task.id)}>
                          <Edit3 className="h-3.5 w-3.5 mr-2 text-gray-600" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => showDeleteConfirmation(task.id)} disabled={deletingTaskId === task.id}>
                          <Trash2 className="h-3.5 w-3.5 mr-2 text-red-600" />
                          {deletingTaskId === task.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-xs text-gray-600 mb-2">{task.description}</p>

                  {/* Status and Priority */}
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {getStatusIcon(task.status)}
                      <span className="ml-1">{task.status.replace("_", " ").toUpperCase()}</span>
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${RT.chip.primary}`}
                    >
                      <File className="h-3 w-3 mr-1" />
                      REGULAR
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-xs text-gray-500">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">{task.assignedTo}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {task.visibility === "public" ? (
                        <Eye className="h-3.5 w-3.5 text-gray-400" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                      )}
                      <span className="text-gray-600 capitalize">{task.visibility}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">
                        {task.attachments?.length || 0} Attachment
                        {task.attachments?.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  {/* Labels */}
                  {task.labels?.length ? (
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-1">Labels</h4>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {task.labels.map((label, index) => (
                          <span
                            key={`${label}-${index}`}
                            className="inline-flex items-center px-2 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-700"
                          >
                            <Tag className="h-3 w-3 mr-1 text-gray-500" />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <button
                        className="inline-flex items-center px-2.5 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                        onClick={() => showEditConfirmation(task.id)}
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </button>
                    </div>
                    <button className="inline-flex items-center px-3 py-1 bg-teal-600 text-white text-xs font-medium rounded-md hover:bg-teal-700 transition-colors">
                      View Details
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
              {currentTasks.map((task) => (
                <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center">
                        <File className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{task.taskName}</h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {getStatusIcon(task.status)}
                            <span className="ml-1">{task.status.replace("_", " ").toUpperCase()}</span>
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                            {task.taskType.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{task.assignedTo}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            {task.visibility === "public" ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            <span className="capitalize">{task.visibility}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Paperclip className="h-4 w-4" />
                            <span>{task.attachments?.length || 0} file(s)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{task.progress}%</div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${task.progress}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => showEditConfirmation(task.id)}
                        >
                          <Edit3 className="h-4 w-4 text-gray-500" />
                        </button>

                        <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No regular tasks found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first regular task.</p>
            <Link href="/tasks/create?type=regular">
              <button
                className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${RT.btn}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Regular Task
              </button></Link>
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
                onClick={() => setCurrentPage(pagination.currentPage - 1)}
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
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${pageNum === pagination.currentPage
                      ? 'bg-teal-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Toast Notification */}
      {successToast.isVisible && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${successToast.type === 'success'
            ? 'bg-green-500 text-white'
            : successToast.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
            }`}>
            <div className="flex-shrink-0">
              {successToast.type === 'success' && (
                <CheckCircle2 className="h-5 w-5" />
              )}
              {successToast.type === 'error' && (
                <AlertCircle className="h-5 w-5" />
              )}
              {successToast.type === 'info' && (
                <Clock className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{successToast.message}</p>
            </div>
            <button
              onClick={() => setSuccessToast({ isVisible: false, message: '', type: 'success' })}
              className="flex-shrink-0 ml-4 text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}