import {
  Home,
  CheckSquare,
  Plus,
  Zap,
  Calendar,
  Target,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  User,
  Bell,
  HelpCircle,
  LogOut,
  Users,
  Shield,
  FileText,
  BarChart3,
  Settings,
  Monitor,
  Key,
  Cog,
  BellRing,
  Database,
  Library,
  Activity,
  Server,
  FileSearch,
  UserCheck,
  // Additional icons for submenus
  Building2,
  Clock,
  List,
  UserCircle,
  Briefcase,
  PieChart,
  AlertTriangle,
  BookOpen,
  Globe,
  Layers,
  Flag,
  UserPlus
} from 'lucide-react';

// Menu configuration for different user roles
export const sidebarMenus = {
  // Normal User (Employee) - Personal productivity focus
  employee: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'my-tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      path: '/tasks'
    },
    {
      id: 'create-task',
      label: 'Create Task',
      icon: Plus,
      path: '/tasks/create'
    },
    {
      id: 'quick-tasks',
      label: 'Quick Tasks',
      icon: Zap,
      path: '/quick-tasks'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      path: '/calendar'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      children: [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          path: '/profile'
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          path: '/notifications'
        }
      ]
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      path: '/help'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: 'logout'
    }
  ],

  // Manager - Team oversight capabilities
  manager: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'my-tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      path: '/tasks'
    },
    {
      id: 'team-tasks',
      label: 'Team Tasks',
      icon: Users,
      path: '/tasks/team'
    },
    {
      id: 'create-task',
      label: 'Create Task',
      icon: Plus,
      path: '/tasks/create'
    },
    {
      id: 'quick-tasks',
      label: 'Quick Tasks',
      icon: Zap,
      path: '/quick-tasks'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      path: '/calendar'
    },
    {
      id: 'milestones',
      label: 'Milestones',
      icon: Target,
      path: '/milestones'
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: ClipboardCheck,
      path: '/approvals'
    },
    {
      id: 'reports',
      label: 'Reporting & Analytics',
      icon: BarChart3,
      children: [
        {
          id: 'my-productivity',
          label: 'My Productivity',
          icon: TrendingUp,
          path: '/reports/productivity'
        },
        {
          id: 'team-analytics',
          label: 'Team Analytics',
          icon: PieChart,
          path: '/reports/team'
        },
        {
          id: 'overdue-tasks',
          label: 'Overdue Tasks',
          icon: AlertTriangle,
          path: '/overdue-tasks'
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      children: [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          path: '/profile'
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          path: '/notifications'
        }
      ]
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      path: '/help'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: 'logout'
    }
  ],

  // Company Admin - Full organizational control
  admin: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'my-tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      path: '/tasks'
    },
    {
      id: 'team-tasks',
      label: 'Team Tasks',
      icon: Users,
      path: '/tasks/team'
    },
    {
      id: 'create-task',
      label: 'Create Task',
      icon: Plus,
      path: '/tasks/create'
    },
    {
      id: 'quick-tasks',
      label: 'Quick Tasks',
      icon: Zap,
      path: '/quick-tasks'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      path: '/calendar'
    },
    {
      id: 'milestones',
      label: 'Milestones',
      icon: Target,
      path: '/milestones'
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: ClipboardCheck,
      path: '/approvals'
    },
    {
      id: 'reports',
      label: 'Reporting & Analytics',
      icon: BarChart3,
      children: [
        {
          id: 'organization-analytics',
          label: 'Organization Analytics',
          icon: Building2,
          path: '/reports/organization'
        },
        {
          id: 'team-analytics',
          label: 'Team Analytics',
          icon: PieChart,
          path: '/reports/team'
        },
        {
          id: 'my-productivity',
          label: 'My Productivity',
          icon: TrendingUp,
          path: '/reports/productivity'
        }
      ]
    },
    {
      id: 'admin',
      label: 'Administration',
      icon: Shield,
      children: [
        {
          id: 'invite-users',
          label: 'Invite Users',
          icon: UserPlus,
          path: '/admin/invite-users'
        },
        {
          id: 'user-management',
          label: 'User Management',
          icon: Users,
          path: '/admin/users'
        },
        {
          id: 'team-members',
          label: 'Team Members',
          icon: Users,
          path: '/admin/team-members'
        },
        {
          id: 'company-profile',
          label: 'Company Profile',
          icon: Building2,
          path: '/admin/org-profile'
        },
        {
          id: 'license-subscription',
          label: 'License & Subscription',
          icon: Key,
          path: '/admin/subscription'
        },
        {
          id: 'plans-licenses',
          label: 'Plans & Licenses',
          icon: Key,
          path: '/admin/plans'
        },
        {
          id: 'status-management',
          label: 'Status Management',
          icon: Cog,
          path: '/admin/status'
        },
        {
          id: 'priority-management',
          label: 'Priority Management',
          icon: Flag,
          path: '/admin/priority'
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      children: [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          path: '/profile'
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          path: '/notifications'
        }
      ]
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      path: '/help'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: 'logout'
    }
  ],

  // Legacy roles for backward compatibility
  individual: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      children: [
        {
          id: 'my-tasks',
          label: 'My Tasks',
          icon: List,
          path: '/tasks'
        },
        {
          id: 'create-task',
          label: 'Create Task',
          icon: Plus,
          path: '/tasks/create'
        },
        {
          id: 'quick-tasks',
          label: 'Quick Tasks',
          icon: Zap,
          path: '/quick-tasks'
        },
        {
          id: 'recurring',
          label: 'Recurring',
          icon: Clock,
          path: '/recurring'
        },
        {
          id: 'calendar',
          label: 'Calendar',
          icon: Calendar,
          path: '/calendar'
        },
        {
          id: 'milestones',
          label: 'Milestones',
          icon: Target,
          path: '/milestones'
        },
        {
          id: 'approvals',
          label: 'Approvals',
          icon: ClipboardCheck,
          path: '/approvals'
        }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      children: [
        {
          id: 'my-productivity',
          label: 'My Productivity',
          icon: TrendingUp,
          path: '/reports/productivity'
        },
        {
          id: 'my-overdue-tasks',
          label: 'My Overdue Tasks',
          icon: AlertTriangle,
          path: '/overdue-tasks'
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      children: [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          path: '/profile'
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          path: '/notifications'
        }
      ]
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      path: '/help'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: 'logout'
    }
  ],

  // Organization Member (company user without admin rights)
  orgMember: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      children: [
        {
          id: 'my-tasks',
          label: 'My Tasks',
          icon: List,
          path: '/tasks'
        },
        {
          id: 'create-task',
          label: 'Create Task',
          icon: Plus,
          path: '/tasks/create'
        },
        {
          id: 'quick-tasks',
          label: 'Quick Tasks',
          icon: Zap,
          path: '/quick-tasks'
        },
        {
          id: 'calendar',
          label: 'Calendar',
          icon: Calendar,
          path: '/calendar'
        },
        {
          id: 'milestones',
          label: 'Milestones',
          icon: Target,
          path: '/milestones'
        },
        {
          id: 'approvals',
          label: 'Approvals',
          icon: ClipboardCheck,
          path: '/approvals'
        }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      children: [
        {
          id: 'my-productivity',
          label: 'My Productivity',
          icon: TrendingUp,
          path: '/reports/productivity'
        },
        {
          id: 'my-overdue-tasks',
          label: 'My Overdue Tasks',
          icon: AlertTriangle,
          path: '/overdue-tasks'
        }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      children: [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          path: '/profile'
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: Bell,
          path: '/notifications'
        }
      ]
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: HelpCircle,
      path: '/help'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: 'logout'
    }
  ],

  // Legacy individual role (keeping for backward compatibility)
  individualLegacy: [
    {
      id: 'dashboard',
      label: 'My Dashboard',
      icon: Home,
      path: '/dashboard',
      active: true
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      path: '/tasks',
      children: [
        {
          id: 'all-tasks',
          label: 'All Tasks',
          path: '/tasks/all'
        },
        {
          id: 'overdue-tasks',
          label: 'Overdue Tasks',
          path: '/tasks/overdue'
        }
      ]
    },
    {
      id: 'create-task',
      label: 'Create Task',
      icon: Plus,
      path: '/tasks/create'
    },
    {
      id: 'quick-tasks',
      label: 'Quick Tasks',
      icon: Zap,
      path: '/quick-tasks'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      path: '/calendar'
    },
    {
      id: 'milestones',
      label: 'Milestones',
      icon: Target,
      path: '/milestones'
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: ClipboardCheck,
      path: '/approvals'
    },
    {
      id: 'productivity',
      label: 'My Productivity',
      icon: TrendingUp,
      path: '/productivity'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/notifications'
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      path: '/help'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: 'logout'
    }
  ],

  organization: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      active: true,
      children: [
        {
          id: 'team-dashboard',
          label: 'Team Dashboard',
          icon: Users,
          path: '/dashboard/team'
        },
        {
          id: 'org-dashboard',
          label: 'Organization Dashboard',
          icon: Building2,
          path: '/dashboard/organization'
        }
      ]
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      children: [
        {
          id: 'my-tasks',
          label: 'My Tasks',
          icon: UserCircle,
          path: '/tasks/my'
        },
        {
          id: 'team-tasks',
          label: 'Team Tasks',
          icon: Users,
          path: '/tasks/team'
        },
        {
          id: 'all-company-tasks',
          label: 'All Company Tasks',
          icon: Briefcase,
          path: '/tasks/company'
        }
      ]
    },
    {
      id: 'create-task',
      label: 'Create Task',
      icon: Plus,
      path: '/tasks/create'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      path: '/calendar'
    },
    {
      id: 'quick-tasks',
      label: 'Quick Tasks',
      icon: Zap,
      path: '/quick-tasks'
    },
    {
      id: 'milestones',
      label: 'Milestones',
      icon: Target,
      path: '/milestones'
    },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: ClipboardCheck,
      path: '/approvals'
    },
    {
      id: 'management',
      label: 'Management',
      icon: Users,
      children: [
        {
          id: 'manage-users',
          label: 'Manage Users',
          icon: Users,
          path: '/management/users'
        },
        {
          id: 'roles-permissions',
          label: 'Roles & Permissions',
          icon: Shield,
          path: '/management/roles'
        }
      ]
    },
    {
      id: 'form-library',
      label: 'Form Library',
      icon: FileText,
      path: '/forms'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      path: '/reports'
    },
    {
      id: 'company-settings',
      label: 'Company Settings',
      icon: Settings,
      path: '/settings/company'
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      path: '/help'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: 'logout'
    }
  ],

  superadmin: [
    {
      id: 'platform-overview',
      label: 'Platform Overview',
      icon: Monitor,
      path: '/superadmin/overview',
      active: true
    },
    {
      id: 'license-mapping',
      label: 'License Mapping',
      icon: Key,
      path: '/superadmin/licenses'
    },
    {
      id: 'system-configurations',
      label: 'System Configurations',
      icon: Cog,
      path: '/superadmin/config'
    },
    {
      id: 'notification-rules',
      label: 'Global Notification Rules',
      icon: BellRing,
      path: '/superadmin/notifications'
    },
    {
      id: 'platform-users',
      label: 'All Platform Users',
      icon: Database,
      path: '/superadmin/users'
    },
    {
      id: 'global-forms',
      label: 'Global Form Library',
      icon: Library,
      path: '/superadmin/forms'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Activity,
      children: [
        {
          id: 'adoption-metrics',
          label: 'Adoption Metrics',
          icon: TrendingUp,
          path: '/superadmin/analytics/adoption'
        },
        {
          id: 'module-usage',
          label: 'Module Usage',
          icon: Layers,
          path: '/superadmin/analytics/modules'
        },
        {
          id: 'system-performance',
          label: 'System Performance',
          icon: Server,
          path: '/superadmin/analytics/performance'
        }
      ]
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: FileSearch,
      path: '/superadmin/audit'
    },
    {
      id: 'overrides',
      label: 'Overrides',
      icon: UserCheck,
      path: '/superadmin/overrides'
    },
    {
      id: 'my-profile',
      label: 'My Profile',
      icon: User,
      path: '/profile'
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      path: '/help'
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: LogOut,
      action: 'logout'
    }
  ]
};

// Helper function to get menu by role
export const getMenuByRole = (role) => {
  // Map API roles to sidebar menu configs based on prompt requirements
  const roleMapping = {
    // New role-based mappings according to prompt
    'employee': 'employee', // Normal User (Employee) - Personal productivity focus
    'manager': 'manager', // Manager - Team oversight capabilities  
    'admin': 'admin', // Company Admin - Full organizational control
    'org_admin': 'admin', // Company Admin alternative
    
    // Legacy mappings for backward compatibility
    'member': 'individual', // Individual member without organization
    'org_member': 'orgMember', // Organization member without admin rights
    'superadmin': 'superadmin', // Super admin
    'super_admin': 'superadmin', // Super admin (alternative)
    'individual': 'individual', // Individual user
    'organization': 'admin', // Organization admin maps to new admin config
  };
  
  const mappedRole = roleMapping[role] || 'employee'; // Default to employee role
  return sidebarMenus[mappedRole] || sidebarMenus.employee;
};

// Helper function to find active menu item
export const findActiveItem = (menu, currentPath) => {
  for (const item of menu) {
    if (item.path === currentPath) {
      return item;
    }
    if (item.children) {
      const activeChild = findActiveItem(item.children, currentPath);
      if (activeChild) {
        return { parent: item, child: activeChild };
      }
    }
  }
  return null;
};