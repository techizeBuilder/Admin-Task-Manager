import React, { useState, useEffect } from 'react'
import { calculateDueDateFromPriority } from '../newComponents/PriorityManager'
import RecurringTaskManager from './RecurringTaskManager'
import MilestoneManager from '../newComponents/MilestoneManager'

export default function CreateTask({ onClose, initialTaskType = 'regular', preFilledDate = null }) {
  const [taskType, setTaskType] = useState(initialTaskType)
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium',
    status: 'todo',
    dueDate: preFilledDate || '',
    category: '',
    tags: '',
    attachments: []
  })
  const [isManualDueDate, setIsManualDueDate] = useState(false)
  const [moreOptionsData, setMoreOptionsData] = useState({
    referenceProcess: '',
    customForm: '',
    dependencies: [],
    taskTypeAdvanced: 'simple'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Creating task:', formData)
    // Handle task creation
    if (onClose) onClose()
  }

  // Auto-calculate due date when priority changes (unless manually overridden)
  useEffect(() => {
    if (!isManualDueDate && formData.priority) {
      const calculatedDueDate = calculateDueDateFromPriority(formData.priority)
      setFormData(prev => ({
        ...prev,
        dueDate: calculatedDueDate
      }))
    }
  }, [formData.priority, isManualDueDate])

  const handleInputChange = (field, value) => {
    if (field === 'dueDate') {
      setIsManualDueDate(true)
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMoreOptionsChange = (field, value) => {
    setMoreOptionsData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="create-task-container">

      {/* Task Type Selector */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Task Type</h3>
          <p className="text-gray-600">Choose the type of task you want to create</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
          <button
            onClick={() => setTaskType('regular')}
            className={`p-3 border-2 rounded-xl text-left transition-all duration-300 group ${
              taskType === 'regular' 
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md transform scale-102' 
                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm hover:transform hover:scale-101'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                taskType === 'regular' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
              }`}>
                <span className="text-sm">📋</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">Regular Task</h4>
                <p className="text-xs text-gray-500 group-hover:text-gray-600 truncate">Standard one-time task</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setTaskType('recurring')}
            className={`p-3 border-2 rounded-xl text-left transition-all duration-300 group ${
              taskType === 'recurring' 
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md transform scale-102' 
                : 'border-gray-200 hover:border-green-300 hover:shadow-sm hover:transform hover:scale-101'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                taskType === 'recurring' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-100 text-green-600 group-hover:bg-green-200'
              }`}>
                <span className="text-sm">🔄</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-green-700">Recurring Task</h4>
                <p className="text-xs text-gray-500 group-hover:text-gray-600 truncate">Repeats on schedule</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setTaskType('milestone')}
            className={`p-3 border-2 rounded-xl text-left transition-all duration-300 group ${
              taskType === 'milestone' 
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 shadow-md transform scale-102' 
                : 'border-gray-200 hover:border-purple-300 hover:shadow-sm hover:transform hover:scale-101'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                taskType === 'milestone' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
              }`}>
                <span className="text-sm">🎯</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">Milestone</h4>
                <p className="text-xs text-gray-500 group-hover:text-gray-600 truncate">Project checkpoint</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Conditional Task Forms */}
      {taskType === 'regular' && (
        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Task Details</h3>
            <p className="text-gray-600">Fill in the basic information for your task</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="form-input"
                placeholder="Enter task title..."
                required
              />
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="form-textarea"
                placeholder="Describe the task..."
                rows={4}
              />
            </div>

            {/* Assignee */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to
              </label>
              <select
                value={formData.assignee}
                onChange={(e) => handleInputChange('assignee', e.target.value)}
                className="form-select"
              >
                <option value="">Select assignee...</option>
                <option value="john">John Doe</option>
                <option value="jane">Jane Smith</option>
                <option value="mike">Mike Johnson</option>
                <option value="sarah">Sarah Wilson</option>
              </select>
            </div>

            {/* Priority */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="form-select"
              >
                <option value="low">Low (30 days)</option>
                <option value="medium">Medium (14 days)</option>
                <option value="high">High (7 days)</option>
                <option value="critical">Critical (2 days)</option>
                <option value="urgent">Urgent (2 days)</option>
              </select>
            </div>

            {/* Status */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="form-select"
              >
                <option value="todo">To Do</option>
                <option value="progress">In Progress</option>
                <option value="review">In Review</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
                {!isManualDueDate && (
                  <span className="text-xs text-blue-600 ml-2">(Auto-calculated from priority)</span>
                )}
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="form-input"
              />
              {!isManualDueDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Due date automatically calculated based on selected priority. Change manually to override.
                </p>
              )}
              {isManualDueDate && (
                <div className="flex items-center mt-1">
                  <p className="text-xs text-gray-500">Manual override active.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualDueDate(false)
                      const calculatedDueDate = calculateDueDateFromPriority(formData.priority)
                      setFormData(prev => ({
                        ...prev,
                        dueDate: calculatedDueDate
                      }))
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 ml-2 underline"
                  >
                    Reset to auto-calculate
                  </button>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="form-select"
              >
                <option value="">Select category...</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="research">Research</option>
                <option value="marketing">Marketing</option>
                <option value="support">Support</option>
              </select>
            </div>

            {/* Tags */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="form-input"
                placeholder="Enter tags separated by commas..."
              />
              <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
            </div>
          </div>
        </div>

        

        {/* File Attachments */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Attachments</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <label className="cursor-pointer">
                <span className="text-primary-600 hover:text-primary-500">Upload files</span>
                <input type="file" className="sr-only" multiple />
              </label>
              <p className="text-gray-500"> or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">PNG, JPG, PDF up to 10MB</p>
          </div>
        </div>

        {/* More Options Button */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Advanced Options</h3>
              <p className="text-sm text-gray-600">Configure additional task settings</p>
            </div>
            <button
              type="button"
              onClick={() => setShowMoreOptions(true)}
              className="btn btn-secondary flex items-center space-x-2"
            >
              <span>⚙️</span>
              <span>More Options</span>
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-secondary">
            Save as Draft
          </button>
          <button type="submit" className="btn btn-primary">
            Create Task
          </button>
        </div>
        </form>
      )}

      {/* Recurring Task Form */}
      {taskType === 'recurring' && (
        <RecurringTaskManager onClose={onClose} />
      )}

      {/* Milestone Task Form */}
      {taskType === 'milestone' && (
        <MilestoneManager onClose={onClose} />
      )}

      {/* More Options Modal */}
      {showMoreOptions && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4 overlay-animate">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-animate-slide-right">
            <MoreOptionsModal
              data={moreOptionsData}
              onChange={handleMoreOptionsChange}
              onClose={() => setShowMoreOptions(false)}
              onSave={() => setShowMoreOptions(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// More Options Modal Component
function MoreOptionsModal({ data, onChange, onClose, onSave }) {
  const [searchTerms, setSearchTerms] = useState({
    process: '',
    form: '',
    dependencies: ''
  })

  // Sample data - in real app, these would come from API
  const referenceProcesses = [
    { id: 'sop001', name: 'Customer Onboarding SOP' },
    { id: 'sop002', name: 'Bug Report Workflow' },
    { id: 'sop003', name: 'Feature Request Process' },
    { id: 'sop004', name: 'Quality Assurance Checklist' },
    { id: 'sop005', name: 'Deployment Process' }
  ]

  const customForms = [
    { id: 'form001', name: 'Bug Report Form' },
    { id: 'form002', name: 'Feature Request Form' },
    { id: 'form003', name: 'Customer Feedback Form' },
    { id: 'form004', name: 'Project Evaluation Form' },
    { id: 'form005', name: 'Performance Review Form' }
  ]

  const existingTasks = [
    { id: 'task001', name: 'Setup Development Environment' },
    { id: 'task002', name: 'Design Database Schema' },
    { id: 'task003', name: 'Create API Endpoints' },
    { id: 'task004', name: 'Write Unit Tests' },
    { id: 'task005', name: 'User Interface Design' }
  ]

  const filteredProcesses = referenceProcesses.filter(process =>
    process.name.toLowerCase().includes(searchTerms.process.toLowerCase())
  )

  const filteredForms = customForms.filter(form =>
    form.name.toLowerCase().includes(searchTerms.form.toLowerCase())
  )

  const filteredTasks = existingTasks.filter(task =>
    task.name.toLowerCase().includes(searchTerms.dependencies.toLowerCase())
  )

  const handleDependencyToggle = (taskId) => {
    const currentDeps = data.dependencies || []
    const newDeps = currentDeps.includes(taskId)
      ? currentDeps.filter(id => id !== taskId)
      : [...currentDeps, taskId]
    onChange('dependencies', newDeps)
  }

  const handleSave = () => {
    // In real app, would validate and save data
    onSave()
  }

  return (
    <>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">More Options</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        <p className="text-gray-600 mt-1">Configure advanced task settings</p>
      </div>

        <div className="p-6 space-y-6">
          {/* Reference Process */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Process
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a process..."
                value={searchTerms.process}
                onChange={(e) => setSearchTerms(prev => ({ ...prev, process: e.target.value }))}
                className="form-input mb-2"
              />
              <select
                value={data.referenceProcess}
                onChange={(e) => onChange('referenceProcess', e.target.value)}
                className="form-select"
              >
                <option value="">Select a process...</option>
                {filteredProcesses.map(process => (
                  <option key={process.id} value={process.id}>
                    {process.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">Link this task to an existing process (e.g., SOP or workflow)</p>
          </div>

          {/* Custom Form */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Form
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for a form..."
                value={searchTerms.form}
                onChange={(e) => setSearchTerms(prev => ({ ...prev, form: e.target.value }))}
                className="form-input mb-2"
              />
              <select
                value={data.customForm}
                onChange={(e) => onChange('customForm', e.target.value)}
                className="form-select"
              >
                <option value="">Select a form...</option>
                {filteredForms.map(form => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">Choose a predefined form to collect data for this task</p>
          </div>

          {/* Dependencies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dependencies
            </label>
            <input
              type="text"
              placeholder="Search for tasks..."
              value={searchTerms.dependencies}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, dependencies: e.target.value }))}
              className="form-input mb-2"
            />
            <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
              {filteredTasks.map(task => (
                <label key={task.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                  <input
                    type="checkbox"
                    checked={data.dependencies?.includes(task.id) || false}
                    onChange={() => handleDependencyToggle(task.id)}
                    className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{task.name}</span>
                </label>
              ))}
              {filteredTasks.length === 0 && (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No tasks found
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Select existing tasks that must be completed before this one starts</p>
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Type *
            </label>
            <select
              value={data.taskTypeAdvanced}
              onChange={(e) => onChange('taskTypeAdvanced', e.target.value)}
              className="form-select"
              required
            >
              <option value="simple">Simple</option>
              <option value="recurring">Recurring</option>
              <option value="approval">Approval</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Determines the task behavior</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary"
          >
            Save Options
          </button>
        </div>
    </>
  )
}