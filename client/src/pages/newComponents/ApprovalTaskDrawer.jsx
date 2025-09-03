import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import ReactQuill from "react-quill";
import useTasksStore from "../../stores/tasksStore";

export default function ApprovalTaskDrawer({ isOpen, onClose }) {
  const { addTask } = useTasksStore();
  
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    dueDate: "",
    priority: "medium",
    approvalType: "single",
    approvers: [{ name: "", email: "", required: true }],
    approvalCriteria: "",
    attachments: [],
    visibility: "private"
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.taskName.trim()) {
      newErrors.taskName = "Approval task name is required";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    if (formData.approvers.length === 0 || !formData.approvers[0].name) {
      newErrors.approvers = "At least one approver is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create approval task
    const newApprovalTask = {
      id: Date.now(),
      name: formData.taskName,
      type: "approval",
      description: formData.description,
      dueDate: formData.dueDate,
      priority: formData.priority,
      approvalType: formData.approvalType,
      approvers: formData.approvers,
      approvalCriteria: formData.approvalCriteria,
      attachments: formData.attachments,
      visibility: formData.visibility,
      status: "pending_approval",
      createdAt: new Date().toISOString(),
      assignee: "self"
    };

    addTask(newApprovalTask);
    
    // Reset form
    setFormData({
      taskName: "",
      description: "",
      dueDate: "",
      priority: "medium",
      approvalType: "single",
      approvers: [{ name: "", email: "", required: true }],
      approvalCriteria: "",
      attachments: [],
      visibility: "private"
    });
    
    setErrors({});
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addApprover = () => {
    setFormData(prev => ({
      ...prev,
      approvers: [...prev.approvers, { name: "", email: "", required: true }]
    }));
  };

  const removeApprover = (index) => {
    setFormData(prev => ({
      ...prev,
      approvers: prev.approvers.filter((_, i) => i !== index)
    }));
  };

  const updateApprover = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      approvers: prev.approvers.map((approver, i) => 
        i === index ? { ...approver, [field]: value } : approver
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto">
        {/* Drawer Header with Green Gradient */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Create Approval Task</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            data-testid="button-close-approval"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Task Info Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Approval Task Details</h3>
              
              {/* Task Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Name *
                </label>
                <input
                  type="text"
                  value={formData.taskName}
                  onChange={(e) => handleInputChange("taskName", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.taskName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter approval task name..."
                  data-testid="input-approval-name"
                />
                {errors.taskName && (
                  <p className="text-red-500 text-sm mt-1">{errors.taskName}</p>
                )}
              </div>

              {/* Due Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange("dueDate", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dueDate ? "border-red-500" : "border-gray-300"
                  }`}
                  data-testid="input-approval-due-date"
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
                )}
              </div>

              {/* Priority */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="select-approval-priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Approval Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Type
                </label>
                <select
                  value={formData.approvalType}
                  onChange={(e) => handleInputChange("approvalType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="select-approval-type"
                >
                  <option value="single">Single Approver</option>
                  <option value="sequential">Sequential Approval</option>
                  <option value="parallel">Parallel Approval</option>
                  <option value="majority">Majority Approval</option>
                </select>
              </div>
            </div>

            {/* Approvers Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Approvers</h3>
                <button
                  type="button"
                  onClick={addApprover}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  data-testid="button-add-approver"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Approver
                </button>
              </div>
              
              {formData.approvers.map((approver, index) => (
                <div key={index} className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Approver {index + 1}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeApprover(index)}
                        className="text-red-600 hover:text-red-800"
                        data-testid={`button-remove-approver-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Approver name"
                      value={approver.name}
                      onChange={(e) => updateApprover(index, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid={`input-approver-name-${index}`}
                    />
                    <input
                      type="email"
                      placeholder="Approver email"
                      value={approver.email}
                      onChange={(e) => updateApprover(index, 'email', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid={`input-approver-email-${index}`}
                    />
                  </div>
                  
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={approver.required}
                        onChange={(e) => updateApprover(index, 'required', e.target.checked)}
                        className="mr-2"
                        data-testid={`checkbox-approver-required-${index}`}
                      />
                      <span className="text-sm text-gray-700">Required approver</span>
                    </label>
                  </div>
                </div>
              ))}
              
              {errors.approvers && (
                <p className="text-red-500 text-sm mt-1">{errors.approvers}</p>
              )}
            </div>

            {/* Description Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Description & Criteria</h3>
              <div className="custom-editor mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Description
                </label>
                <ReactQuill
                  value={formData.description}
                  onChange={(value) => handleInputChange("description", value)}
                  placeholder="Describe what needs approval..."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, false] }],
                      ['bold', 'italic', 'underline'],
                      ['link', 'blockquote'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }]
                    ]
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Criteria
                </label>
                <textarea
                  value={formData.approvalCriteria}
                  onChange={(e) => handleInputChange("approvalCriteria", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Define specific criteria for approval..."
                  data-testid="textarea-approval-criteria"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                data-testid="button-cancel-approval"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                data-testid="button-create-approval"
              >
                Create Approval Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}