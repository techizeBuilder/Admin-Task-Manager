import React from 'react';

export function RegularTaskContent({ 
  taskName, 
  setTaskName, 
  description, 
  setDescription, 
  assignedTo, 
  setAssignedTo, 
  priority, 
  setPriority,
  characterCount 
}) {
  return (
    <div className="space-y-4">
      {/* Task Name */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Task Name *
          </label>
          <span className="text-xs text-gray-500">{characterCount}/20</span>
        </div>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Short, clear title..."
          maxLength={20}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          data-testid="input-task-name"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Guideline: Short, clear title</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <div className="border border-gray-300 rounded-lg">
          {/* Rich Text Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <select className="text-sm border-none bg-transparent focus:outline-none">
              <option>Normal</option>
              <option>Heading 1</option>
              <option>Heading 2</option>
            </select>
            <div className="flex items-center gap-1 ml-2">
              <button type="button" className="p-1 hover:bg-gray-200 rounded text-sm font-bold">
                B
              </button>
              <button type="button" className="p-1 hover:bg-gray-200 rounded text-sm italic">
                I
              </button>
              <button type="button" className="p-1 hover:bg-gray-200 rounded text-sm underline">
                U
              </button>
              <button type="button" className="p-1 hover:bg-gray-200 rounded text-sm line-through">
                S
              </button>
              <button type="button" className="p-1 hover:bg-gray-200 rounded">
                🔗
              </button>
              <button type="button" className="p-1 hover:bg-gray-200 rounded">
                📋
              </button>
              <button type="button" className="p-1 hover:bg-gray-200 rounded">
                📝
              </button>
              <button type="button" className="p-1 hover:bg-gray-200 rounded text-sm">
                Aa
              </button>
            </div>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border-none resize-none focus:outline-none rounded-b-lg"
            rows={4}
            placeholder="Describe the task details..."
            data-testid="textarea-description"
          />
        </div>
      </div>

      {/* Assigned To and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To *
          </label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="select-assigned-to"
            required
          >
            <option value="">Select assignee...</option>
            <option value="current">Current User</option>
            <option value="john">John Smith</option>
            <option value="sarah">Sarah Wilson</option>
            <option value="mike">Mike Johnson</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority *
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="select-priority"
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default RegularTaskContent;