import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { taskTypeApi } from '../../api/taskTypeApi'

export default function ApprovalTaskCreator({ onClose, onSubmit, preFilledDate, selectedDate }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      approvalMode: 'any',
      dueDate: preFilledDate || '',
      autoApproveAfter: '',
      autoApproveEnabled: false,
      visibility: 'private',
      priority: 'medium'
    }
  });

  const [approverIds, setApproverIds] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Sample approvers data - in real app this would come from API
  const availableApprovers = [
    { id: 1, name: 'John Smith', role: 'manager', avatar: '👨‍💼' },
    { id: 2, name: 'Sarah Johnson', role: 'supervisor', avatar: '👩‍💼' },
    { id: 3, name: 'Mike Chen', role: 'director', avatar: '👨‍💻' },
    { id: 4, name: 'Lisa Brown', role: 'lead', avatar: '👩‍🏫' },
    { id: 5, name: 'Emily Davis', role: 'admin', avatar: '👩‍💻' },
    { id: 6, name: 'Alex Turner', role: 'legal', avatar: '⚖️' }
  ];

  const handleApproverToggle = (approverId) => {
    const newApproverIds = approverIds.includes(approverId)
      ? approverIds.filter(id => id !== approverId)
      : [...approverIds, approverId]
    
    setApproverIds(newApproverIds);
  }

  const handleFileUpload = (files) => {
    const newAttachments = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }))
    
    setAttachments([...attachments, ...newAttachments]);
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const files = e.dataTransfer.files
    handleFileUpload(files)
  }

  const removeAttachment = (attachmentId) => {
    setAttachments(attachments.filter(att => att.id !== attachmentId));
  }

  const onSubmitForm = async (formData) => {
    if (!formData.title.trim()) {
      alert('Task name is required')
      return
    }

    if (approverIds.length === 0) {
      alert('Please select at least one approver')
      return
    }

    if (!formData.dueDate) {
      alert('Due date is required')
      return
    }

    try {
      // Remove FormData approach, use new API directly
      
      // Build task data object for new API
      const taskData = {
        title: formData.title,
        description: formData.description || '',
        dueDate: formData.dueDate,
        priority: formData.priority,
        visibility: formData.visibility,
        approvalMode: formData.approvalMode,
        autoApproveEnabled: formData.autoApproveEnabled,
        status: 'todo'
      };

      // Add auto-approve timeout if enabled
      if (formData.autoApproveAfter) {
        taskData.autoApproveAfter = parseInt(formData.autoApproveAfter);
      }

      console.log('Sending approval task data to new API:', { type: 'approval', data: taskData });

      // Use new task type API
      const response = await taskTypeApi.createTask('approval', taskData);

      console.log("Approval task created successfully:", response);

      // Handle file attachments if any (fallback for now)
      if (attachments && attachments.length > 0) {
        console.log('File attachments detected, handling separately...');
        // TODO: Implement file upload in new API or handle via separate endpoint
      }
      
      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(response.data || response);
      }
      
      // Close the form
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error("Error creating approval task:", error);
      alert("Failed to create approval task: " + (error.response?.data?.message || error.message));
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getApprovalModeDescription = (mode) => {
    switch (mode) {
      case 'any': return 'Any single approver can approve/reject'
      case 'all': return 'All approvers must approve'
      case 'sequential': return 'Approvers act in order'
      default: return ''
    }
  }

  return (
    <div className="create-task-container">
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-3">
          {/* Task Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Task Name *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Task name is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., Budget Approval Q1 2024"
              maxLength={100}
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          {/* Approval Task Toggle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-900">This is an Approval Task</span>
                </div>
                <span className="text-sm text-blue-600">✓ Enable approval workflow</span>
              </div>
            </div>
          </div>

          {/* Approvers Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Approvers * <span className="text-xs text-gray-500 font-normal">({approverIds.length} selected)</span>
            </label>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableApprovers.map(approver => (
                  <div
                    key={approver.id}
                    className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      approverIds.includes(approver.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => handleApproverToggle(approver.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{approver.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{approver.name}</p>
                        <p className="text-xs text-gray-500">{approver.role}</p>
                      </div>
                      {approverIds.includes(approver.id) && (
                        <div className="flex-shrink-0">
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Approval Mode */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Approval Mode
            </label>
            <select
              {...register('approvalMode')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="any">Any One Approver</option>
              <option value="all">All Approvers Required</option>
              <option value="sequential">Sequential Approval</option>
            </select>
            <p className="text-xs text-gray-600">{getApprovalModeDescription(watch('approvalMode'))}</p>
          </div>

          {/* Auto Approve Settings */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                {...register('autoApproveEnabled')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-900">
                Auto-approve after specified time
              </label>
            </div>
            {watch('autoApproveEnabled') && (
              <div className="ml-7">
                <select
                  {...register('autoApproveAfter')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select timeframe</option>
                  <option value="1h">1 hour</option>
                  <option value="24h">24 hours</option>
                  <option value="48h">48 hours</option>
                  <option value="1w">1 week</option>
                </select>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe what needs approval and any specific requirements..."
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Due Date *
            </label>
            <input
              type="date"
              {...register('dueDate', { required: 'Due date is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.dueDate && <p className="text-red-500 text-sm">{errors.dueDate.message}</p>}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Visibility
            </label>
            <select
              {...register('visibility')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
              <option value="team">Team</option>
            </select>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Attachments
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                      Click to upload
                    </span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                />
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-xs text-gray-500">{(attachment.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Approval Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
    </div>
  )
}