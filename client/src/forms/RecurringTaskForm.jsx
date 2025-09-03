import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../styles/quill-custom.css";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

// Recurrence Panel Component
const RecurrencePanel = ({ control, register, watch, setValue, errors }) => {
  const [previewDates, setPreviewDates] = useState([]);
  const [summary, setSummary] = useState("");

  const watchedPattern = watch("recurrence.patternType");
  const watchedRepeatEvery = watch("recurrence.repeatEvery");
  const watchedStartDate = watch("recurrence.startDate");
  const watchedStartTime = watch("recurrence.startTime");
  const watchedEndCondition = watch("recurrence.endCondition");
  const watchedWeekdays = watch("recurrence.weekdays");
  const watchedMonthDays = watch("recurrence.monthDays");
  const watchedYearMonths = watch("recurrence.yearMonths");

  // Pattern type options
  const patternOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "custom", label: "Custom (Ad-hoc Dates)" },
  ];

  // Weekday options
  const weekdayOptions = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  // Month options
  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // End condition options
  const endConditionOptions = [
    { value: "never", label: "Never ends" },
    { value: "after", label: "Ends after N occurrences" },
    { value: "by_date", label: "Ends by Date" },
  ];

  // Generate month day options (1-31)
  const monthDayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: (i + 1).toString(),
  }));

  // Update preview and summary when recurrence settings change
  useEffect(() => {
    generatePreviewAndSummary();
  }, [
    watchedPattern,
    watchedRepeatEvery,
    watchedStartDate,
    watchedStartTime,
    watchedEndCondition,
    watchedWeekdays,
    watchedMonthDays,
    watchedYearMonths,
  ]);

  const generatePreviewAndSummary = () => {
    if (!watchedPattern || !watchedStartDate) {
      setPreviewDates([]);
      setSummary("");
      return;
    }

    // Generate preview dates (simplified logic)
    const dates = [];
    const startDate = new Date(watchedStartDate);
    const repeatEvery = watchedRepeatEvery || 1;

    // Generate next 5 dates based on pattern
    for (let i = 0; i < 5; i++) {
      const nextDate = new Date(startDate);

      switch (watchedPattern?.value) {
        case "daily":
          nextDate.setDate(startDate.getDate() + i * repeatEvery);
          break;
        case "weekly":
          nextDate.setDate(startDate.getDate() + i * 7 * repeatEvery);
          break;
        case "monthly":
          nextDate.setMonth(startDate.getMonth() + i * repeatEvery);
          break;
        case "yearly":
          nextDate.setFullYear(startDate.getFullYear() + i * repeatEvery);
          break;
        default:
          continue;
      }

      dates.push(nextDate.toLocaleDateString());
    }

    setPreviewDates(dates);

    // Generate summary
    let summaryText = "";
    if (watchedPattern?.value && watchedStartDate) {
      const pattern = watchedPattern.label;
      const every = repeatEvery > 1 ? `every ${repeatEvery} ` : "every ";
      const time = watchedStartTime || "09:00";
      const startDateStr = new Date(watchedStartDate).toLocaleDateString();

      summaryText = `${pattern} - ${every}${pattern.toLowerCase()} at ${time}, starting ${startDateStr}`;

      if (watchedEndCondition?.value === "after") {
        summaryText += `, ends after ${watchedEndCondition.occurrences || "N"} occurrences`;
      } else if (watchedEndCondition?.value === "by_date") {
        summaryText += `, ends by ${watchedEndCondition.endDate || "end date"}`;
      } else {
        summaryText += ", never ends";
      }
    }

    setSummary(summaryText);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">🔁</span>
        <h3 className="text-lg font-semibold text-gray-900">
          Recurrence Settings
        </h3>
      </div>

      {/* Pattern Type */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Pattern Type <span className="text-red-500">*</span>
        </label>
        <Controller
          name="recurrence.patternType"
          control={control}
          rules={{ required: "Pattern type is required" }}
          render={({ field }) => (
            <Select
              {...field}
              options={patternOptions}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select pattern..."
              data-testid="select-pattern-type"
            />
          )}
        />
        {errors.recurrence?.patternType && (
          <p className="text-red-500 text-xs mt-1">
            {errors.recurrence.patternType.message}
          </p>
        )}
      </div>

      {/* Repeat Every */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Repeat Every <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center space-x-2">
          <input
            {...register("recurrence.repeatEvery", {
              required: "Repeat interval is required",
              min: { value: 1, message: "Must be at least 1" },
              valueAsNumber: true,
            })}
            type="number"
            min="1"
            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1"
            data-testid="input-repeat-every"
          />
          <span className="text-sm text-gray-600">
            {watchedPattern?.value || "period(s)"}
          </span>
        </div>
        {errors.recurrence?.repeatEvery && (
          <p className="text-red-500 text-xs mt-1">
            {errors.recurrence.repeatEvery.message}
          </p>
        )}
      </div>

      {/* Pattern-specific controls */}
      {watchedPattern?.value === "weekly" && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Days of Week <span className="text-red-500">*</span>
          </label>
          <Controller
            name="recurrence.weekdays"
            control={control}
            rules={{
              required: "At least one weekday is required for weekly pattern",
            }}
            render={({ field }) => (
              <Select
                {...field}
                isMulti
                options={weekdayOptions}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select days..."
                data-testid="select-weekdays"
              />
            )}
          />
          {errors.recurrence?.weekdays && (
            <p className="text-red-500 text-xs mt-1">
              {errors.recurrence.weekdays.message}
            </p>
          )}
        </div>
      )}

      {watchedPattern?.value === "monthly" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Monthly Mode <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  {...register('recurrence.monthlyMode')}
                  type="radio"
                  value="by_date"
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  data-testid="radio-monthly-by-date"
                />
                <span className="ml-2 text-sm text-gray-900">By Date(s)</span>
              </label>
              <label className="flex items-center">
                <input
                  {...register('recurrence.monthlyMode')}
                  type="radio"
                  value="by_position"
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  data-testid="radio-monthly-by-position"
                />
                <span className="ml-2 text-sm text-gray-900">By Position</span>
              </label>
              <label className="flex items-center">
                <input
                  {...register('recurrence.monthlyMode')}
                  type="radio"
                  value="specific_date"
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  data-testid="radio-monthly-specific-date"
                />
                <span className="ml-2 text-sm text-gray-900">Specific Date</span>
              </label>
            </div>
          </div>

          {/* By Date(s) mode */}
          {watch('recurrence.monthlyMode') === 'by_date' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day(s) of Month
              </label>
              <Controller
                name="recurrence.monthDays"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    isMulti
                    options={monthDayOptions}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select days (1-31)..."
                    data-testid="select-month-days"
                  />
                )}
              />
              <p className="text-xs text-gray-500 mt-1">
                e.g., 2nd and 9th day of month
              </p>
            </div>
          )}

          {/* By Position mode */}
          {watch('recurrence.monthlyMode') === 'by_position' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <Controller
                  name="recurrence.monthPosition"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={[
                        { value: 'first', label: 'First' },
                        { value: 'second', label: 'Second' },
                        { value: 'third', label: 'Third' },
                        { value: 'fourth', label: 'Fourth' },
                        { value: 'last', label: 'Last' }
                      ]}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select position..."
                      data-testid="select-month-position"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weekday
                </label>
                <Controller
                  name="recurrence.monthWeekday"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={weekdayOptions}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select weekday..."
                      data-testid="select-month-weekday"
                    />
                  )}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 col-span-2">
                e.g., 2nd Monday of each month
              </p>
            </div>
          )}

          {/* Specific Date mode */}
          {watch('recurrence.monthlyMode') === 'specific_date' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Date (Day of Month)
              </label>
              <input
                {...register('recurrence.specificDate', { 
                  min: { value: 1, message: 'Must be between 1-31' },
                  max: { value: 31, message: 'Must be between 1-31' },
                  valueAsNumber: true
                })}
                type="number"
                min="1"
                max="31"
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="15"
                data-testid="input-specific-date"
              />
              <p className="text-xs text-gray-500 mt-1">
                e.g., every 5th month on the 15th
              </p>
            </div>
          )}
        </div>
      )}

      {watchedPattern?.value === "yearly" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Month(s) <span className="text-red-500">*</span>
            </label>
            <Controller
              name="recurrence.yearMonths"
              control={control}
              rules={{
                required: "At least one month is required for yearly pattern",
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  options={monthOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select months..."
                  data-testid="select-year-months"
                />
              )}
            />
            {errors.recurrence?.yearMonths && (
              <p className="text-red-500 text-xs mt-1">
                {errors.recurrence.yearMonths.message}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day of Month
            </label>
            <input
              {...register('recurrence.yearDay', { 
                min: { value: 1, message: 'Must be between 1-31' },
                max: { value: 31, message: 'Must be between 1-31' },
                valueAsNumber: true
              })}
              type="number"
              min="1"
              max="31"
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1"
              data-testid="input-year-day"
            />
            <p className="text-xs text-gray-500 mt-1">
              Day of the selected month(s). Supports bi-yearly patterns.
            </p>
          </div>
        </div>
      )}

      {/* Custom Pattern (Ad-hoc Dates) */}
      {watchedPattern?.value === "custom" && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Custom Dates <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <input
              {...register('recurrence.customDates')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="input-custom-dates"
            />
            <p className="text-xs text-gray-500">
              Select explicit upcoming dates. This mode is mutually exclusive with other patterns.
            </p>
          </div>
        </div>
      )}

      {/* Start Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            {...register("recurrence.startDate", {
              required: "Start date is required",
              validate: (value) => {
                const today = getTodayDate();
                return value >= today || "Start date cannot be in the past";
              },
            })}
            type="date"
            min={getTodayDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="input-start-date"
          />
          {errors.recurrence?.startDate && (
            <p className="text-red-500 text-xs mt-1">
              {errors.recurrence.startDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Start Time
          </label>
          <input
            {...register("recurrence.startTime")}
            type="time"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            defaultValue="09:00"
            data-testid="input-start-time"
          />
        </div>
      </div>

      {/* End Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          End Condition <span className="text-red-500">*</span>
        </label>
        <Controller
          name="recurrence.endCondition"
          control={control}
          rules={{ required: "End condition is required" }}
          render={({ field }) => (
            <Select
              {...field}
              options={endConditionOptions}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select end condition..."
              data-testid="select-end-condition"
            />
          )}
        />
        {errors.recurrence?.endCondition && (
          <p className="text-red-500 text-xs mt-1">
            {errors.recurrence.endCondition.message}
          </p>
        )}

        {/* Conditional end condition inputs */}
        {watchedEndCondition?.value === "after" && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Occurrences
            </label>
            <input
              {...register("recurrence.occurrences", {
                required: "Number of occurrences is required",
                min: { value: 1, message: "Must be at least 1" },
                valueAsNumber: true,
              })}
              type="number"
              min="1"
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="12"
              data-testid="input-occurrences"
            />
            {errors.recurrence?.occurrences && (
              <p className="text-red-500 text-xs mt-1">
                {errors.recurrence.occurrences.message}
              </p>
            )}
          </div>
        )}

        {watchedEndCondition?.value === "by_date" && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              {...register("recurrence.endDate", {
                required: "End date is required",
                validate: (value) => {
                  const startDate = watchedStartDate;
                  return (
                    !startDate ||
                    value >= startDate ||
                    "End date must be after start date"
                  );
                },
              })}
              type="date"
              min={watchedStartDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="input-end-date"
            />
            {errors.recurrence?.endDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.recurrence.endDate.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
          <p className="text-sm text-gray-700">{summary}</p>
        </div>
      )}

      {/* Preview */}
      {previewDates.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Next 5 Dates
          </h4>
          <div className="flex flex-wrap gap-2">
            {previewDates.map((date, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {date}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Recurring Task Form Component
export const RecurringTaskForm = ({
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
      visibility: "private",
      tags: [],
      attachments: [],
      recurrence: {
        patternType: null,
        repeatEvery: 1,
        startDate: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endCondition: { value: "never", label: "Never ends" },
        weekdays: [],
        monthDays: [],
        yearMonths: [],
        occurrences: null,
        endDate: "",
      },
      ...defaultValues,
    },
  });

  const [taskNameLength, setTaskNameLength] = useState(0);
  const [attachmentSize, setAttachmentSize] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const watchedTaskName = watch("taskName");

  // Character counter for task name
  useEffect(() => {
    setTaskNameLength(watchedTaskName?.length || 0);
  }, [watchedTaskName]);

  // Priority options
  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Critical", label: "Critical" },
  ];

  // Assignment options (for org users)
  const assignmentOptions = isOrgUser
    ? [
        { value: "self", label: "Self" },
        { value: "john_doe", label: "John Doe" },
        { value: "jane_smith", label: "Jane Smith" },
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

  const onFormSubmit = (data) => {
    // Combine task and recurrence data
    const formData = {
      ...data,
      attachments: uploadedFiles,
      taskType: "recurring",
    };
    onSubmit(formData);
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
              className="custom-editor border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Describe your recurring task..."
            />
          )}
        />
      </div>

      {/* Assigned To - Single assignee only for recurring tasks */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
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
              placeholder="Select assignee..."
              data-testid="select-assigned-to"
            />
          )}
        />
        {errors.assignedTo && (
          <p className="text-red-500 text-xs mt-1">
            {errors.assignedTo.message}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Recurring tasks can only have one assignee
        </p>
      </div>

      {/* Priority */}
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
          <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>
        )}
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

      {/* Contributors */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Contributors
        </label>
        <Controller
          name="contributors"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              isMulti
              options={assignmentOptions.filter(opt => opt.value !== 'self')}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select contributors for visibility & notifications..."
              data-testid="select-contributors"
            />
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          Contributors will receive notifications and can view/comment on the task
        </p>
      </div>

      {/* Notes / Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Notes / Instructions
        </label>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <ReactQuill
              theme="snow"
              value={field.value}
              onChange={field.onChange}
              modules={quillModules}
              className="custom-editor"
              placeholder="Add any special notes or instructions for this recurring task..."
            />
          )}
        />
        <p className="text-xs text-gray-500 mt-1">
          Optional additional instructions or context for assignees
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

      {/* Recurrence Panel */}
      <RecurrencePanel
        control={control}
        register={register}
        watch={watch}
        setValue={setValue}
        errors={errors}
      />

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          data-testid="button-save"
        >
          Save Recurring Task
        </button>
      </div>
    </form>
  );
};

export default RecurringTaskForm;
