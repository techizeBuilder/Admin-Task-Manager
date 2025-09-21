import { X } from "lucide-react";
import { useState } from "react";

export const FullTaskFormModal = ({ taskData, onSave, onClose }) => {
   const [title, setTitle] = useState(taskData.text);
  const [priority, setPriority] = useState(taskData.priority);
  const [dueDate, setDueDate] = useState(taskData.dueDate);
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!title.trim()) {
      setError("Title cannot be blank.");
      return;
    }
    // In a real app, you would pass the updated data back:
    // onSave({ ...taskData, text: title, priority, dueDate });
    onSave(); // For this simulation, we just trigger the parent's save logic.
  };
  return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Create New {taskData.type} Task
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="task-title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              className={`mt-1 w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition ${
                error ? "border-red-500" : "border-gray-300"
              }`}
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className="text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="task-due-date" className="text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
};
