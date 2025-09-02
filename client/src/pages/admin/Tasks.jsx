import { useState } from "react";
import { TaskKanbanView } from "@/components/tasks/TaskKanbanView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, Kanban, Plus } from "lucide-react";
import CreateTask from "../../pages/newComponents/CreateTask";
import ApprovalTaskCreator from "../../pages/newComponents/ApprovalTaskCreator";
import AllTasks from "../../components/tasks/TaskTableView";

export default function Tasks() {
  const [activeView, setActiveView] = useState("table");
  const [showSnooze, setShowSnooze] = useState(false);
  const [showTaskTypeDropdown, setShowTaskTypeDropdown] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState("regular");
  const [showCreateTaskDrawer, setShowCreateTaskDrawer] = useState(false);
  const [showApprovalTaskModal, setShowApprovalTaskModal] = useState(false);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [calendarFilteredTasks, setCalendarFilteredTasks] = useState([]);
  const [tasks, setTasks] = useState([
    {
      id: 9,
      title: "Review quarterly sales report",
      assignee: "Finance Team",
      assigneeId: 8,
      status: "OPEN",
      priority: "High",
      dueDate: "2025-07-01",
      category: "Finance",
      progress: 0,
      subtaskCount: 0,
      collaborators: [],
      createdBy: "Current User",
      creatorId: 1,
    },
    {
      id: 10,
      title: "Client meeting preparation",
      assignee: "Current User",
      assigneeId: 1,
      status: "INPROGRESS",
      priority: "Medium",
      dueDate: "2025-07-01",
      category: "Meeting",
      progress: 40,
      subtaskCount: 2,
      collaborators: [3],
      createdBy: "Current User",
      creatorId: 1,
    },
    {
      id: 11,
      title: "Update marketing materials",
      assignee: "Marketing Team",
      assigneeId: 9,
      status: "OPEN",
      priority: "Medium",
      dueDate: "2025-07-01",
      category: "Marketing",
      progress: 0,
      subtaskCount: 0,
      collaborators: [],
      createdBy: "Current User",
      creatorId: 1,
    },
    {
      id: 12,
      title: "Server maintenance",
      assignee: "DevOps Team",
      assigneeId: 6,
      status: "OPEN",
      priority: "High",
      dueDate: "2025-07-03",
      category: "DevOps",
      progress: 0,
      subtaskCount: 0,
      collaborators: [],
      createdBy: "System",
      creatorId: 0,
    },
    {
      id: 13,
      title: "Team brainstorming session",
      assignee: "Current User",
      assigneeId: 1,
      status: "OPEN",
      priority: "Medium",
      dueDate: "2025-07-03",
      category: "Meeting",
      progress: 0,
      subtaskCount: 0,
      collaborators: [2, 3, 4],
      createdBy: "Current User",
      creatorId: 1,
    },
    {
      id: 14,
      title: "Draft project proposal",
      assignee: "Jane Smith",
      assigneeId: 3,
      status: "INPROGRESS",
      priority: "High",
      dueDate: "2025-07-10",
      category: "Documentation",
      progress: 30,
      subtaskCount: 0,
      collaborators: [1],
      createdBy: "Current User",
      creatorId: 1,
    },
    {
      id: 15,
      title: "Review competitor analysis",
      assignee: "Current User",
      assigneeId: 1,
      status: "OPEN",
      priority: "Medium",
      dueDate: "2025-07-10",
      category: "Research",
      progress: 0,
      subtaskCount: 0,
      collaborators: [],
      createdBy: "Jane Smith",
      creatorId: 3,
    },
    {
      id: 16,
      title: "Submit expense reports",
      assignee: "Current User",
      assigneeId: 1,
      status: "OPEN",
      priority: "Low",
      dueDate: "2025-07-20",
      category: "Finance",
      progress: 0,
      subtaskCount: 0,
      collaborators: [],
      createdBy: "Current User",
      creatorId: 1,
    },
    {
      id: 17,
      title: "Prepare training materials",
      assignee: "HR Team",
      assigneeId: 10,
      status: "OPEN",
      priority: "Medium",
      dueDate: "2025-07-25",
      category: "HR",
      progress: 0,
      subtaskCount: 0,
      collaborators: [],
      createdBy: "Current User",
      creatorId: 1,
    },
    {
      id: 18,
      title: "Onboard new team member",
      assignee: "HR Team",
      assigneeId: 10,
      status: "OPEN",
      priority: "High",
      dueDate: "2025-07-26",
      category: "HR",
      progress: 0,
      subtaskCount: 3,
      collaborators: [1],
      createdBy: "Current User",
      creatorId: 1,
    },
  ]);

  // Add this handler function
  const handleCalendarDateSelect = (date) => {
    if (!date) return;

    const dateStr = date.toISOString().split("T")[0];
    const filtered = tasks.filter((task) => task.dueDate === dateStr);

    setSelectedCalendarDate(date);
    setCalendarFilteredTasks(filtered);
  };
  const handleTaskTypeSelect = (taskType) => {
    setSelectedTaskType(taskType);
    setShowTaskTypeDropdown(false);

    if (taskType === "approval") {
      setShowApprovalTaskModal(true);
    } else {
      setShowCreateTaskDrawer(true);
    }
  };

  const handleCreateApprovalTask = (approvalTaskData) => {
    // Handle approval task creation logic here
    console.log("Approval task created:", approvalTaskData);
    setShowApprovalTaskModal(false);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-4 lg:py-2">
        {/* Modern Header */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-4 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Tasks Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Create, organize and track all your tasks efficiently
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSnooze(!showSnooze)}
                className={`inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  showSnooze
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                {showSnooze ? "Hide" : "Show"} Snoozed Tasks
              </button>

              <button
                className="inline-flex items-center px-4 py-2 bg-white/80 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 shadow-sm transition-all duration-200"
                onClick={() => setShowFullCalendar(true)}
              >
                <svg
                  className="w-4 h-4 mr-2"
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
              </button>
              <div className="relative">
                <button
                  className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-100"
                  onClick={() => handleTaskTypeSelect("regular")}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Task
                </button>
                <button
                  className="ml-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                  onClick={() => setShowTaskTypeDropdown(!showTaskTypeDropdown)}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {showTaskTypeDropdown && (
                  <>
                    <div
                      onClick={() => setShowTaskTypeDropdown(false)}
                      className="absolute right-0 top-full mt-2 w-72 z-50  bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 py-3"
                    >
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                        Task Types
                      </div>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 flex items-center gap-3"
                        onClick={() => handleTaskTypeSelect("regular")}
                      >
                        <span className="text-2xl">📋</span>
                        <div>
                          <div className="font-medium text-gray-900">
                            Simple Task
                          </div>
                          <div className="text-sm text-gray-500">
                            Standard one-time task
                          </div>
                        </div>
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 flex items-center gap-3"
                        onClick={() => handleTaskTypeSelect("recurring")}
                      >
                        <span className="text-2xl">🔄</span>
                        <div>
                          <div className="font-medium text-gray-900">
                            Recurring Task
                          </div>
                          <div className="text-sm text-gray-500">
                            Repeats on schedule
                          </div>
                        </div>
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 flex items-center gap-3"
                        onClick={() => handleTaskTypeSelect("milestone")}
                      >
                        <span className="text-2xl">🎯</span>
                        <div>
                          <div className="font-medium text-gray-900">
                            Milestone
                          </div>
                          <div className="text-sm text-gray-500">
                            Project checkpoint
                          </div>
                        </div>
                      </button>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 flex items-center gap-3"
                        onClick={() => handleTaskTypeSelect("approval")}
                      >
                        <span className="text-2xl">✅</span>
                        <div>
                          <div className="font-medium text-gray-900">
                            Approval Task
                          </div>
                          <div className="text-sm text-gray-500">
                            Requires approval workflow
                          </div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {showFullCalendar && (
          <FullPageCalendar
            tasks={tasks}
            onClose={() => {
              setShowFullCalendar(false);
              setSelectedCalendarDate(null);
              setCalendarFilteredTasks([]);
            }}
            onDateSelect={handleCalendarDateSelect}
            selectedDate={selectedCalendarDate}
            filteredTasks={calendarFilteredTasks}
          />
        )}
        {/* Create Task Drawer */}
        {showCreateTaskDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0">
            <div
              className="drawer-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCreateTaskDrawer(false)}
            ></div>
            <div
              className="absolute right-0 top-0 h-full bg-white/95 backdrop-blur-sm flex flex-col modal-animate-slide-right"
              style={{
                width: "min(90vw, 900px)",
                boxShadow: "-10px 0 50px rgba(0,0,0,0.2)",
                borderLeft: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div className="drawer-header">
                <h2 className="text-2xl font-bold text-white">
                  Create New Task
                </h2>
                <button
                  onClick={() => setShowCreateTaskDrawer(false)}
                  className="close-btn"
                >
                  <svg
                    className="w-6 h-6"
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
              <div className="drawer-body">
                <CreateTask
                  onClose={() => {
                    setShowCreateTaskDrawer(false);
                  }}
                  initialTaskType={selectedTaskType}
                />
              </div>
            </div>
          </div>
        )}

        {/* Approval Task Creator Modal */}
        {showApprovalTaskModal && (
          <div className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0">
            <div
              className="drawer-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowApprovalTaskModal(false)}
            ></div>
            <div
              className="absolute right-0 top-0 h-full bg-white/95 backdrop-blur-sm flex flex-col modal-animate-slide-right"
              style={{
                width: "min(90vw, 900px)",
                boxShadow: "-10px 0 50px rgba(0,0,0,0.2)",
                borderLeft: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div className="drawer-header">
                <h2 className="text-2xl font-bold text-white">
                  Create Approval Task
                </h2>
                <button
                  onClick={() => setShowApprovalTaskModal(false)}
                  className="close-btn"
                >
                  <svg
                    className="w-6 h-6"
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
              <div className="drawer-body">
                <ApprovalTaskCreator
                  onClose={() => {
                    setShowApprovalTaskModal(false);
                  }}
                  onSubmit={handleCreateApprovalTask}
                />
              </div>
            </div>
          </div>
        )}
        {/* View Tabs */}
        <div className="rounded-md border border-white/20">
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className="w-full"
          >
            <TabsList className="grid w-80 grid-cols-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1 shadow-inner">
              <TabsTrigger
                value="table"
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-lg text-sm py-3 px-4 rounded-lg font-medium transition-all duration-200"
              >
                <Table className="h-4 w-4" />
                <span>Table View</span>
              </TabsTrigger>
              <TabsTrigger
                value="kanban"
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-lg text-sm py-3 px-4 rounded-lg font-medium transition-all duration-200"
              >
                <Kanban className="h-4 w-4" />
                <span>Kanban View</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-6">
              <AllTasks />
            </TabsContent>

            <TabsContent value="kanban" className="mt-6">
              <TaskKanbanView />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function FullPageCalendar({
  tasks,
  onClose,
  onDateSelect,
  selectedDate,
  filteredTasks,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getTasksForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return tasks.filter((task) => task.dueDate === dateStr);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (date) => {
    if (date && onDateSelect) {
      onDateSelect(date);
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getStatusColor = (status) => {
    const colors = {
      OPEN: "#6c757d",
      INPROGRESS: "#3498db",
      DONE: "#28a745",
      ONHOLD: "#f39c12",
      CANCELLED: "#dc3545",
    };
    return colors[status] || "#6c757d";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: "#28a745",
      Medium: "#f39c12",
      High: "#fd7e14",
      Urgent: "#dc3545",
    };
    return colors[priority] || "#6c757d";
  };

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Task Calendar</h1>
            <p className="text-blue-100 mt-2">View and manage tasks by date</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg
              className="w-8 h-8"
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
      </div>

      <div className="flex h-full">
        {/* Calendar Section */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <h2 className="text-2xl font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>

              <button
                onClick={() => navigateMonth(1)}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0 bg-gray-50 border-b border-gray-200">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-gray-700 py-4 border-r border-gray-200 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-0">
              {getDaysInMonth(currentDate).map((date, index) => {
                const tasksForDate = getTasksForDate(date);
                const isToday =
                  date && date.toDateString() === new Date().toDateString();
                const isSelected =
                  selectedDate &&
                  date &&
                  date.toDateString() === selectedDate.toDateString();
                const hasTasks = tasksForDate.length > 0;
                const taskCount = tasksForDate.length;

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[120px] p-3 border-r border-b border-gray-200 last:border-r-0
                      ${
                        date
                          ? "bg-white hover:bg-gray-50 cursor-pointer"
                          : "bg-gray-50"
                      }
                      ${isToday ? "bg-blue-50 border-blue-200" : ""}
                      ${isSelected ? "bg-blue-100 border-blue-300" : ""}
                      transition-colors
                    `}
                    onClick={() => handleDateClick(date)}
                  >
                    {date && (
                      <>
                        <div className="flex justify-between items-start">
                          <div
                            className={`text-sm font-medium ${
                              isToday ? "text-blue-700" : "text-gray-900"
                            }`}
                          >
                            {date.getDate()}
                          </div>
                          {hasTasks && (
                            <div className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full">
                              {taskCount}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 mt-2">
                          {tasksForDate.slice(0, 2).map((task) => (
                            <div
                              key={task.id}
                              className="text-xs px-2 py-1 rounded-md cursor-pointer transition-colors truncate"
                              style={{
                                backgroundColor: `${getStatusColor(
                                  task.status
                                )}20`,
                                color: getStatusColor(task.status),
                                borderLeft: `3px solid ${getPriorityColor(
                                  task.priority
                                )}`,
                              }}
                              title={`${task.title} - ${task.status} (${task.priority})`}
                            >
                              {task.title}
                            </div>
                          ))}
                          {tasksForDate.length > 2 && (
                            <div className="text-xs text-gray-500 font-medium">
                              +{tasksForDate.length - 2} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Task Count</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <span>Selected Date</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-50 border border-blue-300 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-l-4 border-red-500 bg-gray-100 rounded"></div>
                <span>High Priority</span>
              </div>
            </div>
          </div>
        </div>

        {/* Task List Section */}
        {selectedDate && (
          <div className="w-1/3 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 pb-4 mb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Tasks for{" "}
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {filteredTasks.length} task
                {filteredTasks.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-3">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight">
                        {task.title}
                      </h4>
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getStatusColor(task.status)}20`,
                          color: getStatusColor(task.status),
                        }}
                      >
                        {task.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{task.assignee}</span>
                      <span
                        className="px-2 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: `${getPriorityColor(
                            task.priority
                          )}20`,
                          color: getPriorityColor(task.priority),
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-gray-600">
                      {task.category}
                    </div>

                    {task.progress > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-sm">No tasks scheduled for this date</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click on a date with highlighted tasks to view them
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
