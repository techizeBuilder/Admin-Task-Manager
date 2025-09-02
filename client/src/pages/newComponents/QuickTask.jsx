import React, { useState } from "react";
import useTasksStore from "../../stores/tasksStore";

export default function QuickTask({ quickTask, onConvert }) {
  const { updateQuickTask, deleteQuickTask, convertQuickTaskToTask } =
    useTasksStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(quickTask.title);
  const [showConvertOptions, setShowConvertOptions] = useState(false);

  const handleStatusToggle = () => {
    const newStatus = quickTask.status === "Open" ? "Done" : "Open";
    updateQuickTask(quickTask.id, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      updateQuickTask(quickTask.id, {
        title: editTitle.trim(),
        updatedAt: new Date().toISOString(),
      });
      setIsEditing(false);
    } else {
      alert("Quick Task cannot be empty.");
      setEditTitle(quickTask.title);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      setEditTitle(quickTask.title);
      setIsEditing(false);
    }
  };

  const handleConvert = (targetType) => {
    const newTask = convertQuickTaskToTask(quickTask.id, targetType);
    setShowConvertOptions(false);
    if (onConvert) {
      onConvert(newTask);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDueDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays <= 7) return `${diffDays} days`;

    return date.toLocaleDateString();
  };

  const isOverdue = () => {
    const today = new Date();
    const dueDate = new Date(quickTask.dueDate);
    return (
      dueDate < today &&
      quickTask.status !== "Done" &&
      quickTask.status !== "Archived"
    );
  };

  if (quickTask.status === "Archived") {
    return null; // Don't render archived tasks
  }

  return (
    <div
      className={`group relative bg-yellow-50 border border-yellow-200 rounded-lg p-3 hover:shadow-lg transition-all duration-200 ${
        quickTask.status === "Done"
          ? "opacity-60 bg-gray-50 border-gray-200"
          : ""
      } ${isOverdue() ? "border-red-300 bg-red-50" : ""} ${
        quickTask.conversionFlag ? "bg-blue-50 border-blue-200" : ""
      }`}
    >
      {/* Conversion Flag */}
      {quickTask.conversionFlag && (
        <div className="absolute -top-2 left-2 right-2">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md text-center">
            {quickTask.conversionFlag}
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleStatusToggle}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            quickTask.status === "Done"
              ? "bg-green-500 border-green-500 text-white"
              : "border-gray-300 hover:border-green-400"
          }`}
          disabled={quickTask.conversionFlag}
        >
          {quickTask.status === "Done" && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyPress}
              className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              maxLength="100"
            />
          ) : (
            <div
              onClick={() => !quickTask.conversionFlag && setIsEditing(true)}
              className={`text-sm font-medium cursor-text hover:bg-yellow-100 px-2 py-1 rounded ${
                quickTask.status === "Done"
                  ? "line-through text-gray-500"
                  : "text-gray-900"
              }`}
            >
              {quickTask.title}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-2 text-xs">
            {/* Priority Badge */}
            <span
              className={`px-2 py-1 rounded-full font-medium ${getPriorityColor(quickTask.priority)}`}
            >
              {quickTask.priority}
            </span>

            {/* Due Date Badge */}
            <span
              className={`px-2 py-1 rounded-full font-medium ${
                isOverdue()
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              📅 {formatDueDate(quickTask.dueDate)}
            </span>

            {/* Private indicator */}
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
              🔒 Private
            </span>
          </div>
        </div>

        {/* Actions */}
        {!quickTask.conversionFlag && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Convert Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowConvertOptions(!showConvertOptions)}
                className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Convert to Full Task"
              >
                <span className="text-xs">↗️</span>
              </button>

              {/* Convert Options Dropdown */}
              {showConvertOptions && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[120px]">
                  <div className="p-1.5 border-b border-gray-100">
                    <div className="text-xs font-medium text-gray-700">
                      Convert to:
                    </div>
                  </div>
                  <div className="py-0.5">
                    {[
                      { type: "regular", icon: "📋", label: "Regular" },
                      { type: "recurring", icon: "🔄", label: "Recurring" },
                      { type: "milestone", icon: "🎯", label: "Milestone" },
                      { type: "approval", icon: "✅", label: "Approval" },
                    ].map((option) => (
                      <button
                        key={option.type}
                        onClick={() => handleConvert(option.type)}
                        className="w-full px-2 py-1 text-left text-xs hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
                      >
                        <span className="text-xs">{option.icon}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={() => {
                if (confirm("Delete this quick task?")) {
                  deleteQuickTask(quickTask.id);
                }
              }}
              className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete Quick Task"
            >
              <svg
                className="w-3 h-3"
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
        )}
      </div>

      {/* Click outside to close convert options */}
      {showConvertOptions && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowConvertOptions(false)}
        />
      )}
    </div>
  );
}
