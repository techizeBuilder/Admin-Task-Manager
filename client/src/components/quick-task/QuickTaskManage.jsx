import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  ArrowUpRight,
  Plus,
  Flag,
  Calendar,
  User,
  Archive,
  ListChecks,
} from "lucide-react";
import ConversionModal from "./ConversionModal";
import { FullTaskFormModal } from "./FullTaskFormModal";

const QuickTaskManage = () => {
  const getFutureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-CA");
  };

  const [tasks, setTasks] = useState([
    {
      id: 1,
      text: "Draft the weekly report summary",
      createdBy: "Alex Green",
      priority: "high",
      dueDate: getFutureDate(1),
      status: "open",
      convertedTo: null,
    },
    {
      id: 2,
      text: "Review PR #451 from John",
      createdBy: "Alex Green",
      priority: "medium",
      dueDate: getFutureDate(2),
      status: "done",
      convertedTo: null,
    },
    {
      id: 3,
      text: "Follow up with the design team on mockups",
      createdBy: "Alex Green",
      priority: "low",
      dueDate: getFutureDate(5),
      status: "open",
      convertedTo: "TSK-1024",
    },
  ]);
  const [newTaskText, setNewTaskText] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [conversionModal, setConversionModal] = useState({
    isOpen: false,
    taskId: null,
  });
    const [fullTaskForm, setFullTaskForm] = useState({
    isOpen: false,
    data: null,
  });
  const handleAddTask = (e) => {
    if (e.key === "Enter" && newTaskText.trim() !== "") {
      const newTask = {
        id: Date.now(),
        text: newTaskText.trim(),
        createdBy: "Current User",
        priority: "low",
        dueDate: getFutureDate(3),
        status: "open",
        convertedTo: null,
      };
      setTasks([newTask, ...tasks]);
      setNewTaskText("");
      setShowInput(false);
    }
  };

  // 1. User clicks the convert icon
  const handleStartConversion = (taskId) => {
    setConversionModal({ isOpen: true, taskId });
  };
  // 2. User selects a task type from the modal
  const handleSelectTaskType = (type) => {
    const taskToConvert = tasks.find(
      (task) => task.id === conversionModal.taskId
    );
    if (!taskToConvert) return;

    setFullTaskForm({
      isOpen: true,
      data: {
        ...taskToConvert,
        type: type, // Add the selected type
      },
    });
    setConversionModal({ isOpen: false, taskId: null }); // Close the selection modal
  };
    // 3. User "saves" the full task from the simulated form
  const handleSaveFullTask = () => {
    const { id } = fullTaskForm.data;
    // This is where you would typically make an API call to create the new task.
    // For this simulation, we'll just update the original quick task.
    convertToTask(id);
    setFullTaskForm({ isOpen: false, data: null }); // Close the form
  };
    const cancelConversion = () => {
    setConversionModal({ isOpen: false, taskId: null });
    setFullTaskForm({ isOpen: false, data: null });
  };
  const toggleTaskStatus = (taskId) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          if (task.status === "open") return { ...task, status: "done" };
          if (task.status === "done") return { ...task, status: "open" };
        }
        return task;
      })
    );
  };

  const archiveTask = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: "archived" } : task
      )
    );
  };

  const convertToTask = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "done",
              convertedTo: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
            }
          : task
      )
    );
  };

  const changePriority = (taskId) => {
    const priorities = ["low", "medium", "high"];
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const currentIndex = priorities.indexOf(task.priority);
          const nextIndex = (currentIndex + 1) % priorities.length;
          return { ...task, priority: priorities[nextIndex] };
        }
        return task;
      })
    );
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const visibleTasks = tasks.filter((task) => task.status !== "archived");

  return (
    <div className="bg-white shadow-sm border " data-testid="widget-quick-task">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-4 rounded-md bg-blue-100 text-blue-600">
            <ListChecks size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Quick Tasks</h2>
            <p className="text-sm text-gray-500">Capture and manage personal to-dos</p>
          </div>
        </div>

        <button
          onClick={() => setShowInput(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Add Quick Task
        </button>
      </div>

      <div className="p-6 space-y-4">
        {/* Show input if Add Task clicked */}
        {showInput && (
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={handleAddTask}
            placeholder="Type your task and press Enter..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        )}

        {/* Task list like table */}
        <div className="divide-y divide-gray-100">
          {visibleTasks.map((task) => {
            const isConverted = !!task.convertedTo;
            const isDone = task.status === "done" || isConverted;

            return (
              <div
                key={task.id}
                className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded-lg transition"
              >
                {/* Checkbox + Title */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    disabled={isConverted}
                  >
                    {isDone ? (
                      <CheckSquare className="text-blue-600" size={20} />
                    ) : (
                      <Square className="text-gray-400 hover:text-blue-500" size={20} />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p
                      className={`font-medium truncate ${
                        isDone ? "text-gray-500 line-through" : "text-gray-800"
                      }`}
                    >
                      {task.text}
                    </p>
                    {isConverted && (
                      <span className="text-xs font-semibold text-purple-600">
                        Moved to Task → {task.convertedTo}
                      </span>
                    )}
                  </div>
                </div>

                {/* Table-like info */}
                {!isConverted && (
                  <div className="flex items-center gap-6 text-sm flex-shrink-0">
                    <button
                      onClick={() => changePriority(task.id)}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityStyle(
                        task.priority
                      )}`}
                    >
                      {task.priority.toUpperCase()}
                    </button>

                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar size={14} />
                      {task.dueDate}
                    </div>

                    <div className="flex items-center gap-1 text-gray-500">
                      <User size={14} />
                      {task.createdBy}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartConversion(task.id)}
                        className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                        title="Convert to Task"
                      >
                        <ArrowUpRight size={14} />
                      </button>
                      <button
                        onClick={() => archiveTask(task.id)}
                        className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                        title="Archive Task"
                      >
                        <Archive size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
        {/* Conversion Type Selection Modal */}
      {conversionModal.isOpen && (
        <ConversionModal
          onSelectType={handleSelectTaskType}
          onClose={cancelConversion}
        />
      )}

      {/* Simulated Full Task Form Modal */}
      {fullTaskForm.isOpen && (
        <FullTaskFormModal
          taskData={fullTaskForm.data}
          onSave={handleSaveFullTask}
          onClose={cancelConversion}
        />
      )}
    </div>
  );
};

export default QuickTaskManage;
