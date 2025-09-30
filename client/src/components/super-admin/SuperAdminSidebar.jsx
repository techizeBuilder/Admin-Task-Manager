import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  FileText,
  Settings,
  Shield,
  Palette,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

export default function SuperAdminSidebar({ isCollapsed, setIsCollapsed }) {
  const [location] = useLocation();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/super-admin",
      active: location === "/super-admin",
    },
    {
      icon: Building2,
      label: "Companies",
      href: "/super-admin/companies",
      active: location.startsWith("/super-admin/companies"),
    },
    {
      icon: Users,
      label: "All Users",
      href: "/super-admin/users",
      active: location === "/super-admin/users",
    },
    {
      icon: CreditCard,
      label: "Subscriptions",
      href: "/super-admin/subscriptions",
      active: location.startsWith("/super-admin/subscriptions"),
    },
    {
      icon: Activity,
      label: "Platform Analytics",
      href: "/super-admin/analytics",
      active: location === "/super-admin/analytics",
    },
    // {
    //   icon: FileText,
    //   label: "System Logs",
    //   href: "/super-admin/logs",
    //   active: location === "/super-admin/logs",
    // },
    {
      icon: Shield,
      label: "Admin Management",
      href: "/super-admin/admins",
      active: location === "/super-admin/admins",
    },
    {
      icon: Palette,
      label: "Login Customization",
      href: "/super-admin/login-customization",
      active: location === "/super-admin/login-customization",
    },
    {
      icon: Settings,
      label: "System Settings",
      href: "/super-admin/settings",
      active: location === "/super-admin/settings",
    },
  ];

  return (
    <div
      className={`bg-sidebarDark text-white h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-600/30">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">Super Admin</h1>
              <p className="text-xs text-gray-300">Platform Control</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-sidebarHover transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 border-b border-gray-600/20 ${
                  item.active
                    ? "bg-sidebarActive text-white shadow-md"
                    : "text-gray-300 hover:bg-sidebarHover hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-600/30">
        <button
          onClick={() => (window.location.href = "/api/logout")}
          className={`flex items-center gap-3 p-2.5 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 w-full ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
