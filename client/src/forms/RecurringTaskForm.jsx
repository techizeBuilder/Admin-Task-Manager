import { useState, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Error Boundary Component for better debugging
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

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

export function RecurringTaskForm({ onSubmit, onClose, initialData = {} }) {
  const [formData, setFormData] = useState(() => {
    try {
      return {
        title: "",
        description: "",
        priority: "low",
        frequency: "daily",
        repeatEvery: 1,
        time: "",
        startDate: "",
        repeatOnDays: [],
        assignee: "",
        contributors: [],
        visibility: "private",
        notes: "",
        endConditionType: "never",
        endDate: "",
        maxOccurrences: "",
        ...initialData,
      };
    } catch (error) {
      console.error("Error initializing form data:", error);
      return {
        title: "",
        description: "",
        priority: "low",
        frequency: "daily",
        repeatEvery: 1,
        time: "",
        startDate: "",
        repeatOnDays: [],
        assignee: "",
        contributors: [],
        visibility: "private",
        notes: "",
        endConditionType: "never",
        endDate: "",
        maxOccurrences: "",
      };
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    handleInputChange(name, value);
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      repeatOnDays: prev.repeatOnDays.includes(day)
        ? prev.repeatOnDays.filter((d) => d !== day)
        : [...prev.repeatOnDays, day],
    }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        setIsSubmitting(true);
        setValidationErrors({});

        const taskData = {
          ...formData,
          type: "recurring",
        };

        console.log("Submitting recurring task data:", taskData);
        await onSubmit(taskData);
      } catch (error) {
        console.error("Error submitting form:", error);
        setValidationErrors({
          submit:
            error.message ||
            "Failed to create recurring task. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, onSubmit],
  );

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
              Task Details
            </h3>
            <p className="text-gray-600 text-sm">
              Fill in the basic information for your task
            </p>
          </div>

          <div className="space-y-3">
            {/* Title, Description, Priority Row */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                  <span
                    className={`ml-2 text-sm ${formData.title.length > 20 ? "text-red-500" : "text-gray-500"}`}
                  >
                    ({formData.title.length}/20)
                  </span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={(e) => {
                    if (e.target.value.length <= 20) {
                      handleInputChange("title", e.target.value);
                    }
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    formData.title.length > 20
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="Enter recurring task title..."
                  maxLength="20"
                  required
                  data-testid="input-recurring-task-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <ReactQuill
                    value={formData.description}
                    onChange={(value) =>
                      handleInputChange("description", value)
                    }
                    theme="snow"
                    placeholder="Enter task description..."
                    className="custom-editor"
                    modules={{
                      toolbar: [
                        ["bold", "italic", "underline"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link"],
                        ["clean"],
                      ],
                    }}
                    data-testid="quill-description"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="select-priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Recurrence Pattern */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Recurrence Pattern
          </h3>

          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1 ">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => handleInputChange("frequency", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="select-frequency"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repeat Every
              </label>
              <input
                type="number"
                name="repeatEvery"
                value={formData.repeatEvery}
                onChange={(e) =>
                  handleInputChange("repeatEvery", parseInt(e.target.value, 10))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="365"
                data-testid="input-repeat-every"
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="input-time"
              />
            </div>

            <div className="col-span-1 ">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                data-testid="input-start-date"
              />
            </div>
          </div>

          {formData.frequency === "weekly" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repeat On Days
              </label>
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <button
                      key={day}
                      type="button"
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        formData.repeatOnDays.includes(day)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                      }`}
                      onClick={() => handleDayToggle(day)}
                      data-testid={`button-day-${day.toLowerCase()}`}
                    >
                      {day}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* Assignment & People */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Assignment & People
          </h3>

          <div className="space-y-3">
            {/* Assignment & Contributors Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to *
                </label>
                <select
                  value={formData.assignee}
                  onChange={(e) =>
                    handleInputChange("assignee", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="select-assignee"
                >
                  <option value="">Select assignee...</option>
                  <option value="john">John Doe</option>
                  <option value="jane">Jane Smith</option>
                  <option value="mike">Mike Johnson</option>
                  <option value="sarah">Sarah Wilson</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contributors (Optional)
                  <span className="text-xs text-gray-500 ml-2">
                    - visibility & notifications only
                  </span>
                </label>
                <div className="border border-gray-300 rounded-lg p-2 bg-gray-50 max-h-32 overflow-y-auto">
                  {[
                    { value: "john", label: "John Smith" },
                    { value: "jane", label: "Jane Smith" },
                    { value: "mike", label: "Mike Johnson" },
                    { value: "sarah", label: "Sarah Wilson" },
                  ].map((contributor) => (
                    <label
                      key={contributor.value}
                      className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.contributors.includes(
                          contributor.value,
                        )}
                        onChange={(e) => {
                          const currentContributors = [
                            ...formData.contributors,
                          ];

                          if (e.target.checked) {
                            if (
                              !currentContributors.includes(contributor.value)
                            ) {
                              currentContributors.push(contributor.value);
                            }
                          } else {
                            const index = currentContributors.indexOf(
                              contributor.value,
                            );
                            if (index > -1) {
                              currentContributors.splice(index, 1);
                            }
                          }

                          handleInputChange(
                            "contributors",
                            currentContributors,
                          );
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        data-testid={`checkbox-contributor-${contributor.value}`}
                      />
                      <span className="text-sm text-gray-700">
                        {contributor.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Visibility & Notes Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === "private"}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500 mr-2"
                      data-testid="radio-visibility-private"
                    />
                    <div>
                      <div className="font-medium text-sm">Private</div>
                      <div className="text-xs text-gray-500">
                        Creator + contributors
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === "public"}
                      onChange={handleChange}
                      className="text-blue-600 focus:ring-blue-500 mr-2"
                      data-testid="radio-visibility-public"
                    />
                    <div>
                      <div className="font-medium text-sm">Public</div>
                      <div className="text-xs text-gray-500">
                        Company visible
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes / Instructions (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Add notes or instructions..."
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  data-testid="textarea-notes"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Included with each task instance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* End Condition */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            End Condition
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                id="never"
                name="endConditionType"
                value="never"
                checked={formData.endConditionType === "never"}
                onChange={handleChange}
                className="text-blue-600 focus:ring-blue-500"
                data-testid="radio-end-never"
              />
              <div className="flex-1">
                <label
                  htmlFor="never"
                  className="text-sm font-medium text-gray-700 cursor-pointer block"
                >
                  Never End
                </label>
                <span className="text-xs text-gray-500">
                  Continue indefinitely
                </span>
              </div>
            </div>

            <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  id="endDate"
                  name="endConditionType"
                  value="endDate"
                  checked={formData.endConditionType === "endDate"}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                  data-testid="radio-end-date"
                />
                <label
                  htmlFor="endDate"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  End on Date
                </label>
              </div>
              {formData.endConditionType === "endDate" && (
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="input-end-date"
                />
              )}
            </div>

            <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  id="maxOccurrences"
                  name="endConditionType"
                  value="maxOccurrences"
                  checked={formData.endConditionType === "maxOccurrences"}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                  data-testid="radio-end-occurrences"
                />
                <label
                  htmlFor="maxOccurrences"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  After Occurrences
                </label>
              </div>
              {formData.endConditionType === "maxOccurrences" && (
                <input
                  type="number"
                  name="maxOccurrences"
                  value={formData.maxOccurrences}
                  onChange={handleChange}
                  placeholder="Number of times"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  data-testid="input-max-occurrences"
                />
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            data-testid="button-cancel"
          >
            Cancel
          </button>
          <div>
            <button
              type="button"
              className="btn btn-secondary mr-1"
              data-testid="button-save-draft"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              data-testid="button-create-recurring-task"
            >
              {isSubmitting ? "Creating..." : "Create Recurring Task"}
            </button>
          </div>
        </div>
      </form>
    </ErrorBoundary>
  );
}

// Validation function
function validateForm(formData) {
  const errors = {};

  if (!formData.title?.trim()) {
    errors.title = "Task title is required";
  }

  if (!formData.assignee) {
    errors.assignee = "Assignee is required";
  }

  if (!formData.startDate) {
    errors.startDate = "Start date is required";
  }

  return errors;
}
