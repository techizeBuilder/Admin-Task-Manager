import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import CustomEditor from '../components/common/CustomEditor';
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { hasAccess } from "../utils/auth";

// Advanced Fields Modal Component
const AdvancedFieldsModal = ({
  isOpen,
  onClose,
  onSubmit,
  defaultValues = {},
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      referenceProcess: null,
      customForm: null,
      dependencies: [],
      taskType: { value: "Simple", label: "Simple" },
      ...defaultValues,
    },
  });

  if (!isOpen) return null;

  const processOptions = [
    { value: "onboarding", label: "Employee Onboarding SOP" },
    { value: "review", label: "Code Review Process" },
    { value: "deployment", label: "Deployment Checklist" },
  ];

  const formOptions = [
    { value: "feedback", label: "Feedback Form Template" },
    { value: "evaluation", label: "Performance Evaluation" },
    { value: "survey", label: "Customer Survey" },
  ];

  const dependencyOptions = [
    { value: "task1", label: "Setup Development Environment" },
    { value: "task2", label: "Complete Code Review" },
    { value: "task3", label: "Database Migration" },
  ];

  const taskTypeOptions = [
    { value: "Simple", label: "Simple" },
    { value: "Recurring", label: "Recurring" },
    { value: "Approval", label: "Approval" },
  ];

  console.log('onSubmit in AdvancedFieldsModal:', onSubmit);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Advanced Options
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="close-advanced-modal"
          >
            <svg
              className="w-5 h-5 text-gray-600"
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Reference Process */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Reference Process
            </label>
            <Controller
              name="referenceProcess"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={processOptions}
                  isSearchable
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Link to a predefined process..."
                  data-testid="select-reference-process"
                />
              )}
            />
          </div>

          {/* Custom Form */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Custom Form
            </label>
            <Controller
              name="customForm"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={formOptions}
                  isSearchable
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Attach existing form template..."
                  data-testid="select-custom-form"
                />
              )}
            />
          </div>

          {/* Dependencies */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Dependencies
            </label>
            <Controller
              name="dependencies"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  options={dependencyOptions}
                  isSearchable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select prerequisite tasks..."
                  data-testid="select-dependencies"
                />
              )}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tasks that must be completed before this one starts
            </p>
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Task Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="taskType"
              control={control}
              rules={{ required: "Task type is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={taskTypeOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select task type..."
                  data-testid="select-task-type"
                />
              )}
            />
            {errors.taskType && (
              <p className="text-red-500 text-xs mt-1">
                {errors.taskType.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
              data-testid="button-advanced-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              data-testid="button-advanced-save"
            >
              Apply Advanced Options
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Regular Task Form Component
const RegularTaskForm = ({
  onSubmit,
  onCancel,
  isOrgUser = false,
  defaultValues = {},
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      taskName: "",
      description: "",
      assignedTo: isOrgUser ? null : { value: "self", label: "Self" },
      priority: { value: "Low", label: "Low" },
      dueDate: "",
      visibility: "private",
      tags: [],
      attachments: [],
      ...defaultValues,
    },
  });

  const [taskNameLength, setTaskNameLength] = useState(0);
  const [attachmentSize, setAttachmentSize] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [advancedData, setAdvancedData] = useState({});
  const isIndividual = hasAccess(["individual"]);
  const watchedTaskName = watch("taskName");
  const watchedPriority = watch("priority");

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
        case "Critical":
          daysToAdd = 1;
          break;
        case "High":
          daysToAdd = 3;
          break;
        case "Medium":
          daysToAdd = 5;
          break;
        case "Low":
        default:
          daysToAdd = 7;
          break;
      }

      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + daysToAdd);
      setValue("dueDate", dueDate.toISOString().split("T")[0]);
    }
  }, [watchedPriority, setValue]);

  // Priority options
  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Critical", label: "Critical" },
  ];

  // Assignment options (for org users)
  const assignmentOptions = !isIndividual
    ? [
      { value: "self", label: "Self" },
      { value: "john_doe", label: "John Doe" },
      { value: "jane_smith", label: "Jane Smith" },
      // Add more team members from API
    ]
    : [{ value: "self", label: "Self" }];

  // File upload handler
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const currentSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);

    if (currentSize + totalSize > 5 * 1024 * 1024) {
      // 5MB limit
      alert("Total file size cannot exceed 5MB");
      return;
    }

    const newFiles = files.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      id: Math.random().toString(36).substr(2, 9),
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setAttachmentSize(currentSize + totalSize);
  };

  // Remove file
  const removeFile = (fileId) => {
    setUploadedFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      const newSize = updated.reduce((sum, file) => sum + file.file.size, 0);
      setAttachmentSize(newSize);
      return updated;
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const handleAdvancedSubmit = (data) => {
    setAdvancedData(data);
    setShowAdvancedModal(false);
  };

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      ...advancedData,
      attachments: uploadedFiles,
    };

    if (typeof onSubmit === "function") {
      onSubmit(formData);
    } else {
      alert("onSubmit is not a function! regular");
      console.error("onSubmit is not a function!", onSubmit);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Task Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Task Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              {...register("taskName", {
                required: "Task name is required",
                maxLength: {
                  value: 20,
                  message: "Task name cannot exceed 20 characters",
                },
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
            <p className="text-red-500 text-xs mt-1">
              {errors.taskName.message}
            </p>
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
              <CustomEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Describe your task..."

                className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Priority */}

          {/* Assigned To */}
          <div>
            <label className=" block text-sm font-medium text-gray-900 mb-2">
              Assigned To <span className="text-red-500">*</span>
            </label>
            <Controller
              name="assignedTo"
              control={control}
              rules={{ required: "Assignment is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  options={assignmentOptions}
                  isSearchable={isIndividual}
                  isDisabled={isIndividual}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select assignee"
                  data-testid="select-assigned-to"
                />
              )}
            />
            {
              console.log('isIndividual:', isIndividual)
            }
            {errors.assignedTo && (
              <p className="text-red-500 text-xs mt-1">
                {errors.assignedTo.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <Controller
              name="priority"
              control={control}
              rules={{ required: "Priority is required" }}
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
              <p className="text-red-500 text-xs mt-1">
                {errors.priority.message}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              {...register("dueDate", {
                required: "Due date is required",
                validate: (value) => {
                  const today = getTodayDate();
                  return value >= today || "Due date must be today or later";
                },
              })}
              type="date"
              min={getTodayDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="input-due-date"
            />
            {errors.dueDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.dueDate.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Visibility <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                {...register("visibility")}
                type="radio"
                value="private"
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                data-testid="radio-private"
                disabled={isIndividual} // locked for individual
              />
              <span className="ml-2 text-sm text-gray-900">Private</span>
            </label>

            {!isIndividual && ( // completely hide Public if individual
              <label className="flex items-center">
                <input
                  {...register("visibility")}
                  type="radio"
                  value="organization"
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  data-testid="radio-public"
                />
                <span className="ml-2 text-sm text-gray-900">Public</span>
              </label>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Labels / Tags
          </label>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <CreatableSelect
                {...field}
                isMulti
                options={[
                  { value: "urgent", label: "Urgent" },
                  { value: "review", label: "Review" },
                  { value: "meeting", label: "Meeting" },
                  { value: "development", label: "Development" },
                ]}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Type and press Enter or comma to add tags..."
                noOptionsMessage={() => "Type to create new tag"}
                formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                createOptionPosition="first"
                data-testid="select-tags"
              />
            )}
          />
          <p className="text-xs text-gray-500 mt-1">
            Type tag name and press Enter or comma to create new tags
          </p>
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
              <svg
                className="w-8 h-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-sm">Click to upload files</span>
              <span className="text-xs text-gray-500">
                PDF, DOC, Images supported
              </span>
            </label>
          </div>

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    data-testid={`remove-file-${file.id}`}
                  >
                    <svg
                      className="w-4 h-4"
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
              ))}
              <div className="text-xs text-gray-500">
                Total size: {formatFileSize(attachmentSize)} / 5MB
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={() => setShowAdvancedModal(true)}
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

      {/* Advanced Fields Modal */}
      <AdvancedFieldsModal
        isOpen={showAdvancedModal}
        onClose={() => setShowAdvancedModal(false)}
        onSubmit={handleAdvancedSubmit}
        defaultValues={advancedData}
      />
    </>
  );
};

export default RegularTaskForm;
