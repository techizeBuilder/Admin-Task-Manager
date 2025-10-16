import React, { useState, useEffect } from "react";
import { useActiveRole } from "../../components/RoleSwitcher";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { quickTasksAPI } from "../../services/quickTasksAPI";
import SearchableSelect from "../SearchableSelect";
import Toast from "../newComponents/Toast";

import CustomConfirmationModal from "../newComponents/CustomConfirmationModal";
import eventEmitter from "../../utils/eventEmitter";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import {
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  Edit3,
  ArrowRight,
  Calendar,
  Clock,
  Filter,
  Search,
  RotateCw,
  AlertTriangle,
} from "lucide-react";

export default function QuickTasks() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Edit Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalTask, setEditModalTask] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskPriority, setEditTaskPriority] = useState("medium");
  const [editTaskDueDate, setEditTaskDueDate] = useState("");

  // Quick Task Form States
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [showInlineForm, setShowInlineForm] = useState(false);

  // API States
  const [quickTasks, setQuickTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toast and Modal States
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    isVisible: false,
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '',
    title: '',
    message: '',
    onConfirm: null,
    data: null
  });

  const { activeRole } = useActiveRole();

  // Get user data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
  });

  // Fetch Quick Tasks
  const fetchQuickTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching Quick Tasks...');

      const params = {
        status: statusFilter,
        priority: priorityFilter,
        search: searchTerm
      };

      const response = await quickTasksAPI.fetchQuickTasks(params);
      console.log('📥 fetchQuickTasks response:', response);

      if (response && response.success) {
        // Handle different possible response structures
        const tasks = response.quickTasks || response.data || [];
        console.log('✅ Setting tasks:', tasks);
        setQuickTasks(tasks);
      } else {
        console.error('❌ API Error:', response);
        setError(response.message || "Failed to fetch quick tasks.");
      }
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      setError(
        error.message ||
        "An error occurred while fetching quick tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickTasks();
  }, [statusFilter, priorityFilter, searchTerm]);

  // Listen for quick task creation events from other components
  useEffect(() => {
    const handleQuickTaskCreated = (newTask) => {
      console.log('🔄 Received quickTaskCreated event:', newTask);
      // Refresh the tasks list when a new task is created elsewhere
      fetchQuickTasks();
    };

    // Subscribe to the event
    eventEmitter.on('quickTaskCreated', handleQuickTaskCreated);

    // Cleanup: unsubscribe when component unmounts
    return () => {
      eventEmitter.off('quickTaskCreated', handleQuickTaskCreated);
    };
  }, []);

  // Priority color mapping
  const getPriorityColor = (priority) => {
    const colors = {
      low: "#10B981",    // Green
      medium: "#F59E0B", // Yellow
      high: "#EF4444",   // Red
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800", 
      high: "bg-red-100 text-red-800",
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority] || styles.medium}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "done":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "archived":
        return <Circle className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-blue-600" />;
    }
  };

  // Show toast message
  const showToast = (message, type = "success") => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  // Handle quick task creation
  const handleCreateQuickTask = async () => {
    if (!newTaskTitle.trim()) {
      showToast("Task title is required", "error");
      return;
    }

    try {
      console.log('🚀 Creating Quick Task...');
      const taskData = {
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        dueDate: newTaskDueDate || null,
      };
      console.log('📤 Task data:', taskData);

      const response = await quickTasksAPI.createQuickTask(taskData);
      console.log('📥 Create response:', response);

      if (response && response.success) {
        showToast("Quick task created successfully", "success");
        
        // Clear form
        setNewTaskTitle("");
        setNewTaskPriority("medium");
        setNewTaskDueDate("");
        setShowCreateModal(false);
        
        // Force refresh the tasks list
        console.log('🔄 Refreshing tasks after creation...');
        await fetchQuickTasks();
      } else {
        throw new Error(response.message || "Failed to create quick task");
      }
    } catch (error) {
      console.error('❌ Error creating quick task:', error);
      showToast(error.message || "Failed to create quick task", "error");
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (taskId, currentStatus) => {
    const newStatus = currentStatus === "done" ? "open" : "done";
    
    try {
      const response = await quickTasksAPI.updateTaskStatus(taskId, newStatus);

      if (response && response.success) {
        // Update local state
        setQuickTasks(prev => prev.map(task =>
          task.id === taskId
            ? { 
                ...task, 
                status: newStatus,
                completedAt: newStatus === "done" ? new Date().toISOString() : null
              }
            : task
        ));
        
        showToast(
          `Task marked as ${newStatus === "done" ? "completed" : "pending"}`,
          "success"
        );
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      showToast("Failed to update task status", "error");
    }
  };

  // Handle task deletion
  const handleDeleteTask = (taskId) => {
    const task = quickTasks.find(t => t.id === taskId);
    if (!task) return;

    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Quick Task',
      message: `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      onConfirm: () => executeDeleteTask(taskId),
      data: { taskId }
    });
  };

  const executeDeleteTask = async (taskId) => {
    try {
      const response = await quickTasksAPI.deleteQuickTask(taskId);

      if (response && response.success) {
        setQuickTasks(prev => prev.filter(task => task.id !== taskId));
        setConfirmModal({ isOpen: false, type: '', title: '', message: '', onConfirm: null, data: null });
        showToast("Quick task deleted successfully", "success");
      }
    } catch (error) {
      console.error('Error deleting quick task:', error);
      showToast("Failed to delete quick task", "error");
      setConfirmModal({ isOpen: false, type: '', title: '', message: '', onConfirm: null, data: null });
    }
  };

  // Handle edit modal
  const handleEditModal = (task) => {
    setEditModalTask(task);
    setEditTaskTitle(task.title);
    setEditTaskPriority(task.priority);
    setEditTaskDueDate(task.dueDate || "");
    setShowEditModal(true);
  };

  const handleEditModalSave = async () => {
    if (!editTaskTitle.trim()) {
      showToast("Task title is required", "error");
      return;
    }

    try {
      const response = await quickTasksAPI.updateQuickTask(editModalTask.id, { 
        title: editTaskTitle.trim(),
        priority: editTaskPriority,
        dueDate: editTaskDueDate || null
      });

      if (response && response.success) {
        setQuickTasks(prev => prev.map(task =>
          task.id === editModalTask.id
            ? { 
                ...task, 
                title: editTaskTitle.trim(),
                priority: editTaskPriority,
                dueDate: editTaskDueDate || null
              }
            : task
        ));
        showToast("Quick task updated successfully", "success");
        setShowEditModal(false);
        setEditModalTask(null);
      }
    } catch (error) {
      console.error('Error updating quick task:', error);
      showToast("Failed to update quick task", "error");
    }
  };

  // Handle title editing (inline)
  const handleTitleEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleTitleSave = async (taskId) => {
    if (!editingTitle.trim()) {
      setEditingTaskId(null);
      setEditingTitle("");
      return;
    }

    try {
      const response = await quickTasksAPI.updateQuickTask(taskId, { 
        title: editingTitle.trim() 
      });

      if (response && response.success) {
        setQuickTasks(prev => prev.map(task =>
          task.id === taskId
            ? { ...task, title: editingTitle.trim() }
            : task
        ));
        showToast("Task title updated successfully", "success");
      }
    } catch (error) {
      console.error('Error updating task title:', error);
      showToast("Failed to update task title", "error");
    }

    setEditingTaskId(null);
    setEditingTitle("");
  };

  const handleTitleCancel = () => {
    setEditingTaskId(null);
    setEditingTitle("");
  };

  // Handle conversion to full task
  const handleConvertToTask = (quickTask) => {
    setConfirmModal({
      isOpen: true,
      type: 'info',
      title: 'Convert to Full Task',
      message: `Do you want to convert "${quickTask.title}" to a full task? This will create a new task with all features available.`,
      onConfirm: () => executeConvertToTask(quickTask),
      data: { quickTask }
    });
  };

  const executeConvertToTask = async (quickTask) => {
    try {
      setConfirmModal({ isOpen: false, type: '', title: '', message: '', onConfirm: null, data: null });
      
      // Store Quick Task data in localStorage for form prefilling (cleaner than URL)
      localStorage.setItem(`quick_task_${quickTask.id}`, JSON.stringify({
        title: quickTask.title,
        priority: quickTask.priority,
        dueDate: quickTask.dueDate
      }));
      
      // Navigate to create task page with minimal URL parameters
      navigate(`/tasks/create?type=regular&from_quick_task=${quickTask.id}`);
      
      showToast("Redirecting to create full task...", "info");
    } catch (error) {
      console.error('Error converting task:', error);
      showToast("Failed to convert task", "error");
    }
  };

  // Filter tasks
  const filteredTasks = quickTasks.filter((task) => {
    const matchesSearch = !searchTerm ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || task.status === statusFilter;

    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "createdAt":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "title":
        return a.title.localeCompare(b.title);
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case "dueDate":
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4 p-6 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quick Tasks</h1>
          <p className="mt-0 text-lg text-gray-600">
            Manage your personal quick tasks and to-dos
          </p>
        </div>
        <div className="mt-3 lg:mt-0 flex flex-col sm:flex-row gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Quick Task
          </button>
          <button
            onClick={() => fetchQuickTasks()}
            className="btn btn-secondary whitespace-nowrap"
            disabled={loading}
          >
            <RotateCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Create Quick Task Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowCreateModal(false);
            setNewTaskTitle("");
            setNewTaskPriority("medium");
            setNewTaskDueDate("");
          }}>
          <div
            className="modal-container max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="modal-header" style={{ background: '#4f46e5' }}>
              <div className="modal-title-section">
                <div className="modal-icon">
                  <Plus size={20} />
                </div>
                <div>
                  <h3>Add Quick Task</h3>
                  <p>Create a personal quick task</p>
                </div>
              </div>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTaskTitle("");
                  setNewTaskPriority("medium");
                  setNewTaskDueDate("");
                }}
              >
                <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>

            {/* Form */}
            <div className="modal-body">
              <div className="form-card">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateQuickTask();
                }} className="space-y-4">
                  
                  {/* Task Title */}
                  <div className="form-group">
                    <label className="form-label flex justify-between">
                      <div className="flex">
                        <Plus size={16} /> <span>Task Title</span>
                      </div>
                      <span className="text-gray-500">{newTaskTitle.length}/200</span>
                    </label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="form-input"
                      maxLength={200}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          // Form onSubmit will handle the API call
                        }
                      }}
                      autoFocus
                    />
                  </div>

                  {/* Row: Priority & Due Date */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <AlertTriangle size={16} />
                        Priority
                      </label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value)}
                        className="form-select"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <Calendar size={16} />
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="form-input"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="form-actions flex justify-between">
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewTaskTitle("");
                        setNewTaskPriority("medium");
                        setNewTaskDueDate("");
                      }} 
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      disabled={!newTaskTitle.trim()}
                    >
                      Create Quick Task
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Edit Quick Task Modal */}
      {showEditModal && editModalTask && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowEditModal(false);
            setEditModalTask(null);
            setEditTaskTitle("");
            setEditTaskPriority("medium");
            setEditTaskDueDate("");
          }}
        >
          <div
            className="modal-container max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="modal-header" style={{ background: '#4f46d6' }}>
              <div className="modal-title-section">
                <div className="modal-icon">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3>Edit Quick Task</h3>
                  <p>Update your quick task details</p>
                </div>
              </div>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowEditModal(false);
                  setEditModalTask(null);
                  setEditTaskTitle("");
                  setEditTaskPriority("medium");
                  setEditTaskDueDate("");
                }}
              >
                <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>

            {/* Form */}
            <div className="modal-body">
              <div className="form-card">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleEditModalSave();
                }} className="space-y-4">
                  
                  {/* Task Title */}
                  <div className="form-group">
                    <label className="form-label flex justify-between">
                      <div className="flex ">
                        <Edit3 size={16} />
                        Task Title
                      </div>
                      <span className="text-gray-500">{editTaskTitle.length}/200</span>
                    </label>
                    <input
                      type="text"
                      value={editTaskTitle}
                      onChange={(e) => setEditTaskTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="form-input"
                      maxLength={200}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          // Form onSubmit will handle the API call
                        }
                      }}
                      autoFocus
                    />
                  </div>

                  {/* Row: Priority & Due Date */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <AlertTriangle size={16} />
                        Priority
                      </label>
                      <select
                        value={editTaskPriority}
                        onChange={(e) => setEditTaskPriority(e.target.value)}
                        className="form-select"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <Calendar size={16} />
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={editTaskDueDate}
                        onChange={(e) => setEditTaskDueDate(e.target.value)}
                        className="form-input"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="form-actions flex justify-between">
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowEditModal(false);
                        setEditModalTask(null);
                        setEditTaskTitle("");
                        setEditTaskPriority("medium");
                        setEditTaskDueDate("");
                      }} 
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      disabled={!editTaskTitle.trim()}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-nowrap bg-white rounded-md shadow-sm border border-gray-200 p-2 mb-4 gap-2">
        {/* Search Bar */}
        <div className="relative w-50 max-w-md min-w-[170px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search quick tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-md border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-nowrap overflow-x-auto gap-2">
          <SearchableSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "open", label: "Open" },
              { value: "done", label: "Done" },
              { value: "archived", label: "Archived" },
            ]}
            placeholder="Filter by Status"
            className="min-w-[150px]"
          />

          <SearchableSelect
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.value)}
            options={[
              { value: "all", label: "All Priority" },
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            placeholder="Filter by Priority"
            className="min-w-[150px]"
          />

          <SearchableSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.value)}
            options={[
              { value: "createdAt", label: "Created Date" },
              { value: "title", label: "Title" },
              { value: "priority", label: "Priority" },
              { value: "dueDate", label: "Due Date" },
            ]}
            placeholder="Sort by"
            className="min-w-[140px]"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {(statusFilter !== "all" || priorityFilter !== "all" || searchTerm) && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800">
                Active Filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {priorityFilter !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Priority: {priorityFilter}
                    <button
                      onClick={() => setPriorityFilter("all")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Quick Tasks Table */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-500">Loading quick tasks...</span>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-10">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-2">Error loading quick tasks</div>
            <div className="text-gray-500">{error}</div>
            <button
              onClick={fetchQuickTasks}
              className="mt-3 btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-0">
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Title
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </TableHead>
                  <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-lg font-medium mb-2">No quick tasks found</h3>
                        <p className="text-sm mb-4">
                          {quickTasks.length === 0
                            ? "You don't have any quick tasks yet."
                            : "No tasks match your current filters."
                          }
                        </p>
                        {quickTasks.length === 0 && (
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn btn-primary"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create your first quick task
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTasks.map((task) => (
                    <TableRow
                      key={task.id}
                      className={`hover:bg-gray-50 transition-colors ${task.status === "done" ? "opacity-75" : ""
                      } border-b`}
                    >
                      <TableCell className="px-6 py-4">
                        <button
                          onClick={() => handleStatusToggle(task.id, task.status)}
                          className="hover:scale-110 transition-transform"
                          // title={task.status === "done" ? "Mark as pending" : "Mark as done"}
                        >
                          {getStatusIcon(task.status)}
                        </button>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {editingTaskId === task.id ? (
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onBlur={() => handleTitleSave(task.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleTitleSave(task.id);
                                } else if (e.key === "Escape") {
                                  e.preventDefault();
                                  handleTitleCancel();
                                }
                              }}
                              className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                          ) : (
                            <span
                              className={`font-medium ${task.status === "done"
                                  ? "line-through text-gray-500" 
                                  : "text-gray-900"
                              } cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-all`}
                              onClick={() => handleTitleEdit(task)}
                              title="Click to edit"
                            >
                              {task.title}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <span className={getPriorityBadge(task.priority)}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm text-gray-900">
                        {task.dueDate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(task.dueDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400">No due date</span>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(task.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditModal(task)}
                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Edit task"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleConvertToTask(task)}
                            className="p-1 text-green-500 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                            title="Convert to full task"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {/* {quickTasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-900">{quickTasks.length}</p>
              </div>
              <div className="text-blue-400">
                <Circle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {quickTasks.filter(t => t.status === "done").length}
                </p>
              </div>
              <div className="text-green-400">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="card bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {quickTasks.filter(t => t.status === "open").length}
                </p>
              </div>
              <div className="text-yellow-400">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="card bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">High Priority</p>
                <p className="text-2xl font-bold text-red-900">
                  {quickTasks.filter(t => t.priority === "high" && t.status !== "done").length}
                </p>
              </div>
              <div className="text-red-400">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Toast Notifications */}
      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <CustomConfirmationModal
          isOpen={confirmModal.isOpen}
          type={confirmModal.type}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onClose={() => setConfirmModal({
            isOpen: false,
            type: '',
            title: '',
            message: '',
            onConfirm: null,
            data: null
          })}
          onCancel={() => setConfirmModal({ 
            isOpen: false, 
            type: '', 
            title: '', 
            message: '', 
            onConfirm: null, 
            data: null 
          })}
        />
      )}
    </div>
  );
}