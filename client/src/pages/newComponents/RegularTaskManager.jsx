import React, { useState, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { createPortal } from "react-dom";
import {
  Plus,
  Target,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Edit3,
  Share2,
  X,
  File,
  Tag,
  Paperclip,
  MoreVerticalIcon,
  Play,
  Trash2
} from "lucide-react";
import { apiClient } from '../../utils/apiClient';
import { RegularTaskIcon } from "../../components/common/TaskIcons";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
// THEME: Regular Task uses teal; Milestone uses purple
const RT = {
  // base
  primary: "teal",
  // color utility classes
  btn: "bg-teal-600 hover:bg-teal-700 text-white",
  chip: {
    primary: "bg-teal-100 text-teal-800 border border-teal-200",
  },
  icon: "text-teal-600",
  panelHeader: "border-b border-gray-200",
  headerBg: "bg-white",
  headerBorder: "border-b border-gray-200",
};

// Helpers
const getStatusColor = (status) => {
  const colors = {
    not_started: "bg-gray-100 text-gray-800 border-gray-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getPriorityColor = (priority) => {
  const colors = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    critical: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[priority] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getStatusIcon = (status) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "in_progress":
      return <Clock className="h-4 w-4 text-blue-600" />;
    case "overdue":
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

// Auto due date based on priority (can be tweaked/plugged to backend logic)
const dueDateFromPriority = (priority) => {
  const base = new Date();
  const addDays = (d) => {
    const dt = new Date(base);
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().slice(0, 10);
  };
  switch (priority) {
    case "low":
      return addDays(7);
    case "medium":
      return addDays(3);
    case "high":
      return addDays(1);
    case "critical":
      return addDays(0);
    default:
      return addDays(7);
  }
};

export default function RegularTaskManager() {
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch regular tasks from API
  const { data: apiResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['regular-tasks', currentPage, pageLimit, statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageLimit.toString(),
      });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      const response = await apiClient.get(`/api/tasks/filter/regular?${params.toString()}`);
      return response;
    },
    retry: 1,
    staleTime: 30000,
  });

  // Transform API data to match component expectations
  const transformApiTask = (apiTask) => ({
    id: apiTask._id,
    taskName: apiTask.title,
    description: apiTask.description,
    assignedTo: typeof apiTask.assignedTo === 'object' && apiTask.assignedTo !== null
      ? (apiTask.assignedTo.name || apiTask.assignedTo.username || apiTask.assignedTo.email || 'User')
      : (apiTask.assignedTo || 'Self'),
    priority: apiTask.priority,
    dueDate: apiTask.dueDate,
    visibility: apiTask.visibility,
    labels: apiTask.tags || [],
    attachments: apiTask.attachments || [],
    status: apiTask.status,
    taskType: apiTask.taskType || 'regular',
    progress: apiTask.progress || 0,
  });

  // Get tasks from API or fallback to empty
  const tasksArray = apiResponse?.data?.tasks || apiResponse?.data?.data?.tasks || [];
  const tasks = tasksArray.map(transformApiTask) || [];
  const pagination = apiResponse?.data?.pagination || apiResponse?.data?.data?.pagination || {};





  // Form state
  const [form, setForm] = useState({
    taskName: "",
    description: "",
    assignedTo: "Self", // default Self
    priority: "low", // default Low
    dueDate: dueDateFromPriority("low"), // auto-filled
    visibility: "private", // default Private
    labels: [],
    labelInput: "",
    attachments: [],  
    taskType: "simple", // default Simple
    // Advanced
    referenceProcess: "",
    customForm: "",
    dependencies: [],
  });
  const [attachmentsBytes, setAttachmentsBytes] = useState(0);
  const maxBytes = 5 * 1024 * 1024; // 5MB

  const resetForm = () => {
    setForm({
      taskName: "",
      description: "",
      assignedTo: "Self",
      priority: "low",
      dueDate: dueDateFromPriority("low"),
      visibility: "private",
      labels: [],
      labelInput: "",
      attachments: [],
      taskType: "simple",
      referenceProcess: "",
      customForm: "",
      dependencies: [],
    });
    setAttachmentsBytes(0);
  };


  // Filtering (API already filters, but keep for local fallback)
  const filteredTasks = tasks;


  // Stats (calculate from tasks)
  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    notStarted: tasks.filter((t) => t.status === "not_started").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  }), [tasks]);

  // Form handlers
  const onPriorityChange = (priority) => {
    setForm((f) => ({
      ...f,
      priority,
      dueDate: dueDateFromPriority(priority), // auto-set; user can edit later
    }));
  };

  const onLabelsKeyDown = (e) => {
    if (e.key === "Enter" && form.labelInput.trim()) {
      e.preventDefault();
      const val = form.labelInput.trim();
      if (!form.labels.includes(val)) {
        setForm((f) => ({ ...f, labels: [...f.labels, val], labelInput: "" }));
      } else {
        setForm((f) => ({ ...f, labelInput: "" }));
      }
    }
  };

  const removeLabel = (label) => {
    setForm((f) => ({ ...f, labels: f.labels.filter((l) => l !== label) }));
  };

  const onFilesSelected = (files) => {
    const arr = Array.from(files);
    const total = arr.reduce((sum, f) => sum + f.size, 0);
    if (total > maxBytes) {
      alert("Attachments exceed 5 MB total limit.");
      return;
    }
    setForm((f) => ({ ...f, attachments: arr }));
    setAttachmentsBytes(total);
  };

  const validateForm = () => {
    if (!form.taskName.trim()) return "Task Name is required.";
    if (form.taskName.length > 20) return "Task Name must be <= 20 characters.";
    if (!form.assignedTo) return "Assigned To is required.";
    if (!form.priority) return "Priority is required.";
    if (!form.dueDate) return "Due Date is required.";
    if (!form.taskType) return "Task Type is required.";
    if (attachmentsBytes > maxBytes) return "Attachments exceed 5 MB total limit.";
    return null;
    // Visibility rules (solo vs org) can be applied here if needed.
  };

  const onSave = () => {
    const err = validateForm();
    if (err) {
      alert(err);
      return;
    }
    const newTask = {
      id: Date.now(),
      taskName: form.taskName.trim(),
      description: form.description,
      assignedTo: form.assignedTo,
      priority: form.priority,
      dueDate: form.dueDate,
      visibility: form.visibility,
      labels: form.labels,
      attachments: form.attachments.map((f) => ({ name: f.name, size: f.size })),
      status: "not_started",
      taskType: form.taskType,
      progress: 0,
      // Advanced (stored for future use)
      referenceProcess: form.referenceProcess,
      customForm: form.customForm,
      dependencies: form.dependencies,
    };
    setTasks((prev) => [newTask, ...prev]);

    setShowAdvanced(false);
    resetForm();
  };

  // Loading state
  if (isLoading && !tasks.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading regular tasks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !tasks.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading regular tasks: {error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`${RT.headerBg} ${RT.headerBorder}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-teal-600 flex items-center justify-center">
                <RegularTaskIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Regular Task</h1>
                <p className="text-sm text-gray-600">Track and manage simple tasks</p>
              </div>
            </div>
            <Link href="/tasks/create?type=regular">
            <button

              className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${RT.btn}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Regular Task
            </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Not Started</p>
                <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters and View Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm text-teal-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm text-teal-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                {/* Card Header */}
                <div className={`p-6 ${RT.panelHeader}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
                        <File className={`h-5 w-5 ${RT.icon}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{task.taskName}</h3>
                        <p className="text-sm text-gray-600 capitalize">{task.taskType}</p>
                      </div>
                    </div>
                   {/* Actions - now in 3-dot menu */}
        <DropdownMenu className='bg-white'>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVerticalIcon className="h-5 w-5 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-white">
        
            <DropdownMenuItem onClick={() => handleEdit(task.id)}>
              <Edit3 className="h-4 w-4 mr-2 text-gray-600" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(task.id)}>
              <Trash2 className="h-4 w-4 mr-2 text-red-600" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{task.description}</p>

                  {/* Status and Priority */}
                  <div className="flex items-center flex-wrap gap-2 mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {getStatusIcon(task.status)}
                      <span className="ml-1">{task.status.replace("_", " ").toUpperCase()}</span>
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${RT.chip.primary}`}>
                      <File className="h-3 w-3 mr-1" />
                      REGULAR
                    </span>
                  </div>

                  {/* Progress (derived/optional) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-500">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{task.assignedTo}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {task.visibility === "public" ? (
                        <Eye className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-gray-600 capitalize">{task.visibility}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        {task.attachments?.length || 0} Attachment
                        {task.attachments?.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  {/* Labels */}
                  {task.labels?.length ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Labels</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {task.labels.map((label, index) => (
                          <span
                            key={`${label}-${index}`}
                            className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                          >
                            <Tag className="h-3 w-3 mr-1 text-gray-500" />
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      
                    </div>
                    <button className="inline-flex items-center px-4 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center">
                        <File className="h-6 w-6 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{task.taskName}</h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {getStatusIcon(task.status)}
                            <span className="ml-1">{task.status.replace("_", " ").toUpperCase()}</span>
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                            {task.taskType.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{task.assignedTo}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            {task.visibility === "public" ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                            <span className="capitalize">{task.visibility}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Paperclip className="h-4 w-4" />
                            <span>{task.attachments?.length || 0} file(s)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{task.progress}%</div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${task.progress}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit3 className="h-4 w-4 text-gray-500" />
                        </button>
                     
                        <button className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No regular tasks found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first regular task.</p>
             <Link href="/tasks/create?type=regular">
            <button
              className={`inline-flex items-center px-4 py-2 font-medium rounded-lg transition-colors ${RT.btn}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Regular Task
            </button></Link>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalTasks} total tasks)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                if (pageNum > pagination.totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === pagination.currentPage
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

   
    </div>
  );
}