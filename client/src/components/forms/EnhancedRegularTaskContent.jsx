import React, { useState } from 'react';

export function EnhancedRegularTaskContent({ 
  taskName, 
  setTaskName, 
  description, 
  setDescription, 
  assignedTo, 
  setAssignedTo, 
  priority, 
  setPriority,
  characterCount,
  category,
  setCategory,
  dueDate,
  setDueDate,
  tags,
  setTags,
  collaborators,
  setCollaborators,
  showRecurring,
  setShowRecurring,
  showMilestone,
  setShowMilestone,
  showApproval,
  setShowApproval
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

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

      {/* Category and Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="select-category"
          >
            <option value="">Select category...</option>
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="research">Research</option>
            <option value="testing">Testing</option>
            <option value="general">General</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date *
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="input-due-date"
            required
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

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Add tags separated by commas..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="input-tags"
        />
      </div>

      {/* Special Task Type Checkboxes */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700">Special Task Options</h4>
        
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showRecurring}
              onChange={(e) => setShowRecurring(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              data-testid="checkbox-recurring"
            />
            <div className="flex items-center gap-2">
              <span className="text-lg">🔄</span>
              <span className="text-sm font-medium">Make this recurring</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showMilestone}
              onChange={(e) => setShowMilestone(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              data-testid="checkbox-milestone"
            />
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="text-sm font-medium">Mark as milestone</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showApproval}
              onChange={(e) => setShowApproval(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              data-testid="checkbox-approval"
            />
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span className="text-sm font-medium">Requires approval</span>
            </div>
          </label>
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <div className="pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          data-testid="toggle-advanced"
        >
          <svg
            className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Process
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select process...</option>
                  <option value="development">Development Process</option>
                  <option value="review">Review Process</option>
                  <option value="testing">Testing Process</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Form
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select form...</option>
                  <option value="bug-report">Bug Report Form</option>
                  <option value="feature-request">Feature Request Form</option>
                  <option value="feedback">Feedback Form</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dependencies
              </label>
              <select
                multiple
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              >
                <option value="task1">Complete Database Setup</option>
                <option value="task2">Finish UI Design</option>
                <option value="task3">API Development</option>
                <option value="task4">User Testing</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Select tasks that must be completed first</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Type Classification
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="simple">Simple</option>
                <option value="complex">Complex</option>
                <option value="research">Research</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedRegularTaskContent;