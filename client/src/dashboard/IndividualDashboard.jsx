import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  CheckSquare,
  Clock,
  AlertTriangle,
  Star,
  Users,
  Target,
  Bell,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
} from "lucide-react";
import CreateTask from "../pages/newComponents/CreateTask";
import QuickTaskWidget from "../components/quick-task/QuickTaskWidget";


/**
 * Individual User Dashboard - Personal workspace for individual users
 * Displays personal tasks, KPIs, calendar, and quick actions
 */
const IndividualDashboard = ({
  tasks = [],
  quickTasks = [],
  pinnedTasks = [],
  userStats = {},
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [quickTaskInput, setQuickTaskInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateTaskDrawer, setShowCreateTaskDrawer] = useState(false);

  // Get current user data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/verify"],
    retry: false,
  });

  // Fetch dashboard stats from API
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  // Fetch tasks from API
  const { data: apiTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/tasks"],
    retry: false,
  });

  // Use API data or fallback to passed tasks
  const currentTasks =
    apiTasks.length > 0 ? apiTasks : tasks.length > 0 ? tasks : [];

  // Use API dashboard stats or fallback to userStats
  const currentStats = dashboardStats || {
    totalTasks: userStats.totalTasks || 20,
    completedTasks: userStats.completedToday || 5,
    inProgressTasks: userStats.inProgressTasks || 8,
    overdueTasks: userStats.tasksPastDue || 2,
    upcomingDeadlines: userStats.upcomingDeadlines || 4,
    tasksByPriority: userStats.tasksByPriority || {
      low: 3,
      medium: 8,
      high: 6,
      urgent: 3,
    },
  };

  const samplePinnedTasks =
    pinnedTasks.length > 0
      ? pinnedTasks
      : [
        { id: 1, title: "Weekly planning session", priority: "high" },
        { id: 2, title: "Client feedback review", priority: "medium" },
        { id: 3, title: "Sprint retrospective", priority: "low" },
      ];

  const handleQuickTaskSubmit = () => {
    if (quickTaskInput.trim()) {
      console.log("Creating quick task:", quickTaskInput);
      setQuickTaskInput("");
    }
  };

  const handleCreateTask = () => {
    // Open Create Task drawer with regular task as default
    setShowCreateTaskDrawer(true);
  };

  const handleCreateTaskSubmit = (taskData) => {
    console.log("Task created from dashboard:", taskData);
    // Here you would typically call API to create the task
    setShowCreateTaskDrawer(false);
    // Optionally refresh tasks list or show success message
  };

  const handleCloseCreateTask = () => {
    setShowCreateTaskDrawer(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-700 bg-green-100";
      case "in_progress":
        return "text-blue-700 bg-blue-100";
      case "pending":
        return "text-gray-700 bg-gray-100";
      case "blocked":
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const filteredTasks = currentTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.tags &&
        task.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        ));
    const matchesFilter =
      selectedFilter === "all" || task.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || "User"}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your personal workspace and task overview
          </p>
        </div>
        <button
          onClick={handleCreateTask}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg flex items-center gap-2 transition-colors"
          data-testid="button-create-task"
        >
          <Plus size={18} />
          Create Task
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          className="bg-white p-4 rounded-lg shadow-sm border"
          data-testid="card-completed-today"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckSquare className="text-green-600" size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-xl font-bold text-gray-900">
                {currentStats.completedTasks}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-lg shadow-sm border"
          data-testid="card-completed-before-due"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Clock className="text-blue-600" size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-gray-600">Before Due Date</p>
              <p className="text-xl font-bold text-gray-900">
                {currentStats.totalTasks}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-lg shadow-sm border"
          data-testid="card-milestones"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Target className="text-purple-600" size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-gray-600">Milestones</p>
              <p className="text-xl font-bold text-gray-900">
                {currentStats.inProgressTasks}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-lg shadow-sm border"
          data-testid="card-collaborator-tasks"
        >
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Users className="text-orange-600" size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-gray-600">Collaborator</p>
              <p className="text-xl font-bold text-gray-900">
                {currentStats.upcomingDeadlines}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-lg shadow-sm border"
          data-testid="card-past-due"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-gray-600">Past Due</p>
              <p className="text-xl font-bold text-gray-900">
                {currentStats.overdueTasks}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-lg shadow-sm border"
          data-testid="card-approvals"
        >
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Bell className="text-yellow-600" size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm text-gray-600">Approvals</p>
              <p className="text-xl font-bold text-gray-900">
                {currentStats.tasksByPriority?.urgent || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Task & Pinned Tasks */}
        <div className="space-y-6">
          {/* Frozen Quick Task Tile */}
        <QuickTaskWidget />
            
          {/* Pinned Tasks */}
          <div
            className="bg-white p-6 rounded-lg shadow-sm border"
            data-testid="card-pinned-tasks"
          >
            <div className="flex items-center gap-2 mb-4">
              <Star className="text-yellow-500" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">
                Pinned Tasks
              </h2>
            </div>
            <div className="space-y-3">
              {samplePinnedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  data-testid={`pinned-task-${task.id}`}
                >
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column - Tasks Grid */}
        <div className="lg:col-span-2">
          <div
            className="h-full bg-white rounded-lg shadow-sm border"
            data-testid="card-tasks-grid"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  My Tasks
                </h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                  data-testid="button-toggle-filters"
                >
                  <Filter size={18} />
                </button>
              </div>

              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-testid="input-search-tasks"
                  />
                </div>

                {showFilters && (
                  <div className="flex gap-2 flex-wrap">
                    {["all", "pending", "in_progress", "completed"].map(
                      (filter) => (
                        <button
                          key={filter}
                          onClick={() => setSelectedFilter(filter)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedFilter === filter
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          data-testid={`filter-${filter}`}
                        >
                          {filter.replace("_", " ")}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50"
                      data-testid={`task-row-${task.id}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {task.title}
                              </span>
                              <div className="flex gap-1">
                                {task.isPastDue && (
                                  <Clock
                                    className="text-red-500"
                                    size={14}
                                    title="Past Due"
                                  />
                                )}
                                {task.isDueToday && (
                                  <Calendar
                                    className="text-orange-500"
                                    size={14}
                                    title="Due Today"
                                  />
                                )}
                                {task.hasSubtasks && (
                                  <CheckSquare
                                    className="text-blue-500"
                                    size={14}
                                    title="Has Subtasks"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 mt-1">
                              {task.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              )) || null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            className="text-gray-600 hover:text-blue-600 p-1 rounded"
                            data-testid={`button-edit-${task.id}`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="text-gray-600 hover:text-red-600 p-1 rounded"
                            data-testid={`button-delete-${task.id}`}
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                            data-testid={`button-more-${task.id}`}
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500 ">
                <CheckSquare className="mx-auto mb-2" size={48} />
                <p>No tasks found matching your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div
        className="bg-white rounded-lg shadow-sm border p-6"
        data-testid="card-calendar"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Task Calendar
        </h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Calendar className="mx-auto mb-2 text-gray-400" size={48} />
          <p className="text-gray-600">Calendar view coming soon</p>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your tasks by date with drag-and-drop functionality
          </p>
        </div>
      </div>

      {/* Create Task Drawer */}
      {showCreateTaskDrawer && (
        <div className="fixed inset-0 z-[100] overflow-hidden -top-[25px]">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleCloseCreateTask}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-teal-600 flex-shrink-0">
              <h2 className="text-lg font-medium text-white">
                Create New Task
              </h2>
              <button
                onClick={handleCloseCreateTask}
                className="text-gray-300 hover:text-white p-2"
                data-testid="button-close-create-task"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CreateTask
                onSubmit={handleCreateTaskSubmit}
                onClose={handleCloseCreateTask}
                initialTaskType="regular"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualDashboard;
