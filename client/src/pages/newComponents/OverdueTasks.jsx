import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, AlertTriangle, Filter, Search, ChevronRight } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

/**
 * Overdue Tasks Page - Shows tasks that have passed their due dates
 */
export default function OverdueTasks() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch tasks data
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['/api/tasks'],
    select: (data) => {
      // Filter for overdue tasks only
      const now = new Date();
      return data?.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < now && task.status !== 'completed';
      }) || [];
    }
  });

  // Apply filters
  const filteredTasks = tasks?.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    
    return matchesSearch && matchesPriority && matchesCategory;
  }) || [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Website Development': 'bg-blue-100 text-blue-800',
      'Security Review': 'bg-purple-100 text-purple-800',
      'UX Research': 'bg-pink-100 text-pink-800',
      'Backend Infrastructure': 'bg-indigo-100 text-indigo-800',
      'Mobile Development': 'bg-teal-100 text-teal-800',
      'Quality Assurance': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getDaysOverdue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return differenceInDays(now, due);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6" data-testid="overdue-tasks-loading">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6" data-testid="overdue-tasks-error">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Error loading overdue tasks</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="overdue-tasks-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="page-title">
            Overdue Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400" data-testid="page-description">
            Track important tasks that have passed their deadlines
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge 
            variant="destructive" 
            className="px-3 py-1 text-sm"
            data-testid="overdue-count-badge"
          >
            {filteredTasks.length} overdue
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-gray-800" data-testid="filters-section">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search overdue tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>

            {/* Priority Filter */}
            <div className="w-full lg:w-48">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger data-testid="priority-filter">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger data-testid="category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Website Development">Website Development</SelectItem>
                  <SelectItem value="Security Review">Security Review</SelectItem>
                  <SelectItem value="UX Research">UX Research</SelectItem>
                  <SelectItem value="Backend Infrastructure">Backend Infrastructure</SelectItem>
                  <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                  <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card data-testid="no-overdue-tasks">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {searchTerm || priorityFilter !== 'all' || categoryFilter !== 'all' 
                    ? 'No matching overdue tasks' 
                    : 'No overdue tasks'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm || priorityFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Great work! All your tasks are on track.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4" data-testid="overdue-tasks-list">
          {filteredTasks.map((task) => {
            const daysOverdue = getDaysOverdue(task.dueDate);
            
            return (
              <Card 
                key={task._id || task.id} 
                className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-red-500"
                data-testid={`overdue-task-${task._id || task.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Task Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="task-title">
                          {task.title}
                        </h3>
                        
                        {/* Priority Badge */}
                        <Badge 
                          className={getPriorityColor(task.priority)}
                          data-testid="task-priority"
                        >
                          {task.priority} Priority
                        </Badge>
                      </div>

                      {/* Category and Due Date */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline" 
                            className={getCategoryColor(task.category)}
                            data-testid="task-category"
                          >
                            {task.category}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span data-testid="task-due-date">
                            Due: {task.dueDate ? format(parseISO(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm" data-testid="task-description">
                          {task.description}
                        </p>
                      )}

                      {/* Overdue Warning */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <span data-testid="overdue-days">
                            {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Arrow */}
                    <div className="ml-4 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2"
                        data-testid="task-action-button"
                      >
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}