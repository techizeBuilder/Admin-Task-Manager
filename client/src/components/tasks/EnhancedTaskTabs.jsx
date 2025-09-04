import React, { useState } from 'react';
// Simplified permissions instead of complex RBAC
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskComments } from './TaskComments';
import { TaskAuditTrail } from './TaskAuditTrail';
import {
  CheckCircle2,
  FileText,
  Paperclip,
  Activity,
  MessageCircle,
  Plus,
  Calendar,
  User,
  AlertTriangle
} from 'lucide-react';

/**
 * Enhanced TaskTabs Component
 * Complete tab system with Subtasks, Forms, Attachments, Activity Feed, and Comments
 */
export const EnhancedTaskTabs = ({
  task,
  subtasks = [],
  forms = [],
  attachments = [],
  comments = [],
  auditLogs = [],
  users = [],
  onCreateSubtask,
  onUpdateSubtask,
  onDeleteSubtask,
  onCreateForm,
  onUploadFile,
  onDeleteFile,
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUser
}) => {
  // Simplified permissions for compatibility
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  const taskPermissions = { canManageTeamTasks: isAdmin };
  const fields = { canAssignToOthers: isAdmin };
  const [activeTab, setActiveTab] = useState('subtasks');

  // Calculate counts for tab badges
  const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;
  const pendingSubtasks = subtasks.filter(s => s.status !== 'completed').length;
  const unreadComments = comments.filter(c => c.isUnread).length;

  // Subtasks Tab Content
  const SubtasksTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">Subtasks</h3>
          <div className="flex space-x-2">
            <Badge variant="outline" className="text-green-600">
              {completedSubtasks} completed
            </Badge>
            <Badge variant="outline" className="text-blue-600">
              {pendingSubtasks} pending
            </Badge>
          </div>
        </div>
        
        {taskPermissions.canManageTeamTasks && (
          <Button onClick={onCreateSubtask} size="sm" data-testid="button-create-subtask">
            <Plus className="h-4 w-4 mr-2" />
            Add Subtask
          </Button>
        )}
      </div>

      {subtasks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No subtasks yet</p>
            {taskPermissions.canManageTeamTasks && (
              <Button variant="outline" onClick={onCreateSubtask} data-testid="button-first-subtask">
                Create First Subtask
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <Card key={subtask.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <button
                      onClick={() => onUpdateSubtask(subtask.id, { 
                        status: subtask.status === 'completed' ? 'pending' : 'completed' 
                      })}
                      className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                        subtask.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                      data-testid={`subtask-checkbox-${subtask.id}`}
                    >
                      {subtask.status === 'completed' && (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${
                        subtask.status === 'completed' 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-900'
                      }`}>
                        {subtask.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {subtask.assignee && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{subtask.assignee.name}</span>
                          </div>
                        )}
                        {subtask.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{subtask.dueDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        subtask.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                      }`}
                    >
                      {subtask.status}
                    </Badge>
                    
                    {fields.canAssignToOthers && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDeleteSubtask?.(subtask.id)}
                        data-testid={`button-delete-subtask-${subtask.id}`}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Forms Tab Content  
  const FormsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Forms & Processes</h3>
        {taskPermissions.canManageTeamTasks && (
          <Button onClick={onCreateForm} size="sm" data-testid="button-create-form">
            <Plus className="h-4 w-4 mr-2" />
            Add Form
          </Button>
        )}
      </div>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No forms attached</p>
            {taskPermissions.canManageTeamTasks && (
              <Button variant="outline" onClick={onCreateForm} data-testid="button-first-form">
                Attach First Form
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {forms.map((form) => (
            <Card key={form.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{form.name}</p>
                      <p className="text-xs text-gray-500">{form.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={form.status === 'completed' ? 'default' : 'outline'}>
                      {form.status}
                    </Badge>
                    <Button variant="outline" size="sm" data-testid={`button-view-form-${form.id}`}>
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Attachments Tab Content
  const AttachmentsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Attachments</h3>
        <Button onClick={onUploadFile} size="sm" data-testid="button-upload-file">
          <Paperclip className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </div>

      {attachments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No files attached</p>
            <Button variant="outline" onClick={onUploadFile} data-testid="button-first-file">
              Upload First File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {attachments.map((file) => (
            <Card key={file.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {file.type?.includes('image') ? '🖼️' : 
                       file.type?.includes('pdf') ? '📄' : 
                       file.type?.includes('doc') ? '📝' : '📎'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>Uploaded by {file.uploadedBy}</span>
                        <span>•</span>
                        <span>{file.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" data-testid={`button-download-${file.id}`}>
                      Download
                    </Button>
                    {fields.canAssignToOthers && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDeleteFile?.(file.id)}
                        data-testid={`button-delete-file-${file.id}`}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    {
      value: 'subtasks',
      label: 'Subtasks',
      icon: CheckCircle2,
      count: subtasks.length,
      component: SubtasksTab
    },
    {
      value: 'forms',
      label: 'Forms',
      icon: FileText,
      count: forms.length,
      component: FormsTab
    },
    {
      value: 'attachments',
      label: 'Attachments',
      icon: Paperclip,
      count: attachments.length,
      component: AttachmentsTab
    },
    {
      value: 'activity',
      label: 'Activity',
      icon: Activity,
      count: auditLogs.length,
      component: () => (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Activity Feed</h3>
          <TaskAuditTrail auditLogs={auditLogs} />
        </div>
      )
    },
    {
      value: 'comments',
      label: 'Comments',
      icon: MessageCircle,
      count: comments.length,
      badge: unreadComments > 0 ? unreadComments : null,
      component: () => (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Comments</h3>
          <TaskComments
            taskId={task.id}
            comments={comments}
            onAddComment={onAddComment}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
            currentUser={currentUser}
            users={users}
          />
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {tabs.map(({ value, label, icon: Icon, count, badge }) => (
              <TabsTrigger 
                key={value} 
                value={value} 
                className="flex items-center space-x-2"
                data-testid={`tab-${value}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {count}
                  </Badge>
                )}
                {badge && (
                  <Badge variant="destructive" className="text-xs ml-1">
                    {badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map(({ value, component: Component }) => (
            <TabsContent key={value} value={value} className="mt-6 space-y-4">
              <Component />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedTaskTabs;