import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Edit3,
  Trash2,
  File,
  Tag,
  Paperclip,
  MoreVerticalIcon,
} from "lucide-react";
import { RegularTaskIcon } from "../../components/common/TaskIcons";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "../../utils/apiClient";
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

const RegularTaskManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | not_started | in_progress | completed | overdue
  const [priorityFilter, setPriorityFilter] = useState('all'); // all | low | medium | high | critical
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(20);

  // Fetch regular tasks from API
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['regular-tasks', currentPage, pageLimit, statusFilter, priorityFilter, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageLimit.toString(),
      });
      
      // Add filters if they're not 'all'
      if (statusFilter !== 'all') {
        // Map status filter to API status
        const statusMap = {
          'not_started': 'todo',
          'in_progress': 'in-progress',
          'completed': 'done',
          'overdue': 'overdue'
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

      const response = await apiClient.get(`/api/tasks/filter/regular?${params.toString()}`);
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
      taskName: apiTask.title,
      description: apiTask.description,
      assignedTo: apiTask.assignedTo?.name || apiTask.assignedTo?.firstName || apiTask.assignedTo || "Self",
      priority: apiTask.priority,
      dueDate: apiTask.dueDate ? new Date(apiTask.dueDate).toISOString().slice(0, 10) : null,
      visibility: apiTask.visibility || "private",
      labels: apiTask.tags || [],
      attachments: apiTask.attachments || [],
      status: mapApiStatusToLocal(apiTask.status),
      taskType: apiTask.taskTypeAdvanced || "simple",
      progress: calculateProgress(apiTask.status),
      createdBy: apiTask.createdBy ? `${apiTask.createdBy.firstName} ${apiTask.createdBy.lastName}` : 'Unknown',
      createdByRole: apiTask.createdByRole || ["employee"],
      // Additional API fields that might be useful
      _id: apiTask._id,
      organization: apiTask.organization,
      createdAt: apiTask.createdAt,
      updatedAt: apiTask.updatedAt,
    };
    console.log('Transformed task:', transformed);
    return transformed;
  };

  // Map API status to local status format
  const mapApiStatusToLocal = (apiStatus) => {
    const statusMap = {
      'todo': 'not_started',
      'in-progress': 'in_progress',
      'done': 'completed',
      'overdue': 'overdue'
    };
    return statusMap[apiStatus] || 'not_started';
  };

  // Calculate progress based on status
  const calculateProgress = (status) => {
    const progressMap = {
      'todo': 0,
      'in-progress': 50,
      'done': 100,
      'overdue': 0
    };
    return progressMap[status] || 0;
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
  
  // Try both possible data paths
  const tasksArray = apiResponse?.data?.tasks || apiResponse?.data?.data?.tasks || [];
  console.log('Final tasks array:', tasksArray);
  
  const regularTasks = tasksArray.map(transformApiTask) || [];
  const pagination = apiResponse?.data?.pagination || apiResponse?.data?.data?.pagination || {};
  const summary = apiResponse?.data?.summary || apiResponse?.data?.data?.summary || {};

  // Mock data for development/fallback
  const mockRegularTasks = [
    {
      id: 1,
      taskName: 'Prepare Report',
      description: 'Compile weekly sales metrics and insights.',
      assignedTo: 'Self',
      priority: 'medium',
      dueDate: '2025-09-20',
      visibility: 'private',
      labels: ['report', 'sales'],
      attachments: [],
      status: 'in_progress',
      taskType: 'simple',
      progress: 50,
    },
    {
      id: 2,
      taskName: 'Team Standup',
      description: 'Daily sync with the product team.',
      assignedTo: 'Team',
      priority: 'low',
      dueDate: '2025-09-21',
      visibility: 'public',
      labels: ['meeting'],
      attachments: [],
      status: 'not_started',
      taskType: 'simple',
      progress: 0,
    },
  ];

  const currentTasks = (regularTasks && regularTasks.length > 0) ? regularTasks : mockRegularTasks;

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[priority] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusColor = (status) => {
    const colors = {
      not_started: "bg-gray-100 text-gray-800 border-gray-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      overdue: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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

  const stats = useMemo(() => {
    console.log('Stats calculation - currentTasks:', currentTasks);
    console.log('Stats calculation - apiResponse:', apiResponse);
    
    // Use real data from API if available, otherwise calculate from current tasks
    if (apiResponse?.data?.data?.summary) {
      const apiSummary = apiResponse.data.data.summary;
      const total = apiSummary.totalCount || currentTasks.length;
      const completed = currentTasks.filter(t => t.status === 'completed').length;
      const inProgress = currentTasks.filter(t => t.status === 'in_progress').length;
      const notStarted = currentTasks.filter(t => t.status === 'not_started').length;
      const overdue = currentTasks.filter(t => t.status === 'overdue').length;
      return { total, completed, inProgress, notStarted, overdue };
    } else {
      // Fallback to calculating from current tasks
      const total = currentTasks.length;
      const completed = currentTasks.filter(t => t.status === 'completed').length;
      const inProgress = currentTasks.filter(t => t.status === 'in_progress').length;
      const notStarted = currentTasks.filter(t => t.status === 'not_started').length;
      const overdue = currentTasks.filter(t => t.status === 'overdue').length;
      return { total, completed, inProgress, notStarted, overdue };
    }
  }, [currentTasks, apiResponse]);

  const filteredTasks = currentTasks.filter(task => {
    const matchesSearch =
      !searchTerm ||
      task.taskName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleEdit = (id) => {
    const task = currentTasks.find(t => t.id === id || t._id === id);
    const taskId = task?._id || id;
    window.location.href = `/tasks/edit/${taskId}?type=regular`;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      const task = currentTasks.find(t => t.id === id || t._id === id);
      const taskId = task?._id || id;
      
      console.log('Deleting task with ID:', taskId);
      console.log('Delete API URL:', `/api/tasks/delete/${taskId}`);
      
      const response = await apiClient.delete(`/api/tasks/delete/${taskId}`);
      console.log('Delete response:', response);
      
      // Refetch data to update UI
      refetch();
      console.log('Task deleted successfully, refetching data...');
    } catch (error) {
      console.error('Error deleting task:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to delete task. Please check the console for details.');
    }
  };

  const handleCreateNew = () => {
    window.location.href = '/tasks/create?type=regular';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading regular tasks...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !currentTasks.length) {
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Clock className="h-4 w-4 mr-1" />
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={handleCreateNew}
                className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${RT.btn}`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Regular Task
              </button>
            </div>
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <input
                type="text"
                placeholder="Search regular tasks..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />

              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={priorityFilter}
                onChange={handlePriorityFilterChange}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 self-start md:self-auto">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm text-teal-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm text-teal-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-gray-600">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading tasks</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${RT.btn}`}
            >
              Try Again
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                {/* Card Header */}
                <div className={`p-6 ${RT.panelHeader}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                        <File className={`h-5 w-5 ${RT.icon}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{task.taskName}</h3>
                        <p className="text-sm text-gray-600 capitalize">{task.taskType}</p>
                      </div>
                    </div>
                   {/* Actions - now in 3-dot menu */}
        <DropdownMenu className='bg-white'>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVerticalIcon className="h-5 w-5 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-white">
        
            <DropdownMenuItem onClick={() => handleEdit(task.id)}>
              <Edit3 className="h-4 w-4 mr-2 text-gray-600" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(task.id)}>
              <Trash2 className="h-4 w-4 mr-2 text-red-600" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{task.description}</p>

                  {/* Status and Priority */}
                  <div className="flex items-center flex-wrap gap-2 mb-4">
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
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${RT.chip.primary}`}>
                      <File className="h-3 w-3 mr-1" />
                      REGULAR
                    </span>
                  </div>

                  {/* Progress (derived/optional) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-500">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{task.assignedTo}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.visibility === "public" ? (
                        <Eye className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-gray-600 capitalize">{task.visibility}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {task.attachments?.length || 0} Attachment
                        {task.attachments?.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  {/* Labels */}
                  {task.labels?.length ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Labels</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {task.labels.map((label, index) => (
                          <span
                            key={`${label}-${index}`}
                            className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                          >
                            <Tag className="h-3 w-3 mr-1 text-gray-500" />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Attachments */}
                  {task.attachments?.length ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                      <div className="space-y-1">
                        {task.attachments.slice(0, 2).map((attachment, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                            <Paperclip className="h-3 w-3" />
                            <span className="truncate">{attachment.name}</span>
                            <span className="text-gray-400">
                              ({(attachment.size / 1024).toFixed(1)}KB)
                            </span>
                          </div>
                        ))}
                        {task.attachments.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{task.attachments.length - 2} more files
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      
                    </div>
                    <button className="inline-flex items-center px-4 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors">
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
              {filteredTasks.map((task) => (
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
                            <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
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
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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

        {filteredTasks.length === 0 && !loading && !error && (
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
      </div>

   
    </div>
  );
};

export default RegularTaskManager;