import React, { useState, useEffect } from "react";
import { useRoute } from "wouter";
import useTasksStore from "../stores/tasksStore";
import { 
  Edit3, 
  Users, 
  Plus, 
  Trash2, 
  Clock, 
  Download, 
  ArrowLeft,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  FileText,
  Paperclip,
  Activity,
  UserPlus,
  Bell,
  Shield,
  Share,
  MoreHorizontal,
  Archive
} from "lucide-react";
import TaskStatusDropdown from "./newComponents/TaskStatusDropdown";
import { getTaskPriorityColor } from "./TaskTypeUtils";

export default function TaskDetailView() {
  const [match, params] = useRoute("/tasks/:taskId");
  const [task, setTask] = useState(null);
  const [activeTab, setActiveTab] = useState("subtasks");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("member");
  const [companyStatuses, setCompanyStatuses] = useState([]);
  const { tasks, updateTask } = useTasksStore();

  // Load task data from store
  useEffect(() => {
    if (params?.taskId) {
      setLoading(true);
      const taskId = parseInt(params.taskId);
      const foundTask = tasks.find(t => t.id === taskId);
      
      if (foundTask) {
        setTask(foundTask);
        setCompanyStatuses([
          { value: 'TODO', label: 'To Do', color: '#64748B' },
          { value: 'INPROGRESS', label: 'In Progress', color: '#F59E0B' },
          { value: 'BLOCKED', label: 'Blocked', color: '#EF4444' },
          { value: 'INREVIEW', label: 'In Review', color: '#8B5CF6' },
          { value: 'DONE', label: 'Done', color: '#10B981' }
        ]);
      } else {
        console.error('Task not found');
      }
      
      setLoading(false);
    }
  }, [params?.taskId, tasks]);

  const getUserPermissions = () => {
    if (!task) return { canEdit: false, canDelete: false, canReassign: false };
    
    const isCreator = task.createdBy?.email === localStorage.getItem("userEmail");
    const isAssignee = task.assignedTo?.email === localStorage.getItem("userEmail");
    const isAdmin = userRole === "admin" || userRole === "org_admin";
    
    return {
      canEdit: isCreator || isAdmin,
      canDelete: isCreator || isAdmin,
      canReassign: isCreator || isAdmin,
      canChangeStatus: isCreator || isAssignee || isAdmin,
      canAddComments: true,
      canAddFiles: true
    };
  };

  const permissions = getUserPermissions();

  const handleStatusChange = (newStatus) => {
    if (task) {
      const updatedTask = { ...task, status: newStatus };
      updateTask(task.id, updatedTask);
      setTask(updatedTask);
    }
  };

  const tabs = [
    { id: "subtasks", label: "Subtasks", icon: CheckCircle2 },
    { id: "forms", label: "Forms", icon: FileText },
    { id: "attachments", label: "Attachments", icon: Paperclip },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "comments", label: "Comments", icon: MessageCircle }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h1>
          <p className="text-gray-600">The task you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="task-detail-view">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left section - Back button and title */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900" data-testid="text-task-title">
                  {task.title}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  {/* Priority */}
                  <span 
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTaskPriorityColor(task.priority)}`}
                    data-testid="text-priority"
                  >
                    {task.priority}
                  </span>
                  
                  {/* Status */}
                  <TaskStatusDropdown
                    task={task}
                    currentStatus={task.status}
                    statuses={companyStatuses}
                    onStatusChange={handleStatusChange}
                    canEdit={permissions.canChangeStatus}
                    canMarkCompleted={permissions.canChangeStatus}
                  />
                  
                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      {task.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          data-testid={`tag-${tag}`}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                      {task.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{task.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right section - User info */}
            <div className="flex items-center space-x-4">
              {/* User avatar and name */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
                  {task.assignee ? task.assignee.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium text-gray-900">{task.assignee || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              {/* Left Actions */}
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Sub-task
                </button>
                <button className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
                <button className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Reassign
                </button>
                <button className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors">
                  <Bell className="h-4 w-4 mr-1" />
                  Snooze
                </button>
                <button className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 transition-colors">
                  <Shield className="h-4 w-4 mr-1" />
                  Mark Risk
                </button>
                <button className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Mark Done
                </button>
              </div>

              {/* Right Actions */}
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors">
                  <Share className="h-4 w-4 mr-1" />
                  Export
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Task Overview Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Task Overview</h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View More</button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Complete task information and details</p>
                
                {/* Active Reminders */}
                {task.dueDate && (
                  <div className="mb-6">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-orange-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">Active Reminders:</span>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                      <p className="text-sm text-orange-800">
                        Due in 3 days - {task.dueDate}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-gray-700">
                      {task.description || 'Migrate the existing database from MySQL to PostgreSQL while ensuring data integrity and minimal downtime.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed View Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                        data-testid={`tab-${tab.id}`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                        {tab.id === 'subtasks' && task.subtasks && (
                          <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                            {task.subtasks.length}
                          </span>
                        )}
                        {(tab.id === 'comments' || tab.id === 'attachments') && (
                          <span className="bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                            3
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
              
              <div className="p-6">
                {/* Tab Content */}
                {activeTab === 'subtasks' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Sub-tasks ({task.subtasks ? task.subtasks.length : 0})</h3>
                      <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Sub-task
                      </button>
                    </div>
                    
                    {/* Subtask list */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span className="text-sm">Setup OAuth providers</span>
                        </div>
                        <span className="text-xs text-gray-500">Completed</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-yellow-500" />
                          <span className="text-sm">Database backup procedures</span>
                        </div>
                        <span className="text-xs text-gray-500">In Progress</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'comments' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Comments (3)</h3>
                    {/* Comments content */}
                    <div className="space-y-4">
                      <div className="flex space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          JS
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">John Smith</span>
                              <span className="text-xs text-gray-500">2 hours ago</span>
                            </div>
                            <p className="text-sm text-gray-700">Let me know when you're ready for the staging environment setup.</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Comment input */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex space-x-3">
                          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                            AC
                          </div>
                          <div className="flex-1">
                            <textarea 
                              placeholder="Leave a comment..." 
                              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={3}
                            />
                            <div className="flex justify-end mt-2 space-x-2">
                              <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                              <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">Comment</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'attachments' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Files (3)</h3>
                      <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-1" />
                        Add File
                      </button>
                    </div>
                    
                    {/* File upload area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
                      <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Drag and drop files here or browse</p>
                      <p className="text-xs text-gray-500">Maximum file size: 25MB per file</p>
                      <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">Choose Files</button>
                    </div>
                    
                    {/* File list */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">database-schema.sql</p>
                            <p className="text-xs text-gray-500">Uploaded by John Smith • 2 hours ago</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'activity' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Feed</h3>
                    <div className="flow-root">
                      <ul className="-mb-8">
                        <li>
                          <div className="relative pb-8">
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                            <div className="relative flex space-x-3">
                              <div>
                                <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">John Smith marked this task <span className="font-medium text-gray-900">In Progress</span></p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <span>2h ago</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                        {/* More activity items */}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Task Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-sm text-gray-900 mt-1">{task.status}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <p className="text-sm text-gray-900 mt-1">{task.priority}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p className="text-sm text-gray-900 mt-1">{task.dueDate || 'Not set'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Assignee</label>
                  <p className="text-sm text-gray-900 mt-1">{task.assignee || 'Unassigned'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-900 mt-1">{task.createdAt || 'Unknown'}</p>
                </div>
              </div>
            </div>
            
            {/* Attachments & Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments & Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Created Status</span>
                  <span className="text-xs text-gray-500">Pending</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">Priority</span>
                  <span className="text-xs text-orange-600">High</span>
                </div>
              </div>
            </div>
            
            {/* Collaborations & Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaborations & Tags</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Collaborators</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">J</div>
                    <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">S</div>
                    <button className="h-6 w-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags && task.tags.map((tag, index) => (
                      <span key={index} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Relationships & Hierarchy */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Relationships & Hierarchy</h3>
              
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-gray-500">Sub-tasks Count:</span>
                  <span className="ml-2 text-gray-900">{task.subtasks ? task.subtasks.length : 0}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Parent Task:</span>
                  <span className="ml-2 text-blue-600 hover:text-blue-700 cursor-pointer">Database Migration</span>
                </div>
              </div>
            </div>
            
            {/* Linked Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Linked Items (3)</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm">Link Item</button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">Update Documentation</span>
                  </div>
                  <span className="text-xs text-green-600">Completed</span>
                </div>
                <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">Migration Checklist</span>
                  </div>
                  <span className="text-xs text-blue-600">In Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}