import React, { useState, useEffect } from 'react';
import { useSubtask } from '../../contexts/SubtaskContext';

// Subtasks Panel component
function SubtasksPanel({ subtasks, parentTask, currentUser }) {
  const { openSubtaskDrawer } = useSubtask();
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showInlineAdd, setShowInlineAdd] = useState(false);
  const [subtaskList, setSubtaskList] = useState(subtasks);
  const [isCollapsed, setIsCollapsed] = useState(false); // Default open
  const [expandedSubtasks, setExpandedSubtasks] = useState([]);

  // On first open, expand all subtasks
  useEffect(() => {
    if (!isCollapsed && expandedSubtasks.length === 0 && subtaskList.length > 0) {
      setExpandedSubtasks(subtaskList.map(st => st.id));
    }
  }, [isCollapsed, subtaskList, expandedSubtasks.length]);

  const filteredSubtasks = subtaskList.filter((subtask) => {
    // Search filter based on title
    const matchesSearch =
      searchTerm === "" ||
      subtask.title.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter - handle both legacy and normalized status values
    const matchesStatus =
      filter === "all" ||
      (filter === "todo" &&
        (subtask.status === "to-do" ||
          subtask.status === "OPEN" ||
          subtask.status === "pending")) ||
      (filter === "in-progress" &&
        (subtask.status === "in-progress" ||
          subtask.status === "INPROGRESS")) ||
      (filter === "completed" &&
        (subtask.status === "completed" || subtask.status === "DONE"));

    return matchesSearch && matchesStatus;
  });

  const handleCreateSubtask = (subtaskData) => {
    const newSubtask = {
      id: Date.now(),
      ...subtaskData,
      parentTaskId: parentTask.id,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };
    setSubtaskList([...subtaskList, newSubtask]);
    setShowInlineAdd(false);
  };

  const handleUpdateSubtask = (updatedSubtask) => {
    setSubtaskList(
      subtaskList.map((st) =>
        st.id === updatedSubtask.id ? updatedSubtask : st,
      ),
    );
  };

  const handleDeleteSubtask = (subtaskId) => {
    setSubtaskList(subtaskList.filter((st) => st.id !== subtaskId));
    if (selectedSubtask?.id === subtaskId) {
      setSelectedSubtask(null);
    }
  };

  const canEditSubtask = (subtask) => {
    return (
      subtask.createdBy === currentUser.name ||
      subtask.assignee === currentUser.name ||
      currentUser.role === "admin"
    );
  };

  const canDeleteSubtask = (subtask) => {
    return (
      subtask.createdBy === currentUser.name || currentUser.role === "admin"
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "✅";
      case "in-progress":
        return "🔄";
      case "to-do":
        return "⭕";
      case "OPEN":
        return "⭕";
      case "INPROGRESS":
        return "🔄";
      case "DONE":
        return "✅";
      case "ONHOLD":
        return "⏸️";
      default:
        return "⭕";
    }
  };

  const completedCount = subtaskList.filter(
    (st) => st.status === "completed" || st.status === "DONE",
  ).length;
  const progressPercentage =
    subtaskList.length > 0
      ? Math.round((completedCount / subtaskList.length) * 100)
      : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-md">
      {/* Compact Header */}
      <div
        className="flex items-center justify-between px-3 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <button className="text-gray-500 hover:text-gray-700 text-xs">
            {isCollapsed ? "▶" : "▼"}
          </button>
          <h3 className="text-sm font-medium text-gray-900">
            Sub-tasks ({filteredSubtasks.length}/{subtaskList.length})
          </h3>
          {subtaskList.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-12 bg-gray-200 rounded-full h-1">
                <div
                  className="bg-green-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">
                {progressPercentage}%
              </span>
            </div>
          )}
        </div>

      {!isCollapsed && (
  <div className="flex items-center gap-2">
    <input
      type="text"
      placeholder="Search subtasks..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="text-sm border border-gray-300 rounded px-3 py-1 w-40 focus:w-56 transition-all duration-200"
      onClick={(e) => e.stopPropagation()}
    />
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="text-sm border border-gray-300 rounded px-3 py-1"
      onClick={(e) => e.stopPropagation()}
    >
      <option value="all">All Status</option>
      <option value="todo">To Do</option>
      <option value="in-progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
    <button
      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
      onClick={(e) => {
        e.stopPropagation();
        openSubtaskDrawer(parentTask);
      }}
    >
      + Add Sub-task
    </button>
  </div>
)}

      </div>

      {/* Compact Content */}
      {!isCollapsed && (
        <div>
     

          <div>
            {filteredSubtasks.map((subtask, index) => (
              <div key={subtask.id}>
                {/* Sub-task Row */}
                <div
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    expandedSubtasks.includes(subtask.id)
                      ? "bg-blue-50 border-l-2 border-l-blue-500"
                      : ""
                  }`}
                  onClick={() => {
                    setExpandedSubtasks(prev =>
                      prev.includes(subtask.id)
                        ? prev.filter(id => id !== subtask.id)
                        : [...prev, subtask.id]
                    );
                  }}
                >
                  <div className="flex items-center justify-between px-3 py-3">
                    {/* Left side - Name */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${
                          subtask.status === "completed" ||
                          subtask.status === "DONE"
                            ? "line-through text-gray-500"
                            : "text-gray-900"
                        }`}
                      >
                        {subtask.title}
                      </div>
                    </div>

                    {/* Center - Due Date */}
                    <div className="flex-shrink-0 mx-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          new Date(subtask.dueDate) < new Date() &&
                          subtask.status !== "completed" &&
                          subtask.status !== "DONE"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {subtask.dueDate}
                        {new Date(subtask.dueDate) < new Date() &&
                          subtask.status !== "completed" &&
                          subtask.status !== "DONE" && (
                            <span className="ml-1">🔴</span>
                          )}
                      </span>
                    </div>

                    {/* Right side - Status & Assignee */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(subtask.status)}</span>
                      <span className="text-xs text-gray-600 truncate max-w-20">
                        {subtask.assignee}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Sub-task Details */}
                {expandedSubtasks.includes(subtask.id) && (
                  <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2">{subtask.status}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Assignee:</span>
                        <span className="ml-2">{subtask.assignee}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Due Date:</span>
                        <span className="ml-2">{subtask.dueDate}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Priority:</span>
                        <span className="ml-2">{subtask.priority || "Medium"}</span>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                      {canEditSubtask(subtask) && (
                        <button
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          onClick={() => console.log("Edit subtask:", subtask.id)}
                        >
                          Edit
                        </button>
                      )}
                      {canDeleteSubtask(subtask) && (
                        <button
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          onClick={() => handleDeleteSubtask(subtask.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredSubtasks.length === 0 && (
            <div className="px-3 py-6 text-center text-gray-500 text-sm">
              {subtaskList.length === 0
                ? "No sub-tasks yet. Click 'Add Sub-task' to create one."
                : "No sub-tasks match the current filter."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}



export default SubtasksPanel;