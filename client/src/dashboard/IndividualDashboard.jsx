import React, { useState, useMemo } from "react";
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
  Download,   // added
  ListChecks, // added
} from "lucide-react";
import CreateTask from "../pages/newComponents/CreateTask";
import QuickTaskWidget from "../components/quick-task/QuickTaskWidget";
import ReactECharts from "echarts-for-react"; // added
import { Button } from "../components/ui/button";

// --- DEMO MOCK DATA HELPERS ---
const randPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
const toISO = (d) => new Date(d).toISOString();

function generateMockTasks() {
  const titles = [
    "Fix login redirect",
    "Implement role-based access",
    "Update sprint backlog",
    "Prepare weekly status",
    "Refactor dashboard cards",
    "QA: task creation flow",
    "Add CSV export for reports",
    "Page performance audit",
    "Client feedback review",
    "Design review: reporting",
    "Migrate icons to Lucide",
    "E2E tests for tasks",
    "Cleanup feature flags",
    "Improve error handling",
    "Update onboarding docs",
    "Recurring: Daily standup",
    "Recurring: Weekly planning",
  ];
  const tagsPool = ["frontend", "backend", "bug", "feature", "docs", "ops"];
  const priorities = ["low", "medium", "high", "urgent"];
  const statuses = ["pending", "in_progress", "completed", "blocked"];

  const now = new Date();
  const tasks = [];

  // Completed tasks across last 7 days (to populate the chart)
  for (let i = 0; i < 8; i++) {
    const completedOn = addDays(now, -randPick([0, 1, 2, 3, 4, 5, 6]));
    const createdOn = addDays(completedOn, -randPick([1, 2, 3, 4]));
    const dueOn = addDays(createdOn, randPick([1, 2, 3, 4, 5]));
    const onTime = completedOn <= dueOn;
    tasks.push({
      id: `c-${i + 1}`,
      title: randPick(titles),
      description: "Task completed as part of recent sprint.",
      status: "completed",
      priority: randPick(priorities),
      createdAt: toISO(createdOn),
      updatedAt: toISO(completedOn),
      completedAt: toISO(completedOn),
      dueDate: toISO(dueOn),
      isPastDue: !onTime,
      isDueToday:
        new Date(dueOn).toDateString() === new Date(now).toDateString(),
      hasSubtasks: Math.random() > 0.5,
      tags: Array.from(
        new Set([randPick(tagsPool), randPick(tagsPool)]).values()
      ),
    });
  }

  // In progress + pending + blocked (mix of due dates, some overdue)
  for (let i = 0; i < 14; i++) {
    const createdOn = addDays(now, -randPick([1, 2, 3, 4, 5, 6, 7, 10]));
    const dueIn = randPick([-3, -2, -1, 0, 1, 2, 3, 4, 5, 7]);
    const dueOn = addDays(now, dueIn);
    const st = randPick(statuses.filter((s) => s !== "completed"));
    tasks.push({
      id: `o-${i + 1}`,
      title: randPick(titles),
      description: "Ongoing work item.",
      status: st,
      priority: randPick(priorities),
      createdAt: toISO(createdOn),
      updatedAt: toISO(addDays(createdOn, randPick([0, 1, 2, 3]))),
      dueDate: toISO(dueOn),
      isPastDue: dueOn < now && st !== "completed",
      isDueToday: dueOn.toDateString() === now.toDateString(),
      hasSubtasks: Math.random() > 0.5,
      tags: Array.from(
        new Set([randPick(tagsPool), randPick(tagsPool)]).values()
      ),
      // Mark a few as recurring
      isRecurring: Math.random() > 0.8,
      recurringInterval: Math.random() > 0.5 ? "weekly" : "daily",
    });
  }

  // Ensure a couple of clearly overdue high priority tasks
  tasks.push(
    {
      id: "o-over-1",
      title: "Resolve production error",
      description: "Critical fix required.",
      status: "in_progress",
      priority: "urgent",
      createdAt: toISO(addDays(now, -5)),
      updatedAt: toISO(addDays(now, -1)),
      dueDate: toISO(addDays(now, -2)),
      isPastDue: true,
      isDueToday: false,
      hasSubtasks: true,
      tags: ["backend", "ops", "bug"],
    },
    {
      id: "o-over-2",
      title: "Finalize client SOW",
      description: "Contract needs final pass.",
      status: "pending",
      priority: "high",
      createdAt: toISO(addDays(now, -7)),
      updatedAt: toISO(addDays(now, -3)),
      dueDate: toISO(addDays(now, -1)),
      isPastDue: true,
      isDueToday: false,
      hasSubtasks: false,
      tags: ["docs"],
    }
  );

  // Recurring examples visible in widget
  tasks.push(
    {
      id: "r-standup",
      title: "Daily standup",
      description: "Quick team sync.",
      status: "pending",
      priority: "low",
      createdAt: toISO(addDays(now, -10)),
      updatedAt: toISO(addDays(now, -1)),
      dueDate: toISO(now),
      isPastDue: false,
      isDueToday: true,
      hasSubtasks: false,
      tags: ["ops"],
      isRecurring: true,
      recurringInterval: "daily",
    },
    {
      id: "r-planning",
      title: "Weekly planning",
      description: "Plan the week.",
      status: "pending",
      priority: "medium",
      createdAt: toISO(addDays(now, -14)),
      updatedAt: toISO(addDays(now, -2)),
      dueDate: toISO(addDays(now, 1)),
      isPastDue: false,
      isDueToday: false,
      hasSubtasks: false,
      tags: ["ops", "docs"],
      isRecurring: true,
      recurringInterval: "weekly",
    }
  );

  return tasks;
}

function computeStatsFromTasks(tasks) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const in7 = addDays(now, 7);

  const statusOf = (s) => (s || "").toLowerCase();

  const completedToday = tasks.filter(
    (t) =>
      statusOf(t.status) === "completed" &&
      t.completedAt &&
      new Date(t.completedAt) >= startOfToday
  ).length;

  const inProgress = tasks.filter((t) =>
    ["in_progress", "in-progress", "doing"].includes(statusOf(t.status))
  ).length;

  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && statusOf(t.status) !== "completed"
  ).length;

  const upcoming = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) >= now &&
      new Date(t.dueDate) <= in7 &&
      statusOf(t.status) !== "completed"
  ).length;

  const onTimeCompleted = tasks.filter((t) => {
    if (statusOf(t.status) !== "completed" || !t.completedAt || !t.dueDate) return false;
    return new Date(t.completedAt) <= new Date(t.dueDate);
  }).length;

  const byPriority = tasks.reduce(
    (acc, t) => {
      const p = (t.priority || "low").toLowerCase();
      if (acc[p] == null) acc[p] = 0;
      acc[p] += 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0, urgent: 0 }
  );

  return {
    totalTasks: onTimeCompleted, // mapped to "Before Due Date" card label
    completedTasks: completedToday,
    inProgressTasks: inProgress,
    overdueTasks: overdue,
    upcomingDeadlines: upcoming,
    tasksByPriority: byPriority,
  };
}
// --- END DEMO MOCK DATA HELPERS ---

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
  const [recurringDone, setRecurringDone] = useState({});

  // Get current user data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/verify"],
    retry: false,
  });

  // Fetch dashboard stats from API
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  // Fetch tasks from API
  const { data: apiTasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
    retry: false,
  });

  // Use API data or fallback to passed tasks
   const demoTasks = useMemo(() => generateMockTasks(), []);
 const currentTasks =
   apiTasks.length > 0 ? apiTasks : tasks.length > 0 ? tasks : demoTasks;

  // Use API dashboard stats or fallback to userStats (mock)

 // Use API stats -> provided userStats -> compute from currentTasks
 const computedStats = useMemo(() => computeStatsFromTasks(currentTasks), [currentTasks]);
  const currentStats =
    dashboardStats ||
    (userStats && Object.keys(userStats).length ? userStats : computedStats);
  // Derived metrics for Task Health and Overdue
  const now = new Date();
  const statusOf = (s) => (s || "").toLowerCase();
  const openCount = currentTasks.filter((t) =>
    ["pending", "todo", "open"].includes(statusOf(t.status))
  ).length;
  const inProgressCount = currentTasks.filter((t) =>
    ["in_progress", "in-progress", "doing"].includes(statusOf(t.status))
  ).length;
  const completedCount = currentTasks.filter(
    (t) => statusOf(t.status) === "completed"
  ).length;
  const overdueCount = currentTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && statusOf(t.status) !== "completed"
  ).length;

  // Completion Trend: last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const dayKey = (d) => d.toISOString().slice(0, 10);
  const dayLabel = (d) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const dayMap = Object.fromEntries(last7.map((d) => [dayKey(d), 0]));

  currentTasks.forEach((t) => {
    if (statusOf(t.status) === "completed") {
      const date = t.completedAt || t.updatedAt || t.dueDate || t.createdAt;
      if (date) {
        const k = dayKey(new Date(date));
        if (k in dayMap) dayMap[k] += 1;
      }
    }
  });

  const trendLabels = last7.map((d) => dayLabel(d));
  const trendCounts = last7.map((d) => dayMap[dayKey(d)] || 0);

  const completionTrendOptions = {
    color: ["#2563eb"],
    tooltip: { trigger: "axis" },
    grid: { left: 24, right: 12, top: 24, bottom: 24 },
    xAxis: {
      type: "category",
      data: trendLabels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: "#e5e7eb" } },
      axisLabel: { color: "#6b7280" },
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: "#e5e7eb" } },
      axisLabel: { color: "#6b7280" },
    },
    series: [
      {
        type: "line",
        data: trendCounts,
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        areaStyle: { color: "rgba(37,99,235,0.1)" },
      },
    ],
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
    setShowCreateTaskDrawer(true);
  };

  const handleCreateTaskSubmit = (taskData) => {
    console.log("Task created from dashboard:", taskData);
    setShowCreateTaskDrawer(false);
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

  // Recurring tasks (fallback if none on tasks)
  const defaultRecurring = [
    { id: "r1", title: "Daily standup", frequency: "daily" },
    { id: "r2", title: "Weekly planning", frequency: "weekly" },
    { id: "r3", title: "Inbox zero", frequency: "daily" },
  ];
  const recurringTasks =
    currentTasks
      .filter((t) => t.isRecurring || t.recurringInterval)
      .map((t) => ({
        id: t.id,
        title: t.title,
        frequency: t.recurringInterval || "recurring",
      })) || [];
  const recurringItems =
    recurringTasks.length > 0 ? recurringTasks : defaultRecurring;

  const toggleRecurring = (id) =>
    setRecurringDone((s) => ({ ...s, [id]: !s[id] }));

  const handleViewMyTasks = () => {
    document.getElementById("my-tasks")?.scrollIntoView({ behavior: "smooth" });
    setShowFilters(true);
  };

  const exportMyReport = () => {
    const rows = [];
    rows.push(["Metric", "Value"]);
    rows.push(["Open", openCount]);
    rows.push(["In Progress", inProgressCount]);
    rows.push(["Completed", completedCount]);
    rows.push(["Overdue", overdueCount]);
    rows.push([]);
    rows.push(["Last 7 days", ...trendLabels]);
    rows.push(["Completed", ...trendCounts]);
    rows.push([]);
    rows.push(["Task ID", "Title", "Status", "Priority", "Due Date"]);
    currentTasks.forEach((t) =>
      rows.push([
        t.id,
        t.title,
        t.status,
        t.priority,
        t.dueDate ? new Date(t.dueDate).toISOString() : "",
      ])
    );
    const csv = rows
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-task-report.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const filteredTasks = currentTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.tags &&
        task.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    const matchesFilter =
      selectedFilter === "all"
        ? true
        : selectedFilter === "overdue"
        ? task.dueDate &&
          new Date(task.dueDate) < now &&
          statusOf(task.status) !== "completed"
        : statusOf(task.status) === selectedFilter;
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

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleViewMyTasks}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg flex items-center gap-2"
        >
          <ListChecks size={16} />
          View My Tasks
        </button>
        <button
          onClick={exportMyReport}
          className="px-3 py-2 bg-white hover:bg-gray-50 border rounded-lg text-gray-800 flex items-center gap-2"
        >
          <Download size={16} />
          Export My Report
        </button>
      </div>

      {/* Overdue Alert */}
      {overdueCount > 0 && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={18} />
            <span>
              You have {overdueCount} overdue {overdueCount === 1 ? "task" : "tasks"} ⚠️
            </span>
          </div>
          <Button
            onClick={() => {
              setShowFilters(true);
              setSelectedFilter("overdue");
              document.getElementById("my-tasks")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-red-700 hover:text-red-900 "
          >
            View Overdue
          </Button>
        </div>
      )}

      {/* Task Health Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Open</p>
          <p className="text-2xl font-semibold text-gray-900">{openCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-semibold text-gray-900">{inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-semibold text-gray-900">{completedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-2xl font-semibold text-gray-900">{overdueCount}</p>
        </div>
      </div>

      {/* Completion Trend (7 days) */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Completion Trend (7 days)
          </h2>
        </div>
        <ReactECharts option={completionTrendOptions} style={{ height: 220 }} />
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
        {/* Left Column - Quick Task & Recurring & Pinned Tasks */}
        <div className="space-y-6">
          {/* Frozen Quick Task Tile */}
          <QuickTaskWidget />

          {/* Recurring Tasks */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">
                Recurring Tasks
              </h2>
            </div>
            <div className="space-y-3">
              {recurringItems.map((r) => (
                <label
                  key={r.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!recurringDone[r.id]}
                      onChange={() => toggleRecurring(r.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {r.title}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{r.frequency}</span>
                </label>
              ))}
            </div>
          </div>

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
            id="my-tasks"
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
                    {["all", "pending", "in_progress", "completed", "overdue"].map(
                      (filter) => (
                        <button
                          key={filter}
                          onClick={() => setSelectedFilter(filter)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            selectedFilter === filter
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                          data-testid={`filter-${filter}`}
                        >
                          {filter.replace("_", " ")}
                        </button>
                      )
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
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
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