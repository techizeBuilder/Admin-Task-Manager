import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "../../layout/sidebar";
import Header from "./Header";

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current user data for dynamic sidebar
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Dynamic sidebar based on user role */}
      <Sidebar 
        role={user?.role || 'member'}
        onLogout={handleLogout}
        defaultCollapsed={!sidebarOpen}
        showToggle={true}
        className="fixed lg:static"
      />
      
      {/* Main content area */}
      <div className="flex-1 lg:ml-0">
        <Header 
          onMenuClick={toggleMobileMenu}
          onSidebarToggle={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="min-h-screen bg-gray-50">
          <div className="h-full w-full">
            <div className="w-full h-full bg-white border-l border-gray-200">
              <div className="h-full p-6">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}