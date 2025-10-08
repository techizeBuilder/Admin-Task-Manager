import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  TrendingUp,
  Clock,
  CheckSquare,
  AlertTriangle,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Trophy,
  Zap,
} from "lucide-react";

/**
 * Manager Dashboard - Team management workspace for managers
 * Displays team metrics, performance stats, and team-focused insights
 */
const ManagerDashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("this_month");

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
    teamProductivity: 89,
    avgTaskCompletionTime: "2.3 days",
    upcomingDeadlines: 6,
    teamSatisfaction: 4.2,
  };

  const teamMembers = [
    {
      id: 1,
      name: "Alice Johnson",
      role: "Senior Developer",
      avatar: "AJ",
      activeTasks: 4,
      completedThisWeek: 3,
      productivity: 95,
      status: "online",
      lastActivity: "2 minutes ago",
    },
    {
      id: 2,
      name: "Bob Smith",
      role: "UI Designer",
      avatar: "BS",
      activeTasks: 3,
      completedThisWeek: 5,
      productivity: 92,
      status: "busy",
      lastActivity: "15 minutes ago",
    },
    {
      id: 3,
      name: "Carol Davis",
      role: "Frontend Developer",
      avatar: "CD",
      activeTasks: 2,
      completedThisWeek: 4,
      productivity: 88,
      status: "online",
      lastActivity: "5 minutes ago",
    },
    {
      id: 4,
      name: "David Wilson",
      role: "QA Engineer",
      avatar: "DW",
      activeTasks: 5,
      completedThisWeek: 2,
      productivity: 75,
      status: "offline",
      lastActivity: "2 hours ago",
    },
    {
      id: 5,
      name: "Eva Brown",
      role: "Backend Developer",
      avatar: "EB",
      activeTasks: 3,
      completedThisWeek: 6,
      productivity: 98,
      status: "online",
      lastActivity: "1 minute ago",
    },
    {
      id: 6,
      name: "Frank Miller",
      role: "DevOps Engineer",
      avatar: "FM",
      activeTasks: 4,
      completedThisWeek: 3,
      productivity: 85,
      status: "busy",
      lastActivity: "30 minutes ago",
    },
  ];

  const projectStats = [
    {
      name: "Mobile App Redesign",
      progress: 78,
      assignedMembers: 4,
      dueDate: "2025-09-20",
      priority: "high",
      tasksCompleted: 23,
      totalTasks: 30,
    },
    {
      name: "API Integration",
      progress: 45,
      assignedMembers: 3,
      dueDate: "2025-09-15",
      priority: "medium",
      tasksCompleted: 12,
      totalTasks: 18,
    },
    {
      name: "Security Audit",
      progress: 92,
      assignedMembers: 2,
      dueDate: "2025-09-12",
      priority: "high",
      tasksCompleted: 11,
      totalTasks: 12,
    },
  ];

  const weeklyPerformance = [
    { day: "Mon", completed: 8, assigned: 12 },
    { day: "Tue", completed: 12, assigned: 15 },
    { day: "Wed", completed: 10, assigned: 14 },
    { day: "Thu", completed: 15, assigned: 18 },
    { day: "Fri", completed: 9, assigned: 11 },
    { day: "Sat", completed: 3, assigned: 5 },
    { day: "Sun", completed: 2, assigned: 3 },
  ];

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

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Team Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.firstName || "Manager"}! Here's your team overview.
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed This Month</p>
              <p className="text-2xl font-bold text-gray-900">{teamStats.completedTasksThisMonth}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +18% vs last month
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team Productivity</p>
              <p className="text-2xl font-bold text-gray-900">{teamStats.teamProductivity}%</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <Zap className="w-3 h-3 mr-1" />
                Above average
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Team Members
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                    <div className="flex items-center space-x-4 text-sm">
                      <div>
                        <p className="text-gray-600">Active: {member.activeTasks}</p>
                        <p className="text-green-600">Done: {member.completedThisWeek}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{member.productivity}%</p>
                        <p className="text-xs text-gray-500">Productivity</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          {/* Overdue Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
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

          {/* Weekly Performance Chart */}
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
                    <span className="text-xs font-medium text-gray-600 w-8">
                      {day.day}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(day.completed / day.assigned) * 100}%`,
                        }}
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

          {/* Team Satisfaction */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                Team Satisfaction
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {teamStats.teamSatisfaction}/5.0
                </div>
                <div className="flex justify-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.floor(teamStats.teamSatisfaction)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ⭐
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600">Based on weekly surveys</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Progress */}
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
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
