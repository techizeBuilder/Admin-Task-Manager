import React, { useState, useEffect } from "react";
import useTasksStore from "../../stores/tasksStore";
import QuickTask from "./QuickTask";

export default function QuickTaskPanel() {
  const { quickTasks, addQuickTask, archiveCompletedQuickTasks } =
    useTasksStore();

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [filter, setFilter] = useState("active"); // 'active', 'done', 'all'

  // Auto-archive completed tasks on component mount and periodically
  useEffect(() => {
    archiveCompletedQuickTasks();

    // Set up interval to check for auto-archiving every hour
    const interval = setInterval(
      () => {
        archiveCompletedQuickTasks();
      },
      60 * 60 * 1000,
    ); // 1 hour

    return () => clearInterval(interval);
  }, [archiveCompletedQuickTasks]);

  const handleQuickAdd = (e) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
      alert("Quick Task cannot be empty.");
      return;
    }

    // Check for similar existing tasks
    const similarTask = quickTasks.find(
      (task) =>
        task.title.toLowerCase().includes(newTaskTitle.toLowerCase().trim()) &&
        task.status !== "Archived",
    );

    if (similarTask) {
      const proceed = confirm("A similar quick task exists. Continue?");
      if (!proceed) {
        return;
      }
    }

    addQuickTask({
      title: newTaskTitle.trim(),
    });

    setNewTaskTitle("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleQuickAdd(e);
    }
  };

  const filteredTasks = quickTasks
    .filter((task) => {
      switch (filter) {
        case "active":
          return task.status === "Open";
        case "done":
          return task.status === "Done";
        case "all":
          return task.status !== "Archived";
        default:
          return task.status !== "Archived";
      }
    })
    .sort((a, b) => {
      // Sort by status (Open first), then by due date
      if (a.status !== b.status) {
        if (a.status === "Open") return -1;
        if (b.status === "Open") return 1;
      }
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

  const stats = {
    total: quickTasks.filter((t) => t.status !== "Archived").length,
    open: quickTasks.filter((t) => t.status === "Open").length,
    done: quickTasks.filter((t) => t.status === "Done").length,
    overdue: quickTasks.filter((t) => {
      const today = new Date();
      const dueDate = new Date(t.dueDate);
      return dueDate < today && t.status === "Open";
    }).length,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            <h2 className="text-base font-semibold text-gray-900">
              My Quick Tasks
            </h2>
            <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full font-medium">
              {stats.open}
            </span>
          </div>
          <button
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAllTasks ? "Less" : "All"}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-3 text-xs text-gray-600 mb-2">
          <span>Total: {stats.total}</span>
          <span>Done: {stats.done}</span>
          {stats.overdue > 0 && (
            <span className="text-red-600">Overdue: {stats.overdue}</span>
          )}
        </div>

        {/* Quick Entry Bar - Sticky Note Style */}
        <form onSubmit={handleQuickAdd} className="relative">
          <div className="bg-yellow-100 border border-yellow-300 rounded-md p-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Quick task (Enter to save)..."
                  className="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none placeholder-yellow-700"
                  maxLength="100"
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-yellow-600">
                  ⏎
                </div>
              </div>
              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </form>

        {/* Filter Tabs */}
        {stats.total > 0 && (
          <div className="flex gap-1 mt-2">
            {[
              { key: "active", label: "Active", count: stats.open },
              { key: "done", label: "Done", count: stats.done },
              { key: "all", label: "All", count: stats.total },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                  filter === tab.key
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tasks List */}
      <div className="p-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {filter === "active" ? (
              <div>
                <div className="text-lg mb-1">🎉</div>
                <p className="text-xs">No active tasks!</p>
              </div>
            ) : filter === "done" ? (
              <div>
                <div className="text-lg mb-1">📝</div>
                <p className="text-xs">No completed tasks.</p>
              </div>
            ) : (
              <div>
                <div className="text-lg mb-1">📋</div>
                <p className="text-xs">No quick tasks yet.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {(showAllTasks ? filteredTasks : filteredTasks.slice(0, 5)).map(
              (quickTask) => (
                <QuickTask
                  key={quickTask.id}
                  quickTask={quickTask}
                  onConvert={(newTask) => {
                    console.log("Quick task converted to:", newTask);
                    // Could show a toast notification here
                  }}
                />
              ),
            )}

            {!showAllTasks && filteredTasks.length > 5 && (
              <button
                onClick={() => setShowAllTasks(true)}
                className="w-full py-1 text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              >
                +{filteredTasks.length - 5} more
              </button>
            )}
          </div>
        )}
      </div>

      {/* Auto-archive Notice */}
      {stats.done > 0 && (
        <div className="px-3 pb-3">
          <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
            💡 Auto-archive after{" "}
            {useTasksStore.getState().quickTaskSettings.autoArchiveDays} days
          </div>
        </div>
      )}
    </div>
  );
}
