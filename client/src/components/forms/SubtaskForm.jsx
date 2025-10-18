import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, AlertCircle, Paperclip, Plus, Upload, FileText } from 'lucide-react';
import { SearchableSelect } from '../ui/SearchableSelect';
import '../ui/SearchableSelectStyles.css';
import RichTextEditor from '../common/RichTextEditor';
import SimpleFileUploader from '../common/SimpleFileUploader';
import { useShowToast } from '../../utils/ToastMessage';

// API function to create subtask
const createSubtask = async (parentTaskId, formData, token, showSuccessToast, showErrorToast) => {
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

  // const isoDate = new Date(formData.dueDate).toISOString();
  // formDataObj.append('dueDate', isoDate);
  const isoDate = inputDateToLocalIso(formData.dueDate);
  formDataObj.append('dueDate', isoDate);

  console.log('✅ Added dueDate:', formData.dueDate, '-> ISO:', isoDate);

  const mappedPriority = formData.priority.toLowerCase().replace(' priority', '').replace(' ', '-');
  formDataObj.append('priority', mappedPriority);
  console.log('✅ Added priority:', formData.priority, '-> mapped:', mappedPriority);

  // Map status values to match API expectations (Backend enum: ["todo", "in-progress", "review", "completed"])
  let mappedStatus;
  switch (formData.status) {
    case 'Open':
      mappedStatus = 'OPEN';
      break;
    case 'In Progress':
      mappedStatus = 'INPROGRESS';
      break;
    case 'On Hold':
    case 'Review':
      mappedStatus = 'ONHOLD';
      break;
    case 'Completed':
    case 'Done':
      mappedStatus = 'DONE';
      break;
    default:
      mappedStatus = 'OPEN';
  }
  formDataObj.append('status', mappedStatus);
  console.log('✅ Added status:', formData.status, '-> mapped:', mappedStatus);

  const mappedVisibility = formData.visibility.toLowerCase();
  formDataObj.append('visibility', mappedVisibility);
  console.log('✅ Added visibility:', formData.visibility, '-> mapped:', mappedVisibility);

  // Add tags if any
  if (formData.tags && formData.tags.length > 0) {
    console.log('🏷️ Adding tags:', formData.tags);
    formData.tags.forEach((tag) => {
      formDataObj.append('tags', tag);
    });
    console.log('✅ Added tags:', formData.tags.length, 'tags');
  } else {
    console.log('🏷️ No tags to add');
  }

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

  const apiUrl = `/api/tasks/${parentTaskId}/create-subtask`;
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
      showErrorToast(`Error creating subtask: ${errorText.message}`);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

    const data = await response.json();
    console.log('✅ API Success Response:', data);
    showSuccessToast('Subtask created successfully!');
    return data;
  } catch (error) {
    console.error('❌ Error creating subtask:', error);
    console.error('❌ Error details:', error.message);
    throw error;
  }
};

// Local YYYY-MM-DD for <input type="date">
const formatDateToInput = (date) => {
  if (!date) return '';
  const d = (date instanceof Date) ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Convert input 'YYYY-MM-DD' → ISO string at local midnight
const inputDateToLocalIso = (inputDate) => {
  if (!inputDate) return null;
  const [y, m, d] = inputDate.split('-').map(Number);
  const localMidnight = new Date(y, m - 1, d);
  return localMidnight.toISOString();
};

function SubtaskForm({
  isOpen,
  onClose,
  onSubmit,
  onUpdateSubmit, // New prop for handling updates
  parentTask,
  editData = null,
  mode = 'create', // 'create' or 'edit'
  isOrgUser = false
}) {
  // ✅ Call useShowToast at component level (not inside utility functions)
  const { showSuccessToast, showErrorToast } = useShowToast();
  
  const [formData, setFormData] = useState({
    title: 'New Sub-task',
    assignee: isOrgUser ? '' : 'Self',
    dueDate: parentTask?.dueDate ? formatDateToInput(parentTask.dueDate) : '',
    priority: 'Low Priority',
    status: 'Open',
    visibility: parentTask?.visibility || 'Internal',
    description: '',
    attachments: [],
    tags: [] // Tags inherited from parent or edited independently
  });
  const [tagInput, setTagInput] = useState('');
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
        status: editData.status || 'Open',
        visibility: editData.visibility || 'Internal',
        description: editData.description || '',
        attachments: editData.attachments || [],
        tags: editData.tags || [] // Edit mode - use subtask's own tags
      });
    } else if (mode === 'create') {
      setFormData({
        title: 'New Sub-task',
        assignee: isOrgUser ? '' : 'Self',
        dueDate: parentTask?.dueDate ? formatDateToInput(parentTask.dueDate) : '',
        priority: 'Low Priority',
        status: 'Open',
        visibility: parentTask?.visibility || 'Internal',
        description: '',
        attachments: [],
        tags: parentTask?.tags || [] // Create mode - inherit parent tags
      });
    }
  }, [editData, mode, parentTask, isOrgUser]);

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
        const result = await createSubtask(parentTaskId, formData, finalToken, showSuccessToast, showErrorToast);
        console.log('✅ API call completed, result:', result);

        if (result.success) {
          console.log('🎉 Subtask created successfully!');
          alert('Subtask created successfully!');

          // Dispatch custom event for AllTasks to refetch and update table immediately
          console.log('📡 Dispatching subtaskCreated event...');
          window.dispatchEvent(new CustomEvent('subtaskCreated', {
            detail: { parentTaskId, subtaskId: result.subtask?.id || result.subtask?._id }
          }));

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
    } else if (mode === 'edit') {
      console.log('✏️ Edit mode - dispatching update event');
      
      // Extract parent task ID
      let parentTaskId;
      if (typeof parentTask === 'string') {
        parentTaskId = parentTask;
      } else if (parentTask?._doc?._id) {
        parentTaskId = parentTask._doc._id;
      } else if (parentTask?._doc?.id) {
        parentTaskId = parentTask._doc.id;
      } else if (parentTask?._id) {
        parentTaskId = parentTask._id;
      } else if (parentTask?.id) {
        parentTaskId = parentTask.id;
      }

      // Extract subtask ID
      const subtaskId = editData?._id || editData?.id;

      if (!parentTaskId || !subtaskId) {
        console.error('❌ Missing required IDs:', { parentTaskId, subtaskId });
        alert('Missing required task IDs');
        return;
      }

      // Dispatch custom event for AllTasks to listen to
      // This ensures refetchTasks() is called for immediate table update
      console.log('📡 Dispatching subtaskUpdate event...');
      window.dispatchEvent(new CustomEvent('subtaskUpdate', {
        detail: { parentTaskId, subtaskId, formData }
      }));

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

    // Assignee validation
    if (!formData.assignee || formData.assignee.trim() === '') {
      console.log('❌ Assignee validation failed: required field');
      newErrors.assignee = 'Assignee is required';
    } else {
      console.log('✅ Assignee validation passed');
    }

    // Due date validation
    // if (formData.dueDate) {
    //   const today = new Date().toISOString().split('T')[0];
    //   const parentDueDate = parentTask?.dueDate ? new Date(parentTask.dueDate).toISOString().split('T')[0] : null;

    //   if (formData.dueDate < today) {
    //     console.log('❌ Due date validation failed: cannot be in the past');
    //     newErrors.dueDate = 'Due date cannot be in the past';
    //   } else if (parentDueDate && formData.dueDate > parentDueDate) {
    //     console.log('❌ Due date validation failed: cannot be after parent task due date');
    //     newErrors.dueDate = `Due date cannot be after parent task due date (${parentDueDate})`;
    //   } else {
    //     console.log('✅ Due date validation passed');
    //   }
    // } else {
    //   console.log('✅ Due date validation passed (not required)');
    // }

    // ✅ Due date validation (local timezone safe)
if (formData.dueDate) {
  const [y, m, d] = formData.dueDate.split('-').map(Number);
  const selected = new Date(y, m - 1, d); // local midnight of selected date
  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0);

  if (selected < todayLocal) {
    console.log('❌ Due date validation failed: cannot be in the past');
    newErrors.dueDate = 'Due date cannot be in the past';
  } else if (parentTask?.dueDate) {
    const parentDate = new Date(parentTask.dueDate);
    parentDate.setHours(0, 0, 0, 0);

    if (selected > parentDate) {
      console.log('❌ Due date validation failed: cannot be after parent task due date');
      newErrors.dueDate = `Due date cannot be after parent task due date (${formatDateToInput(parentTask.dueDate)})`;
    } else {
      console.log('✅ Due date validation passed');
    }
  } else {
    console.log('✅ Due date validation passed');
  }
} else {
  console.log('✅ Due date validation passed (not required)');
}



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
      assignee: isOrgUser ? '' : 'Self',
      dueDate: parentTask?.dueDate ? formatDateToInput(parentTask.dueDate) : '',
      priority: 'Low Priority',
      status: 'Open',
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

  // Assignment options (same logic as RegularTaskForm)
  const assignmentOptions = isOrgUser
    ? [
      { value: "self", name: "Self", email: "self@current.user" },
      // { value: "john_doe", name: "John Doe", email: "john.doe@company.com" },
      // { value: "jane_smith", name: "Jane Smith", email: "jane.smith@company.com" },
      // Add more team members from API
    ]
    : [{ value: "self", name: "Self", email: "self@current.user" }];

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
                    Assignee <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    options={assignmentOptions}
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
                    min={formatDateToInput(new Date())}
                    max={parentTask?.dueDate ? formatDateToInput(new Date(parentTask.dueDate)) : undefined}
                    // min={new Date().toISOString().split('T')[0]}
                    // max={parentTask?.dueDate ? new Date(parentTask.dueDate).toISOString().split('T')[0] : undefined}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    className={`form-input ${errors.dueDate ? 'border-red-500 focus:border-red-500' : ''}`}
                  />
                  {errors.dueDate && (
                    <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                      <AlertCircle size={16} />
                      <span>{errors.dueDate}</span>
                    </div>
                  )}
                  {!errors.dueDate && parentTask?.dueDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      Parent task due: {new Date(parentTask.dueDate).toISOString().split('T')[0]}
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
                    <option value="OPEN">Open</option>
                    <option value="INPROGRESS">In Progress</option>
                    <option value="ONHOLD">On Hold</option>
                    <option value="DONE">Completed</option>
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

              {/* Tags */}
              <div className="form-group">
                <label className="form-label">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Tags
                  {mode === 'create' && parentTask?.tags && parentTask.tags.length > 0 && (
                    <span className="text-xs text-gray-500 ml-2">(Inherited from parent)</span>
                  )}
                </label>
                <div className="space-y-2">
                  {/* Tag Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const trimmedTag = tagInput.trim();
                          if (trimmedTag && !formData.tags.includes(trimmedTag)) {
                            setFormData({ ...formData, tags: [...formData.tags, trimmedTag] });
                            setTagInput('');
                          }
                        }
                      }}
                      placeholder="Type tag and press Enter..."
                      className="form-input flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmedTag = tagInput.trim();
                        if (trimmedTag && !formData.tags.includes(trimmedTag)) {
                          setFormData({ ...formData, tags: [...formData.tags, trimmedTag] });
                          setTagInput('');
                        }
                      }}
                      className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Tags Display */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                tags: formData.tags.filter((_, i) => i !== index)
                              });
                            }}
                            className="hover:text-indigo-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Tags can be edited independently from parent task
                  </div>
                </div>
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