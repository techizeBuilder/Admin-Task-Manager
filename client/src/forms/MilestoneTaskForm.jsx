import React, { useState } from "react";
import ReactQuill from "react-quill";
import useTasksStore from "../stores/tasksStore";

export default function MilestoneTaskForm({ onClose, onSubmit }) {
  const { addTask } = useTasksStore();
  
  const [formData, setFormData] = useState({
    taskName: "",
    isMilestone: true,
    milestoneType: "standalone",
    linkedTasks: [],
    dueDate: "",
    assignedTo: "Current User",
    assigneeId: 1,
    description: "",
    visibility: "private",
    priority: "medium",
    collaborators: [],
    status: "not_started"
  });

  const [errors, setErrors] = useState({});

  const teamMembers = [
    { id: 1, name: "Current User" },
    { id: 2, name: "John Smith" },
    { id: 3, name: "Jane Smith" },
    { id: 4, name: "Mike Johnson" },
    { id: 5, name: "Sarah Wilson" },
    { id: 6, name: "Emily Davis" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.taskName.trim()) {
      newErrors.taskName = "Milestone name is required";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create milestone task
    const newMilestone = {
      id: Date.now(),
      name: formData.taskName,
      type: "milestone",
      milestoneType: formData.milestoneType,
      linkedTasks: formData.linkedTasks,
      dueDate: formData.dueDate,
      assignee: formData.assignedTo,
      assigneeId: formData.assigneeId,
      description: formData.description,
      visibility: formData.visibility,
      priority: formData.priority,
      collaborators: formData.collaborators,
      status: formData.status,
      createdAt: new Date().toISOString(),
      isMilestone: true
    };

    addTask(newMilestone);
    
    if (onSubmit) {
      onSubmit(newMilestone);
    }
    
    // Reset form
    setFormData({
      taskName: "",
      isMilestone: true,
      milestoneType: "standalone",
      linkedTasks: [],
      dueDate: "",
      assignedTo: "Current User",
      assigneeId: 1,
      description: "",
      visibility: "private",
      priority: "medium",
      collaborators: [],
      status: "not_started"
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Milestone Info Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Milestone Details</h3>
        
        {/* Milestone Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Milestone Name *
          </label>
          <input
            type="text"
            value={formData.taskName}
            onChange={(e) => handleInputChange("taskName", e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.taskName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter milestone name..."
            data-testid="input-milestone-name"
          />
          {errors.taskName && (
            <p className="text-red-500 text-sm mt-1">{errors.taskName}</p>
          )}
        </div>

        {/* Milestone Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Milestone Type
          </label>
          <select
            value={formData.milestoneType}
            onChange={(e) => handleInputChange("milestoneType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="select-milestone-type"
          >
            <option value="standalone">Standalone Milestone</option>
            <option value="project_completion">Project Completion</option>
            <option value="phase_completion">Phase Completion</option>
            <option value="deadline">Important Deadline</option>
          </select>
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
            data-testid="input-milestone-due-date"
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
            data-testid="select-milestone-priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Assigned To */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To
          </label>
          <select
            value={formData.assignedTo}
            onChange={(e) => handleInputChange("assignedTo", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="select-milestone-assignee"
          >
            {teamMembers.map(member => (
              <option key={member.id} value={member.name}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Description</h3>
        <div className="custom-editor">
          <ReactQuill
            value={formData.description}
            onChange={(value) => handleInputChange("description", value)}
            placeholder="Describe this milestone..."
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

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          data-testid="button-cancel-milestone"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          data-testid="button-create-milestone"
        >
          Create Milestone
        </button>
      </div>
    </form>
  );
}