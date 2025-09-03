import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bell, 
  BellOff, 
  Trash2, 
  MarkAsUnread, 
  Settings as SettingsIcon,
  Filter,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  User,
  MessageSquare,
  Target,
  CheckSquare,
  Clock
} from "lucide-react";

export default function NotificationCenter() {
  const [filter, setFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const queryClient = useQueryClient();

  // Sample notification data - replace with actual API call
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "assignment",
      title: "New task assigned to you",
      message: 'You have been assigned "Database Migration" in Project Alpha',
      timestamp: "2025-01-03T10:30:00Z",
      read: false,
      priority: "high",
      actionRequired: true,
      taskId: "task_001",
      assignedBy: "Sarah Johnson"
    },
    {
      id: 2,
      type: "due_date",
      title: "Task deadline approaching",
      message: 'Task "API Documentation" is due in 3 hours',
      timestamp: "2025-01-03T09:00:00Z",
      read: false,
      priority: "urgent",
      actionRequired: true,
      taskId: "task_003",
      dueDate: "2025-01-03T15:00:00Z"
    },
    {
      id: 3,
      type: "mention",
      title: "You were mentioned in a comment",
      message: "John Smith mentioned you in a comment on 'Mobile App Redesign'",
      timestamp: "2025-01-03T11:15:00Z",
      read: true,
      priority: "medium",
      actionRequired: false,
      taskId: "task_002",
      mentionedBy: "John Smith"
    },
    {
      id: 4,
      type: "status_change",
      title: "Task status updated",
      message: 'Task "Mobile App Redesign" was marked as completed by Team Lead',
      timestamp: "2025-01-02T16:45:00Z",
      read: true,
      priority: "low",
      actionRequired: false,
      taskId: "task_002",
      updatedBy: "Team Lead"
    },
    {
      id: 5,
      type: "reminder",
      title: "Daily standup reminder",
      message: "Your daily standup meeting starts in 15 minutes",
      timestamp: "2025-01-03T08:45:00Z",
      read: false,
      priority: "medium",
      actionRequired: true,
      meetingId: "meeting_001"
    },
    {
      id: 6,
      type: "approval",
      title: "Approval request pending",
      message: "Your approval is needed for 'Budget Allocation Q1 2025'",
      timestamp: "2025-01-03T07:30:00Z",
      read: false,
      priority: "high",
      actionRequired: true,
      requestId: "approval_001",
      requestedBy: "Finance Team"
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    desktopNotifications: false,
    soundEnabled: true,
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00"
    },
    categories: {
      assignments: true,
      deadlines: true,
      mentions: true,
      statusChanges: true,
      reminders: true,
      approvals: true
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.read).length;

  const getNotificationIcon = (type) => {
    const iconMap = {
      assignment: <User className="w-4 h-4" />,
      due_date: <Clock className="w-4 h-4" />,
      mention: <MessageSquare className="w-4 h-4" />,
      status_change: <CheckSquare className="w-4 h-4" />,
      reminder: <Bell className="w-4 h-4" />,
      approval: <Target className="w-4 h-4" />
    };
    return iconMap[type] || <Info className="w-4 h-4" />;
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      urgent: "bg-red-100 border-red-200 text-red-800",
      high: "bg-orange-100 border-orange-200 text-orange-800",
      medium: "bg-blue-100 border-blue-200 text-blue-800",
      low: "bg-gray-100 border-gray-200 text-gray-800"
    };
    return colorMap[priority] || colorMap.medium;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case "unread":
        return !notification.read;
      case "action_required":
        return notification.actionRequired && !notification.read;
      case "today":
        return new Date(notification.timestamp).toDateString() === new Date().toDateString();
      case "assignment":
      case "due_date":
      case "mention":
      case "status_change":
      case "reminder":
      case "approval":
        return notification.type === filter;
      default:
        return true;
    }
  });

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleNotificationSetting = (setting, category = null) => {
    if (category) {
      setNotificationSettings(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [category]: !prev.categories[category]
        }
      }));
    } else {
      setNotificationSettings(prev => ({
        ...prev,
        [setting]: !prev[setting]
      }));
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Notification Center</h1>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {unreadCount} unread
              </span>
            )}
            {actionRequiredCount > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                {actionRequiredCount} action required
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button 
            className="btn btn-secondary flex items-center gap-2"
            onClick={() => setShowSettings(!showSettings)}
            data-testid="button-notification-settings"
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </button>
          {unreadCount > 0 && (
            <button 
              className="btn btn-primary flex items-center gap-2" 
              onClick={markAllAsRead}
              data-testid="button-mark-all-read"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { value: "all", label: "All", count: notifications.length },
            { value: "unread", label: "Unread", count: unreadCount },
            { value: "action_required", label: "Action Required", count: actionRequiredCount },
            { value: "today", label: "Today", count: notifications.filter(n => new Date(n.timestamp).toDateString() === new Date().toDateString()).length },
            { value: "assignment", label: "Assignments", count: notifications.filter(n => n.type === "assignment").length },
            { value: "due_date", label: "Deadlines", count: notifications.filter(n => n.type === "due_date").length }
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                filter === filterOption.value
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
              data-testid={`filter-${filterOption.value}`}
            >
              {filterOption.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                filter === filterOption.value
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {filterOption.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600"
              data-testid="button-close-settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* General Settings */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">General Settings</h4>
              <div className="space-y-4">
                {[
                  { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
                  { key: "pushNotifications", label: "Push Notifications", desc: "Browser push notifications" },
                  { key: "desktopNotifications", label: "Desktop Notifications", desc: "System desktop notifications" },
                  { key: "soundEnabled", label: "Sound Effects", desc: "Play sound for new notifications" }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings[setting.key]}
                        onChange={() => toggleNotificationSetting(setting.key)}
                        className="sr-only peer"
                        data-testid={`toggle-${setting.key}`}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Settings */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Notification Categories</h4>
              <div className="space-y-4">
                {[
                  { key: "assignments", label: "Task Assignments", icon: User },
                  { key: "deadlines", label: "Deadlines & Due Dates", icon: Clock },
                  { key: "mentions", label: "Mentions & Comments", icon: MessageSquare },
                  { key: "statusChanges", label: "Status Changes", icon: CheckSquare },
                  { key: "reminders", label: "Reminders", icon: Bell },
                  { key: "approvals", label: "Approvals", icon: Target }
                ].map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-gray-500" />
                        <div className="font-medium text-gray-900">{category.label}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.categories[category.key]}
                          onChange={() => toggleNotificationSetting(null, category.key)}
                          className="sr-only peer"
                          data-testid={`toggle-category-${category.key}`}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filter === "all" ? "All Notifications" : 
             filter === "unread" ? "Unread Notifications" :
             filter === "action_required" ? "Action Required" :
             filter === "today" ? "Today's Notifications" :
             `${filter.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())} Notifications`}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">You're all caught up! No notifications match your current filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      !notification.read ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? "text-gray-900" : "text-gray-700"
                            }`}>
                              {notification.title}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                            {notification.actionRequired && (
                              <span className="px-2 py-1 text-xs rounded-full bg-orange-100 border border-orange-200 text-orange-800">
                                Action Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{formatTimestamp(notification.timestamp)}</span>
                            {notification.assignedBy && (
                              <span>• Assigned by {notification.assignedBy}</span>
                            )}
                            {notification.mentionedBy && (
                              <span>• Mentioned by {notification.mentionedBy}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Mark as read"
                              data-testid={`button-mark-read-${notification.id}`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete notification"
                            data-testid={`button-delete-${notification.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}