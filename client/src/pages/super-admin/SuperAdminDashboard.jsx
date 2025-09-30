import { useState } from "react";
import { usePlatformAnalytics } from "@/hooks/super-admin/useSuperAdmin";
import { Building2, Users, FolderOpen, FileText, TrendingUp, Activity, CheckCircle, Clock, AlertCircle, UserCheck } from "lucide-react";
import SuperAdminLayout from "@/components/super-admin/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export default function SuperAdminDashboard() {
  const { data: analytics, isLoading } = usePlatformAnalytics();

  if (isLoading) {
    return (
      <SuperAdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  const overview = analytics?.overview || {};
  const recentActivity = analytics?.recentActivity || { users: [], tasks: [] };
  const growth = analytics?.growth || [];

  const statCards = [
    {
      title: "Total Companies",
      value: overview.totalCompanies || 0,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Total Users",
      value: overview.totalUsers || 0,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Total Projects",
      value: overview.totalProjects || 0,
      icon: FolderOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Total Tasks",
      value: overview.totalTasks || 0,
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    }
  ];

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Platform Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor and manage all companies and users across the platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            </div>
            <div className="space-y-3">
              {recentActivity.users.slice(0, 5).map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
            </div>
            <div className="space-y-3">
              {recentActivity.tasks.slice(0, 5).map((task) => (
                <div key={task._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">Priority: {task.priority}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Company Growth Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Company Growth</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {growth.slice(-6).map((period, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">
                  {period._id.year}-{String(period._id.month).padStart(2, '0')}
                </p>
                <p className="text-lg font-bold text-gray-900">{period.count}</p>
                <p className="text-xs text-gray-600">companies</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => window.location.href = '/super-admin/companies'}
              className="p-4 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Building2 className="h-6 w-6 text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Companies</p>
              <p className="text-xs text-gray-500">View and control all companies</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/super-admin/users'}
              className="p-4 text-left rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <Users className="h-6 w-6 text-green-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Users</p>
              <p className="text-xs text-gray-500">View all users across companies</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/super-admin/logs'}
              className="p-4 text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <FileText className="h-6 w-6 text-purple-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">System Logs</p>
              <p className="text-xs text-gray-500">Monitor system activity</p>
            </button>
            
            <button 
              onClick={() => window.location.href = '/super-admin/admins'}
              className="p-4 text-left rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <Activity className="h-6 w-6 text-indigo-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">Admin Management</p>
              <p className="text-xs text-gray-500">Manage super admins</p>
            </button>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}