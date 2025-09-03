import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Plus, Play, Pause, Edit, Trash2, Calendar, Settings } from 'lucide-react';
import { useRole } from '../../shared/hooks/useRole';

/**
 * Recurring Tasks Page for Individual Users
 * Manages recurring task templates and their schedules
 */
const RecurringTasks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { canAccessFeature } = useRole();

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

  const currentTasks = recurringTasks.length > 0 ? recurringTasks : mockRecurringTasks;

  const filteredTasks = currentTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && task.isActive) ||
                         (statusFilter === 'paused' && !task.isActive);
    return matchesSearch && matchesStatus;
  });

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
      low: 'text-green-600 bg-green-50 border-green-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      high: 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const handleToggleActive = (id) => {
    console.log('Toggle recurring task:', id);
    // Implement toggle functionality
  };

  const handleEdit = (id) => {
    console.log('Edit recurring task:', id);
    // Navigate to edit form
  };

  const handleDelete = (id) => {
    console.log('Delete recurring task:', id);
    // Implement delete functionality
  };

  const handleCreateNew = () => {
    // Navigate to create recurring task form
    window.location.href = '/tasks/create?type=recurring';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-blue-600" size={28} />
            Recurring Tasks
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your recurring task templates and schedules
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          data-testid="button-create-recurring-task"
        >
          <Plus size={18} />
          Create Recurring Task
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search recurring tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="input-search-recurring-tasks"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'paused'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === filter
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`filter-${filter}`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recurring Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            data-testid={`recurring-task-card-${task.id}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${task.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className={`text-sm font-medium ${task.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                  {task.isActive ? 'Active' : 'Paused'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleActive(task.id)}
                  className="text-gray-600 hover:text-gray-900 p-1"
                  title={task.isActive ? 'Pause' : 'Resume'}
                  data-testid={`button-toggle-${task.id}`}
                >
                  {task.isActive ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  onClick={() => handleEdit(task.id)}
                  className="text-gray-600 hover:text-blue-600 p-1"
                  title="Edit"
                  data-testid={`button-edit-${task.id}`}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-gray-600 hover:text-red-600 p-1"
                  title="Delete"
                  data-testid={`button-delete-${task.id}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {task.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {task.description}
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Frequency:</span>
                <span className="text-sm font-medium text-gray-900">
                  {getFrequencyLabel(task.frequency)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Next Due:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(task.nextDue).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Priority:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Est. Time:</span>
                <span className="text-sm font-medium text-gray-900">
                  {task.estimatedTime}
                </span>
              </div>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Clock className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring tasks found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first recurring task template'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
            >
              <Plus size={18} />
              Create Your First Recurring Task
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RecurringTasks;