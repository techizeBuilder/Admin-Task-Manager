import React, { useState, useEffect } from "react";
import RecurrenceSchedulingPanel from "./RecurrenceSchedulingPanel";

const RecurrenceTaskManager = () => {
  const [recurringTasks, setRecurringTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userPlan, setUserPlan] = useState("explore"); // explore, plan, execute, optimize
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "",
    tags: [],
    isRecurring: false,
    recurrenceData: null,
    visibility: "private",
  });

  // Mock team members (in real app, fetch from API)
  const teamMembers = [
    { id: 1, name: "Current User" },
    { id: 2, name: "John Smith" },
    { id: 3, name: "Jane Smith" },
    { id: 4, name: "Mike Johnson" },
    { id: 5, name: "Sarah Wilson" },
  ];

  const userRole = "manager"; // This would come from auth context

  // Sample recurring tasks data
  useEffect(() => {
    setRecurringTasks([
      {
        id: 1,
        title: "Daily Stand-up Meeting",
        description: "Team sync meeting",
        recurrenceData: {
          patternType: "daily",
          repeatEvery: 1,
          startDate: "2024-01-15",
          startTime: "09:00",
          endCondition: "never",
          assignedTo: 1,
        },
        isActive: true,
        nextOccurrence: "2024-01-20T09:00:00Z",
        totalOccurrences: 45,
      },
      {
        id: 2,
        title: "Bi-weekly Review",
        description: "Team performance review",
        recurrenceData: {
          patternType: "weekly",
          repeatEvery: 2,
          weekdays: ["friday"],
          startDate: "2024-01-01",
          startTime: "15:00",
          endCondition: "occurrences",
          endOccurrences: 12,
          assignedTo: 2,
        },
        isActive: true,
        nextOccurrence: "2024-01-19T15:00:00Z",
        totalOccurrences: 6,
      },
    ]);
  }, []);

  const handleCreateTask = () => {
    if (!taskData.title.trim()) return;

    // Validate licensing limits before creating
    const limits = {
      explore: 1,
      plan: 10,
      execute: Infinity,
      optimize: Infinity,
    };

    const currentLimit = limits[userPlan] || limits.explore;

    if (taskData.isRecurring && recurringTasks.length >= currentLimit) {
      alert(
        `You've reached the maximum recurring tasks allowed for your ${userPlan} plan. Please upgrade to create more recurring tasks.`,
      );
      return;
    }

    // Enhanced validation for recurring tasks
    if (taskData.isRecurring && taskData.recurrenceData) {
      // Assignment validation
      if (!taskData.recurrenceData.assignedTo) {
        alert("Please assign the recurring task to exactly one person.");
        return;
      }

      // Role-based assignment validation
      if (
        userRole === "user" &&
        taskData.recurrenceData.assignedTo !== "self"
      ) {
        alert(
          "Individual users can only assign recurring tasks to themselves.",
        );
        return;
      }

      if (
        (userRole === "manager" || userRole === "admin") &&
        !taskData.recurrenceData.assignedTo
      ) {
        alert("Please select an assignee for this recurring task.");
        return;
      }

      // Visibility validation
      if (!taskData.recurrenceData.visibility) {
        alert("Please select a visibility option for this recurring task.");
        return;
      }
    }

    const newTask = {
      id: Date.now(),
      ...taskData,
      isActive: true,
      nextOccurrence: calculateNextOccurrence(taskData.recurrenceData),
      totalOccurrences: 0,
      createdAt: new Date().toISOString(),
    };

    setRecurringTasks((prev) => [...prev, newTask]);
    setTaskData({
      title: "",
      description: "",
      priority: "medium",
      category: "",
      tags: [],
      isRecurring: false,
      recurrenceData: null,
      visibility: "private",
    });
    setShowCreateModal(false);
  };

  const calculateNextOccurrence = (recurrenceData) => {
    if (!recurrenceData) return null;

    const startDateTime = new Date(
      `${recurrenceData.startDate}T${recurrenceData.startTime}`,
    );
    return startDateTime.toISOString();
  };

  const handleToggleRecurrence = (taskId) => {
    setRecurringTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, isActive: !task.isActive } : task,
      ),
    );
  };

  const handleDeleteTask = (taskId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this recurring task? This will stop all future occurrences.",
      )
    ) {
      setRecurringTasks((prev) => prev.filter((task) => task.id !== taskId));
    }
  };

  const formatRecurrenceDescription = (recurrenceData) => {
    if (!recurrenceData) return "";

    switch (recurrenceData.patternType) {
      case "daily":
        return `Every ${recurrenceData.repeatEvery === 1 ? "" : recurrenceData.repeatEvery + " "}day${recurrenceData.repeatEvery > 1 ? "s" : ""}`;
      case "weekly":
        const days = recurrenceData.weekdays?.join(", ") || "";
        return `Every ${recurrenceData.repeatEvery === 1 ? "" : recurrenceData.repeatEvery + " "}week${recurrenceData.repeatEvery > 1 ? "s" : ""} on ${days}`;
      case "monthly":
        return `Every ${recurrenceData.repeatEvery === 1 ? "" : recurrenceData.repeatEvery + " "}month${recurrenceData.repeatEvery > 1 ? "s" : ""}`;
      case "yearly":
        return `Every ${recurrenceData.repeatEvery === 1 ? "" : recurrenceData.repeatEvery + " "}year${recurrenceData.repeatEvery > 1 ? "s" : ""}`;
      default:
        return "Custom schedule";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recurring Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage automated task schedules
            {userPlan && (
              <span className="ml-2 text-sm">
                ({recurringTasks.length}/
                {userPlan === "explore"
                  ? "1"
                  : userPlan === "plan"
                    ? "10"
                    : "∞"}{" "}
                used)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Create Recurring Task
        </button>
      </div>

      {/* Recurring Tasks List */}
      <div className="grid gap-4">
        {recurringTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white border rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🔁</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {task.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {task.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-gray-600 mb-3">{task.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Schedule:</span>
                    <p className="text-gray-600">
                      {formatRecurrenceDescription(task.recurrenceData)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Next Occurrence:
                    </span>
                    <p className="text-gray-600">
                      {task.nextOccurrence
                        ? new Date(task.nextOccurrence).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Total Created:
                    </span>
                    <p className="text-gray-600">
                      {task.totalOccurrences} tasks
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleToggleRecurrence(task.id)}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    task.isActive
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {task.isActive ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="px-3 py-1 text-xs font-medium rounded bg-red-100 text-red-800 hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {recurringTasks.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <span className="text-6xl mb-4 block">🔁</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No recurring tasks yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first recurring task to automate repetitive work
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Create Recurring Task
            </button>
          </div>
        )}
      </div>

      {/* Ultra Compact Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[95vh] overflow-y-auto">
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-gray-900">
                  Create Recurring Task
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-lg leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-2">
                {/* Task Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={taskData.title}
                    onChange={(e) =>
                      setTaskData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Task title..."
                    className="w-full p-1.5 border rounded focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={taskData.description}
                    onChange={(e) =>
                      setTaskData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Task description..."
                    rows={2}
                    className="w-full p-1.5 border rounded focus:ring-1 focus:ring-indigo-500 text-xs"
                  />
                </div>

                {/* Compact Row - Priority, Category, Visibility */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={taskData.priority}
                      onChange={(e) =>
                        setTaskData((prev) => ({
                          ...prev,
                          priority: e.target.value,
                        }))
                      }
                      className="w-full p-1.5 border rounded focus:ring-1 focus:ring-indigo-500 text-xs"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={taskData.category}
                      onChange={(e) =>
                        setTaskData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      placeholder="Category..."
                      className="w-full p-1.5 border rounded focus:ring-1 focus:ring-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Visibility
                    </label>
                    <select
                      value={taskData.visibility}
                      onChange={(e) =>
                        setTaskData((prev) => ({
                          ...prev,
                          visibility: e.target.value,
                        }))
                      }
                      className="w-full p-1.5 border rounded focus:ring-1 focus:ring-indigo-500 text-xs"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>

                {/* User Plan Selector (for demo purposes) */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Current Plan (Demo)
                  </label>
                  <select
                    value={userPlan}
                    onChange={(e) => setUserPlan(e.target.value)}
                    className="w-full p-1.5 border rounded focus:ring-1 focus:ring-indigo-500 text-xs bg-gray-50"
                  >
                    <option value="explore">Explore (1 recurring task)</option>
                    <option value="plan">Plan (10 recurring tasks)</option>
                    <option value="execute">Execute (Unlimited)</option>
                    <option value="optimize">Optimize (Unlimited)</option>
                  </select>
                </div>

                {/* Recurrence Toggle */}
                <div className="border rounded p-2 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">🔁</span>
                      <span className="font-medium text-gray-900 text-xs">
                        Recurring
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setTaskData((prev) => ({
                          ...prev,
                          isRecurring: !prev.isRecurring,
                        }))
                      }
                      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                        taskData.isRecurring ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                          taskData.isRecurring
                            ? "translate-x-3.5"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Recurrence Panel */}
                  {taskData.isRecurring && (
                    <RecurrenceSchedulingPanel
                      isEnabled={taskData.isRecurring}
                      onToggle={() =>
                        setTaskData((prev) => ({
                          ...prev,
                          isRecurring: !prev.isRecurring,
                        }))
                      }
                      onDataChange={(recurrenceData) =>
                        setTaskData((prev) => ({ ...prev, recurrenceData }))
                      }
                      userRole={userRole}
                      teamMembers={teamMembers}
                      compact={true}
                      userPlan={userPlan}
                      existingRecurringTasksCount={recurringTasks.length}
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1.5 text-gray-700 border border-gray-300 rounded text-xs hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTask}
                    disabled={
                      !taskData.title.trim() ||
                      (taskData.isRecurring && !taskData.recurrenceData)
                    }
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurrenceTaskManager;
