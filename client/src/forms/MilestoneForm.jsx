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
          required
        >
          <option value="standalone">Standalone</option>
          <option value="linked">Linked</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Standalone milestones are independent. Linked milestones depend on other tasks.
        </p>
      </div>

      {/* Link to Tasks/Sub-tasks - Only visible if Milestone Type = Linked */}
      {formData.milestone?.type === 'linked' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link to Tasks/Sub-tasks
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
            Prevent recursive linking (cannot link to itself or another milestone).
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
            If Linked: default = latest due date among dependencies
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
        <p className="text-xs text-gray-500 mt-1">
          Single select search dropdown (1 user only).
        </p>
        {validationErrors.assignedTo && (
          <p className="text-red-600 text-sm mt-1" data-testid="error-assigned-to">
            {validationErrors.assignedTo}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
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
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Visibility *
        </label>
        <select
          value={formData.milestone?.visibility || 'private'}
          onChange={(e) => handleMilestoneChange('visibility', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="select-milestone-visibility"
          required
        >
          <option value="private">Private</option>
          <option value="project">Project Team</option>
          <option value="organization">Organization</option>
          <option value="public">Public</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          If created under a project: inherit project visibility.
        </p>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority (Optional)
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
          Notify collaborators on milestone completion.
        </p>
      </div>
    </div>
  );
}

export default MilestoneForm;