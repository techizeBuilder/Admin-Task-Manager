import React, { useState, useEffect } from "react";


export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState("notifications");
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    dueDateReminders: {
      enabled: true,
      daysBeforeDue: [3, 1],
      time: "09:00",
    },
    overdueReminders: {
      enabled: true,
      frequency: "daily", // daily, every3days, weekly
    },
    assignmentNotifications: true,
    mentionNotifications: true,
    statusChangeNotifications: true,
    snoozeWakeupNotifications: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
    weekendNotifications: false,
  });
  const handleToggle = (setting) => {
    onSettingsChange({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  const sections = [
    { id: "notifications", label: "Notifications", icon: "🔔", count: 1 },
    { id: "delivery", label: "Delivery", icon: "📨", count: 2 },
    { id: "reminders", label: "Reminders", icon: "⏰", count: 3 },
    { id: "advanced", label: "Advanced", icon: "⚙️", count: 4 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-scroll">
      {/* Enhanced Header */}
   

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
              {/* Notifications Center */}
              {activeSection === "notifications" && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">🔔</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Notification Center
                      </h2>
                      <p className="text-gray-600">
                        Manage and view all your notifications
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg">📱</span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Notification Center
                            </h3>
                          </div>
                          <p className="text-gray-600 mb-4">
                            Access your comprehensive notification dashboard with filtering, settings, and management tools
                          </p>
                          <div className="text-sm text-gray-500 mb-4">
                            ✓ View all notifications in one place<br/>
                            ✓ Filter by type, status, and priority<br/>
                            ✓ Manage notification preferences<br/>
                            ✓ Mark as read/unread and delete options
                          </div>
                          <a 
                            href="/notifications" 
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            data-testid="link-notification-center"
                          >
                            <span className="mr-2">🔔</span>
                            Open Notification Center
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Delivery Preferences */}
              {activeSection === "delivery" && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">📨</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Delivery Preferences
                      </h2>
                      <p className="text-gray-600">
                        Choose how you want to receive notifications
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg">📧</span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Email notifications
                            </h3>
                          </div>
                          <p className="text-gray-600">
                            Receive notifications via email
                          </p>
                          <div className="mt-3 text-sm text-gray-500">
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
                          <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg">🔔</span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Push notifications
                            </h3>
                          </div>
                          <p className="text-gray-600">
                            Receive browser push notifications
                          </p>
                          <div className="mt-3 text-sm text-gray-500">
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
                          <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Due Date Reminders */}
              {activeSection === "reminders" && (
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">⏰</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Due Date Reminders
                      </h2>
                      <p className="text-gray-600">
                        Get reminded before tasks are due
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-lg">📅</span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Enable due date reminders
                            </h3>
                          </div>
                          <p className="text-gray-600">
                            Receive reminders before tasks are due
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.dueDateReminders}
                            onChange={() => handleToggle("dueDateReminders")}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-red-600"></div>
                        </label>
                      </div>

                      {settings.dueDateReminders && (
                        <div className="space-y-6 pt-6 border-t border-orange-200">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <span>⏱️</span>
                              Remind me:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {[
                                {
                                  days: 7,
                                  label: "7 days before",
                                  desc: "Week ahead",
                                },
                                {
                                  days: 3,
                                  label: "3 days before",
                                  desc: "Few days",
                                },
                                {
                                  days: 1,
                                  label: "1 day before",
                                  desc: "Last minute",
                                },
                              ].map(({ days, label, desc }) => (
                                <label key={days} className="relative">
                                  <input
                                    type="checkbox"
                                    checked={settings.dueDateReminders.daysBeforeDue.includes(
                                      days,
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        const newDays = [
                                          ...settings.dueDateReminders
                                            .daysBeforeDue,
                                          days,
                                        ].sort((a, b) => b - a);
                                        onSettingsChange({
                                          ...settings,
                                          dueDateReminders: {
                                            ...settings.dueDateReminders,
                                            daysBeforeDue: newDays,
                                          },
                                        });
                                      } else {
                                        const newDays =
                                          settings.dueDateReminders.daysBeforeDue.filter(
                                            (d) => d !== days,
                                          );
                                        onSettingsChange({
                                          ...settings,
                                          dueDateReminders: {
                                            ...settings.dueDateReminders,
                                            daysBeforeDue: newDays,
                                          },
                                        });
                                      }
                                    }}
                                    className="sr-only peer"
                                  />
                                  <div className="bg-white border-2 border-gray-200 rounded-xl p-4 cursor-pointer transition-all duration-300 peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:border-orange-300">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {label}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {desc}
                                        </div>
                                      </div>
                                      <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:border-orange-500 peer-checked:bg-orange-500 flex items-center justify-center">
                                        {settings.dueDateReminders.daysBeforeDue.includes(
                                          days,
                                        ) && (
                                          <svg
                                            className="w-3 h-3 text-white"
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
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <span>🕘</span>
                              Reminder time:
                            </h4>
                            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 max-w-xs">
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
                                className="w-full text-lg font-medium text-gray-900 bg-transparent border-none outline-none"
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
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
                      <span className="text-xl">⚙️</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Advanced Settings
                      </h2>
                      <p className="text-gray-600">
                        Fine-tune your notification preferences
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span>🔕</span>
                        Quiet Hours
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Set times when you don't want to receive notifications
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start time
                          </label>
                          <input
                            type="time"
                            defaultValue="22:00"
                            className="form-input w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End time
                          </label>
                          <input
                            type="time"
                            defaultValue="08:00"
                            className="form-input w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span>📊</span>
                        Digest Settings
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Receive summary notifications instead of individual ones
                      </p>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="digest"
                            value="none"
                            defaultChecked
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-gray-700">
                            Send notifications immediately
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="digest"
                            value="hourly"
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-gray-700">Hourly digest</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="digest"
                            value="daily"
                            className="w-4 h-4 text-green-600"
                          />
                          <span className="text-gray-700">Daily digest</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span>🚨</span>
                        Priority Filter
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Only receive notifications for specific priority levels
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { level: "low", color: "green", label: "Low" },
                          { level: "medium", color: "yellow", label: "Medium" },
                          { level: "high", color: "orange", label: "High" },
                          {
                            level: "critical",
                            color: "red",
                            label: "Critical",
                          },
                        ].map(({ level, color, label }) => (
                          <label
                            key={level}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              defaultChecked
                              className={`w-4 h-4 text-${color}-600`}
                            />
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}
                            >
                              {label}
                            </span>
                          </label>
                        ))}
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
