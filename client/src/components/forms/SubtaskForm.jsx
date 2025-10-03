import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, AlertCircle, Paperclip, Plus, Upload, FileText } from 'lucide-react';
import { SearchableSelect } from '../ui/SearchableSelect';
import '../ui/SearchableSelectStyles.css';
import RichTextEditor from '../common/RichTextEditor';
import SimpleFileUploader from '../common/SimpleFileUploader';

// API function to create subtask
const createSubtask = async (parentTaskId, formData, token) => {
  console.log('🚀 createSubtask function called');
  console.log('📝 parentTaskId:', parentTaskId);
  console.log('📝 formData:', formData);
  console.log('🔑 token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

  const formDataObj = new FormData();

  // Map form fields to API parameters
  console.log('📋 Mapping form fields to API parameters...');

  formDataObj.append('title', formData.title);
  console.log('✅ Added title:', formData.title);

  formDataObj.append('description', formData.description);
  console.log('✅ Added description:', formData.description);

  const isoDate = new Date(formData.dueDate).toISOString();
  formDataObj.append('dueDate', isoDate);
  console.log('✅ Added dueDate:', formData.dueDate, '-> ISO:', isoDate);

  const mappedPriority = formData.priority.toLowerCase().replace(' priority', '').replace(' ', '-');
  formDataObj.append('priority', mappedPriority);
  console.log('✅ Added priority:', formData.priority, '-> mapped:', mappedPriority);

  // Map status values to match API expectations (Backend enum: ["todo", "in-progress", "review", "completed"])
  let mappedStatus;
  switch (formData.status) {
    case 'To Do':
      mappedStatus = 'todo'; // ✅ Valid enum value
      break;
    case 'In Progress':
      mappedStatus = 'in-progress'; // ✅ Valid enum value
      break;
    case 'In Review':
    case 'Review':
      mappedStatus = 'review'; // ✅ Valid enum value
      break;
    case 'Completed':
    case 'Done':
      mappedStatus = 'completed'; // ✅ Valid enum value
      break;
    default:
      mappedStatus = 'todo'; // ✅ Safe default - valid enum value
  }
  formDataObj.append('status', mappedStatus);
  console.log('✅ Added status:', formData.status, '-> mapped:', mappedStatus); const mappedVisibility = formData.visibility.toLowerCase();
  formDataObj.append('visibility', mappedVisibility);
  console.log('✅ Added visibility:', formData.visibility, '-> mapped:', mappedVisibility);

  // Add attachments if any
  if (formData.attachments && formData.attachments.length > 0) {
    console.log('📎 Adding attachments:', formData.attachments.length);
    formData.attachments.forEach((file, index) => {
      formDataObj.append('attachments', file);
      console.log(`✅ Added attachment ${index + 1}:`, file.name, file.size, 'bytes');
    });
  } else {
    console.log('📎 No attachments to add');
  }

  const apiUrl = `http://localhost:5000/api/tasks/${parentTaskId}/create-subtask`;
  console.log('🌐 API URL:', apiUrl);
  console.log('🔍 URL Analysis:');
  console.log('🔍 - parentTaskId in URL:', parentTaskId);
  console.log('🔍 - parentTaskId type:', typeof parentTaskId);
  console.log('🔍 - parentTaskId string length:', parentTaskId.toString().length);
  console.log('🔍 - Is ObjectId format (24 chars hex)?', /^[0-9a-fA-F]{24}$/.test(parentTaskId.toString()));
  console.log('🔍 - Is integer format?', /^\d+$/.test(parentTaskId.toString()));

  try {
    console.log('📡 Making API request...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'accept': 'application/json'
      },
      body: formDataObj
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Success Response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating subtask:', error);
    console.error('❌ Error details:', error.message);
    throw error;
  }
};

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
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🎯 handleSubmit called');
    console.log('🔍 Mode:', mode);
    console.log('📝 Current formData:', formData);

    const newErrors = validateForm();
    console.log('✅ Validation errors:', newErrors);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Form has validation errors, stopping submission');
      return;
    }

    if (mode === 'create') {
      console.log('🚀 Starting subtask creation process...');
      setIsLoading(true);
      try {
        // Get auth token from localStorage or context
        console.log('🔑 Looking for auth token...');
        const authToken = localStorage.getItem('authToken');
        const token = localStorage.getItem('token');
        console.log('🔑 authToken exists:', !!authToken);
        console.log('🔑 token exists:', !!token);

        const finalToken = authToken || token;
        console.log('🔑 Final token selected:', !!finalToken);

        if (!finalToken) {
          console.error('❌ No authentication token found');
          alert('Authentication token not found. Please login again.');
          return;
        }

        console.log('🔍 Checking parent task...');
        console.log('🔍 parentTask:', parentTask);
        console.log('🔍 parentTask type:', typeof parentTask);
        console.log('🔍 parentTask._id:', parentTask?._id);
        console.log('🔍 parentTask.id:', parentTask?.id);
        console.log('🔍 All parentTask keys:', parentTask ? Object.keys(parentTask) : 'parentTask is null/undefined');

        // Check if it's a Mongoose document with _doc property
        if (parentTask && parentTask._doc) {
          console.log('🔍 Mongoose document detected, checking _doc:', parentTask._doc);
          console.log('🔍 _doc._id:', parentTask._doc._id);
          console.log('🔍 _doc.id:', parentTask._doc.id);
        }

        // Handle both cases: parentTask as string (ID) or object with _id/id property
        let parentTaskId;
        if (typeof parentTask === 'string') {
          parentTaskId = parentTask;
          console.log('✅ parentTask is string, using directly:', parentTaskId);
        } else if (parentTask?._doc?._id) {
          // Case: Mongoose document with _doc property
          parentTaskId = parentTask._doc._id;
          console.log('✅ Using parentTask._doc._id (Mongoose):', parentTaskId);
          console.log('🔍 _doc._id type:', typeof parentTask._doc._id);
          console.log('🔍 _doc._id length:', parentTask._doc._id.toString().length);
        } else if (parentTask?._doc?.id) {
          // Case: Mongoose document with _doc.id property
          parentTaskId = parentTask._doc.id;
          console.log('✅ Using parentTask._doc.id (Mongoose):', parentTaskId);
          console.log('🔍 _doc.id type:', typeof parentTask._doc.id);
          console.log('🔍 _doc.id length:', parentTask._doc.id.toString().length);
        } else if (parentTask?._id) {
          parentTaskId = parentTask._id;
          console.log('✅ Using parentTask._id:', parentTaskId);
          console.log('🔍 _id type:', typeof parentTask._id);
          console.log('🔍 _id length:', parentTask._id.toString().length);
        } else if (parentTask?.id) {
          parentTaskId = parentTask.id;
          console.log('✅ Using parentTask.id:', parentTaskId);
          console.log('🔍 id type:', typeof parentTask.id);
          console.log('🔍 id length:', parentTask.id.toString().length);
        } else if (parentTask && typeof parentTask.toObject === 'function') {
          // Case: Mongoose document with toObject() method
          const plainObject = parentTask.toObject();
          console.log('🔍 Converted Mongoose to plain object:', plainObject);
          parentTaskId = plainObject._id || plainObject.id;
          console.log('✅ Using converted object ID:', parentTaskId);
        }

        if (!parentTaskId) {
          console.error('❌ Parent task ID not found with standard methods');
          console.error('❌ Trying manual extraction from parentTask...');

          // Last resort: try to extract from various nested properties
          if (parentTask) {
            const possibleIds = [
              parentTask._id,
              parentTask.id,
              parentTask._doc?._id,
              parentTask._doc?.id,
              parentTask.$__.fullPath,
              // Check if it's stringified in any way
              JSON.stringify(parentTask).match(/\"_id\":\"([^\"]+)\"/)?.[1],
              JSON.stringify(parentTask).match(/\"id\":\"([^\"]+)\"/)?.[1]
            ].filter(Boolean);

            console.error('❌ Possible IDs found:', possibleIds);

            if (possibleIds.length > 0) {
              parentTaskId = possibleIds[0];
              console.log('🔄 Using first found ID:', parentTaskId);
            }
          }

          if (!parentTaskId) {
            console.error('❌ Parent task ID still not found');
            console.error('❌ Full parentTask dump:', parentTask);
            console.error('❌ parentTask JSON:', JSON.stringify(parentTask, null, 2));
            alert('Parent task ID is required to create subtask. Check console for details.');
            return;
          }
        }

        console.log('✅ Final parentTaskId:', parentTaskId);
        console.log('✅ Final parentTaskId type:', typeof parentTaskId);
        console.log('✅ Final parentTaskId length:', parentTaskId.toString().length);
        console.log('✅ Is ObjectId format?', /^[0-9a-fA-F]{24}$/.test(parentTaskId.toString()));

        // CRITICAL: Check if we need to convert integer ID to ObjectId format
        if (typeof parentTaskId === 'number' || (typeof parentTaskId === 'string' && /^\d+$/.test(parentTaskId))) {
          console.log('⚠️  WARNING: parentTaskId appears to be integer format:', parentTaskId);
          console.log('⚠️  Backend expects MongoDB ObjectId format. This will likely cause a "Cast to ObjectId failed" error.');
          console.log('⚠️  You may need to use the real MongoDB _id instead of the mapped integer id.');
        }

        console.log('📡 Calling createSubtask API...');
        const result = await createSubtask(parentTaskId, formData, finalToken);
        console.log('✅ API call completed, result:', result);

        if (result.success) {
          console.log('🎉 Subtask created successfully!');
          alert('Subtask created successfully!');

          // Call onSubmit only if it's provided and is a function
          if (onSubmit && typeof onSubmit === 'function') {
            console.log('✅ Calling parent onSubmit with subtask data');
            onSubmit(result.subtask); // Pass the created subtask data back
          } else {
            console.log('ℹ️ No onSubmit function provided, skipping callback');
          }

          // Always close the form after successful creation
          console.log('🚪 Closing form automatically');
          handleCancel();
        } else {
          console.error('❌ API returned failure:', result);
          alert('Failed to create subtask: ' + (result.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('❌ Exception caught in handleSubmit:', error);
        console.error('❌ Error stack:', error.stack);
        alert('Error creating subtask: ' + error.message);
      } finally {
        console.log('🏁 Setting loading to false');
        setIsLoading(false);
      }
    } else {
      console.log('✏️ Edit mode - using original onSubmit');
      // For edit mode, use the original onSubmit
      if (onSubmit && typeof onSubmit === 'function') {
        onSubmit(formData);
      }
      handleCancel();
    }
  };

  const validateForm = () => {
    console.log('🔍 validateForm called');
    console.log('📝 Validating formData:', formData);

    const newErrors = {};

    // Title validation - only check max length, not required
    if (formData.title && formData.title.length > 60) {
      console.log('❌ Title validation failed: too long');
      newErrors.title = 'Sub-task name cannot exceed 60 characters';
    } else {
      console.log('✅ Title validation passed');
    }

    // Assignee validation - removed (not required)
    console.log('✅ Assignee validation passed (not required)');

    // Due date validation - removed (not required)
    console.log('✅ Due date validation passed (not required)');

    console.log('📋 Final validation errors:', newErrors);
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
      description: '',
      attachments: []
    });
    setErrors({});
    setIsLoading(false);
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Sub-task title"
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
                    placeholder="Select assignee (optional)..."
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
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Visibility */}
              <div className="form-group">
                <label className="form-label">Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className="form-select"
                >
                  <option value="Private">Private</option>
                  <option value="Public">Public</option>
                  <option value="Internal">Internal</option>
                </select>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
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
                  onFilesChange={(files) => setFormData({ ...formData, attachments: files })}
                  maxSize={5 * 1024 * 1024}

                  className="w-full"
                  error={errors.attachments}
                />
              </div>


              {/* Actions */}
              <div className="form-actions flex justify-between">
                <button type="button" onClick={handleCancel} className="btn-secondary" disabled={isLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Creating...' : (mode === 'edit' ? 'Update Sub-task' : 'Create Sub-task')}
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