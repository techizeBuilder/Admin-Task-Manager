import React, { useState, useEffect } from 'react';

// Primary Fields Component
const PrimaryFields = ({ 
  formData, 
  updateField, 
  errors, 
  isOrgUser = false,
  isSoloUser = false 
}) => {
  const [attachments, setAttachments] = useState([]);
  const [totalSize, setTotalSize] = useState(0);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    let newTotalSize = totalSize;
    const validFiles = [];

    files.forEach(file => {
      if (newTotalSize + file.size <= 5 * 1024 * 1024) { // 5MB limit
        validFiles.push(file);
        newTotalSize += file.size;
      }
    });

    if (validFiles.length > 0) {
      const newAttachments = [...attachments, ...validFiles];
      setAttachments(newAttachments);
      setTotalSize(newTotalSize);
      updateField('attachments', newAttachments);
    }
  };

  const removeAttachment = (index) => {
    const file = attachments[index];
    const newAttachments = attachments.filter((_, i) => i !== index);
    const newTotalSize = totalSize - file.size;
    setAttachments(newAttachments);
    setTotalSize(newTotalSize);
    updateField('attachments', newAttachments);
  };

  const handlePriorityChange = (priority) => {
    updateField('priority', priority);
    
    // Auto-set due date based on priority
    const today = new Date();
    let dueDate;
    
    switch(priority) {
      case 'Critical':
        dueDate = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day
        break;
      case 'High':
        dueDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
        break;
      case 'Medium':
        dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case 'Low':
      default:
        dueDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
        break;
    }
    
    updateField('dueDate', dueDate.toISOString().split('T')[0]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Task Name */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Task Name *
          </label>
          <span className={`text-xs ${formData.taskName.length > 15 ? 'text-red-500' : 'text-gray-500'}`}>
            {formData.taskName.length}/20
          </span>
        </div>
        <input
          type="text"
          value={formData.taskName}
          onChange={(e) => updateField('taskName', e.target.value)}
          placeholder="Enter task name..."
          maxLength={20}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.taskName ? 'border-red-500' : 'border-gray-300'
          }`}
          data-testid="input-task-name"
        />
        {errors.taskName && (
          <p className="text-red-500 text-xs mt-1">{errors.taskName}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {/* Rich Text Toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded text-sm font-bold"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded text-sm italic"
              title="Italic"
            >
              I
            </button>
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded text-sm"
              title="Bullet List"
            >
              •
            </button>
            <button
              type="button"
              className="p-1 hover:bg-gray-200 rounded text-sm"
              title="Link"
            >
              🔗
            </button>
          </div>
          <textarea
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe the task details..."
            rows={4}
            className="w-full px-3 py-2 border-none resize-none focus:outline-none"
            data-testid="textarea-description"
          />
        </div>
      </div>

      {/* Assigned To and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To *
          </label>
          <select
            value={formData.assignedTo}
            onChange={(e) => updateField('assignedTo', e.target.value)}
            disabled={isSoloUser}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isSoloUser ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
            } ${errors.assignedTo ? 'border-red-500' : ''}`}
            data-testid="select-assigned-to"
          >
            <option value="self">Self</option>
            {isOrgUser && (
              <>
                <option value="john">John Smith</option>
                <option value="sarah">Sarah Wilson</option>
                <option value="mike">Mike Johnson</option>
              </>
            )}
          </select>
          {errors.assignedTo && (
            <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority *
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="select-priority"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Due Date *
        </label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => updateField('dueDate', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.dueDate ? 'border-red-500' : 'border-gray-300'
          }`}
          data-testid="input-due-date"
        />
        {errors.dueDate && (
          <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
        )}
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Visibility
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={formData.visibility === 'private'}
              onChange={(e) => updateField('visibility', e.target.value)}
              className="mr-2"
              data-testid="radio-private"
            />
            <span className="text-sm">Private</span>
          </label>
          {!isSoloUser && (
            <label className="flex items-center">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={formData.visibility === 'public'}
                onChange={(e) => updateField('visibility', e.target.value)}
                className="mr-2"
                data-testid="radio-public"
              />
              <span className="text-sm">Public</span>
            </label>
          )}
        </div>
      </div>

      {/* Labels/Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Labels / Tags
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => updateField('tags', e.target.value)}
          placeholder="Add tags separated by commas..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="input-tags"
        />
        <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            className="hidden"
            id="file-upload"
            data-testid="input-attachments"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="text-sm text-gray-600">Click to upload files</span>
            <span className="text-xs text-gray-500">
              Max 5MB total • PDF, DOC, Images
            </span>
          </label>
        </div>
        
        {/* File List */}
        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Uploaded Files</span>
              <span className="text-xs text-gray-500">
                {formatFileSize(totalSize)} / 5 MB
              </span>
            </div>
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <span className="text-xs text-gray-400">({formatFileSize(file.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  data-testid={`remove-attachment-${index}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {errors.attachments && (
          <p className="text-red-500 text-xs mt-1">{errors.attachments}</p>
        )}
      </div>
    </div>
  );
};

// Advanced Fields Component
const AdvancedFields = ({ formData, updateField }) => {
  return (
    <div className="space-y-6">
      {/* Reference Process */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reference Process
        </label>
        <select
          value={formData.referenceProcess}
          onChange={(e) => updateField('referenceProcess', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="select-reference-process"
        >
          <option value="">Select process...</option>
          <option value="development">Development Process</option>
          <option value="review">Review Process</option>
          <option value="testing">Testing Process</option>
          <option value="deployment">Deployment Process</option>
        </select>
      </div>

      {/* Custom Form */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Form
        </label>
        <select
          value={formData.customForm}
          onChange={(e) => updateField('customForm', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="select-custom-form"
        >
          <option value="">Select form template...</option>
          <option value="bug-report">Bug Report Form</option>
          <option value="feature-request">Feature Request Form</option>
          <option value="user-feedback">User Feedback Form</option>
          <option value="task-review">Task Review Form</option>
        </select>
      </div>

      {/* Dependencies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dependencies
        </label>
        <select
          multiple
          value={formData.dependencies}
          onChange={(e) => updateField('dependencies', Array.from(e.target.selectedOptions, option => option.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
          data-testid="select-dependencies"
        >
          <option value="task-1">Complete Database Setup</option>
          <option value="task-2">Finish UI Design</option>
          <option value="task-3">API Development</option>
          <option value="task-4">User Testing Phase</option>
          <option value="task-5">Security Review</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple tasks</p>
      </div>

      {/* Task Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Type *
        </label>
        <select
          value={formData.taskType}
          onChange={(e) => updateField('taskType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="select-task-type"
        >
          <option value="Simple">Simple</option>
          <option value="Recurring">Recurring</option>
          <option value="Approval">Approval</option>
        </select>
      </div>
    </div>
  );
};

// Main RegularTaskForm Component
export const RegularTaskForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = {},
  isOrgUser = false,
  isSoloUser = false 
}) => {
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    assignedTo: 'self',
    priority: 'Low',
    dueDate: '',
    visibility: 'private',
    tags: '',
    attachments: [],
    referenceProcess: '',
    customForm: '',
    dependencies: [],
    taskType: 'Simple',
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Set initial due date based on default priority
    if (!formData.dueDate) {
      const today = new Date();
      const defaultDueDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days for Low priority
      updateField('dueDate', defaultDueDate.toISOString().split('T')[0]);
    }
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.taskName.trim()) {
      newErrors.taskName = 'Task name is required';
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Assigned to is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date must be today or later';
    }

    // Check file size limit
    const totalSize = formData.attachments.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 5 * 1024 * 1024) {
      newErrors.attachments = 'Total file size must not exceed 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          <PrimaryFields
            formData={formData}
            updateField={updateField}
            errors={errors}
            isOrgUser={isOrgUser}
            isSoloUser={isSoloUser}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowAdvanced(true)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
            data-testid="button-more-options"
          >
            More Options
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
              data-testid="button-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              data-testid="button-save"
            >
              Save Task
            </button>
          </div>
        </div>
      </form>

      {/* Advanced Options Modal */}
      {showAdvanced && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Options</h3>
              <button
                onClick={() => setShowAdvanced(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                data-testid="close-advanced-modal"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <AdvancedFields
                formData={formData}
                updateField={updateField}
              />
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAdvanced(false)}
                className="px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                data-testid="button-advanced-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowAdvanced(false)}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                data-testid="button-advanced-save"
              >
                Save Options
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegularTaskForm;