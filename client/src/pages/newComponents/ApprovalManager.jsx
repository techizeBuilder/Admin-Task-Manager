import React, { useState, useEffect } from 'react';
import { createPortal } from "react-dom";
import {
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Grid3X3,
  List,
  Eye,
  User,
  Calendar,
  FileText,
  MoreHorizontal,
  MessageSquare,
  Users,
  Workflow,
  X,
  MoreVerticalIcon,
  Edit3,
  Trash2
} from 'lucide-react';
import CreateTask from './CreateTask';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link } from 'wouter';
import { apiClient } from '../../utils/apiClient';
import { getAuthUser } from '../../utils/auth';
import { useActiveRole } from "../../components/RoleSwitcher";
import CustomConfirmationModal from './CustomConfirmationModal';
export default function ApprovalManager() {
  // Get current user from authentication
  const authUser = getAuthUser();
  
  // Get active role from context (similar to RegularTaskManager)
  const { activeRole } = useActiveRole();
  
  const [currentUser] = useState({
    id: authUser?.id || authUser?._id || 1,
    name: authUser ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() : 'Current User',
    role: activeRole || 'manager' // Use activeRole instead of the roles array
  });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [approvalTasks, setApprovalTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    assignee: '',
    dueDate: '',
    priority: 'low',
    status: 'pending',
    visibility: 'private',
    description: '',
    mode: 'any'
  });
  const [editLoading, setEditLoading] = useState(false);
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Toast notification state for approval actions
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' // 'success' or 'error'
  });

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch approval tasks from API
  const fetchApprovalTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/tasks/filter/approval?page=1&limit=20');
      
      console.log('API Response:', response.data);
      console.log('Active Role:', activeRole);
      console.log('Current User Role:', currentUser.role);
      
      if (response.data.success) {
        // Use activeRole from context, similar to RegularTaskManager
        const currentRole = activeRole || Object.keys(response.data.data?.roles || {})[0] || "manager";
        console.log('Using Role for API:', currentRole);
        
        // Extract tasks based on current role from the nested response structure
        const roleBasedTasks = response.data.data?.roles?.[currentRole] || [];
        
        console.log('Role Based Tasks:', roleBasedTasks);
        
        // Transform API data to match the component's expected format
        const transformedTasks = roleBasedTasks.map(task => ({
          id: task._id,
          title: task.title,
          description: task.description,
          mode: task.approvalMode || 'any', // 'any', 'all', 'sequential'
          status: task.approvalStatus || 'pending',
          approvers: task.approvers || task.approvalDetails || [],
          creator: task.createdBy ? `${task.createdBy.firstName} ${task.createdBy.lastName}` : 'Unknown',
          createdAt: new Date(task.createdAt).toLocaleDateString(),
          dueDate: new Date(task.dueDate).toLocaleDateString(),
          autoApprove: task.autoApproveEnabled || false,
          priority: task.priority || 'medium'
        }));
        
        console.log('Transformed Tasks:', transformedTasks);
        setApprovalTasks(transformedTasks);
      } else {
        setError('Failed to fetch approval tasks');
      }
    } catch (err) {
      console.error('Error fetching approval tasks:', err);
      setError('Failed to fetch approval tasks');
      // Fallback to empty array if API fails
      setApprovalTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalTasks();
  }, [activeRole]); // Refetch when activeRole changes

  // Handle edit and delete actions
  const handleEdit = (taskId) => {
    const task = approvalTasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Prefill form data with task information
    setEditFormData({
      title: task.title || '',
      assignee: task.creator || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority || 'low',
      status: task.status || 'pending',
      visibility: 'private', // Default since API doesn't provide this
      description: task.description || '',
      mode: task.mode || 'any'
    });
    
    setEditingTask(task);
    setEditModalOpen(true);
  };

  const handleDelete = (taskId) => {
    const task = approvalTasks.find(t => t.id === taskId);
    if (!task) return;
    
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  // Confirm delete task
  const confirmDelete = async () => {
    if (!taskToDelete) return;
    
    setDeleteLoading(true);
    try {
      const response = await apiClient.delete(`/api/tasks/delete/${taskToDelete.id}`);
      console.log('Delete response:', response.data);
      
      // Remove task from local state
      setApprovalTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
      
      // Show success notification
      showNotification('Task deleted successfully!', 'success');
      
      // Close modal and reset state
      setDeleteModalOpen(false);
      setTaskToDelete(null);
      
    } catch (error) {
      console.error('Error deleting task:', error);
      
      // Show error notification
      showNotification(error.response?.data?.message || 'Failed to delete task', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancel delete operation
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim() || !editingTask) return;
    
    setEditLoading(true);
    try {
      // Make API call to update the task
      const response = await apiClient.put(`/api/tasks/${editingTask.id}`, {
        title: editFormData.title,
        description: editFormData.description,
        priority: editFormData.priority,
        dueDate: editFormData.dueDate ? new Date(editFormData.dueDate).toISOString() : null,
        approvalMode: editFormData.mode,
        approvalStatus: editFormData.status
      });

      if (response.data && response.data.success) {
        // Update local state
        setApprovalTasks(tasks => tasks.map(task => 
          task.id === editingTask.id 
            ? { ...task, 
                title: editFormData.title,
                description: editFormData.description,
                priority: editFormData.priority,
                dueDate: editFormData.dueDate,
                mode: editFormData.mode,
                status: editFormData.status
              }
            : task
        ));
        
        // Show success notification
        showNotification('Task updated successfully!', 'success');
        
        // Close modal and reset form
        setEditModalOpen(false);
        setEditingTask(null);
        setEditFormData({
          title: '',
          assignee: '',
          dueDate: '',
          priority: 'low',
          status: 'pending',
          visibility: 'private',
          description: '',
          mode: 'any'
        });
        
        // Refresh data from API
        setTimeout(() => {
          fetchApprovalTasks();
        }, 500);
      } else {
        showNotification('Failed to update task', 'error');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showNotification('Error updating task', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle edit form cancel
  const handleEditCancel = () => {
    setEditFormData({
      title: '',
      assignee: '',
      dueDate: '',
      priority: 'low',
      status: 'pending',
      visibility: 'private',
      description: '',
      mode: 'any'
    });
    setEditModalOpen(false);
    setEditingTask(null);
  };

  const getApprovalStatus = (task) => {
    const { approvers, mode } = task;
    const approved = approvers.filter(a => a.status === 'approved');
    const rejected = approvers.filter(a => a.status === 'rejected');
    const pending = approvers.filter(a => a.status === 'pending');

    if (rejected.length > 0 && mode !== 'any') return 'rejected';

    switch (mode) {
      case 'any':
        return approved.length > 0 ? 'approved' : pending.length > 0 ? 'pending' : 'waiting';
      case 'all':
        return approved.length === approvers.length ? 'approved' :
          rejected.length > 0 ? 'rejected' : 'pending';
      case 'sequential':
        const currentIndex = approved.length;
        if (currentIndex === approvers.length) return 'approved';
        if (rejected.length > 0) return 'rejected';
        return 'pending';
      default:
        return 'pending';
    }
  };

  const canUserApprove = (task, approver) => {
    if (approver.status !== 'pending') return false;
    if (task.mode === 'sequential') {
      const approverIndex = task.approvers.findIndex(a => a.id === approver.id);
      const previousApproved = task.approvers.slice(0, approverIndex).every(a => a.status === 'approved');
      return previousApproved;
    }
    return true;
  };

  const handleApproval = async (taskId, approverId, action, comment) => {
    try {
      // Make API call to update the task
      const response = await apiClient.put(`/api/tasks/${taskId}`, {
        approvalStatus: action,
        approvalComment: comment,
        approverId: approverId
      });

      if (response.data && response.data.success) {
        // Update local state immediately for better UX
        setApprovalTasks(tasks => tasks.map(task => {
          if (task.id !== taskId) return task;

          const updatedApprovers = task.approvers.map(approver => {
            if (approver.id === approverId) {
              return {
                ...approver,
                status: action,
                comment: comment || null,
                approvedAt: new Date().toISOString().split('T')[0]
              };
            }
            return approver;
          });

          return {
            ...task,
            approvers: updatedApprovers,
            status: getApprovalStatus({ ...task, approvers: updatedApprovers })
          };
        }));

        // Show success notification
        showNotification(`Task ${action} successfully!`, 'success');

        // Refresh data from API to ensure consistency
        setTimeout(() => {
          fetchApprovalTasks();
        }, 500);
      } else {
        showNotification('Failed to update approval task', 'error');
      }
    } catch (error) {
      console.error('Error updating approval task:', error);
      showNotification('Error updating approval task', 'error');
    }
  };

  const handleCreateApprovalTask = (taskData) => {
    setApprovalTasks([...approvalTasks, taskData]);
    setShowCreateModal(false);
    // Optionally refresh the data from API
    fetchApprovalTasks();
  };

  // Filter tasks
  const filteredTasks = approvalTasks.filter(task => {
    const overallStatus = getApprovalStatus(task);
    const statusMatch = statusFilter === "all" || overallStatus === statusFilter;
    const modeMatch = modeFilter === "all" || task.mode === modeFilter;
    return statusMatch && modeMatch;
  });

  // Calculate stats
  const stats = {
    total: approvalTasks.length,
    pending: approvalTasks.filter(task => getApprovalStatus(task) === 'pending').length,
    approved: approvalTasks.filter(task => getApprovalStatus(task) === 'approved').length,
    rejected: approvalTasks.filter(task => getApprovalStatus(task) === 'rejected').length,
    waiting: approvalTasks.filter(task => getApprovalStatus(task) === 'waiting').length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
                <p className="text-sm text-gray-600">Manage approval workflows and tasks</p>
              </div>
            </div>
            <Link href="/tasks/create?type=approval">
              <button

                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Approval Task
              </button></Link>
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
              <Workflow className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Waiting</p>
                <p className="text-2xl font-bold text-gray-600">{stats.waiting}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
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
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="waiting">Waiting</option>
              </select>

              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Modes</option>
                <option value="any">Any Approver</option>
                <option value="all">All Approvers</option>
                <option value="sequential">Sequential</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading approval tasks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading tasks</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchApprovalTasks}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <ApprovalTaskCard
                key={task.id}
                task={task}
                currentUser={currentUser}
                onApproval={handleApproval}
                onEdit={handleEdit}
                onDelete={handleDelete}
                getApprovalStatus={getApprovalStatus}
                canUserApprove={canUserApprove}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredTasks.map(task => (
                <ApprovalTaskListItem
                  key={task.id}
                  task={task}
                  currentUser={currentUser}
                  onApproval={handleApproval}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  getApprovalStatus={getApprovalStatus}
                  canUserApprove={canUserApprove}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No approval tasks found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first approval task.</p>
            <Link href="/tasks/create?type=approval">
              <button

                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Approval Task
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Edit3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Edit Approval Task</h3>
                    <p className="text-sm text-gray-600">Task #{editingTask?.id || 'Unknown'}</p>
                  </div>
                </div>
                <button
                  onClick={handleEditCancel}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Task Title */}
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📝 Task Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    placeholder="Task title (required)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={60}
                    required
                    autoFocus
                  />
                  <div className="text-xs text-gray-500 mt-1">{editFormData.title.length}/60</div>
                </div>

                {/* Row 1: Priority & Mode */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ⚡ Priority
                    </label>
                    <select
                      value={editFormData.priority}
                      onChange={(e) => setEditFormData({...editFormData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🔄 Approval Mode
                    </label>
                    <select
                      value={editFormData.mode}
                      onChange={(e) => setEditFormData({...editFormData, mode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="any">Any Approver</option>
                      <option value="all">All Approvers</option>
                      <option value="sequential">Sequential</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Due Date & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📅 Due Date
                    </label>
                    <input
                      type="date"
                      value={editFormData.dueDate}
                      onChange={(e) => setEditFormData({...editFormData, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🎯 Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Visibility */}
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🔒 Visibility
                  </label>
                  <select
                    value={editFormData.visibility}
                    onChange={(e) => setEditFormData({...editFormData, visibility: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📝 Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    placeholder="Add notes or description..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Use Tab to navigate fields, Enter to submit form
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
                    disabled={editLoading || !editFormData.title.trim()}
                  >
                    {editLoading ? '💾 Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification({ show: false, message: '', type: 'success' })}
              className="flex-shrink-0 ml-4 text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <CustomConfirmationModal
          isOpen={deleteModalOpen}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Task"
          message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
          type="danger"
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={deleteLoading}
        />
      )}

    </div>
  );
}

function ApprovalTaskCard({ task, currentUser, onApproval, onEdit, onDelete, getApprovalStatus, canUserApprove, getStatusIcon, getStatusColor, getPriorityColor }) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState(null);

  const overallStatus = getApprovalStatus(task);
  const userApprover = task.approvers.find(a => a.id === currentUser.id);
  const canApprove = userApprover && canUserApprove(task, userApprover);

  const handleApproveClick = (approver) => {
    setSelectedApprover(approver);
    setShowApprovalModal(true);
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'any':
        return <User className="h-4 w-4" />;
      case 'all':
        return <Users className="h-4 w-4" />;
      case 'sequential':
        return <Workflow className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
        {/* Header */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 leading-tight">{task.title}</h3>
                <p className="text-xs text-gray-500">{task.creator}</p>
              </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                  <MoreVerticalIcon className="h-4 w-4 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 bg-white">
                <DropdownMenuItem onClick={() => onEdit(task.id)}>
                  <Edit3 className="h-3.5 w-3.5 mr-2 text-gray-600" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task.id)}>
                  <Trash2 className="h-3.5 w-3.5 mr-2 text-red-600" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">{task.description}</p>

          {/* Status & Priority */}
          <div className="flex items-center space-x-1 mt-2 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(overallStatus)}`}>
              {getStatusIcon(overallStatus)}
              <span className="ml-1 capitalize">{overallStatus}</span>
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getPriorityColor(task.priority)}`}>
              {task.priority.toUpperCase()}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
              {getModeIcon(task.mode)}
              <span className="ml-1 capitalize">{task.mode}</span>
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-3 space-y-2 text-xs">
          {/* Details */}
          <div className="grid grid-cols-2 gap-1">
            <div className="flex items-center space-x-1 text-gray-600">
              <Calendar className="h-3.5 w-3.5" />
              <span>{task.dueDate}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600 justify-end">
              <Users className="h-3.5 w-3.5" />
              <span>{task.approvers.length} Approvers</span>
            </div>
          </div>

          {/* Approval Chain */}
          <div>
            <h4 className="text-xs font-semibold text-gray-700 mb-1">Approval Chain</h4>
            <div className="space-y-1.5">
              {task.approvers.map((approver) => (
                <div key={approver.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center ${approver.status === 'approved'
                          ? 'bg-green-100'
                          : approver.status === 'rejected'
                            ? 'bg-red-100'
                            : approver.status === 'pending'
                              ? 'bg-yellow-100'
                              : 'bg-gray-100'
                        }`}
                    >
                      {approver.status === 'approved' ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : approver.status === 'rejected' ? (
                        <XCircle className="h-3 w-3 text-red-600" />
                      ) : approver.status === 'pending' ? (
                        <Clock className="h-3 w-3 text-yellow-600" />
                      ) : (
                        <User className="h-3 w-3 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{approver.name}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{approver.role}</p>
                    </div>
                  </div>

                  {approver.status === 'pending' &&
                    canUserApprove(task, approver) &&
                    approver.id === currentUser.id && (
                      <button
                        className="inline-flex items-center px-2 py-0.5 bg-blue-600 text-white text-[10px] rounded hover:bg-blue-700"
                        onClick={() => handleApproveClick(approver)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </button>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[11px]">
          <span className="text-gray-500">Created: {task.createdAt}</span>
          <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
            <FileText className="h-3.5 w-3.5 mr-1" />
            View
          </button>
        </div>
      </div>

      {showApprovalModal && (
        <ApprovalModal
          task={task}
          approver={selectedApprover}
          onApproval={onApproval}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedApprover(null);
          }}
        />
      )}
    </>
  );
}

function ApprovalTaskListItem({ task, currentUser, onApproval, onEdit, onDelete, getApprovalStatus, canUserApprove, getStatusIcon, getStatusColor, getPriorityColor }) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState(null);

  const overallStatus = getApprovalStatus(task);
  const userApprover = task.approvers.find(a => a.id === currentUser.id);
  const canApprove = userApprover && canUserApprove(task, userApprover);

  const handleApproveClick = (approver) => {
    setSelectedApprover(approver);
    setShowApprovalModal(true);
  };

  return (
    <>
      <div className="p-6 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(overallStatus)}`}>
                  {getStatusIcon(overallStatus)}
                  <span className="ml-1 capitalize">{overallStatus}</span>
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {task.dueDate}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{task.creator}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{task.approvers.length} approvers</span>
                </span>
                <span className="capitalize">{task.mode} mode</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {task.approvers.filter(a => a.status === 'approved').length}/{task.approvers.length} Approved
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {canApprove && (
                <button
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => handleApproveClick(userApprover)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Review
                </button>
              )}
              <button className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                <FileText className="h-4 w-4 mr-1" />
                Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {showApprovalModal && (
        <ApprovalModal
          task={task}
          approver={selectedApprover}
          onApproval={onApproval}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedApprover(null);
          }}
        />
      )}
    </>
  );
}


function ApprovalModal({ task, approver, onApproval, onClose }) {
  const [action, setAction] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (action && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onApproval(task.id, approver.id, action, comment);
        // Close modal after successful submission
        onClose();
      } catch (error) {
        console.error('Error submitting approval:', error);
        // Keep modal open on error so user can retry
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Review Approval</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
            <p className="text-sm text-gray-600 mb-4">{task.description}</p>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">
                <span className="font-medium">Approver:</span> {approver.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Role:</span> {approver.role}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Decision
            </label>
            <div className="flex space-x-3">
              <button
                onClick={() => setAction('approved')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  action === 'approved'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => setAction('rejected')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  action === 'rejected'
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!action || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
