import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Building2,
  BarChart3,
  TrendingUp,
  Clock,
  CheckSquare,
  AlertTriangle,
  Target,
  Calendar,
  Download,
  PieChart,
  CalendarClock,
  FileSpreadsheet,
  FileText,
  Mail,
} from "lucide-react";

const OrganizationDashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("this_month");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    frequency: "weekly",
    day: "Monday",
    time: "09:00",
    email: "",
  });

  // Get current user data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
  });

  // Helpers
  const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 100));

  // Sample organizational data (mock)
  const orgStats = {
    totalEmployees: 48,
    activeProjects: 12,
    completedTasksThisMonth: 156,
    pendingApprovals: 8,
    teamProductivity: 87,
    upcomingDeadlines: 23,
  };

  // Org-wide completion metrics (on-time vs overdue-closed)
  const orgCompletion = {
    onTime: 124,
    overdueClosed: 32,
  };
  const orgOnTimeRate = pct(
    orgCompletion.onTime,
    orgCompletion.onTime + orgCompletion.overdueClosed
  );

  // Adoption dashboard (mock trend over 7 days)
  const adoption = {
    activeUsers: 39,
    totalUsers: orgStats.totalEmployees,
    logins7d: [12, 16, 18, 22, 20, 17, 25],
    updates7d: [5, 7, 6, 9, 8, 10, 11], // comments/updates
  };
  const maxLogins = Math.max(...adoption.logins7d, 1);
  const maxUpdates = Math.max(...adoption.updates7d, 1);

  // Weekday labels for the last 7 days (oldest → today)
  const dayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7DayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return dayShort[d.getDay()];
  });
  // ...existing code...
  // Overdue % by Department (mock)
  const departmentOverdue = [
    { name: "Development", percent: 12 },
    { name: "Design", percent: 8 },
    { name: "Marketing", percent: 18 },
    { name: "Sales", percent: 22 },
    { name: "Support", percent: 5 },
  ];
  const maxDeptOverdue = Math.max(
    ...departmentOverdue.map((d) => d.percent),
    1
  );

  // Module usage report (quick tasks vs full tasks)
  const moduleUsage = { quick: 96, full: 140 };
  const totalModule = moduleUsage.quick + moduleUsage.full;
  const quickPct = pct(moduleUsage.quick, totalModule);
  const fullPct = 100 - quickPct;

  // System health (mock recent issues)
  const systemHealth = [
    {
      id: 1,
      type: "sync",
      severity: "error",
      message: "Failed to sync Project X (HTTP 500)",
      time: "Today 10:23",
    },
    {
      id: 2,
      type: "export",
      severity: "warning",
      message: "Export queue delay ~5 min",
      time: "Today 09:10",
    },
    {
      id: 3,
      type: "report",
      severity: "info",
      message: "Scheduled weekly report sent",
      time: "Yesterday 18:00",
    },
  ];

  const teamMetrics = [
    {
      name: "Development Team",
      members: 12,
      productivity: 92,
      tasksCompleted: 45,
      tasksActive: 18,
    },
    {
      name: "Design Team",
      members: 8,
      productivity: 88,
      tasksCompleted: 32,
      tasksActive: 12,
    },
    {
      name: "Marketing Team",
      members: 10,
      productivity: 85,
      tasksCompleted: 28,
      tasksActive: 15,
    },
    {
      name: "Sales Team",
      members: 15,
      productivity: 78,
      tasksCompleted: 52,
      tasksActive: 22,
    },
    {
      name: "Support Team",
      members: 6,
      productivity: 95,
      tasksCompleted: 38,
      tasksActive: 8,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "task_completed",
      user: "Sarah Johnson",
      action: 'completed "API Integration"',
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "milestone_achieved",
      user: "Development Team",
      action: 'achieved milestone "Phase 2 Complete"',
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "user_joined",
      user: "Michael Chen",
      action: "joined Marketing Team",
      time: "1 day ago",
    },
    {
      id: 4,
      type: "project_created",
      user: "Jennifer Lee",
      action: 'created new project "Q4 Campaign"',
      time: "2 days ago",
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      task: "Quarterly Report Submission",
      assignee: "Finance Team",
      dueDate: "2025-09-05",
      priority: "high",
    },
    {
      id: 2,
      task: "Product Launch Preparation",
      assignee: "Marketing Team",
      dueDate: "2025-09-07",
      priority: "high",
    },
    {
      id: 3,
      task: "Client Presentation Review",
      assignee: "Sales Team",
      dueDate: "2025-09-08",
      priority: "medium",
    },
    {
      id: 4,
      task: "Security Audit Completion",
      assignee: "Development Team",
      dueDate: "2025-09-10",
      priority: "high",
    },
  ];

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

  const getProductivityColor = (productivity) => {
    if (productivity >= 90) return "text-green-600";
    if (productivity >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  // Export & schedule stubs
  const handleExportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["On-Time %", orgOnTimeRate],
      ["Active Users", adoption.activeUsers],
      ["Total Users", adoption.totalUsers],
      ...departmentOverdue.map((d) => [`Overdue % - ${d.name}`, d.percent]),
      ["Quick Tasks", moduleUsage.quick],
      ["Full Tasks", moduleUsage.full],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "org-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    // Simple print-to-PDF experience (use server-side PDF for production)
    window.print();
  };

  const handleScheduleSave = (e) => {
    e.preventDefault();
    console.log("Schedule report", scheduleForm);
    alert(
      `Report scheduled: ${scheduleForm.frequency}, ${scheduleForm.day} at ${
        scheduleForm.time
      } → ${scheduleForm.email || "your email"}`
    );
    setScheduleOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Organization Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of {user?.organization?.name || "your organization"}{" "}
            performance and metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            data-testid="select-time-range"
          >
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
            title="Export Excel (CSV)"
          >
            <FileSpreadsheet size={18} /> Excel (CSV)
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
            title="Export as PDF"
          >
            <FileText size={18} /> PDF
          </button>
          <button
            onClick={() => setScheduleOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
            title="Schedule report email"
          >
            <CalendarClock size={18} /> Schedule
          </button>
        </div>
      </div>

      {/* Organizational KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div
          className="bg-white p-4 rounded-lg shadow-sm border"
          data-testid="card-total-employees"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-xl font-bold text-gray-900">
                {orgStats.totalEmployees}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-lg shadow-sm border"
          data-testid="card-completed-tasks"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <CheckSquare className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-xl font-bold text-gray-900">
                {orgStats.completedTasksThisMonth}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-lg shadow-sm border"
          data-testid="card-pending-approvals"
        >
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-xl font-bold text-gray-900">
                {orgStats.pendingApprovals}
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-lg shadow-sm border"
          data-testid="card-productivity"
        >
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <TrendingUp className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Team Productivity</p>
              <p className="text-xl font-bold text-gray-900">
                {orgStats.teamProductivity}%
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-white p-4 rounded-lg shadow-sm border"
          data-testid="card-upcoming-deadlines"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming Deadlines</p>
              <p className="text-xl font-bold text-gray-900">
                {orgStats.upcomingDeadlines}
              </p>
            </div>
          </div>
        </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Performance */}
        <div
          className="bg-white p-4 rounded-lg shadow-sm border lg:col-span-1"
          data-testid="card-on-time-rate"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Target className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">On-Time Completion</p>
              <p className="text-xl font-bold text-gray-900">
                {orgOnTimeRate}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${orgOnTimeRate}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                On-time {orgCompletion.onTime} · Overdue closed{" "}
                {orgCompletion.overdueClosed}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="bg-white rounded-lg shadow-sm border"
          data-testid="card-adoption-dashboard"
        >
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="text-blue-600" size={18} />
              Adoption Dashboard
            </h2>
            <span className="text-sm text-gray-600">
              Active:{" "}
              <span className="font-semibold text-gray-900">
                {adoption.activeUsers}
              </span>{" "}
              / {adoption.totalUsers}
            </span>
          </div>
          <div className="p-6 space-y-6">
            {/* Logins trend */}
            <TooltipProvider>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-800">
                    Logins (7d)
                  </span>
                  <span className="text-xs text-gray-500">
                    peak {maxLogins}
                  </span>
                </div>
                <div className="flex items-end gap-3">
                  {adoption.logins7d.map((v, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="group relative flex items-end h-20">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="bg-blue-500 w-6 rounded-sm"
                              style={{ height: `${(v / maxLogins) * 100}%` }}
                          
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-900 text-white text-xs rounded-md p-1">
                           {v || 0} logins
                          </TooltipContent>
                        </Tooltip>
                      </div>
                       <span className="mt-1 text-[10px] text-gray-500">{last7DayLabels[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
      
            {/* Comments/updates trend */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">
                  Comments/Updates (7d)
                </span>
                <span className="text-xs text-gray-500">peak {maxUpdates}</span>
              </div>
              <div className="flex items-end gap-3">
                {adoption.updates7d.map((v, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="group relative flex items-end h-20">
                     <Tooltip>
                          <TooltipTrigger asChild>
                      <div
                        className="bg-indigo-500 w-6 rounded-sm"
                        style={{ height: `${((v || 0) / maxUpdates) * 100}%` }}
                     
                      />
                      </TooltipTrigger>
                      <TooltipContent className="bg-gray-900 text-white text-xs rounded-md p-1">
                           {v || 0} comments/updates
                          </TooltipContent>
                      </Tooltip>
                    </div>
                    <span className="mt-1 text-[10px] text-gray-500">
                      {last7DayLabels[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
                  </TooltipProvider>
          </div>
        </div>

        {/* Overdue % by Department */}
        <div
          className="bg-white rounded-lg shadow-sm border"
          data-testid="card-overdue-by-dept"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PieChart className="text-red-600" size={18} />
              Overdue % by Department
            </h2>
          </div>
          <div className="p-6">
            {/* <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  className="h-3 rounded-l-full bg-emerald-500"
                  style={{ width: `${quickPct}%` }}
                />
              </div> */}
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700">Full Tasks</span>
                <span className="font-medium text-gray-900">
                  {moduleUsage.full}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-l-full bg-blue-500"
                  style={{ width: `${fullPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Quick vs Full usage ratio: {quickPct}% / {fullPct}%
              </p>
            </div>
          </div>

          {/* System Health */}
          <div
            className="bg-white rounded-lg shadow-sm border"
            data-testid="card-system-health"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-orange-600" size={18} />
                System Health
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {systemHealth.map((e) => (
                <div key={e.id} className="flex items-start gap-3">
                  <div
                    className={`w-2.5 h-2.5 mt-1 rounded-full ${
                      e.severity === "error"
                        ? "bg-red-600"
                        : e.severity === "warning"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{e.message}</div>
                    <div className="text-xs text-gray-500">{e.time}</div>
                  </div>
                </div>
              ))}
              {systemHealth.length === 0 && (
                <div className="text-sm text-gray-500">No issues detected.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Existing Main Content Grid (Team Performance + Recent Activity) */}
      {/* ...existing code... */}
      {/* Keep your current Team Performance, Recent Activity, Upcoming Deadlines, and Charts sections below unchanged */}
    </div>
  );
};

export default OrganizationDashboard;
