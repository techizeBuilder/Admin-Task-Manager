import { useState } from "react";
import { SimpleSidebar } from "./SimpleSidebar";
import Header from "./Header";

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SimpleSidebar />
      
      <div className="ml-0 lg:ml-56">
        <Header 
          onMenuClick={toggleMobileMenu}
          onSidebarToggle={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="h-screen bg-gray-50 overflow-hidden">
          <div className="h-full w-full">
            <div className="w-full h-full bg-white border-l border-gray-200 overflow-hidden">
              <div className="h-full p-3 overflow-y-auto">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}