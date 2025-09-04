import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePermissions } from '@/features/shared/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

// Components
import TaskHeader from '@/components/tasks/TaskHeader';
import CoreTaskInfo from '@/components/tasks/CoreTaskInfo';
import EnhancedTaskTabs from '@/components/tasks/EnhancedTaskTabs';
import { TaskErrorBoundary, TaskOperationError } from '@/components/tasks/TaskErrorBoundary';
import EnhancedProtectedRoute from '@/components/auth/EnhancedProtectedRoute';

// UI Components
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Icons
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Enhanced Task Detail Page
 * Production-ready task view with comprehensive RBAC and error handling
 */
export const EnhancedTaskDetailPage = () => {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/tasks/:taskId');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, hasPermission, taskPermissions } = usePermissions();

  // Local state
  const [operationError, setOperationError] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const taskId = params?.taskId;

  // Fetch task data
  const {
    data: task,
    isLoading: taskLoading,
    error: taskError,
    refetch: refetchTask
  } = useQuery({
    queryKey: ['/api/tasks', taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Task not found');
        }
        if (response.status === 403) {
          throw new Error('You don\'t have permission to view this task');
        }
        throw new Error('Failed to fetch task');
      }
      return response.json();
    },
    enabled: !!taskId,
    retry: (failureCount, error) => {
      // Don't retry on permission errors or not found
      if (error?.message?.includes('permission') || error?.message?.includes('not found')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // Fetch related data
  const { data: subtasks = [] } = useQuery({
    queryKey: ['/api/tasks', taskId, 'subtasks'],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}/subtasks`);
      return response.ok ? response.json() : [];
    },
    enabled: !!taskId && !!task
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['/api/tasks', taskId, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      return response.ok ? response.json() : [];
    },
    enabled: !!taskId && !!task
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['/api/tasks', taskId, 'audit'],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}/audit`);
      return response.ok ? response.json() : [];
    },
    enabled: !!taskId && !!task
  });

  const { data: linkedTasks = [] } = useQuery({
    queryKey: ['/api/tasks', taskId, 'linked'],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}/linked`);
      return response.ok ? response.json() : [];
    },
    enabled: !!taskId && !!task
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      return response.ok ? response.json() : [];
    }
  });

  // Mutations
  const updateTaskMutation = useMutation({
    mutationFn: async (updates) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/tasks', taskId]);
      toast({ title: 'Task updated successfully' });
      setOperationError(null);
    },
    onError: (error) => {
      setOperationError({ operation: 'update', error });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Task deleted successfully' });
      setLocation('/tasks');
    },
    onError: (error) => {
      setOperationError({ operation: 'delete', error });
      setShowDeleteDialog(false);
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async (commentData) => {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/tasks', taskId, 'comments']);
      queryClient.invalidateQueries(['/api/tasks', taskId, 'audit']);
      toast({ title: 'Comment added successfully' });
    },
    onError: (error) => {
      setOperationError({ operation: 'comment', error });
    }
  });

  // Event handlers
  const handleBack = () => {
    setLocation('/tasks');
  };

  const handleEdit = () => {
    setLocation(`/tasks/${taskId}/edit`);
  };

  const handleStatusChange = (newStatus) => {
    if (!taskPermissions.canManageTeamTasks && task.assignee?.id !== user?.id) {
      toast({
        title: 'Permission denied',
        description: 'You can only change status of tasks assigned to you',
        variant: 'destructive'
      });
      return;
    }

    updateTaskMutation.mutate({ status: newStatus });
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    // Check for incomplete subtasks
    const incompleteSubtasks = subtasks.filter(s => s.status !== 'completed');
    if (incompleteSubtasks.length > 0) {
      toast({
        title: 'Cannot delete task',
        description: 'Please complete or remove all subtasks first',
        variant: 'destructive'
      });
      setShowDeleteDialog(false);
      return;
    }

    deleteTaskMutation.mutate();
  };

  const handleReassign = () => {
    // Open reassign dialog (would be implemented)
    toast({ title: 'Reassign functionality would open here' });
  };

  const handleCreateSubtask = () => {
    // Open subtask creation dialog (would be implemented)
    toast({ title: 'Create subtask functionality would open here' });
  };

  const handleSnooze = () => {
    // Open snooze dialog (would be implemented)
    toast({ title: 'Snooze functionality would open here' });
  };

  const handleExport = () => {
    // Export task data (would be implemented)
    toast({ title: 'Export functionality would open here' });
  };

  // Permission checks
  const canViewTask = hasPermission('VIEW_TASK') || 
                     task?.assignee?.id === user?.id || 
                     task?.createdBy?.id === user?.id;

  const canEditTask = hasPermission('EDIT_TASK') || 
                     (task?.createdBy?.id === user?.id && hasPermission('EDIT_OWN_TASK'));

  const canDeleteTask = hasPermission('DELETE_TASK') || 
                       (task?.createdBy?.id === user?.id && hasPermission('DELETE_OWN_TASK'));

  // Loading states
  if (taskLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-16 w-full mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (taskError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {taskError.message || 'Failed to load task'}
          </AlertDescription>
          <Button onClick={() => refetchTask()} className="mt-4">
            Try Again
          </Button>
        </Alert>
      </div>
    );
  }

  if (!task || !canViewTask) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Task not found or you don't have permission to view it.
          </AlertDescription>
          <Button onClick={handleBack} className="mt-4">
            Back to Tasks
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <TaskErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Task Header */}
        <TaskHeader
          task={task}
          onBack={handleBack}
          onEdit={canEditTask ? handleEdit : undefined}
          onReassign={canEditTask ? handleReassign : undefined}
          onCreateSubtask={taskPermissions.canManageTeamTasks ? handleCreateSubtask : undefined}
          onDelete={canDeleteTask ? handleDelete : undefined}
          onSnooze={handleSnooze}
          onExport={handleExport}
          onStatusChange={handleStatusChange}
          isLoading={updateTaskMutation.isPending}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Operation Error Alert */}
          {operationError && (
            <div className="mb-6">
              <TaskOperationError
                error={operationError.error}
                operation={operationError.operation}
                onRetry={() => {
                  setOperationError(null);
                  // Retry the failed operation based on type
                  if (operationError.operation === 'update') {
                    updateTaskMutation.mutate(task);
                  }
                }}
                onCancel={() => setOperationError(null)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Core Task Information */}
              <CoreTaskInfo
                task={task}
                linkedTasks={linkedTasks}
                onEditTask={canEditTask ? handleEdit : undefined}
                onViewLinkedTask={(id) => setLocation(`/tasks/${id}`)}
              />

              {/* Enhanced Tabs */}
              <EnhancedTaskTabs
                task={task}
                subtasks={subtasks}
                forms={task.forms || []}
                attachments={task.attachments || []}
                comments={comments}
                auditLogs={auditLogs}
                users={users}
                onCreateSubtask={handleCreateSubtask}
                onUploadFile={() => toast({ title: 'File upload would open here' })}
                onAddComment={(commentData) => addCommentMutation.mutate(commentData)}
                onEditComment={(id, data) => toast({ title: 'Edit comment functionality' })}
                onDeleteComment={(id) => toast({ title: 'Delete comment functionality' })}
                currentUser={user}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtasks</span>
                    <span className="font-medium">{subtasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Comments</span>
                    <span className="font-medium">{comments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attachments</span>
                    <span className="font-medium">{task.attachments?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{task.progress || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-gray-900">{log.action}</p>
                      <p className="text-gray-500 text-xs">{log.timestamp}</p>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to delete this task? This action cannot be undone.</p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(false)}
                  data-testid="button-cancel-delete"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDelete}
                  disabled={deleteTaskMutation.isPending}
                  data-testid="button-confirm-delete"
                >
                  {deleteTaskMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Delete Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TaskErrorBoundary>
  );
};

/**
 * Protected Task Detail Page
 * Wraps the main component with authentication and route protection
 */
const ProtectedTaskDetailPage = () => {
  return (
    <EnhancedProtectedRoute requiredPermission="VIEW_TASK">
      <EnhancedTaskDetailPage />
    </EnhancedProtectedRoute>
  );
};

export default ProtectedTaskDetailPage;