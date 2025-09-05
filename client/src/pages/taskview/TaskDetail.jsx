import React, { useState, useEffect } from 'react';
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
import { TaskComments } from '../../components/tasks/TaskComments';
import TaskAttachments from '../newComponents/TaskAttachments';
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
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  // Control body scroll when drawer opens
  useEffect(() => {
    if (onClose) { // Only when drawer is open (has onClose prop)
      document.body.classList.add('drawer-open');
      return () => {
        document.body.classList.remove('drawer-open');
      };
    }
  }, [onClose]);
  
  const [currentUser] = useState({
    id: 1,
    firstName: "Current",
    lastName: "User", 
    name: "Current User",
    email: "current@company.com",
    role: "assignee",
  });

  // Mock users for mentions
  const [users] = useState([
    { id: 1, firstName: "John", lastName: "Smith", email: "john@company.com" },
    { id: 2, firstName: "Sarah", lastName: "Wilson", email: "sarah@company.com" },
    { id: 3, firstName: "Mike", lastName: "Johnson", email: "mike@company.com" },
    { id: 4, firstName: "Emily", lastName: "Davis", email: "emily@company.com" },
  ]);

  // Mock comments with rich text content
  const [comments, setComments] = useState([
    {
      id: 1,
      content: "I've started working on the <strong>database schema migration</strong>. The initial analysis shows we need to handle about 2.5M records.",
      author: { id: 1, firstName: "John", lastName: "Smith", email: "john@company.com" },
      createdAt: new Date(Date.now() - 391 * 24 * 60 * 60 * 1000).toISOString(),
      mentions: [],
      replies: [
        {
          id: 2,
          content: "<strong>@John Smith</strong> - Great! Please make sure to backup the data before starting the migration process. Also, have you considered the downtime window?",
          author: { id: 2, firstName: "Sarah", lastName: "Wilson", email: "sarah@company.com" },
          createdAt: new Date(Date.now() - 391 * 24 * 60 * 60 * 1000).toISOString(),
          mentions: [{ id: 1, firstName: "John", lastName: "Smith", email: "john@company.com" }],
        }
      ]
    },
    {
      id: 3,
      content: "Working on the UI components for the migration status dashboard. <em>Will have updates soon!</em>",
      author: { id: 3, firstName: "Mike", lastName: "Johnson", email: "mike@company.com" },
      createdAt: new Date(Date.now() - 390 * 24 * 60 * 60 * 1000).toISOString(),
      mentions: [],
      replies: []
    }
  ]);

  // Comment handlers
  const handleAddComment = async (commentData) => {
    const newComment = {
      id: Date.now(),
      content: commentData.content,
      author: currentUser,
      createdAt: new Date().toISOString(),
      mentions: commentData.mentions || [],
      replies: []
    };
    setComments(prev => [...prev, newComment]);
  };

  const handleEditComment = async (commentId, newContent) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, content: newContent, updatedAt: new Date().toISOString() }
        : comment
    ));
  };

  const handleDeleteComment = async (commentId) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

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
          <TaskComments
            taskId={taskId}
            comments={comments}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            currentUser={currentUser}
            users={users}
          />
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
          <TaskAttachments taskId={taskId} />
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
                <button 
                  className="btn btn-primary flex align-middle"
                  onClick={() => setShowLinkModal(true)}
                >
                  <Plus size={16} className='mx-2 ' />
                  <h2>
                    Link Item
                  </h2>
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
                <div className="connection-status flex ">
                  <Link size={20} /> Connected
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
                <div className="connection-status flex">
             <Link size={20} /> Connected
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
                <div className="connection-status flex">
                  <Link size={20} /> Connected
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
      
      {/* Link Item Modal */}
      {showLinkModal && (
        <div className="modal-overlay">
          <div className="modal-container max-w-2xl">
            <div className="modal-header" style={{ background: '#3b82f6' }}>
              <div className="modal-title-section">
                <div className="modal-icon">
                  <Link size={20} />
                </div>
                <div>
                  <h3>Link New Item</h3>
                  <p>Connect tasks, documents, and resources</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowLinkModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CheckSquare size={14} className="inline mr-1" />
                    Item Type
                  </label>
                  <select className="form-select w-full">
                    <option value="task">Task</option>
                    <option value="document">Document</option>
                    <option value="form">Form</option>
                    <option value="external">External Link</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText size={14} className="inline mr-1" />
                    Search & Select
                  </label>
                  <input
                    type="text"
                    placeholder="Search for items to link..."
                    className="form-input w-full"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowLinkModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      console.log('Link item clicked');
                      setShowLinkModal(false);
                    }}
                  >
                    Link Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}