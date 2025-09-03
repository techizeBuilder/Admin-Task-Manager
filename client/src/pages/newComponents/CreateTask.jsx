import React, { useState, useEffect } from "react";
import { RegularTaskForm } from "../../forms/RegularTaskForm";
import { RecurringTaskForm } from "../../forms/RecurringTaskForm";
import MilestoneTaskForm from "../../forms/MilestoneTaskForm";
import ApprovalTaskForm from "../../forms/ApprovalTaskForm";

export default function CreateTask({
  onClose,
  onSubmit,
  initialTaskType = "regular",
  preFilledDate = null,
}) {
  const [selectedTaskType, setSelectedTaskType] = useState("regular");

  return (
    <div className="flex flex-col h-full">
      {/* Task Type Selection Section */}
      <div className="bg-white rounded-lg p-6 mb-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Task Type
          </h3>
          <p className="text-gray-600 text-sm">
            Choose the type of task you want to create
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Regular Task */}
          <button
            onClick={() => setSelectedTaskType("regular")}
            className={`flex items-center p-4 rounded-xl transition-all group text-left ${
              selectedTaskType === "regular"
                ? "bg-blue-100 border-2 border-blue-500"
                : "bg-white border-2 border-gray-200 hover:border-blue-300"
            }`}
            data-testid="task-type-regular"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white mr-3 flex-shrink-0">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Regular Task</h4>
              <p className="text-xs text-gray-600">Standard one-time task</p>
            </div>
          </button>

          {/* Recurring Task */}
          <button
            onClick={() => setSelectedTaskType("recurring")}
            className={`flex items-center p-4 rounded-xl transition-all group text-left ${
              selectedTaskType === "recurring"
                ? "bg-blue-100 border-2 border-blue-500"
                : "bg-white border-2 border-gray-200 hover:border-blue-300"
            }`}
            data-testid="task-type-recurring"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white mr-3 flex-shrink-0">
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Recurring Task</h4>
              <p className="text-xs text-gray-600">Repeats on schedule</p>
            </div>
          </button>

          {/* Milestone */}
          <button
            onClick={() => setSelectedTaskType("milestone")}
            className={`flex items-center p-4 rounded-xl transition-all group text-left ${
              selectedTaskType === "milestone"
                ? "bg-red-100 border-2 border-red-500"
                : "bg-white border-2 border-gray-200 hover:border-red-300"
            }`}
            data-testid="task-type-milestone"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 text-white mr-3 flex-shrink-0">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Milestone</h4>
              <p className="text-xs text-gray-600">Project checkpoint</p>
            </div>
          </button>

          {/* Approval Task */}
          <button
            onClick={() => setSelectedTaskType("approval")}
            className={`flex items-center p-4 rounded-xl transition-all group text-left ${
              selectedTaskType === "approval"
                ? "bg-green-100 border-2 border-green-500"
                : "bg-white border-2 border-gray-200 hover:border-green-300"
            }`}
            data-testid="task-type-approval"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500 text-white mr-3 flex-shrink-0">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Approval Task</h4>
              <p className="text-xs text-gray-600">Requires approval</p>
            </div>
          </button>
        </div>
      </div>

      {/* Task Details Section */}
      <div className="bg-white rounded-lg p-6 flex-1">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Task Details
          </h3>
          <p className="text-gray-600 text-sm">
            Fill in the basic information for your task
          </p>
        </div>

        {/* Task Form Content */}
        {selectedTaskType === 'regular' && (
          <RegularTaskForm
            onSubmit={(data) => {
              console.log('Regular task created:', data);
              onSubmit({
                ...data,
                taskType: selectedTaskType
              });
            }}
            onCancel={onClose}
            isOrgUser={true}
          />
        )}
        
        {selectedTaskType === 'recurring' && (
          <RecurringTaskForm
            onSubmit={(data) => {
              console.log('Recurring task created:', data);
              onSubmit({
                ...data,
                taskType: selectedTaskType
              });
            }}
            onCancel={onClose}
            isOrgUser={true}
          />
        )}
        
        {selectedTaskType === 'milestone' && (
          <MilestoneTaskForm
            onSubmit={(data) => {
              console.log('Milestone task created:', data);
              onSubmit({
                ...data,
                taskType: selectedTaskType
              });
            }}
            onCancel={onClose}
            isOrgUser={true}
            assignmentOptions={[
              { value: 'self', label: 'Self' },
              { value: 'user1', label: 'John Doe' },
              { value: 'user2', label: 'Jane Smith' },
              { value: 'user3', label: 'Mike Johnson' }
            ]}
            existingTasks={[
              { id: 'task-1', name: 'Setup Project Environment', taskType: 'regular', dueDate: '2025-09-15' },
              { id: 'task-2', name: 'Create Database Schema', taskType: 'regular', dueDate: '2025-09-20' },
              { id: 'task-3', name: 'Design UI Mockups', taskType: 'regular', dueDate: '2025-09-18' },
              { id: 'task-4', name: 'Implement Authentication', taskType: 'regular', dueDate: '2025-09-25' }
            ]}
          />
        )}
        
        {selectedTaskType === 'approval' && (
          <ApprovalTaskForm
            onSubmit={(data) => {
              console.log('Approval task created:', data);
              onSubmit({
                ...data,
                taskType: selectedTaskType
              });
            }}
            onCancel={onClose}
            isOrgUser={true}
            assignmentOptions={[
              { value: 'self', label: 'Self' },
              { value: 'user1', label: 'John Doe' },
              { value: 'user2', label: 'Jane Smith' },
              { value: 'user3', label: 'Mike Johnson' }
            ]}
            approverOptions={[
              { value: 'manager1', label: 'Sarah Wilson (Manager)' },
              { value: 'lead1', label: 'David Chen (Team Lead)' },
              { value: 'director1', label: 'Lisa Rodriguez (Director)' },
              { value: 'user1', label: 'John Doe' },
              { value: 'user2', label: 'Jane Smith' }
            ]}
          />
        )}
      </div>

      {/* Action Buttons - No longer needed since all forms have their own buttons */}
      {false && (
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
            data-testid="button-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSubmit({
                title: `New ${selectedTaskType} task`,
                description: "",
                assignedTo: "self",
                priority: "Medium",
                taskType: selectedTaskType,
                category: "general",
                visibility: "private",
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
                tags: [],
                collaborators: [],
                attachments: [],
              });
            }}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            data-testid="button-save"
          >
            Save Task
          </button>
        </div>
      )}
    </div>
  );
}

// Legacy implementation
function LegacyCreateTask({
  onClose,
  initialTaskType = "regular",
  preFilledDate = null,
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      visibility: "private",
      dueDate: preFilledDate || "",
      assignedTo: "",
      category: "",
      tags: [],
      collaborators: [],
      attachments: [],
    },
  });

  const [taskType, setTaskType] = useState("modular");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [recurrenceData, setRecurrenceData] = useState(null);
  const [milestoneData, setMilestoneData] = useState(null);
  const [moreOptionsData, setMoreOptionsData] = useState({
    referenceProcess: "",
    customForm: "",
    dependencies: [],
    taskTypeAdvanced: "simple",
  });
  const onSubmit = async (formData) => {
    try {
      console.log("Form submission data:", formData); // Debug log
      const submitData = new FormData();

      // Add basic task data
      submitData.append("title", formData.title);
      submitData.append("description", formData.description || "");
      submitData.append("taskType", taskType);
      submitData.append("priority", formData.priority);
      submitData.append("visibility", formData.visibility);
      if (formData.category && formData.category.trim()) {
        submitData.append("category", formData.category);
        console.log("Category being sent:", formData.category); // Debug log
      } else {
        console.log("No category selected or empty category"); // Debug log
      }

      if (formData.dueDate) {
        submitData.append("dueDate", formData.dueDate);
      }
      if (formData.startDate) {
        submitData.append("startDate", formData.startDate);
      }
      if (formData.assignedTo) {
        submitData.append("assignedTo", formData.assignedTo);
      }

      // Add task-specific data based on type
      if (taskType === "recurring" && recurrenceData) {
        submitData.append("recurrencePattern", JSON.stringify(recurrenceData));
      }

      if (taskType === "milestone" && milestoneData) {
        submitData.append("milestoneData", JSON.stringify(milestoneData));
        submitData.append("milestoneType", milestoneData.type || "standalone");
        if (milestoneData.linkedTaskIds) {
          submitData.append(
            "linkedTaskIds",
            JSON.stringify(milestoneData.linkedTaskIds),
          );
        }
      }

      // Add collaborators
      if (collaborators.length > 0) {
        submitData.append(
          "collaboratorIds",
          JSON.stringify(collaborators.map((c) => c.id)),
        );
      }

      // Add tags
      if (formData.tags && formData.tags.length > 0) {
        submitData.append("tags", JSON.stringify(formData.tags));
      }

      // Always add advanced options data to ensure all settings are saved
      if (moreOptionsData.referenceProcess) {
        submitData.append("referenceProcess", moreOptionsData.referenceProcess);
      }
      if (moreOptionsData.customForm) {
        submitData.append("customForm", moreOptionsData.customForm);
      }
      if (
        moreOptionsData.dependencies &&
        moreOptionsData.dependencies.length > 0
      ) {
        // Ensure dependencies are properly formatted as an array
        const dependencyArray = Array.isArray(moreOptionsData.dependencies)
          ? moreOptionsData.dependencies
          : [moreOptionsData.dependencies];
        submitData.append("dependsOnTaskIds", JSON.stringify(dependencyArray));
        console.log("Dependencies being sent:", dependencyArray); // Debug log
      }
      // Always save the advanced task type - this identifies if it's simple, complex, etc.
      submitData.append(
        "taskTypeAdvanced",
        moreOptionsData.taskTypeAdvanced || "simple",
      );

      // Add the main task type to clearly identify the task category
      submitData.append("mainTaskType", taskType); // This will be "regular", "recurring", "milestone", "approval"

      // Handle file attachments
      if (attachments.length > 0) {
        attachments.forEach((attachment, index) => {
          if (attachment.file) {
            submitData.append("attachments", attachment.file);
          }
        });
      }

      // Get auth token from localStorage
      const token = localStorage.getItem("token");

      const response = await axios.post("/api/create-task", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      console.log("Task created successfully:", response.data);

      // Reset form after successful submission
      reset();
      setAttachments([]);
      setCollaborators([]);
      setRecurrenceData(null);
      setMilestoneData(null);

      if (onClose) onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      alert(
        "Failed to create task: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  useEffect(() => {
    const priority = watch("priority");
    if (priority && !watch("isManualDueDate")) {
      const calculatedDueDate = calculateDueDateFromPriority(priority);
      setValue("dueDate", calculatedDueDate);
    }
  }, [watch("priority"), watch("isManualDueDate")]);

  return (
    <div className="create-task-container">
      {/* Task Type Selector */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Task Type</h3>
          <p className="text-gray-600">
            Choose the type of task you want to create
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setTaskType("modular")}
            className={`p-4 border-2 rounded-xl text-left transition-all duration-300 group ${
              taskType === "modular"
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md transform scale-102"
                : "border-gray-200 hover:border-blue-300 hover:shadow-sm hover:transform hover:scale-101"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  taskType === "modular"
                    ? "bg-blue-500 text-white"
                    : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                }`}
              >
                <span className="text-lg">📋</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                  Create Task
                </h4>
                <p className="text-sm text-gray-500 group-hover:text-gray-600">
                  Modular task creation with milestone, approval, and recurring
                  options
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span>⭐</span>
                    Milestone
                  </span>
                  <span className="flex items-center gap-1">
                    <span>✅</span>
                    Approval
                  </span>
                  <span className="flex items-center gap-1">
                    <span>🔄</span>
                    Recurring
                  </span>
                </div>
              </div>
            </div>
          </button>
          {/* 
          <button
            onClick={() => setTaskType("recurring")}
            className={`p-3 border-2 rounded-xl text-left transition-all duration-300 group ${
              taskType === "recurring"
                ? "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md transform scale-102"
                : "border-gray-200 hover:border-green-300 hover:shadow-sm hover:transform hover:scale-101"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  taskType === "recurring"
                    ? "bg-green-500 text-white"
                    : "bg-green-100 text-green-600 group-hover:bg-green-200"
                }`}
              >
                <span className="text-sm">🔄</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-green-700">
                  Recurring Task
                </h4>
                <p className="text-xs text-gray-500 group-hover:text-gray-600 truncate">
                  Repeats on schedule
                </p>
              </div>
            </div>
          </button> */}
          <button
            onClick={() => setTaskType("milestone")}
            className={`p-3 border-2 rounded-xl text-left transition-all duration-300 group ${
              taskType === "milestone"
                ? "border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50 shadow-md transform scale-102"
                : "border-gray-200 hover:border-purple-300 hover:shadow-sm hover:transform hover:scale-101"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  taskType === "milestone"
                    ? "bg-purple-500 text-white"
                    : "bg-purple-100 text-purple-600 group-hover:bg-purple-200"
                }`}
              >
                <span className="text-sm">🎯</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">
                  Milestone
                </h4>
                <p className="text-xs text-gray-500 group-hover:text-gray-600 truncate">
                  Project checkpoint
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setTaskType("approval")}
            className={`p-3 border-2 rounded-xl text-left transition-all duration-300 group ${
              taskType === "approval"
                ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-md transform scale-102"
                : "border-gray-200 hover:border-emerald-300 hover:shadow-sm hover:transform hover:scale-101"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  taskType === "approval"
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"
                }`}
              >
                <span className="text-sm">✅</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
                  Approval Task
                </h4>
                <p className="text-xs text-gray-500 group-hover:text-gray-600 truncate">
                  Requires approval
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Modular Task Form */}
      {taskType === "modular" && (
        <TaskForm
          onSubmit={(formData) => {
            // Convert TaskForm data format to match existing API
            onSubmit({
              title: formData.title,
              description: formData.description,
              assignedTo: formData.assignee,
              priority: formData.priority,
              visibility: formData.visibility,
              dueDate: formData.dueDate,
              category: formData.category || "general",
              tags: formData.tags || [],
              taskType: formData.taskType,
              milestone: formData.milestone,
              approval: formData.approval,
              recurring: formData.recurring,
              advanced: formData.advanced,
              collaborators: formData.collaborators || [],
              attachments: formData.attachments || [],
            });
          }}
          onSaveDraft={(formData) => {
            console.log("Saving draft:", formData);
          }}
          onClose={onClose}
          initialData={{
            dueDate: preFilledDate || "",
          }}
        />
      )}

      {/* Legacy Regular Task Form */}
      {taskType === "regular" && (
        <RegularTaskForm
          onSubmit={(formData) => {
            // Convert RegularTaskForm data format to match existing API
            onSubmit({
              title: formData.title,
              description: formData.description,
              assignedTo: formData.assignee,
              priority: formData.priority,
              visibility: formData.visibility,
              dueDate: formData.dueDate,
              category: "regular",
              tags: formData.tags
                ? formData.tags.split(",").map((tag) => tag.trim())
                : [],
              taskType: "regular",
              ...formData,
            });
          }}
          onClose={onClose}
          initialData={{
            dueDate: preFilledDate || "",
          }}
        />
      )}

      {/* Recurring Task Form */}
      {taskType === "recurring" && (
        <RecurringTaskForm
          onSubmit={(formData) => {
            // Convert RecurringTaskForm data format to match existing API
            onSubmit({
              title: formData.title,
              description: formData.description,
              assignedTo: formData.assignee,
              priority: formData.priority,
              visibility: formData.visibility,
              frequency: formData.frequency,
              repeatEvery: formData.repeatEvery,
              startDate: formData.startDate,
              endConditionType: formData.endConditionType,
              endDate: formData.endDate,
              maxOccurrences: formData.maxOccurrences,
              time: formData.time,
              repeatOnDays: formData.repeatOnDays,
              contributors: formData.contributors,
              notes: formData.notes,
              category: "recurring",
              taskType: "recurring",
              ...formData,
            });
          }}
          onClose={onClose}
          initialData={{
            startDate: preFilledDate || "",
          }}
        />
      )}

      {/* Milestone Task Form */}
      {taskType === "milestone" && (
        <form className=" bg-white p-6 rounded-xl card max-w-4xl mx-auto mt-3">
          {/* Main Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-1">
            {/* Left Column */}
            <div className="space-y-2">
              <div className="">
                <div className="flex gap-3">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <label
                    htmlFor="taskName"
                    className=" flex items-center gap-2 text-gray-700 font-medium text-sm"
                  >
                    Milestone Title*
                  </label>
                </div>
                <input
                  type="text"
                  id="taskName"
                  placeholder="Enter milestone title"
                  className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <label
                  htmlFor="isMilestone"
                  className="flex items-start space-x-3 cursor-pointer"
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      id="isMilestone"
                      defaultChecked={true}
                      className="w-4 h-4 rounded border-2 border-amber-400 text-amber-600 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-amber-800">
                      Milestone Toggle*
                    </span>
                    <p className="text-xs text-amber-600 mt-1">
                      Required to mark this task as a milestone
                    </p>
                  </div>
                </label>
              </div>

              <div className="">
                <div className="flex gap-3">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <label
                    htmlFor="milestoneType"
                    className="form-label flex items-center gap-2 text-gray-700 font-medium text-sm"
                  >
                    Milestone Type
                  </label>
                </div>
                <select
                  id="milestoneType"
                  className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700"
                >
                  <option value="standalone">🎯 Standalone Milestone</option>
                  <option value="linked">🔗 Linked to Tasks</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="">
                  <div className="flex gap-3">
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <label
                      htmlFor="dueDate"
                      className="form-label flex items-center gap-2 text-gray-700 font-medium text-sm"
                    >
                      Due Date*
                    </label>
                  </div>
                  <input
                    type="date"
                    id="dueDate"
                    className="form-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="">
                  <div className="flex gap-3">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <label
                      htmlFor="assignedTo"
                      className="form-label flex items-center gap-2 text-gray-700 font-medium text-sm"
                    >
                      Assigned To
                    </label>
                  </div>
                  <select
                    id="assignedTo"
                    className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                  >
                    <option value="Current User">👤 Current User</option>
                    <option value="John Smith">👨‍💼 John Smith</option>
                    <option value="Sarah Wilson">👩‍💼 Sarah Wilson</option>
                    <option value="Mike Johnson">👨‍💻 Mike Johnson</option>
                    <option value="Emily Davis">👩‍💻 Emily Davis</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2">
              <div className="">
                <div className="flex gap-2">
                  <svg
                    className="w-4 h-4 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  <label
                    htmlFor="linkedTasks"
                    className="form-label flex items-center gap-2 text-gray-700 font-medium text-sm"
                  >
                    Link to Tasks
                  </label>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {[
                      "UI Design Complete",
                      "Backend API Development",
                      "Testing Phase",
                      "Deployment",
                    ].map((task, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 p-2 bg-white rounded-md border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-${
                              ["green", "blue", "purple", "orange"][i]
                            }-600`}
                          >
                            {["✅", "⚙️", "🧪", "🚀"][i]}
                          </span>
                          <span className="text-sm text-gray-700">{task}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-indigo-600 mt-2 flex items-start gap-1">
                    <svg
                      className="w-3 h-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Select tasks to monitor for this milestone
                  </p>
                </div>
              </div>

              <div className="">
                <div className="flex gap-3">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                  <label
                    htmlFor="description"
                    className="form-label flex items-center gap-2 text-gray-700 font-medium text-sm"
                  >
                    Description
                  </label>
                </div>
                <textarea
                  id="description"
                  placeholder="Describe the milestone..."
                  rows="4"
                  className="form-textarea w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="">
                  <div className="flex gap-3">
                    <svg
                      className="w-4 h-4 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <label
                      htmlFor="visibility"
                      className="form-label flex items-center gap-2 text-gray-700 font-medium text-sm"
                    >
                      Visibility
                    </label>
                  </div>
                  <select
                    id="visibility"
                    className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700"
                  >
                    <option value="private">🔒 Private</option>
                    <option value="public">👥 Public</option>
                  </select>
                </div>

                <div className="">
                  <div className="flex gap-3">
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <label
                      htmlFor="priority"
                      className="form-label flex items-center gap-2 text-gray-700 font-medium text-sm"
                    >
                      Priority
                    </label>
                  </div>
                  <select
                    id="priority"
                    className="form-select w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium" selected>
                      🟡 Medium
                    </option>
                    <option value="high">🟠 High</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                </div>
              </div>

              <div className="">
                <div className="flex gap-2">
                  <svg
                    className="w-4 h-4 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <label
                    htmlFor="collaborators"
                    className="form-label flex items-center gap-2 text-gray-700 font-medium text-sm"
                  >
                    Collaborators
                  </label>
                </div>
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-4">
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {[
                      {
                        initials: "CU",
                        name: "Current User",
                        email: "current@company.com",
                        color: "teal",
                      },
                      {
                        initials: "JS",
                        name: "John Smith",
                        email: "john@company.com",
                        color: "blue",
                      },
                      {
                        initials: "SW",
                        name: "Sarah Wilson",
                        email: "sarah@company.com",
                        color: "purple",
                      },
                      {
                        initials: "MJ",
                        name: "Mike Johnson",
                        email: "mike@company.com",
                        color: "green",
                      },
                      {
                        initials: "ED",
                        name: "Emily Davis",
                        email: "emily@company.com",
                        color: "pink",
                      },
                    ].map((person, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 p-2 bg-white rounded-md border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full bg-${person.color}-500 flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {person.initials}
                          </div>
                          <div>
                            <span className="text-sm text-gray-700">
                              {person.name}
                            </span>
                            <p className="text-xs text-gray-500">
                              {person.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-teal-600 mt-2 flex items-start gap-1">
                    <svg
                      className="w-3 h-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Optional - for updates & comments visibility
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              className="px-5 py-2.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1 inline-block"
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
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium rounded-md border border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center gap-1"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Milestone
            </button>
          </div>
        </form>
      )}

      {/* More Options Modal */}
      {showMoreOptions && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4 overlay-animate">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[98vh] overflow-y-auto modal-animate-slide-right">
            <MoreOptionsModal
              data={moreOptionsData}
              onChange={(field, value) =>
                setMoreOptionsData((prev) => ({ ...prev, [field]: value }))
              }
              onClose={() => setShowMoreOptions(false)}
              onSave={() => setShowMoreOptions(false)}
            />
          </div>
        </div>
      )}

      {/* Approval Task Form */}
      {taskType === "approval" && (
        <ApprovalTaskForm
          formData={{
            title: "",
            description: "",
            dueDate: preFilledDate || "",
            collaborators: [],
            approval: {
              approvers: [],
              approvalMode: "any_one",
              approverOrder: [],
              autoApproval: false,
              autoApprovalDays: 0,
            },
          }}
          setFormData={(formData) => {
            // Handle form data updates if needed
          }}
          onSubmit={(formData) => {
            // Convert ApprovalTaskForm data format to match existing API
            onSubmit({
              title: formData.title,
              description: formData.description,
              dueDate: formData.dueDate,
              collaborators: formData.collaborators,
              taskType: "approval",
              approval: formData.approval,
              priority: "medium",
              visibility: "private",
              category: "approval",
            });
          }}
          onSaveDraft={(formData) => {
            // Handle draft saving if needed
            console.log("Saving approval task draft:", formData);
          }}
          onCancel={onClose}
        />
      )}
    </div>
  );
}

function MoreOptionsModal({ data, onChange, onClose, onSave }) {
  const [searchTerms, setSearchTerms] = useState({
    process: "",
    form: "",
    dependencies: "",
  });

  // Sample data - in real app, these would come from API
  const referenceProcesses = [
    { id: "sop001", name: "Customer Onboarding SOP" },
    { id: "sop002", name: "Bug Report Workflow" },
    { id: "sop003", name: "Feature Request Process" },
    { id: "sop004", name: "Quality Assurance Checklist" },
    { id: "sop005", name: "Deployment Process" },
  ];

  const customForms = [
    { id: "form001", name: "Bug Report Form" },
    { id: "form002", name: "Feature Request Form" },
    { id: "form003", name: "Customer Feedback Form" },
    { id: "form004", name: "Project Evaluation Form" },
    { id: "form005", name: "Performance Review Form" },
  ];

  const existingTasks = [
    { id: "task001", name: "Setup Development Environment" },
    { id: "task002", name: "Design Database Schema" },
    { id: "task003", name: "Create API Endpoints" },
    { id: "task004", name: "Write Unit Tests" },
    { id: "task005", name: "User Interface Design" },
  ];

  const filteredProcesses = referenceProcesses.filter((process) =>
    process.name.toLowerCase().includes(searchTerms.process.toLowerCase()),
  );

  const filteredForms = customForms.filter((form) =>
    form.name.toLowerCase().includes(searchTerms.form.toLowerCase()),
  );

  const filteredTasks = existingTasks.filter((task) =>
    task.name.toLowerCase().includes(searchTerms.dependencies.toLowerCase()),
  );

  const handleDependencyToggle = (taskId) => {
    const currentDeps = data.dependencies || [];
    const newDeps = currentDeps.includes(taskId)
      ? currentDeps.filter((id) => id !== taskId)
      : [...currentDeps, taskId];
    onChange("dependencies", newDeps);
  };

  const handleSave = () => {
    // In real app, would validate and save data
    onSave();
  };

  return (
    <>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">More Options</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        <p className="text-gray-600 mt-1">Configure advanced task settings</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Reference Process */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Process
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a process..."
              value={searchTerms.process}
              onChange={(e) =>
                setSearchTerms((prev) => ({ ...prev, process: e.target.value }))
              }
              className="form-input mb-2"
            />
            <select
              value={data.referenceProcess}
              onChange={(e) => onChange("referenceProcess", e.target.value)}
              className="form-select"
            >
              <option value="">Select a process...</option>
              {filteredProcesses.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Link this task to an existing process (e.g., SOP or workflow)
          </p>
        </div>

        {/* Custom Form */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Form
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a form..."
              value={searchTerms.form}
              onChange={(e) =>
                setSearchTerms((prev) => ({ ...prev, form: e.target.value }))
              }
              className="form-input mb-2"
            />
            <select
              value={data.customForm}
              onChange={(e) => onChange("customForm", e.target.value)}
              className="form-select"
            >
              <option value="">Select a form...</option>
              {filteredForms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Choose a predefined form to collect data for this task
          </p>
        </div>

        {/* Dependencies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dependencies
          </label>
          <input
            type="text"
            placeholder="Search for tasks..."
            value={searchTerms.dependencies}
            onChange={(e) =>
              setSearchTerms((prev) => ({
                ...prev,
                dependencies: e.target.value,
              }))
            }
            className="form-input mb-2"
          />
          <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
            {filteredTasks.map((task) => (
              <label
                key={task.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={data.dependencies?.includes(task.id) || false}
                  onChange={() => handleDependencyToggle(task.id)}
                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">{task.name}</span>
              </label>
            ))}
            {filteredTasks.length === 0 && (
              <div className="p-3 text-sm text-gray-500 text-center">
                No tasks found
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Select existing tasks that must be completed before this one starts
          </p>
        </div>

        {/* Task Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Type *
          </label>
          <select
            value={data.taskTypeAdvanced}
            onChange={(e) => onChange("taskTypeAdvanced", e.target.value)}
            className="form-select"
            required
          >
            <option value="simple">Simple</option>
            <option value="recurring">Recurring</option>
            <option value="approval">Approval</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Determines the task behavior
          </p>
        </div>
      </div>

      {/* Modal Actions */}
      <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
        <button type="button" onClick={handleSave} className="btn btn-primary">
          Save Options
        </button>
      </div>
    </>
  );
}
