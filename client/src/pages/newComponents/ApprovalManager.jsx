
import React, { useState } from 'react'
import ApprovalTaskCreator from './ApprovalTaskCreator'

export default function ApprovalManager() {
  const [currentUser] = useState({ id: 1, name: 'Current User', role: 'manager' })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [approvalTasks, setApprovalTasks] = useState([
    {
      id: 1,
      title: "Budget Approval Q1 2024",
      mode: "sequential",
      status: "pending",
      approvers: [
        { id: 1, name: "John Smith", role: "manager", status: "approved", comment: "Looks good", approvedAt: "2024-01-15" },
        { id: 2, name: "Sarah Wilson", role: "director", status: "pending", comment: null, approvedAt: null },
        { id: 3, name: "Mike Johnson", role: "cfo", status: "waiting", comment: null, approvedAt: null }
      ],
      creator: "Emily Davis",
      createdAt: "2024-01-10",
      dueDate: "2024-01-30",
      autoApprove: false,
      description: "Quarterly budget approval for development team"
    },
    {
      id: 2,
      title: "Security Policy Update",
      mode: "all",
      status: "in-progress",
      approvers: [
        { id: 4, name: "Alex Turner", role: "security", status: "approved", comment: "Security measures adequate", approvedAt: "2024-01-12" },
        { id: 5, name: "Lisa Chen", role: "compliance", status: "pending", comment: null, approvedAt: null },
        { id: 6, name: "David Brown", role: "legal", status: "rejected", comment: "Need additional clauses", approvedAt: "2024-01-14" }
      ],
      creator: "Security Team",
      createdAt: "2024-01-08",
      dueDate: "2024-01-25",
      autoApprove: false,
      description: "Updated security policy for remote work guidelines"
    },
    {
      id: 3,
      title: "New Hire Approval",
      mode: "any",
      status: "approved",
      approvers: [
        { id: 7, name: "HR Manager", role: "hr", status: "approved", comment: "Excellent candidate", approvedAt: "2024-01-16" },
        { id: 8, name: "Team Lead", role: "manager", status: "waiting", comment: null, approvedAt: null }
      ],
      creator: "Recruiting Team",
      createdAt: "2024-01-14",
      dueDate: "2024-01-20",
      autoApprove: false,
      description: "Approval for new senior developer position"
    }
  ])

  const getApprovalStatus = (task) => {
    const { approvers, mode } = task
    const approved = approvers.filter(a => a.status === 'approved')
    const rejected = approvers.filter(a => a.status === 'rejected')
    const pending = approvers.filter(a => a.status === 'pending')

    if (rejected.length > 0 && mode !== 'any') return 'rejected'
    
    switch (mode) {
      case 'any':
        return approved.length > 0 ? 'approved' : pending.length > 0 ? 'pending' : 'waiting'
      case 'all':
        return approved.length === approvers.length ? 'approved' : 
               rejected.length > 0 ? 'rejected' : 'pending'
      case 'sequential':
        const currentIndex = approved.length
        if (currentIndex === approvers.length) return 'approved'
        if (rejected.length > 0) return 'rejected'
        return 'pending'
      default:
        return 'pending'
    }
  }

  const canUserApprove = (task, approver) => {
    if (approver.status !== 'pending') return false
    if (task.mode === 'sequential') {
      const approverIndex = task.approvers.findIndex(a => a.id === approver.id)
      const previousApproved = task.approvers.slice(0, approverIndex).every(a => a.status === 'approved')
      return previousApproved
    }
    return true
  }

  const handleApproval = (taskId, approverId, action, comment) => {
    setApprovalTasks(tasks => tasks.map(task => {
      if (task.id !== taskId) return task
      
      const updatedApprovers = task.approvers.map(approver => {
        if (approver.id === approverId) {
          return {
            ...approver,
            status: action,
            comment: comment || null,
            approvedAt: new Date().toISOString().split('T')[0]
          }
        }
        return approver
      })

      return {
        ...task,
        approvers: updatedApprovers,
        status: getApprovalStatus({ ...task, approvers: updatedApprovers })
      }
    }))
  }

  const handleCreateApprovalTask = (taskData) => {
    setApprovalTasks([...approvalTasks, taskData])
    setShowCreateModal(false)
  }

  return (
    <div className="space-y-6 p-5 h-auto overflow-scroll">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approval Tasks</h1>
          <p className="mt-2 text-lg text-gray-600">Manage approval workflows and tasks</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <select className="form-select">
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </select>
            <select className="form-select">
              <option>All Modes</option>
              <option>Any Approver</option>
              <option>All Approvers</option>
              <option>Sequential</option>
            </select>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Approval Task
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {approvalTasks.map(task => (
            <ApprovalTaskCard 
              key={task.id} 
              task={task} 
              currentUser={currentUser}
              onApproval={handleApproval}
            />
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0">
          <div className="drawer-overlay absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="absolute right-0 top-0 h-full bg-white/95 backdrop-blur-sm flex flex-col modal-animate-slide-right" style={{width: 'min(90vw, 600px)', boxShadow: '-10px 0 50px rgba(0,0,0,0.2)', borderLeft: '1px solid rgba(255,255,255,0.2)'}}>
            <div className="drawer-header">
              <h2 className="text-2xl font-bold text-white">
                Create Approval Task
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="close-btn"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="drawer-body">
              <ApprovalTaskCreator
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateApprovalTask}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ApprovalTaskCard({ task, currentUser, onApproval }) {
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedApprover, setSelectedApprover] = useState(null)

  const overallStatus = getApprovalStatus(task)
  const userApprover = task.approvers.find(a => a.id === currentUser.id)
  const canApprove = userApprover && canUserApprove(task, userApprover)

  const handleApproveClick = (approver) => {
    setSelectedApprover(approver)
    setShowApprovalModal(true)
  }

  return (
    <>
      <div className="card hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          <span className={`status-badge ${overallStatus === 'approved' ? 'status-completed' : overallStatus === 'rejected' ? 'bg-red-100 text-red-800' : overallStatus === 'pending' ? 'status-progress' : 'status-todo'}`}>
            {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
          </span>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 text-sm">{task.description}</p>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Mode:</span>
              <span className="font-medium text-gray-900">{task.mode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Due Date:</span>
              <span className="font-medium text-gray-900">{task.dueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Creator:</span>
              <span className="font-medium text-gray-900">{task.creator}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Approval Chain</h4>
            <div className="space-y-2">
              {task.approvers.map((approver, index) => (
                <div key={approver.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {approver.status === 'approved' ? '✅' : 
                       approver.status === 'rejected' ? '❌' : 
                       approver.status === 'pending' ? '⏳' : '⏸️'}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{approver.name}</span>
                      <span className="text-xs text-gray-500 ml-1">({approver.role})</span>
                    </div>
                  </div>
                  
                  {approver.status === 'pending' && canUserApprove(task, approver) && approver.id === currentUser.id && (
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleApproveClick(approver)}
                    >
                      Review
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showApprovalModal && (
        <ApprovalModal
          task={task}
          approver={selectedApprover}
          onApproval={onApproval}
          onClose={() => {
            setShowApprovalModal(false)
            setSelectedApprover(null)
          }}
        />
      )}
    </>
  )
}

function ApprovalModal({ task, approver, onApproval, onClose }) {
  const [comment, setComment] = useState('')
  const [action, setAction] = useState('')

  const handleSubmit = (selectedAction) => {
    if (!comment.trim() && selectedAction === 'rejected') {
      alert('Please provide a comment for rejection')
      return
    }
    
    onApproval(task.id, approver.id, selectedAction, comment)
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Review: {task.title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="approval-details">
            <p><strong>Description:</strong> {task.description}</p>
            <p><strong>Mode:</strong> {task.mode}</p>
            <p><strong>Due Date:</strong> {task.dueDate}</p>
          </div>

          <div className="form-group">
            <label>Comment (optional for approval, required for rejection):</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your review comment..."
              className="form-input"
              rows="4"
            />
          </div>
          
          <div className="modal-actions">
            <button 
              className="btn-secondary" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="btn-danger"
              onClick={() => handleSubmit('rejected')}
            >
              Reject
            </button>
            <button 
              className="btn-success"
              onClick={() => handleSubmit('approved')}
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getApprovalStatus(task) {
  const { approvers, mode } = task
  const approved = approvers.filter(a => a.status === 'approved')
  const rejected = approvers.filter(a => a.status === 'rejected')
  const pending = approvers.filter(a => a.status === 'pending')

  if (rejected.length > 0 && mode !== 'any') return 'rejected'
  
  switch (mode) {
    case 'any':
      return approved.length > 0 ? 'approved' : pending.length > 0 ? 'pending' : 'waiting'
    case 'all':
      return approved.length === approvers.length ? 'approved' : 
             rejected.length > 0 ? 'rejected' : 'pending'
    case 'sequential':
      const currentIndex = approved.length
      if (currentIndex === approvers.length) return 'approved'
      if (rejected.length > 0) return 'rejected'
      return 'pending'
    default:
      return 'pending'
  }
}

function canUserApprove(task, approver) {
  if (approver.status !== 'pending') return false
  if (task.mode === 'sequential') {
    const approverIndex = task.approvers.findIndex(a => a.id === approver.id)
    const previousApproved = task.approvers.slice(0, approverIndex).every(a => a.status === 'approved')
    return previousApproved
  }
  return true
}
