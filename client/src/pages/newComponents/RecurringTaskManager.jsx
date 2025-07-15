import React, { useState } from "react";
import Calendar from "./Calendar";

export default function RecurringTaskManager({ onClose }) {
  // If onClose is provided, we're being used as a form component
  if (onClose) {
    return <RecurringTaskForm onClose={onClose} />;
  }

  // Otherwise, we're being used as a standalone manager
  const [currentUser] = useState({
    id: 1,
    name: "Current User",
    role: "admin",
  });
  const [showCreateRecurringDrawer, setShowCreateRecurringDrawer] =
    useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [recurringTasks, setRecurringTasks] = useState([
    {
      id: 1,
      title: "Weekly Team Standup",
      frequency: "weekly",
      repeatEvery: 1,
      repeatOnDays: ["Mon"],
      startDate: "2024-01-01",
      endConditionType: "never",
      endValue: null,
      time: "10:00",
      creator: "Admin User",
      creatorId: 1,
      status: "active",
      nextInstance: "2024-01-29",
      totalInstances: 12,
      completedInstances: 8,
      baseTaskId: 101,
      description: "Weekly team sync meeting task",
    },
    {
      id: 2,
      title: "Monthly Security Review",
      frequency: "monthly",
      repeatEvery: 1,
      repeatOnDays: [],
      startDate: "2024-01-01",
      endConditionType: "after",
      endValue: "12",
      time: "09:00",
      creator: "Security Team",
      creatorId: 2,
      status: "active",
      nextInstance: "2024-02-01",
      totalInstances: 12,
      completedInstances: 1,
      baseTaskId: 102,
      description: "Monthly security audit and review",
    },
    {
      id: 3,
      title: "Daily Code Backup",
      frequency: "daily",
      repeatEvery: 1,
      repeatOnDays: [],
      startDate: "2024-01-01",
      endConditionType: "never",
      endValue: null,
      time: "23:00",
      creator: "DevOps Team",
      creatorId: 3,
      status: "paused",
      nextInstance: "N/A",
      totalInstances: 21,
      completedInstances: 21,
      baseTaskId: 103,
      description: "Automated daily backup of code repositories",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFrequency, setFilterFrequency] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: "bg-green-100 text-green-800",
      paused: "bg-yellow-100 text-yellow-800",
      completed: "bg-red-100 text-red-800",
    };
    return `status-badge ${statusClasses[status] || "bg-gray-100 text-gray-800"}`;
  };

  const getFrequencyDisplay = (task) => {
    let display = `Every ${task.repeatEvery} ${task.frequency}`;
    if (task.frequency === "weekly" && task.repeatOnDays.length > 0) {
      display += ` on ${task.repeatOnDays.join(", ")}`;
    }
    if (task.time) {
      display += ` at ${task.time}`;
    }
    return display;
  };

  const canManageRecurrence = (task) => {
    return task.creatorId === currentUser.id || currentUser.role === "admin";
  };

  const handleToggleStatus = (taskId) => {
    setRecurringTasks((tasks) =>
      tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "active" ? "paused" : "active" }
          : task,
      ),
    );
  };

  const handleStopRecurrence = (taskId) => {
    if (
      window.confirm(
        "Are you sure you want to stop this recurrence? This will prevent future tasks from being created.",
      )
    ) {
      setRecurringTasks((tasks) =>
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: "completed" } : task,
        ),
      );
    }
  };

  const handleEditRecurrence = (task) => {
    setEditingTask(task);
    setShowEditModal(true);
  };

  const filteredTasks = recurringTasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    if (filterFrequency !== "all" && task.frequency !== filterFrequency)
      return false;
    return true;
  });

  return (
    <div className="space-y-6 p-5 h-auto overflow-scroll">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recurring Tasks</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage automated recurring tasks and schedules
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex gap-3">
          <button
            className="btn btn-secondary"
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
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateRecurringDrawer(true)}
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
            Create Recurring Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterFrequency}
            onChange={(e) => setFilterFrequency(e.target.value)}
            className="form-select"
          >
            <option value="all">All Frequencies</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Calendar View Section */}
      {showCalendarView && (
        <div className="card">
          <Calendar onClose={() => setShowCalendarView(false)} />
        </div>
      )}

      {/* Recurring Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="card hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {task.title}
                    </h3>
                    <span className={getStatusBadge(task.status)}>
                      {task.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    #{task.baseTaskId}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{task.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Pattern:</span>
                    <p className="text-gray-600">{getFrequencyDisplay(task)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Creator:</span>
                    <p className="text-gray-600">{task.creator}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Started:</span>
                    <p className="text-gray-600">{task.startDate}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Next Instance:
                    </span>
                    <p className="text-gray-600">{task.nextInstance}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="font-medium text-gray-700">Progress:</span>
                  <span className="ml-2 text-gray-600">
                    {task.completedInstances}/
                    {task.endConditionType === "after" ? task.endValue : "∞"}{" "}
                    completed
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 mt-4 lg:mt-0 lg:ml-6">
                {canManageRecurrence(task) && (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEditRecurrence(task)}
                      disabled={task.status === "completed"}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      Edit
                    </button>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleToggleStatus(task.id)}
                      disabled={task.status === "completed"}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {task.status === "active" ? "Pause" : "Resume"}
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStopRecurrence(task.id)}
                      disabled={task.status === "completed"}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                        />
                      </svg>
                      Stop
                    </button>
                  </>
                )}
                {!canManageRecurrence(task) && (
                  <span className="no-permissions">View Only</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="empty-state">
          <h3>No recurring tasks found</h3>
          <p>
            Create your first recurring task to automate repetitive workflows.
          </p>
          <button className="btn btn-primary">+ Create Recurring Task</button>
        </div>
      )}

      {showEditModal && editingTask && (
        <EditRecurrenceModal
          task={editingTask}
          onClose={() => {
            setShowEditModal(false);
            setEditingTask(null);
          }}
          onSave={(updatedTask) => {
            setRecurringTasks((tasks) =>
              tasks.map((task) =>
                task.id === updatedTask.id ? updatedTask : task,
              ),
            );
            setShowEditModal(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* Calendar View Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Calendar & Upcoming Instances
          </h2>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm">Previous</button>
            <button className="btn btn-secondary btn-sm">Next</button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Calendar View
          </h3>
          <p className="text-gray-600">
            View upcoming recurring task instances in calendar format
          </p>
          <button className="btn btn-primary mt-4">Open Calendar</button>
        </div>
      </div>

      {/* Slide-in Drawer for Creating Recurring Task */}
      {showCreateRecurringDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden  overlay-animate mt-0">
          <div
            className="drawer-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreateRecurringDrawer(false)}
          ></div>
          <div
            className="absolute right-0 top-0 h-full bg-white/95 backdrop-blur-sm flex flex-col modal-animate-slide-right"
            style={{
              width: "min(90vw, 600px)",
              boxShadow: "-10px 0 50px rgba(0,0,0,0.2)",
              borderLeft: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div className="drawer-header">
              <h2 className="text-2xl font-bold text-white">
                Create Recurring Task
              </h2>
              <button
                onClick={() => setShowCreateRecurringDrawer(false)}
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
            <div className="drawer-body">
              <RecurringTaskForm
                onClose={() => setShowCreateRecurringDrawer(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecurringTaskForm({ onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    frequency: "weekly",
    repeatEvery: 1,
    repeatOnDays: [],
    startDate: "",
    endConditionType: "never",
    endValue: "",
    time: "09:00",
    assignee: "",
    priority: "medium",
    category: "",
  });

  const [isManualDueDate, setIsManualDueDate] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "dueDate") {
      setIsManualDueDate(true);
    }
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDayToggle = (day) => {
    const days = formData.repeatOnDays;
    const updatedDays = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day];

    setFormData({
      ...formData,
      repeatOnDays: updatedDays,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating recurring task:", formData);
    // Handle recurring task creation
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Task Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Task Details
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter recurring task title..."
              required
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              placeholder="Describe the recurring task..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to
            </label>
            <select
              name="assignee"
              value={formData.assignee}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select assignee...</option>
              <option value="john">John Doe</option>
              <option value="jane">Jane Smith</option>
              <option value="mike">Mike Johnson</option>
              <option value="sarah">Sarah Wilson</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select category...</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="research">Research</option>
              <option value="marketing">Marketing</option>
              <option value="support">Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recurrence Pattern */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Recurrence Pattern
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency *
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repeat Every
            </label>
            <input
              type="number"
              name="repeatEvery"
              value={formData.repeatEvery}
              onChange={handleChange}
              className="form-input"
              min="1"
              max="365"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        {formData.frequency === "weekly" && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Repeat On Days
            </label>
            <div className="flex flex-wrap gap-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                    formData.repeatOnDays.includes(day)
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                  onClick={() => handleDayToggle(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>
      </div>

      {/* End Condition */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          End Condition
        </h3>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="never"
              name="endConditionType"
              value="never"
              checked={formData.endConditionType === "never"}
              onChange={handleChange}
              className="form-radio"
            />
            <label htmlFor="never" className="text-sm text-gray-700">
              Never end
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="after"
              name="endConditionType"
              value="after"
              checked={formData.endConditionType === "after"}
              onChange={handleChange}
              className="form-radio"
            />
            <label htmlFor="after" className="text-sm text-gray-700">
              End after
            </label>
            {formData.endConditionType === "after" && (
              <input
                type="number"
                name="endValue"
                value={formData.endValue}
                onChange={handleChange}
                className="form-input w-20"
                placeholder="10"
                min="1"
              />
            )}
            {formData.endConditionType === "after" && (
              <span className="text-sm text-gray-700">occurrences</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="on"
              name="endConditionType"
              value="on"
              checked={formData.endConditionType === "on"}
              onChange={handleChange}
              className="form-radio"
            />
            <label htmlFor="on" className="text-sm text-gray-700">
              End on
            </label>
            {formData.endConditionType === "on" && (
              <input
                type="date"
                name="endValue"
                value={formData.endValue}
                onChange={handleChange}
                className="form-input"
              />
            )}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Create Recurring Task
        </button>
      </div>
    </form>
  );
}

function EditRecurrenceModal({ task, onClose, onSave }) {
  const [formData, setFormData] = useState({
    frequency: task.frequency,
    repeatEvery: task.repeatEvery,
    repeatOnDays: task.repeatOnDays,
    time: task.time,
    endConditionType: task.endConditionType,
    endValue: task.endValue,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDayToggle = (day) => {
    const days = formData.repeatOnDays;
    const updatedDays = days.includes(day)
      ? days.filter((d) => d !== day)
      : [...days, day];

    setFormData({
      ...formData,
      repeatOnDays: updatedDays,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...task,
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overlay-animate mt-0">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-animate-slide-right">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Edit Recurrence</h3>
              <p className="text-indigo-100 text-sm mt-1">{task.title}</p>
            </div>
            <button
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
              onClick={onClose}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Frequency Section */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              Frequency Settings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="frequency"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="repeatEvery"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Repeat Every
                </label>
                <input
                  type="number"
                  id="repeatEvery"
                  name="repeatEvery"
                  value={formData.repeatEvery}
                  onChange={handleChange}
                  min="1"
                  max="365"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="time"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Time
                  <svg
                    className="w-4 h-4 text-gray-400 inline ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Weekly Days Selection */}
          {formData.frequency === "weekly" && (
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-blue-600"
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
                </div>
                Repeat On Days
              </h4>
              <div className="grid grid-cols-7 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <button
                      key={day}
                      type="button"
                      className={`px-3 py-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        formData.repeatOnDays.includes(day)
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg"
                          : "bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                      onClick={() => handleDayToggle(day)}
                    >
                      {day}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {/* End Condition Section */}
          <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              End Condition
            </h4>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition-colors">
                <input
                  type="radio"
                  id="never"
                  name="endConditionType"
                  value="never"
                  checked={formData.endConditionType === "never"}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <label
                  htmlFor="never"
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Never end (Continue indefinitely)
                </label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition-colors">
                <input
                  type="radio"
                  id="after"
                  name="endConditionType"
                  value="after"
                  checked={formData.endConditionType === "after"}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <label
                  htmlFor="after"
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  <svg
                    className="w-4 h-4 text-blue-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  After occurrences
                </label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white transition-colors">
                <input
                  type="radio"
                  id="on"
                  name="endConditionType"
                  value="on"
                  checked={formData.endConditionType === "on"}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <label
                  htmlFor="on"
                  className="text-sm font-medium text-gray-700 flex items-center"
                >
                  <svg
                    className="w-4 h-4 text-purple-500 mr-2"
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
                  On date
                </label>
              </div>
            </div>

            {formData.endConditionType !== "never" && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <label
                  htmlFor="endValue"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {formData.endConditionType === "after"
                    ? "Number of Occurrences"
                    : "End Date"}
                </label>
                <input
                  type={
                    formData.endConditionType === "after" ? "number" : "date"
                  }
                  id="endValue"
                  name="endValue"
                  value={formData.endValue}
                  onChange={handleChange}
                  min={formData.endConditionType === "after" ? "1" : undefined}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder={
                    formData.endConditionType === "after"
                      ? "Enter number of times"
                      : ""
                  }
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
              onClick={onClose}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Update Recurrence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
