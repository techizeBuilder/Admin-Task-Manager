import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Search, User, Settings, LogOut, Edit3 } from "lucide-react";
import ProfileUpdateModal from "@/components/profile/ProfileUpdateModal";
import { UserAvatar } from "@/components/ui/user-avatar";

export default function Header({ user }) {
  const [, setLocation] = useLocation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    {
      id: 1,
      type: "assignment",
      title: "New task assigned",
      message: 'You have been assigned "Database Migration"',
      timestamp: "2024-01-22 10:30:00",
      read: false,
      priority: "medium",
    },
    {
      id: 2,
      type: "due_date",
      title: "Task due soon",
      message: 'Task "API Documentation" is due in 3 days',
      timestamp: "2024-01-22 09:00:00",
      read: false,
      priority: "high",
    },
    {
      id: 3,
      type: "mention",
      title: "You were mentioned",
      message: "John Smith mentioned you in a comment",
      timestamp: "2024-01-22 11:15:00",
      read: true,
      priority: "medium",
    },
    {
      id: 4,
      type: "status_change",
      title: "Task status updated",
      message: 'Task "Mobile App Redesign" was marked as completed',
      timestamp: "2024-01-21 16:45:00",
      read: true,
      priority: "low",
    },
    {
      id: 5,
      type: "overdue",
      title: "Task overdue",
      message: 'Task "Security Audit" is 2 days overdue',
      timestamp: "2024-01-22 08:00:00",
      read: false,
      priority: "critical",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const queryClient = useQueryClient();

  // Fetch fresh user data for the header - use stable caching to prevent flickering
  const { data: profileUser } = useQuery({
    queryKey: ["/api/profile"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const { data: authUser } = useQuery({
    queryKey: ["/api/auth/verify"],
    initialData: user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Merge profile data with auth data to ensure all fields are available
  const currentUser = {
    ...user,
    ...authUser,
    ...profileUser, // Profile data takes highest priority and includes profileImageUrl
  };
  
  // Debug avatar data flow in development
  if (process.env.NODE_ENV === 'development') {
    console.log("Header Avatar Debug:", {
      user: user ? { email: user.email, firstName: user.firstName, lastName: user.lastName, profileImageUrl: user.profileImageUrl } : null,
      authUser: authUser ? { email: authUser.email, firstName: authUser.firstName, lastName: authUser.lastName, profileImageUrl: authUser.profileImageUrl } : null,
      profileUser: profileUser ? { email: profileUser.email, firstName: profileUser.firstName, lastName: profileUser.lastName, profileImageUrl: profileUser.profileImageUrl } : null,
      currentUser: currentUser ? { email: currentUser.email, firstName: currentUser.firstName, lastName: currentUser.lastName, profileImageUrl: currentUser.profileImageUrl } : null
    });
  }
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      localStorage.removeItem("token");
      queryClient.clear();
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      localStorage.removeItem("token");
      queryClient.clear();
      setLocation("/login");
    }
  };

  const getDisplayName = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    return currentUser?.email?.split("@")[0] || "User";
  };

  const getInitials = () => {
    // Always prioritize first name + last name initials
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(
        0,
      )}`.toUpperCase();
    }

    // If only first name exists, use first character twice
    if (currentUser?.firstName) {
      return `${currentUser.firstName.charAt(0)}${currentUser.firstName.charAt(
        0,
      )}`.toUpperCase();
    }

    // Fallback to email prefix only if no name is available
    if (currentUser?.email) {
      const emailPrefix = currentUser.email.split("@")[0];
      return emailPrefix.substring(0, 2).toUpperCase();
    }

    return "U";
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
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };
  return (
    <header className="bg-white border-b border-gray-200 px-3 py-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative ml-4">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-6 pr-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent w-32"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Bell className="h-3 w-3" />
          </Button> */}
          <div className="relative notification-dropdown">
            <button
              className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              {/* Proper bell icon */}
              <svg
                className="w-[25px] h-[25px]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 -right-[2px] bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-96 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-y-auto">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                          !notification.read
                            ? "bg-blue-50 hover:bg-blue-100"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border">
                            <span className="text-sm">
                              {getNotificationIcon(notification.type)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900 mb-1">
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  <span
                                    className="text-xs font-medium"
                                    style={{
                                      color: getPriorityColor(
                                        notification.priority,
                                      ),
                                    }}
                                  >
                                    {notification.priority}
                                  </span>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="text-gray-400 text-4xl mb-2">🔔</div>
                      <p className="text-gray-500">No notifications</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        // You can add navigation to full notifications page here
                      }}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View All Notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-6 w-6 rounded-full p-0"
              >
                <UserAvatar user={currentUser} size="md" className="h-8 w-8" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-gray-800 text-white"
              align="end"
              forceMount
            >
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">
                  {getDisplayName()}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLocation("/edit-profile")}
                className="cursor-pointer"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem> */}
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ProfileUpdateModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
}
