import React, { useState } from 'react';

function SubtaskModal({ isOpen, onClose, onSubmit, parentTask }) {
  const [formData, setFormData] = useState({
    title: '',
    assignee: '',
    dueDate: '',
    priority: 'low',
    status: 'To Do',
    visibility: 'Private',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        title: '',
        assignee: '',
        dueDate: '',
        priority: 'low',
        status: 'To Do',
        visibility: 'Private',
        description: ''
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      assignee: '',
      dueDate: '',
      priority: 'low',
      status: 'To Do',
      visibility: 'Private',
      description: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content subtask-modal">
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="modal-icon">📝</div>
            <div>
              <h3>Sub-task Details</h3>
              <p>+ Parent: #{parentTask?.id || 'Unknown'}</p>
            </div>
          </div>
          <div className="modal-actions">
            <button className="modal-action-btn" onClick={handleCancel}>✖ Cancel</button>
            <button className="modal-action-btn" onClick={onClose}>✖</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="subtask-form">
          <div className="form-row">
            <div className="form-group">
              <label>📝 Task Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Sub-task title (required)"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>🎯 Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="form-group half">
              <label>⚡ Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>👤 Assignee</label>
              <select
                value={formData.assignee}
                onChange={(e) => setFormData({...formData, assignee: e.target.value})}
              >
                <option value="">Self</option>
                <option value="John Smith">John Smith</option>
                <option value="Sarah Wilson">Sarah Wilson</option>
                <option value="Mike Johnson">Mike Johnson</option>
                <option value="Emily Davis">Emily Davis</option>
              </select>
            </div>
            <div className="form-group half">
              <label>📅 Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>🔒 Visibility</label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({...formData, visibility: e.target.value})}
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>📝 Description</label>
              <div className="description-toolbar">
                <button type="button" className="toolbar-btn">B</button>
                <button type="button" className="toolbar-btn">I</button>
                <button type="button" className="toolbar-btn">U</button>
                <button type="button" className="toolbar-btn">📎</button>
                <button type="button" className="toolbar-btn">📊</button>
                <button type="button" className="toolbar-btn">📋</button>
                <button type="button" className="toolbar-btn">📑</button>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Add notes or description... (supports rich text)"
                rows="3"
              />
              <div className="form-hint">
                Use Tab to navigate fields, Enter to submit form
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>📎 Attachments (Optional)</label>
              <div className="attachment-area">
                <p>Drag & drop files here or <button type="button" className="browse-link">browse files</button></p>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <div className="task-info-section">
                <h4>📋 Task Information</h4>
                <div className="info-grid">
                  <div className="info-row">
                    <label>Inheritance Rules</label>
                    <div className="inheritance-info">
                      <p>Visibility: Inherits "Private" (can override)</p>
                      <p>Priority Impact: Changes due date automatically</p>
                      <p>Suggested Due: 2024-01-25</p>
                      <p>Max Length: Title 60 chars</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="btn secondary">
              Cancel
            </button>
            <button type="submit" className="btn primary">
              💾 Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SubtaskModal;