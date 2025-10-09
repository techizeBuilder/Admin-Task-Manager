import { useState,useEffect } from "react";

export default function AdminNotification() {
    const [notifications, setNotifications] = useState([
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
  
 
  
    const [filter, setFilter] = useState("all");

  
    const unreadCount = notifications.filter((n) => !n.read).length;
  
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
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
      );
    };
  
    const markAllAsRead = () => {
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    };
  
    const deleteNotification = (notificationId) => {
      setNotifications(notifications.filter((n) => n.id !== notificationId));
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
                        deleteNotification(notification.id);
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