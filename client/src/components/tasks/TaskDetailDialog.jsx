import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskComments } from "./TaskComments";
import { TaskAuditTrail } from "./TaskAuditTrail";
import { Calendar, User, Tag, Flag, Clock, Save, X } from "lucide-react";
import { format } from "date-fns";

export function TaskDetailDialog({ 
  task, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete,
  users = [], 
  projects = [],
  taskStatuses = [],
  comments = [],
  auditLogs = [],
  onAddComment,
  onEditComment,
  onDeleteComment,
  currentUser
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        priority: task.priority || 'medium',
        statusId: task.statusId || '',
        projectId: task.projectId || '',
        tags: task.tags || [],
        assignedTo: task.assignedTo || []
      });
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    await onUpdate(task._id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      priority: task.priority || 'medium',
      statusId: task.statusId || '',
      projectId: task.projectId || '',
      tags: task.tags || [],
      assignedTo: task.assignedTo || []
    });
    setIsEditing(false);
  };

  const handleTagAdd = (newTag) => {
    if (newTag && !editData.tags.includes(newTag)) {
      setEditData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.name?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "in progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "todo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const currentStatus = taskStatuses.find(s => s._id === task.statusId);
  const currentProject = projects.find(p => p._id === task.projectId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              {isEditing ? "Edit Task" : "Task Details"}
            </DialogTitle>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => onDelete(task._id)}
                  >
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Task Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              {isEditing ? (
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Task title"
                />
              ) : (
                <h2 className="text-xl font-semibold">{task.title}</h2>
              )}
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                {isEditing ? (
                  <Select 
                    value={editData.statusId} 
                    onValueChange={(value) => setEditData(prev => ({ ...prev, statusId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskStatuses.map(status => (
                        <SelectItem key={status._id} value={status._id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusColor(currentStatus)}>
                    {currentStatus?.name || "No Status"}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                {isEditing ? (
                  <Select 
                    value={editData.priority} 
                    onValueChange={(value) => setEditData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getPriorityColor(task.priority)}>
                    <Flag className="h-3 w-3 mr-1" />
                    {task.priority}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              {isEditing ? (
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Task description"
                  rows={4}
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {task.description || "No description provided"}
                </p>
              )}
            </div>

            {/* Due Date and Project */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editData.dueDate}
                    onChange={(e) => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      {task.dueDate ? format(new Date(task.dueDate), 'PPP') : "No due date"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                {isEditing ? (
                  <Select 
                    value={editData.projectId} 
                    onValueChange={(value) => setEditData(prev => ({ ...prev, projectId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Project</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span>{currentProject?.name || "No project assigned"}</span>
                )}
              </div>
            </div>

            {/* Assignees */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignees</label>
              <div className="flex items-center gap-2 flex-wrap">
                {task.assignedTo && task.assignedTo.length > 0 ? (
                  task.assignedTo.map((user, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.firstName} {user.lastName}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">No assignees</span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex items-center gap-2 flex-wrap">
                {editData.tags && editData.tags.length > 0 ? (
                  editData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      {isEditing && (
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleTagRemove(tag)}
                        />
                      )}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500">No tags</span>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Created</label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {task.createdAt ? format(new Date(task.createdAt), 'PPP p') : "Unknown"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {task.updatedAt ? format(new Date(task.updatedAt), 'PPP p') : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <TaskComments
              taskId={task._id}
              comments={comments}
              onAddComment={onAddComment}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              currentUser={currentUser}
              users={users}
            />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <TaskAuditTrail auditLogs={auditLogs} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}