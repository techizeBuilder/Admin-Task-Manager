import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import ReactQuill from "react-quill";
import "quill/dist/quill.snow.css";
import "../styles/quill-custom.css";
import Select from "react-select";
import axios from "axios";
import { Star, Calendar, Users, Info, AlertCircle } from "lucide-react";

const MilestoneTaskForm = ({
  user,
  onSubmit,
  isOrgUser,
  existingTasks = [], // Tasks available for linking
  collaboratorOptions = [], // Collaborators from parent component
  isLoadingCollaborators = false, // Loading state from parent
  drawer=false
}) => {
  const [taskNameLength, setTaskNameLength] = useState(0);
  
  // Use collaborators from props or fallback to local state
  const [localCollaboratorsList, setLocalCollaboratorsList] = useState([]);
  const [localIsLoadingCollaborators, setLocalIsLoadingCollaborators] = useState(false);
  
  // Determine which collaborators list to use
  const collaboratorsList = collaboratorOptions.length > 0 ? collaboratorOptions : localCollaboratorsList;
  const isCollaboratorsLoading = collaboratorOptions.length > 0 ? isLoadingCollaborators : localIsLoadingCollaborators;

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
      isMilestone: true,
      milestoneType: "standalone",
      linkedTasks: [],
      dueDate: new Date().toISOString().split("T")[0],
      assignedTo: isOrgUser
        ? null
        : { value: "self", label: user?.name || "Self" },
      priority: { value: "medium", label: "Medium" },
      visibility: "private",
      collaborators: [],
      status: "OPEN",
    },
  });

  const watchedTaskName = watch("taskName");
  const watchedMilestoneType = watch("milestoneType");
  const watchedLinkedTasks = watch("linkedTasks");

  useEffect(() => {
    setTaskNameLength(watchedTaskName?.length || 0);
  }, [watchedTaskName]);

  // Fetch collaborators list (fallback if not provided by parent)
  const fetchCollaborators = async () => {
    // Only fetch if not provided by parent component
    if (collaboratorOptions.length > 0) return;
    
    try {
      setLocalIsLoadingCollaborators(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/auth/collaborators", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (response.data.success) {
        const formattedCollaborators = response.data.data.map(collaborator => ({
          value: collaborator.id,
          label: `${collaborator.name} (${collaborator.designation || collaborator.role.join(", ")})`,
          email: collaborator.email,
          role: collaborator.role,
          department: collaborator.department
        }));
        setLocalCollaboratorsList(formattedCollaborators);
      }
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      setLocalCollaboratorsList([]);
    } finally {
      setLocalIsLoadingCollaborators(false);
    }
  };

  // Fetch collaborators when component mounts (only if not provided by parent)
  useEffect(() => {
    if (collaboratorOptions.length === 0) {
      fetchCollaborators();
    }
  }, [collaboratorOptions]);

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

  // Assignment options (for org users) - Build from collaboratorOptions
  const assignmentOptions = isOrgUser
    ? [
        { value: "self", label: "Self" },
      ...collaboratorsList,
      ]
    : [{ value: "self", label: "Self" }];

  // Debug logging
  console.log('MilestoneTaskForm - Assignment Debug:', {
    isOrgUser,
    collaboratorOptionsCount: collaboratorsList.length,
    collaboratorsList,
    assignmentOptions,
    isCollaboratorsLoading
  });

  // Filter tasks to exclude milestones for linking
  const availableTasksForLinking = existingTasks.filter(
    (task) => task.taskType !== "milestone" && task.id !== "current", // Prevent self-linking
  );

  // Calculate latest due date from linked tasks
  const getLatestDueDate = (linkedTasks) => {
    if (!linkedTasks || linkedTasks.length === 0) return getTodayDate();

    const dueDates = linkedTasks
      .map((task) => task.dueDate)
      .filter((date) => date)
      .sort((a, b) => new Date(b) - new Date(a));

    return dueDates[0] || getTodayDate();
  };

  // Update due date when linked tasks change
  useEffect(() => {
    if (watchedMilestoneType === "linked" && watchedLinkedTasks?.length > 0) {
      const latestDate = getLatestDueDate(watchedLinkedTasks);
      setValue("dueDate", latestDate);
    }
  }, [watchedLinkedTasks, watchedMilestoneType, setValue]);

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
    // Map form data to milestone API schema
    const formData = {
      title: data.taskName, // Map taskName to title
      description: data.description || "",
      assignedTo: data.assignedTo?.value || data.assignedTo?.id || data.assignedTo,
      priority: data.priority?.value || data.priority?.label || data.priority || "medium",
      dueDate: data.dueDate,
      visibility: data.visibility || "private",
      collaborators: data.collaborators ? data.collaborators.map(c => c.value || c.id || c) : [],
      linkedTasks: data.linkedTasks ? data.linkedTasks.map(task => task.value || task.id || task) : [],
      milestoneType: data.milestoneType || "standalone",
      taskType: "milestone",
      isMilestone: true,
    };

    console.log("MilestoneTaskForm submitting:", formData);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Header with Milestone Icon */}
      {/* <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
        <Star className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900">Milestone Task</h3>
        <div className="relative group">
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-10">
            Milestones cannot have subtasks, cannot be recurring, and cannot
            link to other milestones
          </div>
        </div>
      </div> */}

      {/* Milestone Type */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Milestone Type <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              {...register("milestoneType")}
              type="radio"
              value="standalone"
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              data-testid="radio-milestone-standalone"
            />
            <span className="ml-2 text-sm text-gray-900">Standalone</span>
          </label>
          <label className="flex items-center">
            <input
              {...register("milestoneType")}
              type="radio"
              value="linked"
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              data-testid="radio-milestone-linked"
            />
            <span className="ml-2 text-sm text-gray-900">Linked</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Standalone milestones are independent. Linked milestones depend on
          other tasks.
        </p>
      </div>

      {/* Task Name */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Milestone Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            {...register("taskName", {
              required: "Milestone name is required",
              maxLength: {
                value: 80,
                message: "Milestone name cannot exceed 80 characters",
              },
            })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter milestone name..."
            data-testid="input-milestone-name"
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
        <label className="block text-sm font-medium text-gray-900 mb-1">
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
              placeholder="Describe your milestone..."
            />
          )}
        />
      </div>

      {/* Linked Tasks - Only show if milestone type is 'linked' */}
      {watchedMilestoneType === "linked" && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Link to Tasks/Sub-tasks <span className="text-red-500">*</span>
          </label>
          <Controller
            name="linkedTasks"
            control={control}
            rules={{
              validate: (value) => {
                if (
                  watchedMilestoneType === "linked" &&
                  (!value || value.length === 0)
                ) {
                  return "Please select at least one task to link";
                }
                return true;
              },
            }}
            render={({ field }) => (
              <Select
                {...field}
                isMulti
                options={availableTasksForLinking.map((task) => ({
                  value: task.id,
                  label: task.name,
                  dueDate: task.dueDate,
                }))}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Search and select tasks..."
                data-testid="select-linked-tasks"
              />
            )}
          />
          <p className="text-xs text-gray-500 mt-1">
            Cannot link to other milestones. Due date will default to latest
            linked task date.
          </p>
          {errors.linkedTasks && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.linkedTasks.message}
            </p>
          )}
        </div>
      )}

      <div className={`grid ${!drawer ? 'grid-cols-4' : 'grid-cols-2'} gap-4`}>
        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
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
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="input-due-date"
          />
          {watchedMilestoneType === "linked" && (
            <p className="text-xs text-gray-500 mt-1">
              Automatically set to latest due date among linked tasks
            </p>
          )}
          {errors.dueDate && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.dueDate.message}
            </p>
          )}
        </div>

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
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
          {errors.assignedTo && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.assignedTo.message}
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
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
             {/* Collaborators */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-0 flex items-center">
          <Users className="w-4 h-4 mr-1" />
          Collaborators
        </label>
        <Controller
          name="collaborators"
          control={control}
          
          render={({ field }) => (
            <Select
              {...field}
              isMulti
              options={collaboratorsList}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder={isCollaboratorsLoading ? "Loading collaborators..." : "Select collaborators..."}
              isLoading={isCollaboratorsLoading}
              isDisabled={isCollaboratorsLoading}
              data-testid="select-collaborators"
              
              
            />
          )}
        />
        {/* <p className="text-xs text-gray-500 mt-1">
          Collaborators will be notified when milestone is achieved
        </p> */}
      </div>
      </div>


      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
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

 

      {/* Status Information */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Status Handling
            </h4>
            <p className="text-xs text-blue-700 mt-1">
              Default status is "Not Started". Milestone cannot be marked as
              achieved until status is "Ready to Mark".
            </p>
          </div>
        </div>
      </div> */}

      {/* Restrictions Information */}
      {/* <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-900">
              Milestone Restrictions
            </h4>
            <ul className="text-xs text-amber-700 mt-1 space-y-1">
              <li>• No subtasks allowed under milestone</li>
              <li>• Cannot link milestone to another milestone</li>
              <li>• Milestone cannot be recurring</li>
            </ul>
          </div>
        </div>
      </div> */}

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
          className="px-6 py-2 bg-gradient-to-r from-[#ef4444] via-[#dc2626] to-[#b91c1c] text-white hover:from-[#f87171] hover:via-[#ef4444] hover:to-[#991b1b] rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
          data-testid="button-save"
        >
          <Star className="w-4 h-4 mr-2" />
          Save Milestone
        </button>

      </div>
    </form>
  );
};

export default MilestoneTaskForm;
