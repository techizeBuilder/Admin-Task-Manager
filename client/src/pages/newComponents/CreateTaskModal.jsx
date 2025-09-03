import React, { useState } from 'react';

export default function CreateTaskModal({ onClose, onSubmit }) {
  const [selectedTaskType, setSelectedTaskType] = useState('regular');
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Normal');

  const taskTypes = [
    {
      id: 'regular',
      name: 'Regular Task',
      description: 'Standard one-time task',
      icon: '📋',
      iconBg: 'bg-blue-500',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'recurring',
      name: 'Recurring Task', 
      description: 'Repeats on schedule',
      icon: '🔄',
      iconBg: 'bg-blue-500',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'milestone',
      name: 'Milestone',
      description: 'Project checkpoint',
      icon: '🎯',
      iconBg: 'bg-red-500',
      borderColor: 'border-red-500',
      bgColor: 'bg-red-50'
    },
    {
      id: 'approval',
      name: 'Approval Task',
      description: 'Requires approval',
      icon: '✅',
      iconBg: 'bg-green-500',
      borderColor: 'border-green-500',
      bgColor: 'bg-green-50'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: taskName,
      description,
      assignedTo,
      priority,
      taskType: selectedTaskType,
      category: "general",
      visibility: "private",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: [],
      collaborators: [],
      attachments: []
    });
  };

  const characterCount = taskName.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            data-testid="close-modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Type Selection */}
          <div className="bg-gray-50 p-4 rounded-lg">
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
                      ? `${type.borderColor} ${type.bgColor}`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  data-testid={`task-type-${type.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedTaskType === type.id ? type.iconBg : 'bg-gray-200'
                    } text-white`}>
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Task Details</h3>
            <p className="text-sm text-gray-600 mb-4">Fill in the basic information for your task</p>

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
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              data-testid="button-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!taskName || !assignedTo}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
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