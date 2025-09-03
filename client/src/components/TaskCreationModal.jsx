import React, { useState } from 'react';

export function TaskCreationModal({ isOpen, onClose, onSubmit }) {
  const [selectedTaskType, setSelectedTaskType] = useState('regular');
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Normal');

  if (!isOpen) return null;

  const taskTypes = [
    {
      id: 'regular',
      name: 'Regular Task',
      description: 'Standard one-time task',
      icon: '📋',
      color: 'blue'
    },
    {
      id: 'recurring',
      name: 'Recurring Task', 
      description: 'Repeats on schedule',
      icon: '🔄',
      color: 'blue'
    },
    {
      id: 'milestone',
      name: 'Milestone',
      description: 'Project checkpoint',
      icon: '🎯',
      color: 'red'
    },
    {
      id: 'approval',
      name: 'Approval Task',
      description: 'Requires approval',
      icon: '✅',
      color: 'green'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      type: selectedTaskType,
      name: taskName,
      description,
      assignedTo,
      priority
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            data-testid="close-modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Type Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Task Type</h3>
            <p className="text-sm text-gray-600 mb-4">Choose the type of task you want to create</p>
            
            <div className="grid grid-cols-2 gap-3">
              {taskTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedTaskType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedTaskType === type.id
                      ? `border-${type.color}-500 bg-${type.color}-50`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  data-testid={`task-type-${type.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedTaskType === type.id
                        ? `bg-${type.color}-500 text-white`
                        : `bg-${type.color}-100 text-${type.color}-600`
                    }`}>
                      <span className="text-lg">{type.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Task Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Task Details</h3>
            <p className="text-sm text-gray-600 mb-4">Fill in the basic information for your task</p>

            <div className="space-y-4">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name *
                  <span className="text-xs text-gray-500 ml-1">0/20</span>
                </label>
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
                  {/* Toolbar */}
                  <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
                    <select className="text-sm border-none bg-transparent">
                      <option>Normal</option>
                    </select>
                    <div className="flex items-center gap-1 ml-2">
                      <button type="button" className="p-1 hover:bg-gray-200 rounded">
                        <strong>B</strong>
                      </button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded">
                        <em>I</em>
                      </button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded">
                        <u>U</u>
                      </button>
                      <button type="button" className="p-1 hover:bg-gray-200 rounded">
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
                      <button type="button" className="p-1 hover:bg-gray-200 rounded">
                        Aa
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border-none resize-none focus:outline-none"
                    rows={4}
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
                    <option value="">Select assignee</option>
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
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              data-testid="button-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!taskName || !assignedTo}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              data-testid="button-create-task"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskCreationModal;