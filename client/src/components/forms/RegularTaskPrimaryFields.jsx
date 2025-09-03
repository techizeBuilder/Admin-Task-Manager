import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Select from 'react-select';

const RegularTaskPrimaryFields = ({ 
  onSubmit, 
  onCancel, 
  onMoreOptions,
  isOrgUser = false,
  defaultValues = {}
}) => {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      taskName: '',
      description: '',
      assignedTo: isOrgUser ? null : { value: 'self', label: 'Self' },
      priority: { value: 'Low', label: 'Low' },
      dueDate: '',
      visibility: 'private',
      tags: [],
      attachments: [],
      ...defaultValues
    }
  });

  const [taskNameLength, setTaskNameLength] = useState(0);
  const [attachmentSize, setAttachmentSize] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const watchedTaskName = watch('taskName');
  const watchedPriority = watch('priority');

  // Character counter for task name
  useEffect(() => {
    setTaskNameLength(watchedTaskName?.length || 0);
  }, [watchedTaskName]);

  // Auto-set due date based on priority
  useEffect(() => {
    if (watchedPriority?.value) {
      const today = new Date();
      let daysToAdd = 7; // Default for Low priority
      
      switch (watchedPriority.value) {
        case 'Critical':
          daysToAdd = 1;
          break;
        case 'High':
          daysToAdd = 3;
          break;
        case 'Medium':
          daysToAdd = 5;
          break;
        case 'Low':
        default:
          daysToAdd = 7;
          break;
      }
      
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + daysToAdd);
      setValue('dueDate', dueDate.toISOString().split('T')[0]);
    }
  }, [watchedPriority, setValue]);

  // Priority options
  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ];

  // Assignment options (for org users)
  const assignmentOptions = isOrgUser ? [
    { value: 'self', label: 'Self' },
    { value: 'john_doe', label: 'John Doe' },
    { value: 'jane_smith', label: 'Jane Smith' },
    // Add more team members from API
  ] : [{ value: 'self', label: 'Self' }];

  // File upload handler
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const currentSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    
    if (currentSize + totalSize > 5 * 1024 * 1024) { // 5MB limit
      alert('Total file size cannot exceed 5MB');
      return;
    }

    const newFiles = files.map(file => ({
      file,
      name: file.name,
      size: file.size,
      id: Math.random().toString(36).substr(2, 9)
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setAttachmentSize(currentSize + totalSize);
  };

  // Remove file
  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      const newSize = updated.reduce((sum, file) => sum + file.file.size, 0);
      setAttachmentSize(newSize);
      return updated;
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ]
  };

  const onFormSubmit = (data) => {
    // Add uploaded files to form data
    const formData = {
      ...data,
      attachments: uploadedFiles
    };
    onSubmit(formData);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Task Name */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Task Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            {...register('taskName', { 
              required: 'Task name is required',
              maxLength: { value: 20, message: 'Task name cannot exceed 20 characters' }
            })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter task name..."
            data-testid="input-task-name"
          />
          <div className="absolute right-3 top-2 text-xs text-gray-500">
            {taskNameLength}/20
          </div>
        </div>
        {errors.taskName && (
          <p className="text-red-500 text-xs mt-1">{errors.taskName.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Description
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <ReactQuill
              theme="snow"
              value={field.value}
              onChange={field.onChange}
              modules={quillModules}
              className="custom-editor"
              placeholder="Describe your task..."
            />
          )}
        />
      </div>

      {/* Assigned To */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Assigned To <span className="text-red-500">*</span>
        </label>
        <Controller
          name="assignedTo"
          control={control}
          rules={{ required: 'Assignment is required' }}
          render={({ field }) => (
            <Select
              {...field}
              options={assignmentOptions}
              isSearchable={isOrgUser}
              isDisabled={!isOrgUser}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select assignee..."
              data-testid="select-assigned-to"
            />
          )}
        />
        {errors.assignedTo && (
          <p className="text-red-500 text-xs mt-1">{errors.assignedTo.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Priority <span className="text-red-500">*</span>
          </label>
          <Controller
            name="priority"
            control={control}
            rules={{ required: 'Priority is required' }}
            render={({ field }) => (
              <Select
                {...field}
                options={priorityOptions}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select priority..."
                data-testid="select-priority"
              />
            )}
          />
          {errors.priority && (
            <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Due Date <span className="text-red-500">*</span>
          </label>
          <input
            {...register('dueDate', { 
              required: 'Due date is required',
              validate: (value) => {
                const today = getTodayDate();
                return value >= today || 'Due date must be today or later';
              }
            })}
            type="date"
            min={getTodayDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            data-testid="input-due-date"
          />
          {errors.dueDate && (
            <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>
          )}
        </div>
      </div>

      {/* Visibility */}
      {isOrgUser && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Visibility <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                {...register('visibility')}
                type="radio"
                value="private"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                data-testid="radio-private"
              />
              <span className="ml-2 text-sm text-gray-900">Private</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('visibility')}
                type="radio"
                value="public"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                data-testid="radio-public"
              />
              <span className="ml-2 text-sm text-gray-900">Public</span>
            </label>
          </div>
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Labels / Tags
        </label>
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              isMulti
              options={[
                { value: 'urgent', label: 'Urgent' },
                { value: 'review', label: 'Review' },
                { value: 'meeting', label: 'Meeting' },
                { value: 'development', label: 'Development' }
              ]}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Add tags..."
              data-testid="select-tags"
            />
          )}
        />
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Attachments
          <span className="text-xs text-gray-500 ml-2">(Max 5MB total)</span>
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            data-testid="input-attachments"
          />
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm">Click to upload files</span>
            <span className="text-xs text-gray-500">PDF, DOC, Images supported</span>
          </label>
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  data-testid={`remove-file-${file.id}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="text-xs text-gray-500">
              Total size: {formatFileSize(attachmentSize)} / 5MB
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
          data-testid="button-cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onMoreOptions}
          className="px-6 py-2 text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors shadow-sm"
          data-testid="button-more-options"
        >
          More Options ▸
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          data-testid="button-save"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default RegularTaskPrimaryFields;