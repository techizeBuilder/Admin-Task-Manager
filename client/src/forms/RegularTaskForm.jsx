import { useState, useEffect, useCallback, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { MultiSelect } from "../components/ui/MultiSelect";

// Error Boundary Component for better debugging
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (error) => {
      console.error("RegularTaskForm Error:", error);
      setHasError(true);
      setError(error);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Something went wrong</h3>
          <p className="text-red-600 text-sm mt-1">
            {error?.message || "An unexpected error occurred in the form"}
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
            }}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )
    );
  }

  return children;
};

export function RegularTaskForm({ onSubmit, onClose, initialData = {} }) {
  // State with error handling and validation
  const [formData, setFormData] = useState(() => {
    try {
      return {
        title: "",
        description: "",
        assignee: "self",
        priority: "low",
        dueDate: "",
        visibility: "private",
        tags: "",
        currentTagInput: "",
        isRecurring: false,
        attachments: [],
        ...initialData,
      };
    } catch (error) {
      console.error("Error initializing form data:", error);
      return {
        title: "",
        description: "",
        assignee: "self",
        priority: "low",
        dueDate: "",
        visibility: "private",
        tags: "",
        currentTagInput: "",
        isRecurring: false,
        attachments: [],
      };
    }
  });

  const [moreOptionsData, setMoreOptionsData] = useState({
    referenceProcess: "",
    customForm: "",
    dependencies: [],
    taskTypeAdvanced: "simple",
  });

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isManualDueDate, setIsManualDueDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Use external validation function
  const validateFormData = useCallback(
    () => validateForm(formData),
    [formData],
  );

  // Calculate due date based on priority
  const calculateDueDateFromPriority = (priority) => {
    const today = new Date();
    const days = {
      low: 7,
      medium: 3,
      high: 1,
      critical: 0,
    };

    const daysToAdd = days[priority] || 7;
    const dueDate = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return dueDate.toISOString().split("T")[0];
  };

  // Auto-set due date when priority changes
  useEffect(() => {
    if (!isManualDueDate && formData.priority) {
      const calculatedDueDate = calculateDueDateFromPriority(formData.priority);
      setFormData((prev) => ({
        ...prev,
        dueDate: calculatedDueDate,
      }));
    }
  }, [formData.priority, isManualDueDate]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Mark due date as manual if user changes it
    if (field === "dueDate") {
      setIsManualDueDate(true);
    }
  };

  const handleMoreOptionsChange = (field, value) => {
    setMoreOptionsData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        setIsSubmitting(true);
        setValidationErrors({});

        // Validate form
        const errors = validateFormData();
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          console.warn("Form validation errors:", errors);
          return;
        }

        const taskData = {
          ...formData,
          ...moreOptionsData,
          type: "regular",
          moreOptionsData,
        };

        console.log("Submitting task data:", taskData);
        await onSubmit(taskData);
      } catch (error) {
        console.error("Error submitting form:", error);
        setValidationErrors({
          submit: error.message || "Failed to create task. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, moreOptionsData, onSubmit, validateFormData],
  );

  return (
    <ErrorBoundary>
      {/* Validation Error Display */}
      {validationErrors.submit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{validationErrors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card">
          <div className="card-header">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Task Details
            </h3>
            <p className="text-gray-600 text-xs">
              Fill in the basic information for your task
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Task Name */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>Task Name *</span>
                    {formData.isRecurring && (
                      <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        🔁 Recurring
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formData.title.length}/20
                  </span>
                </div>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  if (e.target.value.length <= 20) {
                    handleInputChange("title", e.target.value);
                  }
                }}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                  validationErrors.title
                    ? "border-red-300 focus:ring-red-500"
                    : formData.title.length >= 18
                      ? "border-orange-500 focus:ring-orange-500"
                      : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Short, clear title..."
                maxLength="20"
                required
                data-testid="input-task-title"
              />
              {validationErrors.title && (
                <p
                  className="text-red-600 text-xs mt-1"
                  data-testid="error-task-title"
                >
                  {validationErrors.title}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Guideline: Short, clear title
              </p>
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description
              </label>
              <ReactQuill
                className="custom-editor"
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                theme="snow"
                style={{ fontSize: "14px" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            {/* Assigned To */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Assigned To *
              </label>
              <SearchableSelect
                options={[
                  { value: "self", label: "Self" },
                  { value: "john", label: "John Doe" },
                  { value: "jane", label: "Jane Smith" },
                  { value: "mike", label: "Mike Johnson" },
                  { value: "sarah", label: "Sarah Wilson" },
                ]}
                value={formData.assignee}
                onChange={(option) => handleInputChange("assignee", option.value)}
                placeholder="Select assignee..."
                className={validationErrors.assignee ? "border-red-300" : ""}
                dataTestId="searchable-select-assignee"
              />
              {validationErrors.assignee && (
                <p className="text-red-600 text-xs mt-1" data-testid="error-assignee">
                  {validationErrors.assignee}
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Due Date *
                {!isManualDueDate && (
                  <span className="text-xs text-blue-600 ml-1">
                    (Auto-filled)
                  </span>
                )}
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              {isManualDueDate && (
                <div className="flex items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Manual override active.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsManualDueDate(false);
                      const calculatedDueDate = calculateDueDateFromPriority(
                        formData.priority,
                      );
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: calculatedDueDate,
                      }));
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 ml-2 underline"
                  >
                    Reset to auto-calculate
                  </button>
                </div>
              )}
            </div>

            {/* Visibility */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Visibility *
              </label>
              <select
                value={formData.visibility || "private"}
                onChange={(e) =>
                  handleInputChange("visibility", e.target.value)
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="private">🔒 Private</option>
                <option value="public">🌐 Public</option>
              </select>
            </div>

            {/* Labels / Tags */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Labels / Tags
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 min-h-[32px] p-2 border border-gray-300 rounded-lg bg-white">
                  {formData.tags
                    .split(",")
                    .filter((tag) => tag.trim())
                    .map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag.trim()}
                        <button
                          type="button"
                          onClick={() => {
                            const tagsList = formData.tags
                              .split(",")
                              .filter((t) => t.trim());
                            tagsList.splice(index, 1);
                            handleInputChange("tags", tagsList.join(","));
                          }}
                          className="text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  <input
                    type="text"
                    value={formData.currentTagInput}
                    onChange={(e) =>
                      handleInputChange("currentTagInput", e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const newTag = formData.currentTagInput.trim();
                        if (
                          newTag &&
                          !formData.tags.split(",").includes(newTag)
                        ) {
                          const currentTags = formData.tags
                            ? formData.tags + "," + newTag
                            : newTag;
                          handleInputChange("tags", currentTags);
                          handleInputChange("currentTagInput", "");
                        }
                      }
                    }}
                    placeholder={
                      formData.tags &&
                      formData.tags.split(",").filter((tag) => tag.trim())
                        .length > 0
                        ? "Add another tag..."
                        : "Type tag and press Enter..."
                    }
                    className="flex-1 min-w-[120px] outline-none border-none bg-transparent text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-gray-500">Quick tags:</span>
                  {["urgent", "bug", "feature", "documentation", "review"].map(
                    (quickTag) => (
                      <button
                        key={quickTag}
                        type="button"
                        onClick={() => {
                          if (!formData.tags.split(",").includes(quickTag)) {
                            const currentTags = formData.tags
                              ? formData.tags + "," + quickTag
                              : quickTag;
                            handleInputChange("tags", currentTags);
                          }
                        }}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                      >
                        +{quickTag}
                      </button>
                    ),
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Choose existing tags or create new ones inline. Used for
                  filtering/search.
                </p>
              </div>
            </div>

            {/* Attachments */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Attachments
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files);
                    const existingFiles = Array.from(formData.attachments || []);
                    const allFiles = [...existingFiles, ...newFiles];
                    
                    const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
                    const maxSize = 5 * 1024 * 1024; // 5MB
                    
                    if (totalSize > maxSize) {
                      alert('Total file size cannot exceed 5MB');
                      e.target.value = '';
                      return;
                    }
                    
                    handleInputChange("attachments", allFiles);
                    e.target.value = ''; // Clear the input to allow re-selecting same files
                  }}
                  className="hidden"
                  id="attachments-input"
                  data-testid="input-attachments"
                />
                <label 
                  htmlFor="attachments-input" 
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <svg 
                    className="w-8 h-8 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 4v16m8-8H4" 
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    Click to upload files or drag and drop
                  </span>
                  <span className="text-xs text-gray-500">
                    Max total size: 5 MB. Support docs, images, PDFs
                  </span>
                </label>
              </div>
              
              {/* Show selected files */}
              {formData.attachments && formData.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {Array.from(formData.attachments).map((file, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded text-xs"
                    >
                      <span className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 2h8a1 1 0 110 2H6a1 1 0 110-2z"/>
                        </svg>
                        <span>{file.name}</span>
                        <span className="text-gray-400">
                          ({(file.size / 1024).toFixed(1)}KB)
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = Array.from(formData.attachments).filter((_, i) => i !== index);
                          handleInputChange("attachments", newFiles);
                        }}
                        className="text-red-500 hover:text-red-700"
                        data-testid={`remove-attachment-${index}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="text-xs text-gray-500">
                    Total size: {formData.attachments ? 
                      (Array.from(formData.attachments).reduce((sum, file) => sum + file.size, 0) / 1024).toFixed(1) 
                      : 0}KB / 5MB
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* More Options Toggle */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Advanced Fields
              </h3>
              <p className="text-xs text-gray-600">
                Configure additional task settings (optional)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 rounded-lg transition-colors"
            >
              <span>{showMoreOptions ? "Hide" : "Show"} More Option</span>
              <svg
                className={`w-4 h-4 transition-transform ${showMoreOptions ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {showMoreOptions && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
              {/* Reference Process */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reference Process
                </label>
                <select
                  value={moreOptionsData.referenceProcess || ""}
                  onChange={(e) =>
                    handleMoreOptionsChange("referenceProcess", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a process...</option>
                  <option value="sop001">Customer Onboarding SOP</option>
                  <option value="sop002">Bug Report Workflow</option>
                  <option value="sop003">Feature Request Process</option>
                  <option value="sop004">Quality Assurance Checklist</option>
                  <option value="sop005">Deployment Process</option>
                </select>
              </div>

              {/* Custom Form */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Custom Form
                </label>
                <select
                  value={moreOptionsData.customForm || ""}
                  onChange={(e) =>
                    handleMoreOptionsChange("customForm", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a form...</option>
                  <option value="form001">Bug Report Form</option>
                  <option value="form002">Feature Request Form</option>
                  <option value="form003">Customer Feedback Form</option>
                  <option value="form004">Project Evaluation Form</option>
                  <option value="form005">Performance Review Form</option>
                </select>
              </div>

              {/* Dependencies */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dependencies (Multiple Select)
                </label>
                <MultiSelect
                  options={[
                    {
                      value: "task001",
                      label: "Setup Development Environment",
                    },
                    { value: "task002", label: "Design Database Schema" },
                    { value: "task003", label: "Create API Endpoints" },
                    { value: "task004", label: "Write Unit Tests" },
                    { value: "task005", label: "User Interface Design" },
                  ]}
                  value={Array.isArray(moreOptionsData.dependencies) ? moreOptionsData.dependencies : []}
                  onChange={(selectedValues) => handleMoreOptionsChange("dependencies", selectedValues)}
                  placeholder="Select task dependencies..."
                  dataTestId="multi-select-dependencies"
                />
              </div>

              {/* Task Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Task Type *
                </label>
                <select
                  value={moreOptionsData.taskTypeAdvanced || "simple"}
                  onChange={(e) =>
                    handleMoreOptionsChange("taskTypeAdvanced", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="simple">📋 Simple</option>
                  <option value="recurring">🔄 Recurring</option>
                  <option value="approval">✅ Approval</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <div>
            <button type="button" className="btn btn-secondary mr-1">
              Save as Draft
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </div>
      </form>
    </ErrorBoundary>
  );
}

// Add validation function at the end
function validateForm(formData) {
  const errors = {};

  if (!formData.title?.trim()) {
    errors.title = "Task title is required";
  }

  if (!formData.assignee) {
    errors.assignee = "Assignee is required";
  }

  if (!formData.priority) {
    errors.priority = "Priority is required";
  }

  return errors;
}
