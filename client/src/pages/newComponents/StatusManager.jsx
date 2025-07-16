import React, { useState } from 'react'
import StatusFormModal from './StatusFormModal'

// Helper functions moved outside component
const getTaskCount = (statusCode) => {
  const mockCounts = {
    'OPEN': 142,
    'INPROGRESS': 87,
    'ONHOLD': 23,
    'DONE': 452,
    'CANCELLED': 18
  }
  return mockCounts[statusCode] || 0
}

const getSystemStatusLabel = (systemCode, systemStatuses) => {
  const systemStatus = systemStatuses.find(s => s.code === systemCode)
  return systemStatus ? systemStatus.label : systemCode
}

export default function StatusManager() {
  const [currentUser] = useState({ id: 1, name: 'Current User', role: 'admin' })

  // System-defined priorities (Core Layer - cannot be deleted)
  const [systemStatuses] = useState([
    {
      id: 'sys1',
      code: 'SYS_OPEN',
      label: 'Open',
      description: 'Task is created but not yet started',
      color: '#6c757d',
      isFinal: false,
      isDefault: true,
      active: true,
      order: 1,
      isSystem: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'sys2',
      code: 'SYS_INPROGRESS',
      label: 'In Progress',
      description: 'Task is being actively worked on',
      color: '#3498db',
      isFinal: false,
      isDefault: false,
      active: true,
      order: 2,
      isSystem: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'sys3',
      code: 'SYS_ONHOLD',
      label: 'On Hold',
      description: 'Task is temporarily paused',
      color: '#f39c12',
      isFinal: false,
      isDefault: false,
      active: true,
      order: 3,
      isSystem: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'sys4',
      code: 'SYS_DONE',
      label: 'Completed',
      description: 'Task has been completed successfully',
      color: '#28a745',
      isFinal: true,
      isDefault: false,
      active: true,
      order: 4,
      isSystem: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'sys5',
      code: 'SYS_CANCELLED',
      label: 'Cancelled',
      description: 'Task was cancelled and will not be completed',
      color: '#dc3545',
      isFinal: true,
      isDefault: false,
      active: true,
      order: 5,
      isSystem: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ])

  // Company-defined statuses (configurable by admin)
  const [companyStatuses, setCompanyStatuses] = useState([
    {
      id: 1,
      code: 'OPEN',
      label: 'Open',
      description: 'Task is created but not yet started',
      color: '#6c757d',
      isFinal: false,
      isDefault: true,
      active: true,
      order: 1,
      systemMapping: 'SYS_OPEN',
      allowedTransitions: ['INPROGRESS', 'ONHOLD', 'CANCELLED'],
      isSystem: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      code: 'INPROGRESS',
      label: 'In Progress',
      description: 'Task is being actively worked on',
      color: '#3498db',
      isFinal: false,
      isDefault: false,
      active: true,
      order: 2,
      systemMapping: 'SYS_INPROGRESS',
      allowedTransitions: ['ONHOLD', 'DONE', 'CANCELLED'],
      isSystem: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      code: 'ONHOLD',
      label: 'On Hold',
      description: 'Task is temporarily paused',
      color: '#f39c12',
      isFinal: false,
      isDefault: false,
      active: true,
      order: 3,
      systemMapping: 'SYS_ONHOLD',
      allowedTransitions: ['INPROGRESS', 'CANCELLED'],
      isSystem: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 4,
      code: 'DONE',
      label: 'Completed',
      description: 'Task has been completed successfully',
      color: '#28a745',
      isFinal: true,
      isDefault: false,
      active: true,
      order: 4,
      systemMapping: 'SYS_DONE',
      allowedTransitions: [],
      isSystem: false,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 5,
      code: 'CANCELLED',
      label: 'Cancelled',
      description: 'Task was cancelled and will not be completed',
      color: '#dc3545',
      isFinal: true,
      isDefault: false,
      active: true,
      order: 5,
      systemMapping: 'SYS_CANCELLED',
      allowedTransitions: [],
      isSystem: false,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ])

  const [showSystemStatuses, setShowSystemStatuses] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStatus, setEditingStatus] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)
  const [statusChangeModal, setStatusChangeModal] = useState(null)

  const handleAddStatus = (statusData) => {
    const newStatus = {
      id: Date.now(),
      ...statusData,
      active: true,
      order: companyStatuses.length + 1,
      isSystem: false
    }
    setCompanyStatuses([...companyStatuses, newStatus])
    setShowAddForm(false)
  }

  const handleUpdateStatus = (updatedStatus) => {
    setCompanyStatuses(companyStatuses.map(status => 
      status.id === updatedStatus.id ? updatedStatus : status
    ))
    setEditingStatus(null)
  }

  const handleDeleteStatus = (statusId, mappingStatusId) => {
    const statusToDelete = companyStatuses.find(s => s.id === statusId)
    const mappingStatus = companyStatuses.find(s => s.id === mappingStatusId)

    // Mark status as inactive and create mapping entry
    setCompanyStatuses(companyStatuses.map(status => 
      status.id === statusId ? { 
        ...status, 
        active: false,
        retiredAt: new Date().toISOString(),
        mappedTo: mappingStatusId
      } : status
    ))

    // Log the status change for audit trail
    console.log('Status deleted and mapped:', {
      deletedStatus: statusToDelete.label,
      mappedTo: mappingStatus.label,
      timestamp: new Date().toISOString(),
      affectedTasks: getTaskCount(statusToDelete.code)
    })

    setDeleteModal(null)
  }

  const handleSetDefault = (statusId) => {
    setCompanyStatuses(companyStatuses.map(status => ({
      ...status,
      isDefault: status.id === statusId
    })))
  }

  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverItem, setDragOverItem] = useState(null)

  const handleReorderStatuses = (reorderedStatuses) => {
    const updatedStatuses = reorderedStatuses.map((status, index) => ({
      ...status,
      order: index + 1
    }))
    setCompanyStatuses(updatedStatuses)
  }

  const handleDragStart = (e, status) => {
    setDraggedItem(status)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e, status) => {
    e.preventDefault()
    setDragOverItem(status)
  }

  const handleDrop = (e, targetStatus) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem.id === targetStatus.id) {
      return
    }

    const currentStatuses = [...activeCompanyStatuses].sort((a, b) => a.order - b.order)
    const draggedIndex = currentStatuses.findIndex(s => s.id === draggedItem.id)
    const targetIndex = currentStatuses.findIndex(s => s.id === targetStatus.id)

    // Remove dragged item from its current position
    currentStatuses.splice(draggedIndex, 1)
    // Insert at new position
    currentStatuses.splice(targetIndex, 0, draggedItem)

    // Update order numbers
    const reorderedStatuses = currentStatuses.map((status, index) => ({
      ...status,
      order: index + 1
    }))

    // Update the full statuses array maintaining inactive items
    const updatedAllStatuses = companyStatuses.map(status => {
      const reordered = reorderedStatuses.find(r => r.id === status.id)
      return reordered || status
    })

    setCompanyStatuses(updatedAllStatuses)
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const getValidTransitions = (currentStatusCode, taskData = null) => {
    const currentStatus = companyStatuses.find(s => s.code === currentStatusCode)
    if (!currentStatus) return []

    let validTransitions = currentStatus.allowedTransitions

    // Apply sub-task completion logic
    if (taskData && taskData.subtasks && taskData.subtasks.length > 0) {
      const hasIncompleteSubtasks = taskData.subtasks.some(subtask => 
        subtask.status !== 'DONE' && subtask.status !== 'CANCELLED'
      )

      // Prevent parent task from being marked as completed if sub-tasks are incomplete
      if (hasIncompleteSubtasks) {
        validTransitions = validTransitions.filter(transition => transition !== 'DONE')
      }
    }

    return validTransitions
  }

  const canEditTaskStatus = (task, currentUser) => {
    // Edit permissions: Only task assignee, collaborators, or admins
    return (
      task.assigneeId === currentUser.id ||
      task.collaborators?.includes(currentUser.id) ||
      currentUser.role === 'admin'
    )
  }

  const validateBulkStatusChange = (selectedTasks, newStatusCode, currentUser) => {
    const errors = []

    selectedTasks.forEach(task => {
      // Check edit permissions
      if (!canEditTaskStatus(task, currentUser)) {
        errors.push(`No permission to edit task: ${task.title}`)
        return
      }

      // Check valid transitions
      const validTransitions = getValidTransitions(task.status, task)
      if (!validTransitions.includes(newStatusCode)) {
        errors.push(`Invalid status transition for task: ${task.title}`)
        return
      }

      // Check sub-task completion logic
      if (newStatusCode === 'DONE' && task.subtasks?.length > 0) {
        const incompleteSubtasks = task.subtasks.filter(st => 
          st.status !== 'DONE' && st.status !== 'CANCELLED'
        )
        if (incompleteSubtasks.length > 0) {
          errors.push(`Task "${task.title}" has ${incompleteSubtasks.length} incomplete sub-tasks`)
        }
      }
    })

    return errors
  }

  const getSystemStatusLabelMain = (systemCode) => {
    const systemStatus = systemStatuses.find(s => s.code === systemCode)
    return systemStatus ? systemStatus.label : systemCode
  }

  const activeCompanyStatuses = companyStatuses.filter(s => s.active)

  return (
    <div className="space-y-8 p-5 h-auto overflow-scroll">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Company Status Configuration
          </h1>
          <p className="mt-3 text-xl text-gray-600">Configure custom task statuses for your organization</p>
          <div className="absolute -top-2 -left-2 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <button 
              className="btn btn-primary relative overflow-hidden group"
              onClick={() => setShowAddForm(true)}
            >
              <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Custom Status
            </button>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showSystemStatuses}
                onChange={(e) => setShowSystemStatuses(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show System Statuses</span>
            </label>
          </div>
          <div className="text-sm text-gray-500">
            Company Statuses: {companyStatuses.filter(s => s.active).length} | 
            System Statuses: {systemStatuses.length}
          </div>
        </div>

        <div className="status-workflow-diagram">
          <h3>Company Status Workflow</h3>
          <div className="workflow-visualization">
            {companyStatuses.filter(s => s.active).sort((a, b) => a.order - b.order).map(status => (
              <div key={status.id} className="workflow-node">
                <div 
                  className="status-node company-status"
                  style={{ backgroundColor: status.color }}
                >
                  <span className="status-label">{status.label}</span>
                  {status.isDefault && <span className="default-indicator">DEFAULT</span>}
                  <span className="system-mapping">
                    → {getSystemStatusLabelMain(status.systemMapping)}
                  </span>
                </div>
                {status.allowedTransitions.length > 0 && (
                  <div className="transitions">
                    {status.allowedTransitions.map(transitionCode => {
                      const targetStatus = companyStatuses.find(s => s.code === transitionCode)
                      return targetStatus ? (
                        <div key={transitionCode} className="transition-arrow">
                          → {targetStatus.label}
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="status-sections">
          <div className="status-list company-statuses">
            <div className="section-header">
              <h3>Company Statuses</h3>
              <p>Custom statuses configured for your organization</p>
            </div>
            <div className="status-table">
              <div className="table-header">
                <div className="th">Order</div>
                <div className="th">Status</div>
                <div className="th">Code</div>
                <div className="th">System Mapping</div>
                <div className="th">Type</div>
                <div className="th">Tasks Using</div>
                <div className="th">Actions</div>
              </div>

              {activeCompanyStatuses.sort((a, b) => a.order - b.order).map(status => (
                <CompanyStatusRow
                  key={status.id}
                  status={status}
                  systemStatuses={systemStatuses}
                  onEdit={() => setEditingStatus(status)}
                  onDelete={() => setDeleteModal(status)}
                  onSetDefault={() => handleSetDefault(status.id)}
                  canEdit={currentUser.role === 'admin'}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDrop={handleDrop}
                  isDraggedOver={dragOverItem && dragOverItem.id === status.id}
                />
              ))}
            </div>
          </div>

          {showSystemStatuses && (
            <div className="status-list system-statuses">
              <div className="section-header">
                <h3>System Statuses (Read-Only)</h3>
                <p>Core statuses used for internal logic and analytics - Required for application consistency</p>
              </div>
              <div className="status-table">
                <div className="table-header">
                  <div className="th">Status</div>
                  <div className="th">Code</div>
                  <div className="th">Description</div>
                  <div className="th">Type</div>
                  <div className="th">Company Mappings</div>
                </div>

                {systemStatuses.map(status => (
                  <SystemStatusRow
                    key={status.id}
                    status={status}
                    companyStatuses={activeCompanyStatuses}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="status-form-modal-overlay">
          <div className="status-form-modal">
            <h2>Create New Status</h2>
            <StatusFormModal
              onSubmit={handleAddStatus}
              onClose={() => setShowAddForm(false)}
              existingStatuses={companyStatuses}
              systemStatuses={systemStatuses}
            />
          </div>
        </div>
      )}

      {editingStatus && (
        <div className="status-form-modal-overlay">
          <div className="status-form-modal">
            <h2>Edit Status</h2>
            <StatusFormModal
              status={editingStatus}
              onSubmit={handleUpdateStatus}
              onClose={() => setEditingStatus(null)}
              existingStatuses={companyStatuses}
              systemStatuses={systemStatuses}
              isEdit={true}
            />
          </div>
        </div>
      )}

      {deleteModal && (
        <DeleteStatusModal
          status={deleteModal}
          statuses={companyStatuses.filter(s => s.active && s.id !== deleteModal.id)}
          onConfirm={handleDeleteStatus}
          onClose={() => setDeleteModal(null)}
        />
      )}

      {/* Slide-in Drawer */}
      
    </div>
  )
}

function CompanyStatusRow({ status, systemStatuses, onEdit, onDelete, onSetDefault, canEdit, onDragStart, onDragEnd, onDragOver, onDragEnter, onDrop, isDraggedOver }) {
  const taskCount = getTaskCount(status.code)

  return (
    <div 
      className={`table-row ${isDraggedOver ? 'drag-over' : ''}`}
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, status)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={(e) => onDragEnter(e, status)}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="td">
        <div className={`drag-handle ${canEdit ? 'draggable' : ''}`}>⋮⋮</div>
        <span className="order-number">{status.order}</span>
      </div>
      <div className="td">
        <div className="status-display">
          <span 
            className="status-color-indicator"
            style={{ backgroundColor: status.color }}
          ></span>
          <span className="status-name">{status.label}</span>
          {status.isDefault && (
            <span className="badge badge-primary">DEFAULT</span>
          )}
        </div>
      </div>
      <div className="td">
        <code className="status-code">{status.code}</code>
      </div>
      <div className="td">
        <div className="system-mapping-display">
          <span className="system-status-label">
            {getSystemStatusLabel(status.systemMapping, systemStatuses)}
          </span>
          <code className="system-status-code">({status.systemMapping})</code>
        </div>
      </div>
      <div className="td">
        <span className={`status-type ${status.isFinal ? 'final' : 'active'}`}>
          {status.isFinal ? 'Final' : 'Active'}
        </span>
      </div>
      <div className="td">
        <div className="task-count-display">
          <span className="task-count-number">{taskCount}</span>
          <span className="task-count-label">tasks</span>
        </div>
      </div>
      <div className="td">
        <div className="action-buttons">
          {canEdit && (
            <>
              <button className="btn-action" onClick={onEdit}>
                Edit
              </button>
              {!status.isDefault && (
                <button className="btn-action" onClick={onSetDefault}>
                  Set Default
                </button>
              )}
              <button 
                className="btn-action danger" 
                onClick={onDelete}
                disabled={taskCount > 0}
                title={taskCount > 0 ? `Cannot delete: ${taskCount} tasks using this status` : 'Delete status'}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SystemStatusRow({ status, companyStatuses }) {
  const mappedCompanyStatuses = companyStatuses.filter(cs => cs.systemMapping === status.code)

  return (
    <div className="table-row system-row">
      <div className="td">
        <div className="status-display">
          <span 
            className="status-color-indicator"
            style={{ backgroundColor: status.color }}
          ></span>
          <span className="status-name">{status.label}</span>
          <span className="badge badge-secondary">SYSTEM</span>
        </div>
      </div>
      <div className="td">
        <code className="status-code">{status.code}</code>
      </div>
      <div className="td">
        <span className="status-description">{status.description}</span>
      </div>
      <div className="td">
        <span className={`status-type ${status.isFinal ? 'final' : 'active'}`}>
          {status.isFinal ? 'Final' : 'Active'}
        </span>
      </div>
      <div className="td">
        <div className="company-mappings">
          {mappedCompanyStatuses.length > 0 ? (
            <div className="mapping-list">
              {mappedCompanyStatuses.map(cs => (
                <span key={cs.id} className="mapping-badge" style={{ backgroundColor: cs.color }}>
                  {cs.label}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">No mappings</span>
          )}
        </div>
      </div>
    </div>
  )
}

function DeleteStatusModal({ status, statuses, onConfirm, onClose }) {
  const [mappingStatusId, setMappingStatusId] = useState('')

  const handleConfirm = () => {
    if (mappingStatusId) {
      onConfirm(status.id, mappingStatusId)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Delete Status: {status.label}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <p>
              This action will permanently delete the "{status.label}" status. 
              All tasks currently using this status must be mapped to another status.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="mappingStatus">
              Map existing tasks to status:*
            </label>
            <select
              id="mappingStatus"
              value={mappingStatusId}
              onChange={(e) => setMappingStatusId(e.target.value)}
              required
            >
              <option value="">Select a status...</option>
              {statuses.map(mappingStatus => (
                <option key={mappingStatus.id} value={mappingStatus.id}>
                  {mappingStatus.label}
                </option>
              ))}
            </select>
            <small className="form-hint">
              All tasks with "{status.label}" status will be changed to the selected status.
            </small>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="button" 
              className="btn-danger"
              onClick={handleConfirm}
              disabled={!mappingStatusId}
            >
              Delete Status
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}