import React, { useState } from 'react';
import { usePermissions } from '@/features/shared/hooks/usePermissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Edit3,
  UserPlus,
  Plus,
  Trash2,
  Clock,
  Download,
  MoreHorizontal,
  Share,
  Archive,
  Bell,
  Flag,
  X
} from 'lucide-react';

/**
 * TaskHeader Component
 * Comprehensive header bar with task title, priority, status, tags, assignee and quick actions
 */
export const TaskHeader = ({
  task,
  onBack,
  onEdit,
  onReassign,
  onCreateSubtask,
  onDelete,
  onSnooze,
  onExport,
  onStatusChange,
  isLoading = false
}) => {
  const { hasPermission, fields, task: taskPermissions } = usePermissions();
  const [showAllTags, setShowAllTags] = useState(false);

  if (!task) return null;

  const getPriorityConfig = (priority) => {
    const configs = {
      critical: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🔥' },
      high: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '⚡' },
      medium: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📋' },
      low: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📝' }
    };
    return configs[priority?.toLowerCase()] || configs.medium;
  };

  const getStatusConfig = (status) => {
    const configs = {
      todo: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '⏳' },
      'in-progress': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🔄' },
      blocked: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🚫' },
      review: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '👁️' },
      done: { color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' }
    };
    return configs[status?.toLowerCase()] || configs.todo;
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const statusConfig = getStatusConfig(task.status);
  
  const displayTags = showAllTags ? task.tags : task.tags?.slice(0, 3);
  const hasMoreTags = task.tags?.length > 3;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Back + Title */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="flex-shrink-0"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold text-gray-900 truncate" title={task.title}>
                  {task.title}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">#{task.id}</span>
                  {task.project && (
                    <Badge variant="outline" className="text-xs">
                      {task.project.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Status, Priority, Actions */}
          <div className="flex items-center space-x-4">
            {/* Priority Badge */}
            <Badge 
              className={`${priorityConfig.color} border text-xs font-medium`}
              data-testid="badge-priority"
            >
              <span className="mr-1">{priorityConfig.icon}</span>
              {task.priority}
            </Badge>

            {/* Status Badge */}
            <Badge 
              className={`${statusConfig.color} border text-xs font-medium cursor-pointer`}
              onClick={() => fields.canManageVisibility && onStatusChange?.(task.status)}
              data-testid="badge-status"
            >
              <span className="mr-1">{statusConfig.icon}</span>
              {task.status}
            </Badge>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              {/* Primary Actions */}
              {fields.canAssignToOthers && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onEdit}
                  disabled={isLoading}
                  data-testid="button-edit"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}

              {taskPermissions.canManageTeamTasks && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onCreateSubtask}
                  disabled={isLoading}
                  data-testid="button-create-subtask"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Subtask
                </Button>
              )}

              {/* More Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-more-actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {fields.canAssignToOthers && (
                    <DropdownMenuItem onClick={onReassign} data-testid="menu-reassign">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Reassign
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={onSnooze} data-testid="menu-snooze">
                    <Clock className="h-4 w-4 mr-2" />
                    Snooze
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={onExport} data-testid="menu-export">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem data-testid="menu-share">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem data-testid="menu-archive">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  
                  {/* Destructive Actions */}
                  {hasPermission('DELETE_TASK') && (
                    <>
                      <div className="border-t my-1" />
                      <DropdownMenuItem 
                        onClick={onDelete}
                        className="text-red-600 focus:text-red-600"
                        data-testid="menu-delete"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Task
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Second Row - Assignee, Tags, Additional Info */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          {/* Left - Assignee */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Assigned to:</span>
            {task.assignee ? (
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-900">{task.assignee.name}</span>
              </div>
            ) : (
              <Badge variant="outline" className="text-xs text-gray-500">
                Unassigned
              </Badge>
            )}
          </div>

          {/* Right - Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {displayTags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs px-2 py-1"
                    data-testid={`tag-${tag}`}
                  >
                    {tag}
                  </Badge>
                ))}
                {hasMoreTags && !showAllTags && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-blue-600"
                    onClick={() => setShowAllTags(true)}
                    data-testid="button-show-all-tags"
                  >
                    +{task.tags.length - 3} more
                  </Button>
                )}
                {showAllTags && hasMoreTags && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-500"
                    onClick={() => setShowAllTags(false)}
                    data-testid="button-hide-tags"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;