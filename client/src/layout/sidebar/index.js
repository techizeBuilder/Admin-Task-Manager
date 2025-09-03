// Main exports for the sidebar system
export { default as Sidebar } from './Sidebar';
export { default as SidebarItem } from './SidebarItem';
export { sidebarMenus, getMenuByRole, findActiveItem } from './config';

// Usage examples:
// import { Sidebar } from '@/layout/sidebar';
// <Sidebar role="individual" onLogout={handleLogout} />
// <Sidebar role="organization" onLogout={handleLogout} />
// <Sidebar role="superadmin" onLogout={handleLogout} />