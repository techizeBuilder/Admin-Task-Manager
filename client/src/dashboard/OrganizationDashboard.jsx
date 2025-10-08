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
  Search,
  Filter,
  ChevronDown,
  Plus,
  Download,
} from "lucide-react";

/**
 * Organization Dashboard - Administrative workspace for organization admins
 * Displays team metrics, organizational KPIs, and management overview
 */
const OrganizationDashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("this_month");
  const [selectedTeam, setSelectedTeam] = useState("all");

  // Get current user data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
  });

  // Sample organizational data
  const orgStats = {
    totalEmployees: 48,
    activeProjects: 12,
    completedTasksThisMonth: 156,
    pendingApprovals: 8,
    teamProductivity: 87,
    upcomingDeadlines: 23,
  };

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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            data-testid="button-export-report"
          >
            <Download size={18} />
            Export Report
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

        {/* <div
          className="bg-white p-4 rounded-lg shadow-sm border"
          data-testid="card-active-projects"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Building2 className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-xl font-bold text-gray-900">{orgStats.activeProjects}</p>
            </div>
          </div>
        </div> */}

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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Performance */}
        <div
          className="lg:col-span-2 bg-white rounded-lg shadow-sm border"
          data-testid="card-team-performance"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Team Performance
              </h2>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                data-testid="select-team"
              >
                <option value="all">All Teams</option>
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
              </select>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {teamMetrics.map((team, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  data-testid={`team-metric-${index}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-gray-900">{team.name}</h3>
                      <span className="text-sm text-gray-500">
                        ({team.members} members)
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-gray-600">
                        Completed:{" "}
                        <span className="font-medium text-green-600">
                          {team.tasksCompleted}
                        </span>
                      </span>
                      <span className="text-gray-600">
                        Active:{" "}
                        <span className="font-medium text-blue-600">
                          {team.tasksActive}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${getProductivityColor(team.productivity)}`}
                    >
                      {team.productivity}%
                    </div>
                    <div className="text-xs text-gray-500">Productivity</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="bg-white rounded-lg shadow-sm border"
          data-testid="card-recent-activity"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3"
                  data-testid={`activity-${activity.id}`}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {activity.type === "task_completed" && (
                      <CheckSquare className="text-blue-600" size={14} />
                    )}
                    {activity.type === "milestone_achieved" && (
                      <Target className="text-purple-600" size={14} />
                    )}
                    {activity.type === "user_joined" && (
                      <Users className="text-green-600" size={14} />
                    )}
                    {activity.type === "project_created" && (
                      <Plus className="text-orange-600" size={14} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div
        className="bg-white rounded-lg shadow-sm border"
        data-testid="card-upcoming-deadlines-list"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming Deadlines
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignee
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingDeadlines.map((deadline) => (
                <tr
                  key={deadline.id}
                  className="hover:bg-gray-50"
                  data-testid={`deadline-row-${deadline.id}`}
                >
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">
                      {deadline.task}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">
                    {deadline.assignee}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {new Date(deadline.dueDate).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(deadline.priority)}`}
                    >
                      {deadline.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="bg-white rounded-lg shadow-sm border p-6"
          data-testid="card-productivity-chart"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Productivity Trends
          </h2>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <BarChart3 className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-600">Productivity charts coming soon</p>
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow-sm border p-6"
          data-testid="card-task-distribution"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Task Distribution
          </h2>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Target className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-600">
              Task distribution charts coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
