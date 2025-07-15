import React, { useState } from 'react'

// Helper functions moved outside component
const getStatusColor = (status) => {
  const colors = {
    not_started: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-purple-100 text-purple-800'
  }
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

export default function MilestoneManager() {
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      taskName: 'Project Alpha Launch',
      isMilestone: true,
      milestoneType: 'standalone',
      linkedTasks: [1, 2, 3, 4],
      dueDate: '2024-02-15',
      assignedTo: 'John Smith',
      description: 'Complete launch of the new project management system',
      visibility: 'public',
      priority: 'high',
      collaborators: ['Sarah Wilson', 'Mike Johnson'],
      status: 'in_progress',
      progress: 75,
      tasks: [
        { id: 1, title: 'UI Design Complete', completed: true },
        { id: 2, title: 'Backend API Development', completed: true },
        { id: 3, title: 'Testing Phase', completed: false },
        { id: 4, title: 'Deployment', completed: false }
      ]
    },
    {
      id: 2,
      taskName: 'Q1 Marketing Campaign',
      isMilestone: true,
      milestoneType: 'linked',
      linkedTasks: [5, 6, 7],
      dueDate: '2024-03-31',
      assignedTo: 'Emily Davis',
      description: 'Launch comprehensive marketing campaign for Q1',
      visibility: 'private',
      priority: 'medium',
      collaborators: ['Current User'],
      status: 'not_started',
      progress: 0,
      tasks: [
        { id: 5, title: 'Content Strategy', completed: false },
        { id: 6, title: 'Creative Assets', completed: false },
        { id: 7, title: 'Campaign Launch', completed: false }
      ]
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)

  

  return (
    <div className="space-y-6 p-5 h-auto overflow-scroll">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Milestone Manager</h1>
          <p className="mt-2 text-lg text-gray-600">Track and manage project milestones</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Milestone
        </button>
      </div>

      <div className="grid gap-6">
        {milestones.map(milestone => (
          <div key={milestone.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.taskName}</h3>
                <p className="text-gray-600 mb-4">{milestone.description}</p>

                <div className="flex items-center space-x-4 flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                    {milestone.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(milestone.priority)}`}>
                    {milestone.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {milestone.milestoneType.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    Assigned: {milestone.assignedTo}
                  </span>
                  <span className="text-sm text-gray-500">
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    👁️ {milestone.visibility}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{milestone.progress}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-500">{milestone.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${milestone.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Collaborators</h4>
                <div className="flex flex-wrap gap-2">
                  {milestone.collaborators.map((collaborator, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      👤 {collaborator}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Associated Tasks</h4>
                <div className="space-y-2">
                  {milestone.tasks.map(task => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        readOnly
                      />
                      <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
              <button className="btn btn-secondary btn-sm">
                Edit
              </button>
              <button className="btn btn-primary btn-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="modal-overlay overlay-animate">
          <div className="modal-container max-w-4xl modal-animate-fade">
            <div className="modal-header">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Add New Milestone</h3>
                  <p className="text-white/80 text-sm">Create a milestone to track project progress</p>
                </div>
              </div>
              <button className="close-button" onClick={() => setShowAddForm(false)}>×</button>
            </div>

            <form className="modal-content bg-gradient-to-br from-gray-50 to-white">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Milestone Information</h4>
                    <p className="text-sm text-gray-600">Define the basic properties and configuration for your milestone</p>
                  </div>
                </div>
              </div>

              {/* Main Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="form-group">
                    <label htmlFor="taskName" className="form-label flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Milestone Title*
                    </label>
                    <input
                      type="text"
                      id="taskName"
                      placeholder="Enter milestone title (e.g., Project Alpha Launch)"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <label htmlFor="isMilestone" className="flex items-center space-x-3 cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="isMilestone"
                            defaultChecked={true}
                            className="w-5 h-5 rounded border-2 border-amber-300 text-amber-600 focus:ring-amber-500 focus:ring-offset-0"
                          />
                          <svg className="w-3 h-3 text-amber-600 absolute top-0.5 left-0.5 pointer-events-none" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-amber-800">Milestone Toggle*</span>
                          <p className="text-xs text-amber-700 mt-1">Required to mark this task as a milestone</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="milestoneType" className="form-label flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Milestone Type
                    </label>
                    <select id="milestoneType" className="form-select">
                      <option value="standalone">🎯 Standalone Milestone</option>
                      <option value="linked">🔗 Linked to Tasks</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="dueDate" className="form-label flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Due Date*
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="assignedTo" className="form-label flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Assigned To
                    </label>
                    <select id="assignedTo" className="form-select">
                      <option value="Current User">👤 Current User</option>
                      <option value="John Smith">👨‍💼 John Smith</option>
                      <option value="Sarah Wilson">👩‍💼 Sarah Wilson</option>
                      <option value="Mike Johnson">👨‍💻 Mike Johnson</option>
                      <option value="Emily Davis">👩‍💻 Emily Davis</option>
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="form-group">
                    <label htmlFor="linkedTasks" className="form-label flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Link to Tasks
                    </label>
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4">
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-green-500">✅</span>
                            <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">UI Design Complete</span>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-blue-500">⚙️</span>
                            <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">Backend API Development</span>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-purple-500">🧪</span>
                            <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">Testing Phase</span>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-orange-500">🚀</span>
                            <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">Deployment</span>
                          </div>
                        </label>
                      </div>
                      <p className="text-xs text-indigo-600 mt-3 flex items-center gap-1 bg-white/50 p-2 rounded-lg">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Select tasks/subtasks to monitor for this milestone
                      </p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description" className="form-label flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Description
                    </label>
                    <textarea
                      id="description"
                      placeholder="Describe the milestone purpose, criteria, and background..."
                      rows="4"
                      className="form-textarea resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="visibility" className="form-label flex items-center gap-2">
                        <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Visibility
                      </label>
                      <select id="visibility" className="form-select">
                        <option value="private">🔒 Private</option>
                        <option value="public">👥 Public</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="priority" className="form-label flex items-center gap-2">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Priority
                      </label>
                      <select id="priority" className="form-select">
                        <option value="low">🟢 Low</option>
                        <option value="medium" defaultSelected>🟡 Medium</option>
                        <option value="high">🟠 High</option>
                        <option value="critical">🔴 Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="collaborators" className="form-label flex items-center gap-2">
                      <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Collaborators
                    </label>
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4">
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">CU</div>
                            <div>
                              <span className="text-sm font-medium text-gray-900 group-hover:text-teal-700">Current User</span>
                              <p className="text-xs text-gray-500">current@company.com</p>
                            </div>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">JS</div>
                            <div>
                              <span className="text-sm font-medium text-gray-900 group-hover:text-teal-700">John Smith</span>
                              <p className="text-xs text-gray-500">john@company.com</p>
                            </div>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">SW</div>
                            <div>
                              <span className="text-sm font-medium text-gray-900 group-hover:text-teal-700">Sarah Wilson</span>
                              <p className="text-xs text-gray-500">sarah@company.com</p>
                            </div>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">MJ</div>
                            <div>
                              <span className="text-sm font-medium text-gray-900 group-hover:text-teal-700">Mike Johnson</span>
                              <p className="text-xs text-gray-500">mike@company.com</p>
                            </div>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 cursor-pointer group">
                          <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold">ED</div>
                            <div>
                              <span className="text-sm font-medium text-gray-900 group-hover:text-teal-700">Emily Davis</span>
                              <p className="text-xs text-gray-500">emily@company.com</p>
                            </div>
                          </div>
                        </label>
                      </div>
                      <p className="text-xs text-teal-600 mt-3 flex items-center gap-1 bg-white/50 p-2 rounded-lg">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Optional - for updates & comments visibility
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 mt-10 pt-8 border-t-2 border-gray-100">
                <button 
                  type="button" 
                  className="btn btn-secondary px-8 py-3 text-sm font-semibold" 
                  onClick={() => setShowAddForm(false)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary px-8 py-3 text-sm font-semibold flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}