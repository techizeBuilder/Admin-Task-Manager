import React, { useState, useEffect } from "react";

export default function NotificationCenter() {
  // Local state for notifications since store doesn't exist yet
  const [notifications, setNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    desktopNotifications: false,
    soundEnabled: true
  });

  // Mock functions - these will be replaced when proper store is implemented
  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const updateNotificationSettings = (settings) => {
    setNotificationSettings(prev => ({ ...prev, ...settings }));
  };
  
  const checkReminders = () => {
    console.log("Checking reminders...");
  };

  // Initialize notifications on component mount
  useEffect(() => {
    setNotifications([
    {
      id: 1,
      type: "assignment",
      title: "New task assigned",
      message: 'You have been assigned "Database Migration"',
      timestamp: "2024-01-22 10:30:00",
      read: false,
      taskId: 1,
      priority: "medium",
    },
    {
      id: 2,
      type: "due_date",
      title: "Task due soon",
      message: 'Task "API Documentation" is due in 3 days',
      timestamp: "2024-01-22 09:00:00",
      read: false,
      taskId: 3,
      priority: "high",
    },
    {
      id: 3,
      type: "mention",
      title: "You were mentioned",
      message: "John Smith mentioned you in a comment",
      timestamp: "2024-01-22 11:15:00",
      read: true,
      taskId: 1,
      priority: "medium",
    },
    {
      id: 4,
      type: "status_change",
      title: "Task status updated",
      message: 'Task "Mobile App Redesign" was marked as completed',
      timestamp: "2024-01-21 16:45:00",
      read: true,
      taskId: 2,
      priority: "low",
    },
    {
      id: 5,
      type: "snooze_wakeup",
      title: "Snoozed task is back",
      message: 'Task "API Documentation" is no longer snoozed',
      timestamp: "2024-01-22 09:00:00",
      read: false,
      taskId: 3,
      priority: "medium",
    },
    {
      id: 6,
      type: "overdue",
      title: "Task overdue",
      message: 'Task "Security Audit" is 2 days overdue',
      timestamp: "2024-01-22 08:00:00",
      read: false,
      taskId: 4,
      priority: "critical",
    },
  ]);
  }, []); // Close the useEffect properly

  const [filter, setFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);

  // Use only the notifications state (removed staticNotifications reference)
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Check for reminders periodically
  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkReminders]);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });

  const getNotificationIcon = (type) => {
    const icons = {
      assignment: "👤",
      due_date: "⏰",
      overdue: "🚨",
      mention: "💬",
      status_change: "✏️",
      snooze_wakeup: "😴",
      reminder: "🔔",
    };
    return icons[type] || "📝";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: "#ff4444",
      high: "#ff8800",
      medium: "#0099ff",
      low: "#00aa44",
    };
    return colors[priority] || "#666";
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const markAsRead = (notificationId) => {
    markNotificationRead(notificationId);
  };

  const markAllAsRead = () => {
    markAllNotificationsRead();
  };

  const handleDeleteNotification = (notificationId) => {
    deleteNotification(notificationId);
  };

  const handleSettingChange = (path, value) => {
    const keys = path.split(".");
    if (keys.length === 1) {
      updateNotificationSettings({ [keys[0]]: value });
    } else if (keys.length === 2) {
      updateNotificationSettings({
        [keys[0]]: {
          ...notificationSettings[keys[0]],
          [keys[1]]: value,
        },
      });
    }
  };

  const handleDueDateReminderChange = (days) => {
    const updatedDays = settings.dueDateReminders.daysBeforeDue.includes(days)
      ? settings.dueDateReminders.daysBeforeDue.filter((d) => d !== days)
      : [...settings.dueDateReminders.daysBeforeDue, days].sort(
          (a, b) => b - a,
        );

    setSettings({
      ...settings,
      dueDateReminders: {
        ...settings.dueDateReminders,
        daysBeforeDue: updatedDays,
      },
    });
  };

  // Simulate notification generation
  useEffect(() => {
    const interval = setInterval(() => {
      // This would typically come from a backend service
      if (Math.random() < 0.1) {
        // 10% chance every 30 seconds
        const newNotification = {
          id: Date.now(),
          type: "reminder",
          title: "System reminder",
          message: "Don't forget to check your overdue tasks",
          timestamp: new Date().toISOString(),
          read: false,
          taskId: null,
          priority: "low",
        };
        setNotifications((prev) => [newNotification, ...prev]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (showSettings) {
    return (
      <NotificationSettings
        settings={notificationSettings}
        onSettingsChange={updateNotificationSettings}
        onBack={() => setShowSettings(false)}
      />
    );
  }

  return (
    <div className="space-y-6 p-5 h-auto overflow-scroll">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllAsRead}>
              Mark All Read
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={() => setShowSettings(true)}
          >
            <span className="mr-2">⚙️</span>
            Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="assignment">Assignments</option>
            <option value="due_date">Due Date Reminders</option>
            <option value="overdue">Overdue Alerts</option>
            <option value="mention">Mentions</option>
            <option value="status_change">Status Changes</option>
            <option value="snooze_wakeup">Snooze Wake-ups</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${!notification.read ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border">
                <span className="text-sm">
                  {getNotificationIcon(notification.type)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: getPriorityColor(notification.priority),
                        }}
                      >
                        {notification.priority}
                      </span>
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600 ml-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                  >
                    <svg
                      className="w-4 h-4"
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
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500">
              {filter === "unread"
                ? "All caught up! No unread notifications."
                : "You're all set! No notifications to show."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationSettings({ settings, onSettingsChange, onBack }) {
  const [activeSection, setActiveSection] = useState("delivery");

  const handleToggle = (setting) => {
    onSettingsChange({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  const sections = [
    { id: "delivery", label: "Delivery", icon: "📨", count: 2 },
    { id: "reminders", label: "Reminders", icon: "⏰", count: 3 },
    { id: "advanced", label: "Advanced", icon: "⚙️", count: 4 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-scroll">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center">
            <div className="flex items-center w-full justify-between gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Notifications
              </button>

              <div className="flex items-center  gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Notification Settings
                  </h1>
                  <p className="text-gray-600">
                    Customize how and when you receive notifications
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Settings Categories
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-between group ${
                      activeSection === section.id
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{section.icon}</span>
                      <span>{section.label}</span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        activeSection === section.id
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }`}
                    >
                      {section.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Enhanced Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl overflow-hidden">
              {/* Delivery Preferences */}
              {activeSection === "delivery" && (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📨</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Delivery Preferences
                      </h2>
                      <p className="text-sm text-gray-600">
                        Choose how you want to receive notifications
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">📧</span>
                            <h3 className="text-base font-semibold text-gray-900">
                              Email notifications
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Receive notifications via email
                          </p>
                          <div className="text-xs text-gray-500">
                            ✓ Task assignments, updates, and deadlines
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={() => handleToggle("emailNotifications")}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">🔔</span>
                            <h3 className="text-base font-semibold text-gray-900">
                              Push notifications
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Receive browser push notifications
                          </p>
                          <div className="text-xs text-gray-500">
                            ✓ Real-time alerts and instant updates
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.pushNotifications}
                            onChange={() => handleToggle("pushNotifications")}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Due Date Reminders */}
              {activeSection === "reminders" && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">⏰</span>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Due Date Reminders
                      </h2>
                      <p className="text-sm text-gray-600">
                        Get reminded before tasks are due
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📅</span>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              Enable due date reminders
                            </h3>
                            <p className="text-sm text-gray-600">
                              Receive reminders before tasks are due
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.dueDateReminders}
                            onChange={() => handleToggle("dueDateReminders")}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600"></div>
                        </label>
                      </div>

                      {settings.dueDateReminders && (
                        <div className="space-y-3 pt-3 border-t border-orange-200">
                          <div className="space-y-2">
                            <div className="flex items-center gap-1">
                              <span>⏱️</span>
                              <h4 className="text-sm font-semibold text-gray-900">
                                Remind me:
                              </h4>
                            </div>

                            <div className="flex items-center gap-2">
                              {[
                                { days: 7, label: "7 days", desc: "Week" },
                                { days: 3, label: "3 days", desc: "Few days" },
                                { days: 1, label: "1 day", desc: "Last min" },
                              ].map(({ days, label, desc }) => {
                                const isSelected =
                                  settings.dueDateReminders?.daysBeforeDue?.includes(
                                    days,
                                  );
                                return (
                                  <label key={days} className="relative block">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        const currentDays =
                                          settings.dueDateReminders
                                            ?.daysBeforeDue || [];
                                        const newDays = e.target.checked
                                          ? [...currentDays, days].sort(
                                              (a, b) => b - a,
                                            )
                                          : currentDays.filter(
                                              (d) => d !== days,
                                            );

                                        onSettingsChange({
                                          ...settings,
                                          dueDateReminders: {
                                            ...settings.dueDateReminders,
                                            daysBeforeDue: newDays,
                                          },
                                        });
                                      }}
                                      className="sr-only"
                                    />

                                    <div
                                      className={`border bg-white rounded-md p-1.5 transition-all cursor-pointer ${
                                        isSelected
                                          ? "border-orange-500 bg-orange-50"
                                          : "border-gray-200 hover:border-orange-300"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="text-sm font-medium text-gray-900">
                                            {label}
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            {desc}
                                          </div>
                                        </div>
                                        <div
                                          className={`w-3 h-3 border rounded flex items-center justify-center ${
                                            isSelected
                                              ? "border-orange-500 bg-orange-500"
                                              : "border-gray-300"
                                          }`}
                                        >
                                          {isSelected && (
                                            <svg
                                              className="w-2 h-2 text-white"
                                              fill="currentColor"
                                              viewBox="0 0 20 20"
                                            >
                                              <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                              />
                                            </svg>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-1">
                              <span>🕘</span>
                              <h4 className="text-sm font-semibold text-gray-900">
                                Reminder time:
                              </h4>
                            </div>
                            <div className="bg-white rounded-md border border-gray-200 p-1.5 w-fit">
                              <input
                                type="time"
                                value={settings.dueDateReminders.time}
                                onChange={(e) =>
                                  onSettingsChange({
                                    ...settings,
                                    dueDateReminders: {
                                      ...settings.dueDateReminders,
                                      time: e.target.value,
                                    },
                                  })
                                }
                                className="text-sm font-medium text-gray-900 bg-transparent border-none outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              {activeSection === "advanced" && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">⚙️</span>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Advanced Settings
                      </h2>
                      <p className="text-sm text-gray-600">
                        Fine-tune your notification preferences
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-100">
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                          <span>🔕</span>
                          Quiet Hours
                        </h3>
                        <p className="text-sm text-gray-600">
                          Set times when you don't want to receive notifications
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start time
                            </label>
                            <input
                              type="time"
                              defaultValue="22:00"
                              className="w-full text-sm border border-gray-200 rounded-md px-2 py-1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End time
                            </label>
                            <input
                              type="time"
                              defaultValue="08:00"
                              className="w-full text-sm border border-gray-200 rounded-md px-2 py-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                          <span>📊</span>
                          Digest Settings
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive summary notifications instead of individual
                          ones
                        </p>
                        <div className="flex flex-col gap-2 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="digest"
                              value="none"
                              defaultChecked
                              className="w-3 h-3 text-green-600"
                            />
                            <span className="text-sm text-gray-700">
                              Send notifications immediately
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="digest"
                              value="hourly"
                              className="w-3 h-3 text-green-600"
                            />
                            <span className="text-sm text-gray-700">
                              Hourly digest
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="digest"
                              value="daily"
                              className="w-3 h-3 text-green-600"
                            />
                            <span className="text-sm text-gray-700">
                              Daily digest
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3 border border-red-100">
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                          <span>🚨</span>
                          Priority Filter
                        </h3>
                        <p className="text-sm text-gray-600">
                          Only receive notifications for specific priority
                          levels
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[
                            { level: "low", color: "green", label: "Low" },
                            {
                              level: "medium",
                              color: "yellow",
                              label: "Medium",
                            },
                            { level: "high", color: "orange", label: "High" },
                            {
                              level: "critical",
                              color: "red",
                              label: "Critical",
                            },
                          ].map(({ level, color, label }) => (
                            <label
                              key={level}
                              className="flex items-center gap-1 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                defaultChecked
                                className="w-3 h-3"
                              />
                              <span
                                className={`px-2 py-0.5 rounded text-sm font-medium bg-${color}-100 text-${color}-800`}
                              >
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-sm">🎯</span>
                            <h3 className="text-sm font-semibold text-gray-900">
                              Smart notifications
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            Use AI to optimize notification timing
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="sr-only peer"
                          />
                          <div className="w-8 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
