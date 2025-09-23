import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';
import { RecurringTaskIcon } from '../../components/common/TaskIcons';
import { apiClient } from '../../utils/apiClient';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
const RecurringTaskManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | paused
  const [priorityFilter, setPriorityFilter] = useState('all'); // all | low | medium | high
  const [frequencyFilter, setFrequencyFilter] = useState('all'); // all | daily | weekly | monthly | quarterly | yearly
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(20);

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

  // Try both possible data paths
  const tasksArray = apiResponse?.data?.tasks || apiResponse?.data?.data?.tasks || [];
  console.log('Final tasks array:', tasksArray);

  const recurringTasks = tasksArray.map(transformApiTask) || [];
  const pagination = apiResponse?.data?.pagination || apiResponse?.data?.data?.pagination || {};
  const summary = apiResponse?.data?.summary || apiResponse?.data?.data?.summary || {};

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

  const currentTasks = (recurringTasks && recurringTasks.length > 0) ? recurringTasks : mockRecurringTasks;

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

    // Use real data from API if available, otherwise calculate from current tasks
    if (apiResponse?.data?.data?.summary) {
      const apiSummary = apiResponse.data.data.summary;
      const total = apiSummary.totalCount || currentTasks.length;
      const active = currentTasks.filter(t => t.isActive).length;
      const paused = currentTasks.filter(t => !t.isActive).length;
      const overdue = currentTasks.filter(t => t.nextDue && new Date(t.nextDue) < now).length;
      const dueSoon = currentTasks.filter(t => t.nextDue && inDays(t.nextDue) >= 0 && inDays(t.nextDue) <= 7).length;
      return { total, active, paused, overdue, dueSoon };
    } else {
      // Fallback to calculating from current tasks
      const total = currentTasks.length;
      const active = currentTasks.filter(t => t.isActive).length;
      const paused = currentTasks.filter(t => !t.isActive).length;
      const overdue = currentTasks.filter(t => t.nextDue && new Date(t.nextDue) < now).length;
      const dueSoon = currentTasks.filter(t => t.nextDue && inDays(t.nextDue) >= 0 && inDays(t.nextDue) <= 7).length;
      return { total, active, paused, overdue, dueSoon };
    }
  }, [currentTasks, apiResponse]);

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
      await apiClient.patch(`/api/tasks/${task._id || id}/status`, {
        status: newStatus
      });

      // Refetch data to update UI
      refetch();
    } catch (error) {
      console.error('Error toggling task status:', error);
      // You might want to show a toast notification here
    }
  };

  const handleEdit = (id) => {
    const task = currentTasks.find(t => t.id === id || t._id === id);
    const taskId = task?._id || id;
    window.location.href = `/tasks/edit/${taskId}?type=recurring`;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recurring task?')) {
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center">
                <RecurringTaskIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Recurring Tasks</h1>
                <p className="text-sm text-gray-600">Manage recurring task templates and schedules</p>
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <RecurringTaskIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Play className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paused</p>
                <p className="text-2xl font-bold text-gray-600">{stats.paused}</p>
              </div>
              <Pause className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due Soon</p>
                <p className="text-2xl font-bold text-blue-600">{stats.dueSoon}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
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
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
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
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
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
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
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