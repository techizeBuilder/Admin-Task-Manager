import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import useTasksStore from "../../stores/tasksStore";
import TaskEditModal from "./TaskEditModal";
import TaskDeleteConfirmationModal from "./TaskDeleteConfirmationModal";
import TasksCalendarView from "./TasksCalendarView";
import SubtaskCreator from "./SubtaskCreator";
import StatusConfirmationModal from "./StatusConfirmationModal";
import TaskStatusDropdown from "./TaskStatusDropdown";
import TaskActionsDropdown from "./TaskActionsDropdown";
import ApprovalTaskDetailModal from "./ApprovalTaskDetailModal";
import CalendarDatePicker from "./CalendarDatePicker";
import SearchableSelect from "../SearchableSelect";
import Toast from "./Toast";
import MilestoneCreator from "../MilestoneCreator";
import CreateTask from "./CreateTask";
import ApprovalTaskCreator from "./ApprovalTaskCreator";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table" 
import { getTaskTypeInfo, getTaskPriorityColor } from "../TaskTypeUtils";
import {
  CheckCircle,
  ClipboardList,
  Delete,
  RotateCcw,
  Target,
} from "lucide-react";
export default function AllTasks({
  onCreateTask,
  onNavigateToTask,
  initialDueDateFilter,
}) {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [taskTypeFilter, setTaskTypeFilter] = useState("all");
  const [dueDateFilter, setDueDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showSnooze, setShowSnooze] = useState(false);
  const [showCreateTaskDrawer, setShowCreateTaskDrawer] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentUser] = useState({
    id: 1,
    name: "Current User",
    role: "admin",
  });
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);
  const [showDeleteSubtaskConfirmation, setShowDeleteSubtaskConfirmation] =
    useState(null);
  const [showTaskTypeDropdown, setShowTaskTypeDropdown] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState("regular");
  const [showApprovalTaskModal, setShowApprovalTaskModal] = useState(false);
  const [showSubtaskCreator, setShowSubtaskCreator] = useState(null);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDateForTask, setSelectedDateForTask] = useState(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [selectedApprovalTask, setSelectedApprovalTask] = useState(null);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    isVisible: false,
  });
  // Zustand store
  const {
    tasks,
    selectedTasks,
    snoozedTasks,
    riskyTasks,
    expandedTasks,
    addTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    setSelectedTasks,
    toggleTaskSelection,
    bulkUpdateStatus,
    bulkDeleteTasks,
    toggleTaskExpansion,
    toggleSnoozeTask,
    toggleRiskyTask,
    updateTaskStatus,
    getFilteredTasks,
    getTaskStatus,
    addCustomReminder,
    snoozeTask,
  } = useTasksStore();

  // Get tasks from Zustand store
  const { tasks: storeTasks } = useTasksStore();
 // Lock body scroll while any modal/drawer is open
  useEffect(() => {
    const anyOpen =
      showCreateTaskDrawer ||
      showApprovalTaskModal ||
      showMilestoneModal ||
      showCalendarModal ||
      showEditModal ||
      !!showStatusConfirmation ||
      !!showDeleteConfirmation ||
      !!showDeleteSubtaskConfirmation ||
      !!showSubtaskCreator ||
      !!selectedApprovalTask;

    const prev = document.body.style.overflow;
    document.body.style.overflow = anyOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [
    showCreateTaskDrawer,
    showApprovalTaskModal,
    showMilestoneModal,
    showCalendarModal,
    showEditModal,
    showStatusConfirmation,
    showDeleteConfirmation,
    showDeleteSubtaskConfirmation,
    showSubtaskCreator,
    selectedApprovalTask,
  ]);

  // Handle initial due date filter from props
  useEffect(() => {
    if (initialDueDateFilter && initialDueDateFilter !== "all") {
      setDueDateFilter(initialDueDateFilter);
    }
  }, [initialDueDateFilter]);

  // Company-defined statuses with comprehensive management
  const [companyStatuses] = useState([
    {
      id: 1,
      code: "OPEN",
      label: "Open",
      description: "Task is created but not yet started",
      color: "#6c757d",
      isFinal: false,
      isDefault: true,
      active: true,
      order: 1,
      systemMapping: "SYS_OPEN",
      allowedTransitions: ["INPROGRESS", "ONHOLD", "CANCELLED"],
      isSystem: false,
      createdAt: "2024-01-01T00:00:00Z",
      tooltip: "New task ready to be started",
    },
    {
      id: 2,
      code: "INPROGRESS",
      label: "In Progress",
      description: "Task is being actively worked on",
      color: "#3498db",
      isFinal: false,
      isDefault: false,
      active: true,
      order: 2,
      systemMapping: "SYS_INPROGRESS",
      allowedTransitions: ["ONHOLD", "DONE", "CANCELLED"],
      isSystem: false,
      createdAt: "2024-01-01T00:00:00Z",
      tooltip: "Work is currently in progress on this task",
    },
    {
      id: 3,
      code: "ONHOLD",
      label: "On Hold",
      description: "Task is temporarily paused",
      color: "#f39c12",
      isFinal: false,
      isDefault: false,
      active: true,
      order: 3,
      systemMapping: "SYS_ONHOLD",
      allowedTransitions: ["INPROGRESS", "CANCELLED"],
      isSystem: false,
      createdAt: "2024-01-01T00:00:00Z",
      tooltip: "Task is paused temporarily",
    },
    {
      id: 4,
      code: "DONE",
      label: "Completed",
      description: "Task has been completed successfully",
      color: "#28a745",
      isFinal: true,
      isDefault: false,
      active: true,
      order: 4,
      systemMapping: "SYS_DONE",
      allowedTransitions: [],
      isSystem: false,
      createdAt: "2024-01-01T00:00:00Z",
      tooltip: "Task has been successfully completed",
    },
    {
      id: 5,
      code: "CANCELLED",
      label: "Cancelled",
      description: "Task was terminated intentionally",
      color: "#dc3545",
      isFinal: true,
      isDefault: false,
      active: true,
      order: 5,
      systemMapping: "SYS_CANCELLED",
      allowedTransitions: [],
      isSystem: false,
      createdAt: "2024-01-01T00:00:00Z",
      tooltip: "Task was cancelled and will not be completed",
    },
  ]);

  // Status change history for activity tracking
  const [statusHistory, setStatusHistory] = useState([]);

  // Legacy status mapping for retroactive handling
  const [statusMappings] = useState([]);

  // Task type detection function
  const getTaskType = (task) => {
    if (task.isApprovalTask) return "Approval Task";
    if (task.isRecurring || task.recurringFromTaskId) return "Recurring Task";
    if (task.type === "milestone") return "Milestone";
    return "Simple Task";
  };

  const getStatusLabel = (statusCode) => {
    const status = companyStatuses.find((s) => s.code === statusCode);
    return status ? status.label : statusCode;
  };

  const getStatusColor = (statusCode) => {
    const status = companyStatuses.find((s) => s.code === statusCode);
    return status ? status.color : "#6c757d";
  };

  const getStatusBadge = (statusCode) => {
    const status = companyStatuses.find((s) => s.code === statusCode);
    const baseClass =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

    if (!status) return `${baseClass} bg-gray-100 text-gray-800`;

    const hex = status.color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    return {
      className: `${baseClass} text-white`,
      style: { backgroundColor: status.color },
    };
  };

  // Permission check function
  const canEditTaskStatus = (task) => {
    return (
      task.assigneeId === currentUser.id ||
      task.collaborators?.includes(currentUser.id) ||
      currentUser.role === "admin" ||
      task.creatorId === currentUser.id
    );
  };

  // Check if task can be marked as completed
  const canMarkAsCompleted = (task) => {
    if (!task.subtasks || task.subtasks.length === 0) return true;

    const incompleteSubtasks = task.subtasks.filter(
      (subtask) =>
        subtask.status !== "completed" && subtask.status !== "cancelled",
    );

    return incompleteSubtasks.length === 0;
  };

  // Get valid status transitions based on business rules
  const getValidStatusTransitions = (currentStatusCode, task = null) => {
    const currentStatus = companyStatuses.find(
      (s) => s.code === currentStatusCode && s.active,
    );
    if (!currentStatus) return [];

    let validTransitions = currentStatus.allowedTransitions.filter(
      (transitionCode) => {
        const targetStatus = companyStatuses.find(
          (s) => s.code === transitionCode && s.active,
        );
        return targetStatus !== null;
      },
    );

    // Apply sub-task completion logic for parent tasks
    if (task && task.subtasks && task.subtasks.length > 0) {
      const hasIncompleteSubtasks = task.subtasks.some(
        (subtask) =>
          subtask.status !== "DONE" && subtask.status !== "CANCELLED",
      );

      // Block completion if sub-tasks are incomplete
      if (hasIncompleteSubtasks) {
        validTransitions = validTransitions.filter(
          (transition) => transition !== "DONE",
        );
      }
    }

    return validTransitions;
  };

  // Log status change for activity tracking and audit trail
  const logStatusChange = (
    taskId,
    oldStatusCode,
    newStatusCode,
    userId,
    reason = null,
  ) => {
    const historyEntry = {
      id: Date.now(),
      taskId,
      oldStatusCode,
      newStatusCode,
      changedBy: userId,
      changedAt: new Date().toISOString(),
      reason,
      oldStatusLabel: getStatusLabel(oldStatusCode),
      newStatusLabel: getStatusLabel(newStatusCode),
    };

    setStatusHistory((prev) => [...prev, historyEntry]);
    console.log("Status Change Logged:", historyEntry);
  };

  // Apply legacy status mapping for retroactive compatibility
  const applyStatusMapping = (statusCode) => {
    const mapping = statusMappings.find((m) => m.oldStatusCode === statusCode);
    return mapping ? mapping.newStatusCode : statusCode;
  };

  // Handle status change with comprehensive validation
  const handleStatusChange = (
    taskId,
    newStatusCode,
    requiresConfirmation = false,
    reason = null,
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    const newStatus = companyStatuses.find(
      (s) => s.code === newStatusCode && s.active,
    );

    if (!task || !newStatus) {
      console.error("Invalid task or status code provided");
      return;
    }

    // Check edit permissions
    if (!canEditTaskStatus(task)) {
      alert("You do not have permission to edit this task status.");
      return;
    }

    // Validate status transition
    const validTransitions = getValidStatusTransitions(task.status, task);
    if (!validTransitions.includes(newStatusCode)) {
      const currentStatusObj = companyStatuses.find(
        (s) => s.code === task.status,
      );
      alert(
        `Invalid status transition from "${
          currentStatusObj?.label || task.status
        }" to "${newStatus.label}". Please follow the allowed workflow.`,
      );
      return;
    }

    // Check sub-task completion logic
    if (newStatusCode === "DONE" && !canMarkAsCompleted(task)) {
      const incompleteCount = task.subtasks.filter(
        (s) => s.status !== "completed" && s.status !== "cancelled",
      ).length;
      alert(
        `Cannot mark task as completed. There are ${incompleteCount} incomplete sub-tasks that must be completed or cancelled first.`,
      );
      return;
    }

    // Show confirmation for final statuses
    if (newStatus.isFinal && requiresConfirmation) {
      setShowStatusConfirmation({
        taskId,
        newStatusCode,
        taskTitle: task.title,
        statusLabel: newStatus.label,
        reason,
      });
      return;
    }

    // Execute status change
    executeStatusChange(taskId, newStatusCode, reason);
  };

  // Execute the actual status change
  const executeStatusChange = (taskId, newStatusCode, reason = null) => {
    const task = tasks.find((t) => t.id === taskId);
    const oldStatusCode = task.status;

    // Update task status using store
    updateTaskStatus(taskId, newStatusCode);

    // Log the status change for audit trail
    logStatusChange(
      taskId,
      oldStatusCode,
      newStatusCode,
      currentUser.id,
      reason,
    );

    // Show success notification
    const oldStatus = companyStatuses.find((s) => s.code === oldStatusCode);
    const newStatus = companyStatuses.find((s) => s.code === newStatusCode);
    console.log(
      `✅ Status updated: "${task.title}" changed from "${
        oldStatus?.label || oldStatusCode
      }" to "${newStatus.label}"`,
    );
  };

  // Permission check for task deletion
  const canDeleteTask = (task) => {
    return (
      task.creatorId === currentUser.id ||
      task.assigneeId === currentUser.id ||
      currentUser.role === "admin"
    );
  };

  // Handle task deletion with integrity checks
  const handleDeleteTask = (taskId, options = {}) => {
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      console.error("Task not found");
      return;
    }

    // Check permissions
    if (!canDeleteTask(task)) {
      alert("You do not have permission to delete this task.");
      return;
    }

    // Show confirmation modal with task details
    setShowDeleteConfirmation({
      task,
      options: {
        deleteSubtasks: false,
        deleteAttachments: false,
        deleteLinkedItems: false,
        ...options,
      },
    });
  };

  // Execute task deletion
  const executeTaskDeletion = (taskId, options) => {
    const task = tasks.find((t) => t.id === taskId);

    // Remove task from list using store
    deleteTask(taskId);

    // Handle subtasks deletion
    if (options.deleteSubtasks && task.subtasks && task.subtasks.length > 0) {
      console.log(
        `Deleted ${task.subtasks.length} subtasks for task: ${task.title}`,
      );
    }

    // Handle attachments/linked items
    if (
      options.deleteAttachments &&
      task.linkedItems &&
      task.linkedItems.length > 0
    ) {
      console.log(
        `Deleted ${task.linkedItems.length} linked items for task: ${task.title}`,
      );
    }

    // Log activity for audit trail
    logActivity("task_deleted", {
      taskId: task.id,
      taskTitle: task.title,
      deletedBy: currentUser.name,
      timestamp: new Date().toISOString(),
      options: options,
    });

    // Show success toast notification
    showToast(`Task "${task.title}" deleted successfully`, "success");

    // Close confirmation modal
    setShowDeleteConfirmation(null);
  };

  // Handle bulk task deletion
  const handleBulkDeleteTasks = () => {
    const selectedTaskObjects = tasks.filter((t) =>
      selectedTasks.includes(t.id),
    );
    const errors = [];

    selectedTaskObjects.forEach((task) => {
      if (!canDeleteTask(task)) {
        errors.push(`No permission to delete: ${task.title}`);
      }
    });

    if (errors.length > 0) {
      alert(`Cannot delete some tasks:\n${errors.join("\n")}`);
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedTasks.length} selected tasks? This action cannot be undone.`,
      )
    ) {
      bulkDeleteTasks(selectedTasks);
      setShowBulkActions(false);
      showToast(
        `${selectedTaskObjects.length} tasks deleted successfully`,
        "success",
      );
    }
  };

  const logActivity = (type, details) => {
    console.log(`🔄 Activity Log:`, details);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type, isVisible: true });
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = (newStatusCode) => {
    const selectedTaskObjects = tasks.filter((t) =>
      selectedTasks.includes(t.id),
    );
    const errors = [];

    selectedTaskObjects.forEach((task) => {
      if (!canEditTaskStatus(task)) {
        errors.push(`No permission to edit: ${task.title}`);
        return;
      }

      if (newStatusCode === "DONE" && !canMarkAsCompleted(task)) {
        const incompleteCount = task.subtasks.filter(
          (s) => s.status !== "completed" && s.status !== "cancelled",
        ).length;
        errors.push(
          `"${task.title}" has ${incompleteCount} incomplete sub-tasks`,
        );
        return;
      }
    });

    if (errors.length > 0) {
      alert(`Cannot update some tasks:\n${errors.join("\n")}`);
      return;
    }

    // Update all selected tasks using store
    bulkUpdateStatus(selectedTasks, newStatusCode);

    // Clear selection
    setShowBulkActions(false);

    const newStatus = companyStatuses.find((s) => s.code === newStatusCode);
    console.log(
      `Bulk updated ${selectedTasks.length} tasks to ${newStatus.label} by ${currentUser.name}`,
    );
  };

  // Handle task selection
  const handleTaskSelection = (taskId, isSelected) => {
    toggleTaskSelection(taskId);
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedTasks(tasks.map((t) => t.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      Low: "status-badge priority-low",
      Medium: "status-badge priority-medium",
      High: "status-badge priority-high",
      Urgent: "status-badge priority-urgent",
    };
    return priorityClasses[priority] || "status-badge priority-low";
  };

  const handleTaskTitleClick = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleTitleSave = (taskId) => {
    if (
      editingTitle.trim() &&
      editingTitle !== tasks.find((t) => t.id === taskId)?.title
    ) {
      updateTask(taskId, { title: editingTitle.trim() });
    }
    setEditingTaskId(null);
    setEditingTitle("");
  };

  const handleTitleCancel = () => {
    setEditingTaskId(null);
    setEditingTitle("");
  };

  const handleTitleKeyDown = (e, taskId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleSave(taskId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleTitleCancel();
    }
  };

  // Subtask title editing handlers
  const handleSubtaskTitleClick = (subtask, parentTaskId) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskTitle(subtask.title);
  };

  const handleSubtaskTitleSave = (subtaskId, parentTaskId) => {
    if (
      editingSubtaskTitle.trim() &&
      editingSubtaskTitle !==
        tasks
          .find((t) => t.id === parentTaskId)
          ?.subtasks?.find((s) => s.id === subtaskId)?.title
    ) {
      updateSubtask(parentTaskId, subtaskId, {
        title: editingSubtaskTitle.trim(),
      });
    }
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  };

  const handleSubtaskTitleCancel = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  };

  const handleSubtaskTitleKeyDown = (e, subtaskId, parentTaskId) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubtaskTitleSave(subtaskId, parentTaskId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleSubtaskTitleCancel();
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const handleSaveEditedTask = (updatedTask) => {
    updateTask(updatedTask.id, updatedTask);
    setShowEditModal(false);
    setEditingTask(null);
  };

  const handleViewTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);

    // If it's an approval task, show the approval modal
    if (task && task.isApprovalTask) {
      setSelectedApprovalTask(task);
      setShowApprovalTaskModal(true);
      return;
    }

    // Navigate to task detail page for regular tasks
    navigate(`/tasks/${taskId}`);
  };

  // Toggle task expansion
  const handleToggleTaskExpansion = (taskId) => {
    toggleTaskExpansion(taskId);
  };

  // Create new subtask
  const handleCreateSubtask = (parentTaskId, subtaskData) => {
    try {
      const subtaskToAdd = {
        title: subtaskData.title,
        assignee: subtaskData.assignee || currentUser.name,
        assigneeId: subtaskData.assigneeId || currentUser.id,
        status: subtaskData.status || "OPEN",
        priority: subtaskData.priority || "Medium",
        dueDate: subtaskData.dueDate,
        description: subtaskData.description || "",
      };

      addSubtask(parentTaskId, subtaskToAdd);
      setShowSubtaskCreator(null);

      // Auto-expand parent task to show new subtask
      toggleTaskExpansion(parentTaskId);

      showToast("Subtask created successfully", "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // Update subtask
  const handleUpdateSubtask = (parentTaskId, updatedSubtask) => {
    try {
      updateSubtask(parentTaskId, updatedSubtask.id, updatedSubtask);
      setSelectedSubtask(null);
      showToast("Subtask updated successfully", "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  // Delete subtask
  const handleDeleteSubtask = (parentTaskId, subtaskId) => {
    const parentTask = tasks.find((t) => t.id === parentTaskId);
    const subtask = parentTask?.subtasks.find((s) => s.id === subtaskId);

    deleteSubtask(parentTaskId, subtaskId);

    // Show success toast notification
    if (subtask) {
      showToast(`Sub-task "${subtask.title}" deleted successfully`, "success");
    }

    setSelectedSubtask(null);
    setShowDeleteSubtaskConfirmation(null);
  };

  // Handle subtask status change
  const handleSubtaskStatusChange = (parentTaskId, subtaskId, newStatus) => {
    updateSubtask(parentTaskId, subtaskId, { status: newStatus });
  };

  const handleAddSubtask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      openSubtaskDrawer(task);
    }
  };

  const handleToggleSubtasks = (taskId) => {
    handleToggleTaskExpansion(taskId);
  };

  // Handle calendar due date filter navigation
  const handleCalendarDueDateFilter = (filterType, specificDate = null) => {
    setShowCalendarView(false);

    if (filterType === "specific_date" && specificDate) {
      // Create a custom filter for the specific date
      setDueDateFilter("specific_date");
      setSearchTerm(""); // Clear search to show all tasks for the date

      // Store the specific date for filtering
      window.calendarSpecificDate = specificDate;
    } else {
      setDueDateFilter(filterType);
      window.calendarSpecificDate = null;
    }

    // Scroll to tasks table
    setTimeout(() => {
      const tasksTable = document.querySelector(".card.p-0.overflow-hidden");
      if (tasksTable) {
        tasksTable.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Handle calendar date selection
  const handleCalendarDateSelect = (selectedDate) => {
    setSelectedDateForTask(selectedDate);
    setShowCalendarModal(false);

    // Open appropriate task creation modal based on selected type
    if (selectedTaskType === "approval") {
      setShowApprovalTaskModal(true);
    } else if (selectedTaskType === "milestone") {
      setShowMilestoneModal(true);
    } else {
      setShowCreateTaskDrawer(true);
    }
  };

  // Handle task type selection from dropdown
  const handleTaskTypeSelect = (taskType) => {
    setSelectedTaskType(taskType);
    setShowTaskTypeDropdown(false);

    // Always show calendar first for all task types
    setShowCalendarModal(true);
  };

  const handleCreateApprovalTask = (approvalTaskData) => {
    // Add the approval task to the tasks list
    const newTask = {
      title: approvalTaskData.title,
      assignee: "Current User",
      assigneeId: 1,
      status: "OPEN",
      priority: approvalTaskData.priority || "Medium",
      dueDate: approvalTaskData.dueDate,

      isApprovalTask: true,
      approvers: approvalTaskData.approvers || [],
      approvalMode: approvalTaskData.approvalMode || "any",
      description: approvalTaskData.description || "",
      tags: approvalTaskData.tags || [],
      colorCode: approvalTaskData.colorCode || "#ffffff",
    };

    addTask(newTask);
    setShowApprovalTaskModal(false);
    setSelectedDateForTask(null);
    console.log("Approval task created:", newTask);
  };

  const handleCreateMilestone = (milestoneData) => {
    // Add the milestone to the tasks list
    const newTask = {
      title: milestoneData.title,
      assignee: milestoneData.assignee || "Current User",
      assigneeId: milestoneData.assigneeId || 1,
      status: milestoneData.milestoneType === "linked" ? "not_started" : "OPEN",
      priority: milestoneData.priority || "Medium",
      dueDate: milestoneData.dueDate || selectedDateForTask,

      collaborators: milestoneData.collaborators || [],
      type: "milestone",
      description: milestoneData.description || "",
      isMilestone: true,
      milestoneType: milestoneData.milestoneType || "standalone",
      linkedTasks: milestoneData.linkedTasks || [],
      visibility: milestoneData.visibility || "private",
      tags: milestoneData.tags || [],
      colorCode: milestoneData.colorCode || "#ffffff",
      // For linked milestones, create mock task dependencies
      tasks:
        milestoneData.milestoneType === "linked" &&
        milestoneData.linkedTasks.length > 0
          ? milestoneData.linkedTasks.map((taskId) => {
              const taskNames = {
                1: "UI Design Complete",
                2: "Backend API Development",
                3: "Testing Phase",
                4: "Deployment",
              };
              return {
                id: taskId,
                title: taskNames[taskId] || `Task ${taskId}`,
                completed: false,
              };
            })
          : [],
    };

    addTask(newTask);
    setShowMilestoneModal(false);
    setSelectedDateForTask(null);
    console.log("Milestone created:", newTask);
  };

  // Handle task snooze
  const handleSnoozeTask = (taskId) => {
    toggleSnoozeTask(taskId);
    if (snoozedTasks.has(taskId)) {
      showToast("Task un-snoozed successfully", "success");
    } else {
      showToast("Task snoozed successfully", "success");
    }
  };

  // Handle mark as risk
  const handleMarkAsRisk = (taskId) => {
    toggleRiskyTask(taskId);
    if (riskyTasks.has(taskId)) {
      showToast("Task risk status removed", "success");
    } else {
      showToast("Task marked as risky", "warning");
    }
  };

  // Apply filters to tasks
  const filteredTasks = storeTasks.filter((task) => {
    // Apply search filter
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "todo" && task.status === "OPEN") ||
      (statusFilter === "progress" && task.status === "INPROGRESS") ||
      (statusFilter === "review" && task.status === "ONHOLD") ||
      (statusFilter === "completed" && task.status === "DONE");

    // Apply priority filter
    const matchesPriority =
      priorityFilter === "all" ||
      task.priority.toLowerCase() === priorityFilter.toLowerCase();

    // Apply task type filter
    const taskType = getTaskType(task);
    const matchesTaskType =
      taskTypeFilter === "all" || taskType === taskTypeFilter;

    // Apply due date filter
    const matchesDueDate = (() => {
      if (dueDateFilter === "all") return true;
      if (!task.dueDate) return dueDateFilter === "no_due_date";

      const today = new Date();
      const dueDate = new Date(task.dueDate);
      const timeDiff = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      switch (dueDateFilter) {
        case "overdue":
          return daysDiff < 0;
        case "due_today":
          return daysDiff === 0;
        case "due_tomorrow":
          return daysDiff === 1;
        case "due_this_week":
          return daysDiff >= 0 && daysDiff <= 7;
        case "due_next_week":
          return daysDiff > 7 && daysDiff <= 14;
        case "due_this_month":
          return daysDiff >= 0 && daysDiff <= 30;
        case "no_due_date":
          return false;
        case "specific_date":
          return (
            window.calendarSpecificDate &&
            task.dueDate === window.calendarSpecificDate
          );
        default:
          return true;
      }
    })();

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesTaskType &&
      matchesDueDate
    );
  });

  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Helper function to get task visual indicators
  const getTaskIndicators = (task) => {
    const status = getTaskStatus(task.id);
    const indicators = [];

    if (status?.isOverdue) {
      indicators.push({
        icon: "🔴",
        text: "Overdue",
        className: "bg-red-100 text-red-800 border-red-200",
      });
    }

    if (status?.isSnoozed) {
      indicators.push({
        icon: "🔕",
        text: "Snoozed",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      });
    }

    if (status?.hasReminders) {
      indicators.push({
        icon: "⏰",
        text: "Has Reminders",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      });
    }

    return indicators;
  };

  // Function to get task color code
  const getTaskColorCode = (task) => {
    const taskInfo = getTaskTypeInfo(task.taskType);
    return task.colorCode || taskInfo.defaultColor || "#ffffff";
  };

  return (
    <div className="space-y-4 px-3 py-4 min-h-0 overflow-hidden">
     
{/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage and track all your tasks
          </p>
        </div>
        <div className="mt-3 lg:mt-0 flex flex-col sm:flex-row gap-2 flex-wrap">
          <button
            onClick={() => setShowSnooze(!showSnooze)}
            className={`btn ${showSnooze ? "btn-primary" : "btn-secondary"} whitespace-nowrap`}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {showSnooze ? "Hide" : "Show"} Snoozed Tasks
          </button>
          <button
            className={`btn ${
              showCalendarView ? "btn-primary" : "btn-secondary"
            } whitespace-nowrap`}
            onClick={() => setShowCalendarView(!showCalendarView)}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {showCalendarView ? "Hide Calendar" : "Calendar View"}
          </button>
          <div className="relative flex-shrink-0">
            <button
              className="btn btn-primary whitespace-nowrap"
              onClick={() => handleTaskTypeSelect("regular")}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Task
            </button>
            <button
              className="btn btn-primary ml-1 px-2 flex-shrink-0"
              onClick={() => setShowTaskTypeDropdown(!showTaskTypeDropdown)}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showTaskTypeDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowTaskTypeDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200">
                    Task Types
                  </div>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                    onClick={() => handleTaskTypeSelect("regular")}
                  >
                    <span className="text-lg">
                      <ClipboardList />
                    </span>

                    <div>
                      <div className="font-medium text-gray-900">
                        Simple Task
                      </div>
                      <div className="text-sm text-gray-500">
                        Standard one-time task
                      </div>
                    </div>
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                    onClick={() => handleTaskTypeSelect("recurring")}
                  >
                    <span className="text-lg">
                      <RotateCcw />{" "}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">
                        Recurring Task
                      </div>
                      <div className="text-sm text-gray-500">
                        Repeats on schedule
                      </div>
                    </div>
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                    onClick={() => handleTaskTypeSelect("milestone")}
                  >
                    <span className="text-lg">
                      <Target />{" "}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">Milestone</div>
                      <div className="text-sm text-gray-500">
                        Project checkpoint
                      </div>
                    </div>
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                    onClick={() => handleTaskTypeSelect("approval")}
                  >
                    <span className="text-lg">
                      <CheckCircle />{" "}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">
                        Approval Task
                      </div>
                      <div className="text-sm text-gray-500">
                        Requires approval workflow
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Search, Bulk Actions & Filters - All in One Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 space-y-4">
        {/* Search Bar */}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative w-50 max-w-md">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-md border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <SearchableSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "todo", label: "To Do" },
              { value: "progress", label: "In Progress" },
              { value: "review", label: "In Review" },
              { value: "completed", label: "Completed" },
            ]}
            placeholder="Filter by Status"
            className="min-w-[140px]"
          />

          <SearchableSelect
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.value)}
            options={[
              { value: "all", label: "All Priority" },
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
            placeholder="Filter by Priority"
            className="min-w-[140px]"
          />

          <SearchableSelect
            value={taskTypeFilter}
            onChange={(e) => setTaskTypeFilter(e.value)}
            options={[
              { value: "all", label: "All Task Types" },
              { value: "Simple Task", label: "Simple Task" },
              { value: "Recurring Task", label: "Recurring Task" },
              { value: "Milestone", label: "Milestone" },
              { value: "Approval Task", label: "Approval Task" },
            ]}
            placeholder="Filter by Task Type"
            className="min-w-[180px]"
          />

          <SearchableSelect
            value={dueDateFilter}
            onChange={(e) => {
              setDueDateFilter(e.value);
              if (e.value !== "specific_date")
                window.calendarSpecificDate = null;
            }}
            options={[
              { value: "all", label: "All Due Dates" },
              { value: "overdue", label: "Overdue" },
              { value: "due_today", label: "Due Today" },
              { value: "due_tomorrow", label: "Due Tomorrow" },
              { value: "due_this_week", label: "Due This Week" },
              { value: "due_next_week", label: "Due Next Week" },
              { value: "due_this_month", label: "Due This Month" },
              { value: "no_due_date", label: "No Due Date" },
              ...(window.calendarSpecificDate
                ? [
                    {
                      value: "specific_date",
                      label: `Date: ${new Date(
                        window.calendarSpecificDate,
                      ).toLocaleDateString()}`,
                    },
                  ]
                : []),
            ]}
            placeholder="Filter by Due Date"
            className="min-w-[200px]"
          />

          <SearchableSelect
            placeholder="All Categories"
            className="min-w-[160px]"
          />
        </div>
        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-2 bg-blue-50 rounded-md">
            <span className="text-sm font-medium text-blue-800">
              {selectedTasks.length} selected
            </span>
            <SearchableSelect
              options={companyStatuses.map((status) => ({
                value: status.code,
                label: status.label,
              }))}
              placeholder="Bulk Update Status"
              onChange={(selectedOption) => {
                if (selectedOption)
                  handleBulkStatusUpdate(selectedOption.value);
              }}
              className="min-w-[160px]"
            />
            <button
              className="btn btn-danger btn whitespace-nowrap"
              onClick={handleBulkDeleteTasks}
            >
              Delete
            </button>
            <button
              className="btn btn-secondary btn whitespace-nowrap"
              onClick={() => setSelectedTasks([])}
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Calendar View Section */}
      {showCalendarView && (
        <div className="card">
          <TasksCalendarView
            tasks={filteredTasks}
            onTaskClick={onNavigateToTask}
            onClose={() => setShowCalendarView(false)}
            onDateSelect={handleCalendarDateSelect}
            onDueDateFilter={handleCalendarDueDateFilter}
          />
        </div>
      )}

      {/* Active Filters Display */}
      {(statusFilter !== "all" ||
        priorityFilter !== "all" ||
        taskTypeFilter !== "all" ||
        dueDateFilter !== "all" ||
        searchTerm) && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-800">
                Active Filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {priorityFilter !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Priority: {priorityFilter}
                    <button
                      onClick={() => setPriorityFilter("all")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {taskTypeFilter !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Type: {taskTypeFilter}
                    <button
                      onClick={() => setTaskTypeFilter("all")}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {dueDateFilter !== "all" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Due:{" "}
                    {dueDateFilter === "specific_date" &&
                    window.calendarSpecificDate
                      ? `Date: ${new Date(window.calendarSpecificDate).toLocaleDateString()}`
                      : dueDateFilter.replace(/_/g, " ")}
                    <button
                      onClick={() => {
                        setDueDateFilter("all");
                        window.calendarSpecificDate = null;
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setTaskTypeFilter("all");
                setDueDateFilter("all");
                window.calendarSpecificDate = null;
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="flex justify-end gap-2 ">
        <button className="btn btn-secondary btn-md">Export as CSV</button>
        <button className="btn btn-secondary btn-md">Export as Excel</button>
      </div>



      {/* Tasks Table */}
   <div className="card p-0">
  <div className="w-full overflow-x-auto">
    <Table wrapperClassName="max-w-[80rem]" className="w-full"> 
           <TableHeader>
             <TableRow>
               <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 text-nowrap">
                 <input
                   type="checkbox"
                   checked={
                     selectedTasks.length === tasks.length && tasks.length > 0
                   }
                   onChange={(e) => handleSelectAll(e.target.checked)}
                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                 />
               </TableHead>
               <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-nowrap">
                 Task
               </TableHead>
               <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-nowrap">
                 Assignee
               </TableHead>
               <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-nowrap">
                 Status
               </TableHead>
               <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-nowrap">
                 Priority
               </TableHead>
               <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-nowrap">
                 Due Date
               </TableHead>
               <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-nowrap">
                 Progress
               </TableHead>
               <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-nowrap">
                 Tags
               </TableHead>
               <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-nowrap">
                 Task Type
               </TableHead>
               <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-nowrap">
                 Color Code
               </TableHead>
               <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-nowrap">
                 Actions
               </TableHead>
             </TableRow>
           </TableHeader>
        
             <TableBody>
              {filteredTasks.map((task) => (
                <React.Fragment key={task.id}>
                  <TableRow
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedTasks.includes(task.id) ? "bg-blue-50" : ""
                    }`}
                    style={{
                      borderLeft: `4px solid ${getTaskColorCode(task)}`,
                    }}
                  >
                    <TableCell className="px-6 py-4 text-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={(e) =>
                          handleTaskSelection(task.id, e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {/* Expansion control for tasks with subtasks */}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <button
                                onClick={() =>
                                  handleToggleTaskExpansion(task.id)
                                }
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors hover:text-gray-600 transition-colors"
                                title={
                                  expandedTasks.has(task.id)
                                    ? "Collapse subtasks"
                                    : "Expand subtasks"
                                }
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle cx="5" cy="5" r="2" fill="currentColor" />
                                  <circle cx="5" cy="12" r="2" fill="currentColor" />
                                  <circle cx="5" cy="19" r="2" fill="currentColor" />
                                  <path d="M5 7V10" stroke="currentColor" strokeWidth="2" />
                                  <path d="M5 14V17" stroke="currentColor" strokeWidth="2" />
                                  <path d="M7 12H14" stroke="currentColor" strokeWidth="2" />
                                  <path d="M7 19H14" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                {task.subtasks.length}
                              </button>
                            )}

                            {editingTaskId === task.id ? (
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) =>
                                  setEditingTitle(e.target.value)
                                }
                                onBlur={() => handleTitleSave(task.id)}
                                onKeyDown={(e) =>
                                  handleTitleKeyDown(e, task.id)
                                }
                                className="w-full px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200"
                                autoFocus
                                maxLength={100}
                              />
                            ) : (
                              <>
                                {task.isRecurring && (
                                  <span
                                    className="text-green-600 cursor-help"
                                    title="Recurring Task – generated from a pattern"
                                  >
                                    🔁
                                  </span>
                                )}
                                {task.isApprovalTask && (
                                  <span
                                    className="text-orange-600 cursor-help"
                                    title="Approval Task – requires approval workflow"
                                  >
                                    ✅
                                  </span>
                                )}
                                {task.type === "milestone" && (
                                  <span
                                    className="text-purple-600 cursor-help"
                                    title="Milestone – project checkpoint"
                                  >
                                    🎯
                                  </span>
                                )}
                                <span
                                  className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-all duration-200 inline-block flex-1 editable-task-title"
                                  onClick={() => handleTaskTitleClick(task)}
                                  title="Click to edit"
                                >
                                  {task.title}
                                  {riskyTasks.has(task.id) && (
                                    <span
                                      className="ml-2 text-orange-500"
                                      title="Risky Task"
                                    >
                                      ⚠️
                                    </span>
                                  )}
                                  {snoozedTasks.has(task.id) && (
                                    <span
                                      className="ml-2 text-yellow-500"
                                      title="Snoozed Task"
                                    >
                                      ⏸️
                                    </span>
                                  )}
                                </span>

                                {task.recurringFromTaskId && (
                                  <span
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 cursor-pointer hover:bg-green-200 transition-colors"
                                    title={`Recurring from Task #${task.recurringFromTaskId}`}
                                    onClick={() =>
                                      console.log(
                                        `View master task ${task.recurringFromTaskId}`,
                                      )
                                    }
                                  >
                                    📋 #{task.recurringFromTaskId}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-gray-600">
                            {task.assignee
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {task.assignee}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-nowrap text-left">
                      <TaskStatusDropdown
                        task={task}
                        currentStatus={task.status}
                        statuses={companyStatuses}
                        onStatusChange={(newStatus) =>
                          handleStatusChange(task.id, newStatus, true)
                        }
                        canEdit={canEditTaskStatus(task)}
                        canMarkCompleted={canMarkAsCompleted(task)}
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-nowrap">
                      <span className={getTaskPriorityColor(task.priority)}>
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-900 text-nowrap">
                      {task.dueDate}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-nowrap">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-600 min-w-[3rem]">
                          {task.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {task.tags &&
                          task.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">
                          {getTaskType(task)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-nowrap">
                      <div
                        className="w-6 h-6 rounded-full shadow-md"
                        style={{ backgroundColor: getTaskColorCode(task) }}
                        title={getTaskColorCode(task)}
                      ></div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-nowrap">
                      <div className="flex items-center justify-center">
                        <TaskActionsDropdown
                          task={task}
                          onSnooze={() => handleSnoozeTask(task.id)}
                          onMarkAsRisk={() => handleMarkAsRisk(task.id)}
                          onMarkAsDone={() =>
                            handleStatusChange(task.id, "DONE", true)
                          }
                          onDelete={() => handleDeleteTask(task.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Subtask Rows */}
                  {expandedTasks.has(task.id) &&
                    task.subtasks &&
                    task.subtasks.map((subtask) => (
                      <TableRow
                        key={`subtask-${subtask.id}`}
                        className="bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <TableCell className="px-6 py-3"></TableCell>
                        <TableCell className="px-6 py-3">
                          <div className="flex items-center gap-2 pl-8">
                            <span className="text-blue-500">↳</span>
                            {editingSubtaskId === subtask.id ? (
                              <input
                                type="text"
                                value={editingSubtaskTitle}
                                onChange={(e) =>
                                  setEditingSubtaskTitle(e.target.value)
                                }
                                onBlur={() =>
                                  handleSubtaskTitleSave(subtask.id, task.id)
                                }
                                onKeyDown={(e) =>
                                  handleSubtaskTitleKeyDown(
                                    e,
                                    subtask.id,
                                    task.id,
                                  )
                                }
                                className="font-medium text-gray-800 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                autoFocus
                                onFocus={(e) => e.target.select()}
                              />
                            ) : (
                              <span
                                className="font-medium text-gray-800 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-all duration-200 inline-block flex-1"
                                onClick={() =>
                                  handleSubtaskTitleClick(subtask, task.id)
                                }
                                title="Click to edit"
                              >
                                {subtask.title}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 pl-7">
                            Sub-task of "{task.title}"
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                              <span className="text-xs font-medium text-gray-600">
                                {subtask.assignee
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">
                              {subtask.assignee}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3 text-left">
                          <TaskStatusDropdown
                            task={subtask}
                            currentStatus={subtask.status}
                            statuses={companyStatuses}
                            onStatusChange={(newStatus) =>
                              handleSubtaskStatusChange(
                                task.id,
                                subtask.id,
                                newStatus,
                              )
                            }
                            canEdit={canEditTaskStatus(subtask)}
                            canMarkCompleted={true}
                          />
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <span className={getPriorityBadge(subtask.priority)}>
                            {subtask.priority}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-3 text-sm text-gray-700">
                          {subtask.dueDate}
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <div className="flex items-center">
                            <span className="text-xs text-gray-600 min-w-[3rem]">
                              {subtask.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3"></TableCell>
                        <TableCell className="px-6 py-3">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-700">
                              {getTaskType(subtask)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <div
                            className="w-6 h-6 rounded-full shadow-md"
                            style={{
                              backgroundColor: getTaskColorCode(subtask),
                            }}
                            title={getTaskColorCode(subtask)}
                          ></div>
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <div className="flex items-center justify-center">
                            <button
                              className="text-gray-400 cursor-pointer hover:text-red-600 transition-colors p-1"
                              onClick={() =>
                                setShowDeleteSubtaskConfirmation({
                                  taskId: task.id,
                                  subtaskId: subtask.id,
                                  subtaskTitle: subtask.title,
                                })
                              }
                              title="Delete Sub-task"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
              ))}
           </TableBody>
        
          </Table>
        </div>
      </div>

      {/* Pagination */}
     
      {/* Slide-in Drawer */}
     {showCreateTaskDrawer && (
    <div className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0 -top-[16px]" role="dialog" aria-modal="true">
      <div
        className=" absolute inset-0 bg-black/40 "
        onClick={() => setShowCreateTaskDrawer(false)}
      ></div>
      <div
        className="absolute right-0 top-0 h-full bg-white/95 flex flex-col modal-animate-slide-right"
        style={{
          width: "min(90vw, 900px)",
          boxShadow: "-10px 0 50px rgba(0,0,0,0.2)",
          borderLeft: "1px solid rgba(255,255,255,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
            <div className="drawer-header">
              <h2 className="text-2xl font-bold text-white">
                Create New Task
                {selectedDateForTask &&
                  ` for ${new Date(selectedDateForTask).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}`}
              </h2>
              <button
                onClick={() => setShowCreateTaskDrawer(false)}
                className="close-btn"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
              <div className="drawer-body flex-1 min-h-0 overflow-y-auto">
          <CreateTask
            onClose={() => {
              setShowCreateTaskDrawer(false);
              setSelectedDateForTask(null);
            }}
            initialTaskType={selectedTaskType}
            preFilledDate={selectedDateForTask}
          />
        </div>
          </div>
        </div>
      )}

      {/* Task Edit Modal */}
      {showEditModal && editingTask && (
        <TaskEditModal
          task={editingTask}
          onSave={handleSaveEditedTask}
          onClose={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* Status Confirmation Modal */}
      {showStatusConfirmation && (
        <StatusConfirmationModal
          taskTitle={showStatusConfirmation.taskTitle}
          statusLabel={showStatusConfirmation.statusLabel}
          onConfirm={() => {
            handleStatusChange(
              showStatusConfirmation.taskId,
              showStatusConfirmation.newStatusCode,
              false,
            );
            setShowStatusConfirmation(null);
          }}
          onCancel={() => setShowStatusConfirmation(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <TaskDeleteConfirmationModal
          task={showDeleteConfirmation.task}
          options={showDeleteConfirmation.options}
          onConfirm={(finalOptions) =>
            executeTaskDeletion(showDeleteConfirmation.task.id, finalOptions)
          }
          onCancel={() => setShowDeleteConfirmation(null)}
          currentUser={currentUser}
        />
      )}

      {/* Calendar Modal */}
      {showCalendarModal && (
        <CalendarDatePicker
          onClose={() => {
            setShowCalendarModal(false);
            setSelectedTaskType("regular");
          }}
          onDateSelect={handleCalendarDateSelect}
          taskType={selectedTaskType}
        />
      )}

      {/* Approval Task Creator Modal */}
      {showApprovalTaskModal && !selectedApprovalTask && (
        <div className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0" role="dialog" aria-modal="true">
    <div
            className="absolute inset-0 bg-black/40 "
            onClick={() => setShowApprovalTaskModal(false)}
          ></div>
          <div
            className="absolute right-0 top-0 h-full bg-white/95  flex flex-col modal-animate-slide-right"
            style={{
              width: "min(90vw, 600px)",
              boxShadow: "-10px 0 50px rgba(0,0,0,0.2)",
              borderLeft: "1px solid rgba(255,255,255,0.2)",
            }}
                onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <h2 className="text-2xl font-bold text-white">
                Create Approval Task
                {selectedDateForTask &&
                  ` for ${new Date(selectedDateForTask).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}`}
              </h2>
              <button
                onClick={() => setShowApprovalTaskModal(false)}
                className="close-btn"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
           <div className="drawer-body flex-1 min-h-0 overflow-y-auto">
          <ApprovalTaskCreator
            onClose={() => {
              setShowApprovalTaskModal(false);
              setSelectedDateForTask(null);
            }}
            onSubmit={handleCreateApprovalTask}
            preFilledDate={selectedDateForTask}
            selectedDate={selectedDateForTask}
          />
        </div>
          </div>
        </div>
      )}

      {/* Subtask Creator Modal */}
      {showSubtaskCreator && (
        <SubtaskCreator
          parentTask={tasks.find((t) => t.id === showSubtaskCreator)}
          onClose={() => setShowSubtaskCreator(null)}
          onSubmit={(subtaskData) =>
            handleCreateSubtask(showSubtaskCreator, subtaskData)
          }
          currentUser={currentUser}
        />
      )}

      {/* Milestone Creation Modal */}
    {showMilestoneModal && (
    <div className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0" role="dialog" aria-modal="true">
       <div
            className="absolute inset-0 bg-black/40 "
            onClick={() => setShowMilestoneModal(false)}
          ></div>
          <div
            className="absolute right-0 top-0 h-full bg-white/95  flex flex-col modal-animate-slide-right"
            style={{
              width: "min(90vw, 800px)",
              boxShadow: "-10px 0 50px rgba(0,0,0,0.2)",
              borderLeft: "1px solid rgba(255,255,255,0.2)",
            }}
               onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <h2 className="text-2xl font-bold text-white">
                Create Milestone
                {selectedDateForTask &&
                  ` for ${new Date(selectedDateForTask).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}`}
              </h2>
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="close-btn"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
             <div className="drawer-body flex-1 min-h-0 overflow-y-auto">
          <MilestoneCreator
            onClose={() => {
              setShowMilestoneModal(false);
              setSelectedDateForTask(null);
            }}
            onSubmit={handleCreateMilestone}
            preFilledDate={selectedDateForTask}
            selectedDate={selectedDateForTask}
          />
        </div>
          </div>
        </div>
      )}

      {/* Approval Task Detail Modal */}
      {showApprovalTaskModal && selectedApprovalTask && (
        <ApprovalTaskDetailModal
          task={selectedApprovalTask}
          onClose={() => {
            setShowApprovalTaskModal(false);
            setSelectedApprovalTask(null);
          }}
          currentUser={currentUser}
          onApproval={(taskId, approverId, action, comment) => {
            // Handle approval action
            setTasks((prevTasks) =>
              prevTasks.map((task) => {
                if (task.id !== taskId) return task;

                const updatedApprovers = task.approvers.map((approver) => {
                  if (approver.id === approverId) {
                    return {
                      ...approver,
                      status: action,
                      comment: comment || null,
                      approvedAt: new Date().toISOString(),
                    };
                  }
                  return approver;
                });

                // Determine overall task status based on approval mode
                let newStatus = task.status;
                if (action === "approved") {
                  if (task.approvalMode === "any") {
                    newStatus = "DONE";
                  } else if (task.approvalMode === "all") {
                    const allApproved = updatedApprovers.every(
                      (a) => a.status === "approved",
                    );
                    if (allApproved) newStatus = "DONE";
                  }
                } else if (action === "rejected") {
                  newStatus = "CANCELLED";
                }

                return {
                  ...task,
                  approvers: updatedApprovers,
                  status: newStatus,
                };
              }),
            );

            // Close modal after action
            setShowApprovalTaskModal(false);
            setSelectedApprovalTask(null);
          }}
        />
      )}

      {/* Sub-task Delete Confirmation Modal */}
      {showDeleteSubtaskConfirmation && (
        <SubtaskDeleteConfirmationModal
          subtaskTitle={showDeleteSubtaskConfirmation.subtaskTitle}
          onConfirm={() =>
            handleDeleteSubtask(
              showDeleteSubtaskConfirmation.taskId,
              showDeleteSubtaskConfirmation.subtaskId,
            )
          }
          onCancel={() => setShowDeleteSubtaskConfirmation(null)}
        />
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
