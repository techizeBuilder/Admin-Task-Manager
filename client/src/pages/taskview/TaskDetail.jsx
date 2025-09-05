import React, { useState } from 'react';
import { useSubtask } from '../../contexts/SubtaskContext';
import { useRoute, useLocation } from 'wouter';
import { 
  ClipboardList, 
  CheckSquare, 
  MessageCircle, 
  Activity, 
  Paperclip, 
  Link, 
  Plus, 
  Trash2, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  X,
  Calendar,
  User,
  Tag,
  AlertCircle as AlertIcon,
  ThumbsUp,
  Reply,
  Send,
  Smile,
  FileText,
  Upload,
  Cloud,
  Filter,
  CheckCircle2,
  Edit,
  UserPlus,
  Zap,
  Bell
} from 'lucide-react';
import CoreInfoPanel from './CoreInfoPanel';
import SubtasksPanel from './SubtasksPanel';
import SubtaskForm from '../../components/forms/SubtaskForm';
import '../../components/forms/FormsStyles.css';
import { 
  DeleteTaskModal, 
  ReassignTaskModal, 
  SnoozeTaskModal, 
  MarkRiskModal, 
  MarkDoneModal 
} from '../../components/modals/TaskModals';
import '../../components/modals/ModalStyles.css';
import StatusDropdown from './StatusDropdown';
import PriorityDropdown from './PriorityDropdown';
import AssigneeSelector from './AssigneeSelector';
import { EditableTitle, EditableTextArea } from './EditableComponents';
import './TaskView.css';
import './DetailedView.css';

export default function TaskDetail({ taskId, onClose }) {
  const { openSubtaskDrawer } = useSubtask();
  const [activeTab, setActiveTab] = useState("core-info");
  const [, setLocation] = useLocation();
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showCreateSubtaskDrawer, setShowCreateSubtaskDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [moreInfo, setMoreInfo] = useState(false);
  const [currentUser] = useState({
    id: 1,
    name: "Current User",
    role: "assignee",
  });

  // Mock task data - matches wireframe requirements
  const [task, setTask] = useState({
    id: taskId || 1,
    title: "Migrate the existing database from MySQL to PostgreSQL",
    description: "Migrate the existing database from MySQL to PostgreSQL while ensuring data integrity and minimal downtime.",
    status: "in-progress",
    priority: "high",
    assignee: "John Smith",
    assigneeId: 1,
    dueDate: "2024-01-25",
    startDate: "2024-01-15",
    timeEstimate: "40 hours",
    tags: ["database", "migration", "backend"],
    createdBy: "Sarah Wilson",
    creatorId: 2,
    createdAt: "2024-01-15 09:00",
    updatedAt: "2024-01-20 14:30",
    snoozedUntil: null,
    snoozeNote: null,
    taskType: "Regular Task",
    isRisky: false,
    riskNote: "",
    parentTaskId: null,
    visibility: "Private",
    colorCode: "#007bff",
    subtasks: [
      {
        id: 101,
        title: "Backup existing database",
        status: "completed",
        assignee: "John Smith",
        dueDate: "2024-01-20",
        priority: "high"
      },
      {
        id: 102,
        title: "Set up PostgreSQL instance",
        status: "completed",
        assignee: "Mike Johnson",
        dueDate: "2024-01-22",
        priority: "medium"
      },
      {
        id: 103,
        title: "Create migration scripts",
        status: "in-progress",
        assignee: "Sarah Wilson",
        dueDate: "2024-01-24",
        priority: "high"
      },
      {
        id: 104,
        title: "Test data integrity",
        status: "pending",
        assignee: "Emily Davis",
        dueDate: "2024-01-26",
        priority: "medium"
      },
      {
        id: 105,
        title: "Update application configs",
        status: "pending",
        assignee: "John Smith",
        dueDate: "2024-01-27",
        priority: "low"
      },
    ],
    linkedItems: [
      { id: 1, type: "task", title: "Update Documentation", status: "pending" },
      { id: 2, type: "document", title: "Migration Plan", status: "completed" },
      { id: 3, type: "form", title: "Migration Checklist", status: "in-progress" },
    ],
    collaborators: ["Mike Johnson", "Emily Davis"],
    forms: [
      {
        id: 1,
        title: "Migration Checklist",
        type: "checklist",
        status: "in-progress",
      },
    ],
  });

  const tabs = [
    { id: "core-info", label: "Core Info", icon: ClipboardList, hasIcon: true },
    {
      id: "subtasks",
      label: "Subtasks",
      icon: CheckSquare,
      count: task.subtasks?.length || 0,
      hasIcon: true
    },
    { id: "comments", label: "Comments", icon: MessageCircle, count: 3, hasIcon: true },
    { id: "activity", label: "Activity Feed", icon: Activity, hasIcon: true },
    { id: "files", label: "Files & Links", icon: Paperclip, hasIcon: true },
    {
      id: "linked",
      label: "Linked Items",
      icon: Link,
      count: task.linkedItems?.length || 0,
      hasIcon: true
    }
  ];

  const now = new Date();
  const snoozedUntil = task.snoozedUntil ? new Date(task.snoozedUntil) : null;
  const isSnoozed = snoozedUntil && snoozedUntil > now;

  // Enhanced permission checks
  const permissions = {
    canView: true,
    canEdit: true,
    canReassign: true,
    canDelete: true,
    canComment: true,
    canAddFiles: true,
    canChangeStatus: true,
  };

  const handleStatusChange = (newStatus) => {
    setTask({ ...task, status: newStatus });
  };

  const handlePriorityChange = (newPriority) => {
    setTask({ ...task, priority: newPriority });
  };

  const handleCreateSubtask = (subtaskData) => {
    const newSubtask = {
      id: Date.now(),
      ...subtaskData,
      parentTaskId: task.id,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    setTask({ ...task, subtasks: updatedSubtasks });
    setShowCreateSubtaskDrawer(false);
  };

  const handleMarkDone = () => {
    setShowDoneModal(true);
  };

  const handleDeleteTask = () => {
    console.log('Deleting task');
  };

  const handleReassignTask = (assigneeId) => {
    console.log('Reassigning task to:', assigneeId);
  };

  const handleSnoozeTask = (snoozeData) => {
    console.log('Snoozing task:', snoozeData);
  };

  const handleMarkRisk = (riskNote) => {
    console.log('Marking as risk:', riskNote);
  };

  const handleExportTask = () => {
    console.log("Exporting task:", task);
  };

  return (
    <div className="task-view-container">
      {/* Top Action Bar */}
      <div className="task-action-bar">
        <div className="action-buttons-left">
          <button className="action-btn primary" onClick={() => openSubtaskDrawer(task)}>
            <Plus className="btn-icon" size={16} />
            Add Sub-task
          </button>
          <button className="action-btn secondary" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="btn-icon" size={16} />
            Delete
          </button>
          <button className="action-btn secondary" onClick={() => setShowReassignModal(true)}>
            <Users className="btn-icon" size={16} />
            Reassign
          </button>
          <button className="action-btn secondary" onClick={() => setShowSnoozeModal(true)}>
            <Clock className="btn-icon" size={16} />
            Snooze
          </button>
          <button className="action-btn warning" onClick={() => setShowRiskModal(true)}>
            <AlertTriangle className="btn-icon" size={16} />
            Mark Risk
          </button>
          <button className="action-btn success" onClick={handleMarkDone}>
            <CheckCircle className="btn-icon" size={16} />
            Mark Done
          </button>
          <button className="action-btn secondary" onClick={handleExportTask}>
            <Download className="btn-icon" size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="task-tabs">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent className="tab-icon" size={16} />
              <span className="tab-label">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="tab-count">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="task-content">
        {activeTab === "core-info" && (
          <div className="core-info-view">
            {/* Task Overview Section */}
            <div className="task-overview-card">
              <div className="overview-header">
                <div className="overview-icon">
                  <ClipboardList size={24} />
                </div>
                <div className="overview-content">
                  <h2 className="overview-title">Task Overview</h2>
                  <p className="overview-subtitle">Complete task information and details</p>
                </div>
                <button className="view-more-btn" onClick={() => setMoreInfo(!moreInfo)}>
                  View More
                </button>
              </div>
              
              {/* Active Reminders */}
              <div className="active-reminders">
                <div className="reminder-icon">
                  <AlertIcon size={20} />
                </div>
                <div className="reminder-content">
                  <strong>Active Reminders:</strong>
                  <div className="reminder-text">Due in 3 days - 2024-01-25</div>
                </div>
              </div>
              
              {/* Description */}
              <div className="description-section">
                <h3 className="section-title">Description</h3>
                <div className="description-content">
                  <p className="description-text">
                    {task.description}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Detailed View Panel */}
            {moreInfo && (
              <div className="detailed-view-panel">
                <div className="detailed-view-header">
                  <h3>Detailed View</h3>
                  <button className="close-btn" onClick={() => setMoreInfo(false)}>
                    <X size={20} />
                  </button>
                </div>
                
                <div className="details-grid">
                  {/* Task Details */}
                  <div className="detail-card">
                    <div className="detail-header">
                      <ClipboardList size={16} className="detail-icon" />
                      <h4>Task Details</h4>
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-label">Type:</span>
                        <div className="detail-value">
                    
                          <span>Regular Task</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Color Code:</span>
                        <span className="detail-value">#007bff</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Visibility:</span>
                        <span className="detail-value">Private</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div className="detail-card">
                    <div className="detail-header">
                      <Calendar size={16} className="detail-icon" />
                      <h4>Timeline</h4>
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-label">Start Date:</span>
                        <span className="detail-value">2024-01-15</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Due Date:</span>
                        <span className="detail-value">2024-01-25</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Time Estimate:</span>
                        <span className="detail-value">40 hours</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Creation Info */}
                  <div className="detail-card">
                    <div className="detail-header">
                      <User size={16} className="detail-icon" />
                      <h4>Creation Info</h4>
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-label">Created By:</span>
                        <span className="detail-value">Sarah Wilson</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Created:</span>
                        <span className="detail-value">15/01/2024</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Last Updated:</span>
                        <span className="detail-value">20/01/2024</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="assignment-grid">
                  {/* Assignment & Status */}
                  <div className="detail-card">
                    <div className="detail-header">
                      <Users size={16} className="detail-icon" />
                      <h4>Assignment & Status</h4>
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-label">Assignee:</span>
                        <span className="detail-value">John Smith</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Current Status:</span>
                        <span className="detail-value status-badge in-progress">In Progress</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Priority:</span>
                        <span className="detail-value priority-badge high">High</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Collaborators & Tags */}
                  <div className="detail-card">
                    <div className="detail-header">
                      <Tag size={16} className="detail-icon" />
                      <h4>Collaborators & Tags</h4>
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-label">Collaborators:</span>
                        <div className="collaborators-list">
                          <span className="collaborator-name">Mike Johnson</span>
                          <span className="collaborator-name">Emily Davis</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Tags:</span>
                        <div className="tags-list">
                          <span className="tag">#database</span>
                          <span className="tag">#migration</span>
                          <span className="tag">#backend</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Relationships & Hierarchy */}
                  <div className="detail-card">
                    <div className="detail-header">
                      <Link size={16} className="detail-icon" />
                      <h4>Relationships & Hierarchy</h4>
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-label">Parent Task:</span>
                        <span className="detail-value">None</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Sub-tasks Count:</span>
                        <span className="detail-value">5</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Linked Items:</span>
                        <span className="detail-value">3</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Attached Forms */}
                <div className="attached-forms-section">
                  <div className="forms-header">
                    <ClipboardList size={16} className="forms-icon" />
                    <h4>Attached Forms (1)</h4>
                  </div>
                  <div className="form-item">
                    <div className="form-details">
                      <h5>Migration Checklist</h5>
                      <span className="form-type">checklist</span>
                    </div>
                    <span className="form-status in-progress">in progress</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === "subtasks" && (
          <SubtasksPanel
            subtasks={task.subtasks}
            parentTask={task}
            currentUser={currentUser}
          />
        )}
        
        {activeTab === "comments" && (
          <div className="comments-view">
            <div className="comments-header">
              <h3>Comments (3)</h3>
            </div>
            <div className="comments-list">
              <div className="comment-item">
                <div className="comment-avatar">JS</div>
                <div className="comment-content">
                  <div className="comment-header">
                    <strong>John Smith</strong>
                    <span className="comment-time">391 days ago</span>
                  </div>
                  <p>I've started working on the <strong>database schema migration</strong>. The initial analysis shows we need to handle about 2.5M records.</p>
                  <div className="comment-actions">
                    <button className="comment-action">
                      <ThumbsUp size={14} /> 2
                    </button>
                    <button className="comment-action">
                      <MessageCircle size={14} /> 1
                    </button>
                    <button className="comment-action">
                      <Reply size={14} /> Reply
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="comment-item">
                <div className="comment-avatar">SW</div>
                <div className="comment-content">
                  <div className="comment-header">
                    <strong>Sarah Wilson</strong>
                    <span className="comment-time">391 days ago</span>
                  </div>
                  <p><strong>@John Smith</strong> - Great! Please make sure to backup the data before starting the migration process. Also, have you considered the downtime window?</p>
                  <div className="comment-actions">
                    <button className="comment-action">
                      <Reply size={14} /> Reply
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="comment-item">
                <div className="comment-avatar">MJ</div>
                <div className="comment-content">
                  <div className="comment-header">
                    <strong>Mike Johnson</strong>
                    <span className="comment-time">391 days ago</span>
                  </div>
                  <div className="comment-formatting">
                    <strong>B</strong> <em>I</em> <u>U</u> <Paperclip size={14} />
                  </div>
                  <div className="comment-actions">
                    <button className="comment-action">
                      <Smile size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="comment-input">
              <textarea 
                placeholder="Leave a comment... Use @ to mention team members"
                className="comment-textarea"
              />
              <div className="comment-input-actions">
                <button className="send-btn">
                  <Send size={16} />
                </button>
                <button className="attach-btn">
                  <Paperclip size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "activity" && (
          <div className="activity-view">
            <div className="activity-header">
              <h3>Activity Feed</h3>
              <p>Track all task activities and changes</p>
              <select className="activity-filter">
                <option>All Activities</option>
                <option>Status Changes</option>
                <option>Comments</option>
                <option>Assignments</option>
              </select>
            </div>
            
            <div className="activity-list">
              <div className="activity-date">MONDAY, JANUARY 15, 2024</div>
              
              <div className="activity-item">
                <div className="activity-avatar green">✓</div>
                <div className="activity-content">
                  <strong>John Smith created this task.</strong>
                  <div className="activity-time">Jan 15, 2024 ⏰</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-avatar purple">📝</div>
                <div className="activity-content">
                  <strong>Due Date changed from May 1, 2024 to May 7, 2024.</strong>
                  <div className="activity-time">Jan 15, 2024 ⏰</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-avatar red">📝</div>
                <div className="activity-content">
                  <strong>Title changed from "Database Setup" to "Database Migration".</strong>
                  <div className="activity-time">Jan 15, 2024 ⏰</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-avatar yellow">📋</div>
                <div className="activity-content">
                  <strong>Subtask 'Design Mockup' added by Jane Smith.</strong>
                  <div className="activity-time">Jan 15, 2024 ⏰</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-avatar blue">📊</div>
                <div className="activity-content">
                  <strong>Status updated to 'In Progress'.</strong>
                  <div className="activity-time">Jan 15, 2024 ⏰</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-avatar purple">⚡</div>
                <div className="activity-content">
                  <strong>Priority changed to 'High'.</strong>
                  <div className="activity-time">Jan 15, 2024 ⏰</div>
                </div>
              </div>
              
              <div className="activity-item">
                <div className="activity-avatar gray">🔔</div>
                <div className="activity-content">
                  <strong>Task assigned to Sarah Wilson by Admin User.</strong>
                  <div className="activity-time">Jan 15, 2024 ⏰</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "files" && (
          <div className="files-view">
            <div className="files-header">
              <div className="files-title">
                <Paperclip className="files-icon" size={24} />
                <div>
                  <h3>Files (3)</h3>
                  <p>Attachments and documents</p>
                </div>
              </div>
              <button className="add-file-btn">
                <Plus size={16} /> Add File
              </button>
            </div>
            
            <div className="file-upload-area">
              <div className="upload-icon">
                <Cloud size={48} />
              </div>
              <div className="upload-text">
                <strong>Drag and drop files here or browse</strong>
                <p>Maximum file size: 5MB per file</p>
              </div>
              <button className="choose-files-btn">
                <Upload size={16} /> Choose Files
              </button>
            </div>
            
            <div className="files-list">
              <div className="file-item">
                <div className="file-icon">
                  <FileText size={24} />
                </div>
                <div className="file-details">
                  <strong>database-schema.sql</strong>
                  <div className="file-meta">
                    <span>Size: 45KB</span>
                    <span>Uploaded by: John Smith</span>
                    <span>1/20/2024 at 02:30 PM</span>
                  </div>
                </div>
              </div>
              
              <div className="file-item">
                <div className="file-icon">
                  <FileText size={24} />
                </div>
                <div className="file-details">
                  <strong>migration-plan.xlsx</strong>
                  <div className="file-meta">
                    <span>Size: 2.1MB</span>
                    <span>Uploaded by: Sarah Wilson</span>
                    <span>1/18/2024 at 10:15 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "linked" && (
          <div className="linked-view">
            <div className="linked-header">
              <div className="linked-title">
                <Link className="linked-icon" size={24} />
                <div>
                  <h3>Linked Items (3)</h3>
                  <p>Connected tasks, documents, and resources</p>
                </div>
              </div>
              <div className="linked-controls">
                <select className="type-filter">
                  <option>All Types</option>
                  <option>Tasks</option>
                  <option>Documents</option>
                  <option>Forms</option>
                </select>
                <button className="link-item-btn">
                  <Plus size={16} /> Link Item
                </button>
              </div>
            </div>
            
            <div className="linked-items">
              <div className="linked-item">
                <div className="item-icon">
                  <CheckSquare size={24} />
                </div>
                <div className="item-details">
                  <strong>Update Documentation</strong>
                  <div className="item-meta">
                    <span className="item-type">task</span>
                    <span className="item-status pending">pending</span>
                  </div>
                </div>
                <div className="item-type-label">Type: task</div>
                <div className="connection-status">
                  <Link size={14} /> Connected
                </div>
              </div>
              
              <div className="linked-item">
                <div className="item-icon">
                  <FileText size={24} />
                </div>
                <div className="item-details">
                  <strong>Migration Plan</strong>
                  <div className="item-meta">
                    <span className="item-type">document</span>
                    <span className="item-status completed">completed</span>
                  </div>
                </div>
                <div className="item-type-label">Type: document</div>
                <div className="connection-status">
                  <Link size={14} /> Connected
                </div>
              </div>
              
              <div className="linked-item">
                <div className="item-icon">
                  <ClipboardList size={24} />
                </div>
                <div className="item-details">
                  <strong>Migration Checklist</strong>
                  <div className="item-meta">
                    <span className="item-type">form</span>
                    <span className="item-status in-progress">in-progress</span>
                  </div>
                </div>
                <div className="item-type-label">Type: form</div>
                <div className="connection-status">
                  <Link size={14} /> Connected
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SubtaskForm
        isOpen={showCreateSubtaskDrawer}
        onClose={() => setShowCreateSubtaskDrawer(false)}
        onSubmit={handleCreateSubtask}
        parentTask={task}
        mode="create"
      />
      
      <DeleteTaskModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteTask}
        task={task}
      />
      
      <ReassignTaskModal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        onConfirm={handleReassignTask}
        task={task}
      />
      
      <SnoozeTaskModal
        isOpen={showSnoozeModal}
        onClose={() => setShowSnoozeModal(false)}
        onConfirm={handleSnoozeTask}
        task={task}
      />
      
      <MarkRiskModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        onConfirm={handleMarkRisk}
        task={task}
      />
      
      <MarkDoneModal
        isOpen={showDoneModal}
        onClose={() => setShowDoneModal(false)}
        onConfirm={() => {
          setTask({ ...task, status: "DONE" });
          console.log('Task marked as done');
        }}
        task={task}
      />
    </div>
  );
}