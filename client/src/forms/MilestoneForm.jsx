import React from 'react';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { MultiSelect } from '../components/ui/MultiSelect';
import ReactQuill from 'react-quill';

export function MilestoneForm({ 
  formData, 
  handleInputChange, 
  validationErrors = {},
  today 
}) {
  const handleMilestoneChange = (field, value) => {
    handleInputChange('milestone', {
      ...formData.milestone,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Milestone Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Milestone Type *
        </label>
        <select
          value={formData.milestone?.type || 'standalone'}
          onChange={(e) => handleMilestoneChange('type', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="select-milestone-type"
        >
          <option value="standalone">Standalone</option>
          <option value="linked">Linked</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Standalone milestones are independent. Linked milestones depend on other tasks.
        </p>
      </div>

      {/* Link to Tasks - Only visible if Milestone Type = Linked */}
      {formData.milestone?.type === 'linked' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link to Tasks/Sub-tasks *
          </label>
          <MultiSelect
            options={[
              { value: "task-1", label: "Setup Project Environment" },
              { value: "task-2", label: "Create Database Schema" },
              { value: "task-3", label: "Design UI Mockups" },
              { value: "task-4", label: "Implement Authentication" },
              { value: "task-5", label: "Write Unit Tests" },
              { value: "task-6", label: "Deploy to Staging" },
            ]}
            value={formData.milestone?.linkedTasks || []}
            onChange={(selectedValues) => handleMilestoneChange('linkedTasks', selectedValues)}
            placeholder="Search and select tasks..."
            dataTestId="multi-select-milestone-tasks"
          />
          <p className="text-xs text-gray-500 mt-1">
            Select tasks that must be completed before this milestone can be achieved.
          </p>
          {validationErrors.linkedTasks && (
            <p className="text-red-600 text-sm mt-1" data-testid="error-linked-tasks">
              {validationErrors.linkedTasks}
            </p>
          )}
        </div>
      )}

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date *
        </label>
        <input
          type="date"
          value={formData.milestone?.dueDate || ''}
          onChange={(e) => handleMilestoneChange('dueDate', e.target.value)}
          min={today}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            validationErrors.milestoneDueDate
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          required
          data-testid="input-milestone-due-date"
        />
        {formData.milestone?.type === 'linked' && (
          <p className="text-xs text-blue-600 mt-1">
            💡 Suggested: Use the latest due date among selected dependencies
          </p>
        )}
        {validationErrors.milestoneDueDate && (
          <p className="text-red-600 text-sm mt-1" data-testid="error-milestone-due-date">
            {validationErrors.milestoneDueDate}
          </p>
        )}
      </div>

      {/* Assigned To */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assigned To *
        </label>
        <SearchableSelect
          options={[
            { value: "self", label: "Self" },
            { value: "john", label: "John Doe" },
            { value: "jane", label: "Jane Smith" },
            { value: "mike", label: "Mike Johnson" },
            { value: "sarah", label: "Sarah Wilson" },
          ]}
          value={formData.milestone?.assignedTo || 'self'}
          onChange={(option) => handleMilestoneChange('assignedTo', option ? option.value : 'self')}
          placeholder="Select assignee..."
          dataTestId="searchable-select-milestone-assignee"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <ReactQuill
            value={formData.milestone?.description || ''}
            onChange={(content) => handleMilestoneChange('description', content)}
            theme="snow"
            placeholder="Describe the milestone objectives and success criteria..."
            className="custom-editor bg-white"
            data-testid="rich-text-milestone-description"
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'],
                ['clean']
              ],
            }}
          />
        </div>
        {validationErrors.milestoneDescription && (
          <p className="text-red-600 text-sm mt-1" data-testid="error-milestone-description">
            {validationErrors.milestoneDescription}
          </p>
        )}
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Visibility
        </label>
        <select
          value={formData.milestone?.visibility || 'project'}
          onChange={(e) => handleMilestoneChange('visibility', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="select-milestone-visibility"
        >
          <option value="project">Project Team</option>
          <option value="organization">Organization</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Inherits parent project visibility by default.
        </p>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select
          value={formData.milestone?.priority || 'medium'}
          onChange={(e) => handleMilestoneChange('priority', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="select-milestone-priority"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Collaborators */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Collaborators (Optional)
        </label>
        <MultiSelect
          options={[
            { value: "john", label: "John Smith" },
            { value: "jane", label: "Jane Smith" },
            { value: "mike", label: "Mike Johnson" },
            { value: "sarah", label: "Sarah Wilson" },
            { value: "alex", label: "Alex Johnson" },
          ]}
          value={formData.milestone?.collaborators || []}
          onChange={(selectedValues) => handleMilestoneChange('collaborators', selectedValues)}
          placeholder="Select collaborators..."
          dataTestId="multi-select-milestone-collaborators"
        />
        <p className="text-xs text-gray-500 mt-1">
          Users who will receive notifications and can view milestone progress.
        </p>
      </div>

      {/* Milestone Status Preview */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
          <span className="text-lg">⭐</span>
          Milestone Status Flow
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-gray-400">⭐</span>
            <span className="text-gray-600">Not Started</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-500">⭐</span>
            <span className="text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-600">⭐</span>
            <span className="text-gray-600">Ready to Mark</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-500">⭐</span>
            <span className="text-gray-600">Achieved</span>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          {formData.milestone?.type === 'linked' 
            ? "Linked milestones progress automatically based on dependencies completion."
            : "Standalone milestones can be marked as achieved manually by the assignee."
          }
        </p>
      </div>
    </div>
  );
}

export default MilestoneForm;