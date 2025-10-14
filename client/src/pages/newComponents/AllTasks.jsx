import React, { useState, useEffect } from "react";
import { useActiveRole } from "../../components/RoleSwitcher";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useTasksStore from "../../stores/tasksStore";
import TaskEditModal from "./TaskEditModal";
import TasksCalendarView from "./TasksCalendarView";
import SubtaskCreator from "./SubtaskCreator";
import StatusConfirmationModal from "./StatusConfirmationModal";
import TaskStatusDropdown from "./TaskStatusDropdown";
import TaskActionsDropdown from "./TaskActionsDropdown";
import SubtaskActionsDropdown from "./SubtaskActionsDropdown";
import ApprovalTaskDetailModal from "./ApprovalTaskDetailModal";
import CalendarDatePicker from "./CalendarDatePicker";
import SearchableSelect from "../SearchableSelect";
import Toast from "./Toast";

import CustomConfirmationModal from "./CustomConfirmationModal";
import TaskThreadModal from "./TaskThreadModal";
import SmartTaskParser from "./SmartTaskParser";
import MilestoneCreator from "../MilestoneCreator";
import CreateTask from "./CreateTask";
import ApprovalTaskCreator from "./ApprovalTaskCreator";
import {
  createMilestone,
  getMilestones,
  updateMilestone,
  deleteMilestone,
  linkTaskToMilestone,
  unlinkTaskFromMilestone,
  markMilestoneAsAchieved,
} from "../../api/milestoneApi";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { getTaskTypeInfo, getTaskPriorityColor } from "../TaskTypeUtils";
import {
  CheckCircle,
  ClipboardList,
  Delete,
  RotateCcw,
  Target,
  MessageCircle,
  Sparkles,
  Hash,
  AtSign,
} from "lucide-react";
import { useSubtask } from "../../contexts/SubtaskContext";

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

  // Task detail and edit modals
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);

  // Smart task features
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [selectedTaskForThread, setSelectedTaskForThread] = useState(null);
  const [showSmartParser, setShowSmartParser] = useState(false);

  const [toast, setToast] = useState({
    message: "",
    type: "success",
    isVisible: false,
  });

  // Confirmation modals state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    onConfirm: null,
    data: null,
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
// const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const [apiTasks, setApiTasks] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const { activeRole, setActiveRole } = useActiveRole();
  const [currentRole, setCurrentRole] = useState(null);
  const { openSubtaskDrawer } = useSubtask();

  // Get user data to access roles
  const { data: user } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
  });

  // Function to refetch tasks from API
  const refetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authorization token not found.");
      }
      const response = await axios.get(
        `/api/mytasks?page=1&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        // If response is grouped by roles, use only current role's tasks
        const rolesObj = response.data.data?.roles;
        let roleToUse = activeRole || null;

        // If no active role set, use user's first role as default
        if (!roleToUse && user?.role?.[0]) {
          roleToUse = user.role[0];
          // Set the active role in context
          setActiveRole(roleToUse);
        }

        // Fallback to first available role from response
        if (!roleToUse && rolesObj) {
          roleToUse = Object.keys(rolesObj)[0];
          setActiveRole(roleToUse);
        }

        setCurrentRole(roleToUse);
        let tasksArr = [];
        if (rolesObj && roleToUse && rolesObj[roleToUse]) {
          tasksArr = rolesObj[roleToUse];
        } else if (response.data.data.tasks) {
          tasksArr = response.data.data.tasks;
        }
        const mappedTasks = tasksArr.map((task) => {
          // Debug original task structure
          if (process.env.NODE_ENV === "development") {
            console.log("🔍 Original API Task:", {
              _id: task._id,
              id: task.id,
              _doc_id: task._doc?._id,
              title: task.title || task._doc?.title,
              _idType: typeof task._id,
              idType: typeof task.id,
              _docIdType: typeof task._doc?._id,
              _idLength: task._id?.toString().length,
              idLength: task.id?.toString().length,
              _docIdLength: task._doc?._id?.toString().length,
              isMongooseDoc: !!(task._doc || task.$__),
              allKeys: Object.keys(task),
            });
          }

          // Extract data from Mongoose document or plain object
          let taskData;
          let taskId;

          if (task._doc) {
            // It's a Mongoose document - use _doc for actual data
            console.log("📋 Mongoose document detected, using _doc data");
            taskData = task._doc;
            taskId = task._doc._id;
          } else {
            // It's a plain object
            console.log("📋 Plain object detected, using directly");
            taskData = task;
            taskId = task._id || task.id;
          }

          const statusMap = {
            open: "OPEN",
            todo: "OPEN",
            "in-progress": "INPROGRESS",
            inprogress: "INPROGRESS",
            done: "DONE",
            completed: "DONE",
            onhold: "ONHOLD",
            "on-hold": "ONHOLD",
            cancelled: "CANCELLED",
            canceled: "CANCELLED",
          };
          const apiStatus = taskData.status?.toLowerCase() || "open";
          const feStatus = statusMap[apiStatus] || "OPEN";

          // Debug logging
          if (process.env.NODE_ENV === "development") {
            console.log("API Task Status Mapping:", {
              originalStatus: taskData.status,
              apiStatus,
              mappedStatus: feStatus,
              taskTitle: taskData.title,
            });
          }

          const mappedTask = {
            // CRITICAL: Use the extracted taskId for both id and _id
            id: taskId, // This will be used for frontend operations
            _id: taskId, // This will be used for API calls

            // Spread other properties from taskData FIRST
            ...taskData,

            // Then override with mapped values
            title: taskData.title,
            assignee: taskData.assignedTo
              ? `${taskData.assignedTo.firstName} ${taskData.assignedTo.lastName}`
              : "Unassigned",
            assigneeId: taskData.assignedTo?._id,
            status: feStatus, // This will override the raw status from taskData
            priority: taskData.priority
              ? taskData.priority.charAt(0).toUpperCase() +
                taskData.priority.slice(1)
              : "Medium",
            dueDate: taskData.dueDate
              ? new Date(taskData.dueDate).toISOString().split("T")[0]
              : "",
            progress:
              feStatus === "DONE" ? 100 : feStatus === "INPROGRESS" ? 50 : 0,
            ...taskData,

            // Map subtasks if they exist
            subtasks:
              task.subtasks?.map((subtask) => {
                const subtaskApiStatus =
                  subtask.status?.toLowerCase() || "open";
                const subtaskFeStatus = statusMap[subtaskApiStatus] || "OPEN";

                return {
                  ...subtask,
                  id: subtask._id,
                  _id: subtask._id,
                  status: subtaskFeStatus, // Apply status mapping to subtasks
                  assignee: subtask.assignedTo
                    ? `${subtask.assignedTo.firstName} ${subtask.assignedTo.lastName}`
                    : "Unassigned",
                  assigneeId: subtask.assignedTo?._id,
                };
              }) || [],
          };

          // Debug final mapped task
          if (process.env.NODE_ENV === "development") {
            console.log("🔍 Mapped Task:", {
              id: mappedTask.id,
              _id: mappedTask._id,
              title: mappedTask.title,
              idType: typeof mappedTask.id,
              _idType: typeof mappedTask._id,
              idLength: mappedTask.id?.toString().length,
              _idLength: mappedTask._id?.toString().length,
              isObjectId: /^[0-9a-fA-F]{24}$/.test(mappedTask.id?.toString()),
            });
          }

          return mappedTask;
        });
        setApiTasks(mappedTasks);
      } else {
        setApiError(response.data.message || "Failed to fetch tasks.");
      }
    } catch (error) {
      setApiError(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while fetching tasks."
      );
    }
  };
  // Lock body scroll while any modal/drawer is open
  useEffect(() => {
    const anyOpen =
      showCreateTaskDrawer ||
      showApprovalTaskModal ||
      showMilestoneModal ||
      showCalendarModal ||
      showEditModal ||
      !!showStatusConfirmation ||
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

  useEffect(() => {
    const fetchTasks = async () => {
      setApiLoading(true);
      setApiError(null);
      await refetchTasks();
      setApiLoading(false);
    };

    // Only fetch if we have user data or activeRole
    if (user || activeRole) {
      fetchTasks();
    }
  }, [activeRole, user]);

  // Listen for task status updates from child components
  useEffect(() => {
    const handleTaskStatusUpdated = (event) => {
      const { taskId, newStatus } = event.detail;
      console.log("AllTasks: Received status update event:", {
        taskId,
        newStatus,
      });

      // Update the specific task in local state immediately with color
      setApiTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId || task._id === taskId) {
            // Get color from companyStatuses configuration
            const statusObj = companyStatuses.find((s) => s.code === newStatus);
            const newStatusColor = statusObj
              ? statusObj.color
              : getStatusColor(newStatus);

            console.log("🎨 Event: Updating task color:", {
              taskId,
              newStatus,
              newColor: newStatusColor,
              statusObj,
            });

            return {
              ...task,
              status: newStatus,
              statusColor: newStatusColor,
              colorCode: newStatusColor,
            };
          }
          return task;
        })
      );
    };

    // Also listen for color update events
    const handleTaskColorUpdated = (event) => {
      const { taskId, newStatus } = event.detail;
      console.log("AllTasks: Received color update event:", {
        taskId,
        newStatus,
      });

      // Force re-render with updated colors
      setApiTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId || task._id === taskId) {
            const statusObj = companyStatuses.find((s) => s.code === newStatus);
            const newStatusColor = statusObj
              ? statusObj.color
              : getStatusColor(newStatus);

            console.log("🎨 Color: Force updating task color:", {
              taskId,
              newStatus,
              newColor: newStatusColor,
              oldColor: task.statusColor || task.colorCode,
            });

            return {
              ...task,
              status: newStatus,
              statusColor: newStatusColor,
              colorCode: newStatusColor,
            };
          }
          return task;
        })
      );
    };

    window.addEventListener("taskStatusUpdated", handleTaskStatusUpdated);
    window.addEventListener("taskColorUpdated", handleTaskColorUpdated);

    return () => {
      window.removeEventListener("taskStatusUpdated", handleTaskStatusUpdated);
      window.removeEventListener("taskColorUpdated", handleTaskColorUpdated);
    };
  }, []);

  // Fetch available users for task assignment
  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setAvailableUsers(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching available users:", error);
        setAvailableUsers([]);
      }
    };

    fetchAvailableUsers();
  }, []);

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
      allowedTransitions: ["INPROGRESS", "ONHOLD", "CANCELLED", "DONE"],
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
  // Debug function for recurring task troubleshooting
  const debugRecurringTask = (task, context = '') => {
    if (task.isRecurring) {
      console.log(`🔄 DEBUG - Recurring Task [${context}]:`, {
        taskId: task.id || task._id,
        title: task.title,
        isRecurring: task.isRecurring,
        taskType: task.taskType,
        originalDueDate: task.dueDate,
        nextDueDate: task.nextDueDate,
        recurrencePattern: task.recurrencePattern,
        status: task.status,
        completedDate: task.completedDate,
        hasRecurrencePattern: !!task.recurrencePattern,
        patternDetails: task.recurrencePattern ? {
          frequency: task.recurrencePattern.frequency,
          interval: task.recurrencePattern.interval,
          anchorField: task.recurrencePattern.anchorField
        } : null
      });
    }
  };
    // Calculate enhanced due date for recurring tasks (client-side display logic)
  const calculateEnhancedDueDate = (task) => {
    // For non-recurring tasks, return original due date
    if (!task.isRecurring || !task.recurrencePattern) {
      return task.dueDate;
    }

    // For recurring tasks, show the most relevant due date:
    // 1. If task is completed, show original due date (historical)
    // 2. If task has nextDueDate, show that (upcoming occurrence)
    // 3. Otherwise, show current due date
    
    if (task.status === 'DONE' || task.status === 'completed') {
      // For completed recurring tasks, show original due date for reference
      return task.dueDate;
    }
    
    if (task.nextDueDate) {
      // Show next due date for active recurring tasks
      return task.nextDueDate;
    }
    
    return task.dueDate;
  };
  // Get display due date with recurring task logic
  const getDisplayDueDate = (task) => {
    debugRecurringTask(task, 'getDisplayDueDate');
    
    const enhancedDueDate = calculateEnhancedDueDate(task);
    
   
    if (!enhancedDueDate) {
      return null;
    }
    
    return new Date(enhancedDueDate);
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
        subtask.status !== "completed" && subtask.status !== "cancelled"
    );

    return incompleteSubtasks.length === 0;
  };

  // Get valid status transitions based on business rules
  const getValidStatusTransitions = (currentStatusCode, task = null) => {
    const currentStatus = companyStatuses.find(
      (s) => s.code === currentStatusCode && s.active
    );
    if (!currentStatus) return [];

    let validTransitions = currentStatus.allowedTransitions.filter(
      (transitionCode) => {
        const targetStatus = companyStatuses.find(
          (s) => s.code === transitionCode && s.active
        );
        return targetStatus !== null;
      }
    );

    // Apply sub-task completion logic for parent tasks
    if (task && task.subtasks && task.subtasks.length > 0) {
      const hasIncompleteSubtasks = task.subtasks.some(
        (subtask) => subtask.status !== "DONE" && subtask.status !== "CANCELLED"
      );

      // Block completion if sub-tasks are incomplete
      if (hasIncompleteSubtasks) {
        validTransitions = validTransitions.filter(
          (transition) => transition !== "DONE"
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
    reason = null
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
    reason = null
  ) => {
    console.log("handleStatusChange called with:", {
      taskId,
      newStatusCode,
      requiresConfirmation,
      reason,
    });

    // Find task by multiple possible ID fields to handle different ID formats
    const task = apiTasks.find((t) => {
      const matches =
        t.id === taskId ||
        t._id === taskId ||
        String(t.id) === String(taskId) ||
        String(t._id) === String(taskId) ||
        t.id === Number(taskId);

      if (matches) {
        console.log("MATCH FOUND:", {
          searchId: taskId,
          task: { id: t.id, _id: t._id, title: t.title },
        });
      }
      return matches;
    });

    const newStatus = companyStatuses.find(
      (s) => s.code === newStatusCode && s.active
    );

    console.log(
      "Found task:",
      task
        ? { id: task.id, _id: task._id, title: task.title, status: task.status }
        : "NOT FOUND"
    );
    console.log(
      "Found status:",
      newStatus ? { code: newStatus.code, label: newStatus.label } : "NOT FOUND"
    );

    if (!newStatus) {
      setToast({
        message: "Invalid status code provided.",
        type: "error",
        isVisible: true,
      });
      return;
    }

    if (!task) {
      // If we can't find the task locally but we have a valid MongoDB ObjectId and valid status,
      // we can still proceed with the API call since the backend knows about this task
      if (
        newStatus &&
        taskId &&
        (taskId.match(/^[0-9a-fA-F]{24}$/) || taskId.toString().length > 0)
      ) {
        console.log(
          "Task not found locally but valid ID provided, proceeding with API call"
        );
        // Create a minimal task object for the API call
        const minimalTask = {
          _id: taskId,
          id: taskId,
          title: "Task (Loading...)",
          status: "OPEN", // Default status
        };

        // Show confirmation for final statuses
        if (newStatus.isFinal && requiresConfirmation) {
          setShowStatusConfirmation({
            taskId,
            newStatusCode,
            taskTitle: "Task",
            statusLabel: newStatus.label,
            reason,
          });
          return;
        }

        // Execute status change directly
        executeStatusChange(minimalTask, newStatusCode, reason);
        return;
      }

      setToast({
        message: "Task not found. Please refresh the page and try again.",
        type: "error",
        isVisible: true,
      });
      return;
    }

    // Check edit permissions
    if (!canEditTaskStatus(task)) {
      setToast({
        message: "You do not have permission to edit this task status.",
        type: "error",
        isVisible: true,
      });
      return;
    }

    // Validate status transition
    const validTransitions = getValidStatusTransitions(task.status, task);
    if (!validTransitions.includes(newStatusCode)) {
      const currentStatusObj = companyStatuses.find(
        (s) => s.code === task.status
      );
      setToast({
        message: `Invalid status transition from "${
          currentStatusObj?.label || task.status
        }" to "${newStatus.label}". Please follow the allowed workflow.`,
        type: "error",
        isVisible: true,
      });
      return;
    }

    // Check sub-task completion logic
    if (newStatusCode === "DONE" && !canMarkAsCompleted(task)) {
      const incompleteCount =
        task.subtasks?.filter(
          (s) => s.status !== "DONE" && s.status !== "CANCELLED"
        ).length || 0;
      setToast({
        message: `Cannot mark task as completed. There are ${incompleteCount} incomplete sub-tasks that must be completed or cancelled first.`,
        type: "error",
        isVisible: true,
      });
      return;
    }

    // Show confirmation for final statuses
    if (newStatus.isFinal && requiresConfirmation) {
      setShowStatusConfirmation({
        taskId: task._id || task.id,
        newStatusCode,
        taskTitle: task.title,
        statusLabel: newStatus.label,
        reason,
      });
      return;
    }

    // Execute status change - pass the task object to get the correct ID for API
    executeStatusChange(task, newStatusCode, reason);
  };

  // Execute the actual status change
  const executeStatusChange = async (task, newStatusCode, reason = null) => {
    console.log("🚀 EXECUTE STATUS CHANGE STARTED:", {
      task: {
        id: task.id,
        _id: task._id,
        title: task.title,
        currentStatus: task.status,
      },
      newStatusCode,
      reason,
      timestamp: new Date().toISOString(),
    });

    try {
      // Use the MongoDB ObjectId (_id) for the API call, fallback to numeric id
      const apiTaskId = task._id || task.id;

      console.log("🔧 Using task ID for API call:", apiTaskId, "from task:", {
        id: task.id,
        _id: task._id,
      });

      // Map frontend status codes to backend status codes
      const statusMapping = {
        OPEN: "open",
        INPROGRESS: "in-progress",
        DONE: "completed",
        ONHOLD: "on-hold",
        CANCELLED: "cancelled",
      };

      const backendStatus =
        statusMapping[newStatusCode] || newStatusCode.toLowerCase();

      console.log("🎯 Status mapping:", {
        frontendStatus: newStatusCode,
        backendStatus,
        allMappings: statusMapping,
      });

      // Prepare the request payload according to API spec
      const payload = {
        status: backendStatus,
        notes: reason || undefined, // Add notes if reason is provided
      };

      // Add completedDate if status is being set to completed/done
      if (backendStatus === "completed" || newStatusCode === "DONE") {
        payload.completedDate = new Date().toISOString();
      }

      console.log('📤 Updating task status with payload:', payload);
      console.log('🌐 API endpoint URL:', `/api/tasks/${apiTaskId}/status`);
      console.log('🔑 Auth token exists:', !!localStorage.getItem('token'));

      // Use correct API endpoint format
      console.log("🚀 Making API call now...");
      const response = await axios.patch(
        `/api/tasks/${apiTaskId}/status`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("📨 Status update response received:", response);

      console.log("Status update response:", response);

      // Check if response contains HTML (indicates routing issue)
      if (
        typeof response.data === "string" &&
        response.data.includes("<!DOCTYPE html>")
      ) {
        console.error(
          "API returned HTML instead of JSON - possible routing issue"
        );
        throw new Error("API endpoint not found - check server routing");
      }

      // Check for successful response
      if (response.data && response.data.success) {
        console.log("✅ API call successful, updating local state...");

        // Update local state optimistically with status color
        setApiTasks((prev) => {
          const updated = prev.map((t) => {
            if (t.id === task.id || t._id === task._id) {
              // Get color from companyStatuses configuration
              const statusObj = companyStatuses.find(
                (s) => s.code === newStatusCode
              );
              const newStatusColor = statusObj
                ? statusObj.color
                : getStatusColor(newStatusCode);

              const updatedTask = {
                ...t,
                status: newStatusCode,
                statusColor: newStatusColor,
                colorCode: newStatusColor, // Also update colorCode field
                updatedAt: new Date().toISOString(),
                ...(backendStatus === "completed" && {
                  completedDate: new Date().toISOString(),
                }),
              };

              console.log("🎨 Updated task with color:", {
                taskId: t._id || t.id,
                oldStatus: t.status,
                newStatus: newStatusCode,
                backendStatus,
                newColor: updatedTask.statusColor,
                colorCode: updatedTask.colorCode,
                statusObject: statusObj,
              });

              return updatedTask;
            }
            return t;
          });

          console.log("📊 Local state updated, total tasks:", updated.length);
          return updated;
        });

        // Also update Zustand store if available
        if (typeof updateTaskStatus === "function") {
          updateTaskStatus(task.id, newStatusCode);
        }

        // Show success toast
        const newStatus = companyStatuses.find((s) => s.code === newStatusCode);
        const message = `Task "${task.title}" status updated to "${
          newStatus?.label || newStatusCode
        }"`;

        setToast({
          message: message,
          type: "success",
          isVisible: true,
        });

        // No need to refetch since we're updating optimistically and it's working
      } else {
        // Handle API error response
        const errorMessage =
          response.data?.message || "Failed to update task status.";
        setToast({
          message: errorMessage,
          type: "error",
          isVisible: true,
        });
      }
    } catch (error) {
      console.error("❌ ERROR in executeStatusChange:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        taskId: task._id || task.id,
        newStatusCode,
        timestamp: new Date().toISOString(),
      });

      // Handle different error response formats
      let errorMessage = "Error updating task status. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = `Network error: ${error.message}`;
      } else if (error.code === "NETWORK_ERROR") {
        errorMessage =
          "Network connection failed. Please check your internet connection.";
      }

      setToast({
        message: errorMessage,
        type: "error",
        isVisible: true,
      });

      // Optionally revert optimistic update on error
      console.log(
        "Status update failed, you may want to revert the optimistic update"
      );
    }
  };

  // Permission check for task deletion
  const canDeleteTask = (task) => {
    return (
      task.creatorId === currentUser.id ||
      task.assigneeId === currentUser.id ||
      currentUser.role === "admin"
    );
  };

  // Handle task deletion with confirmation
  const handleDeleteTask = async (taskId, options = {}) => {
    try {
      const task = apiTasks.find((t) => t.id === taskId || t._id === taskId);

      if (!task) {
        showToast("Task not found", "error");
        return;
      }

      // Check permissions
      if (!canDeleteTask(task)) {
        showToast("You do not have permission to delete this task", "error");
        return;
      }

      // Use the correct ID format for API call - prefer _id (MongoDB ObjectId) if available
      const apiTaskId = task._id || task.id;
      console.log("🗑️ Deleting task with ID:", apiTaskId, "from task:", {
        id: task.id,
        _id: task._id,
        title: task.title,
      });

      // Call API to delete task
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/tasks/delete/${apiTaskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("🌐 Delete API response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Delete API response:", result);

        if (result.success) {
          // Remove from local state
          setApiTasks((prev) =>
            prev.filter((t) => t.id !== taskId && t._id !== taskId)
          );

          // Show success toast
          showToast(`Task "${task.title}" deleted successfully`, "success");

          // Refetch tasks to ensure sync
          await refetchTasks();
        } else {
          throw new Error(result.message || "Failed to delete task");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("❌ Error deleting task:", error);
      showToast(error.message || "Error deleting task", "error");
    }
  }; // Execute task deletion
  const executeTaskDeletion = async (taskId, options) => {
    try {
      const task = apiTasks.find((t) => t.id === taskId);

      // Call API to delete task
      const token = localStorage.getItem("token");
      const response = await axios.delete(`/api/tasks/delete/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Remove from local state
        setApiTasks((prev) => prev.filter((t) => t.id !== taskId));

        // Close confirmation modal
        setConfirmModal({
          isOpen: false,
          type: "",
          title: "",
          message: "",
          onConfirm: null,
          data: null,
        });

        // Show success toast
        showToast(`Task "${task?.title}" deleted successfully`, "success");

        // Refetch to ensure sync
        await refetchTasks();
      } else {
        throw new Error(response.data.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      showToast(
        error.response?.data?.message || error.message || "Error deleting task",
        "error"
      );
      setConfirmModal({
        isOpen: false,
        type: "",
        title: "",
        message: "",
        onConfirm: null,
        data: null,
      });
    }
  };

  // Handle bulk task deletion with confirmation
  const handleBulkDeleteTasks = () => {
    const selectedTaskObjects = apiTasks.filter((t) =>
      selectedTasks.includes(t.id)
    );
    const errors = [];

    selectedTaskObjects.forEach((task) => {
      if (!canDeleteTask(task)) {
        errors.push(`No permission to delete: ${task.title}`);
      }
    });

    if (errors.length > 0) {
      showToast(`Cannot delete some tasks: ${errors.join(", ")}`, "error");
      return;
    }

    // Show confirmation modal
    setConfirmModal({
      isOpen: true,
      type: "danger",
      title: "Delete Multiple Tasks",
      message: `Are you sure you want to delete ${selectedTasks.length} selected tasks? This action cannot be undone.`,
      onConfirm: () => executeBulkDeleteTasks(selectedTaskObjects),
      data: { selectedTaskObjects },
    });
  };

  // Execute bulk task deletion
  const executeBulkDeleteTasks = async (selectedTaskObjects) => {
    try {
      const token = localStorage.getItem("token");
      const deletePromises = selectedTaskObjects.map(task =>
        axios.delete(`/api/tasks/delete/${task.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      const results = await Promise.allSettled(deletePromises);

      let successCount = 0;
      let errorCount = 0;

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.data.success) {
          successCount++;
        } else {
          errorCount++;
        }
      });

      // Update local state - remove successfully deleted tasks
      const deletedTaskIds = [];
      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value.data.success) {
          deletedTaskIds.push(selectedTaskObjects[index].id);
        }
      });

      setApiTasks((prev) =>
        prev.filter((task) => !deletedTaskIds.includes(task.id))
      );
      setSelectedTasks([]);

      // Close confirmation modal
      setConfirmModal({
        isOpen: false,
        type: "",
        title: "",
        message: "",
        onConfirm: null,
        data: null,
      });

      // Show appropriate toast
      if (errorCount === 0) {
        showToast(`${successCount} tasks deleted successfully`, "success");
      } else if (successCount === 0) {
        showToast(`Failed to delete all ${errorCount} tasks`, "error");
      } else {
        showToast(
          `${successCount} tasks deleted, ${errorCount} failed`,
          "warning"
        );
      }

      // Refetch to ensure sync
      await refetchTasks();
    } catch (error) {
      console.error("Error in bulk delete:", error);
      showToast("Error occurred during bulk delete operation", "error");
      setConfirmModal({
        isOpen: false,
        type: "",
        title: "",
        message: "",
        onConfirm: null,
        data: null,
      });
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
    const selectedTaskObjects = apiTasks.filter((t) =>
      selectedTasks.includes(t.id)
    );
    const errors = [];

    selectedTaskObjects.forEach((task) => {
      if (!canEditTaskStatus(task)) {
        errors.push(`No permission to edit: ${task.title}`);
        return;
      }

      if (newStatusCode === "DONE" && !canMarkAsCompleted(task)) {
        const incompleteCount = task.subtasks.filter(
          (s) => s.status !== "completed" && s.status !== "cancelled"
        ).length;
        errors.push(
          `"${task.title}" has ${incompleteCount} incomplete sub-tasks`
        );
        return;
      }
    });

    if (errors.length > 0) {
      setToast({
        message: `Cannot update some tasks:\n${errors.join("\n")}`,
        type: "error",
        isVisible: true,
      });
      return;
    }

    // Update all selected tasks using store
    bulkUpdateStatus(selectedTasks, newStatusCode);

    // Clear selection
    setShowBulkActions(false);

    const newStatus = companyStatuses.find((s) => s.code === newStatusCode);
    console.log(
      `Bulk updated ${selectedTasks.length} tasks to ${newStatus.label} by ${currentUser.name}`
    );
  };

  // Handle task selection
  const handleTaskSelection = (taskId, isSelected) => {
    toggleTaskSelection(taskId);
  };

  // Handle select all
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedTasks(apiTasks.map((t) => t.id));
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

  // Handle task title editing with API update
  const handleTitleSave = async (taskId) => {
    if (
      editingTitle.trim() &&
      editingTitle !== apiTasks.find((t) => t.id === taskId)?.title
    ) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `/api/tasks/${taskId}`,
          { title: editingTitle.trim() },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Update local state
          setApiTasks((prev) =>
            prev.map((task) =>
              task.id === taskId
                ? { ...task, title: editingTitle.trim() }
                : task
            )
          );
          showToast("Task title updated successfully", "success");

          // Refetch to ensure sync
          await refetchTasks();
        } else {
          throw new Error(response.data.message || "Failed to update task");
        }
      } catch (error) {
        console.error("Error updating task title:", error);
        showToast(
          error.response?.data?.message || "Failed to update task title",
          "error"
        );
      }
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

  // Handle edit task with confirmation modal
  const handleEditTask = (task) => {
    setConfirmModal({
      isOpen: true,
      type: "edit",
      title: "Edit Task",
      message: `Do you want to edit the task "${task.title}"?`,
      onConfirm: () => {
        setEditingTask(task);
        setShowEditModal(true);
        setConfirmModal({
          isOpen: false,
          type: "",
          title: "",
          message: "",
          onConfirm: null,
          data: null,
        });
      },
      data: { task },
    });
  };

  // Handle save edited task with API update
  const handleSaveEditedTask = async (updatedTask) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/tasks/${updatedTask.id}`,
        updatedTask,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update local state
        setApiTasks((prev) =>
          prev.map((task) =>
            task.id === updatedTask.id ? { ...task, ...updatedTask } : task
          )
        );

        setShowEditModal(false);
        setEditingTask(null);
        showToast("Task updated successfully", "success");

        // Refetch to ensure sync
        await refetchTasks();
      } else {
        throw new Error(response.data.message || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showToast(
        error.response?.data?.message || "Failed to update task",
        "error"
      );
    }
  };

  const handleViewTask = (taskId) => {
    const task = apiTasks.find((t) => t.id === taskId);

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

  // Handle subtask deletion with confirmation
  const handleDeleteSubtask = (parentTaskId, subtaskId) => {
    console.log("🗑️ DELETE SUBTASK BUTTON CLICKED:", {
      parentTaskId,
      subtaskId,
    });

    const parentTask = apiTasks.find(
      (t) => t.id === parentTaskId || t._id === parentTaskId
    );
    console.log(
      "🔍 Found parent task:",
      parentTask
        ? { id: parentTask.id, _id: parentTask._id, title: parentTask.title }
        : "NOT FOUND"
    );

    const subtask = parentTask?.subtasks?.find(
      (s) => s.id === subtaskId || s._id === subtaskId
    );
    console.log(
      "🔍 Found subtask:",
      subtask
        ? { id: subtask.id, _id: subtask._id, title: subtask.title }
        : "NOT FOUND"
    );

    if (!subtask) {
      console.error("❌ Subtask not found:", {
        parentTaskId,
        subtaskId,
        parentTask: parentTask?.title,
      });
      showToast("Subtask not found", "error");
      return;
    }

    console.log("✅ Showing confirmation modal for subtask deletion");
    setConfirmModal({
      isOpen: true,
      type: "danger",
      title: "Delete Subtask",
      message: `Are you sure you want to delete the subtask "${subtask.title}"? This action cannot be undone.`,
      onConfirm: () => executeSubtaskDeletion(parentTaskId, subtaskId),
      data: { parentTaskId, subtaskId, subtask },
    });
  };

  // Execute subtask deletion
  const executeSubtaskDeletion = async (parentTaskId, subtaskId) => {
    try {
      const parentTask = apiTasks.find((t) => t.id === parentTaskId);
      const subtask = parentTask?.subtasks?.find((s) => s.id === subtaskId);

      if (!parentTask || !subtask) {
        showToast("Subtask or parent task not found", "error");
        setConfirmModal({
          isOpen: false,
          type: "",
          title: "",
          message: "",
          onConfirm: null,
          data: null,
        });
        return;
      }

      // Use the correct ID format for API call - prefer _id (MongoDB ObjectId) if available
      const apiParentTaskId = parentTask._id || parentTask.id;
      const apiSubtaskId = subtask._id || subtask.id;

      console.log("🗑️ Deleting subtask with IDs:", {
        parentTaskId: apiParentTaskId,
        subtaskId: apiSubtaskId,
        originalParentId: parentTaskId,
        originalSubtaskId: subtaskId,
      });

      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/tasks/${apiParentTaskId}/subtasks/${apiSubtaskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🌐 Subtask delete API response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Subtask delete API response:", result);

        if (result.success) {
          // Update local state - remove subtask from parent task
          setApiTasks((prev) =>
            prev.map((task) =>
              task.id === parentTaskId || task._id === parentTaskId
                ? {
                    ...task,
                    subtasks:
                      task.subtasks?.filter(
                        (s) => s.id !== subtaskId && s._id !== subtaskId
                      ) || [],
                  }
                : task
            )
          );

          setConfirmModal({
            isOpen: false,
            type: "",
            title: "",
            message: "",
            onConfirm: null,
            data: null,
          });
          showToast("Subtask deleted successfully", "success");

          // Refetch to ensure sync
          await refetchTasks();
        } else {
          throw new Error(result.message || "Failed to delete subtask");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("❌ Error deleting subtask:", error);
      showToast(error.message || "Failed to delete subtask", "error");
      setConfirmModal({
        isOpen: false,
        type: "",
        title: "",
        message: "",
        onConfirm: null,
        data: null,
      });
    }
  };

  // Handle subtask status change
  const handleSubtaskStatusChange = (parentTaskId, subtaskId, newStatus) => {
    // Find the subtask and update it
    setApiTasks((prev) =>
      prev.map((task) => {
        if (task.id === parentTaskId) {
          return {
            ...task,
            subtasks: task.subtasks?.map((subtask) =>
              subtask.id === subtaskId
                ? { ...subtask, status: newStatus }
                : subtask
            ),
          };
        }
        return task;
      })
    );

    // Also update the Zustand store if needed
    updateSubtask(parentTaskId, subtaskId, { status: newStatus });
  };

  const handleAddSubtask = (taskId) => {
    const task = apiTasks.find((t) => t.id === taskId);
    if (task) {
      openSubtaskDrawer(task);
    }
  };

  // Handle subtask edit
  const handleEditSubtask = (subtask) => {
    const task = apiTasks.find((t) =>
      t.subtasks?.some((s) => s.id === subtask.id || s._id === subtask._id)
    );
    if (task) {
      openSubtaskDrawer(task, subtask, "edit");
    }
  };

  // Handle subtask view - navigate to TaskDetail page
  const handleViewSubtask = (subtask) => {
    navigate(`/tasks/${subtask.id || subtask._id}`);
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

  // Handle creating new task with API integration
  const handleCreateApprovalTask = async (approvalTaskData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/tasks/create`,
        {
          title: approvalTaskData.title,
          description: approvalTaskData.description || "",
          priority: approvalTaskData.priority || "Medium",
          dueDate: approvalTaskData.dueDate,
          taskType: "approval",
          isApprovalTask: true,
          approvers: approvalTaskData.approvers || [],
          approvalMode: approvalTaskData.approvalMode || "any",
          tags: approvalTaskData.tags || [],
          colorCode: approvalTaskData.colorCode || "#ffffff",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setShowApprovalTaskModal(false);
        setSelectedDateForTask(null);
        showToast("Approval task created successfully", "success");

        // Refetch tasks to update the list
        await refetchTasks();
      } else {
        throw new Error(
          response.data.message || "Failed to create approval task"
        );
      }
    } catch (error) {
      console.error("Error creating approval task:", error);
      showToast(
        error.response?.data?.message || "Failed to create approval task",
        "error"
      );
    }
  };

  // Handle creating milestone with API integration
  const handleCreateMilestone = async (milestoneData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/tasks/create`,
        {
          title: milestoneData.title,
          description: milestoneData.description || "",
          priority: milestoneData.priority || "Medium",
          dueDate: milestoneData.dueDate || selectedDateForTask,
          taskType: "milestone",
          type: "milestone",
          isMilestone: true,
          milestoneType: milestoneData.milestoneType || "standalone",
          linkedTasks: milestoneData.linkedTasks || [],
          visibility: milestoneData.visibility || "private",
          tags: milestoneData.tags || [],
          colorCode: milestoneData.colorCode || "#ffffff",
          assignedTo: milestoneData.assigneeId,
          collaborators: milestoneData.collaborators || [],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setShowMilestoneModal(false);
        setSelectedDateForTask(null);
        showToast("Milestone created successfully", "success");

        // Refetch tasks to update the list
        await refetchTasks();
      } else {
        throw new Error(response.data.message || "Failed to create milestone");
      }
    } catch (error) {
      console.error("Error creating milestone:", error);
      showToast(
        error.response?.data?.message || "Failed to create milestone",
        "error"
      );
    }
  };

  // Handle task snooze with API integration
  const handleSnoozeTask = async (taskId, snoozeData = null) => {
    try {
      const task = apiTasks.find((t) => t.id === taskId || t._id === taskId);
      if (!task) {
        showToast("Task not found", "error");
        return;
      }

      console.log("DEBUG - Snooze task found:", {
        id: task.id,
        _id: task._id,
        title: task.title,
      });

      const token = localStorage.getItem("token");

      // Use the correct ID format for API call - prefer _id (MongoDB ObjectId) if available
      const apiTaskId = task._id || task.id;
      console.log("DEBUG - Using task ID for snooze API call:", apiTaskId);

      // Check if task is currently snoozed
      const isCurrentlySnoozing = task.isSnooze || snoozedTasks.has(taskId);

      if (isCurrentlySnoozing) {
        // Unsnooze task
        const response = await axios.patch(
          `/api/tasks/${apiTaskId}/unsnooze`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Update local state
          setApiTasks((prev) =>
            prev.map((t) =>
              t.id === taskId || t._id === taskId
                ? {
                    ...t,
                    isSnooze: false,
                    snoozeUntil: null,
                    snoozeReason: null,
                  }
                : t
            )
          );

          toggleSnoozeTask(taskId); // Update Zustand store
          showToast("Task unsnoozed successfully", "success");
          await refetchTasks(); // Refresh from server
        }
      } else {
        // Snooze task - if no snoozeData provided, use default (1 hour from now)
        const defaultSnoozeUntil = new Date();
        defaultSnoozeUntil.setHours(defaultSnoozeUntil.getHours() + 1);

        const snoozeUntil =
          snoozeData?.snoozeUntil || defaultSnoozeUntil.toISOString();
        const reason = snoozeData?.reason || "Task snoozed temporarily";

        console.log("DEBUG - Snooze request payload:", { snoozeUntil, reason });

        const response = await axios.patch(
          `/api/tasks/${apiTaskId}/snooze`,
          {
            snoozeUntil,
            reason,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Update local state
          setApiTasks((prev) =>
            prev.map((t) =>
              t.id === taskId || t._id === taskId
                ? {
                    ...t,
                    isSnooze: true,
                    snoozeUntil: snoozeUntil,
                    snoozeReason: reason,
                  }
                : t
            )
          );

          toggleSnoozeTask(taskId); // Update Zustand store
          showToast("Task snoozed successfully", "success");
          await refetchTasks(); // Refresh from server
        }
      }
    } catch (error) {
      console.error("Error handling task snooze:", error);
      showToast(
        error.response?.data?.message || "Failed to update snooze status",
        "error"
      );
    }
  };

  // Handle mark as risk with API integration
  const handleMarkAsRisk = async (taskId, riskData = null) => {
    try {
      const task = apiTasks.find((t) => t.id === taskId || t._id === taskId);
      if (!task) {
        showToast("Task not found", "error");
        return;
      }

      console.log("DEBUG - Risk task found:", {
        id: task.id,
        _id: task._id,
        title: task.title,
      });

      const token = localStorage.getItem("token");

      // Use the correct ID format for API call - prefer _id (MongoDB ObjectId) if available
      const apiTaskId = task._id || task.id;
      console.log("DEBUG - Using task ID for risk API call:", apiTaskId);

      // Check if task is currently marked as risk
      const isCurrentlyRisky = task.isRisk || riskyTasks.has(taskId);

      if (isCurrentlyRisky) {
        // Unmark as risk
        const response = await axios.patch(
          `/api/tasks/${apiTaskId}/unmark-risk`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Update local state
          setApiTasks((prev) =>
            prev.map((t) =>
              t.id === taskId || t._id === taskId
                ? {
                    ...t,
                    isRisk: false,
                    riskLevel: null,
                    riskReason: null,
                  }
                : t
            )
          );

          toggleRiskyTask(taskId); // Update Zustand store
          showToast("Task risk status removed", "success");
          await refetchTasks(); // Refresh from server
        }
      } else {
        // Mark as risk
        const riskLevel = riskData?.riskLevel || "medium";
        const riskReason = riskData?.riskReason || "Task requires attention";

        console.log("DEBUG - Risk request payload:", { riskLevel, riskReason });

        const response = await axios.patch(
          `/api/tasks/${apiTaskId}/mark-risk`,
          {
            riskLevel,
            riskReason,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          // Update local state
          setApiTasks((prev) =>
            prev.map((t) =>
              t.id === taskId || t._id === taskId
                ? {
                    ...t,
                    isRisk: true,
                    riskLevel,
                    riskReason,
                  }
                : t
            )
          );

          toggleRiskyTask(taskId); // Update Zustand store
          showToast("Task marked as risky", "warning");
          await refetchTasks(); // Refresh from server
        }
      }
    } catch (error) {
      console.error("Error handling task risk status:", error);
      showToast(
        error.response?.data?.message || "Failed to update risk status",
        "error"
      );
    }
  };

  // Handle quick mark as done with API integration
  const handleQuickMarkAsDone = async (taskId, completionNotes = null) => {
    try {
      const task = apiTasks.find((t) => t.id === taskId || t._id === taskId);
      if (!task) {
        showToast("Task not found", "error");
        return;
      }

      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `/api/tasks/${taskId}/quick-done`,
        {
          completionNotes: completionNotes || `Task completed quickly by user`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update local state
        setApiTasks((prev) =>
          prev.map((t) =>
            t.id === taskId || t._id === taskId
              ? {
                  ...t,
                  status: "DONE",
                  completedDate: new Date().toISOString(),
                  completionNotes: completionNotes,
                }
              : t
          )
        );

        // Update Zustand store
        updateTaskStatus(taskId, "DONE");
        showToast("Task marked as completed successfully", "success");
        await refetchTasks(); // Refresh from server
      }
    } catch (error) {
      console.error("Error marking task as done:", error);
      showToast(
        error.response?.data?.message || "Failed to mark task as completed",
        "error"
      );
    }
  };

  // Apply filters to tasks
  const filteredTasks = apiTasks.filter((task) => {
    // Apply search filter with null checks
    const matchesSearch =
      !searchTerm ||
      (task.title &&
        task.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.assignee &&
        task.assignee.toLowerCase().includes(searchTerm.toLowerCase()));

    // Apply status filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "todo" && task.status === "OPEN") ||
      (statusFilter === "progress" && task.status === "INPROGRESS") ||
      (statusFilter === "review" && task.status === "ONHOLD") ||
      (statusFilter === "completed" && task.status === "DONE");

    // Apply priority filter with null check
    const matchesPriority =
      priorityFilter === "all" ||
      (task.priority &&
        priorityFilter &&
        task.priority.toLowerCase() === priorityFilter.toLowerCase());

    // Apply task type filter
    const taskType = getTaskType(task);
    const matchesTaskType =
      taskTypeFilter === "all" || taskType === taskTypeFilter;

    // Apply due date filter with enhanced recurring task logic
    const matchesDueDate = (() => {
      if (dueDateFilter === "all") return true;
      
      // 🔄 Enhanced Due Date Logic for Recurring Tasks
      const displayDueDate = getDisplayDueDate(task);
      
      if (!displayDueDate) {
        return dueDateFilter === "no_due_date";
      }

      const today = new Date();
      // Clear time part for accurate date comparison
      const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const dueDateOnly = new Date(displayDueDate.getFullYear(), displayDueDate.getMonth(), displayDueDate.getDate());
      
      const timeDiff = dueDateOnly.getTime() - todayDateOnly.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      switch (dueDateFilter) {
        case "overdue":
          // For recurring tasks, consider if current occurrence is overdue
          if (task.isRecurring) {
            // If task is completed, don't show as overdue
            if (task.status === 'DONE' || task.status === 'completed') {
              return false;
            }
            // Check if current due date is overdue
            return daysDiff < 0;
          }
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
            displayDueDate.toISOString().split('T')[0] === window.calendarSpecificDate.split('T')[0]
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

  // 🔄 Enhanced Recurring Task Helper Functions for Frontend Display
  
  





  // Check if recurring task has upcoming occurrence
  const hasUpcomingRecurrence = (task) => {
    if (!task.isRecurring || !task.nextDueDate) {
      return false;
    }
    
    const nextDue = new Date(task.nextDueDate);
    const now = new Date();
    
    return nextDue > now;
  };

  // Get recurring task status info for display
  const getRecurringTaskInfo = (task) => {
    if (!task.isRecurring) {
      return null;
    }

    const info = {
      isRecurring: true,
      frequency: task.recurrencePattern?.frequency || 'unknown',
      interval: task.recurrencePattern?.interval || 1,
      hasNextOccurrence: !!task.nextDueDate,
      nextDueDate: task.nextDueDate,
      isCompleted: task.status === 'DONE' || task.status === 'completed'
    };

    // Generate human-readable recurrence description
    const { frequency, interval } = info;
    let description = '';
    
    switch (frequency) {
      case 'daily':
        description = interval === 1 ? 'Daily' : `Every ${interval} days`;
        break;
      case 'weekly':
        description = interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
        break;
      case 'monthly':
        description = interval === 1 ? 'Monthly' : `Every ${interval} months`;
        break;
      case 'yearly':
        description = interval === 1 ? 'Yearly' : `Every ${interval} years`;
        break;
      case 'custom':
        description = 'Custom pattern';
        break;
      default:
        description = 'Recurring';
    }
    
    info.description = description;
    return info;
  };

  // Helper function to get task visual indicators
  const getTaskIndicators = (task) => {
    const status = getTaskStatus(task.id);
    const indicators = [];

    // 🔄 Recurring Task Indicators
    const recurringInfo = getRecurringTaskInfo(task);
    if (recurringInfo) {
      indicators.push({
        icon: "🔄",
        text: recurringInfo.description,
        className: "bg-purple-100 text-purple-800 border-purple-200",
      });

      // Show next occurrence info for active recurring tasks
      if (recurringInfo.hasNextOccurrence && !recurringInfo.isCompleted) {
        const nextDue = new Date(recurringInfo.nextDueDate);
        const today = new Date();
        const daysDiff = Math.ceil((nextDue.getTime() - today.getTime()) / (1000 * 3600 * 24));
        
        let nextText = 'Next: ';
        if (daysDiff === 0) {
          nextText += 'Today';
        } else if (daysDiff === 1) {
          nextText += 'Tomorrow';
        } else if (daysDiff > 0) {
          nextText += `${daysDiff} days`;
        } else {
          nextText += 'Overdue';
        }

        indicators.push({
          icon: "📅",
          text: nextText,
          className: daysDiff < 0 
            ? "bg-red-100 text-red-800 border-red-200"
            : daysDiff <= 1
            ? "bg-orange-100 text-orange-800 border-orange-200" 
            : "bg-blue-100 text-blue-800 border-blue-200",
        });
      }
    }

    // Enhanced overdue check with recurring task logic
    const displayDueDate = getDisplayDueDate(task);
    if (displayDueDate) {
      const today = new Date();
      const isOverdue = displayDueDate < today && (task.status !== 'DONE' && task.status !== 'completed');
      
      if (isOverdue) {
        indicators.push({
          icon: "🔴",
          text: "Overdue",
          className: "bg-red-100 text-red-800 border-red-200",
        });
      }
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

  // 🔄 Enhanced Due Date Formatting for Display
  const formatTaskDueDate = (task) => {
    console.log('🔍 DEBUG - formatTaskDueDate called for task:', {
      taskId: task.id || task._id,
      title: task.title,
      isRecurring: task.isRecurring,
      taskType: task.taskType,
      dueDate: task.dueDate,
      nextDueDate: task.nextDueDate
    });
    
    const displayDueDate = getDisplayDueDate(task);
    
    console.log('🔍 DEBUG - formatTaskDueDate displayDueDate result:', displayDueDate);
    
    if (!displayDueDate) {
      console.log('🔍 DEBUG - No display due date, returning default');
      return {
        formatted: 'No due date',
        isOverdue: false,
        className: 'text-gray-500'
      };
    }

    const today = new Date();
    const dueDateOnly = new Date(displayDueDate.getFullYear(), displayDueDate.getMonth(), displayDueDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const daysDiff = Math.ceil((dueDateOnly.getTime() - todayOnly.getTime()) / (1000 * 3600 * 24));
    const isCompleted = task.status === 'DONE' || task.status === 'completed';
    const isOverdue = daysDiff < 0 && !isCompleted;

    let formatted = displayDueDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: displayDueDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });

    // Add relative time info
    if (daysDiff === 0) {
      formatted += ' (Today)';
    } else if (daysDiff === 1) {
      formatted += ' (Tomorrow)';
    } else if (daysDiff === -1) {
      formatted += ' (Yesterday)';
    } else if (daysDiff > 1 && daysDiff <= 7) {
      formatted += ` (${daysDiff} days)`;
    } else if (daysDiff < -1 && daysDiff >= -7) {
      formatted += ` (${Math.abs(daysDiff)} days ago)`;
    }

    // Add recurring task context
    const recurringInfo = getRecurringTaskInfo(task);
    if (recurringInfo && recurringInfo.hasNextOccurrence && !recurringInfo.isCompleted) {
      if (task.nextDueDate && displayDueDate.getTime() === new Date(task.nextDueDate).getTime()) {
        formatted += ' 🔄';
      }
    }

    let className = '';
    if (isOverdue) {
      className = 'text-red-600 font-medium';
    } else if (daysDiff === 0) {
      className = 'text-orange-600 font-medium';
    } else if (daysDiff === 1) {
      className = 'text-yellow-600 font-medium';
    } else if (isCompleted) {
      className = 'text-green-600';
    } else {
      className = 'text-gray-700';
    }

    return {
      formatted,
      isOverdue,
      className,
      daysDiff,
      displayDueDate
    };
  };

  // Function to get task color code
  // Status color mapping for consistent colors across components
  const getStatusColor = (statusCode) => {
    // First try to get color from companyStatuses (dynamic from API)
    const statusObj = companyStatuses.find((s) => s.code === statusCode);
    if (statusObj && statusObj.color) {
      return statusObj.color;
    }

    // Fallback to hardcoded colors for backward compatibility
    const statusColorMap = {
      OPEN: "#3B82F6", // Blue
      INPROGRESS: "#F59E0B", // Yellow/Orange
      DONE: "#10B981", // Green
      COMPLETED: "#10B981", // Green
      ONHOLD: "#6B7280", // Gray
      CANCELLED: "#EF4444", // Red
      PENDING: "#F97316", // Orange
      APPROVED: "#059669", // Green
      REJECTED: "#DC2626", // Red
      REVIEW: "#8B5CF6", // Purple
      // Backend status codes
      open: "#3B82F6",
      "in-progress": "#F59E0B",
      completed: "#10B981",
      "on-hold": "#6B7280",
      cancelled: "#EF4444",
      pending: "#F97316",
      approved: "#059669",
      rejected: "#DC2626",
      review: "#8B5CF6",
    };

    return statusColorMap[statusCode] || "#6B7280"; // Default gray
  };

  const getTaskColorCode = (task) => {
    console.log("Getting color code for task::::::::::::::::::", task);

    // Priority: statusColor from API > status-based color > taskType color > default
    if (task.statusColor) {
      console.log("Using statusColor from API:", task.statusColor);
      return task.statusColor;
    }

    if (task.status) {
      const statusColor = getStatusColor(task.status);
      console.log(
        "Using status-based color:",
        statusColor,
        "for status:",
        task.status
      );
      return statusColor;
    }

    // Fallback to task type color
    const taskInfo = getTaskTypeInfo(task.taskType);
    const fallbackColor = task.colorCode || taskInfo.defaultColor || "#6B7280";
    console.log("Using fallback color:", fallbackColor);
    return fallbackColor;
  };

  // Smart task handlers
  const handleOpenThread = (task) => {
    setSelectedTaskForThread(task);
    setShowThreadModal(true);
  };

  const handleSmartTaskCreated = (newTask) => {
    refetchTasks(); // Refresh tasks list
    setToast({
      message: "Task created successfully with smart parsing!",
      type: "success",
      isVisible: true,
    });
  };

  // Task modal handlers
  const handleTaskCreated = async (newTask) => {
    try {
      setShowCreateTaskDrawer(false);
      setSelectedDateForTask(null);
      showToast("Task created successfully", "success");
      await refetchTasks();
    } catch (error) {
      console.error("Error after task creation:", error);
      showToast("Task created but failed to refresh list", "warning");
    }
  };

  const handleTaskUpdate = async (updatedTask) => {
    try {
      setSelectedTask(updatedTask);
      showToast("Task updated successfully", "success");
      await refetchTasks();
    } catch (error) {
      console.error("Error after task update:", error);
      showToast("Task updated but failed to refresh", "warning");
    }
  };

  const handleTaskUpdated = async (updatedTask) => {
    try {
      setShowEditTaskModal(false);
      setEditingTask(null);
      showToast("Task updated successfully", "success");
      await refetchTasks();
    } catch (error) {
      console.error("Error after task update:", error);
      showToast("Task updated but failed to refresh", "warning");
    }
  };

  // Milestone-specific handlers
  const handleMilestoneUpdate = async (milestoneId, updateData) => {
    try {
      console.log("Updating milestone:", milestoneId, updateData);
      await updateMilestone(milestoneId, updateData);
      showToast("Milestone updated successfully", "success");
      await refetchTasks(); // Refresh the task list
    } catch (error) {
      console.error("Error updating milestone:", error);
      showToast(
        "Failed to update milestone: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    }
  };

  const handleMilestoneDelete = async (milestoneId) => {
    try {
      console.log("Deleting milestone:", milestoneId);
      await deleteMilestone(milestoneId);
      showToast("Milestone deleted successfully", "success");
      await refetchTasks(); // Refresh the task list
    } catch (error) {
      console.error("Error deleting milestone:", error);
      showToast(
        "Failed to delete milestone: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    }
  };

  const handleMilestoneAchieved = async (milestoneId) => {
    try {
      console.log("Marking milestone as achieved:", milestoneId);
      await markMilestoneAsAchieved(milestoneId);
      showToast("Milestone marked as achieved!", "success");
      await refetchTasks(); // Refresh the task list
    } catch (error) {
      console.error("Error marking milestone as achieved:", error);
      showToast(
        "Failed to mark milestone as achieved: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    }
  };

  const handleLinkTaskToMilestone = async (milestoneId, taskData) => {
    try {
      console.log("Linking task to milestone:", milestoneId, taskData);
      await linkTaskToMilestone(milestoneId, taskData);
      showToast("Task linked to milestone successfully", "success");
      await refetchTasks(); // Refresh the task list
    } catch (error) {
      console.error("Error linking task to milestone:", error);
      showToast(
        "Failed to link task to milestone: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    }
  };

  const handleUnlinkTaskFromMilestone = async (milestoneId, taskId) => {
    try {
      console.log("Unlinking task from milestone:", milestoneId, taskId);
      await unlinkTaskFromMilestone(milestoneId, taskId);
      showToast("Task unlinked from milestone successfully", "success");
      await refetchTasks(); // Refresh the task list
    } catch (error) {
      console.error("Error unlinking task from milestone:", error);
      showToast(
        "Failed to unlink task from milestone: " +
          (error.response?.data?.message || error.message),
        "error"
      );
    }
  };

  return (
    <div className="space-y-4 p-6 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
          <p className="mt-0 text-lg text-gray-600">
            Manage and track all your tasks
          </p>
        </div>
        <div className="mt-3 lg:mt-0 flex flex-col sm:flex-row gap-2 flex-wrap">
          <button
            onClick={() => setShowSnooze(!showSnooze)}
            className={`btn  ${
              showSnooze ? "btn-primary hover:text-white-700 " : "btn-secondary hover:text-purple-700"
            } whitespace-nowrap`}
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
              showCalendarView ? "btn-primary hover:text-white-700 " : "btn-secondary hover:text-purple-700"
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
              className="btn btn-secondary hover:text-purple-700 ml-2 whitespace-nowrap"
              onClick={() => setShowSmartParser(!showSmartParser)}
              title="Smart Task Parser - Create tasks from natural language"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Smart Parse
            </button>
            {/* <button
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
            </button> */}

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
      <div className="flex flex-nowrap bg-white mb-4 gap-2">
        {/* Search Bar */}

        {/* Filters */}
        <div className="scroll-container flex flex-nowrap items-center overflow-x-auto gap-2 scrollbar-hide">
          <div className="relative w-50 max-w-md min-w-[170px]">
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
              className="w-full pl-10 pr-3 h-30 p-1 text-md border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="min-w-[180px]"
             size="small"
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
            className="min-w-[180px]"
            size="small"
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
            className="min-w-[210px]"
             size="small"
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
                        window.calendarSpecificDate
                      ).toLocaleDateString()}`,
                    },
                  ]
                : []),
            ]}
            placeholder="Filter by Due Date"
            className="min-w-[200px]"
             size="small"
          />

          <SearchableSelect
            placeholder="All Categories"
            className="min-w-[170px]"
             size="small"
          />
        </div>

        {/* Export Options */}
        <div className="flex justify-end gap-2">
          <button className=" btn-md flex ">
            <img
              src="/src/assets/images/csv-export (2).png"
              alt="CSV"
              className="min-w-9 w-9 h-10"
              onError={(e) => {
                // Fallback to text if image not found
                e.target.style.display = "none";
              }}
            />
            {/* <span>Export as CSV</span> */}
          </button>
          <button className=" btn-md flex ">
            <img
              src="/src/assets/images/export-excel.png"
              alt="Excel"
              className="min-w-10 w-10 h-10"
              onError={(e) => {
                // Fallback to text if image not found
                e.target.style.display = "none";
              }}
            />
            {/* <span>Export as Excel</span> */}
          </button>
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
                      ? `Date: ${new Date(
                          window.calendarSpecificDate
                        ).toLocaleDateString()}`
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

      {/* Tasks Table */}
      {apiLoading ? (
        <div className="flex justify-center items-center py-10">
          <span className="text-lg text-gray-500">Loading tasks...</span>
        </div>
      ) : apiError ? (
        <div className="flex justify-center items-center py-10">
          <span className="text-lg text-red-500">{apiError}</span>
        </div>
      ) : (
        <div className="card p-0">
          <div className="w-full overflow-x-auto scroll-container scrollbar-hide">
            <Table
              wrapperClassName="max-w-[80rem]"
              className="w-full scroll-container scrollbar-hide"
            >
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 text-nowrap">
                    <input
                      type="checkbox"
                      checked={
                        selectedTasks.length === apiTasks.length &&
                        apiTasks.length > 0
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
                {apiLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-gray-500">Loading tasks...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : apiError ? (
                  <TableRow>
                    <TableCell colSpan={10} className="px-6 py-8 text-center">
                      <div className="text-red-500">
                        <svg
                          className="mx-auto h-12 w-12 text-red-400 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.732 16.5c-.77.833-.23 2.5 1.732 2.5z"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          Error loading tasks
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{apiError}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                        <h3 className="text-lg font-medium mb-2">
                          No tasks found
                        </h3>
                        <p className="text-sm mb-4">
                          {apiTasks.length === 0
                            ? "You don't have any tasks assigned yet."
                            : "No tasks match your current filters."}
                        </p>
                        {apiTasks.length === 0 && (
                          <button
                            onClick={() => setShowCreateTaskDrawer(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                            Create your first task
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <React.Fragment key={task.id}>
                      <TableRow
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedTasks.includes(task.id) ? "bg-blue-50" : ""
                        }`}
                        style={{
                          borderLeft: `4px solid ${getTaskColorCode(task)}`,
                        }}
                      >
                        <TableCell className="px-6 py-4 text-nowrap rounded-[inherit]">
                          <div className="w-full h-full flex items-center justify-center overflow-hidden">
                            <input
                              type="checkbox"
                              checked={selectedTasks.includes(task.id)}
                              onChange={(e) =>
                                handleTaskSelection(task.id, e.target.checked)
                              }
                              className="w-4 h-4 rounded-[inherit] border-gray-300 text-blue-600 focus:ring-blue-500 overflow-hidden"
                            />
                          </div>
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
                                      <circle
                                        cx="5"
                                        cy="5"
                                        r="2"
                                        fill="currentColor"
                                      />
                                      <circle
                                        cx="5"
                                        cy="12"
                                        r="2"
                                        fill="currentColor"
                                      />
                                      <circle
                                        cx="5"
                                        cy="19"
                                        r="2"
                                        fill="currentColor"
                                      />
                                      <path
                                        d="M5 7V10"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      />
                                      <path
                                        d="M5 14V17"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      />
                                      <path
                                        d="M7 12H14"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      />
                                      <path
                                        d="M7 19H14"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                      />
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
                                    {task.taskType === "milestone" && (
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
                                      {(riskyTasks.has(task.id) ||
                                        task.isRisk) && (
                                        <span
                                          className="ml-2 text-orange-500"
                                          title={`Risky Task${
                                            task.riskLevel
                                              ? ` (${task.riskLevel})`
                                              : ""
                                          }${
                                            task.riskReason
                                              ? `: ${task.riskReason}`
                                              : ""
                                          }`}
                                        >
                                          ⚠️
                                        </span>
                                      )}
                                      {(snoozedTasks.has(task.id) ||
                                        task.isSnooze) && (
                                        <span
                                          className="ml-2 text-yellow-500"
                                          title={`Snoozed Task${
                                            task.snoozeUntil
                                              ? ` until ${new Date(
                                                  task.snoozeUntil
                                                ).toLocaleString()}`
                                              : ""
                                          }${
                                            task.snoozeReason
                                              ? `: ${task.snoozeReason}`
                                              : ""
                                          }`}
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
                                            `View master task ${task.recurringFromTaskId}`
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
                                {(task.assignee &&
                                  task.assignee
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")) ||
                                  "UN"}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900">
                              {task.assignee || "Unassigned"}
                            </span>
                            {task?.assignedTo?.status === "inactive" && (
                              <span className="inline-flex items-center mx-2 px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-nowrap text-left">
                          <TaskStatusDropdown
                            task={task}
                            currentStatus={task.status}
                            statuses={companyStatuses}
                            onStatusChange={(newStatus) => {
                              // Only require confirmation for final statuses
                              const statusObj = companyStatuses.find(
                                (s) => s.code === newStatus
                              );
                              const requiresConfirmation =
                                statusObj?.isFinal || false;

                              console.log(
                                "🎯 TaskStatusDropdown - Status change requested:",
                                {
                                  taskId: task.id,
                                  currentStatus: task.status,
                                  newStatus,
                                  isFinal: statusObj?.isFinal,
                                  requiresConfirmation,
                                }
                              );

                              handleStatusChange(
                                task.id,
                                newStatus,
                                requiresConfirmation
                              );
                            }}
                            canEdit={canEditTaskStatus(task)}
                            canMarkCompleted={canMarkAsCompleted(task)}
                          />
                        </TableCell>
                        <TableCell className="px-6 py-4 text-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 uppercase text-gray-900">
                            {task.priority}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-gray-900 text-nowrap">
                          {(() => {
                            // 🔄 Enhanced Due Date Display with Recurring Task Support
                            const dueDateInfo = formatTaskDueDate(task);
                            console.log('🔍 DEBUG - Table Due Date:', {
                              taskId: task.id || task._id,
                              taskTitle: task.title,
                              isRecurring: task.isRecurring,
                              originalDueDate: task.dueDate,
                              nextDueDate: task.nextDueDate,
                              formattedDate: dueDateInfo.formatted,
                              displayDueDate: dueDateInfo.displayDueDate
                            });
                            return (
                              <span className={dueDateInfo.className}>
                                {dueDateInfo.formatted}
                              </span>
                            );
                          })()}
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
                          <div className="flex items-center justify-center gap-2">
                            {/* <button
                            onClick={() => handleOpenThread(task)}
                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                            title="Open task thread"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button> */}
                            <TaskActionsDropdown
                              task={task}
                              onSnooze={() => handleSnoozeTask(task.id)}
                              onMarkAsRisk={() => handleMarkAsRisk(task.id)}
                              onMarkAsDone={() => {
                                // DONE is a final status, so require confirmation
                                const statusObj = companyStatuses.find(
                                  (s) => s.code === "DONE"
                                );
                                const requiresConfirmation =
                                  statusObj?.isFinal || true;

                                console.log(
                                  "🎯 TaskActionsDropdown - Mark as Done clicked:",
                                  {
                                    taskId: task.id,
                                    requiresConfirmation,
                                  }
                                );

                                handleStatusChange(
                                  task.id,
                                  "DONE",
                                  requiresConfirmation
                                );
                              }}
                              onQuickMarkAsDone={() =>
                                handleQuickMarkAsDone(task.id)
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
                                {editingSubtaskId ===
                                (subtask._id || subtask.id) ? (
                                  <input
                                    type="text"
                                    value={editingSubtaskTitle}
                                    onChange={(e) =>
                                      setEditingSubtaskTitle(e.target.value)
                                    }
                                    onBlur={() =>
                                      handleSubtaskTitleSave(
                                        subtask._id || subtask.id,
                                        task._id || task.id
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      handleSubtaskTitleKeyDown(
                                        e,
                                        subtask._id || subtask.id,
                                        task._id || task.id
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
                                      handleSubtaskTitleClick(
                                        subtask,
                                        task._id || task.id
                                      )
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
                                    {(subtask.assignee &&
                                      subtask.assignee
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")) ||
                                      "UN"}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-700">
                                  {subtask.assignee || "Unassigned"}
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
                                    newStatus
                                  )
                                }
                                canEdit={canEditTaskStatus(subtask)}
                                canMarkCompleted={true}
                              />
                            </TableCell>
                            <TableCell className="px-6 py-3">
                              <span
                                className={getPriorityBadge(subtask.priority)}
                              >
                                {subtask.priority}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-3 text-sm text-gray-700">
                              {(() => {
                                // 🔄 Enhanced Subtask Due Date Display
                                const dueDateInfo = formatTaskDueDate(subtask);
                                console.log('🔍 DEBUG - Subtask Due Date:', {
                                  subtaskId: subtask.id || subtask._id,
                                  subtaskTitle: subtask.title,
                                  isRecurring: subtask.isRecurring,
                                  originalDueDate: subtask.dueDate,
                                  nextDueDate: subtask.nextDueDate,
                                  formattedDate: dueDateInfo.formatted
                                });
                                return (
                                  <span className={dueDateInfo.className}>
                                    {dueDateInfo.formatted}
                                  </span>
                                );
                              })()}
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
                                    handleDeleteSubtask(
                                      task._id || task.id,
                                      subtask._id || subtask.id
                                    )
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}

      {/* Slide-in Drawer */}
      {showCreateTaskDrawer && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCreateTaskDrawer(false)}
          ></div>
          <div
            className="absolute right-0 top-0 h-full bg-white flex flex-col shadow-xl"
            style={{
              width: "min(90vw, 600px)",
              maxHeight: "100vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-blue-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  Create New Task
                  {selectedDateForTask &&
                    ` for ${new Date(selectedDateForTask).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}`}
                </h2>
                <button
                  onClick={() => setShowCreateTaskDrawer(false)}
                  className="text-white hover:text-gray-200 p-1"
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
            </div>
            <div className="flex-1 overflow-y-auto">
              <CreateTask
                onSubmit={handleTaskCreated}
                onClose={() => setShowCreateTaskDrawer(false)}
                preFilledDate={selectedDateForTask}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showTaskDetails && selectedTask && (
        <div
          className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40 "
            onClick={() => setShowTaskDetails(false)}
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
              <h2 className="text-2xl font-bold text-white">Task Details</h2>
              <button
                onClick={() => setShowTaskDetails(false)}
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
            <div className="drawer-content">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Task Details</h3>
                {selectedTask && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedTask.title}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedTask.status}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Assignee
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedTask.assignee}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Due Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedTask.dueDate || "No due date"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditTaskModal && editingTask && (
        <div
          className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40 "
            onClick={() => setShowEditTaskModal(false)}
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
              <h2 className="text-2xl font-bold text-white">Edit Task</h2>
              <button
                onClick={() => setShowEditTaskModal(false)}
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
            <div className="drawer-content">
              <TaskEditModal
                task={editingTask}
                onSave={handleTaskUpdated}
                onClose={() => setShowEditTaskModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {showStatusConfirmation && (
        <StatusConfirmationModal
          isOpen={!!showStatusConfirmation}
          taskTitle={showStatusConfirmation.taskTitle}
          statusLabel={showStatusConfirmation.statusLabel}
          onConfirm={(reason) => {
            console.log("🎯 Status confirmation - CONFIRMED:", {
              taskId: showStatusConfirmation.taskId,
              newStatusCode: showStatusConfirmation.newStatusCode,
              reason,
              timestamp: new Date().toISOString(),
            });

            // Find the task and execute status change
            const task = apiTasks.find(
              (t) =>
                t._id === showStatusConfirmation.taskId ||
                t.id === showStatusConfirmation.taskId
            );

            if (task) {
              console.log("🔧 Executing status change after confirmation...");
              executeStatusChange(
                task,
                showStatusConfirmation.newStatusCode,
                reason
              );
            } else {
              console.error(
                "❌ Task not found for status confirmation:",
                showStatusConfirmation.taskId
              );
            }

            setShowStatusConfirmation(null);
          }}
          onCancel={() => {
            console.log("❌ Status confirmation - CANCELLED");
            setShowStatusConfirmation(null);
          }}
        />
      )}

      {/* Calendar Modal for Date Selection */}
      {showCalendarModal && (
        <div
          className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCalendarModal(false)}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Select Date for Task
                </h2>
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="text-gray-400 hover:text-gray-600"
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

              <CalendarDatePicker
                selectedDate={selectedDateForTask}
                onDateSelect={handleCalendarDateSelect}
                onClose={() => setShowCalendarModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <CustomConfirmationModal
          isOpen={confirmModal.isOpen}
          type={confirmModal.type}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() =>
            setConfirmModal({
              isOpen: false,
              type: "",
              title: "",
              message: "",
              onConfirm: null,
              data: null,
            })
          }
        />
      )}

      {/* Toast Notifications */}
      {toast.isVisible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      )}
    </div>
  );
}
