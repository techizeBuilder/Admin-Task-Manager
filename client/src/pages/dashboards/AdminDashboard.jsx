import React from "react";
import { StatsCard } from "@/components/admin/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CheckSquare, 
  Clock, 
  AlertTriangle,
  Plus,
  Bell,
  Activity
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Tasks",
      value: "1,234",
      change: "+12% from last month",
      trend: "up",
      icon: CheckSquare,
      iconColor: "text-blue-600",
    },
    {
      title: "Team Members",
      value: "856",
      change: "+8% from last month", 
      trend: "up",
      icon: Users,
      iconColor: "text-emerald-600",
    },
    {
      title: "In Progress",
      value: "234",
      change: "+3% from last month",
      trend: "up",
      icon: Clock,
      iconColor: "text-purple-600",
    },
    {
      title: "Overdue",
      value: "12",
      change: "-5% from last month",
      trend: "down",
      icon: AlertTriangle,
      iconColor: "text-red-600",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: "New task assigned",
      description: "Database Migration task assigned to John Doe",
      timestamp: "2 hours ago",
      type: "assignment"
    },
    {
      id: 2,
      title: "Project completed",
      description: "Mobile App Redesign project marked as completed",
      timestamp: "4 hours ago",
      type: "completion"
    },
    {
      id: 3,
      title: "Team member added",
      description: "Sarah Johnson joined the development team",
      timestamp: "1 day ago",
      type: "team"
    }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">
            Overview of your organization's tasks and team performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
          <Button variant="outline">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest updates and changes in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button className="justify-start h-auto p-4" variant="outline">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Create New Task</p>
                    <p className="text-sm text-gray-500">Assign work to team members</p>
                  </div>
                </div>
              </Button>
              
              <Button className="justify-start h-auto p-4" variant="outline">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Invite Team Member</p>
                    <p className="text-sm text-gray-500">Add new people to your organization</p>
                  </div>
                </div>
              </Button>
              
              <Button className="justify-start h-auto p-4" variant="outline">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">View Reports</p>
                    <p className="text-sm text-gray-500">Analyze team performance</p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}