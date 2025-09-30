import React from 'react';
import { usePermissions } from '@/features/shared/hooks/usePermissions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Link,
  Flag,
  User,
  Building,
  Target,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

/**
 * CoreTaskInfo Component
 * Displays essential task information including dates, estimates, and linked tasks
 */
export const CoreTaskInfo = ({
  task,
  linkedTasks = [],
  onEditTask,
  onViewLinkedTask
}) => {
  const { fields } = usePermissions();

  if (!task) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date';
    } catch {
      return 'Invalid date';
    }
  };

  const formatDuration = (hours) => {
    if (!hours || hours === 0) return 'Not estimated';
    
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`;
    } else if (hours < 8) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 8);
      const remainingHours = hours % 8;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  };

  const getUrgencyIndicator = (dueDate, priority) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: 'Overdue', color: 'bg-red-100 text-red-800 border-red-200', urgent: true };
    } else if (diffDays === 0) {
      return { label: 'Due Today', color: 'bg-orange-100 text-orange-800 border-orange-200', urgent: true };
    } else if (diffDays === 1) {
      return { label: 'Due Tomorrow', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', urgent: false };
    } else if (diffDays <= 3 && priority === 'high') {
      return { label: 'Due Soon', color: 'bg-blue-100 text-blue-800 border-blue-200', urgent: false };
    }
    
    return null;
  };

  const urgencyInfo = getUrgencyIndicator(task.dueDate, task.priority);

  const infoSections = [
    {
      title: 'Timeline',
      items: [
        {
          label: 'Created',
          value: formatDate(task.createdAt),
          icon: <Calendar className="h-4 w-4 text-gray-500" />
        },
        {
          label: 'Start Date',
          value: formatDate(task.startDate),
          icon: <Calendar className="h-4 w-4 text-green-500" />
        },
        {
          label: 'Due Date',
          value: formatDate(task.dueDate),
          icon: <Calendar className="h-4 w-4 text-red-500" />,
          badge: urgencyInfo
        },
        {
          label: 'Last Updated',
          value: formatDate(task.updatedAt),
          icon: <Clock className="h-4 w-4 text-blue-500" />
        }
      ]
    },
    {
      title: 'Effort & Progress',
      items: [
        {
          label: 'Estimated Time',
          value: formatDuration(task.estimatedHours),
          icon: <Clock className="h-4 w-4 text-purple-500" />
        },
        {
          label: 'Time Spent',
          value: formatDuration(task.actualHours || 0),
          icon: <Clock className="h-4 w-4 text-indigo-500" />
        },
        {
          label: 'Progress',
          value: `${task.progress || 0}%`,
          icon: <Target className="h-4 w-4 text-blue-500" />
        }
      ]
    },
    {
      title: 'Organization',
      items: [
        {
          label: 'Project',
          value: task.project?.name || 'No project',
          icon: <Building className="h-4 w-4 text-teal-500" />
        },
        {
          label: 'Created By',
          value: task.createdBy?.name || 'Unknown',
          icon: <User className="h-4 w-4 text-gray-500" />
        },
        {
          label: 'Task Type',
          value: task.type || 'Standard',
          icon: <Flag className="h-4 w-4 text-orange-500" />
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Description */}
      {task.description && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              {fields.canAssignToOthers && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onEditTask}
                  data-testid="button-edit-description"
                >
                  Edit
                </Button>
              )}
            </div>
            <div 
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: task.description }}
            />
          </CardContent>
        </Card>
      )}

      {/* Core Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {infoSections.map((section) => (
          <Card key={section.title}>
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      {item.icon}
                      <span className="text-sm text-gray-600 truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 text-right">
                        {item.value}
                      </span>
                      {item.badge && (
                        <Badge 
                          className={`${item.badge.color} border text-xs`}
                          data-testid={`badge-${item.badge.label.toLowerCase().replace(' ', '-')}`}
                        >
                          {item.badge.urgent && '⚠️ '}
                          {item.badge.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Linked Tasks */}
      {linkedTasks && linkedTasks.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Link className="h-5 w-5 mr-2 text-blue-500" />
                Linked Tasks ({linkedTasks.length})
              </h3>
            </div>
            
            <div className="space-y-3">
              {linkedTasks.map((linkedTask) => (
                <div 
                  key={linkedTask.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {linkedTask.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        #{linkedTask.id} • {linkedTask.relationship || 'Related'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      data-testid={`linked-task-status-${linkedTask.id}`}
                    >
                      {linkedTask.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewLinkedTask?.(linkedTask.id)}
                      data-testid={`button-view-linked-${linkedTask.id}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoreTaskInfo;