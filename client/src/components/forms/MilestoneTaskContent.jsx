import React from 'react';

export function MilestoneTaskContent({ 
  taskName, 
  setTaskName, 
  description, 
  setDescription, 
  assignedTo, 
  setAssignedTo, 
  priority, 
  setPriority,
  characterCount,
  milestoneType,
  setMilestoneType,
  linkedTasks,
  setLinkedTasks,
  dueDate,
  setDueDate
}) {
  return (
    <div className="space-y-4">
      {/* Task Name */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Milestone Name *
          </label>
          <span className="text-xs text-gray-500">{characterCount}/80</span>
        </div>
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Project milestone name..."
          maxLength={80}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          data-testid="input-milestone-name"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Clear milestone objective</p>
      </div>

      {/* Milestone Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Milestone Type *
        </label>
        <select
          value={milestoneType}
          onChange={(e) => setMilestoneType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          data-testid="select-milestone-type"
          required
        >
          <option value="project">Project Milestone</option>
          <option value="phase">Phase Completion</option>
          <option value="delivery">Delivery Milestone</option>
          <option value="review">Review Checkpoint</option>
        </select>
      </div>

      {/* Linked Tasks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Link to Tasks
        </label>
        <select
          multiple
          value={linkedTasks}
          onChange={(e) => setLinkedTasks(Array.from(e.target.selectedOptions, option => option.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
          data-testid="select-linked-tasks"
        >
          <option value="task1">Task: Setup Database</option>
          <option value="task2">Task: Design UI Components</option>
          <option value="task3">Task: API Development</option>
          <option value="task4">Task: Testing Phase</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Select tasks that contribute to this milestone</p>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Date *
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          data-testid="input-milestone-date"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
          placeholder="Describe the milestone objectives and success criteria..."
          data-testid="textarea-milestone-description"
        />
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            data-testid="select-milestone-assigned-to"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            data-testid="select-milestone-priority"
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

export default MilestoneTaskContent;