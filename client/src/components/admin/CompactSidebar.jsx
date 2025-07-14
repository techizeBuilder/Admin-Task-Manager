import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  FolderOpen,
  FileText,
  Settings,
  Shield,
  BarChart3,
  UserCog,
  X,
} from "lucide-react";

function Sidebar({ isOpen, isMobileMenuOpen, onToggle, onMobileToggle }) {
  const [location] = useLocation();

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const baseNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Projects", href: "/projects", icon: FolderOpen },
    { name: "Forms", href: "/forms", icon: FileText },
    { name: "Users", href: "/users", icon: Users },
    { name: "Roles", href: "/roles", icon: Shield },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Integrations", href: "/integrations", icon: Settings },
    { name: "Settings", href: "/settings/user-management", icon: UserCog },
  ];

  const navigation = baseNavigation;

  const isActive = (href) => {
    return location === href || (href === "/dashboard" && location === "/");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className="fixed inset-y-0 left-0 z-[1000] bg-sidebarDark w-56 border-r border-gray-600/30 shadow-xl"
        style={{ 
          display: 'block', 
          visibility: 'visible',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '224px',
          backgroundColor: '#253140',
          zIndex: 1000
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-12 px-3 border-b border-gray-600/30 bg-sidebarDark">
            <CheckSquare className="h-6 w-6 text-white" />
            <div className="ml-3">
              <h1 className="text-lg font-bold text-white">TaskSetu</h1>
              <p className="text-xs text-gray-300">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
            {/* Core Features */}
            <div className="space-y-0.5">
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Core Features
                </p>
              </div>

              {navigation.slice(0, 3).map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className={index < 2 ? 'border-b border-gray-600/30 pb-2 mb-2' : ''}>
                    <Link 
                      href={item.href} 
                      className={`group flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out relative ${
                        isActive(item.href)
                          ? 'bg-sidebarActive text-white shadow-lg'
                          : 'text-gray-300 hover:bg-sidebarHover hover:text-white'
                      }`}
                    >
                      <Icon className={`flex-shrink-0 h-4 w-4 transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-white'
                      } mr-2`} />

                      <span className="font-medium text-sm">{item.name}</span>

                      {isActive(item.href) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Management Section */}
            <div className="space-y-0.5 pt-2">
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Management
                </p>
              </div>

              {navigation.slice(3, 7).map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className={index < 3 ? 'border-b border-gray-600/30 pb-2 mb-2' : ''}>
                    <Link 
                      href={item.href} 
                      className={`group flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out relative ${
                        isActive(item.href)
                          ? 'bg-sidebarActive text-white shadow-lg'
                          : 'text-gray-300 hover:bg-sidebarHover hover:text-white'
                      }`}
                    >
                      <Icon className={`flex-shrink-0 h-4 w-4 transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-white'
                      } mr-2`} />

                      <span className="font-medium text-sm">{item.name}</span>

                      {isActive(item.href) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Settings Section */}
            <div className="space-y-0.5 pt-2">
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Settings
                </p>
              </div>

              {navigation.slice(7).map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.name}>
                    <Link 
                      href={item.href} 
                      className={`group flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out relative ${
                        isActive(item.href)
                          ? 'bg-sidebarActive text-white shadow-lg'
                          : 'text-gray-300 hover:bg-sidebarHover hover:text-white'
                      }`}
                    >
                      <Icon className={`flex-shrink-0 h-4 w-4 transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-white'
                      } mr-2`} />

                      <span className="font-medium text-sm">{item.name}</span>

                      {isActive(item.href) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-y-0 left-0 w-56 bg-sidebarDark border-r border-gray-600/30">
          <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="flex items-center justify-between h-10 px-3 border-b border-gray-600/30">
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 text-white" />
                <h1 className="ml-2 text-sm font-bold text-white">
                  TaskSetu
                </h1>
              </div>
              <button
                onClick={onMobileToggle}
                className="p-1 rounded-md text-gray-400 hover:bg-sidebarHover"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-2 py-2 space-y-0.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href} 
                    onClick={onMobileToggle}
                    className={`group flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-sidebarActive text-white'
                        : 'text-gray-300 hover:bg-sidebarHover hover:text-white'
                    }`}
                  >
                    <Icon className={`flex-shrink-0 h-4 w-4 ${
                      isActive(item.href)
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-white'
                    }`} />
                    <span className="ml-2">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;