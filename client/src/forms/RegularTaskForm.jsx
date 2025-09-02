import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
// Using standard select for now - can be enhanced with searchable select later
// import { SearchableSelect } from "@/components/ui/searchable-select";

export function RegularTaskForm({ onSubmit, onClose, initialData = {} }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee: "self",
    priority: "low",
    dueDate: "",
    visibility: "private",
    tags: "",
    currentTagInput: "",
    isRecurring: false,
    ...initialData,
  });

  const [moreOptionsData, setMoreOptionsData] = useState({
    referenceProcess: "",
    customForm: "",
    dependencies: [],
    taskTypeAdvanced: "simple",
  });

  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isManualDueDate, setIsManualDueDate] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const taskData = {
      ...formData,
      ...moreOptionsData,
      type: "regular",
    };

    onSubmit(taskData);
  };

  return (
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
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formData.title.length >= 18 ? "border-orange-500" : ""}`}
              placeholder="Short, clear title..."
              maxLength="20"
              required
            />
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
            <select
              value={formData.assignee}
              onChange={(e) => handleInputChange("assignee", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="self">Self</option>
              <option value="john">John Doe</option>
              <option value="jane">Jane Smith</option>
              <option value="mike">Mike Johnson</option>
              <option value="sarah">Sarah Wilson</option>
            </select>
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
                <p className="text-xs text-gray-500">Manual override active.</p>
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
              onChange={(e) => handleInputChange("visibility", e.target.value)}
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
              <SearchableSelect
                options={[
                  { value: "", label: "Select a process..." },
                  { value: "sop001", label: "Customer Onboarding SOP" },
                  { value: "sop002", label: "Bug Report Workflow" },
                  { value: "sop003", label: "Feature Request Process" },
                  { value: "sop004", label: "Quality Assurance Checklist" },
                  { value: "sop005", label: "Deployment Process" },
                ]}
                value={
                  moreOptionsData.referenceProcess
                    ? {
                        value: moreOptionsData.referenceProcess,
                        label:
                          {
                            sop001: "Customer Onboarding SOP",
                            sop002: "Bug Report Workflow",
                            sop003: "Feature Request Process",
                            sop004: "Quality Assurance Checklist",
                            sop005: "Deployment Process",
                          }[moreOptionsData.referenceProcess] ||
                          moreOptionsData.referenceProcess,
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  handleMoreOptionsChange(
                    "referenceProcess",
                    selectedOption?.value || "",
                  )
                }
                placeholder="Search and select a process..."
                isClearable
              />
              <p className="text-xs text-gray-500 mt-1">
                Links the task to a predefined process (e.g., "Onboarding SOP").
                Useful for standard workflows.
              </p>
            </div>

            {/* Custom Form */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Custom Form
              </label>
              <SearchableSelect
                options={[
                  { value: "", label: "Select a form..." },
                  { value: "form001", label: "Bug Report Form" },
                  { value: "form002", label: "Feature Request Form" },
                  { value: "form003", label: "Customer Feedback Form" },
                  { value: "form004", label: "Project Evaluation Form" },
                  { value: "form005", label: "Performance Review Form" },
                ]}
                value={
                  moreOptionsData.customForm
                    ? {
                        value: moreOptionsData.customForm,
                        label:
                          {
                            form001: "Bug Report Form",
                            form002: "Feature Request Form",
                            form003: "Customer Feedback Form",
                            form004: "Project Evaluation Form",
                            form005: "Performance Review Form",
                          }[moreOptionsData.customForm] ||
                          moreOptionsData.customForm,
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  handleMoreOptionsChange(
                    "customForm",
                    selectedOption?.value || "",
                  )
                }
                placeholder="Search and select a form..."
                isClearable
              />
              <p className="text-xs text-gray-500 mt-1">
                Allows attaching an existing form template. Users cannot create
                new forms here (only pick from existing).
              </p>
            </div>

            {/* Dependencies */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Dependencies
              </label>
              <SearchableSelect
                options={[
                  { value: "task001", label: "Setup Development Environment" },
                  { value: "task002", label: "Design Database Schema" },
                  { value: "task003", label: "Create API Endpoints" },
                  { value: "task004", label: "Write Unit Tests" },
                  { value: "task005", label: "User Interface Design" },
                ]}
                value={
                  moreOptionsData.dependencies &&
                  Array.isArray(moreOptionsData.dependencies)
                    ? moreOptionsData.dependencies
                        .map((depId) => {
                          const taskNames = {
                            task001: "Setup Development Environment",
                            task002: "Design Database Schema",
                            task003: "Create API Endpoints",
                            task004: "Write Unit Tests",
                            task005: "User Interface Design",
                          };
                          return taskNames[depId]
                            ? { value: depId, label: taskNames[depId] }
                            : null;
                        })
                        .filter(Boolean)
                    : []
                }
                onChange={(selectedOptions) =>
                  handleMoreOptionsChange(
                    "dependencies",
                    selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : [],
                  )
                }
                placeholder="Search and select dependent tasks..."
                isMulti={true}
                isClearable
              />
              <p className="text-xs text-gray-500 mt-1">
                Select other tasks that must be completed before this task
                starts. Supports multiple dependencies.
              </p>
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Task Type *
              </label>
              <SearchableSelect
                options={[
                  { value: "simple", label: "📋 Simple" },
                  { value: "recurring", label: "🔄 Recurring" },
                  { value: "approval", label: "✅ Approval" },
                ]}
                value={{
                  value: moreOptionsData.taskTypeAdvanced || "simple",
                  label:
                    moreOptionsData.taskTypeAdvanced === "simple" ||
                    !moreOptionsData.taskTypeAdvanced
                      ? "📋 Simple"
                      : moreOptionsData.taskTypeAdvanced === "recurring"
                        ? "🔄 Recurring"
                        : "✅ Approval",
                }}
                onChange={(selectedOption) =>
                  handleMoreOptionsChange(
                    "taskTypeAdvanced",
                    selectedOption.value,
                  )
                }
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Default = Simple. Defines the kind of task. Future
                extensibility: Milestone, Quick.
              </p>
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
          <button type="submit" className="btn btn-primary">
            Create Task
          </button>
        </div>
      </div>
    </form>
  );
}
