import { create } from "zustand";

const createNotification = (type, taskId, taskTitle, options = {}) => ({
  id: Date.now() + Math.random(),
  type,
  taskId,
  taskTitle,
  message: options.message || `Notification for task "${taskTitle}"`,
  timestamp: new Date().toISOString(),
  read: false,
  ...options,
});

const scheduleReminder = (task, type, daysBefore) => {
  const dueDate = new Date(task.dueDate);
  const reminderDate = new Date(
    dueDate.setDate(dueDate.getDate() - daysBefore),
  );
  const message = `Reminder: Task "${task.title}" due in ${daysBefore} days`;

  return {
    id: Date.now() + Math.random(),
    taskId: task.id,
    type,
    scheduledFor: reminderDate.toISOString(),
    message,
    active: true,
  };
};

const useTasksStore = create((set, get) => ({
  // Notifications and reminders
  notifications: [],
  reminders: [],
  notificationSettings: {
    taskAssignment: true,
    dueDateReminders: true,
    overdueReminders: true,
    commentMentions: true,
    statusChanges: true,
    customReminders: true,
    snoozeWakeup: true,
    reminderDays: [3, 1], // Days before due date
    deliveryMethod: "both", // 'app', 'email', 'both'
    quietHours: { enabled: false, start: "22:00", end: "08:00" },
    doNotDisturb: false,
  },

  quickTasks: [],
  quickTaskSettings: {
    autoArchiveDays: 7, // Configurable archival period
  },
  tasks: [
    {
      id: 1,
      title: "Update user authentication system",
      assignee: "John Doe",
      assigneeId: 2,
      status: "INPROGRESS",
      priority: "High",
      dueDate: "2024-01-25",
      taskType: "regular",
      tags: ["security", "authentication", "backend"],
      colorCode: "#3B82F6",
      progress: 60,
      subtaskCount: 3,
      collaborators: [1, 3],
      createdBy: "Current User",
      creatorId: 1,
      isRecurring: false,
      subtasks: [
        {
          id: 101,
          title: "Setup OAuth providers",
          assignee: "John Doe",
          assigneeId: 2,
          status: "DONE",
          priority: "High",
          dueDate: "2024-01-22",
          progress: 100,
          parentTaskId: 1,
          createdBy: "Current User",
          createdAt: "2024-01-15T09:00:00Z",
        },
        {
          id: 102,
          title: "Implement session management",
          assignee: "Jane Smith",
          assigneeId: 3,
          status: "INPROGRESS",
          priority: "High",
          dueDate: "2024-01-24",
          progress: 75,
          parentTaskId: 1,
          createdBy: "Current User",
          createdAt: "2024-01-16T10:00:00Z",
        },
        {
          id: 103,
          title: "Add password reset flow",
          assignee: "Mike Johnson",
          assigneeId: 4,
          status: "OPEN",
          priority: "Medium",
          dueDate: "2024-01-26",
          progress: 0,
          parentTaskId: 1,
          createdBy: "Current User",
          createdAt: "2024-01-17T11:00:00Z",
        },
      ],
    },
    {
      id: 2,
      title: "Design new landing page",
      assignee: "Jane Smith",
      assigneeId: 3,
      status: "OPEN",
      priority: "Medium",
      dueDate: "2024-01-30",
      taskType: "regular",
      tags: ["design", "ui", "frontend"],
      colorCode: "#10B981",
      progress: 0,
      subtaskCount: 0,
      collaborators: [],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
    {
      id: 3,
      title: "Fix mobile responsiveness issues",
      assignee: "Mike Johnson",
      assigneeId: 4,
      status: "DONE",
      priority: "Low",
      dueDate: "2024-01-20",
      taskType: "regular",
      tags: ["bug", "mobile", "responsive"],
      colorCode: "#6B7280",
      progress: 100,
      subtaskCount: 2,
      collaborators: [1],
      createdBy: "Jane Smith",
      creatorId: 3,
      subtasks: [
        {
          id: 201,
          title: "Fix header layout",
          status: "DONE",
          assignee: "Mike Johnson",
          assigneeId: 4,
          priority: "Medium",
          dueDate: "2024-01-18",
          progress: 100,
          parentTaskId: 3,
          createdBy: "Jane Smith",
          createdAt: "2024-01-15T10:00:00Z",
        },
        {
          id: 202,
          title: "Update mobile styles",
          status: "DONE",
          assignee: "Mike Johnson",
          assigneeId: 4,
          priority: "Medium",
          dueDate: "2024-01-19",
          progress: 100,
          parentTaskId: 3,
          createdBy: "Jane Smith",
          createdAt: "2024-01-15T11:00:00Z",
        },
      ],
    },
    {
      id: 4,
      title: "Conduct user research interviews",
      assignee: "Sarah Wilson",
      assigneeId: 5,
      status: "INPROGRESS",
      priority: "High",
      dueDate: "2024-01-28",
      taskType: "milestone",
      tags: ["research", "ux", "interviews"],
      colorCode: "#8B5CF6",
      progress: 80,
      subtaskCount: 3,
      collaborators: [1, 2],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [
        {
          id: 301,
          title: "Prepare interview questions",
          assignee: "Sarah Wilson",
          assigneeId: 5,
          status: "DONE",
          priority: "High",
          dueDate: "2024-01-25",
          progress: 100,
          parentTaskId: 4,
          createdBy: "Current User",
          createdAt: "2024-01-20T09:00:00Z",
        },
        {
          id: 302,
          title: "Schedule participant sessions",
          assignee: "Emily Davis",
          assigneeId: 6,
          status: "INPROGRESS",
          priority: "Medium",
          dueDate: "2024-01-27",
          progress: 60,
          parentTaskId: 4,
          createdBy: "Sarah Wilson",
          createdAt: "2024-01-21T10:00:00Z",
        },
        {
          id: 303,
          title: "Analyze interview data",
          assignee: "Sarah Wilson",
          assigneeId: 5,
          status: "OPEN",
          priority: "High",
          dueDate: "2024-01-30",
          progress: 0,
          parentTaskId: 4,
          createdBy: "Current User",
          createdAt: "2024-01-22T11:00:00Z",
        },
      ],
    },
    {
      id: 5,
      title: "Review Q1 Budget Analysis",
      assignee: "John Manager",
      assigneeId: 7,
      status: "OPEN",
      priority: "High",
      dueDate: "2025-01-25",
      taskType: "approval",
      tags: ["finance", "budget", "review"],
      colorCode: "#F59E0B",
      progress: 0,
      subtaskCount: 0,
      collaborators: [1, 2],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
    {
      id: 6,
      title: "Update Marketing Campaign",
      assignee: "Emma Roberts",
      assigneeId: 8,
      status: "INPROGRESS",
      priority: "Medium",
      dueDate: "2025-01-26",
      taskType: "regular",
      tags: ["marketing", "campaign", "social"],
      colorCode: "#EF4444",
      progress: 45,
      subtaskCount: 0,
      collaborators: [3],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
    {
      id: 7,
      title: "Client Presentation Prep",
      assignee: "Alex Smith",
      assigneeId: 9,
      status: "OPEN",
      priority: "Urgent",
      dueDate: "2025-01-27",
      taskType: "milestone",
      tags: ["presentation", "client", "demo"],
      colorCode: "#DC2626",
      progress: 0,
      subtaskCount: 2,
      collaborators: [1, 4],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [
        {
          id: 401,
          title: "Create slide deck",
          assignee: "Alex Smith",
          assigneeId: 9,
          status: "OPEN",
          priority: "High",
          dueDate: "2025-01-26",
          progress: 0,
          parentTaskId: 7,
          createdBy: "Current User",
          createdAt: "2025-01-20T10:00:00Z",
        },
        {
          id: 402,
          title: "Prepare demo environment",
          assignee: "Alex Smith",
          assigneeId: 9,
          status: "OPEN",
          priority: "Medium",
          dueDate: "2025-01-27",
          progress: 0,
          parentTaskId: 7,
          createdBy: "Current User",
          createdAt: "2025-01-20T11:00:00Z",
        },
      ],
    },
    {
      id: 8,
      title: "Database Migration",
      assignee: "Mike Tech",
      assigneeId: 10,
      status: "OPEN",
      priority: "High",
      dueDate: "2025-01-28",
      taskType: "regular",
      tags: ["database", "migration", "backend"],
      colorCode: "#059669",
      progress: 0,
      subtaskCount: 0,
      collaborators: [2],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
    {
      id: 9,
      title: "Team Performance Review",
      assignee: "HR Manager",
      assigneeId: 11,
      status: "INPROGRESS",
      priority: "Medium",
      dueDate: "2025-01-29",
      taskType: "approval",
      tags: ["hr", "performance", "review"],
      colorCode: "#D97706",
      progress: 30,
      subtaskCount: 0,
      collaborators: [1],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
    {
      id: 10,
      title: "Security Audit Report",
      assignee: "Security Team",
      assigneeId: 12,
      status: "OPEN",
      priority: "High",
      dueDate: "2025-01-30",
      taskType: "approval",
      tags: ["security", "audit", "compliance"],
      colorCode: "#B91C1C",
      progress: 0,
      subtaskCount: 0,
      collaborators: [1, 5],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
    {
      id: 11,
      title: "Mobile App Testing",
      assignee: "QA Team",
      assigneeId: 13,
      status: "INPROGRESS",
      priority: "Medium",
      dueDate: "2025-02-01",
      taskType: "regular",
      tags: ["testing", "mobile", "qa"],
      colorCode: "#7C3AED",
      progress: 60,
      subtaskCount: 0,
      collaborators: [2, 3],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
    {
      id: 12,
      title: "Product Launch Planning",
      assignee: "Product Manager",
      assigneeId: 14,
      status: "OPEN",
      priority: "Urgent",
      dueDate: "2025-02-03",
      taskType: "milestone",
      tags: ["product", "launch", "planning"],
      colorCode: "#DC2626",
      progress: 0,
      subtaskCount: 3,
      collaborators: [1, 2, 3, 4],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [
        {
          id: 501,
          title: "Market research analysis",
          assignee: "Product Manager",
          assigneeId: 14,
          status: "OPEN",
          priority: "High",
          dueDate: "2025-02-01",
          progress: 0,
          parentTaskId: 12,
          createdBy: "Current User",
          createdAt: "2025-01-20T12:00:00Z",
        },
        {
          id: 502,
          title: "Create go-to-market strategy",
          assignee: "Marketing Lead",
          assigneeId: 15,
          status: "OPEN",
          priority: "High",
          dueDate: "2025-02-02",
          progress: 0,
          parentTaskId: 12,
          createdBy: "Current User",
          createdAt: "2025-01-20T13:00:00Z",
        },
        {
          id: 503,
          title: "Setup analytics tracking",
          assignee: "Dev Team",
          assigneeId: 16,
          status: "OPEN",
          priority: "Medium",
          dueDate: "2025-02-03",
          progress: 0,
          parentTaskId: 12,
          createdBy: "Current User",
          createdAt: "2025-01-20T14:00:00Z",
        },
      ],
    },
    // Additional tasks for specific dates (Aug 5th and 10th)
    {
      id: 13,
      title: "Company Policy Review",
      assignee: "Event Team",
      assigneeId: 17,
      status: "OPEN",
      priority: "Medium",
      dueDate: "2025-08-05",
      taskType: "approval",
      tags: ["policy", "compliance", "review"],
      colorCode: "#F59E0B",
      progress: 0,
      subtaskCount: 0,
      collaborators: [1, 2],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
    {
      id: 14,
      title: "Workspace Organization",
      assignee: "Admin Team",
      assigneeId: 18,
      status: "OPEN",
      priority: "Low",
      dueDate: "2025-08-05",
      taskType: "regular",
      tags: ["organization", "workspace", "admin"],
      colorCode: "#6B7280",
      progress: 0,
      subtaskCount: 0,
      collaborators: [3],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
    {
      id: 15,
      title: "Employee Skill Assessment",
      assignee: "HR Team",
      assigneeId: 19,
      status: "INPROGRESS",
      priority: "Medium",
      dueDate: "2025-08-05",
      taskType: "milestone",
      tags: ["hr", "assessment", "skills"],
      colorCode: "#8B5CF6",
      progress: 25,
      subtaskCount: 0,
      collaborators: [1, 4],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
    {
      id: 16,
      title: "System Backup Verification",
      assignee: "Cultural Team",
      assigneeId: 20,
      status: "OPEN",
      priority: "High",
      dueDate: "2025-08-10",
      taskType: "regular",
      tags: ["backup", "system", "verification"],
      colorCode: "#DC2626",
      progress: 0,
      subtaskCount: 0,
      collaborators: [2, 3],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
    {
      id: 17,
      title: "Inventory Management Update",
      assignee: "Admin Team",
      assigneeId: 18,
      status: "OPEN",
      priority: "Medium",
      dueDate: "2025-08-10",
      taskType: "regular",
      tags: ["inventory", "management", "update"],
      colorCode: "#10B981",
      progress: 0,
      subtaskCount: 0,
      collaborators: [1],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
    {
      id: 18,
      title: "Vendor Contract Renewal",
      assignee: "Catering Team",
      assigneeId: 21,
      status: "INPROGRESS",
      priority: "High",
      dueDate: "2025-08-10",
      taskType: "approval",
      tags: ["contract", "vendor", "renewal"],
      colorCode: "#F59E0B",
      progress: 40,
      subtaskCount: 0,
      collaborators: [2],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
    },
  ],

  selectedTasks: [],
  snoozedTasks: new Set(),
  riskyTasks: new Set(),
  expandedTasks: new Set(),

  // Quick Task Actions
  addQuickTask: (quickTask) => {
    set((state) => ({
      quickTasks: [
        ...state.quickTasks,
        {
          id: quickTask.id || Date.now(),
          title: quickTask.title.trim(),
          createdBy: "Current User",
          creatorId: 1,
          priority: quickTask.priority || "Low",
          dueDate:
            quickTask.dueDate ||
            (() => {
              const date = new Date();
              date.setDate(date.getDate() + 3);
              return date.toISOString().split("T")[0];
            })(),
          status: "Open",
          createdAt: new Date().toISOString(),
          isPrivate: true,
          conversionFlag: null, // Will be set when converted
          ...quickTask,
        },
      ],
    }));
  },

  updateQuickTask: (id, updates) => {
    set((state) => ({
      quickTasks: state.quickTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task,
      ),
    }));
  },

  deleteQuickTask: (id) => {
    set((state) => ({
      quickTasks: state.quickTasks.filter((task) => task.id !== id),
    }));
  },

  convertQuickTaskToTask: (quickTaskId, targetTaskType = "regular") => {
    const state = get();
    const quickTask = state.quickTasks.find((t) => t.id === quickTaskId);
    if (!quickTask) return null;

    // Create new task from quick task
    const newTask = {
      title: quickTask.title,
      description: `Converted from Quick Task: ${quickTask.title}`,
      assignee: "Current User",
      assigneeId: 1,
      priority: quickTask.priority,
      status: quickTask.status === "Done" ? "DONE" : "OPEN",
      dueDate: quickTask.dueDate,
      taskType: targetTaskType,
      tags: ["converted-from-quick-task"],
      colorCode: "#3B82F6",
      progress: quickTask.status === "Done" ? 100 : 0,
      subtaskCount: 0,
      collaborators: [],
      createdBy: "Current User",
      creatorId: 1,
      subtasks: [],
      originalQuickTaskId: quickTaskId,
    };

    // Add the new task
    state.addTask(newTask);

    // Update the quick task with conversion flag
    state.updateQuickTask(quickTaskId, {
      conversionFlag: `Moved to Task → [${newTask.id}]`,
      status: "Archived",
    });

    return newTask;
  },

  // Auto-archive completed quick tasks after configurable days
  archiveCompletedQuickTasks: () => {
    const state = get();
    const archiveDays = state.quickTaskSettings.autoArchiveDays;
    const archiveThreshold = new Date();
    archiveThreshold.setDate(archiveThreshold.getDate() - archiveDays);

    set((currentState) => ({
      quickTasks: currentState.quickTasks.map((task) => {
        if (
          task.status === "Done" &&
          new Date(task.updatedAt || task.createdAt) < archiveThreshold
        ) {
          return { ...task, status: "Archived" };
        }
        return task;
      }),
    }));
  },

  // Actions
  addTask: (task) => {
    // Default color based on task type
    const getDefaultColor = (type) => {
      switch (type) {
        case "regular":
          return "#3B82F6";
        case "recurring":
          return "#10B981";
        case "milestone":
          return "#8B5CF6";
        case "approval":
          return "#F59E0B";
        default:
          return "#6B7280";
      }
    };

    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          id: task.id || Date.now(),
          ...task,
          createdAt: new Date().toISOString(),
          subtasks: task.subtasks || [],
          // Milestone specific fields
          isMilestone: task.isMilestone || false,
          milestoneType: task.milestoneType || "standalone",
          linkedTasks: task.linkedTasks || [],
          progress: task.progress || 0,
        },
      ],
    }));
  },

  updateTask: (id, updates) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return state;

      const notifications = [];

      // Status change notification
      if (
        updates.status &&
        updates.status !== task.status &&
        state.notificationSettings.statusChanges
      ) {
        notifications.push(
          createNotification("status_change", id, task.title, {
            message: `Task "${task.title}" status changed from ${task.status} to ${updates.status}`,
            oldStatus: task.status,
            newStatus: updates.status,
            priority: task.priority || "medium",
          }),
        );
      }

      // Priority change notification
      if (updates.priority && updates.priority !== task.priority) {
        notifications.push(
          createNotification("priority_change", id, task.title, {
            message: `Task "${task.title}" priority changed from ${task.priority} to ${updates.priority}`,
            oldPriority: task.priority,
            newPriority: updates.priority,
            priority: updates.priority,
          }),
        );
      }

      // Assignment change notification
      if (
        updates.assigneeId &&
        updates.assigneeId !== task.assigneeId &&
        state.notificationSettings.taskAssignment
      ) {
        notifications.push(
          createNotification("assignment", id, task.title, {
            message: `Task "${task.title}" has been reassigned to you`,
            assigneeId: updates.assigneeId,
            priority: task.priority || "medium",
          }),
        );
      }

      return {
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        notifications: [...state.notifications, ...notifications],
      };
    });
  },

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      selectedTasks: state.selectedTasks.filter((id) => id !== taskId),
    })),

  addSubtask: (parentTaskId, subtaskData) => {
    set((state) => {
      const parentTask = state.tasks.find((task) => task.id === parentTaskId);

      // Validate due date against parent task
      if (subtaskData.dueDate && parentTask?.dueDate) {
        if (subtaskData.dueDate > parentTask.dueDate) {
          throw new Error(
            "Subtask due date must be on or before the parent task due date.",
          );
        }
      }

      return {
        tasks: state.tasks.map((task) => {
          if (task.id === parentTaskId) {
            const newSubtask = {
              id: Date.now() + Math.random(),
              createdAt: new Date().toISOString(),
              createdBy: "Current User",
              progress: 0,
              ...subtaskData,
            };

            return {
              ...task,
              subtasks: [...(task.subtasks || []), newSubtask],
              subtaskCount: (task.subtaskCount || 0) + 1,
            };
          }
          return task;
        }),
      };
    });
  },

  updateSubtask: (parentTaskId, subtaskId, updates) => {
    set((state) => {
      const parentTask = state.tasks.find((task) => task.id === parentTaskId);

      // Validate due date if being updated
      if (updates.dueDate && parentTask?.dueDate) {
        if (updates.dueDate > parentTask.dueDate) {
          throw new Error(
            "Subtask due date must be on or before the parent task due date.",
          );
        }
      }

      return {
        tasks: state.tasks.map((task) => {
          if (task.id === parentTaskId && task.subtasks) {
            return {
              ...task,
              subtasks: task.subtasks.map((subtask) =>
                subtask.id === subtaskId
                  ? {
                      ...subtask,
                      ...updates,
                      progress:
                        updates.status === "DONE" ? 100 : subtask.progress,
                    }
                  : subtask,
              ),
            };
          }
          return task;
        }),
      };
    });
  },

  deleteSubtask: (parentTaskId, subtaskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === parentTaskId
          ? {
              ...task,
              subtasks: task.subtasks.filter(
                (subtask) => subtask.id !== subtaskId,
              ),
              subtaskCount: Math.max(0, (task.subtaskCount || 0) - 1),
            }
          : task,
      ),
    })),

  // Selection management
  setSelectedTasks: (taskIds) => set({ selectedTasks: taskIds }),

  toggleTaskSelection: (taskId) =>
    set((state) => ({
      selectedTasks: state.selectedTasks.includes(taskId)
        ? state.selectedTasks.filter((id) => id !== taskId)
        : [...state.selectedTasks, taskId],
    })),

  // Bulk operations
  bulkUpdateStatus: (taskIds, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        taskIds.includes(task.id)
          ? {
              ...task,
              status: newStatus,
              progress: newStatus === "DONE" ? 100 : task.progress,
            }
          : task,
      ),
    })),

  bulkDeleteTasks: (taskIds) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => !taskIds.includes(task.id)),
      selectedTasks: [],
    })),

  // Task state management
  toggleTaskExpansion: (taskId) =>
    set((state) => {
      const newExpanded = new Set(state.expandedTasks);
      if (newExpanded.has(taskId)) {
        newExpanded.delete(taskId);
      } else {
        newExpanded.add(taskId);
      }
      return { expandedTasks: newExpanded };
    }),

  toggleSnoozeTask: (taskId) =>
    set((state) => {
      const newSnoozed = new Set(state.snoozedTasks);
      if (newSnoozed.has(taskId)) {
        newSnoozed.delete(taskId);
      } else {
        newSnoozed.add(taskId);
      }
      return { snoozedTasks: newSnoozed };
    }),

  toggleRiskyTask: (taskId) =>
    set((state) => {
      const newRisky = new Set(state.riskyTasks);
      if (newRisky.has(taskId)) {
        newRisky.delete(taskId);
      } else {
        newRisky.add(taskId);
      }
      return { riskyTasks: newRisky };
    }),

  // Status management
  updateTaskStatus: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              progress: newStatus === "DONE" ? 100 : task.progress,
              lastModified: new Date().toISOString(),
              lastModifiedBy: "Current User",
            }
          : task,
      ),
    })),

  // Notification management
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  markNotificationRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      ),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  deleteNotification: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== notificationId),
    })),

  // Reminder management
  addReminder: (reminder) =>
    set((state) => ({
      reminders: [...state.reminders, reminder],
    })),

  snoozeTask: (taskId, snoozeUntil, note = "") => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      const notification = createNotification(
        "task_snoozed",
        taskId,
        task.title,
        {
          message: `Task "${task.title}" snoozed until ${new Date(
            snoozeUntil,
          ).toLocaleDateString()}`,
          snoozeUntil,
          note,
          priority: task.priority || "medium",
        },
      );

      // Schedule wake-up reminder
      const wakeupReminder = {
        id: Date.now() + Math.random(),
        taskId,
        type: "snooze_wakeup",
        scheduledFor: snoozeUntil,
        message: `Snoozed task "${task.title}" is now active`,
        active: true,
      };

      return {
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, snoozedUntil: snoozeUntil, snoozeNote: note }
            : t,
        ),
        notifications: [notification, ...state.notifications],
        reminders: [...state.reminders, wakeupReminder],
      };
    });
  },

  addCustomReminder: (taskId, reminderDate, message) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const reminder = {
      id: Date.now() + Math.random(),
      taskId,
      type: "custom",
      scheduledFor: reminderDate,
      message: message || `Reminder for task "${task.title}"`,
      active: true,
    };

    set((state) => ({
      reminders: [...state.reminders, reminder],
    }));
  },

  // Check for due notifications and overdue tasks
  checkReminders: () => {
    const now = new Date();
    const state = get();

    state.reminders.forEach((reminder) => {
      if (reminder.active && new Date(reminder.scheduledFor) <= now) {
        const task = state.tasks.find((t) => t.id === reminder.taskId);
        if (task) {
          let notificationType = reminder.type;
          let message = reminder.message;

          if (reminder.type === "due_date") {
            notificationType = "due_date";
            message = reminder.message;
          } else if (reminder.type === "snooze_wakeup") {
            notificationType = "snooze_wakeup";
          }

          const notification = createNotification(
            notificationType,
            task.id,
            task.title,
            {
              message,
              priority: task.priority || "medium",
            },
          );

          set((prevState) => ({
            notifications: [notification, ...prevState.notifications],
            reminders: prevState.reminders.map((r) =>
              r.id === reminder.id ? { ...r, active: false } : r,
            ),
          }));
        }
      }
    });

    // Check for overdue tasks
    state.tasks.forEach((task) => {
      if (task.dueDate && task.status !== "DONE") {
        const dueDate = new Date(task.dueDate);
        const daysPastDue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

        if (daysPastDue > 0 && state.notificationSettings.overdueReminders) {
          // Check if we already sent overdue notification today
          const todayOverdueExists = state.notifications.some(
            (n) =>
              n.taskId === task.id &&
              n.type === "overdue" &&
              new Date(n.timestamp).toDateString() === now.toDateString(),
          );

          if (!todayOverdueExists) {
            const notification = createNotification(
              "overdue",
              task.id,
              task.title,
              {
                message: `Task "${task.title}" is ${daysPastDue} ${
                  daysPastDue === 1 ? "day" : "days"
                } overdue`,
                daysPastDue,
                priority: "critical",
              },
            );

            set((prevState) => ({
              notifications: [notification, ...prevState.notifications],
            }));
          }
        }
      }
    });
  },

  updateNotificationSettings: (settings) =>
    set((state) => ({
      notificationSettings: { ...state.notificationSettings, ...settings },
    })),

  updateQuickTaskSettings: (settings) =>
    set((state) => ({
      quickTaskSettings: { ...state.quickTaskSettings, ...settings },
    })),

  // Get task status helpers
  getTaskStatus: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const now = new Date();
    const isOverdue =
      task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE";
    const isSnoozed = task.snoozedUntil && new Date(task.snoozedUntil) > now;
    const hasReminders = get().reminders.some(
      (r) => r.taskId === taskId && r.active,
    );

    return {
      isOverdue,
      isSnoozed,
      hasReminders,
      task,
    };
  },

  // Getters
  getTaskById: (taskId) => {
    const state = get();
    return state.tasks.find((task) => task.id === taskId);
  },

  getSubtaskById: (parentTaskId, subtaskId) => {
    const state = get();
    const parentTask = state.tasks.find((task) => task.id === parentTaskId);
    return parentTask?.subtasks.find((subtask) => subtask.id === subtaskId);
  },

  // Filters
  getFilteredTasks: (filters) => {
    const state = get();
    return state.tasks.filter((task) => {
      // Apply search filter
      const matchesSearch = filters.searchTerm
        ? task.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          task.assignee.toLowerCase().includes(filters.searchTerm.toLowerCase())
        : true;

      // Apply status filter
      const matchesStatus =
        filters.statusFilter === "all" ||
        (filters.statusFilter === "todo" && task.status === "OPEN") ||
        (filters.statusFilter === "progress" && task.status === "INPROGRESS") ||
        (filters.statusFilter === "review" && task.status === "ONHOLD") ||
        (filters.statusFilter === "completed" && task.status === "DONE");

      // Apply priority filter
      const matchesPriority =
        filters.priorityFilter === "all" ||
        task.priority.toLowerCase() === filters.priorityFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });
  },
}));

export default useTasksStore;
