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
  UserPlus,
  ChevronRight,
  HelpCircle,
  Bell,
  Database,
  CreditCard,
  RefreshCcw,
  CheckCircle2,
  Milestone,
  ChartScatter,
  CalendarMinus2,
} from "lucide-react";

export function SimpleSidebar() {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    admin: true,
    system: false,
  });

  // Get current user data to check role
  const { data: user } = useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!localStorage.getItem("token"),
  });

  console.log("user simple sidebar : ", user);
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`;

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Check if user has organization management permissions
  // Individual users should NOT have access to organization features
  const canManageOrganization =
    user?.role === "org_admin" ||
    user?.role === "admin" ||
    user?.role === "superadmin";
  const isIndividualUser = user?.role === "individual";
  const isSuperAdmin = user?.role === "superadmin";

  // Individual users should be blocked from organizational features
  const canInviteUsers = !isIndividualUser && canManageOrganization;
  const canManageRoles = !isIndividualUser && canManageOrganization;

  const mainNavigation = [
    ...(user?.role === "member"
      ? [
          {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Tasks",
            href: "/tasks",
            icon: CheckSquare,
          },
          {
            name: "DeadLine",
            href: "/deadlines",
            icon: CalendarMinus2,
            description: "Deadlines",
          },
          {
            name: "Notification",
            href: "/notification",
            icon: CheckSquare,
          },
        ]
      : []),
    ...(user?.role === "employee"
      ? [
          {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Tasks",
            href: "/tasks",
            icon: CheckSquare,
          },
          {
            name: "DeadLine",
            href: "/deadlines",
            icon: CalendarMinus2,
            description: "Deadlines",
          },
          // {
          //   name: "Notification",
          //   href: "/notification",
          //   icon: CheckSquare,
          // },
        ]
      : []),
    ...(user?.role === "individual"
      ? [
          {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Tasks",
            href: "/tasks",
            icon: CheckSquare,
          },
          {
            name: "Notification",
            href: "/notification",
            icon: CheckSquare,
          },
          {
            name: "Analytics",
            href: "/analytics",
            icon: ChartScatter,
            description: "Analytics",
          },
          {
            name: "DeadLine",
            href: "/deadlines",
            icon: CalendarMinus2,
            description: "Deadlines",
          },
          {
            name: "Settings",
            href: "/setting",
            icon: UserCog,
            description: "System configuration",
          },
        ]
      : []),
      ...(user?.role === "manager"
        ? [
            {
              name: "Dashboard",
              href: "/dashboard",
              icon: LayoutDashboard,
            },
            {
              name: "Tasks",
              href: "/tasks",
              icon: CheckSquare,
            },
            {
              name: "Notification",
              href: "/notification",
              icon: CheckSquare,
            },
            {
              name: "Analytics",
              href: "/analytics",
              icon: ChartScatter,
              description: "Analytics",
            },
            {
              name: "DeadLine",
              href: "/deadlines",
              icon: CalendarMinus2,
              description: "Deadlines",
            },
            {
              name: "Settings",
              href: "/setting",
              icon: UserCog,
              description: "System configuration",
            },
          ]
        : []),
    // {
    //   name: "Projects",
    //   href: "/projects",
    //   icon: FolderOpen,
    // },
    ...(canManageOrganization
      ? [
          {
            name: "Team",
            href: "/admin/team-members",
            icon: Users,
          },
        ]
      : []),
    // {
    //   name: "Reports",
    //   href: "/reports",
    //   icon: BarChart3,
    // },
  ];

  const workflowNavigation = [
    // {
    //   name: "Forms & Workflows",
    //   href: "/forms",
    //   icon: FileText,
    //   description: "Create forms and processes",
    // },
    // {
    //   name: "Integrations",
    //   href: "/integrations",
    //   icon: Settings,
    //   description: "Connect external tools",
    // },
  ];

  const adminNavigation = [
    ...(canInviteUsers
      ? [
          {
            name: "Invite Users",
            href: "/admin/invite-users",
            icon: UserPlus,
            description: "Invite new team members",
          },
        ]
      : []),
    ...(canManageOrganization
      ? [
          {
            name: "Plans & Licenses",
            href: "/admin/plans",
            icon: CreditCard,
            description: "License management",
          },
        ]
      : []),
    ...(canManageRoles
      ? [
          {
            name: "Role Management",
            href: "/admin/role-management",
            icon: Shield,
            description: "Configure permissions",
          },
        ]
      : []),
    {
      name: "Regular Tasks",
      href: "/admin/regular-tasks",
      icon: CheckSquare,
      description: "Regular Tasks",
    },
    {
      name: "RecurringTaskManager",
      href: "/admin/recurring",
      icon: RefreshCcw,
      description: "RecurringTaskManager",
    },
    {
      name: "ApprovalManager",
      href: "/admin/approval",
      icon: CheckCircle2,
      description: "ApprovalManager",
    },
    {
      name: "MilestoneMAnager",
      href: "/admin/milestone",
      icon: Milestone,
      description: "Milestone",
    },
    {
      name: "StatusManager",
      href: "/admin/StatusManager",
      icon: Milestone,
      description: "StatusManager",
    },
    {
      name: "PriorityManager",
      href: "/admin/PriorityManager",
      icon: Milestone,
      description: "PriorityManager",
    },
    {
      name: "Activity Feed",
      href: "/admin/activity-feed",
      icon: Milestone,
      description: "Activity Feed",
    },

    {
      name: "Admin Settings",
      href: "/admin-settings",
      icon: UserCog,
      description: "System configuration",
    },
  ];

  const isActive = (href) => {
    return location === href || (href === "/dashboard" && location === "/");
  };

  const renderNavItem = (item) => (
    <Link key={item.name} href={item.href}>
      <div
        className={`flex items-center px-3 pb-1 pt-[8px] text-sm rounded-lg transition-all duration-200 group  ${
          isActive(item.href)
            ? "bg-sidebarActive text-white shadow-lg"
            : "text-gray-300 hover:bg-sidebarHover hover:text-white"
        }`}
      >
        <item.icon
          className={`h-4 w-4 mr-3 ${
            isActive(item.href)
              ? "text-white"
              : "text-gray-400 group-hover:text-white"
          }`}
        />
        <div className="flex-1">
          <div className="font-medium">{item.name}</div>
          <div
            className="text-xs text-gray-400 group-hover:text-gray-300  border-gray-400 pb-2
            border-b-[1px]"
          >
            {item.description}
          </div>
        </div>
      </div>
    </Link>
  );

  
  const renderSection = (title, items, sectionKey) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider hover:text-blue-200 transition-colors"
        >
          {title}
          <ChevronRight
            className={`h-3 w-3 transition-transform ${
              expandedSections[sectionKey] ? "rotate-90" : ""
            }`}
          />
        </button>
        {expandedSections[sectionKey] && (
          <div className="mt-2 space-y-1">{items.map(renderNavItem)}</div>
        )}
      </div>
    );
  };
  const validUser = JSON.parse(localStorage.getItem("user"));
  
  return (
    <div className="fixed inset-y-0 left-0 z-50 w-56 bg-sidebarDark border-r border-gray-600/30 shadow-xl">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-600/30 bg-sidebarDark">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            {initials}
          </div>

          <div className="ml-3">
            <h1 className="text-sm font-semibold text-white">TaskSetu</h1>
            <p className="text-xs text-gray-300">
              {isIndividualUser
                ? "Individual"
                : `${validUser?.firstName} ${validUser?.lastName}`}
            </p>
            {/* <p className="text-xs text-gray-300">{user?.email}</p> */}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-4 overflow-y-auto bg-sidebarDark">
          {/* Main Features */}
          <div className="mb-6">
            <div className="px-3 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Main
            </div>
            <div className="mt-2 space-y-1">
              {mainNavigation.map(renderNavItem)}
            </div>
          </div>

          {/* Workflow Features */}
          <div className="mb-6">
            {/* <div className="px-3 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
              Workflow
            </div> */}
            <div className="mt-2 space-y-1">
              {workflowNavigation.map(renderNavItem)}
            </div>
          </div>

          {/* Admin Features - Only show for organization admins */}
          {canManageOrganization && (
            <div className="mb-6">
              <button
                onClick={() => toggleSection("admin")}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-300 uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
              >
                Administration
                <ChevronRight
                  className={`h-3 w-3 transition-transform ${
                    expandedSections.admin ? "rotate-90" : ""
                  }`}
                />
              </button>
              {expandedSections.admin && (
                <div className="mt-2 space-y-1  ">
                  {adminNavigation.map(renderNavItem)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {/* <div className="p-4 border-t border-gray-600/30">
          <div className="flex items-center text-xs text-gray-300">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            {user?.email || "Loading..."}
          </div>
        </div> */}
      </div>
    </div>
  );
}