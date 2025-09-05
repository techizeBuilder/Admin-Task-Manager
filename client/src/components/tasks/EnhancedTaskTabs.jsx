import React, { useState } from 'react';
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
import {
  FileIcon,
  MessageCircle,
  Activity,
  Paperclip,
  Link2,
  Plus,
  Clock,
  Calendar,
  User,
  Tag,
  CheckCircle2,
  AlertCircle,
  Upload,
  Download,
  Trash2,
  Edit,
  Eye,
  Send,
  Bell,
  FileText,
  ExternalLink
} from 'lucide-react';

/**
 * EnhancedTaskTabs Component - Matches wireframe design exactly
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

  // Core Info Tab Content - matches wireframe
  const CoreInfoTab = () => (
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Active Reminders:</span>
            </div>
            <p className="text-yellow-700 text-sm">Due in 3 days - 2024-01-25</p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              {task?.description || 'Migrate the existing database from MySQL to PostgreSQL while ensuring data integrity and minimal downtime.'}
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
                  <Badge variant="outline" className="text-xs">Regular Task</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Color Code:</span>
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visibility:</span>
                  <span>Private</span>
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
                  <span>2024-01-15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span>2024-01-25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Estimate:</span>
                  <span>40 hours</span>
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
                  <span>Sarah Wilson</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>15/01/2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>20/01/2024</span>
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
                      <AvatarFallback className="text-xs">JS</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">John Smith</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Current Status:</span>
                  <Badge className="ml-2 bg-blue-100 text-blue-800">In Progress</Badge>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Priority:</span>
                  <Badge className="ml-2 bg-orange-100 text-orange-800">High</Badge>
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
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">Mike Johnson</Badge>
                    <Badge variant="secondary" className="text-xs">Emily Davis</Badge>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">#database</Badge>
                    <Badge variant="outline" className="text-xs">#migration</Badge>
                    <Badge variant="outline" className="text-xs">#backend</Badge>
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
                  <span>None</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sub-tasks Count:</span>
                  <span>5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Linked Items:</span>
                  <span>3</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attached Forms */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4" />
              <h4 className="font-medium">Attached Forms (1)</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-sm">Migration Checklist</h5>
                  <p className="text-xs text-gray-600">checklist</p>
                </div>
                <Badge variant="outline" className="text-xs">In progress</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Subtasks Tab Content - matches wireframe
  const SubtasksTab = () => (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Sub-tasks (5/5)</span>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{width: '40%'}}></div>
          </div>
          <span className="text-sm text-gray-600">40%</span>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Sub-task
          </Button>
        </div>
      </div>

      {/* Subtasks List */}
      <div className="space-y-2">
        {[
          { id: 1, title: 'Backup existing database', status: 'completed', assignee: 'J', dueDate: '2024-01-20' },
          { id: 2, title: 'Set up PostgreSQL instance', status: 'in-progress', assignee: 'M', dueDate: '2024-01-22' },
          { id: 3, title: 'Create migration scripts', status: 'overdue', assignee: 'S', dueDate: '2024-01-24' },
          { id: 4, title: 'Test data integrity', status: 'overdue', assignee: 'E', dueDate: '2024-01-26' },
          { id: 5, title: 'Update application configs', status: 'overdue', assignee: 'A', dueDate: '2024-01-27' }
        ].map((subtask) => (
          <div key={subtask.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <CheckCircle2 className={`h-4 w-4 ${subtask.status === 'completed' ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="font-medium">{subtask.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-black">{subtask.dueDate}</span>
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{subtask.assignee}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Comments Tab Content - matches wireframe
  const CommentsTab = () => (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Comments (3)</h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {[
          {
            id: 1,
            author: { name: 'John Smith', avatar: 'JS' },
            content: "I've started working on the database schema migration. The initial analysis shows we need to handle about 2.5M records.",
            time: '561 days ago',
            reactions: { thumbsUp: 2, thumbsDown: 0, replies: 1 }
          },
          {
            id: 2,
            author: { name: 'Sarah Wilson', avatar: 'SW' },
            content: '@John Smith - Great! Please make sure to backup the data before starting the migration process. Also, have you considered the downtime window?',
            time: '561 days ago',
            reactions: { thumbsUp: 0, thumbsDown: 0, replies: 0 }
          },
          {
            id: 3,
            author: { name: 'Mike Johnson', avatar: 'MJ' },
            content: 'B/</> ',
            time: '561 days ago',
            reactions: { thumbsUp: 0, thumbsDown: 0, replies: 0 }
          }
        ].map((comment) => (
          <div key={comment.id} className="flex gap-3 p-4 border rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{comment.author.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{comment.author.name}</span>
                <span className="text-xs text-black">{comment.time}</span>
              </div>
              <p className="text-sm text-black mb-3">{comment.content}</p>
              <div className="flex items-center gap-4 text-xs text-black">
                <button className="flex items-center gap-1 hover:text-blue-600">
                  👍 {comment.reactions.thumbsUp}
                </button>
                <button className="flex items-center gap-1 hover:text-blue-600">
                  👎 {comment.reactions.thumbsDown}
                </button>
                <button className="hover:text-blue-600">I reply</button>
                <button className="hover:text-blue-600">Reply</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="border-t pt-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">MJ</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea 
              placeholder="Leave a comment..."
              className="mb-3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  😊
                </Button>
              </div>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Activity Feed Tab Content - matches wireframe  
  const ActivityFeedTab = () => (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <h3 className="font-medium">Activity Feed</h3>
          <span className="text-sm text-gray-500">Track all task activities and changes</span>
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="comments">Comments</SelectItem>
            <SelectItem value="status">Status Changes</SelectItem>
            <SelectItem value="assignments">Assignments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-600 mb-3">MONDAY, JANUARY 15, 2024</div>
        
        {[
          { 
            icon: CheckCircle2, 
            color: 'text-green-500', 
            action: 'John Smith created this task.',
            time: 'Jan 15, 2024',
            bgColor: 'bg-green-50'
          },
          { 
            icon: Edit, 
            color: 'text-purple-500', 
            action: 'Due Date changed from May 1, 2024 to May 7, 2024.',
            time: 'Jan 15, 2024',
            bgColor: 'bg-purple-50'
          },
          { 
            icon: Edit, 
            color: 'text-red-500', 
            action: 'Title changed from "Database Setup" to "Database Migration".',
            time: 'Jan 15, 2024',
            bgColor: 'bg-red-50'
          },
          { 
            icon: Plus, 
            color: 'text-yellow-500', 
            action: 'Subtask "Design Mockup" added by Jane Smith.',
            time: 'Jan 15, 2024',
            bgColor: 'bg-yellow-50'
          },
          { 
            icon: Activity, 
            color: 'text-blue-500', 
            action: 'Status updated to "In Progress".',
            time: 'Jan 15, 2024',
            bgColor: 'bg-blue-50'
          },
          { 
            icon: AlertTriangle, 
            color: 'text-purple-500', 
            action: 'Priority changed to "High".',
            time: 'Jan 15, 2024',
            bgColor: 'bg-purple-50'
          },
          { 
            icon: User, 
            color: 'text-gray-500', 
            action: 'Task assigned to Sarah Wilson by Admin User.',
            time: 'Jan 15, 2024',
            bgColor: 'bg-gray-50'
          }
        ].map((activity, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
            <div className={`p-2 rounded-full ${activity.bgColor}`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">{activity.action}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Files & Links Tab Content - matches wireframe
  const FilesLinksTab = () => (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="h-5 w-5" />
          <span className="font-medium">Files (3)</span>
          <span className="text-sm text-gray-500">Attachments and documents</span>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white hover:bg-gray-50">
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-700 mb-2">Drag and drop files here or browse</h4>
        <p className="text-sm text-gray-500 mb-4">Maximum file size: 5MB per file</p>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Choose Files
        </Button>
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {[
          { 
            id: 1, 
            name: 'database-schema.sql',
            size: '45KB',
            uploadedBy: 'John Smith',
            uploadedAt: '1/20/2024 at 02:30 PM'
          },
          { 
            id: 2, 
            name: 'migration-plan.pdf',
            size: '2.5MB',
            uploadedBy: 'Sarah Wilson',
            uploadedAt: '1/18/2024 at 11:45 AM'
          }
        ].map((file) => (
          <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <FileIcon className="h-8 w-8 text-gray-400" />
              <div>
                <h4 className="font-medium text-sm">{file.name}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Size: {file.size}</span>
                  <span>•</span>
                  <span>Uploaded by: {file.uploadedBy}</span>
                  <span>•</span>
                  <span>{file.uploadedAt}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Linked Items Tab Content - matches wireframe
  const LinkedItemsTab = () => (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          <span className="font-medium">Linked Items (3)</span>
          <span className="text-sm text-gray-500">Connected tasks, documents, and resources</span>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tasks">Tasks</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
              <SelectItem value="forms">Forms</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 min-w-[140px]">
                <Plus className="h-4 w-4 mr-2" />
                Link Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link New Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Item Type</Label>
                  <Select defaultValue="task">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="form">Form</SelectItem>
                      <SelectItem value="external">External Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Search & Select</Label>
                  <Input placeholder="Search for items to link..." />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowLinkModal(false)}>Cancel</Button>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">Link Item</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Linked Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            id: 1,
            title: 'Update Documentation',
            type: 'task',
            status: 'pending',
            relationship: 'Connected'
          },
          {
            id: 2,
            title: 'Migration Plan',
            type: 'document', 
            status: 'completed',
            relationship: 'Connected'
          },
          {
            id: 3,
            title: 'Migration Checklist',
            type: 'form',
            status: 'in-progress', 
            relationship: 'Connected'
          }
        ].map((item) => (
          <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {item.type === 'task' && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                {item.type === 'document' && <FileText className="h-4 w-4 text-green-500" />}
                {item.type === 'form' && <FileIcon className="h-4 w-4 text-purple-500" />}
                <span className="font-medium text-sm">{item.title}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-gray-400" />
                <Trash2 className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Type: {item.type}</span>
              <Badge variant="outline" className="text-xs">{item.relationship}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Navigation - matches wireframe exactly */}
        <TabsList className="grid w-full grid-cols-6 bg-gray-50 border-b">
          <TabsTrigger value="core-info" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <FileIcon className="h-4 w-4" />
            Core Info
          </TabsTrigger>
          <TabsTrigger value="subtasks" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <CheckCircle2 className="h-4 w-4" />
            Subtasks
            <Badge variant="secondary" className="ml-1 text-xs">5</Badge>
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <MessageCircle className="h-4 w-4" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <Activity className="h-4 w-4" />
            Activity Feed
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <Paperclip className="h-4 w-4" />
            Files & Links
          </TabsTrigger>
          <TabsTrigger value="linked" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
            <Link2 className="h-4 w-4" />
            Linked Items
            <Badge variant="secondary" className="ml-1 text-xs">3</Badge>
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
          <FilesLinksTab />
        </TabsContent>

        <TabsContent value="linked" className="m-0">
          <LinkedItemsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTaskTabs;