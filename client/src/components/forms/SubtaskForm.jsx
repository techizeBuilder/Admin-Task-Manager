import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, AlertCircle, Paperclip, Plus, Upload, FileText } from 'lucide-react';
import { SearchableSelect } from '../ui/SearchableSelect';
import '../ui/SearchableSelectStyles.css';
import RichTextEditor from '../common/RichTextEditor';
import SimpleFileUploader from '../common/SimpleFileUploader';

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
  const [errors, setErrors] = useState({}); 
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
    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    onSubmit(formData);
    handleCancel();
  };  

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Sub-task name is required';
    } else if (formData.title.length > 60) {
      newErrors.title = 'Sub-task name cannot exceed 60 characters';
    }

    if (!formData.assignee) {
      newErrors.assignee = 'Assignee is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (parentTask?.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const parentDueDate = new Date(parentTask.dueDate);
      if (selectedDate > parentDueDate) {
        newErrors.dueDate = 'Due date cannot exceed parent task due date';
      }
    }

    return newErrors;
  };
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error dynamically when user types/selects
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
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
    setErrors({});
    onClose();
  };
  // Control body scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container max-w-2xl">
      
          {/* Header */}
          <div className="modal-header" style={{ background: '#4f46e5' }}>
            <div className="modal-title-section">
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
          <div className="modal-body">
            <div className="form-card">
              <form onSubmit={handleSubmit}>
            {/* Task Title */}
            <div className="form-group">
              <label className="form-label flex justify-between">
                <div>

                <Tag size={16} />
                Task Title
                </div><span className="text-gray-500">{formData.title.length}/60</span>
              </label>
              <input
    type="text"
    value={formData.title}
    onChange={(e) => handleChange('title', e.target.value)}
    placeholder="Sub-task title (required)"
    className={`form-input ${errors.title ? 'border-red-500 focus:border-red-500' : ''}`}
    maxLength={60}
 
    autoFocus
  />
  {errors.title && (
    <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
      <AlertCircle size={16} />
      <span>{errors.title}</span>
    </div>
  )}
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
      onChange={(value) => handleChange('assignee', value)}
      placeholder="Select assignee..."
      searchPlaceholder="Search team members..."
      className={errors.assignee ? 'error-select' : ''}
    />
    {errors.assignee && (
      <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
        <AlertCircle size={16} />
        <span>{errors.assignee}</span>
      </div>
    )}
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
      onChange={(e) => handleChange('dueDate', e.target.value)}
      className={`form-input ${errors.dueDate ? 'border-red-500 focus:border-red-500' : ''}`}
    />
    {errors.dueDate && (
      <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
        <AlertCircle size={16} />
        <span>{errors.dueDate}</span>
      </div>
    )}
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
              <RichTextEditor
                value={formData.description}
                onChange={(content) => setFormData({...formData, description: content})}
                placeholder="Add notes or description... (supports rich text)"
                className="w-full"
                minHeight="120px"
              />
              <div className="form-hint">
                Use Tab to navigate fields, Enter to submit form
              </div>
            </div>

            {/* Attachments */}
            <div className="form-group">
              <label className="form-label">
                <Paperclip size={16} />
                Attachments (Max 5MB total)
              </label>
               <SimpleFileUploader
    files={formData.attachments}
    onFilesChange={(files) => setFormData({...formData, attachments: files})}
    maxSize={5 * 1024 * 1024}
  
    className="w-full"
    error={errors.attachments}
  />
            </div>


            {/* Actions */}
           <div className="form-actions flex justify-between">
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
  );
}

export default SubtaskForm;