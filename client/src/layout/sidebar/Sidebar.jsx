import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMenuByRole } from './config';
import SidebarItem from './SidebarItem';
import { useAuth } from '@/features/shared/hooks/useAuth';

const Sidebar = ({ 
  role = 'individual', 
  onLogout,
  className = '',
  defaultCollapsed = false,
  showToggle = true 
}) => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {

    const menu = getMenuByRole(role);
 
    setMenuItems(menu);
  }, [role]);

  const handleItemClick = (action) => {
    if (action === 'logout' && onLogout) {
      onLogout();
    }
    
    // Close mobile menu after clicking an item
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Role-specific branding with organization names
  const getRoleBranding = () => {
    // Get organization name from user data
    const orgName = user?.organization?.name || user?.organizationName || 'Organization';
    const hasOrganization = user?.organizationId || user?.organization;
    
    switch (role) {
      case 'superadmin':
      case 'super_admin':
        return {
          title: 'TaskSetu Admin',
          subtitle: 'Super Admin Panel',
          bgGradient: 'from-purple-600 to-indigo-600'
        };
      case 'organization':
      case 'admin':
      case 'org_admin':
        return {
          title: 'TaskSetu',
          subtitle: hasOrganization ? `${orgName} Workspace` : 'Organization Workspace',
          bgGradient: 'from-blue-600 to-cyan-600'
        };
      case 'manager':
        return {
          title: 'TaskSetu',
          subtitle: hasOrganization ? `${orgName} Workspace` : 'Team Workspace',
          bgGradient: 'from-yellow-600 to-orange-600'
        };
      case 'employee':
      case 'orgMember':
      case 'org_member':
        return {
          title: 'TaskSetu',
          subtitle: hasOrganization ? `${orgName} Workspace` : 'Organization Workspace',
          bgGradient: 'from-teal-600 to-cyan-600'
        };
      case 'member':
        // Member role - could be individual or organization member
        if (hasOrganization) {
          return {
            title: 'TaskSetu',
            subtitle: `${orgName} Workspace`,
            bgGradient: 'from-blue-500 to-teal-500'
          };
        }
        return {
          title: 'TaskSetu',
          subtitle: 'Personal Workspace',
          bgGradient: 'from-green-600 to-teal-600'
        };
      case 'individual':
      default:
        return {
          title: 'TaskSetu',
          subtitle: 'Personal Workspace',
          bgGradient: 'from-green-600 to-teal-600'
        };
    }
  };

  const branding = getRoleBranding();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border"
        data-testid="mobile-sidebar-toggle"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          transform transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-[280px]'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-[#1E1E2D] flex flex-col
          ${className}
        `}
        data-testid="sidebar-container"
      >
        {/* Header */}
        <div className={`
          p-4 
          bg-gradient-to-r from-[#009EF7] to-[#0095E8] text-white
          ${isCollapsed ? 'px-2' : ''}
        `}>
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold truncate" data-testid="sidebar-title">
                  {branding.title}
                </h1>
                <p className="text-xs text-white/80 truncate" data-testid="sidebar-subtitle">
                  {branding.subtitle}
                </p>
              </div>
            )}
            
            {showToggle && (
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                data-testid="sidebar-collapse-toggle"
              >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              onItemClick={handleItemClick}
            />
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 text-center">
              <p>TaskSetu v2.0</p>
              <p className="capitalize">Role: {role}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;