import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  CheckSquare,
  FolderOpen,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import TeamMembersWidget from "@/components/admin/TeamMembersWidget";
import AnnualSelfAppraisal from "../newComponents/AnnualSelfAppraisal";
import TaskCreationTile from "../newComponents/TaskCreationTitle";
import CreateTask from "../newComponents/CreateTask";
import ApprovalTaskCreator from "../newComponents/ApprovalTaskCreator";
const sampleEmployeeData = {
  employeeId: "EMP001",
  fullName: "John Smith",
  position: "Senior Developer",
  department: "Engineering",
  manager: "Sarah Wilson",
  reviewPeriod: "2024",
  hireDate: "2022-01-15",
};
export default function Dashboard() {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState("regular");
  const [showSelfAppraisal, setShowSelfAppraisal] = useState(false);
  const [showApprovalTaskModal, setShowApprovalTaskModal] = useState(false);
  // Get current user data to check role
  const { data: user } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
  });

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalUsers: 0,
    totalProjects: 0,
  });

  const [loading, setLoading] = useState(true);

  // Check if user can access organizational features
  const isIndividualUser = user?.role === "individual";
  const canAccessTeamFeatures =
    !isIndividualUser &&
    (user?.role === "org_admin" ||
      user?.role === "admin" ||
      user?.role === "superadmin");

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalTasks: 156,
        completedTasks: 89,
        pendingTasks: 45,
        overdueTasks: 22,
        totalUsers: 34,
        totalProjects: 12,
      });
      setLoading(false);
    }, 1000);
  }, []);
  const handleCreateTask = (taskType) => {
    if (taskType === "approval") {
      setShowApprovalTaskModal(true);
    } else {
      setSelectedTaskType(taskType);
      setShowCreateTask(true);
    }
  };
  
  const handleCreateApprovalTask = (approvalTaskData) => {
    console.log("Approval task created:", approvalTaskData);
    setShowApprovalTaskModal(false);
  };
  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-slate-100 p-4 rounded-lg mb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-1.5 h-6 bg-slate-300 rounded-full mr-3"></div>
                <div>
                  <div className="h-5 bg-slate-300 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-slate-300 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
            {/* Stats Cards Skeleton */}
            <div className="xl:col-span-1 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-3 rounded border border-slate-200 shadow-sm"
                  >
                    <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-slate-200 rounded w-1/2 mb-1"></div>
                    <div className="h-2 bg-slate-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Skeleton */}
            <div className="xl:col-span-1">
              <div className="bg-white p-3 rounded border border-slate-200 h-full">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-slate-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Deadlines Skeleton */}
            <div className="xl:col-span-1">
              <div className="bg-white p-3 rounded border border-slate-200">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-slate-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      description: "Active tasks in system",
      icon: CheckSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      description: "Tasks finished this month",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Active Users",
      value: stats.totalUsers,
      description: "Registered users",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+15%",
      changeType: "positive",
    },
    {
      title: "Projects",
      value: stats.totalProjects,
      description: "Active projects",
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+5%",
      changeType: "positive",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: "John Smith",
      action: "completed task",
      target: "Database Migration",
      time: "2 minutes ago",
      type: "completion",
    },
    {
      id: 2,
      user: "Sarah Wilson",
      action: "created project",
      target: "Mobile App Redesign",
      time: "15 minutes ago",
      type: "creation",
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "assigned task",
      target: "API Documentation",
      time: "1 hour ago",
      type: "assignment",
    },
    {
      id: 4,
      user: "Emily Davis",
      action: "updated project",
      target: "Website Optimization",
      time: "2 hours ago",
      type: "update",
    },
    {
      id: 5,
      user: "David Brown",
      action: "completed milestone",
      target: "Phase 1 Development",
      time: "3 hours ago",
      type: "milestone",
    },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      task: "Mobile App Beta Release",
      project: "Mobile Development",
      dueDate: "2024-01-15",
      priority: "high",
      assignee: "Development Team",
    },
    {
      id: 2,
      task: "Security Audit Report",
      project: "Security Review",
      dueDate: "2024-01-18",
      priority: "medium",
      assignee: "Security Team",
    },
    {
      id: 3,
      task: "User Testing Phase 2",
      project: "UX Research",
      dueDate: "2024-01-20",
      priority: "high",
      assignee: "UX Team",
    },
    {
      id: 4,
      task: "Database Performance Optimization",
      project: "Backend Infrastructure",
      dueDate: "2024-01-22",
      priority: "medium",
      assignee: "Backend Team",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 px-4 py-2 rounded-lg shadow-sm mb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Home</h1>
              <p className="text-sm text-slate-600">Welcome back!</p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium text-slate-900">Today</p>
            <p className="text-xs text-slate-600">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 mb-3">
        <div className="card flex justify-between items-center">
          <h2 className="font-bold text-xl">Tasks </h2>
          <div className="flex gap-3">
            <TaskCreationTile
              type="regular"
              title="Simple Task"
              icon="📋"
              color="blue"
              onClick={() => handleCreateTask("regular")}
            />
            <TaskCreationTile
              type="recurring"
              title="Recurring Task"
              icon="🔄"
              color="green"
              onClick={() => handleCreateTask("recurring")}
            />
            <TaskCreationTile
              type="milestone"
              title="Milestone"
              icon="🎯"
              color="purple"
              onClick={() => handleCreateTask("milestone")}
            />
            <TaskCreationTile
              type="approval"
              title="Approval Task"
              icon="✅"
              color="orange"
              onClick={() => handleCreateTask("approval")}
            />
             <button
              className="btn btn-secondary text-nowrap"
              onClick={() => setShowSelfAppraisal(true)}
            >
              <span className="">📝</span>
              Self-Appraisal
            </button>
          </div>
        </div>
      </div>
      {/* Left Column - Stats Cards */}
      <div className="lg:col-span-1 xl:col-span-1 space-y-2 sm:space-y-3 mb-5 mt-2">
        <div className="grid grid-cols-4 gap-1 sm:gap-2">
          {statCards.slice(0, 4).map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={index}
                className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                    <Badge
                      className={`text-xs px-1.5 py-0.5 font-medium ${
                        card.changeType === "positive"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}
                    >
                      {card.change}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-700 mb-1">
                      {card.title}
                    </h3>
                    <p className="text-2xl font-bold text-slate-900 mb-1">
                      {card.value}
                    </p>
                    <p className="text-xs text-slate-500 leading-tight">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Main Content - Responsive Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 min-h-0">
        {/* Middle Column - Recent Activity */}
        <div className="lg:col-span-1 xl:col-span-1">
          <Card className="bg-white border border-slate-200 shadow-sm h-full flex flex-col">
            <CardHeader className="pb-3 border-b border-slate-100 flex-shrink-0">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center">
                <div className="p-1.5 bg-green-100 rounded-md mr-2">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex-1 overflow-y-auto">
              <div className="space-y-2">
                {recentActivities.slice(0, 6).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-2 p-2 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className={`p-1 rounded-full ${
                          activity.type === "completion"
                            ? "bg-green-100"
                            : activity.type === "creation"
                            ? "bg-blue-100"
                            : activity.type === "assignment"
                            ? "bg-purple-100"
                            : activity.type === "update"
                            ? "bg-orange-100"
                            : "bg-indigo-100"
                        }`}
                      >
                        {activity.type === "completion" && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                        {activity.type === "creation" && (
                          <Plus className="h-3 w-3 text-blue-600" />
                        )}
                        {activity.type === "assignment" && (
                          <Users className="h-3 w-3 text-purple-600" />
                        )}
                        {activity.type === "update" && (
                          <Activity className="h-3 w-3 text-orange-600" />
                        )}
                        {activity.type === "milestone" && (
                          <CheckSquare className="h-3 w-3 text-indigo-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs leading-relaxed">
                        <span className="font-semibold text-slate-900">
                          {activity.user}
                        </span>
                        <span className="text-slate-600">
                          {" "}
                          {activity.action}{" "}
                        </span>
                        <span className="font-medium text-slate-800 truncate">
                          {activity.target}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        <Clock className="h-2.5 w-2.5 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Upcoming Deadlines & Team Widget */}
        <div className="lg:col-span-2 xl:col-span-1 space-y-2 sm:space-y-3">
          {/* Upcoming Deadlines */}
          <Card className="bg-white border border-slate-200 shadow-sm flex-1">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center">
                <div className="p-1.5 bg-red-100 rounded-md mr-2">
                  <Calendar className="h-4 w-4 text-red-600" />
                </div>
                Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {upcomingDeadlines.slice(0, 4).map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex items-start justify-between p-2 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">
                          {deadline.task}
                        </h4>
                        <Badge
                          className={`text-xs px-1 py-0.5 font-medium ${
                            deadline.priority === "high"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-blue-100 text-blue-700 border-blue-200"
                          }`}
                        >
                          {deadline.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mb-1 truncate">
                        {deadline.project}
                      </p>
                      <div className="flex items-center text-xs text-slate-500">
                        <Calendar className="h-2.5 w-2.5 mr-1" />
                        {deadline.dueDate}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <div
                        className={`p-1 rounded-full ${
                          deadline.priority === "high"
                            ? "bg-red-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {deadline.priority === "high" ? (
                          <AlertCircle className="h-3 w-3 text-red-600" />
                        ) : (
                          <Clock className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Members Widget - Only show for organizational users */}
        </div>

        {canAccessTeamFeatures && (
          <div className="flex-shrink-0">
            <TeamMembersWidget showActions={false} maxItems={3} />
          </div>
        )}
      </div>
      {showCreateTask && (
        <div className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0">
          <div
            className="drawer-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreateTask(false)}
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
              <h2 className="text-2xl font-bold text-white">Create New Task</h2>
              <button
                onClick={() => setShowCreateTask(false)}
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
                onClose={() => setShowCreateTask(false)}
                initialTaskType={selectedTaskType}
              />
            </div>
          </div>
        </div>
      )}
      {/* Annual Self-Appraisal Form */}
      {showSelfAppraisal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={() => setShowSelfAppraisal(false)}
          ></div>
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="relative bg-white rounded shadow-lg max-w-3xl mx-auto">
              <div className="flex justify-between items-center bg-gray-100 p-4 border-b">
                <h2 className="text-lg font-semibold">
                  Annual Self-Appraisal Form
                </h2>
                <button
                  onClick={() => setShowSelfAppraisal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <AnnualSelfAppraisal
                  onClose={() => setShowSelfAppraisal(false)}
                  employeeData={sampleEmployeeData}
                />
              </div>
            </div>
          </div>
        </div>
      )}
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
                onClose={() => setShowApprovalTaskModal(false)}
                onSubmit={handleCreateApprovalTask}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
