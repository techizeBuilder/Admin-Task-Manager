import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Grid3X3,
  List,
  Building,
  Tag
} from 'lucide-react';
import apiClient from '../utils/apiClient';

const mockRegularTasks = [
  {
    id: "mock-1",
    _id: "mock-1",
    taskName: "Complete Project Documentation",
    title: "Complete Project Documentation",
    description: "Write comprehensive documentation for the new project features including API specs and user guides",
    status: "in_progress",
    priority: "high",
    assignedTo: "John Doe",
    dueDate: "2024-01-15",
    department: "Engineering",
    progress: 65,
    visibility: "public",
    labels: ["documentation", "urgent"],
    attachments: []
  },
  {
    id: "mock-2",
    _id: "mock-2",
    taskName: "Review Code Quality",
    title: "Review Code Quality",
    description: "Review recent code submissions for quality standards and best practices",
    status: "not_started",
    priority: "medium",
    assignedTo: "Jane Smith",
    dueDate: "2024-01-20",
    department: "Engineering",
    progress: 0,
    visibility: "private",
    labels: ["review", "quality"],
    attachments: []
  },
  {
    id: "mock-3",
    _id: "mock-3",
    taskName: "Client Meeting Preparation",
    title: "Client Meeting Preparation",
    description: "Prepare presentation materials and agenda for the upcoming client meeting",
    status: "completed",
    priority: "high",
    assignedTo: "Alice Johnson",
    dueDate: "2024-01-10",
    department: "Sales",
    progress: 100,
    visibility: "public",
    labels: ["meeting", "client"],
    attachments: []
  }
];

export default function RegularTaskManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDebugMode, setIsDebugMode] = useState(false);

  // API query for regular tasks
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['regularTasks', { 
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      page: currentPage
    }],
    queryFn: async ({ queryKey }) => {
      console.log('Fetching regular tasks with params:', queryKey[1]);
      
      const params = new URLSearchParams();
      if (queryKey[1].search) params.append('search', queryKey[1].search);
      if (queryKey[1].status) params.append('status', queryKey[1].status);
      if (queryKey[1].priority) params.append('priority', queryKey[1].priority);
      if (queryKey[1].page) params.append('page', queryKey[1].page.toString());
      
      const url = `/api/tasks/filter/regular?${params.toString()}`;
      console.log('API URL:', url);
      
      const response = await apiClient.get(url);
      console.log('Regular tasks API response:', response);
      
      if (!response?.data) {
        console.warn('No data in API response, using mock data');
        return {
          data: {
            data: {
              tasks: mockRegularTasks,
              summary: {
                totalCount: mockRegularTasks.length,
                statusCounts: {
                  completed: mockRegularTasks.filter(t => t.status === 'completed').length,
                  in_progress: mockRegularTasks.filter(t => t.status === 'in_progress').length,
                  not_started: mockRegularTasks.filter(t => t.status === 'not_started').length,
                  overdue: mockRegularTasks.filter(t => t.status === 'overdue').length
                }
              }
            }
          }
        };
      }
      
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
      'overdue': 25
    };
    return progressMap[status] || 0;
  };

  // Process and transform tasks
  const transformedTasks = useMemo(() => {
    if (!apiResponse?.data?.data?.tasks) {
      console.log('No API data, using mock tasks');
      return mockRegularTasks;
    }
    
    console.log('Transforming API tasks:', apiResponse.data.data.tasks);
    const transformed = apiResponse.data.data.tasks.map(transformApiTask);
    console.log('All transformed tasks:', transformed);
    return transformed;
  }, [apiResponse]);

  // Current tasks (either from API or mock data)
  const currentTasks = transformedTasks || [];

  console.log('Current tasks for display:', currentTasks);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Regular Tasks</h1>
              <p className="text-gray-600">Manage your regular tasks and track progress</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create New Task
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">In Progress</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Not Started</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.notStarted}</p>
                </div>
                <Calendar className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Overdue</p>
                  <p className="text-2xl font-bold text-red-900">{stats.overdue}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tasks by name or description..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="w-full lg:w-48">
              <select
                value={priorityFilter}
                onChange={handlePriorityFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1 rounded ${
                  viewMode === 'grid'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1 rounded ${
                  viewMode === 'list'
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>

            {/* Debug Toggle */}
            <button
              onClick={() => setIsDebugMode(!isDebugMode)}
              className="px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Debug
            </button>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredTasks.length} of {currentTasks.length} tasks
            {isLoading && (
              <span className="ml-2 text-teal-600">
                (Loading...)
              </span>
            )}
          </div>
        </div>

        {/* Tasks Display */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? "No tasks match your current filters. Try adjusting your search criteria."
                : "You haven't created any regular tasks yet. Start by creating your first task!"}
            </p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Your First Task
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredTasks.map((task) => (
              <div
                key={task.id || task._id}
                className={`bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow ${
                  viewMode === 'list' ? 'p-4' : 'p-6'
                }`}
              >
                {viewMode === 'grid' ? (
                  // Grid View Card
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {task.taskName || task.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleEdit(task.id || task._id)}
                          className="p-1 text-gray-400 hover:text-teal-600 transition-colors"
                          title="Edit task"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id || task._id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Status and Priority */}
                      <div className="flex gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          {task.status?.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority?.toUpperCase()}
                        </span>
                      </div>

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      {/* Assignee */}
                      {task.assignedTo && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          <span>Assigned to: {task.assignedTo.name || task.assignedTo}</span>
                        </div>
                      )}

                      {/* Department */}
                      {task.department && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="h-4 w-4" />
                          <span>{task.department}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // List View Row
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {task.taskName || task.title}
                          </h3>
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {task.description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                            {getStatusIcon(task.status)}
                            {task.status?.replace('_', ' ').toUpperCase()}
                          </span>
                          
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority?.toUpperCase()}
                          </span>
                          
                          {task.dueDate && (
                            <span className="text-xs text-gray-600">
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      <button
                        onClick={() => handleEdit(task.id || task._id)}
                        className="p-1 text-gray-400 hover:text-teal-600 transition-colors"
                        title="Edit task"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id || task._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Debug Information */}
        {isDebugMode && (
          <div className="mt-8 bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <h3 className="text-white mb-2">Debug Info:</h3>
            <div className="space-y-1">
              <div>API Status: {isLoading ? 'Loading' : error ? `Error: ${error.message}` : 'Success'}</div>
              <div>Raw Tasks: {JSON.stringify(transformedTasks?.slice(0, 2) || [], null, 2)}</div>
              <div>Current Tasks: {currentTasks.length}</div>
              <div>Filtered Tasks: {filteredTasks.length}</div>
              <div>Filters: Status={statusFilter}, Priority={priorityFilter}, Search="{searchTerm}"</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}