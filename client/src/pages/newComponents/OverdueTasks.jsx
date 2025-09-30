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

  // Mock overdue tasks data (in real app this would come from API)
  const mockOverdueTasks = [
    {
      _id: '1',
      title: 'Mobile App Beta Release',
      description: 'Complete final testing and release beta version of mobile application',
      category: 'Website Development',
      priority: 'high',
      dueDate: '2024-01-10T00:00:00.000Z',
      status: 'in-progress',
      assignee: 'John Smith'
    },
    {
      _id: '2', 
      title: 'Security Audit Report',
      description: 'Conduct comprehensive security audit and generate detailed report',
      category: 'Security Review',
      priority: 'medium',
      dueDate: '2024-01-18T00:00:00.000Z',
      status: 'pending',
      assignee: 'Sarah Wilson'
    },
    {
      _id: '3',
      title: 'User Testing Phase 2',
      description: 'Execute second phase of user testing with focus groups',
      category: 'UX Research', 
      priority: 'high',
      dueDate: '2024-01-20T00:00:00.000Z',
      status: 'in-progress',
      assignee: 'Mike Johnson'
    },
    {
      _id: '4',
      title: 'Database Performance Optimization',
      description: 'Optimize database queries and improve system performance',
      category: 'Backend Infrastructure',
      priority: 'medium',
      dueDate: '2024-01-22T00:00:00.000Z',
      status: 'pending',
      assignee: 'Lisa Chen'
    }
  ];

  // Use mock data for now (in production this would be a real API call)
  const { data: tasks = mockOverdueTasks, isLoading = false, error = null } = { data: mockOverdueTasks };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1" data-testid="page-title">
            Overdue Tasks
          </h1>
          <p className="text-sm text-gray-600" data-testid="page-description">
            Track important project deadlines and milestones
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge 
            variant="secondary" 
            className="px-3 py-1 text-sm bg-red-50 text-red-700 border-red-200"
            data-testid="overdue-count-badge"
          >
            {filteredTasks.length} deadlines
          </Badge>
        </div>
      </div>


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
                className="hover:shadow-sm transition-all duration-200 cursor-pointer border border-gray-200 bg-white"
                data-testid={`overdue-task-${task._id || task.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Task Title */}
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900" data-testid="task-title">
                          {task.title}
                        </h3>
                        <Badge 
                          className={`${getPriorityColor(task.priority)} text-xs px-2 py-1`}
                          data-testid="task-priority"
                        >
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </Badge>
                      </div>

                      {/* Category and Due Date Row */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-1">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span data-testid="task-category">{task.category}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span data-testid="task-due-date">
                            {task.dueDate ? format(parseISO(task.dueDate), 'dd/MM/yyyy') : 'No due date'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Arrow */}
                    <div className="flex-shrink-0">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
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