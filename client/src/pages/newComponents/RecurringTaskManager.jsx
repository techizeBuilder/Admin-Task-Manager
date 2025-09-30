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
// If your icon lives elsewhere, adjust this path.

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

  // Fetch recurring tasks from API
  const { data: recurringTasks = [], isLoading } = useQuery({
    queryKey: ['/api/tasks/recurring'],
    retry: false,
  });

  // Mock data for now - will be replaced with real API
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
    return labels[frequency] || frequency;
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
    const total = currentTasks.length;
    const active = currentTasks.filter(t => t.isActive).length;
    const paused = currentTasks.filter(t => !t.isActive).length;
    const overdue = currentTasks.filter(t => t.nextDue && new Date(t.nextDue) < now).length;
    const dueSoon = currentTasks.filter(t => t.nextDue && inDays(t.nextDue) >= 0 && inDays(t.nextDue) <= 7).length;
    return { total, active, paused, overdue, dueSoon };
  }, [currentTasks]);

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

  const handleToggleActive = (id) => {
    console.log('Toggle recurring task:', id);
    // TODO: Implement toggle functionality
  };

  const handleEdit = (id) => {
    console.log('Edit recurring task:', id);
    // TODO: Navigate to edit form
  };

  const handleDelete = (id) => {
    console.log('Delete recurring task:', id);
    // TODO: Implement delete functionality
  };

  const handleCreateNew = () => {
    window.location.href = '/tasks/create?type=recurring';
  };

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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                data-testid="input-search-recurring-tasks"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                data-testid="filter-status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
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
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-900'
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
               <div className="p-6 border-b border-gray-200">
      <div className="flex items-start justify-between mb-3">
        {/* Left section */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <RecurringTaskIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {task.title}
            </h3>
            <p className="text-sm text-gray-600">
              {getFrequencyLabel(task.frequency)}
            </p>
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
            <DropdownMenuItem onClick={() => handleToggleActive(task.id)}>
              {task.isActive ? (
                <>
                  <Pause className="h-4 w-4 mr-2 text-gray-600" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2 text-green-600" /> Resume
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(task.id)}>
              <Edit3 className="h-4 w-4 mr-2 text-gray-600" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(task.id)}>
              <Trash2 className="h-4 w-4 mr-2 text-red-600" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">{task.description}</p>

      {/* Status + Priority */}
      <div className="flex items-center flex-wrap gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusPill(
            task.isActive
          )}`}
        >
          {task.isActive ? "ACTIVE" : "PAUSED"}
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
            task.priority
          )}`}
        >
          {task.priority?.toUpperCase() || "N/A"}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
          <Tag className="h-3 w-3 mr-1" />
          {getFrequencyLabel(task.frequency)}
        </span>
      </div>
    </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Next Due: {task.nextDue ? new Date(task.nextDue).toLocaleDateString() : '—'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Est. Time: {task.estimatedTime || '—'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Created By: {task.createdBy || '—'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Last Gen: {task.lastGenerated ? new Date(task.lastGenerated).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                      <div className="flex items-center flex-wrap gap-2">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleActive(task.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {task.isActive ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                      {task.isActive ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => handleEdit(task.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
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
      </div>
    </div>
  );
};

export default RecurringTaskManager;