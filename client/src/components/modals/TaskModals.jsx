import React, { useState } from 'react';
import { X, Trash2, Users, Clock, AlertTriangle, CheckCircle, ChevronDown } from 'lucide-react';

// Delete Modal
export function DeleteTaskModal({ isOpen, onClose, onConfirm, task }) {
  const [confirmChecks, setConfirmChecks] = useState({
    deleteSubtasks: false,
    deleteForms: false,
    irreversible: false
  });

  const handleConfirm = () => {
    if (confirmChecks.irreversible) {
      onConfirm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header" style={{ background: '#ef4444' }}>
          <div className="modal-title-section">
            <div className="modal-icon">
              <Trash2 size={16} />
            </div>
            <div>
              <h3>Delete Task</h3>
              <p>Permanently remove this task</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="delete-confirmation">
            <p className="confirmation-text">
              Are you sure you want to delete this task?
            </p>
            <p className="task-name">"{task?.title || 'Database Migration'}" <span className="task-status">In Progress</span></p>
            
            <div className="warning-section">
              <div className="warning-icon">
                <AlertTriangle size={16} />
              </div>
              <div>
                <p className="warning-title">Important Notice:</p>
                <p>This task has 5 subtask(s). Deleting it will delete all subtasks.</p>
                <p>All linked forms and files will also be deleted.</p>
              </div>
            </div>
            
            <div className="confirmation-checkboxes">
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={confirmChecks.deleteSubtasks}
                  onChange={(e) => setConfirmChecks({...confirmChecks, deleteSubtasks: e.target.checked})}
                />
                <span>Also delete all 5 subtask(s)</span>
              </label>
              
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={confirmChecks.deleteForms}
                  onChange={(e) => setConfirmChecks({...confirmChecks, deleteForms: e.target.checked})}
                />
                <span>Also delete attached forms and files</span>
              </label>
              
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={confirmChecks.irreversible}
                  onChange={(e) => setConfirmChecks({...confirmChecks, irreversible: e.target.checked})}
                />
                <span>I understand this action is irreversible</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className={`modal-btn-primary ${!confirmChecks.irreversible ? 'disabled' : ''}`}
            onClick={handleConfirm}
            disabled={!confirmChecks.irreversible}
            style={{ background: !confirmChecks.irreversible ? '#9ca3af' : '#ef4444' }}
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}

// Reassign Modal
export function ReassignTaskModal({ isOpen, onClose, onConfirm, task }) {
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const assignees = [
    { id: 'john-smith', name: 'John Smith', email: 'john@example.com' },
    { id: 'sarah-wilson', name: 'Sarah Wilson', email: 'sarah@example.com' },
    { id: 'mike-johnson', name: 'Mike Johnson', email: 'mike@example.com' },
    { id: 'emily-davis', name: 'Emily Davis', email: 'emily@example.com' },
    { id: 'david-brown', name: 'David Brown', email: 'david@example.com' }
  ];

  const filteredAssignees = assignees.filter(assignee =>
    assignee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = () => {
    if (selectedAssignee) {
      onConfirm(selectedAssignee);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header" style={{ background: '#4f46e5' }}>
          <div className="modal-title-section">
            <div className="modal-icon">
              <Users size={16} />
            </div>
            <div>
              <h3>Reassign Task</h3>
              <p>Change task assignee</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="reassign-form">
            <label className="form-label">Select new assignee:</label>
            <div className="dropdown-container">
              <div 
                className="searchable-dropdown"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <input
                  type="text"
                  placeholder="Search assignees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dropdown-input"
                />
                <ChevronDown size={16} className="dropdown-arrow" />
              </div>
              
              {isDropdownOpen && (
                <div className="dropdown-options">
                  {filteredAssignees.map(assignee => (
                    <div
                      key={assignee.id}
                      className={`dropdown-option ${selectedAssignee === assignee.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedAssignee(assignee.id);
                        setSearchTerm(assignee.name);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="assignee-info">
                        <span className="assignee-name">{assignee.name}</span>
                        <span className="assignee-email">{assignee.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="modal-btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className={`modal-btn-primary ${!selectedAssignee ? 'disabled' : ''}`}
            onClick={handleConfirm}
            disabled={!selectedAssignee}
          >
            Reassign Task
          </button>
        </div>
      </div>
    </div>
  );
}

// Snooze Modal
export function SnoozeTaskModal({ isOpen, onClose, onConfirm, task }) {
  const [snoozeDate, setSnoozeDate] = useState('');
  const [snoozeTime, setSnoozeTime] = useState('03:30');
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    if (snoozeDate) {
      onConfirm({ date: snoozeDate, time: snoozeTime, note });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header snooze-header">
          <div className="modal-title-section">
            <Clock size={24} />
            <h3>Snooze Task: {task?.title || 'Database Migration'}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="snooze-form">
            <div className="form-group">
              <label className="form-label">Snooze until:</label>
              <input
                type="datetime-local"
                value={`${snoozeDate}T${snoozeTime}`}
                onChange={(e) => {
                  const [date, time] = e.target.value.split('T');
                  setSnoozeDate(date);
                  setSnoozeTime(time);
                }}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Optional note:</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason for snoozing (optional)"
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className={`btn-primary ${!snoozeDate ? 'disabled' : ''}`}
            onClick={handleConfirm}
            disabled={!snoozeDate}
          >
            Snooze Task
          </button>
        </div>
      </div>
    </div>
  );
}

// Mark as Risk Modal
export function MarkRiskModal({ isOpen, onClose, onConfirm, task }) {
  const [riskNote, setRiskNote] = useState('');

  const handleConfirm = () => {
    onConfirm(riskNote);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header risk-header">
          <div className="modal-title-section">
            <AlertTriangle size={24} />
            <h3>Mark Task as At Risk: {task?.title || 'Database Migration'}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          <div className="risk-form">
            <div className="form-group">
              <label className="form-label">Risk Note:</label>
              <textarea
                value={riskNote}
                onChange={(e) => setRiskNote(e.target.value)}
                placeholder="Describe the risks associated with this task"
                className="form-textarea"
                rows="4"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button 
            className="btn-warning"
            onClick={handleConfirm}
          >
            Mark as At Risk
          </button>
        </div>
      </div>
    </div>
  );
}

// Mark Done Modal
export function MarkDoneModal({ isOpen, onClose, onConfirm, task }) {
  const [hasIncompleteSubtasks] = useState(true); // This would come from actual data
  const incompleteSubtasks = [
    { id: 1, title: 'Set up PostgreSQL instance', status: 'In Progress' },
    { id: 2, title: 'Create migration scripts', status: 'To Do' },
    { id: 3, title: 'Test data integrity', status: 'To Do' }
  ];

  const completedSubtasks = [
    { id: 4, title: 'Backup existing database', status: 'Completed' },
    { id: 5, title: 'Design new schema', status: 'Completed' }
  ];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header done-header">
          <div className="modal-title-section">
            <CheckCircle size={24} />
            <h3>Mark this task complete</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-content">
          {hasIncompleteSubtasks ? (
            <div className="incomplete-subtasks">
              <div className="warning-section">
                <AlertTriangle size={20} className="warning-icon" />
                <p>This task has {incompleteSubtasks.length} incomplete subtask(s):</p>
              </div>
              
              <div className="subtasks-list">
                {incompleteSubtasks.map(subtask => (
                  <div key={subtask.id} className="subtask-item incomplete">
                    <span className="subtask-status">{subtask.status}</span>
                    <span className="subtask-title">{subtask.title}</span>
                  </div>
                ))}
              </div>
              
              <p className="completion-note">
                Please complete all subtasks before marking the main task as done, 
                or confirm that you want to mark it complete anyway.
              </p>
            </div>
          ) : (
            <div className="all-subtasks-complete">
              <div className="success-section">
                <CheckCircle size={20} className="success-icon" />
                <p>All subtasks have been completed:</p>
              </div>
              
              <div className="subtasks-list">
                {completedSubtasks.map(subtask => (
                  <div key={subtask.id} className="subtask-item completed">
                    <CheckCircle size={16} className="check-icon" />
                    <span className="subtask-title">{subtask.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-success" onClick={handleConfirm}>
            Complete
          </button>
        </div>
      </div>
    </div>
  );
}