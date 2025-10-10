import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import "../styles/quill-custom.css";
import Select from "react-select";
import {
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  GripVertical,
  Users,
  Loader2,
} from "lucide-react";

const ApprovalTaskForm = ({
  user,
  onSubmit,
  isOrgUser,
  assignmentOptions = [],
  approverOptions = [], // API data
  collaboratorOptions = [], // API data
  isLoadingApprovers = false,
  isLoadingCollaborators = false,
}) => {
  const [taskNameLength, setTaskNameLength] = useState(0);
  const [approverOrder, setApproverOrder] = useState([]);

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
      dueDate: new Date().toISOString().split("T")[0],
      approvers: [],
      approvalMode: "any_one",
      autoApproval: false,
      autoApprovalDays: 3,
      priority: { value: "medium", label: "Medium" },
      assignedTo: isOrgUser
        ? null
        : { value: "self", label: user?.name || "Self" },
      collaborators: [],
      visibility: "private",
    },
  });

  const watchedTaskName = watch("taskName");
  const watchedApprovers = watch("approvers");
  const watchedApprovalMode = watch("approvalMode");
  const watchedAutoApproval = watch("autoApproval");

  useEffect(() => {
    setTaskNameLength(watchedTaskName?.length || 0);
  }, [watchedTaskName]);

  // Update approver order when approvers change
  useEffect(() => {
    if (watchedApprovers && watchedApprovers.length > 0) {
      const newOrder = watchedApprovers.map((approver, index) => ({
        ...approver,
        order: index + 1,
      }));
      setApproverOrder(newOrder);
    } else {
      setApproverOrder([]);
    }
  }, [watchedApprovers]);

  // Get today's date for validation
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Priority options
  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  // Approval mode options
  const approvalModeOptions = [
    { value: "any_one", label: "Any One" },
    { value: "all_must_approve", label: "All Must Approve" },
    { value: "sequential", label: "Sequential" },
  ];

  // Move approver up in order
  const moveApproverUp = (index) => {
    if (index > 0) {
      const newOrder = [...approverOrder];
      [newOrder[index], newOrder[index - 1]] = [
        newOrder[index - 1],
        newOrder[index],
      ];
      setApproverOrder(newOrder);
      setValue("approvers", newOrder);
    }
  };

  // Move approver down in order
  const moveApproverDown = (index) => {
    if (index < approverOrder.length - 1) {
      const newOrder = [...approverOrder];
      [newOrder[index], newOrder[index + 1]] = [
        newOrder[index + 1],
        newOrder[index],
      ];
      setApproverOrder(newOrder);
      setValue("approvers", newOrder);
    }
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

  const onFormSubmit = (data) => {
    const formData = {
      ...data,
      taskType: "approval",
      approverOrder:
        watchedApprovalMode === "sequential" ? approverOrder : null,
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Task Name */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-0">
          Task Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            {...register("taskName", {
              required: "Task name is required",
              maxLength: {
                value: 80,
                message: "Task name cannot exceed 80 characters",
              },
            })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter task name..."
            data-testid="input-task-name"
          />
          <div className="absolute right-3 top-2 text-xs text-gray-500">
            {taskNameLength}/80
          </div>
        </div>
        {errors.taskName && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors.taskName.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-0">
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
              className="custom-editor border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Describe what needs approval..."
            />
          )}
        />
      </div>

      {/* Approvers */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-0">
          Approvers <span className="text-red-500">*</span>
          {isLoadingApprovers && (
            <Loader2 className="w-4 h-4 animate-spin inline-block ml-2" />
          )}
        </label>
        <Controller
          name="approvers"
          control={control}
          rules={{
            required: "At least one approver must be assigned",
            validate: (value) => {
              if (!value || value.length === 0) {
                return "At least one approver must be assigned";
              }
              return true;
            },
          }}
          render={({ field }) => (
            <Select
              {...field}
              isMulti
              options={approverOptions}
              isLoading={isLoadingApprovers}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder={
                isLoadingApprovers
                  ? "Loading approvers..."
                  : "Search and select approvers..."
              }
              noOptionsMessage={() =>
                isLoadingApprovers
                  ? "Loading..."
                  : "No approvers available"
              }
              data-testid="select-approvers"
            />
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          Task creator is not auto-added as approver unless explicitly selected
        </p>
        {errors.approvers && (
          <p className="text-red-500 text-xs mt-1 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors.approvers.message}
          </p>
        )}
      </div>

      {/* Approval Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-0 flex items-center">
          Approval Mode <span className="text-red-500">*</span>
          <div className="relative group ml-2">
            <Info className="w-4 h-4 text-gray-400 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-72 z-10">
              <div className="flex space-x-1 mt-1">
                <div>
                  <strong>Any One:</strong> First approver's decision is final
                </div>
                <div>
                  <strong>All Must Approve:</strong> Every approver must approve
                </div>
                <div>
                  <strong>Sequential:</strong> Approvers review in order
                </div>
              </div>
            </div>
          </div>
        </label>
        <div className="flex space-x-3">
          {approvalModeOptions.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                {...register("approvalMode")}
                type="radio"
                value={option.value}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                data-testid={`radio-approval-${option.value}`}
              />
              <span className="ml-2 text-sm text-gray-900">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sequential Order - Only show if Sequential mode */}
      {watchedApprovalMode === "sequential" && approverOrder.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-0">
            Approval Order
          </label>
          <div className="space-y-1.5 bg-gray-50 p-3 rounded-md border border-gray-200">
            {approverOrder.map((approver, index) => (
              <div
                key={approver.value}
                className="flex items-center justify-between bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm hover:shadow transition-all duration-150"
              >
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {approver.label}
                  </span>
                </div>

                <div className="flex items-center space-x-0.5">
                  <button
                    type="button"
                    onClick={() => moveApproverUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    data-testid={`button-move-up-${index}`}
                    title="Move Up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveApproverDown(index)}
                    disabled={index === approverOrder.length - 1}
                    className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    data-testid={`button-move-down-${index}`}
                    title="Move Down"
                  >
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Approvers will review in this order. Use arrows to reorder.
          </p>
        </div>
      )}

      {/* Auto-Approval */}
      <div>
        <div className="flex items-center space-x-3 mb-3">
          <input
            {...register("autoApproval")}
            type="checkbox"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            data-testid="checkbox-auto-approval"
          />
          <label className="text-sm font-medium text-gray-900">
            Enable Auto-Approval
          </label>
        </div>

        {watchedAutoApproval && (
          <div className="ml-7">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auto-approve after how many days past due date?
            </label>
            <input
              {...register("autoApprovalDays", {
                min: { value: 0, message: "Days must be 0 or greater" },
                valueAsNumber: true,
              })}
              type="number"
              min="0"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="3"
              data-testid="input-auto-approval-days"
            />
            <span className="ml-2 text-sm text-gray-500">days</span>
            <p className="text-xs text-gray-500 mt-1">
              Task will be auto-approved if no action is taken within this
              timeframe
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Approval Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-0">
            Approval Due Date <span className="text-red-500">*</span>
          </label>
          <input
            {...register("dueDate", {
              required: "Approval due date is required",
              validate: (value) => {
                const today = getTodayDate();
                return value >= today || "Approval due date must be today or later";
              },
            })}
            type="date"
            min={getTodayDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="input-due-date"
          />
          {errors.dueDate && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.dueDate.message}
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-0">
            Priority
          </label>
          <Controller
            name="priority"
            control={control}
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
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-0">
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
                isSearchable={isOrgUser}
                isDisabled={!isOrgUser}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select assignee"
                data-testid="select-assigned-to"
              />
            )}
          />
          <p className="text-xs text-gray-500 mt-1">
            Defaults to task creator/self
          </p>
          {errors.assignedTo && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.assignedTo.message}
            </p>
          )}
        </div>
      </div>

      {/* Collaborators */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-0 flex items-center">
          <Users className="w-4 h-4 mr-1" />
          Collaborators
          {isLoadingCollaborators && (
            <Loader2 className="w-4 h-4 animate-spin ml-2" />
          )}
        </label>
        <Controller
          name="collaborators"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              isMulti
              options={collaboratorOptions.filter(
                (opt) =>
                  opt.value !== "self" &&
                  !watchedApprovers?.some(
                    (approver) => approver.value === opt.value,
                  ),
              )}
              isLoading={isLoadingCollaborators}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder={
                isLoadingCollaborators
                  ? "Loading collaborators..."
                  : "Select collaborators for notifications..."
              }
              noOptionsMessage={() =>
                isLoadingCollaborators
                  ? "Loading..."
                  : "No collaborators available"
              }
              data-testid="select-collaborators"
            />
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          Collaborators will be notified but are not approvers
        </p>
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-0">
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
            />
            <span className="ml-2 text-sm text-gray-900">Private</span>
          </label>
          <label className="flex items-center">
            <input
              {...register("visibility")}
              type="radio"
              value="public"
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              data-testid="radio-public"
            />
            <span className="ml-2 text-sm text-gray-900">Public</span>
          </label>
        </div>
      </div>

      {/* Restrictions Information */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-900">
              Approval Task Restrictions
            </h4>
            <ul className="text-xs text-amber-700 mt-1 space-y-1">
              <li>• Approvers cannot be changed after first approval action</li>
              <li>
                • Cannot revert approval task back to normal task once created
              </li>
              <li>• Task creator must explicitly choose to be an approver</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
          data-testid="button-cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoadingApprovers || isLoadingCollaborators}
          className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          data-testid="button-save"
        >
          {(isLoadingApprovers || isLoadingCollaborators) ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Save Approval Task
        </button>
      </div>
    </form>
  );
};

export default ApprovalTaskForm;
