import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Monitor,
  Server,
  Database,
  Activity,
  Building2,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Globe,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';

/**
 * Super Admin Dashboard - Platform-wide administrative interface
 * Displays system metrics, organization management, and platform analytics
 */
const SuperAdminDashboard = () => {
  const [selectedMetric, setSelectedMetric] = useState('platform');
  const [refreshing, setRefreshing] = useState(false);

  // Get current user data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
  });

  // Sample platform-wide data
  const platformStats = {
    totalOrganizations: 23,
    totalUsers: 1247,
    activeUsers: 892,
    systemUptime: 99.7,
    totalTasks: 8462,
    completedTasks: 6234,
    systemLoad: 34,
    storageUsage: 67
  };

  const organizationMetrics = [
    { id: 1, name: 'TechCorp Solutions', users: 156, tasks: 1203, productivity: 94, status: 'active' },
    { id: 2, name: 'Digital Marketing Pro', users: 89, tasks: 672, productivity: 87, status: 'active' },
    { id: 3, name: 'StartupHub Inc', users: 45, tasks: 234, productivity: 78, status: 'active' },
    { id: 4, name: 'Global Consulting', users: 234, tasks: 1567, productivity: 91, status: 'active' },
    { id: 5, name: 'Innovation Labs', users: 67, tasks: 445, productivity: 83, status: 'trial' }
  ];

  const systemHealth = [
    { component: 'Web Server', status: 'healthy', uptime: '99.9%', lastCheck: '2 min ago' },
    { component: 'Database', status: 'healthy', uptime: '99.8%', lastCheck: '1 min ago' },
    { component: 'File Storage', status: 'warning', uptime: '98.2%', lastCheck: '5 min ago' },
    { component: 'Email Service', status: 'healthy', uptime: '99.7%', lastCheck: '3 min ago' },
    { component: 'Background Jobs', status: 'healthy', uptime: '99.5%', lastCheck: '4 min ago' }
  ];

  const recentActivities = [
    { id: 1, type: 'org_created', message: 'New organization "Design Studio" created', time: '2 hours ago', severity: 'info' },
    { id: 2, type: 'system_alert', message: 'High CPU usage detected on server-02', time: '4 hours ago', severity: 'warning' },
    { id: 3, type: 'license_renewal', message: 'Enterprise license renewed for TechCorp', time: '1 day ago', severity: 'success' },
    { id: 4, type: 'user_milestone', message: 'Platform reached 1000+ active users', time: '2 days ago', severity: 'success' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} className="text-green-600" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'error': return <AlertTriangle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'success': return 'border-l-green-500';
      case 'warning': return 'border-l-yellow-500';
      case 'error': return 'border-l-red-500';
      default: return 'border-l-blue-500';
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000); // Simulate refresh
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Platform-wide system monitoring and organization management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            data-testid="button-refresh"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            data-testid="button-export-analytics"
          >
            <Download size={18} />
            Export Analytics
          </button>
        </div>
      </div>

      {/* Platform Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border" data-testid="card-total-organizations">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Organizations</p>
              <p className="text-2xl font-bold text-gray-900">{platformStats.totalOrganizations}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border" data-testid="card-total-users">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{platformStats.totalUsers}</p>
              <p className="text-xs text-green-600 mt-1">{platformStats.activeUsers} active</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border" data-testid="card-system-uptime">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900">{platformStats.systemUptime}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Monitor className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border" data-testid="card-platform-tasks">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Platform Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{platformStats.totalTasks}</p>
              <p className="text-xs text-blue-600 mt-1">{platformStats.completedTasks} completed</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Activity className="text-indigo-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* System Health and Resource Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-lg shadow-sm border" data-testid="card-system-health">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemHealth.map((component, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  data-testid={`health-component-${index}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(component.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{component.component}</h3>
                      <p className="text-sm text-gray-500">Last check: {component.lastCheck}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(component.status)}`}>
                      {component.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{component.uptime}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="bg-white rounded-lg shadow-sm border" data-testid="card-resource-usage">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Resource Usage</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* System Load */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">System Load</span>
                <span className="text-sm text-gray-600">{platformStats.systemLoad}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${platformStats.systemLoad}%` }}
                ></div>
              </div>
            </div>

            {/* Storage Usage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                <span className="text-sm text-gray-600">{platformStats.storageUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${platformStats.storageUsage}%` }}
                ></div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="bg-yellow-100 p-3 rounded-lg mx-auto w-fit mb-2">
                  <Server className="text-yellow-600" size={20} />
                </div>
                <p className="text-sm text-gray-600">Server Load</p>
                <p className="text-lg font-semibold">Low</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-lg mx-auto w-fit mb-2">
                  <Database className="text-green-600" size={20} />
                </div>
                <p className="text-sm text-gray-600">DB Performance</p>
                <p className="text-lg font-semibold">Optimal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Management */}
      <div className="bg-white rounded-lg shadow-sm border" data-testid="card-organization-management">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Organization Management</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All Organizations
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasks
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productivity
                </th>
                <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizationMetrics.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50" data-testid={`org-row-${org.id}`}>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">{org.name}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">
                    {org.users}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-700">
                    {org.tasks}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{org.productivity}%</span>
                      <div className="w-12 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${org.productivity}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      org.status === 'active' 
                        ? 'text-green-700 bg-green-100' 
                        : 'text-yellow-700 bg-yellow-100'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border" data-testid="card-recent-activities">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Platform Activities</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 ${getSeverityColor(activity.severity)}`}
                data-testid={`activity-${activity.id}`}
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.severity === 'success' 
                    ? 'text-green-700 bg-green-100'
                    : activity.severity === 'warning'
                    ? 'text-yellow-700 bg-yellow-100'
                    : 'text-blue-700 bg-blue-100'
                }`}>
                  {activity.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6" data-testid="card-usage-analytics">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Usage Analytics</h2>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <TrendingUp className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-600">Usage analytics charts coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6" data-testid="card-global-metrics">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Global Performance Metrics</h2>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Globe className="mx-auto mb-2 text-gray-400" size={48} />
            <p className="text-gray-600">Global metrics dashboard coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;