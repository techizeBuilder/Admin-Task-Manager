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
import RoleSwitcher from "../RoleSwitcher";
import { useAuthStore } from "../../stores/useAuthStore";

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
  const { setUser, logout } = useAuthStore()
  // Get auth user first
  const { data: authUser } = useQuery({
    queryKey: ["/api/auth/verify"],
    initialData: user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user data using the same endpoint that works in EditProfile
  const { data: profileUser } = useQuery({
    queryKey: ["/api/users", authUser?.id],
    queryFn: async () => {
      if (authUser?.id) {
        const response = await fetch(`/api/users/${authUser.id}`);

        if (response.ok) {
          const userData = await response.json();
          setUser(userData)

          console.log("Header fetched user data:", userData);
          return userData;
        }
      }
      return null;
    },
    enabled: !!authUser?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Use profile data primarily (which has the correct profileImageUrl), fallback to auth data
  const currentUser = profileUser || authUser || user;

  // Debug avatar data flow in development
  // if (process.env.NODE_ENV === "development") {
  //   console.log("Header Avatar Debug:", {
  //     user: user
  //       ? {
  //           email: user.email,
  //           firstName: user.firstName,
  //           lastName: user.lastName,
  //           profileImageUrl: user.profileImageUrl,
  //         }
  //       : null,
  //     authUser: authUser
  //       ? {
  //           email: authUser.email,
  //           firstName: authUser.firstName,
  //           lastName: authUser.lastName,
  //           profileImageUrl: authUser.profileImageUrl,
  //         }
  //       : null,
  //     profileUser: profileUser
  //       ? {
  //           email: profileUser.email,
  //           firstName: profileUser.firstName,
  //           lastName: profileUser.lastName,
  //           profileImageUrl: profileUser.profileImageUrl,
  //         }
  //       : null,
  //     currentUser: currentUser
  //       ? {
  //           email: currentUser.email,
  //           firstName: currentUser.firstName,
  //           lastName: currentUser.lastName,
  //           profileImageUrl: currentUser.profileImageUrl,
  //         }
  //       : null,
  //   });
  // }

  const handleLogout = async () => {
    try {

      localStorage.removeItem("token");
      logout()
      queryClient.clear();
      setLocation("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if API call fails
      localStorage.removeItem("token");
      logout()
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
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between h-10">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search tasks, users, projects..."
              className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-gray-50 hover:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Role Switcher */}
          {
            !profileUser?.role?.includes("individual") &&
            <RoleSwitcher />
          }

          {/* Notification Bell */}
          <div className="relative notification-dropdown">
            <button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white shadow-xl rounded-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
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
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${!notification.read
                            ? "bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500"
                            : "hover:bg-gray-50"
                          }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border shadow-sm">
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
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center space-x-3">
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>
                                  <span
                                    className={`text-xs font-medium px-2 py-1 rounded-full ${notification.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                        notification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                          notification.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                            'bg-green-100 text-green-700'
                                      }`}
                                  >
                                    {notification.priority}
                                  </span>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <div className="text-gray-300 text-5xl mb-3">🔔</div>
                      <h4 className="text-gray-600 font-medium mb-1">No notifications</h4>
                      <p className="text-gray-400 text-sm">You're all caught up!</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        setLocation("/notifications");
                      }}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      View All Notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* User Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100"
              >
                <UserAvatar user={currentUser} size="md" className="h-8 w-8" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 bg-white border border-gray-200 shadow-lg"
              align="end"
              forceMount
            >
              <div className="flex flex-col space-y-1 p-3 bg-gray-50 border-b">
                <p className="text-sm font-semibold text-gray-900 leading-none">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-gray-500 leading-none">
                  {currentUser?.email}
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1 capitalize">
                  {currentUser?.activeRole || currentUser?.role?.[0] || 'User'}
                </p>
              </div>
              <DropdownMenuItem
                onClick={() => setLocation("/edit-profile")}
                className="cursor-pointer hover:bg-gray-50"
              >
                <Edit3 className="mr-3 h-4 w-4 text-gray-500" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation("/notifications?settings=true")}
                className="cursor-pointer hover:bg-gray-50"
              >
                <Settings className="mr-3 h-4 w-4 text-gray-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer hover:bg-red-50 text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-3 h-4 w-4" />
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
