import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import Select from 'react-select';
import 'react-quill/dist/quill.snow.css';
import '../styles/quill-custom.css';

// Special Task Features Component
const SpecialTaskFeatures = ({ taskType, formData, updateField }) => {
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [showMilestoneOptions, setShowMilestoneOptions] = useState(false);
  const [showApprovalOptions, setShowApprovalOptions] = useState(false);

  const frequencyOptions = [
    { value: 'daily', label: '📅 Daily' },
    { value: 'weekly', label: '🗓️ Weekly' },
    { value: 'monthly', label: '🗓️ Monthly' },
    { value: 'yearly', label: '📆 Yearly' }
  ];

  const approvalTypeOptions = [
    { value: 'any', label: '👤 Any Approver' },
    { value: 'all', label: '👥 All Approvers' },
    { value: 'majority', label: '🗳️ Majority Vote' }
  ];

  const taskOptions = [
    { value: 'task-1', label: 'Database Setup' },
    { value: 'task-2', label: 'UI Design' },
    { value: 'task-3', label: 'API Development' },
    { value: 'task-4', label: 'Testing Phase' }
  ];

  const approverOptions = [
    { value: 'john', label: 'John Smith' },
    { value: 'sarah', label: 'Sarah Wilson' },
    { value: 'mike', label: 'Mike Johnson' },
    { value: 'emma', label: 'Emma Davis' }
  ];

  if (taskType === 'regular') {
    return (
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Special Task Options</h4>
        
        <div className="space-y-3">
          {/* Recurring Toggle */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <span className="text-lg">🔄</span>
              <div>
                <span className="text-sm font-medium text-gray-900">Make Recurring</span>
                <p className="text-xs text-gray-600">Repeat this task automatically</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowRecurringOptions(!showRecurringOptions)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                showRecurringOptions 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-blue-600 border border-blue-600'
              }`}
            >
              {showRecurringOptions ? 'Hide Options' : 'Show Options'}
            </button>
          </div>

          {/* Milestone Toggle */}
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-3">
              <span className="text-lg">🎯</span>
              <div>
                <span className="text-sm font-medium text-gray-900">Mark as Milestone</span>
                <p className="text-xs text-gray-600">Important project checkpoint</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMilestoneOptions(!showMilestoneOptions)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                showMilestoneOptions 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-red-600 border border-red-600'
              }`}
            >
              {showMilestoneOptions ? 'Hide Options' : 'Show Options'}
            </button>
          </div>

          {/* Approval Toggle */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <span className="text-lg">✅</span>
              <div>
                <span className="text-sm font-medium text-gray-900">Requires Approval</span>
                <p className="text-xs text-gray-600">Need approval before completion</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowApprovalOptions(!showApprovalOptions)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                showApprovalOptions 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-green-600 border border-green-600'
              }`}
            >
              {showApprovalOptions ? 'Hide Options' : 'Show Options'}
            </button>
          </div>
        </div>

        {/* Recurring Options */}
        {showRecurringOptions && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Recurring Settings</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <Select
                  value={frequencyOptions.find(opt => opt.value === formData.recurringOptions.frequency)}
                  onChange={(option) => updateField('recurringOptions', { 
                    ...formData.recurringOptions, 
                    frequency: option.value 
                  })}
                  options={frequencyOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.recurringOptions.endDate}
                  onChange={(e) => updateField('recurringOptions', { 
                    ...formData.recurringOptions, 
                    endDate: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Milestone Options */}
        {showMilestoneOptions && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Milestone Settings</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Linked Tasks</label>
                <Select
                  value={taskOptions.filter(opt => formData.milestoneOptions.linkedTasks.includes(opt.value))}
                  onChange={(selectedOptions) => updateField('milestoneOptions', { 
                    ...formData.milestoneOptions, 
                    linkedTasks: selectedOptions ? selectedOptions.map(opt => opt.value) : [] 
                  })}
                  options={taskOptions}
                  isMulti
                  isSearchable
                  placeholder="Select linked tasks..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Success Criteria</label>
                <textarea
                  value={formData.milestoneOptions.successCriteria}
                  onChange={(e) => updateField('milestoneOptions', { 
                    ...formData.milestoneOptions, 
                    successCriteria: e.target.value 
                  })}
                  placeholder="Define what success looks like..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Approval Options */}
        {showApprovalOptions && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Approval Settings</h5>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approval Type</label>
                  <Select
                    value={approvalTypeOptions.find(opt => opt.value === formData.approvalOptions.approvalType)}
                    onChange={(option) => updateField('approvalOptions', { 
                      ...formData.approvalOptions, 
                      approvalType: option.value 
                    })}
                    options={approvalTypeOptions}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approval Deadline</label>
                  <input
                    type="date"
                    value={formData.approvalOptions.deadline}
                    onChange={(e) => updateField('approvalOptions', { 
                      ...formData.approvalOptions, 
                      deadline: e.target.value 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approvers</label>
                <Select
                  value={approverOptions.filter(opt => formData.approvalOptions.approvers.includes(opt.value))}
                  onChange={(selectedOptions) => updateField('approvalOptions', { 
                    ...formData.approvalOptions, 
                    approvers: selectedOptions ? selectedOptions.map(opt => opt.value) : [] 
                  })}
                  options={approverOptions}
                  isMulti
                  isSearchable
                  placeholder="Select approvers..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // For specific task types, show their respective options directly
  if (taskType === 'recurring') {
    return (
      <div className="pt-6 border-t border-gray-200">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <span>🔄</span>
            Recurring Task Settings
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <Select
                value={frequencyOptions.find(opt => opt.value === formData.recurringOptions.frequency)}
                onChange={(option) => updateField('recurringOptions', { 
                  ...formData.recurringOptions, 
                  frequency: option.value 
                })}
                options={frequencyOptions}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.recurringOptions.endDate}
                onChange={(e) => updateField('recurringOptions', { 
                  ...formData.recurringOptions, 
                  endDate: e.target.value 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (taskType === 'milestone') {
    return (
      <div className="pt-6 border-t border-gray-200">
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <span>🎯</span>
            Milestone Settings
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Linked Tasks</label>
              <Select
                value={taskOptions.filter(opt => formData.milestoneOptions.linkedTasks.includes(opt.value))}
                onChange={(selectedOptions) => updateField('milestoneOptions', { 
                  ...formData.milestoneOptions, 
                  linkedTasks: selectedOptions ? selectedOptions.map(opt => opt.value) : [] 
                })}
                options={taskOptions}
                isMulti
                isSearchable
                placeholder="Select linked tasks..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Success Criteria</label>
              <textarea
                value={formData.milestoneOptions.successCriteria}
                onChange={(e) => updateField('milestoneOptions', { 
                  ...formData.milestoneOptions, 
                  successCriteria: e.target.value 
                })}
                placeholder="Define what success looks like..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (taskType === 'approval') {
    return (
      <div className="pt-6 border-t border-gray-200">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <span>✅</span>
            Approval Settings
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approval Type</label>
                <Select
                  value={approvalTypeOptions.find(opt => opt.value === formData.approvalOptions.approvalType)}
                  onChange={(option) => updateField('approvalOptions', { 
                    ...formData.approvalOptions, 
                    approvalType: option.value 
                  })}
                  options={approvalTypeOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approval Deadline</label>
                <input
                  type="date"
                  value={formData.approvalOptions.deadline}
                  onChange={(e) => updateField('approvalOptions', { 
                    ...formData.approvalOptions, 
                    deadline: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approvers</label>
              <Select
                value={approverOptions.filter(opt => formData.approvalOptions.approvers.includes(opt.value))}
                onChange={(selectedOptions) => updateField('approvalOptions', { 
                  ...formData.approvalOptions, 
                  approvers: selectedOptions ? selectedOptions.map(opt => opt.value) : [] 
                })}
                options={approverOptions}
                isMulti
                isSearchable
                placeholder="Select approvers..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Primary Fields Component
const PrimaryFields = ({ 
  formData, 
  updateField, 
  errors, 
  isOrgUser = false,
  isSoloUser = false,
  taskType = 'regular'
}) => {
  const [attachments, setAttachments] = useState([]);
  const [totalSize, setTotalSize] = useState(0);

  const assigneeOptions = [
    { value: 'self', label: 'Self' },
    ...(isOrgUser ? [
      { value: 'john', label: 'John Smith' },
      { value: 'sarah', label: 'Sarah Wilson' },
      { value: 'mike', label: 'Mike Johnson' },
      { value: 'emma', label: 'Emma Davis' },
      { value: 'alex', label: 'Alex Brown' }
    ] : [])
  ];

  const priorityOptions = [
    { value: 'Low', label: '🟢 Low', color: '#10b981' },
    { value: 'Medium', label: '🟡 Medium', color: '#f59e0b' },
    { value: 'High', label: '🟠 High', color: '#f97316' },
    { value: 'Critical', label: '🔴 Critical', color: '#ef4444' }
  ];

  const categoryOptions = [
    { value: 'development', label: '💻 Development' },
    { value: 'design', label: '🎨 Design' },
    { value: 'marketing', label: '📢 Marketing' },
    { value: 'research', label: '🔍 Research' },
    { value: 'testing', label: '🧪 Testing' },
    { value: 'documentation', label: '📚 Documentation' },
    { value: 'meeting', label: '🤝 Meeting' },
    { value: 'review', label: '👀 Review' }
  ];

  const tagOptions = [
    { value: 'urgent', label: '🚨 Urgent' },
    { value: 'bug', label: '🐛 Bug' },
    { value: 'feature', label: '✨ Feature' },
    { value: 'improvement', label: '📈 Improvement' },
    { value: 'security', label: '🔒 Security' },
    { value: 'performance', label: '⚡ Performance' },
    { value: 'ui', label: '🖼️ UI' },
    { value: 'api', label: '🔌 API' },
    { value: 'database', label: '🗄️ Database' },
    { value: 'frontend', label: '🎨 Frontend' },
    { value: 'backend', label: '⚙️ Backend' }
  ];

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
        <div className="custom-editor">
          <ReactQuill
            value={formData.description}
            onChange={(value) => updateField('description', value)}
            placeholder="Describe the task details..."
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'blockquote', 'code-block'],
                [{ 'color': [] }, { 'background': [] }],
                ['clean']
              ],
            }}
            formats={[
              'header', 'bold', 'italic', 'underline', 'strike',
              'list', 'bullet', 'link', 'blockquote', 'code-block',
              'color', 'background'
            ]}
            className="bg-white border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Assigned To and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To *
          </label>
          <Select
            value={assigneeOptions.find(option => option.value === formData.assignedTo)}
            onChange={(option) => updateField('assignedTo', option.value)}
            options={assigneeOptions}
            isDisabled={isSoloUser}
            isSearchable
            placeholder="Search and select assignee..."
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: errors.assignedTo ? '#ef4444' : state.isFocused ? '#3b82f6' : '#d1d5db',
                boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : 'none',
                '&:hover': {
                  borderColor: errors.assignedTo ? '#ef4444' : '#3b82f6'
                }
              })
            }}
          />
          {errors.assignedTo && (
            <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority *
          </label>
          <Select
            value={priorityOptions.find(option => option.value === formData.priority)}
            onChange={(option) => handlePriorityChange(option.value)}
            options={priorityOptions}
            isSearchable
            placeholder="Select priority..."
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              option: (base, state) => ({
                ...base,
                color: state.data.color,
                fontWeight: '500'
              })
            }}
          />
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

      {/* Category and Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <Select
            value={categoryOptions.find(option => option.value === formData.category)}
            onChange={(option) => updateField('category', option?.value || '')}
            options={categoryOptions}
            isClearable
            isSearchable
            placeholder="Select category..."
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <Select
            value={formData.tags.split(',').filter(tag => tag.trim()).map(tag => ({ value: tag.trim(), label: tag.trim() }))}
            onChange={(selectedTags) => updateField('tags', selectedTags ? selectedTags.map(tag => tag.value).join(', ') : '')}
            options={tagOptions}
            isMulti
            isSearchable
            isClearable
            placeholder="Add tags..."
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
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

      {/* Special Task Features */}
      <SpecialTaskFeatures
        taskType={taskType}
        formData={formData}
        updateField={updateField}
      />
    </div>
  );
};

// Advanced Fields Component
const AdvancedFields = ({ formData, updateField }) => {
  const processOptions = [
    { value: 'development', label: '💻 Development Process' },
    { value: 'review', label: '📋 Review Process' },
    { value: 'testing', label: '🧪 Testing Process' },
    { value: 'deployment', label: '🚀 Deployment Process' },
    { value: 'design', label: '🎨 Design Process' }
  ];

  const formOptions = [
    { value: 'bug-report', label: '🐛 Bug Report Form' },
    { value: 'feature-request', label: '✨ Feature Request Form' },
    { value: 'user-feedback', label: '💬 User Feedback Form' },
    { value: 'task-review', label: '📝 Task Review Form' },
    { value: 'security-audit', label: '🔒 Security Audit Form' }
  ];

  const dependencyOptions = [
    { value: 'task-1', label: 'Complete Database Setup' },
    { value: 'task-2', label: 'Finish UI Design' },
    { value: 'task-3', label: 'API Development' },
    { value: 'task-4', label: 'User Testing Phase' },
    { value: 'task-5', label: 'Security Review' },
    { value: 'task-6', label: 'Performance Optimization' },
    { value: 'task-7', label: 'Documentation Update' }
  ];

  const taskTypeOptions = [
    { value: 'Simple', label: '⚡ Simple' },
    { value: 'Recurring', label: '🔄 Recurring' },
    { value: 'Approval', label: '✅ Approval' }
  ];

  return (
    <div className="space-y-6">
      {/* Reference Process */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reference Process
        </label>
        <Select
          value={processOptions.find(option => option.value === formData.referenceProcess)}
          onChange={(option) => updateField('referenceProcess', option?.value || '')}
          options={processOptions}
          isClearable
          isSearchable
          placeholder="Search and select process..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* Custom Form */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Form
        </label>
        <Select
          value={formOptions.find(option => option.value === formData.customForm)}
          onChange={(option) => updateField('customForm', option?.value || '')}
          options={formOptions}
          isClearable
          isSearchable
          placeholder="Search and select form template..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* Dependencies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dependencies
        </label>
        <Select
          value={dependencyOptions.filter(option => formData.dependencies.includes(option.value))}
          onChange={(selectedOptions) => updateField('dependencies', selectedOptions ? selectedOptions.map(opt => opt.value) : [])}
          options={dependencyOptions}
          isMulti
          isSearchable
          placeholder="Search and select dependencies..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <p className="text-xs text-gray-500 mt-1">Select tasks that must be completed first</p>
      </div>

      {/* Task Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Type *
        </label>
        <Select
          value={taskTypeOptions.find(option => option.value === formData.taskType)}
          onChange={(option) => updateField('taskType', option.value)}
          options={taskTypeOptions}
          isSearchable
          placeholder="Select task type..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
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
  isSoloUser = false,
  taskType = 'regular'
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
    category: '',
    collaborators: [],
    // Special task options
    recurringOptions: {
      frequency: 'daily',
      interval: 1,
      endDate: '',
      maxOccurrences: ''
    },
    milestoneOptions: {
      linkedTasks: [],
      targetDate: '',
      successCriteria: ''
    },
    approvalOptions: {
      approvers: [],
      approvalType: 'any',
      deadline: ''
    },
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Form */}
      <div className="p-6 space-y-6">
        <PrimaryFields
          formData={formData}
          updateField={updateField}
          errors={errors}
          isOrgUser={isOrgUser}
          isSoloUser={isSoloUser}
          taskType={taskType}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setShowAdvanced(true)}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          data-testid="button-more-options"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          More Options
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
            data-testid="button-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            data-testid="button-save"
          >
            Save Task
          </button>
        </div>
      </div>

      {/* Advanced Options Modal */}
      {showAdvanced && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-purple-600">⚙️</span>
                    Advanced Options
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Configure additional task settings</p>
                </div>
                <button
                  onClick={() => setShowAdvanced(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                  data-testid="close-advanced-modal"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
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
                className="px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                data-testid="button-advanced-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowAdvanced(false)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                data-testid="button-advanced-save"
              >
                Save Options
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default RegularTaskForm;