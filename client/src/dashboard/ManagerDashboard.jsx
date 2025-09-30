import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Users,
  TrendingUp,
  Clock,
  CheckSquare,
  AlertTriangle,
  Target,
  BarChart3,
  ArrowUpRight,
  Zap,
  ArrowLeftRight,
  AlertOctagon,
  X,
  Gauge,
  FileSpreadsheet,
  FileText,
  CalendarClock,
} from "lucide-react";
import ReactECharts from "echarts-for-react";
import QuickTaskWidget from "../components/tasks/QuickTaskWidget";
/**
 * Manager Dashboard - Team management workspace for managers
 * Displays team metrics, performance stats, and team-focused insights
 */
const ManagerDashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("this_month");
  const [selectedMember, setSelectedMember] = useState(null);
  // Report filters & scheduling
  const [memberFilter, setMemberFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ frequency: "weekly", time: "09:00", email: "" });

  // Get current user data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
  });

  // Static team data for managers
  const teamStats = {
    totalTeamMembers: 8,
    activeTasks: 24,
    completedTasksThisMonth: 47,
    overdueItems: 3,
    teamProductivity: 89, // replaced below by computed on-time rate
    avgTaskCompletionTime: "2.3 days",
    upcomingDeadlines: 6,
    teamSatisfaction: 4.2,
  };

  // Core team dataset enhanced for workload, overdue and productivity
  const teamMembers = [
    {
      id: 1,
      name: "Alice Johnson",
      role: "Senior Developer",
      avatar: "AJ",
      capacity: 6, // weekly capacity
      activeTasks: 4,
      overdueTasks: 1,
      completedThisWeek: 3,
      completedOnTimeThisMonth: 9,
      overdueClosedThisMonth: 1,
      productivity: 95,
      status: "online",
      lastActivity: "2 minutes ago",
    },
    {
      id: 2,
      name: "Bob Smith",
      role: "UI Designer",
      avatar: "BS",
      capacity: 5,
      activeTasks: 3,
      overdueTasks: 2,
      completedThisWeek: 5,
      completedOnTimeThisMonth: 8,
      overdueClosedThisMonth: 2,
      productivity: 92,
      status: "busy",
      lastActivity: "15 minutes ago",
    },
    {
      id: 3,
      name: "Carol Davis",
      role: "Frontend Developer",
      avatar: "CD",
      capacity: 5,
      activeTasks: 2,
      overdueTasks: 0,
      completedThisWeek: 4,
      completedOnTimeThisMonth: 10,
      overdueClosedThisMonth: 0,
      productivity: 88,
      status: "online",
      lastActivity: "5 minutes ago",
    },
    {
      id: 4,
      name: "David Wilson",
      role: "QA Engineer",
      avatar: "DW",
      capacity: 6,
      activeTasks: 5,
      overdueTasks: 1,
      completedThisWeek: 2,
      completedOnTimeThisMonth: 6,
      overdueClosedThisMonth: 1,
      productivity: 75,
      status: "offline",
      lastActivity: "2 hours ago",
    },
  ];

  // Example project stats with milestones
  const projectStats = [
    {
      name: "Mobile App Redesign",
      progress: 78,
      assignedMembers: 4,
      dueDate: "2025-09-20",
      priority: "high",
      tasksCompleted: 23,
      totalTasks: 30,
      milestones: [
        { name: "Wireframes", progress: 100, dueDate: "2025-09-05", status: "done" },
        { name: "Prototype", progress: 80, dueDate: "2025-09-12", status: "in_progress" },
        { name: "User Testing", progress: 40, dueDate: "2025-09-18", status: "at_risk" },
      ],
    },
    {
      name: "API Integration",
      progress: 45,
      assignedMembers: 3,
      dueDate: "2025-09-15",
      priority: "medium",
      tasksCompleted: 12,
      totalTasks: 18,
      milestones: [
        { name: "Auth Flow", progress: 90, dueDate: "2025-09-10", status: "in_progress" },
        { name: "Payments", progress: 30, dueDate: "2025-09-14", status: "at_risk" },
      ],
    },
    {
      name: "Security Audit",
      progress: 92,
      assignedMembers: 2,
      dueDate: "2025-09-12",
      priority: "high",
      tasksCompleted: 11,
      totalTasks: 12,
      milestones: [
        { name: "Vuln Scan", progress: 100, dueDate: "2025-09-08", status: "done" },
        { name: "Pen Test", progress: 85, dueDate: "2025-09-11", status: "in_progress" },
      ],
    },
  ];

  // Lightweight demo tasks per member for drill-down (In real app, fetch from API)
  const memberTasks = {
    1: [
      { id: "T-101", title: "Fix login bug", status: "overdue", priority: "high", dueDate: "2025-09-18", blocked: true },
      { id: "T-102", title: "Refactor auth", status: "in_progress", priority: "medium", dueDate: "2025-09-24", blocked: false },
      { id: "T-103", title: "Add 2FA", status: "due_soon", priority: "high", dueDate: "2025-09-25", blocked: false },
    ],
    2: [
      { id: "T-201", title: "Redesign settings", status: "overdue", priority: "medium", dueDate: "2025-09-17", blocked: false },
      { id: "T-202", title: "Icon set audit", status: "in_progress", priority: "low", dueDate: "2025-09-26", blocked: false },
    ],
    3: [
      { id: "T-301", title: "Table virtualization", status: "in_progress", priority: "high", dueDate: "2025-09-24", blocked: false },
      { id: "T-302", title: "Unit tests", status: "due_soon", priority: "medium", dueDate: "2025-09-25", blocked: false },
    ],
    4: [
      { id: "T-401", title: "Regression suite", status: "in_progress", priority: "medium", dueDate: "2025-09-23", blocked: false },
      { id: "T-402", title: "Flaky test fix", status: "overdue", priority: "high", dueDate: "2025-09-16", blocked: true },
    ],
    5: [
      { id: "T-501", title: "Optimize queries", status: "due_soon", priority: "high", dueDate: "2025-09-25", blocked: false },
      { id: "T-502", title: "API pagination", status: "in_progress", priority: "medium", dueDate: "2025-09-24", blocked: false },
    ],
    6: [
      { id: "T-601", title: "CI cache tuning", status: "overdue", priority: "medium", dueDate: "2025-09-18", blocked: false },
      { id: "T-602", title: "Alerting rules", status: "in_progress", priority: "high", dueDate: "2025-09-24", blocked: false },
    ],
  };

  const weeklyPerformance = [
    { day: "Mon", completed: 8, assigned: 12 },
    { day: "Tue", completed: 12, assigned: 15 },
    { day: "Wed", completed: 10, assigned: 14 },
    { day: "Thu", completed: 15, assigned: 18 },
    { day: "Fri", completed: 9, assigned: 11 },
    { day: "Sat", completed: 3, assigned: 5 },
    { day: "Sun", completed: 2, assigned: 3 },
  ];

  // ===== Analytics datasets & helpers (mock) =====
  const priorities = ["urgent", "high", "medium", "low"];
  const statuses = ["pending", "in_progress", "completed", "blocked"];
  const generateTeamMockTasks = (members, count = 140) => {
    const now = new Date();
    const addDays = (d, n) => {
      const x = new Date(d);
      x.setDate(x.getDate() + n);
      return x;
    };
    const rand = (n) => Math.floor(Math.random() * n);
    const arr = [];
    for (let i = 0; i < count; i++) {
      const m = members[rand(members.length)];
      const createdAt = addDays(now, -rand(45));
      const dueDate = addDays(createdAt, rand(20) + 1);
      const isCompleted = Math.random() < 0.55;
      const completedAt = isCompleted ? addDays(dueDate, rand(6) - 3) : null;
      arr.push({
        id: `t-${i + 1}`,
        title: `Task #${i + 1}`,
        assigneeId: m.id,
        assignee: m.name,
        priority: priorities[rand(priorities.length)],
        status: isCompleted ? "completed" : statuses[rand(statuses.length - 1)],
        createdAt: createdAt.toISOString(),
        dueDate: dueDate.toISOString(),
        completedAt: completedAt ? completedAt.toISOString() : null,
        type: Math.random() < 0.45 ? "quick" : "full",
      });
    }
    return arr;
  };
  const teamTasks = useMemo(() => generateTeamMockTasks(teamMembers, 150), [teamMembers]);
  const now = new Date();

  const filteredTasks = useMemo(() => {
    return teamTasks.filter((t) => {
      const byMember = memberFilter === "all" ? true : t.assigneeId === Number(memberFilter);
      const byPriority = priorityFilter === "all" ? true : t.priority === priorityFilter;
      const byFrom = dueFrom ? new Date(t.dueDate) >= new Date(dueFrom) : true;
      const byTo = dueTo ? new Date(t.dueDate) <= new Date(dueTo) : true;
      const inRange =
        selectedTimeRange === "this_week"
          ? new Date(t.createdAt) >= new Date(new Date().setDate(new Date().getDate() - 7))
          : selectedTimeRange === "this_month"
          ? new Date(t.createdAt) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          : selectedTimeRange === "last_month"
          ? new Date(t.createdAt) >= new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
          : true;
      return byMember && byPriority && byFrom && byTo && inRange;
    });
  }, [teamTasks, memberFilter, priorityFilter, dueFrom, dueTo, selectedTimeRange]);

  const overdueRows = useMemo(() => {
    return filteredTasks
      .filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "completed")
      .map((t) => ({
        id: t.id,
        task: t.title,
        assignee: t.assignee,
        priority: t.priority,
        dueDate: new Date(t.dueDate).toLocaleDateString(),
        daysOverdue: Math.max(1, Math.ceil((now - new Date(t.dueDate)) / 86400000)),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [filteredTasks]);

  const efficiencyPie = useMemo(() => {
    let onTime = 0,
      late = 0;
    for (const t of filteredTasks) {
      if (t.status !== "completed" || !t.dueDate || !t.completedAt) continue;
      if (new Date(t.completedAt) <= new Date(t.dueDate)) onTime++;
      else late++;
    }
    return {
      tooltip: { trigger: "item" },
      series: [
        {
          type: "pie",
          radius: ["45%", "70%"],
          label: { show: false },
          labelLine: { show: false },
          data: [
            { value: onTime, name: "On-time", itemStyle: { color: "#16a34a" } },
            { value: late, name: "Late", itemStyle: { color: "#ef4444" } },
          ],
        },
      ],
    };
  }, [filteredTasks]);

  const workloadStacked = useMemo(() => {
    const map = new Map(teamMembers.map((m) => [m.id, { name: m.name, urgent: 0, high: 0, medium: 0, low: 0 }]));
    for (const t of filteredTasks) if (map.has(t.assigneeId)) map.get(t.assigneeId)[t.priority]++;
    const names = Array.from(map.values()).map((x) => x.name);
    const colors = { urgent: "#ef4444", high: "#f59e0b", medium: "#3b82f6", low: "#10b981" };
    const series = ["urgent", "high", "medium", "low"].map((p) => ({
      name: p[0].toUpperCase() + p.slice(1),
      type: "bar",
      stack: "total",
      itemStyle: { color: colors[p] },
      data: Array.from(map.values()).map((x) => x[p]),
    }));
    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { bottom: 0 },
      grid: { left: 10, right: 10, top: 10, bottom: 40, containLabel: true },
      xAxis: { type: "category", data: names },
      yAxis: { type: "value" },
      series,
    };
  }, [filteredTasks, teamMembers]);

  // Helpers
  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
  const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));

  // Heatmap color based on workload ratio (active/capacity)
  const getLoadColor = (ratio) => {
    const r = clamp(ratio);
    if (r >= 1.25) return "bg-red-500"; // overloaded
    if (r >= 1.0) return "bg-orange-500";
    if (r >= 0.75) return "bg-yellow-400";
    if (r >= 0.5) return "bg-green-500";
    return "bg-emerald-500";
  };
  // Contrast text color for tiles (yellow -> dark text, others -> white)
  const getLoadTextColor = (ratio) => {
    const r = clamp(ratio);
    return r >= 0.75 && r < 1.0 ? "text-gray-900" : "text-white";
  };
  const teamOnTimeStats = useMemo(() => {
    const totals = teamMembers.reduce(
      (acc, m) => {
        acc.onTime += m.completedOnTimeThisMonth || 0;
        acc.overdueClosed += m.overdueClosedThisMonth || 0;
        return acc;
      },
      { onTime: 0, overdueClosed: 0 }
    );
    const totalCompleted = totals.onTime + totals.overdueClosed;
    return {
      onTime: totals.onTime,
      overdueClosed: totals.overdueClosed,
      rate: pct(totals.onTime, totalCompleted),
      totalCompleted,
    };
  }, [teamMembers]);

  // Exports
  const toCSV = (rows) => {
    if (!rows?.length) return "";
    const header = Object.keys(rows[0]);
    const esc = (v) =>
      typeof v === "string" && (v.includes(",") || v.includes('"') || v.includes("\n"))
        ? `"${v.replace(/"/g, '""')}"`
        : v ?? "";
    return [header.join(","), ...rows.map((r) => header.map((k) => esc(r[k])).join(","))].join("\n");
  };
  const download = (name, content, type = "text/csv;charset=utf-8") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleExportCSV = () => {
    const csv = toCSV(
      filteredTasks.map((t) => ({
        id: t.id,
        title: t.title,
        assignee: t.assignee,
        priority: t.priority,
        status: t.status,
        createdAt: t.createdAt,
        dueDate: t.dueDate,
        completedAt: t.completedAt || "",
        type: t.type,
      }))
    );
    download(`manager-report-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };
  const handleExportPDF = () => window.print();

  const handleOpenMember = (member) => setSelectedMember(member);
  const handleCloseMember = () => setSelectedMember(null);

  const handleReassign = (task, member) => {
    // TODO: Wire up to backend action
    console.log("Reassign Task", { task, from: member?.name });
    alert(`Reassigning "${task.title}" from ${member?.name}`);
  };

  const handleEscalate = (task, member) => {
    // TODO: Wire up to backend action
    console.log("Escalate Blocker", { task, owner: member?.name });
    alert(`Escalating blocker for "${task.title}" (owner: ${member?.name})`);
  };

  // Max overdue for bar widths
  const maxOverdue = Math.max(...teamMembers.map((m) => m.overdueTasks || 0), 1);

  // Milestones aggregates
  const milestoneSummary = useMemo(() => {
    const projects = projectStats.map((p) => {
      const total = p.milestones?.length || 0;
      const done = p.milestones?.filter((m) => m.status === "done").length || 0;
      const atRisk = p.milestones?.filter((m) => m.status === "at_risk").length || 0;
      const avgProgress =
        total === 0 ? 0 : Math.round(p.milestones.reduce((s, m) => s + (m.progress || 0), 0) / total);
      return { name: p.name, total, done, atRisk, avgProgress };
    });
    return projects;
  }, [projectStats]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.firstName || "Manager"}! Here's your team overview.
        </p>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
          >
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
          </select>
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
          >
            <option value="all">All members</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
          >
            <option value="all">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            type="date"
            value={dueFrom}
            onChange={(e) => setDueFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            aria-label="Due from"
          />
          <input
            type="date"
            value={dueTo}
            onChange={(e) => setDueTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            aria-label="Due to"
          />
          {(memberFilter !== "all" || priorityFilter !== "all" || dueFrom || dueTo) && (
            <button
              onClick={() => {
                setMemberFilter("all");
                setPriorityFilter("all");
                setDueFrom("");
                setDueTo("");
              }}
              className="px-3 py-2 rounded-md bg-gray-100 text-sm"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm"
            title="Export Excel (CSV)"
          >
            <FileSpreadsheet size={16} /> CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm"
            title="Export as PDF"
          >
            <FileText size={16} /> PDF
          </button>
          <button
            onClick={() => setScheduleOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm"
            title="Schedule report email"
          >
            <CalendarClock size={16} /> Schedule
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-md shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{teamStats.totalTeamMembers}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +2 this month
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{teamStats.activeTasks}</p>
              <p className="text-xs text-blue-600 flex items-center mt-1">
                <Target className="w-3 h-3 mr-1" />
                In progress
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Team Productivity Score (On-time completion rate) */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <p className="text-sm font-medium text-gray-600">Team Productivity (On-Time)</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-gray-900">{teamOnTimeStats.rate}%</p>
                <div className="p-3 bg-purple-50 rounded-full">
                  <Gauge className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${teamOnTimeStats.rate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  On-time: {teamOnTimeStats.onTime} · Overdue closed: {teamOnTimeStats.overdueClosed}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Completion Time</p>
              <p className="text-2xl font-bold text-gray-900">{teamStats.avgTaskCompletionTime}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <Zap className="w-3 h-3 mr-1" />
                Above average
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Team Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={18} /> Productivity & Efficiency
            </h2>
          </div>
          <div className="p-6">
            <ReactECharts option={efficiencyPie} style={{ height: 280 }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="text-green-600" size={18} /> Workload by Priority
            </h2>
          </div>
          <div className="p-6">
            <ReactECharts option={workloadStacked} style={{ height: 320 }} />
          </div>
        </div>
      </div>

      {/* Overdue Tasks Report */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={18} /> Overdue Tasks Report
          </h2>
          <span className="text-sm text-gray-600">
            {overdueRows.length > 0 ? `${overdueRows.length} items` : "All caught up ✅"}
          </span>
        </div>
        {overdueRows.length > 0 && (
          <div className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Task</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Assignee</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase">Days Overdue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overdueRows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-3 px-6 text-sm text-gray-900">{r.task}</td>
                    <td className="py-3 px-6 text-sm">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => setMemberFilter(String(teamMembers.find((m) => m.name === r.assignee)?.id || "all"))}
                        title="Filter by member"
                      >
                        {r.assignee}
                      </button>
                    </td>
                    <td className="py-3 px-6 text-xs">
                      <span className="px-2 py-1 rounded-full border">{r.priority}</span>
                    </td>
                    <td className="py-3 px-6 text-sm">{r.dueDate}</td>
                    <td className="py-3 px-6 text-sm font-semibold text-red-600">{r.daysOverdue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <div className="lg:col-span-2 bg-white rounded-md shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Team Members
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleOpenMember(member)}
                  className="w-full text-left flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {member.avatar}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                          member.status
                        )}`}
                      ></div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <p className="text-xs text-gray-500">{member.lastActivity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-6 text-sm">
                      <div>
                        <p className="text-gray-600">Active: {member.activeTasks}</p>
                        <p className="text-red-600">Overdue: {member.overdueTasks}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{member.productivity}%</p>
                        <p className="text-xs text-gray-500">Productivity</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          {/* Quick Task */}
          <QuickTaskWidget />

          {/* Needs Attention */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="mt-4 p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Needs Attention
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overdue Tasks</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    {teamStats.overdueItems}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Upcoming Deadlines</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    {teamStats.upcomingDeadlines}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Completion Time</span>
                  <span className="text-sm font-medium text-gray-900">
                    {teamStats.avgTaskCompletionTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Weekly Performance
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {weeklyPerformance.map((day, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-xs font-medium text-gray-600 w-8">{day.day}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(day.completed / day.assigned) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {day.completed}/{day.assigned}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overdue by Member (Bar Chart) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertOctagon className="w-5 h-5 mr-2 text-red-600" />
                Overdue by Member
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {teamMembers.map((m) => (
                <div key={m.id} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{m.name}</span>
                    <span>{m.overdueTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-red-500"
                      style={{
                        width: `${(m.overdueTasks / maxOverdue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Workload Heatmap + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Workload Heatmap */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Team Workload Heatmap
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Green = underloaded, Yellow = nearing capacity, Red = overloaded
            </p>
          </div>
          <div className="p-6 mt-4">
            {/* Center items vertically and horizontally */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 place-items-center">
              {teamMembers.map((m) => {
                const ratio = (m.activeTasks || 0) / (m.capacity || 1);
                return (
                  <button
                    key={m.id}
                    onClick={() => handleOpenMember(m)}
                    className="group relative focus:outline-none"
                    aria-label={`${m.name} ${m.activeTasks}/${m.capacity} active`}
                    title={`${m.name} • ${m.activeTasks}/${m.capacity} active`}
                  >
                    {/* Bigger tile with centered content */}
                    <div
                      className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl ${getLoadColor(
                        ratio
                      )} ${getLoadTextColor(
                        ratio
                      )} shadow-md ring-2 ring-white group-hover:ring-blue-200 transition-transform duration-150 group-hover:-translate-y-0.5 flex items-center justify-center`}
                    >
                      {/* Overdue badge (optional) */}
                      {m.overdueTasks > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-red-600 text-[10px] font-semibold rounded-full px-1.5 py-0.5 shadow">
                          {m.overdueTasks}
                        </span>
                      )}

                      {/* Centered initials and counts */}
                      <div className="flex flex-col items-center justify-center leading-tight text-center">
                        <span className="font-bold text-lg md:text-xl tracking-wide">{m.avatar}</span>
                        <span className="text-[11px] md:text-xs font-medium opacity-95">
                          {m.activeTasks}/{m.capacity}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

       
        {/* Milestones Progress */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[380px] flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-green-600" />
              Milestones Progress
            </h2>
          </div>
          {/* Fixed-height scroll area -> only ~2 cards visible */}
          <div className="p-6 space-y-4 flex-1 overflow-y-auto pr-1">
            {milestoneSummary.map((ms) => (
              <div key={ms.name} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">{ms.name}</p>
                  <span className="text-xs text-gray-600">
                    {ms.done}/{ms.total} done
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${ms.avgProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Avg progress: {ms.avgProgress}%</span>
                  {ms.atRisk > 0 ? (
                    <span className="text-red-600">{ms.atRisk} at risk</span>
                  ) : (
                    <span className="text-green-600">On track</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      
      </div>

      {/* Active Projects */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            Active Projects
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projectStats.map((project, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-md p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      project.priority
                    )}`}
                  >
                    {project.priority}
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tasks</span>
                    <span>
                      {project.tasksCompleted}/{project.totalTasks}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Team Size</span>
                    <span>{project.assignedMembers} members</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Due Date</span>
                    <span className="text-gray-900">{project.dueDate}</span>
                  </div>
                </div>

                {/* Project Milestones mini list */}
                {project.milestones?.length ? (
                  <div className="mt-4 border-t border-gray-200 pt-3 space-y-2">
                    {project.milestones.map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-gray-700">{m.name}</span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full ${
                            m.status === "done"
                              ? "bg-green-50 text-green-700"
                              : m.status === "at_risk"
                              ? "bg-red-50 text-red-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {m.status.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule modal (Phase II stub) */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Schedule Report Email</h3>
              <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setScheduleOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <select
                className="border rounded px-2 py-1 w-full"
                value={scheduleForm.frequency}
                onChange={(e) => setScheduleForm((s) => ({ ...s, frequency: e.target.value }))}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <input
                type="time"
                className="border rounded px-2 py-1 w-full"
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm((s) => ({ ...s, time: e.target.value }))}
              />
              <input
                type="email"
                className="border rounded px-2 py-1 w-full"
                placeholder="manager@company.com"
                value={scheduleForm.email}
                onChange={(e) => setScheduleForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setScheduleOpen(false)}>
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setScheduleOpen(false);
                  alert("Schedule saved (stub)");
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Drill-Down Panel */}
      {selectedMember && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={handleCloseMember}
          />
          {/* Panel */}
          <div className="absolute right-0 top-0 h-full w-full sm:w-[28rem] bg-white shadow-xl border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                  {selectedMember.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selectedMember.name}</div>
                  <div className="text-xs text-gray-500">{selectedMember.role}</div>
                </div>
              </div>
              <button
                onClick={handleCloseMember}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-200 grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Active</div>
                <div className="text-lg font-semibold text-gray-900">{selectedMember.activeTasks}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Overdue</div>
                <div className="text-lg font-semibold text-red-600">{selectedMember.overdueTasks}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">On-Time %</div>
                <div className="text-lg font-semibold text-green-600">
                  {pct(
                    selectedMember.completedOnTimeThisMonth,
                    selectedMember.completedOnTimeThisMonth + selectedMember.overdueClosedThisMonth
                  )}
                  %
                </div>
              </div>
            </div>

            <div className="p-4 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Tasks</h4>
              <div className="space-y-3">
                {(memberTasks[selectedMember.id] || []).map((t) => (
                  <div
                    key={t.id}
                    className="border border-gray-200 rounded-lg p-3 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{t.title}</div>
                        <div className="text-xs text-gray-500">
                          #{t.id} • Due: {t.dueDate} •{" "}
                          <span
                            className={`${
                              t.status === "overdue"
                                ? "text-red-600"
                                : t.status === "due_soon"
                                ? "text-yellow-600"
                                : "text-blue-600"
                            }`}
                          >
                            {t.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] ${getPriorityColor(t.priority)}`}>
                          Priority: {t.priority}
                        </div>
                        {t.blocked && (
                          <div className="mt-1 text-xs text-red-600 flex items-center">
                            <AlertOctagon className="w-3 h-3 mr-1" /> Blocked
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => handleReassign(t, selectedMember)}
                        className="inline-flex items-center text-xs px-2.5 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 mr-1" />
                        Reassign Task
                      </button>
                      <button
                        onClick={() => handleEscalate(t, selectedMember)}
                        className="inline-flex items-center text-xs px-2.5 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700"
                      >
                        <AlertOctagon className="w-3.5 h-3.5 mr-1" />
                        Escalate Blocker
                      </button>
                    </div>
                  </div>
                ))}

                {(memberTasks[selectedMember.id] || []).length === 0 && (
                  <div className="text-xs text-gray-500">No tasks found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;