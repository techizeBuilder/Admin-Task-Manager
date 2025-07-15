
import React, { useState } from 'react'

export default function ApprovalTaskCreator({ onClose, onSubmit, preFilledDate, selectedDate }) {
  const [formData, setFormData] = useState({
    title: '',
    isApprovalTask: true,
    approver: 'Current User',
    approverIds: [],
    approvalMode: 'any',
    dueDate: preFilledDate || '',
    autoApproveAfter: '',
    autoApproveEnabled: false,
    description: '',
    attachments: [],
    collaborators: [],
    visibility: 'private',
    priority: 'medium'
  })

  const [dragActive, setDragActive] = useState(false)

  const availableApprovers = [
    { id: 1, name: 'Current User', role: 'manager', avatar: '👤' },
    { id: 2, name: 'John Smith', role: 'team_lead', avatar: '👨‍💼' },
    { id: 3, name: 'Sarah Wilson', role: 'director', avatar: '👩‍💼' },
    { id: 4, name: 'Mike Johnson', role: 'cfo', avatar: '👨‍💻' },
    { id: 5, name: 'Emily Davis', role: 'admin', avatar: '👩‍💻' },
    { id: 6, name: 'Alex Turner', role: 'legal', avatar: '⚖️' }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleApproverToggle = (approverId) => {
    const newApproverIds = formData.approverIds.includes(approverId)
      ? formData.approverIds.filter(id => id !== approverId)
      : [...formData.approverIds, approverId]
    
    setFormData({
      ...formData,
      approverIds: newApproverIds
    })
  }

  const handleFileUpload = (files) => {
    const newAttachments = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }))
    
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...newAttachments]
    })
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
    setFormData({
      ...formData,
      attachments: formData.attachments.filter(att => att.id !== attachmentId)
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Task name is required')
      return
    }

    if (formData.approverIds.length === 0) {
      alert('Please select at least one approver')
      return
    }

    if (!formData.dueDate) {
      alert('Due date is required')
      return
    }

    const approvalTask = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: 'Current User',
      status: 'pending',
      approvers: formData.approverIds.map(id => {
        const approver = availableApprovers.find(a => a.id === id)
        return {
          ...approver,
          status: 'pending',
          comment: null,
          approvedAt: null
        }
      })
    }

    onSubmit(approvalTask)
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
      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Task Name *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., Budget Approval Q1 2024"
              required
              maxLength={100}
            />
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
                    name="isApprovalTask"
                    checked={formData.isApprovalTask}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <span className="font-semibold text-gray-900">This is an Approval Task</span>
                </div>
                <span className="text-sm text-blue-600">✓ Enable approval workflow</span>
              </div>
            </div>
          </div>

          {formData.isApprovalTask && (
            <>
              {/* Approvers Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Approvers * <span className="text-xs text-gray-500 font-normal">({formData.approverIds.length} selected)</span>
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableApprovers.map(approver => (
                      <div
                        key={approver.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          formData.approverIds.includes(approver.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleApproverToggle(approver.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <span className="text-lg">{approver.avatar}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.approverIds.includes(approver.id)}
                                onChange={() => handleApproverToggle(approver.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-900 truncate">{approver.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 capitalize">{approver.role.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Click to select multiple approvers</p>
                </div>
              </div>

              {/* Approval Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Approval Mode *
                  </label>
                  <select
                    name="approvalMode"
                    value={formData.approvalMode}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="any">Any One</option>
                    <option value="all">All Must Approve</option>
                    <option value="sequential">Sequential</option>
                  </select>
                  <p className="text-xs text-gray-500">
                    {getApprovalModeDescription(formData.approvalMode)}
                  </p>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Priority and Visibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(formData.priority)}`}>
                    {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>

              {/* Auto-Approval */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="autoApproveEnabled"
                    checked={formData.autoApproveEnabled}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-semibold text-gray-700">
                    Enable Auto-Approval
                  </label>
                </div>
                {formData.autoApproveEnabled && (
                  <div className="ml-7 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-gray-700">Auto-approve after:</label>
                      <input
                        type="number"
                        name="autoApproveAfter"
                        value={formData.autoApproveAfter}
                        onChange={handleChange}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max="30"
                        placeholder="3"
                      />
                      <span className="text-sm text-gray-600">days</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-2">Auto-approve if no response after due date + X days</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description / Justification
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Provide background, criteria, or justification for this approval..."
                  rows="4"
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 text-right">
                  {formData.description.length}/1000 characters
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Attachments
                </label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="space-y-2">
                    <div className="text-4xl">📎</div>
                    <div>
                      <p className="text-gray-600">
                        <span className="font-medium text-blue-600 cursor-pointer hover:text-blue-800">
                          Click to upload
                        </span>
                        {' '}or drag and drop files here
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.pdf"
                    />
                  </div>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">📄</span>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{attachment.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="text-red-500 hover:text-red-700 p-1"
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
            </>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formData.approverIds.length === 0 || !formData.title.trim() || !formData.dueDate}
            >
              Create Approval Task
            </button>
          </div>
        </form>
    </div>
  )
}
