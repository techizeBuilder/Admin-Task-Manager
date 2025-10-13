import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "../../layout/sidebar";
import Header from "./Header";
import QuickAddBar from "../tasks/QuickAddBar";

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current user data for dynamic sidebar
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
    retry: false,
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    // Clear authentication token
    localStorage.removeItem("token");

    // Redirect to login page
    window.location.href = "/login";
  };
  const activeRole = user?.activeRole || user?.role?.[0];
  const userRole = activeRole?.toLowerCase();
  // Show loading state while user data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen  bg-gray-100 overflow-hidden">
      {/* Dynamic sidebar based on user role - Fixed positioned */}
      <div className={`${sidebarOpen ? 'w-[280px]' : 'w-16'} transition-all duration-300 flex-shrink-0`}>
        <Sidebar
          role={userRole}
          onLogout={handleLogout}
          defaultCollapsed={!sidebarOpen}
          showToggle={true}
          className="h-full"
        />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 z-10">
          <Header
            onMenuClick={toggleMobileMenu}
            onSidebarToggle={toggleSidebar}
            sidebarOpen={sidebarOpen}
            user={user}
          />
        </div>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full">
            <div className="min-h-full bg-white">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Quick Add Bar - Global floating button for all pages */}
      <QuickAddBar />
    </div>
  );
}