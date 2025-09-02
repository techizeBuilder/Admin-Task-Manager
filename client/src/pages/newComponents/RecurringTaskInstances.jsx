import React, { useState, useEffect } from "react";

const RecurringTaskInstances = () => {
  const [taskInstances, setTaskInstances] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedMaster, setSelectedMaster] = useState("all");

  // Mock data for generated task instances
  useEffect(() => {
    setTaskInstances([
      {
        id: 1,
        recurrenceId: 1,
        masterTitle: "Daily Stand-up Meeting",
        title: "Daily Stand-up Meeting - Jan 20, 2024",
        description: "Team sync meeting",
        scheduledDate: "2024-01-20T09:00:00Z",
        status: "pending",
        assignedTo: "John Smith",
        priority: "medium",
        completed: false,
        createdAt: "2024-01-15T00:00:00Z",
      },
      {
        id: 2,
        recurrenceId: 1,
        masterTitle: "Daily Stand-up Meeting",
        title: "Daily Stand-up Meeting - Jan 19, 2024",
        description: "Team sync meeting",
        scheduledDate: "2024-01-19T09:00:00Z",
        status: "completed",
        assignedTo: "John Smith",
        priority: "medium",
        completed: true,
        completedAt: "2024-01-19T09:15:00Z",
        createdAt: "2024-01-15T00:00:00Z",
      },
      {
        id: 3,
        recurrenceId: 2,
        masterTitle: "Bi-weekly Review",
        title: "Bi-weekly Review - Jan 19, 2024",
        description: "Team performance review",
        scheduledDate: "2024-01-19T15:00:00Z",
        status: "in_progress",
        assignedTo: "Jane Smith",
        priority: "high",
        completed: false,
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: 4,
        recurrenceId: 1,
        masterTitle: "Daily Stand-up Meeting",
        title: "Daily Stand-up Meeting - Jan 21, 2024",
        description: "Team sync meeting",
        scheduledDate: "2024-01-21T09:00:00Z",
        status: "pending",
        assignedTo: "John Smith",
        priority: "medium",
        completed: false,
        createdAt: "2024-01-15T00:00:00Z",
      },
    ]);
  }, []);

  const masterTasks = [
    ...new Set(taskInstances.map((task) => task.masterTitle)),
  ];

  const filteredInstances = taskInstances.filter((task) => {
    if (filter === "pending" && task.status !== "pending") return false;
    if (filter === "completed" && !task.completed) return false;
    if (filter === "overdue") {
      const now = new Date();
      const scheduled = new Date(task.scheduledDate);
      if (task.completed || scheduled > now) return false;
    }
    if (selectedMaster !== "all" && task.masterTitle !== selectedMaster)
      return false;
    return true;
  });

  const handleStatusChange = (taskId, newStatus) => {
    setTaskInstances((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              completed: newStatus === "completed",
              completedAt:
                newStatus === "completed"
                  ? new Date().toISOString()
                  : undefined,
            }
          : task,
      ),
    );
  };

  const handleBulkAction = (action) => {
    const selectedTasks = taskInstances.filter((task) => task.selected);

    if (action === "complete") {
      setTaskInstances((prev) =>
        prev.map((task) =>
          task.selected
            ? {
                ...task,
                status: "completed",
                completed: true,
                completedAt: new Date().toISOString(),
              }
            : task,
        ),
      );
    } else if (action === "delete") {
      if (window.confirm(`Delete ${selectedTasks.length} selected tasks?`)) {
        setTaskInstances((prev) => prev.filter((task) => !task.selected));
      }
    }
  };

  const toggleTaskSelection = (taskId) => {
    setTaskInstances((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, selected: !task.selected } : task,
      ),
    );
  };

  const selectAllTasks = () => {
    const allSelected = filteredInstances.every((task) => task.selected);
    setTaskInstances((prev) =>
      prev.map((task) =>
        filteredInstances.includes(task)
          ? { ...task, selected: !allSelected }
          : task,
      ),
    );
  };

  const getStatusBadge = (status, completed) => {
    if (completed) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          ✓ Completed
        </span>
      );
    }

    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            ⏳ Pending
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            🔄 In Progress
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            {status}
          </span>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500";
      case "high":
        return "border-l-orange-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-300";
    }
  };

  const isOverdue = (task) => {
    if (task.completed) return false;
    const now = new Date();
    const scheduled = new Date(task.scheduledDate);
    return scheduled < now;
  };

  const selectedCount = taskInstances.filter((task) => task.selected).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Recurring Task Instances
          </h1>
          <p className="text-gray-600 mt-1">
            Manage generated tasks from recurring schedules
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurring Task
            </label>
            <select
              value={selectedMaster}
              onChange={(e) => setSelectedMaster(e.target.value)}
              className="p-2 border rounded focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Recurring Tasks</option>
              {masterTasks.map((task) => (
                <option key={task} value={task}>
                  {task}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-blue-900">
              {selectedCount} task{selectedCount > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => handleBulkAction("complete")}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            >
              Mark Complete
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Header Row */}
        <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-4">
          <input
            type="checkbox"
            checked={
              filteredInstances.length > 0 &&
              filteredInstances.every((task) => task.selected)
            }
            onChange={selectAllTasks}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-900">
            Showing {filteredInstances.length} of {taskInstances.length} tasks
          </span>
        </div>

        {/* Task Rows */}
        <div className="divide-y">
          {filteredInstances.map((task) => (
            <div
              key={task.id}
              className={`p-4 border-l-4 ${getPriorityColor(task.priority)} ${
                isOverdue(task) ? "bg-red-50" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={task.selected || false}
                  onChange={() => toggleTaskSelection(task.id)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded mt-1"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🔁</span>
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {task.title}
                    </h3>
                    {getStatusBadge(task.status, task.completed)}
                    {isOverdue(task) && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        🚨 Overdue
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {task.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Scheduled:</span>
                      <br />
                      {new Date(task.scheduledDate).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Assigned:</span>
                      <br />
                      {task.assignedTo}
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>
                      <br />
                      <span className="capitalize">{task.priority}</span>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <br />
                      {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value)
                    }
                    className="text-xs p-1 border rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInstances.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📋</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No task instances found
            </h3>
            <p className="text-gray-600">
              {filter === "all"
                ? "No recurring task instances have been generated yet"
                : `No ${filter} tasks found with current filters`}
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-900">
            {taskInstances.length}
          </div>
          <div className="text-sm text-gray-600">Total Instances</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {taskInstances.filter((t) => t.completed).length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {taskInstances.filter((t) => t.status === "pending").length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">
            {taskInstances.filter((t) => isOverdue(t)).length}
          </div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
      </div>
    </div>
  );
};

export default RecurringTaskInstances;
