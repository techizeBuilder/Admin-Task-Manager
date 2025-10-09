import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TaskAttachments from '../../pages/newComponents/TaskAttachments';
import {
  FileIcon,
  MessageCircle,
  Activity,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Plus,
  User,
  Paperclip,
  Upload,
  Trash2,
  Download,
  Send,
  Edit,
  Link2,
  ExternalLink,
  FileText,
  X,
  Bell,
  Tag,
  Image,
  Archive,
  Folder,
  Circle
} from 'lucide-react';

/**
 * EnhancedTaskTabs Component - Fully Dynamic with Backend Integration
 * Tabs: Core Info, Subtasks, Comments, Activity Feed, Files & Links, Linked Items
 */
export const EnhancedTaskTabs = ({
  task,
  subtasks = [],
  comments = [],
  auditLogs = [],
  users = [],
  linkedTasks = [],
  onAddComment,
  onUpdateSubtask,
  onCreateSubtask,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('core-info');
  const [newComment, setNewComment] = useState('');
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showItemLinkModal, setShowItemLinkModal] = useState(false);
  
  // Files & Links state
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [taskFiles, setTaskFiles] = useState([]);
  const [taskLinks, setTaskLinks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [linkForm, setLinkForm] = useState({ url: '', title: '', description: '' });
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic data state
  const [taskData, setTaskData] = useState(task || {});
  const [taskComments, setTaskComments] = useState(comments || []);
  const [taskSubtasks, setTaskSubtasks] = useState(subtasks || []);
  const [activityFeed, setActivityFeed] = useState(auditLogs || []);
  const [linkedItems, setLinkedItems] = useState(linkedTasks || []);
  
  // Get current user from localStorage or context
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : { name: 'Current User' };
    } catch {
      return { name: 'Current User' };
    }
  });

  // API Configuration
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  // Fetch all task data on component mount and when task changes
  useEffect(() => {
    if (task?._id) {
      fetchTaskData();
      fetchFiles();
      fetchLinks();
      fetchComments();
      fetchSubtasks();
      fetchActivityFeed();
      fetchLinkedItems();
    }
  }, [task?._id]);

  const fetchTaskData = async () => {
    if (!task?._id) return;
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setTaskData(data.data);
      }
    } catch (error) {
      console.error('Error fetching task data:', error);
    }
  };

  const fetchFiles = async () => {
    if (!task?._id) return;
    try {
      const response = await fetch(`/api/tasks/${task._id}/files`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTaskFiles(data.data || []);
      } else {
        console.error('Failed to fetch files:', data.message);
        setTaskFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setTaskFiles([]);
    }
  };

  const fetchLinks = async () => {
    if (!task?._id) return;
    try {
      const response = await fetch(`/api/tasks/${task._id}/links`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTaskLinks(data.data || []);
      } else {
        console.error('Failed to fetch links:', data.message);
        setTaskLinks([]);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
      setTaskLinks([]);
    }
  };

  const fetchComments = async () => {
    if (!task?._id) return;
    try {
      const response = await fetch(`/api/tasks/${task._id}/comments`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setTaskComments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setTaskComments([]);
    }
  };

  const fetchSubtasks = async () => {
    if (!task?._id) return;
    try {
      const response = await fetch(`/api/tasks/${task._id}/subtasks`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setTaskSubtasks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching subtasks:', error);
      setTaskSubtasks([]);
    }
  };

  const fetchActivityFeed = async () => {
    if (!task?._id) return;
    try {
      const response = await fetch(`/api/tasks/${task._id}/activities`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setActivityFeed(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      setActivityFeed([]);
    }
  };

  const fetchLinkedItems = async () => {
    if (!task?._id) return;
    try {
      const response = await fetch(`/api/tasks/${task._id}/linked-items`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      if (data.success) {
        setLinkedItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching linked items:', error);
      setLinkedItems([]);
    }
  };

  const handleFileUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    
    for (const file of fileList) {
      // Validate file size
      if (file.size > 2 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 2MB.`);
        continue;
      }

      // Validate file type
      const allowedTypes = ['jpg', 'jpeg', 'png', 'pdf', 'docx', 'xlsx', 'pptx', 'zip'];
      const fileExt = file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExt)) {
        alert(`Invalid file type for ${file.name}. Allowed: ${allowedTypes.join(', ')}`);
        continue;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`/api/tasks/${task._id}/files`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        const data = await response.json();
        
        if (data.success) {
          // Refresh files list
          await fetchFiles();
          await fetchActivityFeed(); // Refresh activity feed to show upload activity
        } else {
          alert(data.message || 'Failed to upload file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file');
      }
    }
    
    setUploading(false);
  };

  const handleFileDelete = async (fileId, fileName) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;

    try {
      const response = await fetch(`/api/tasks/${task._id}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchFiles();
        await fetchActivityFeed(); // Refresh activity feed to show delete activity
      } else {
        alert(data.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const handleLinkAdd = async () => {
    if (!linkForm.url.trim()) {
      alert('URL is required');
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${task._id}/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(linkForm)
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchLinks();
        await fetchActivityFeed(); // Refresh activity feed to show link addition
        setShowLinkModal(false);
        setLinkForm({ url: '', title: '', description: '' });
      } else {
        alert(data.message || 'Failed to add link');
      }
    } catch (error) {
      console.error('Error adding link:', error);
      alert('Failed to add link');
    }
  };

  const handleLinkDelete = async (linkId, linkTitle) => {
    if (!confirm(`Are you sure you want to delete "${linkTitle}"?`)) return;

    try {
      const response = await fetch(`/api/tasks/${task._id}/links/${linkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchLinks();
        await fetchActivityFeed(); // Refresh activity feed to show link deletion
      } else {
        alert(data.message || 'Failed to delete link');
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Failed to delete link');
    }
  };

  const handleCommentAdd = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${task._id}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: newComment })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchComments();
        await fetchActivityFeed();
        setNewComment('');
      } else {
        alert(data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleSubtaskStatusUpdate = async (subtaskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${task._id}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchSubtasks();
        await fetchActivityFeed();
      } else {
        alert(data.message || 'Failed to update subtask');
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
      alert('Failed to update subtask');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  // Get file type icon
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="w-4 h-4 text-orange-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-4 h-4 text-purple-600" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString() + ' at ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'in-progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'overdue': { color: 'bg-red-100 text-red-800', label: 'Overdue' },
      'cancelled': { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'low': { color: 'bg-gray-100 text-gray-800', label: 'Low' },
      'medium': { color: 'bg-blue-100 text-blue-800', label: 'Medium' },
      'high': { color: 'bg-orange-100 text-orange-800', label: 'High' },
      'urgent': { color: 'bg-red-100 text-red-800', label: 'Urgent' }
    };
    
    const config = priorityConfig[priority] || priorityConfig['medium'];
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    );
  };

  const getTaskTypeLabel = (taskType) => {
    const typeLabels = {
      'regular': 'Regular Task',
      'recurring': 'Recurring Task',
      'milestone': 'Milestone',
      'approval': 'Approval Task'
    };
    return typeLabels[taskType] || 'Regular Task';
  };

  // Core Info Tab Content - Dynamic and fully integrated
  const CoreInfoTab = () => {
    const currentTask = taskData || task || {};
    
    return (
      <div className="space-y-6 p-6">
        {/* Task Overview Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileIcon className="h-5 w-5" />
                Task Overview
              </CardTitle>
              <CardDescription>Complete task information and details</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-blue-600">
              View More
            </Button>
          </CardHeader>
          <CardContent>
            {/* Active Reminders */}
            {currentTask.dueDate && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-4 w-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Active Reminders:</span>
                </div>
                <p className="text-yellow-700 text-sm">
                  Due: {formatDate(currentTask.dueDate)}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {currentTask.description || 'No description provided'}
              </p>
            </div>

            {/* Detailed View Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Task Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4" />
                  <h4 className="font-medium">Task Details</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline" className="text-xs">
                      {getTaskTypeLabel(currentTask.taskType)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    {getPriorityBadge(currentTask.priority)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(currentTask.status)}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4" />
                  <h4 className="font-medium">Timeline</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span>{formatDate(currentTask.startDate) || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span>{formatDate(currentTask.dueDate) || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Estimate:</span>
                    <span>{currentTask.estimatedHours ? `${currentTask.estimatedHours} hours` : 'Not set'}</span>
                  </div>
                </div>
              </div>

              {/* Creation Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4" />
                  <h4 className="font-medium">Creation Info</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created By:</span>
                    <span>{currentTask.createdBy?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>{formatDate(currentTask.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span>{formatDate(currentTask.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment & Status, Collaborators & Tags, Relationships & Hierarchy */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {/* Assignment & Status */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4" />
                  <h4 className="font-medium">Assignment & Status</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 text-sm">Assignee:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {currentTask.assignedTo?.name?.charAt(0) || 'N'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{currentTask.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Current Status:</span>
                    <div className="ml-2 mt-1">
                      {getStatusBadge(currentTask.status)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Priority:</span>
                    <div className="ml-2 mt-1">
                      {getPriorityBadge(currentTask.priority)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collaborators & Tags */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4" />
                  <h4 className="font-medium">Collaborators & Tags</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 text-sm">Collaborators:</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {currentTask.collaborators?.length > 0 ? (
                        currentTask.collaborators.map((collaborator) => (
                          <Badge key={collaborator._id} variant="secondary" className="text-xs">
                            {collaborator.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No collaborators</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentTask.tags?.length > 0 ? (
                        currentTask.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No tags</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Relationships & Hierarchy */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="h-4 w-4" />
                  <h4 className="font-medium">Relationships & Hierarchy</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parent Task:</span>
                    <span>{currentTask.parentTask?.title || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sub-tasks Count:</span>
                    <span>{taskSubtasks?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Linked Items:</span>
                    <span>{linkedItems?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attached Forms */}
            {currentTask.attachedForms?.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4" />
                  <h4 className="font-medium">Attached Forms ({currentTask.attachedForms.length})</h4>
                </div>
                <div className="space-y-2">
                  {currentTask.attachedForms.map((form) => (
                    <div key={form._id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-sm">{form.title}</h5>
                          <p className="text-xs text-gray-600">{form.type}</p>
                        </div>
                        {getStatusBadge(form.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Subtasks Tab Content - Dynamic and fully integrated
  const SubtasksTab = () => {
    const [showCompleted, setShowCompleted] = useState(false);
    const filteredSubtasks = taskSubtasks?.filter(subtask => 
      showCompleted ? true : subtask.status !== 'completed'
    ) || [];

    const completedCount = taskSubtasks?.filter(subtask => subtask.status === 'completed').length || 0;
    const totalCount = taskSubtasks?.length || 0;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
      <div className="space-y-6 p-6">
        {/* Subtasks Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Subtasks ({totalCount})
                </CardTitle>
                <CardDescription>Track individual task components and progress</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {completedCount}/{totalCount} Complete
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-xs"
                >
                  {showCompleted ? 'Hide' : 'Show'} Completed
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Subtasks List */}
            <div className="space-y-3">
              {filteredSubtasks.length > 0 ? (
                filteredSubtasks.map((subtask) => (
                  <div key={subtask._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto"
                          onClick={() => handleSubtaskStatusUpdate(subtask._id, 
                            subtask.status === 'completed' ? 'pending' : 'completed'
                          )}
                        >
                          {subtask.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <h4 className={`font-medium ${subtask.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                            {subtask.title}
                          </h4>
                          {subtask.description && (
                            <p className="text-sm text-gray-600 mt-1">{subtask.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Created: {formatDate(subtask.createdAt)}</span>
                            {subtask.dueDate && (
                              <span>Due: {formatDate(subtask.dueDate)}</span>
                            )}
                            {subtask.assignedTo && (
                              <span>Assigned to: {subtask.assignedTo.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(subtask.status)}
                        {subtask.priority && getPriorityBadge(subtask.priority)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No subtasks {showCompleted ? '' : 'to show'}</p>
                  <p className="text-sm">Break down this task into smaller components</p>
                </div>
              )}
            </div>

            {/* Add Subtask Button */}
            <Button variant="outline" className="w-full mt-4" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Subtask
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Comments Tab Content - Dynamic and fully integrated
  const CommentsTab = () => {
    const [newComment, setNewComment] = useState('');

    const handleAddComment = async () => {
      if (!newComment.trim()) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tasks/${task._id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ content: newComment })
        });

        if (response.ok) {
          const comment = await response.json();
          setTaskComments(prev => [comment, ...prev]);
          setNewComment('');
          // Refresh activity feed to show comment activity
          fetchActivityFeed();
        } else {
          console.error('Failed to add comment');
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleReaction = async (commentId, reactionType) => {
      try {
        const response = await fetch(`/api/tasks/${task._id}/comments/${commentId}/react`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ reactionType })
        });

        if (response.ok) {
          fetchComments(); // Refresh comments to show updated reactions
        }
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    };

    return (
      <div className="space-y-6 p-6">
        {/* Comments Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments ({taskComments?.length || 0})
            </CardTitle>
            <CardDescription>Discussion and collaboration on this task</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Comments List */}
            <div className="space-y-4 mb-6">
              {taskComments?.length > 0 ? (
                taskComments.map((comment) => (
                  <div key={comment._id} className="flex gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {comment.author?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">{comment.author?.name || 'Unknown User'}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        {comment.edited && (
                          <Badge variant="outline" className="text-xs">Edited</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{comment.content}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <button 
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                          onClick={() => handleReaction(comment._id, 'like')}
                        >
                          👍 {comment.reactions?.likes || 0}
                        </button>
                        <button 
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                          onClick={() => handleReaction(comment._id, 'dislike')}
                        >
                          👎 {comment.reactions?.dislikes || 0}
                        </button>
                        <button className="hover:text-blue-600 transition-colors">
                          Reply
                        </button>
                        {comment.replies?.length > 0 && (
                          <span className="text-gray-500">
                            {comment.replies.length} replies
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No comments yet</p>
                  <p className="text-sm">Start the conversation about this task</p>
                </div>
              )}
            </div>

            {/* Add Comment */}
            <div className="border-t pt-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea 
                    placeholder="Leave a comment..."
                    className="mb-3"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" disabled={isLoading}>
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" disabled={isLoading}>
                        😊
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={handleAddComment}
                      disabled={isLoading || !newComment.trim()}
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Activity Feed Tab Content - Dynamic and fully integrated
  const ActivityFeedTab = () => {
    const [activityFilter, setActivityFilter] = useState('all');

    const filteredActivities = activityFeed?.filter(activity => {
      if (activityFilter === 'all') return true;
      return activity.type === activityFilter;
    }) || [];

    const getActivityIcon = (type) => {
      switch (type) {
        case 'task_created': return CheckCircle2;
        case 'status_changed': return Activity;
        case 'title_changed': 
        case 'description_changed': 
        case 'priority_changed': 
        case 'due_date_changed': return Edit;
        case 'subtask_added': 
        case 'subtask_completed': return Plus;
        case 'comment_added': return MessageCircle;
        case 'file_uploaded': 
        case 'file_deleted': return Upload;
        case 'user_assigned': 
        case 'user_unassigned': return User;
        case 'link_added': 
        case 'link_removed': return Link2;
        default: return Activity;
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'task_created': return { icon: 'text-green-500', bg: 'bg-green-50' };
        case 'status_changed': return { icon: 'text-blue-500', bg: 'bg-blue-50' };
        case 'title_changed': 
        case 'description_changed': return { icon: 'text-purple-500', bg: 'bg-purple-50' };
        case 'priority_changed': return { icon: 'text-orange-500', bg: 'bg-orange-50' };
        case 'due_date_changed': return { icon: 'text-red-500', bg: 'bg-red-50' };
        case 'subtask_added': 
        case 'subtask_completed': return { icon: 'text-yellow-500', bg: 'bg-yellow-50' };
        case 'comment_added': return { icon: 'text-indigo-500', bg: 'bg-indigo-50' };
        case 'file_uploaded': 
        case 'file_deleted': return { icon: 'text-cyan-500', bg: 'bg-cyan-50' };
        case 'user_assigned': 
        case 'user_unassigned': return { icon: 'text-gray-500', bg: 'bg-gray-50' };
        case 'link_added': 
        case 'link_removed': return { icon: 'text-pink-500', bg: 'bg-pink-50' };
        default: return { icon: 'text-gray-500', bg: 'bg-gray-50' };
      }
    };

    const groupActivitiesByDate = (activities) => {
      const groups = {};
      activities.forEach(activity => {
        const date = new Date(activity.createdAt).toDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(activity);
      });
      return groups;
    };

    const groupedActivities = groupActivitiesByDate(filteredActivities);

    return (
      <div className="space-y-6 p-6">
        {/* Activity Feed Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Feed ({activityFeed?.length || 0})
                </CardTitle>
                <CardDescription>Track all task activities and changes</CardDescription>
              </div>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="comment_added">Comments</SelectItem>
                  <SelectItem value="status_changed">Status Changes</SelectItem>
                  <SelectItem value="user_assigned">Assignments</SelectItem>
                  <SelectItem value="file_uploaded">File Uploads</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Activity Timeline */}
            <div className="space-y-6">
              {Object.keys(groupedActivities).length > 0 ? (
                Object.entries(groupedActivities).map(([date, activities]) => (
                  <div key={date}>
                    <div className="text-sm font-medium text-gray-600 mb-3 uppercase tracking-wide">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    <div className="space-y-2">
                      {activities.map((activity) => {
                        const IconComponent = getActivityIcon(activity.type);
                        const colors = getActivityColor(activity.type);
                        
                        return (
                          <div key={activity._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className={`p-2 rounded-full ${colors.bg} flex-shrink-0`}>
                              <IconComponent className={`h-4 w-4 ${colors.icon}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700">{activity.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-gray-500">
                                  {formatDate(activity.createdAt)}
                                </p>
                                {activity.user && (
                                  <Badge variant="outline" className="text-xs">
                                    {activity.user.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No activity to show</p>
                  <p className="text-sm">Task activities will appear here as they happen</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Files & Links Tab Content - Fully Dynamic and Fixed
  const FilesLinksTab = () => {
    return (
    <div className="space-y-6">
      {/* Files Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Files ({taskFiles?.length || 0})</h3>
          <label htmlFor="fileInput" className="btn-primary cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
            <input
              id="fileInput"
              type="file"
              multiple
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx,.pptx,.zip"
              onChange={(e) => handleFileUpload(Array.from(e.target.files))}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Drag & drop files here or click Upload File button
          </p>
          <p className="text-sm text-gray-500">
            Supported: JPG, PNG, PDF, DOCX, XLSX, PPTX, ZIP (Max: 2MB)
          </p>
        </div>

        {/* Files List */}
        {taskFiles?.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Uploaded Files ({taskFiles.length})</h4>
            <div className="space-y-2">
              {taskFiles.map((file) => (
                <div key={file._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded border flex items-center justify-center">
                      {getFileIcon(file.originalName)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                         onClick={() => window.open(file.url, '_blank')}>
                        {file.originalName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                        {file.uploadedBy && ` • by ${file.uploadedBy.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(file.url, '_blank')}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="Download/Open file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFileDelete(file._id, file.originalName)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {taskFiles?.length === 0 && !uploading && (
          <div className="mt-6 text-center py-8 text-gray-500">
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No files uploaded yet</p>
            <p className="text-sm">Upload files to share with your team</p>
          </div>
        )}

        {uploading && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-blue-600">Uploading files...</span>
            </div>
          </div>
        )}
      </div>

      {/* Links Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">External Links ({taskLinks?.length || 0})</h3>
          <button
            onClick={() => setShowLinkModal(true)}
            className="btn-primary inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Add Link
          </button>
        </div>

        {/* Links List */}
        {taskLinks?.length > 0 && (
          <div className="space-y-2">
            {taskLinks.map((link) => (
              <div key={link._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                    <ExternalLink className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors"
                      >
                        {link.title || link.url}
                      </a>
                    </p>
                    {link.description && (
                      <p className="text-sm text-gray-600">{link.description}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {formatDate(link.createdAt)}
                      {link.createdBy && ` • by ${link.createdBy.name}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(link.url, '_blank')}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleLinkDelete(link._id, link.title || link.url)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    title="Delete link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {taskLinks?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ExternalLink className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No external links added yet</p>
            <p className="text-sm">Add links to related resources and documents</p>
          </div>
        )}
      </div>

      {/* Add Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add External Link</h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={linkForm.title}
                  onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                  placeholder="Link title (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={linkForm.description}
                  onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                  placeholder="Brief description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  };

  // Linked Items Tab Content - Dynamic and fully integrated
  const LinkedItemsTab = () => {
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkType, setLinkType] = useState('task');

    const handleLinkItem = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tasks/${task._id}/links`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            linkedItemId: linkType === 'task' ? selectedTaskId : selectedDocumentId,
            linkType: linkType,
            relationship: 'connected'
          })
        });

        if (response.ok) {
          const newLink = await response.json();
          setLinkedItems(prev => [...prev, newLink]);
          setShowLinkModal(false);
          // Refresh activity feed to show link activity
          fetchActivityFeed();
        } else {
          console.error('Failed to link item');
        }
      } catch (error) {
        console.error('Error linking item:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleUnlinkItem = async (linkId) => {
      try {
        const response = await fetch(`/api/tasks/${task._id}/links/${linkId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          setLinkedItems(prev => prev.filter(link => link._id !== linkId));
          // Refresh activity feed to show unlink activity
          fetchActivityFeed();
        } else {
          console.error('Failed to unlink item');
        }
      } catch (error) {
        console.error('Error unlinking item:', error);
      }
    };

    const getItemIcon = (type) => {
      switch (type) {
        case 'task': return CheckCircle2;
        case 'document': return FileText;
        case 'form': return FileIcon;
        case 'project': return Folder;
        default: return Link2;
      }
    };

    const getItemColor = (type) => {
      switch (type) {
        case 'task': return 'text-blue-500';
        case 'document': return 'text-green-500';
        case 'form': return 'text-purple-500';
        case 'project': return 'text-orange-500';
        default: return 'text-gray-500';
      }
    };

    return (
      <div className="space-y-6 p-6">
        {/* Linked Items Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Linked Items ({linkedItems?.length || 0})
                </CardTitle>
                <CardDescription>Connect this task to related items and resources</CardDescription>
              </div>
              <Button 
                onClick={() => setShowLinkModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Link Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Linked Items List */}
            <div className="space-y-4">
              {linkedItems?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {linkedItems.map((link) => {
                    const IconComponent = getItemIcon(link.type);
                    const iconColor = getItemColor(link.type);
                    
                    return (
                      <div key={link._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <IconComponent className={`h-5 w-5 ${iconColor} mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">{link.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{link.description}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span>Type: {link.type}</span>
                                <Badge variant="outline" className="text-xs">
                                  {link.relationship || 'Connected'}
                                </Badge>
                                {link.status && getStatusBadge(link.status)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button variant="ghost" size="sm" className="p-1">
                              <Eye className="h-4 w-4 text-gray-400" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-1"
                              onClick={() => handleUnlinkItem(link._id)}
                            >
                              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Link2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No linked items</p>
                  <p className="text-sm">Connect this task to related items for better organization</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Link Item Modal */}
        {showLinkModal && (
          <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Link Item</DialogTitle>
                <DialogDescription>
                  Connect this task to another item in your workspace
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Type
                  </label>
                  <Select value={linkType} onValueChange={setLinkType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="form">Form</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search & Select
                  </label>
                  <input
                    type="text"
                    placeholder={`Search for ${linkType}s...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship Type
                  </label>
                  <Select defaultValue="connected">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="connected">Connected</SelectItem>
                      <SelectItem value="depends-on">Depends On</SelectItem>
                      <SelectItem value="blocks">Blocks</SelectItem>
                      <SelectItem value="relates-to">Relates To</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowLinkModal(false)}>
                  Cancel
                </Button>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleLinkItem}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Link2 className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Linking...' : 'Link Item'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Navigation - Dynamic counts and state management */}
        <TabsList className="grid w-full grid-cols-6 bg-gray-50 border-b">
          <TabsTrigger value="core-info" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <FileIcon className="h-4 w-4" />
            Core Info
          </TabsTrigger>
          <TabsTrigger value="subtasks" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <CheckCircle2 className="h-4 w-4" />
            Subtasks
            {taskSubtasks?.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{taskSubtasks.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <MessageCircle className="h-4 w-4" />
            Comments
            {taskComments?.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{taskComments.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <Activity className="h-4 w-4" />
            Activity Feed
            {activityFeed?.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{activityFeed.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <Paperclip className="h-4 w-4" />
            Files & Links
            {(taskFiles?.length > 0 || taskLinks?.length > 0) && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {(taskFiles?.length || 0) + (taskLinks?.length || 0)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="linked" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <Link2 className="h-4 w-4" />
            Linked Items
            {linkedItems?.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{linkedItems.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value="core-info" className="m-0">
          <CoreInfoTab />
        </TabsContent>

        <TabsContent value="subtasks" className="m-0">
          <SubtasksTab />
        </TabsContent>

        <TabsContent value="comments" className="m-0">
          <CommentsTab />
        </TabsContent>

        <TabsContent value="activity" className="m-0">
          <ActivityFeedTab />
        </TabsContent>

        <TabsContent value="files" className="m-0">
          <TaskAttachments taskId={task?._id} />
        </TabsContent>

        <TabsContent value="linked" className="m-0">
          <LinkedItemsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTaskTabs;