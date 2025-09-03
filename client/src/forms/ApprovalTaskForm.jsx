import React, { useState, useCallback, useMemo } from 'react';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { MultiSelect } from '../components/ui/MultiSelect';

export function ApprovalTaskForm({ 
  formData, 
  setFormData, 
  onSubmit,
  onSaveDraft,
  onCancel
}) {
  const [validationErrors, setValidationErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Get today's date for validation
  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  // Initialize approval-specific data
  const approvalData = formData.approval || {
    approvers: [],
    approvalMode: 'any_one',
    approverOrder: [],
    autoApproval: false,
    autoApprovalDays: 0
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [setFormData, validationErrors]);

  const handleApprovalChange = useCallback((field, value) => {
    const updatedApproval = {
      ...approvalData,
      [field]: value
    };
    
    // If changing to sequential mode, initialize approver order
    if (field === 'approvalMode' && value === 'sequential') {
      updatedApproval.approverOrder = [...updatedApproval.approvers];
    }
    
    setFormData(prev => ({
      ...prev,
      approval: updatedApproval
    }));
  }, [approvalData, setFormData]);

  // Drag and drop handlers for approver ordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newOrder = [...approvalData.approverOrder];
    const draggedItem = newOrder[draggedIndex];
    
    // Remove dragged item
    newOrder.splice(draggedIndex, 1);
    // Insert at new position
    newOrder.splice(dropIndex, 0, draggedItem);
    
    handleApprovalChange('approverOrder', newOrder);
    setDraggedIndex(null);
  };

  const validateForm = useCallback(() => {
    const errors = {};

    // Task name validation
    if (!formData.title?.trim()) {
      errors.title = "Task name is required";
    } else if (formData.title.length > 80) {
      errors.title = "Task name must be 80 characters or less";
    }

    // Approvers validation
    if (!approvalData.approvers || approvalData.approvers.length === 0) {
      errors.approvers = "At least one approver is required";
    }

    // Sequential mode validation
    if (approvalData.approvalMode === 'sequential' && 
        approvalData.approverOrder.length !== approvalData.approvers.length) {
      errors.approverOrder = "Please define the order for all approvers";
    }

    // Due date validation
    if (!formData.dueDate) {
      errors.dueDate = "Due date is required";
    } else if (formData.dueDate < today) {
      errors.dueDate = "Due date cannot be in the past";
    }

    // Auto-approval validation
    if (approvalData.autoApproval && approvalData.autoApprovalDays < 0) {
      errors.autoApprovalDays = "Auto-approval days must be 0 or greater";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, approvalData, today]);

  const handleSubmit = useCallback((isDraft = false) => {
    if (!isDraft && !validateForm()) {
      return;
    }

    const submissionData = {
      ...formData,
      taskType: 'approval',
      approval: approvalData
    };

    if (isDraft) {
      onSaveDraft?.(submissionData);
    } else {
      onSubmit?.(submissionData);
    }
  }, [formData, approvalData, validateForm, onSubmit, onSaveDraft]);

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Task details' },
    { id: 2, title: 'Approvers', description: 'Who needs to approve' },
    { id: 3, title: 'Settings', description: 'Approval settings' }
  ];

  const canProceedToStep = (step) => {
    switch (step) {
      case 2:
        return formData.title?.trim() && formData.title.length <= 80;
      case 3:
        return approvalData.approvers?.length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Stepper Header */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">✅</span>
          Create Approval Task
        </h2>
        
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : canProceedToStep(step.id)
                      ? 'bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                  onClick={() => canProceedToStep(step.id) && setCurrentStep(step.id)}
                >
                  {step.id}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Basic Task Information</h3>
              <p className="text-sm text-blue-700">
                Define the task that requires approval and provide context for approvers.
              </p>
            </div>

            {/* Task Name */}
            <div className="card">
              <div className="card-header">
                <h4 className="text-base font-semibold text-gray-900">Task Name *</h4>
              </div>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task name (max 80 characters)"
                maxLength={80}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.title
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                data-testid="input-approval-task-name"
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {validationErrors.title && (
                    <p className="text-red-600 text-sm" data-testid="error-task-name">
                      {validationErrors.title}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {(formData.title || '').length}/80 characters
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="card">
              <div className="card-header">
                <h4 className="text-base font-semibold text-gray-900">Description</h4>
                <p className="text-sm text-gray-600">Optional details about what needs approval</p>
              </div>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what needs to be approved and provide any relevant context..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                data-testid="textarea-approval-description"
              />
            </div>

            {/* Due Date */}
            <div className="card">
              <div className="card-header">
                <h4 className="text-base font-semibold text-gray-900">Due Date *</h4>
                <p className="text-sm text-gray-600">When approval is needed by</p>
              </div>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                min={today}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.dueDate
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                data-testid="input-approval-due-date"
              />
              {validationErrors.dueDate && (
                <p className="text-red-600 text-sm mt-1" data-testid="error-due-date">
                  {validationErrors.dueDate}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Approvers */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Approval Configuration</h3>
              <p className="text-sm text-green-700">
                Select who needs to approve this task and define the approval process.
              </p>
            </div>

            {/* Approvers */}
            <div className="card">
              <div className="card-header">
                <h4 className="text-base font-semibold text-gray-900">Approvers *</h4>
                <p className="text-sm text-gray-600">Who needs to approve this task</p>
              </div>
              <MultiSelect
                options={[
                  { value: "manager-1", label: "Sarah Johnson (Manager)" },
                  { value: "director-1", label: "Mike Chen (Director)" },
                  { value: "cto", label: "Alex Rodriguez (CTO)" },
                  { value: "hr-lead", label: "Emma Davis (HR Lead)" },
                  { value: "finance-head", label: "David Kim (Finance Head)" },
                  { value: "legal-counsel", label: "Jennifer Liu (Legal)" },
                ]}
                value={approvalData.approvers || []}
                onChange={(selectedValues) => handleApprovalChange('approvers', selectedValues)}
                placeholder="Search and select approvers..."
                dataTestId="multi-select-approvers"
              />
              {validationErrors.approvers && (
                <p className="text-red-600 text-sm mt-1" data-testid="error-approvers">
                  {validationErrors.approvers}
                </p>
              )}
            </div>

            {/* Approval Mode */}
            <div className="card">
              <div className="card-header">
                <h4 className="text-base font-semibold text-gray-900">Approval Mode *</h4>
                <p className="text-sm text-gray-600">How should approvals be processed</p>
              </div>
              <select
                value={approvalData.approvalMode || 'any_one'}
                onChange={(e) => handleApprovalChange('approvalMode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="select-approval-mode"
              >
                <option value="any_one">Any One - Only one approver needs to approve</option>
                <option value="all_must">All Must - All approvers must approve</option>
                <option value="sequential">Sequential - Approvers must approve in order</option>
              </select>
            </div>

            {/* Approver Order (only for Sequential) */}
            {approvalData.approvalMode === 'sequential' && approvalData.approvers?.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h4 className="text-base font-semibold text-gray-900">Approver Order *</h4>
                  <p className="text-sm text-gray-600">Drag to reorder the approval sequence</p>
                </div>
                <div className="space-y-2">
                  {(approvalData.approverOrder?.length > 0 ? approvalData.approverOrder : approvalData.approvers).map((approverId, index) => {
                    const approverOption = [
                      { value: "manager-1", label: "Sarah Johnson (Manager)" },
                      { value: "director-1", label: "Mike Chen (Director)" },
                      { value: "cto", label: "Alex Rodriguez (CTO)" },
                      { value: "hr-lead", label: "Emma Davis (HR Lead)" },
                      { value: "finance-head", label: "David Kim (Finance Head)" },
                      { value: "legal-counsel", label: "Jennifer Liu (Legal)" },
                    ].find(opt => opt.value === approverId);
                    
                    return (
                      <div
                        key={approverId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                        data-testid={`approver-order-${index}`}
                      >
                        <div className="flex items-center gap-2 text-gray-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 5h2v2H9V5zm0 6h2v2H9v-2zm0 6h2v2H9v-2zm6-12h2v2h-2V5zm0 6h2v2h-2v-2zm0 6h2v2h-2v-2z"/>
                          </svg>
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900">
                            {approverOption?.label || approverId}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {validationErrors.approverOrder && (
                  <p className="text-red-600 text-sm mt-1" data-testid="error-approver-order">
                    {validationErrors.approverOrder}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Settings */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Additional Settings</h3>
              <p className="text-sm text-purple-700">
                Configure automatic approval and collaboration settings.
              </p>
            </div>

            {/* Auto-Approval */}
            <div className="card">
              <div className="card-header">
                <h4 className="text-base font-semibold text-gray-900">Auto-Approval</h4>
                <p className="text-sm text-gray-600">Automatically approve after due date</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={approvalData.autoApproval || false}
                    onChange={(e) => handleApprovalChange('autoApproval', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    data-testid="toggle-auto-approval"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Enable auto-approval
                  </span>
                </label>
                
                {approvalData.autoApproval && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={approvalData.autoApprovalDays || 0}
                      onChange={(e) => handleApprovalChange('autoApprovalDays', parseInt(e.target.value) || 0)}
                      min="0"
                      className={`w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 transition-colors ${
                        validationErrors.autoApprovalDays
                          ? "border-red-300 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      data-testid="input-auto-approval-days"
                    />
                    <span className="text-sm text-gray-600">days after due date</span>
                  </div>
                )}
              </div>
              {validationErrors.autoApprovalDays && (
                <p className="text-red-600 text-sm mt-1" data-testid="error-auto-approval-days">
                  {validationErrors.autoApprovalDays}
                </p>
              )}
            </div>

            {/* Collaborators */}
            <div className="card">
              <div className="card-header">
                <h4 className="text-base font-semibold text-gray-900">Collaborators</h4>
                <p className="text-sm text-gray-600">Optional - Users who can view and comment</p>
              </div>
              <MultiSelect
                options={[
                  { value: "john", label: "John Smith" },
                  { value: "jane", label: "Jane Smith" },
                  { value: "mike", label: "Mike Johnson" },
                  { value: "sarah", label: "Sarah Wilson" },
                  { value: "alex", label: "Alex Johnson" },
                  { value: "emily", label: "Emily Chen" },
                ]}
                value={formData.collaborators || []}
                onChange={(selectedValues) => handleInputChange('collaborators', selectedValues)}
                placeholder="Select collaborators..."
                dataTestId="multi-select-collaborators"
              />
            </div>
          </div>
        )}

        {/* Navigation & Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                data-testid="button-previous-step"
              >
                Previous
              </button>
            )}
            {currentStep < 3 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToStep(currentStep + 1)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  canProceedToStep(currentStep + 1)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                data-testid="button-next-step"
              >
                Next
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              data-testid="button-cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              data-testid="button-save-draft"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              data-testid="button-create-approval-task"
            >
              <span className="text-lg">✅</span>
              Create Approval Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApprovalTaskForm;