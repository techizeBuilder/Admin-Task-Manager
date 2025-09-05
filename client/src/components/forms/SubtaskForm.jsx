import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, AlertCircle, Paperclip, Plus, Upload, FileText } from 'lucide-react';
import { SearchableSelect } from '../ui/SearchableSelect';
import '../ui/SearchableSelectStyles.css';
import AttachmentUploader from '../common/AttachmentUploader';

function SubtaskForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  parentTask, 
  editData = null,
  mode = 'create' // 'create' or 'edit'
}) {
  const [formData, setFormData] = useState({
    title: 'New Sub-task',
    assignee: '',
    dueDate: parentTask?.dueDate || '',
    priority: 'Low Priority',
    status: 'To Do',
    visibility: parentTask?.visibility || 'Internal',
    description: '',
    attachments: []
  });

  // Populate form when editing or reset with parent data
  useEffect(() => {
    if (editData && mode === 'edit') {
      setFormData({
        title: editData.title || '',
        assignee: editData.assignee || '',
        dueDate: editData.dueDate || '',
        priority: editData.priority || 'Low Priority',
        status: editData.status || 'To Do',
        visibility: editData.visibility || 'Internal',
        description: editData.description || '',
        attachments: editData.attachments || []
      });
    } else if (mode === 'create') {
      setFormData({
        title: 'New Sub-task',
        assignee: '',
        dueDate: parentTask?.dueDate || '',
        priority: 'Low Priority',
        status: 'To Do',
        visibility: parentTask?.visibility || 'Internal',
        description: '',
        attachments: []
      });
    }
  }, [editData, mode, parentTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }
    
    onSubmit(formData);
    handleCancel();
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) {
      errors.push('Sub-task name is required');
    }
    
    if (formData.title.length > 60) {
      errors.push('Sub-task name cannot exceed 60 characters');
    }
    
    if (!formData.assignee) {
      errors.push('Assignee is required');
    }
    
    if (!formData.dueDate) {
      errors.push('Due date is required');
    }
    
    if (parentTask?.dueDate && formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const parentDueDate = new Date(parentTask.dueDate);
      if (selectedDate > parentDueDate) {
        errors.push('Due date cannot exceed parent task due date');
      }
    }
    
    return errors;
  };

  const handleCancel = () => {
    setFormData({
      title: 'New Sub-task',
      assignee: '',
      dueDate: parentTask?.dueDate || '',
      priority: 'Low Priority',
      status: 'To Do',
      visibility: parentTask?.visibility || 'Internal',
      description: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay">
      <div className="drawer-container">
        <div className="drawer-content">
          {/* Header */}
          <div className="drawer-header">
            <div className="drawer-title-section">
              <div className="modal-icon">
                <Plus size={20} />
              </div>
              <div>
                <h3>{mode === 'edit' ? 'Edit Sub-task' : 'Add Sub-task'}</h3>
                <p>+ Parent: #{parentTask?.id || 'Unknown'}</p>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="drawer-form">
            <div className="form-card">
              <form onSubmit={handleSubmit}>
            {/* Task Title */}
            <div className="form-group">
              <label className="form-label">
                <Tag size={16} />
                Task Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Sub-task title (required)"
                className="form-input"
                required
                autoFocus
              />
            </div>

            {/* Row 1: Assignee & Priority */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Assignee
                </label>
                <SearchableSelect
                  options={[
                    { value: '', name: 'Self', email: 'self@current.user' },
                    { value: 'john-smith', name: 'John Smith', email: 'john@company.com' },
                    { value: 'sarah-wilson', name: 'Sarah Wilson', email: 'sarah@company.com' },
                    { value: 'mike-johnson', name: 'Mike Johnson', email: 'mike@company.com' },
                    { value: 'emily-davis', name: 'Emily Davis', email: 'emily@company.com' }
                  ]}
                  value={formData.assignee}
                  onChange={(value) => setFormData({...formData, assignee: value})}
                  placeholder="Select assignee..."
                  searchPlaceholder="Search team members..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <AlertCircle size={16} />
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="form-select"
                >
                  <option value="Low Priority">Low Priority</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Row 2: Due Date & Status */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} />
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="form-select"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Visibility */}
            <div className="form-group">
              <label className="form-label">Visibility</label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                className="form-select"
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <div className="description-toolbar">
                <button type="button" className="toolbar-btn">B</button>
                <button type="button" className="toolbar-btn">I</button>
                <button type="button" className="toolbar-btn">U</button>
                <button type="button" className="toolbar-btn">
                  <Paperclip size={12} />
                </button>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Add notes or description... (supports rich text)"
                className="form-textarea"
                rows="4"
              />
              <div className="form-hint">
                Use Tab to navigate fields, Enter to submit form
              </div>
            </div>

            {/* Attachments */}
            <div className="form-group">
              <label className="form-label">
                <Paperclip size={16} />
                Attachments (Optional)
              </label>
              <AttachmentUploader
                files={formData.attachments}
                onFilesChange={(files) => setFormData({...formData, attachments: files})}
                multiple={true}
                maxSize={10 * 1024 * 1024}
                maxFiles={5}
                acceptedTypes=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
                dragDropText="Drag & drop files here or click to browse"
                compact={false}
              />
            </div>

            {/* Inheritance Rules Info */}
            <div className="info-section">
              <h4>
                <AlertCircle size={16} />
                Inheritance Rules
              </h4>
              <div className="inheritance-info">
                <p>Visibility: Inherits "Private" (can override)</p>
                <p>Priority Impact: Changes due date automatically</p>
                <p>Suggested Due: 2024-01-25</p>
                <p>Max Length: Title 60 chars</p>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {mode === 'edit' ? 'Update Sub-task' : 'Create Sub-task'}
              </button>
            </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubtaskForm;