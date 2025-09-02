import { useState, useEffect, useCallback, useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { MultiSelect } from "../components/ui/MultiSelect";

// Error Boundary Component
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (error) => {
      console.error("UnifiedRegularTaskForm Error:", error);
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

const UnifiedRegularTaskForm = ({ onSubmit }) => {
  // Basic task form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    labels: [],
    attachments: [],
    isRecurring: false,
    dueDate: "",
    assignee: "",
    contributors: [],
    notes: ""
  });

  // Recurrence data
  const [recurrenceData, setRecurrenceData] = useState({
    patternType: "daily", // daily, weekly, monthly, yearly, custom
    repeatEvery: 1,
    weekdays: [], // for weekly
    monthlyType: "date", // date or nth-weekday
    monthlyDates: [], // specific dates for monthly
    monthlyNthWeekday: { nth: 1, weekday: "monday" }, // nth weekday for monthly
    yearlyMonth: 1,
    yearlyDay: 1,
    customDates: [], // for custom pattern
    startDate: "",
    startTime: "09:00",
    endCondition: "never", // never, occurrences, date
    endOccurrences: 10,
    endDate: ""
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Auto-set due date when not recurring
  useEffect(() => {
    if (!formData.isRecurring && !formData.dueDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        dueDate: tomorrow.toISOString().split('T')[0]
      }));
    }
  }, [formData.isRecurring, formData.dueDate]);

  // Auto-set start date for recurring tasks
  useEffect(() => {
    if (formData.isRecurring && !recurrenceData.startDate) {
      setRecurrenceData(prev => ({
        ...prev,
        startDate: today
      }));
    }
  }, [formData.isRecurring, recurrenceData.startDate, today]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [validationErrors]);

  const handleRecurrenceChange = useCallback((field, value) => {
    setRecurrenceData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleToggleRecurring = useCallback((isRecurring) => {
    setFormData(prev => ({ ...prev, isRecurring }));
    if (!isRecurring) {
      // Reset recurrence data when turning off recurring
      setRecurrenceData({
        patternType: "daily",
        repeatEvery: 1,
        weekdays: [],
        monthlyType: "date",
        monthlyDates: [],
        monthlyNthWeekday: { nth: 1, weekday: "monday" },
        yearlyMonth: 1,
        yearlyDay: 1,
        customDates: [],
        startDate: "",
        startTime: "09:00",
        endCondition: "never",
        endOccurrences: 10,
        endDate: ""
      });
    }
  }, []);

  const handleFileUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    const maxTotalSize = 5 * 1024 * 1024; // 5MB
    
    // Calculate current total size
    const currentSize = formData.attachments.reduce((total, file) => total + file.size, 0);
    const newFilesSize = files.reduce((total, file) => total + file.size, 0);
    
    if (currentSize + newFilesSize > maxTotalSize) {
      setValidationErrors(prev => ({
        ...prev,
        attachments: "Total file size cannot exceed 5MB"
      }));
      return;
    }
    
    // Append new files to existing ones
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
    
    // Clear any previous error
    setValidationErrors(prev => ({
      ...prev,
      attachments: null
    }));
  }, [formData.attachments]);

  const removeFile = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  }, []);

  const handleWeekdayToggle = useCallback((day) => {
    setRecurrenceData(prev => ({
      ...prev,
      weekdays: prev.weekdays.includes(day)
        ? prev.weekdays.filter(d => d !== day)
        : [...prev.weekdays, day]
    }));
  }, []);

  // Generate preview of next occurrences
  const generatePreviewOccurrences = useMemo(() => {
    if (!formData.isRecurring || !recurrenceData.startDate) return [];
    
    const startDate = new Date(recurrenceData.startDate + 'T' + recurrenceData.startTime);
    const occurrences = [];
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < 5; i++) {
      occurrences.push(new Date(currentDate));
      
      // Calculate next occurrence based on pattern
      switch (recurrenceData.patternType) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + recurrenceData.repeatEvery);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * recurrenceData.repeatEvery));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + recurrenceData.repeatEvery);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + recurrenceData.repeatEvery);
          break;
        default:
          // For custom, just add 7 days as placeholder
          currentDate.setDate(currentDate.getDate() + 7);
      }
    }
    
    return occurrences;
  }, [formData.isRecurring, recurrenceData]);

  // Generate human-readable summary
  const generateSummary = useMemo(() => {
    if (!formData.isRecurring) return "";
    
    const patterns = {
      daily: `Every ${recurrenceData.repeatEvery === 1 ? 'day' : `${recurrenceData.repeatEvery} days`}`,
      weekly: `Every ${recurrenceData.repeatEvery === 1 ? 'week' : `${recurrenceData.repeatEvery} weeks`}`,
      monthly: `Every ${recurrenceData.repeatEvery === 1 ? 'month' : `${recurrenceData.repeatEvery} months`}`,
      yearly: `Every ${recurrenceData.repeatEvery === 1 ? 'year' : `${recurrenceData.repeatEvery} years`}`,
      custom: 'Custom schedule'
    };
    
    let summary = patterns[recurrenceData.patternType] || '';
    
    if (recurrenceData.startDate) {
      summary += ` starting ${new Date(recurrenceData.startDate).toLocaleDateString()}`;
    }
    
    if (recurrenceData.startTime) {
      summary += ` at ${recurrenceData.startTime}`;
    }
    
    switch (recurrenceData.endCondition) {
      case 'occurrences':
        summary += `, ends after ${recurrenceData.endOccurrences} times`;
        break;
      case 'date':
        if (recurrenceData.endDate) {
          summary += `, ends ${new Date(recurrenceData.endDate).toLocaleDateString()}`;
        }
        break;
      default:
        summary += ', no end date';
    }
    
    return summary;
  }, [formData.isRecurring, recurrenceData]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    // Basic validation
    if (!formData.title.trim()) {
      errors.title = "Task title is required";
    }
    
    if (!formData.assignee) {
      errors.assignee = "Please assign this task to someone";
    }
    
    // Regular task validation
    if (!formData.isRecurring) {
      if (!formData.dueDate) {
        errors.dueDate = "Due date is required";
      } else if (formData.dueDate < today) {
        errors.dueDate = "Due date cannot be in the past";
      }
    }
    
    // Recurring task validation
    if (formData.isRecurring) {
      if (!recurrenceData.patternType) {
        errors.patternType = "Pattern type is required";
      }
      
      if (!recurrenceData.startDate) {
        errors.startDate = "Start date is required";
      } else if (recurrenceData.startDate < today) {
        errors.startDate = "Start date cannot be in the past";
      }
      
      if (recurrenceData.patternType === 'weekly' && recurrenceData.weekdays.length === 0) {
        errors.weekdays = "Please select at least one weekday";
      }
      
      if (recurrenceData.endCondition === 'date' && recurrenceData.endDate) {
        if (recurrenceData.endDate <= recurrenceData.startDate) {
          errors.endDate = "End date must be after start date";
        }
      }
      
      if (recurrenceData.endCondition === 'occurrences' && recurrenceData.endOccurrences < 1) {
        errors.endOccurrences = "Number of occurrences must be at least 1";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, recurrenceData, today]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setValidationErrors(prev => ({
        ...prev,
        submit: "Please fix the errors above before submitting"
      }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const taskData = {
        ...formData,
        ...(formData.isRecurring ? { recurrence: recurrenceData } : {})
      };
      
      await onSubmit(taskData);
    } catch (error) {
      console.error("Error submitting task:", error);
      setValidationErrors(prev => ({
        ...prev,
        submit: "Failed to create task. Please try again."
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, recurrenceData, validateForm, onSubmit]);

  return (
    <ErrorBoundary>
      {/* Validation Error Display */}
      {validationErrors.submit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{validationErrors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Task Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Task Information
              {formData.isRecurring && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                  🔁 Recurring
                </span>
              )}
            </h3>
            <p className="text-gray-600 text-sm">
              Fill in the basic information for your task
            </p>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Title *
                <span className="text-xs text-gray-500 ml-2">
                  ({formData.title.length}/100)
                </span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  if (e.target.value.length <= 100) {
                    handleInputChange("title", e.target.value);
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.title
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter a clear, descriptive title..."
                maxLength="100"
                required
                data-testid="input-task-title"
              />
              {validationErrors.title && (
                <p className="text-red-600 text-sm mt-1" data-testid="error-task-title">
                  {validationErrors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <ReactQuill
                value={formData.description}
                onChange={(value) => handleInputChange("description", value)}
                theme="snow"
                style={{ fontSize: "14px" }}
                data-testid="editor-description"
              />
            </div>

            {/* Labels/Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Labels/Tags
              </label>
              <MultiSelect
                options={[
                  { value: "urgent", label: "Urgent" },
                  { value: "research", label: "Research" },
                  { value: "development", label: "Development" },
                  { value: "design", label: "Design" },
                  { value: "testing", label: "Testing" },
                  { value: "documentation", label: "Documentation" },
                  { value: "meeting", label: "Meeting" },
                  { value: "review", label: "Review" }
                ]}
                value={formData.labels}
                onChange={(selectedValues) => handleInputChange("labels", selectedValues)}
                placeholder="Select or search labels..."
                dataTestId="multi-select-labels"
              />
            </div>

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
                <span className="text-xs text-gray-500 ml-2">
                  (Max 5MB total, docs/images/PDFs)
                </span>
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="input-attachments"
              />
              {validationErrors.attachments && (
                <p className="text-red-600 text-sm mt-1" data-testid="error-attachments">
                  {validationErrors.attachments}
                </p>
              )}
              
              {/* Display uploaded files */}
              {formData.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {formData.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        data-testid={`button-remove-file-${index}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500">
                    Total size: {(formData.attachments.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recurring Toggle */}
        <div className="card">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="recurring-toggle"
              checked={formData.isRecurring}
              onChange={(e) => handleToggleRecurring(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              data-testid="toggle-recurring"
            />
            <label htmlFor="recurring-toggle" className="text-sm font-medium text-gray-700">
              Make this a Recurring Task
            </label>
          </div>
        </div>

        {/* Due Date (Non-recurring) or Recurrence Panel */}
        {!formData.isRecurring ? (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                min={today}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.dueDate
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                required
                data-testid="input-due-date"
              />
              {validationErrors.dueDate && (
                <p className="text-red-600 text-sm mt-1" data-testid="error-due-date">
                  {validationErrors.dueDate}
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Recurrence Panel */
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                Recurrence Settings
              </h3>
              <p className="text-sm text-gray-600">
                Configure when and how often this task repeats
              </p>
            </div>

            <div className="space-y-6">
              {/* Pattern Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pattern Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                    { value: "yearly", label: "Yearly" },
                    { value: "custom", label: "Custom" }
                  ].map((pattern) => (
                    <button
                      key={pattern.value}
                      type="button"
                      onClick={() => handleRecurrenceChange("patternType", pattern.value)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        recurrenceData.patternType === pattern.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                      data-testid={`button-pattern-${pattern.value}`}
                    >
                      {pattern.label}
                    </button>
                  ))}
                </div>
                {validationErrors.patternType && (
                  <p className="text-red-600 text-sm mt-1" data-testid="error-pattern-type">
                    {validationErrors.patternType}
                  </p>
                )}
              </div>

              {/* Repeat Every */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repeat Every
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={recurrenceData.repeatEvery}
                      onChange={(e) => handleRecurrenceChange("repeatEvery", parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="input-repeat-every"
                    />
                    <span className="text-sm text-gray-600">
                      {recurrenceData.patternType === 'daily' && 'day(s)'}
                      {recurrenceData.patternType === 'weekly' && 'week(s)'}
                      {recurrenceData.patternType === 'monthly' && 'month(s)'}
                      {recurrenceData.patternType === 'yearly' && 'year(s)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly Pattern */}
              {recurrenceData.patternType === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repeat on Days *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleWeekdayToggle(day)}
                        className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                          recurrenceData.weekdays.includes(day)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                        data-testid={`button-weekday-${day.toLowerCase()}`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  {validationErrors.weekdays && (
                    <p className="text-red-600 text-sm mt-1" data-testid="error-weekdays">
                      {validationErrors.weekdays}
                    </p>
                  )}
                </div>
              )}

              {/* Start Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={recurrenceData.startDate}
                    onChange={(e) => handleRecurrenceChange("startDate", e.target.value)}
                    min={today}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      validationErrors.startDate
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    required
                    data-testid="input-start-date"
                  />
                  {validationErrors.startDate && (
                    <p className="text-red-600 text-sm mt-1" data-testid="error-start-date">
                      {validationErrors.startDate}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={recurrenceData.startTime}
                    onChange={(e) => handleRecurrenceChange("startTime", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="input-start-time"
                  />
                </div>
              </div>

              {/* End Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  End Condition
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="end-never"
                      name="endCondition"
                      value="never"
                      checked={recurrenceData.endCondition === "never"}
                      onChange={(e) => handleRecurrenceChange("endCondition", e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      data-testid="radio-end-never"
                    />
                    <label htmlFor="end-never" className="text-sm text-gray-700">
                      Never
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="end-occurrences"
                      name="endCondition"
                      value="occurrences"
                      checked={recurrenceData.endCondition === "occurrences"}
                      onChange={(e) => handleRecurrenceChange("endCondition", e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      data-testid="radio-end-occurrences"
                    />
                    <label htmlFor="end-occurrences" className="text-sm text-gray-700">
                      After
                    </label>
                    {recurrenceData.endCondition === "occurrences" && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          value={recurrenceData.endOccurrences}
                          onChange={(e) => handleRecurrenceChange("endOccurrences", parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          data-testid="input-end-occurrences"
                        />
                        <span className="text-sm text-gray-600">occurrences</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="end-date"
                      name="endCondition"
                      value="date"
                      checked={recurrenceData.endCondition === "date"}
                      onChange={(e) => handleRecurrenceChange("endCondition", e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      data-testid="radio-end-date"
                    />
                    <label htmlFor="end-date" className="text-sm text-gray-700">
                      By date
                    </label>
                    {recurrenceData.endCondition === "date" && (
                      <input
                        type="date"
                        value={recurrenceData.endDate}
                        onChange={(e) => handleRecurrenceChange("endDate", e.target.value)}
                        min={recurrenceData.startDate || today}
                        className={`px-2 py-1 border rounded focus:outline-none focus:ring-1 transition-colors ${
                          validationErrors.endDate
                            ? "border-red-300 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        data-testid="input-end-date"
                      />
                    )}
                  </div>
                  {validationErrors.endDate && (
                    <p className="text-red-600 text-sm mt-1" data-testid="error-end-date">
                      {validationErrors.endDate}
                    </p>
                  )}
                  {validationErrors.endOccurrences && (
                    <p className="text-red-600 text-sm mt-1" data-testid="error-end-occurrences">
                      {validationErrors.endOccurrences}
                    </p>
                  )}
                </div>
              </div>

              {/* Summary */}
              {generateSummary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Schedule Summary</h4>
                  <p className="text-sm text-blue-800">{generateSummary}</p>
                </div>
              )}

              {/* Preview Occurrences */}
              {generatePreviewOccurrences.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Next 5 Occurrences</h4>
                  <ul className="space-y-1">
                    {generatePreviewOccurrences.map((date, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignment & People */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Assignment & People</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to *
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
                <p className="text-red-600 text-sm mt-1" data-testid="error-assignee">
                  {validationErrors.assignee}
                </p>
              )}
            </div>

            {/* Contributors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contributors (Optional)
                <span className="text-xs text-gray-500 ml-2">
                  - visibility & notifications only
                </span>
              </label>
              <MultiSelect
                options={[
                  { value: "john", label: "John Smith" },
                  { value: "jane", label: "Jane Smith" },
                  { value: "mike", label: "Mike Johnson" },
                  { value: "sarah", label: "Sarah Wilson" },
                ]}
                value={formData.contributors}
                onChange={(selectedValues) => handleInputChange("contributors", selectedValues)}
                placeholder="Select contributors..."
                dataTestId="multi-select-contributors"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional information or instructions..."
              data-testid="textarea-notes"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            data-testid="button-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg text-white transition-colors ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            data-testid="button-submit"
          >
            {isSubmitting ? "Creating Task..." : "Create Task"}
          </button>
        </div>
      </form>
    </ErrorBoundary>
  );
};

export default UnifiedRegularTaskForm;