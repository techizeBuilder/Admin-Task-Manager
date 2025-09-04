import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import CoreInfoPanel from './CoreInfoPanel';
import SubtasksPanel from './SubtasksPanel';
import SubtaskModal from './SubtaskModal';
import StatusDropdown from './StatusDropdown';
import PriorityDropdown from './PriorityDropdown';
import AssigneeSelector from './AssigneeSelector';
import { EditableTitle, EditableTextArea } from './EditableComponents';
import './TaskView.css';

export default function TaskDetail({ taskId, onClose }) {
  const [activeTab, setActiveTab] = useState("core-info");
  const [, setLocation] = useLocation();
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showCreateSubtaskDrawer, setShowCreateSubtaskDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
    { id: "core-info", label: "Core Info", icon: "📋", hasIcon: true },
    {
      id: "subtasks",
      label: "Subtasks",
      icon: "📝",
      count: task.subtasks?.length || 0,
      hasIcon: true
    },
    { id: "comments", label: "Comments", icon: "💬", count: 3, hasIcon: true },
    { id: "activity", label: "Activity Feed", icon: "📊", hasIcon: true },
    { id: "files", label: "Files & Links", icon: "📎", hasIcon: true },
    {
      id: "linked",
      label: "Linked Items",
      icon: "🔗",
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
    if (window.confirm("Mark this task as completed?")) {
      setTask({ ...task, status: "DONE" });
    }
  };

  const handleExportTask = () => {
    console.log("Exporting task:", task);
  };

  return (
    <div className="task-view-container">
      {/* Top Action Bar */}
      <div className="task-action-bar">
        <div className="action-buttons-left">
          <button className="action-btn primary" onClick={() => setShowCreateSubtaskDrawer(true)}>
            <span className="btn-icon">📝</span>
            Add Sub-task
          </button>
          <button className="action-btn secondary" onClick={() => setShowDeleteModal(true)}>
            <span className="btn-icon">🗑️</span>
            Delete
          </button>
          <button className="action-btn secondary" onClick={() => setShowReassignModal(true)}>
            <span className="btn-icon">👤</span>
            Reassign
          </button>
          <button className="action-btn secondary" onClick={() => setShowSnoozeModal(true)}>
            <span className="btn-icon">⏰</span>
            Snooze
          </button>
          <button className="action-btn warning" onClick={() => setShowRiskModal(true)}>
            <span className="btn-icon">⚠️</span>
            Mark Risk
          </button>
          <button className="action-btn success" onClick={handleMarkDone}>
            <span className="btn-icon">✅</span>
            Mark Done
          </button>
          <button className="action-btn secondary" onClick={handleExportTask}>
            <span className="btn-icon">📊</span>
            Export
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="task-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">📋</span>
            <span className="tab-label">{tab.label}</span>
            {tab.count !== undefined && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="task-content">
        {activeTab === "core-info" && (
          <div className="core-info-view">
            {/* Task Overview Section */}
            <div className="task-overview-card">
              <div className="overview-header">
                <div className="overview-icon">📋</div>
                <div className="overview-content">
                  <h2 className="overview-title">Task Overview</h2>
                  <p className="overview-subtitle">Complete task information and details</p>
                </div>
                <button className="view-more-btn">View More</button>
              </div>
              
              {/* Active Reminders */}
              <div className="active-reminders">
                <div className="reminder-icon">⏰</div>
                <div className="reminder-content">
                  <strong>Active Reminders:</strong>
                  <div className="reminder-text">Due in 3 days - 2024-01-25</div>
                </div>
              </div>
              
              {/* Description */}
              <div className="description-section">
                <h3 className="section-title">Description</h3>
                <div className="description-content">
                  <EditableTextArea
                    value={task.description}
                    onSave={(newDescription) => setTask({...task, description: newDescription})}
                    canEdit={permissions.canEdit}
                    placeholder="Add task description..."
                  />
                </div>
              </div>
            </div>
            
            {/* Core Info Panel */}
            <CoreInfoPanel 
              task={task}
              onTaskUpdate={setTask}
              permissions={permissions}
            />
          </div>
        )}
        
        {activeTab === "subtasks" && (
          <SubtasksPanel
            subtasks={task.subtasks}
            onCreateSubtask={handleCreateSubtask}
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
                    <button className="comment-action">👍 2</button>
                    <button className="comment-action">💬 1</button>
                    <button className="comment-action">Reply</button>
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
                    <button className="comment-action">Reply</button>
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
                    <strong>B</strong> <em>I</em> <u>U</u> 📎
                  </div>
                  <div className="comment-actions">
                    <button className="comment-action">😊</button>
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
                <button className="send-btn">➤</button>
                <button className="attach-btn">📎</button>
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
                <span className="files-icon">📁</span>
                <div>
                  <h3>Files (3)</h3>
                  <p>Attachments and documents</p>
                </div>
              </div>
              <button className="add-file-btn">+ Add File</button>
            </div>
            
            <div className="file-upload-area">
              <div className="upload-icon">☁️</div>
              <div className="upload-text">
                <strong>Drag and drop files here or browse</strong>
                <p>Maximum file size: 5MB per file</p>
              </div>
              <button className="choose-files-btn">📁 Choose Files</button>
            </div>
            
            <div className="files-list">
              <div className="file-item">
                <div className="file-icon">📄</div>
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
                <div className="file-icon">📊</div>
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
                <span className="linked-icon">🔗</span>
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
                <button className="link-item-btn">+ Link Item</button>
              </div>
            </div>
            
            <div className="linked-items">
              <div className="linked-item">
                <div className="item-icon">📋</div>
                <div className="item-details">
                  <strong>Update Documentation</strong>
                  <div className="item-meta">
                    <span className="item-type">task</span>
                    <span className="item-status pending">pending</span>
                  </div>
                </div>
                <div className="item-type-label">Type: task</div>
                <div className="connection-status">🔗 Connected</div>
              </div>
              
              <div className="linked-item">
                <div className="item-icon">📄</div>
                <div className="item-details">
                  <strong>Migration Plan</strong>
                  <div className="item-meta">
                    <span className="item-type">document</span>
                    <span className="item-status completed">completed</span>
                  </div>
                </div>
                <div className="item-type-label">Type: document</div>
                <div className="connection-status">🔗 Connected</div>
              </div>
              
              <div className="linked-item">
                <div className="item-icon">📝</div>
                <div className="item-details">
                  <strong>Migration Checklist</strong>
                  <div className="item-meta">
                    <span className="item-type">form</span>
                    <span className="item-status in-progress">in-progress</span>
                  </div>
                </div>
                <div className="item-type-label">Type: form</div>
                <div className="connection-status">🔗 Connected</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SubtaskModal
        isOpen={showCreateSubtaskDrawer}
        onClose={() => setShowCreateSubtaskDrawer(false)}
        onSubmit={handleCreateSubtask}
        parentTask={task}
      />
    </div>
  );
}