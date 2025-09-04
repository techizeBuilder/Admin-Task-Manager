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
  Activity
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

            {/* Right section - Assignee and Quick Actions */}
            <div className="flex items-center space-x-4">
              {/* Assignee */}
              {task.assignedTo && (
                <div className="flex items-center space-x-2" data-testid="assignee-info">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{task.assignedTo.name || task.assignedTo.email}</span>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex items-center space-x-2">
                {permissions.canEdit && (
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    data-testid="button-edit"
                    title="Edit Task"
                  >
                    <Edit3 className="h-4 w-4 text-gray-600" />
                  </button>
                )}
                
                {permissions.canReassign && (
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    data-testid="button-reassign"
                    title="Reassign Task"
                  >
                    <Users className="h-4 w-4 text-gray-600" />
                  </button>
                )}
                
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  data-testid="button-create-subtask"
                  title="Create Subtask"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
                
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  data-testid="button-snooze"
                  title="Snooze Task"
                >
                  <Clock className="h-4 w-4 text-gray-600" />
                </button>
                
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  data-testid="button-export"
                  title="Export Task"
                >
                  <Download className="h-4 w-4 text-gray-600" />
                </button>
                
                {permissions.canDelete && (
                  <button 
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    data-testid="button-delete"
                    title="Delete Task"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Core Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
              <div 
                className="prose max-w-none text-gray-700"
                data-testid="text-description"
                dangerouslySetInnerHTML={{ __html: task.description || "No description provided." }}
              />
            </div>

            {/* Tabbed Interface */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Tab Headers */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" data-testid="tab-navigation">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                        data-testid={`tab-${tab.id}`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "subtasks" && (
                  <SubtasksTab task={task} permissions={permissions} />
                )}
                {activeTab === "forms" && (
                  <FormsTab task={task} permissions={permissions} />
                )}
                {activeTab === "attachments" && (
                  <AttachmentsTab task={task} permissions={permissions} />
                )}
                {activeTab === "activity" && (
                  <ActivityTab task={task} />
                )}
                {activeTab === "comments" && (
                  <CommentsTab task={task} permissions={permissions} />
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Task Details */}
          <div className="space-y-6">
            {/* Task Metadata */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Task Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <div className="flex items-center mt-1" data-testid="text-start-date">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {task.startDate ? new Date(task.startDate).toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <div className="flex items-center mt-1" data-testid="text-due-date">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Estimated Time</label>
                  <div className="flex items-center mt-1" data-testid="text-estimated-time">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {task.estimatedHours ? `${task.estimatedHours} hours` : "Not estimated"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Created By</label>
                  <div className="flex items-center mt-1" data-testid="text-created-by">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {task.createdBy?.name || task.createdBy?.email || "Unknown"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Created On</label>
                  <div className="flex items-center mt-1" data-testid="text-created-date">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Tasks */}
            {task.dependencies && task.dependencies.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dependencies</h3>
                <div className="space-y-2">
                  {task.dependencies.map((dep, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      data-testid={`dependency-${index}`}
                    >
                      <span className="text-sm text-gray-900">{dep.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTaskPriorityColor(dep.priority)}`}>
                        {dep.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components
function SubtasksTab({ task, permissions }) {
  return (
    <div data-testid="subtasks-tab">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">Subtasks</h4>
        {permissions.canEdit && (
          <button 
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            data-testid="button-add-subtask"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subtask
          </button>
        )}
      </div>
      
      {task.subtasks && task.subtasks.length > 0 ? (
        <div className="space-y-3">
          {task.subtasks.map((subtask, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              data-testid={`subtask-${index}`}
            >
              <div className="flex items-center space-x-3">
                <CheckCircle2 className={`h-4 w-4 ${subtask.status === 'DONE' ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-900">{subtask.title}</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getTaskPriorityColor(subtask.priority)}`}>
                {subtask.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No subtasks</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new subtask.</p>
        </div>
      )}
    </div>
  );
}

function FormsTab({ task, permissions }) {
  return (
    <div data-testid="forms-tab">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">Custom Forms</h4>
        {permissions.canEdit && (
          <button 
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            data-testid="button-attach-form"
          >
            <FileText className="h-4 w-4 mr-2" />
            Attach Form
          </button>
        )}
      </div>
      
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No forms attached</h3>
        <p className="mt-1 text-sm text-gray-500">Attach custom forms to collect structured data.</p>
      </div>
    </div>
  );
}

function AttachmentsTab({ task, permissions }) {
  return (
    <div data-testid="attachments-tab">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">Attachments</h4>
        {permissions.canAddFiles && (
          <button 
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            data-testid="button-upload-file"
          >
            <Paperclip className="h-4 w-4 mr-2" />
            Upload File
          </button>
        )}
      </div>
      
      <div className="text-center py-8">
        <Paperclip className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No attachments</h3>
        <p className="mt-1 text-sm text-gray-500">Upload files to share with your team.</p>
      </div>
    </div>
  );
}

function ActivityTab({ task }) {
  return (
    <div data-testid="activity-tab">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Activity Feed</h4>
      
      <div className="flow-root">
        <ul className="-mb-8">
          <li>
            <div className="relative pb-8">
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                    <User className="h-4 w-4 text-white" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">Task created</span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {new Date(task.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

function CommentsTab({ task, permissions }) {
  return (
    <div data-testid="comments-tab">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-900">Comments</h4>
      </div>
      
      {permissions.canAddComments && (
        <div className="mb-6">
          <textarea
            placeholder="Add a comment..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            data-testid="input-comment"
          />
          <div className="mt-2 flex justify-end">
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              data-testid="button-post-comment"
            >
              Post Comment
            </button>
          </div>
        </div>
      )}
      
      <div className="text-center py-8">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No comments yet</h3>
        <p className="mt-1 text-sm text-gray-500">Start the conversation by adding a comment.</p>
      </div>
    </div>
  );
}