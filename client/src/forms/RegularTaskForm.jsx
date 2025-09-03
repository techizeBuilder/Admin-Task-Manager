import React, { useState, useEffect } from "react";
import { Upload, FileText, Trash2 } from "lucide-react";
import ReactQuill from "react-quill";
import SearchableSelect from "../pages/SearchableSelect";
import { calculateDueDateFromPriority } from "../pages/newComponents/PriorityManager";
import { handleFileUpload, formatFileSize } from "../utils/fileUpload";
import useTasksStore from "../stores/tasksStore";

export function RegularTaskForm({ onClose, onSubmit }) {
  const { addTask } = useTasksStore();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dueDate: "",
    priority: "medium",
    assignee: "self",
    assigneeId: 1,
    visibility: "private",
    tags: [],
    attachments: [],
    estimatedHours: "",
    dependencies: [],
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [isManualDueDate, setIsManualDueDate] = useState(false);

  // Team members for assignment
  const teamMembers = [
    { id: 1, name: "Current User (Self)", value: "self" },
    { id: 2, name: "John Smith", value: "john" },
    { id: 3, name: "Sarah Wilson", value: "sarah" },
    { id: 4, name: "Mike Johnson", value: "mike" },
    { id: 5, name: "Emily Davis", value: "emily" }
  ];

  // Auto-calculate due date when priority changes
  useEffect(() => {
    if (!isManualDueDate && formData.priority) {
      const calculatedDueDate = calculateDueDateFromPriority(formData.priority);
      setFormData(prev => ({ ...prev, dueDate: calculatedDueDate }));
    }
  }, [formData.priority, isManualDueDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Task name is required";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create regular task
    const newTask = {
      id: Date.now(),
      name: formData.name,
      type: "regular",
      description: formData.description,
      dueDate: formData.dueDate,
      priority: formData.priority,
      assignee: formData.assignee,
      assigneeId: formData.assigneeId,
      visibility: formData.visibility,
      tags: formData.tags,
      attachments: formData.attachments,
      estimatedHours: formData.estimatedHours,
      dependencies: formData.dependencies,
      notes: formData.notes,
      status: "To Do",
      createdAt: new Date().toISOString()
    };

    addTask(newTask);
    
    if (onSubmit) {
      onSubmit(newTask);
    }
    
    // Reset form
    setFormData({
      name: "",
      description: "",
      dueDate: "",
      priority: "medium",
      assignee: "self",
      assigneeId: 1,
      visibility: "private",
      tags: [],
      attachments: [],
      estimatedHours: "",
      dependencies: [],
      notes: ""
    });
    
    setErrors({});
    setIsManualDueDate(false);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleDueDateChange = (value) => {
    setIsManualDueDate(true);
    handleInputChange("dueDate", value);
  };

  const handleFileUploadEvent = async (files) => {
    const uploadPromises = Array.from(files).map(file => handleFileUpload(file));
    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...uploadedFiles]
      }));
    } catch (error) {
      console.error('File upload error:', error);
    }
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Task Info Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Task Details</h3>
        
        {/* Task Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter task name..."
            data-testid="input-regular-task-name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Priority & Due Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="select-regular-priority"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dueDate ? "border-red-500" : "border-gray-300"
              }`}
              data-testid="input-regular-due-date"
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
            )}
          </div>
        </div>

        {/* Assignee */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign To
          </label>
          <select
            value={formData.assignee}
            onChange={(e) => handleInputChange("assignee", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="select-regular-assignee"
          >
            {teamMembers.map(member => (
              <option key={member.id} value={member.value}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        {/* Estimated Hours */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Hours
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={formData.estimatedHours}
            onChange={(e) => handleInputChange("estimatedHours", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 4.5"
            data-testid="input-estimated-hours"
          />
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Description</h3>
        <div className="custom-editor">
          <ReactQuill
            value={formData.description}
            onChange={(value) => handleInputChange("description", value)}
            placeholder="Describe this task..."
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
      </div>

      {/* Attachments Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Attachments</h3>
        
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFileUploadEvent(e.dataTransfer.files);
          }}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 mb-2">
            Drag and drop files here or{' '}
            <label className="text-blue-600 cursor-pointer hover:underline">
              browse files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUploadEvent(e.target.files)}
                data-testid="input-file-upload"
              />
            </label>
          </p>
          <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
        </div>

        {/* Attached Files List */}
        {formData.attachments.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Attached Files</h4>
            <div className="space-y-2">
              {formData.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-600 hover:text-red-800"
                    data-testid={`button-remove-attachment-${index}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Additional Notes Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add any additional notes..."
          data-testid="textarea-notes"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          data-testid="button-cancel-regular"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          data-testid="button-create-regular-task"
        >
          Create Task
        </button>
      </div>
    </form>
  );
}