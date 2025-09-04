import React, { useState } from 'react';

export default function TaskDetail({ taskId, onClose }) {
  const [activeTab, setActiveTab] = useState("details");
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

  // Mock task data - in real app this would come from props or API
  const [task, setTask] = useState({
    id: taskId,
    title: "Database Migration",
    description:
      "Migrate the existing database from MySQL to PostgreSQL while ensuring data integrity and minimal downtime.",
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
    taskType: "normal", // normal, milestone, approval
    isRisky: false,
    riskNote: "",
    parentTaskId: null,
    subtasks: [
      {
        id: 101,
        title: "Backup existing database",
        status: "completed",
        assignee: "John Smith",
        dueDate: "2024-01-20",
      },
      {
        id: 102,
        title: "Set up PostgreSQL instance",
        status: "completed",
        assignee: "Mike Johnson",
        dueDate: "2024-01-22",
      },
      {
        id: 103,
        title: "Create migration scripts",
        status: "in-progress",
        assignee: "Sarah Wilson",
        dueDate: "2024-01-24",
      },
      {
        id: 104,
        title: "Test data integrity",
        status: "pending",
        assignee: "Emily Davis",
        dueDate: "2024-01-26",
      },
      {
        id: 105,
        title: "Update application configs",
        status: "pending",
        assignee: "John Smith",
        dueDate: "2024-01-27",
      },
    ],
    linkedItems: [
      { id: 1, type: "task", title: "Update Documentation", status: "pending" },
      { id: 2, type: "document", title: "Migration Plan", status: "completed" },
      {
        id: 3,
        type: "form",
        title: "Migration Checklist",
        status: "in-progress",
      },
    ],
    milestones: [
      {
        id: 1,
        title: "Database Backup Complete",
        status: "completed",
        date: "2024-01-20",
      },
      {
        id: 2,
        title: "Migration Scripts Ready",
        status: "in-progress",
        date: "2024-01-24",
      },
      {
        id: 3,
        title: "Full Migration Complete",
        status: "pending",
        date: "2024-01-28",
      },
    ],
    isApprovalTask: false,
    approvalStatus: null,
    reminders: [
      { id: 1, type: "due_date", message: "Due in 3 days", date: "2024-01-25" },
    ],
    forms: [
      {
        id: 1,
        title: "Migration Checklist",
        type: "checklist",
        status: "in-progress",
      },
    ],
    collaborators: ["Mike Johnson", "Emily Davis"],
    colorCode: "#007bff", // Example color code
  });

  const tabs = [
    { id: "details", label: "Core Info", icon: "📋" },
    {
      id: "subtasks",
      label: "Subtasks",
      icon: "📝",
      count: task.subtasks?.length || 0,
    },
    { id: "comments", label: "Comments", icon: "💬" },
    { id: "activity", label: "Activity Feed", icon: "📊" },
    { id: "attachments", label: "Files & Links", icon: "📎" },
    {
      id: "linked",
      label: "Linked Items",
      icon: "🔗",
      count: task.linkedItems?.length || 0,
    },
    // { id: "forms", label: "Forms", icon: "📄", count: task.forms?.length || 0 },
  ];

  const now = new Date();
  const snoozedUntil = task.snoozedUntil ? new Date(task.snoozedUntil) : null;
  const isSnoozed = snoozedUntil && snoozedUntil > now;

  // Enhanced permission checks based on specification
  const permissions = {
    canView: true, // All roles can view
    canEdit:
      task.creatorId === currentUser.id ||
      task.assigneeId === currentUser.id ||
      currentUser.role === "admin" ||
      true, // Allow editing for demo purposes
    canReassign:
      task.creatorId === currentUser.id || currentUser.role === "admin" || true, // Allow reassigning for demo purposes
    canDelete: (() => {
      // Company Admin can delete any task
      if (currentUser.role === "admin") return true;

      // Individual/Team users can delete:
      // 1. Tasks they created
      // 2. Tasks assigned to them
      return (
        task.creatorId === currentUser.id ||
        task.assigneeId === currentUser.id ||
        true // Allow deleting for demo purposes
      );
    })(),
    canComment: true, // All roles can comment
    canAddFiles: true, // All roles can add files
    canChangeStatus:
      task.assigneeId === currentUser.id ||
      task.creatorId === currentUser.id ||
      currentUser.role === "admin" ||
      true, // Allow status changes for demo purposes
  };

  const handleStatusChange = (newStatus) => {
    setTask({ ...task, status: newStatus });
  };

  const handlePriorityChange = (newPriority) => {
    setTask({ ...task, priority: newPriority });
  };

  const handleSnoozeSubmit = (snoozeData) => {
    setTask({
      ...task,
      snoozedUntil: snoozeData.snoozeUntil,
      snoozeNote: snoozeData.note,
    });
    setShowSnoozeModal(false);
  };

  const handleUnsnooze = () => {
    setTask({
      ...task,
      snoozedUntil: null,
      snoozeNote: null,
    });
  };

  const handleReassign = (newAssignee) => {
    setTask({
      ...task,
      assignee: newAssignee.name,
      assigneeId: newAssignee.id,
    });
    setShowReassignModal(false);
  };

  const handleEditTask = () => {
    setShowEditModal(true);
  };

  const handleSaveEditedTask = (updatedTask) => {
    // Update the local task state
    setTask(updatedTask);
    setShowEditModal(false);

    // Show success notification
    console.log("✅ Task updated successfully:", updatedTask.title);

    // Create and show toast notification
    const showToast = (message, type = "success") => {
      const toast = document.createElement("div");
      toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white transition-all duration-300 ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`;
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);
    };

    showToast(`Task "${updatedTask.title}" updated successfully`, "success");
  };

  const handleMarkRisk = (riskData) => {
    setTask({
      ...task,
      isRisky: true,
      riskNote: riskData.note,
    });
    setShowRiskModal(false);
  };

  const handleMarkDone = () => {
    if (window.confirm("Mark this task as completed?")) {
      setTask({ ...task, status: "DONE" });
    }
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

    // Simulate notification to assignee
    console.log(
      `Notification sent to ${subtaskData.assignee}: New sub-task "${subtaskData.title}" assigned to you`,
    );
  };

  const handleDeleteTask = (deleteOptions) => {
    const taskType = task.parentTaskId ? "sub-task" : "task";

    // Log the deletion with comprehensive details
    console.log(
      `${taskType.charAt(0).toUpperCase() + taskType.slice(1)} "${
        task.title
      }" deleted by ${currentUser.name}`,
      {
        taskId: task.id,
        deletedBy: currentUser.name,
        deletedAt: new Date().toISOString(),
        options: deleteOptions,
        hadSubtasks: task.subtasks?.length || 0,
        hadAttachments: task.attachments?.length || 0,
        hadLinkedItems: task.linkedItems?.length || 0,
        wasCreatedBy: task.createdBy,
      },
    );

    // Show success toast notification
    const toastMessage = `${
      taskType.charAt(0).toUpperCase() + taskType.slice(1)
    } "${task.title}" deleted successfully`;

    // Create and show toast (you can customize this based on your toast implementation)
    const showToast = (message, type = "success") => {
      // Simple toast implementation - you can replace with your preferred toast library
      const toast = document.createElement("div");
      toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white transition-all duration-300 ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`;
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);
    };

    showToast(toastMessage, "success");

    // Close the modal and task detail
    setShowDeleteModal(false);
    onClose();

    // In a real app, this would update the parent component's task list
    // and send the deletion request to the backend
  };

  const handleExportTask = () => {
    console.log("Exporting task:", task);
  };

  const getTaskTypeIcon = () => {
    switch (task.taskType) {
      case "milestone":
        return "🎯";
      case "approval":
        return "✅";
      default:
        return "📋";
    }
  };

  const getTaskTypeLabel = () => {
    switch (task.taskType) {
      case "milestone":
        return "Milestone";
      case "approval":
        return "Approval";
      default:
        return "Normal";
    }
  };

  return (
    <div className="task-detail-fullpage ">
      {/* Enhanced Header Bar */}
      <div className="task-header-bar">
        <div className="header-main-content">
          <div className="task-type-indicator">
            <span className="task-type-icon">{getTaskTypeIcon()}</span>
            <span className="task-type-label">{getTaskTypeLabel()}</span>
          </div>

          {/* Note: The following components would need to be imported or created:
              EditableTitle, StatusDropdown, PriorityDropdown, AssigneeSelector */}
          
          <div className="task-title">
            <h1>{task.title}</h1>
          </div>

          <div className="header-controls">
            <div className="status-dropdown-detail">
              Status: {task.status}
            </div>

            <div className="priority-display">
              Priority: {task.priority}
            </div>

            <div className="assignee-display">
              Assignee: {task.assignee}
            </div>
          </div>

          <div className="header-badges">
            {task.tags.map((tag) => (
              <span key={tag} className="tag-badge">
                #{tag}
              </span>
            ))}

            {task.isRecurring && (
              <span
                className="status-indicator recurring"
                title="This is a recurring task instance"
              >
                🔁 Recurring
              </span>
            )}

            {isSnoozed && (
              <span
                className="status-indicator snoozed"
                title={`Snoozed until ${snoozedUntil.toLocaleString()}`}
              >
                😴 Snoozed
              </span>
            )}

            {task.isRisky && (
              <span
                className="status-indicator risky"
                title={`At Risk: ${task.riskNote}`}
              >
                ⚠️ At Risk
              </span>
            )}

            {task.taskType === "milestone" && (
              <span className="status-indicator milestone">🎯 Milestone</span>
            )}
          </div>
        </div>
      </div>

      {/* Add the rest of the component content here */}
      <div className="task-content">
        <p>Task detail content would go here...</p>
        <p>Description: {task.description}</p>
        
        {/* Tab navigation */}
        <div className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="tab-content">
          {activeTab === "details" && (
            <div>
              <h3>Core Information</h3>
              <p>Description: {task.description}</p>
              <p>Due Date: {task.dueDate}</p>
              <p>Created By: {task.createdBy}</p>
            </div>
          )}
          
          {activeTab === "subtasks" && (
            <div>
              <h3>Subtasks ({task.subtasks?.length || 0})</h3>
              {task.subtasks?.map((subtask) => (
                <div key={subtask.id} className="subtask-item">
                  <strong>{subtask.title}</strong> - {subtask.status}
                  <br />
                  Assignee: {subtask.assignee} | Due: {subtask.dueDate}
                </div>
              ))}
            </div>
          )}
          
          {activeTab === "comments" && (
            <div>
              <h3>Comments</h3>
              <p>Comments would be displayed here...</p>
            </div>
          )}
          
          {activeTab === "activity" && (
            <div>
              <h3>Activity Feed</h3>
              <p>Activity history would be displayed here...</p>
            </div>
          )}
          
          {activeTab === "attachments" && (
            <div>
              <h3>Files & Links</h3>
              <p>File attachments would be displayed here...</p>
            </div>
          )}
          
          {activeTab === "linked" && (
            <div>
              <h3>Linked Items ({task.linkedItems?.length || 0})</h3>
              {task.linkedItems?.map((item) => (
                <div key={item.id} className="linked-item">
                  <strong>{item.title}</strong> ({item.type}) - {item.status}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="action-buttons">
          <button onClick={() => setShowCreateSubtaskDrawer(true)}>
            Add Subtask
          </button>
          <button onClick={() => setShowSnoozeModal(true)}>
            Snooze
          </button>
          <button onClick={() => setShowReassignModal(true)}>
            Reassign
          </button>
          <button onClick={() => setShowRiskModal(true)}>
            Mark Risk
          </button>
          <button onClick={handleMarkDone}>
            Mark Done
          </button>
          <button onClick={() => setShowDeleteModal(true)}>
            Delete
          </button>
          <button onClick={handleExportTask}>
            Export
          </button>
          <button onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}