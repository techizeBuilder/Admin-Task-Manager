import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getQueryFn } from "@/lib/queryClient";

// Role-based Dashboards
import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import EmployeeDashboard from "./pages/dashboards/EmployeeDashboard";

// Legacy Admin Components (for reference)
import Dashboard from "./pages/admin/CompactDashboard";
import Tasks from "./pages/admin/Tasks";
import Users from "./pages/admin/Users";
import UserManagement from "./pages/admin/UserManagement";
import TeamMembers from "./pages/admin/TeamMembers";
import SettingsUserManagement from "./pages/settings/UserManagement";
import Projects from "./pages/admin/Projects";
import FormBuilder from "./pages/admin/FormBuilder";
import Integrations from "./pages/admin/Integrations";
import Roles from "./pages/admin/Roles";
import Reports from "./pages/admin/Reports";
import { InviteUsers } from "./pages/InviteUsers";
import { RoleManagement } from "./pages/RoleManagement";
import { PlansLicenses } from "./pages/admin/PlansLicenses";
import { AdminLayout } from "./components/admin/AdminLayout";
import SettingsLayout from "./components/settings/SettingsLayout";
import GeneralSettings from "./pages/settings/GeneralSettings";
import SettingsRoles from "./pages/settings/Roles";
import Subscription from "./pages/settings/Subscription";
import SettingsPlaceholder from "./pages/settings/SettingsPlaceholder";

// Super Admin Components
import SuperAdminLayout from "./components/super-admin/SuperAdminLayout";
import LegacySuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import CompaniesManagement from "./pages/super-admin/CompaniesManagement";
import UsersManagement from "./pages/super-admin/UsersManagement";
import SystemLogs from "./pages/super-admin/SystemLogs";
import AdminManagement from "./pages/super-admin/AdminManagement";
import LoginCustomization from "./pages/super-admin/LoginCustomization";

import { Toaster } from "./components/ui/toaster";
import { SubtaskProvider } from "./contexts/SubtaskContext";
import { ViewProvider } from "./contexts/ViewContext";
import GlobalSubtaskDrawer from "./components/forms/GlobalSubtaskDrawer";
import GlobalViewModal from "./components/modals/GlobalViewModal";

// Authentication Components
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import SuperAdminLogin from "./pages/super-admin/SuperAdminLogin";
import EditProfile from "./pages/EditProfile";

import CreatePassword from "./pages/auth/CreatePassword";
import ResetPassword from "./pages/auth/ResetPassword";

import { SimpleAcceptInvite } from "./pages/SimpleAcceptInvite";
import VerifyAndSetPassword from "./pages/auth/VerifyAndSetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import RegistrationSuccess from "./pages/auth/RegistrationSuccess";

// Licensing & Subscription Components
import LicenseManagementPage from "./features/licensing/pages/LicenseManagementPage";
import BillingPage from "./features/licensing/pages/BillingPage";
import PricingPage from "./features/licensing/pages/PricingPage";
import PurchaseUpgradePage from "./features/licensing/pages/PurchaseUpgradePage";

// Role Protection Components
import {
  RoleProtectedRoute,
  RequireSuperAdmin,
  RequireAdmin,
  RequireEmployee,
} from "./components/auth/RoleProtectedRoute";
import RoleBasedRedirect from "./components/RoleBasedRedirect";
import SecureRoute from "./components/ProtectedRoute";
import ForbiddenPage from "./pages/ForbiddenPage";
import TaskDetail from "./pages/taskview/TaskDetail";
import AdminSettings from "./pages/admin/Admin-settings";
import AdminNotification from "./pages/admin/AdminNotification";
import RecurringTaskManager from "./pages/newComponents/RecurringTaskManager";
import RecurringTasks from "./features/tasks/pages/RecurringTasks";
import CreateTask from "./pages/newComponents/CreateTask";
import AllTasks from "./pages/newComponents/AllTasks";
import OverdueTasks from "./pages/newComponents/OverdueTasks";
// import QuickTask from "./pages/newComponents/QuickTask"; // Component doesn't exist yet
import CalendarView from "./features/calendar/pages/CalendarView";
import ApprovalManager from "./pages/newComponents/ApprovalManager";
import MilestoneManager from "./pages/newComponents/MilestoneManager";
import StatusManager from "./pages/newComponents/StatusManager";
import PriorityManager from "./pages/newComponents/PriorityManager";
import ActivityFeed from "./pages/newComponents/ActivityFeed";
import TaskAnalytics from "./pages/newComponents/TaskAnalytics";
import DeadlinesFromNew from "./pages/newComponents/Deadlines";
import Deadlines from "./pages/Deadlines";
import NotificationCenter from "./pages/newComponents/NotificationCenter";
import SidebarDemo from "./layout/sidebar/SidebarDemo";
import MemberDashboard from "./layout/sidebar/MemberDashboard";
import CurrentUserSidebar from "./pages/CurrentUserSidebar";
import DynamicDashboard from "./pages/Dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// User Role Check Component
function useUserRole() {
  const token = localStorage.getItem("token");

  return useQuery({
    queryKey: ["/api/auth/verify"],
    enabled: !!token, // Only run query if token exists
    queryFn: async ({ queryKey }) => {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const res = await fetch(queryKey[0], {
        headers,
        credentials: "include",
      });

      if (res.status === 401 || res.status === 403) {
        // Clear invalid token
        localStorage.removeItem("token");
        return null;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Route protection wrapper
function ProtectedRoute({
  component: Component,
  requiredRole,
  allowedRoles = [],
  ...props
}) {
  const { data: user, isLoading, error } = useUserRole();
  const [, setLocation] = useLocation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Only redirect if we have no token at all
    if (!token) {
      setLocation("/login");
      return;
    }

    // If we have a token but query failed and we're not loading, redirect
    if (!isLoading && !user && token) {
      localStorage.removeItem("token");
      setLocation("/login");
    }
  }, [user, isLoading, token, setLocation]);

  // ✅ Hydrate React Query from localStorage on app init
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      queryClient.setQueryData(["/api/auth/verify"], JSON.parse(cachedUser));
    }
  }, []);
  // Show loading while we have a token and are fetching user data
  if (token && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if no token or no user
  if (!token || !user) {
    return null;
  }

  // Check if user has required role or is in allowed roles
  const hasAccess = () => {
    if (requiredRole) {
      return user.role === requiredRole;
    }
    if (allowedRoles.length > 0) {
      return allowedRoles.includes(user.role);
    }
    return true; // No role requirement
  };

  if (!hasAccess()) {
    const isIndividualUser = user.role === "individual";
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Access Restricted
          </h2>
          <p className="text-slate-600 mb-6">
            {isIndividualUser
              ? "This feature is only available for organizational users. Individual accounts don't have access to team management features."
              : "You don't have permission to access this area."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setLocation("/dashboard")}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
            {isIndividualUser && (
              <p className="text-xs text-slate-500 mt-3">
                To access team features, you need an organizational account.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (Component) {
    return <Component {...props} />;
  }

  return props.children || null;
}

function App() {
  const [location] = useLocation();
  const isSuperAdminRoute = location.startsWith("/super-admin");
  const isAuthRoute =
    [
      "/register",
      "/login",
      "/verify",
      "/registration-success",
      "/reset-password",
      "/accept-invitation",
      "/create-password",
    ].includes(location) || location.startsWith("/register/");

  return (
    <QueryClientProvider client={queryClient}>
      <SubtaskProvider>
        <ViewProvider>
          <Switch>
        {/* Root Route - Role-based redirect */}
        <Route path="/" component={RoleBasedRedirect} />

        {/* Public Authentication Routes - No Layout */}
        <Route path="/register" component={Register} />

        <Route path="/login" component={Login} />
        <Route path="/super-admin/login" component={SuperAdminLogin} />

        <Route path="/verify" component={VerifyEmail} />
        <Route path="/registration-success" component={RegistrationSuccess} />
        <Route path="/create-password" component={CreatePassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/accept-invitation" component={SimpleAcceptInvite} />
        <Route path="/accept-invite" component={SimpleAcceptInvite} />
        <Route path="/register/invite/:token" component={SimpleAcceptInvite} />
        <Route path="/forbidden" component={ForbiddenPage} />

        {/* Role-based Dashboard Routes */}
        <Route path="/superadmin">
          <RequireSuperAdmin>
            <SuperAdminDashboard />
          </RequireSuperAdmin>
        </Route>

        {/* Legacy Super Admin Routes */}
        <Route path="/super-admin">
          <ProtectedRoute
            component={LegacySuperAdminDashboard}
            requiredRole="super_admin"
          />
        </Route>
        <Route path="/super-admin/companies">
          <ProtectedRoute
            component={CompaniesManagement}
            requiredRole="super_admin"
          />
        </Route>
        <Route path="/super-admin/users">
          <SuperAdminLayout>
            <ProtectedRoute
              component={UsersManagement}
              requiredRole="super_admin"
            />
          </SuperAdminLayout>
        </Route>
        <Route path="/super-admin/logs">
          <SuperAdminLayout>
            <ProtectedRoute component={SystemLogs} requiredRole="super_admin" />
          </SuperAdminLayout>
        </Route>
        <Route path="/super-admin/admins">
          <SuperAdminLayout>
            <ProtectedRoute
              component={AdminManagement}
              requiredRole="super_admin"
            />
          </SuperAdminLayout>
        </Route>
        <Route path="/super-admin/analytics">
          <SuperAdminLayout>
            <ProtectedRoute
              component={TaskAnalytics}
              requiredRole="super_admin"
            />
          </SuperAdminLayout>
        </Route>
        <Route path="/super-admin/settings">
          <SuperAdminLayout>
            <ProtectedRoute
              component={AdminSettings}
              requiredRole="super_admin"
            ></ProtectedRoute>
          </SuperAdminLayout>
        </Route>
        <Route path="/super-admin/login-customization">
          <SuperAdminLayout>
            <ProtectedRoute
              component={LoginCustomization}
              requiredRole="super_admin"
            />
          </SuperAdminLayout>
        </Route>
        <Route path="/super-admin/edit-profile">
          <SuperAdminLayout>
            <ProtectedRoute
              component={EditProfile}
              requiredRole="super_admin"
            />
          </SuperAdminLayout>
        </Route>

        {/* Main Dashboard Route - Home Dashboard with Sidebar */}
        <Route path="/dashboard">
          <AdminLayout>
            <ProtectedRoute
              component={DynamicDashboard}
              allowedRoles={["admin", "employee", "member", "individual"]}
            />
          </AdminLayout>
        </Route>

        {/* Individual User Task Pages */}
        <Route path="/recurring">
          <AdminLayout>
            <ProtectedRoute
              component={RecurringTasks}
              allowedRoles={["individual", "member", "employee", "admin"]}
            />
          </AdminLayout>
        </Route>

        <Route path="/tasks/create">
          <AdminLayout>
            <ProtectedRoute
              component={CreateTask}
              allowedRoles={["individual", "member", "employee", "admin"]}
            />
          </AdminLayout>
        </Route>

        <Route path="/quick-tasks">
          <AdminLayout>
            <ProtectedRoute
              component={() => <div className="p-6"><h1 className="text-2xl font-bold">Quick Tasks - Coming Soon</h1><p className="text-gray-600 mt-2">This feature will be available in the next update.</p></div>}
              allowedRoles={["individual", "member", "employee", "admin"]}
            />
          </AdminLayout>
        </Route>

        <Route path="/milestones">
          <AdminLayout>
            <ProtectedRoute
              component={MilestoneManager}
              allowedRoles={["individual", "member", "employee", "admin"]}
            />
          </AdminLayout>
        </Route>

        <Route path="/approvals">
          <AdminLayout>
            <ProtectedRoute
              component={ApprovalManager}
              allowedRoles={["individual", "member", "employee", "admin"]}
            />
          </AdminLayout>
        </Route>

        <Route path="/calendar">
          <AdminLayout>
            <ProtectedRoute
              component={CalendarView}
              allowedRoles={["individual", "member", "employee", "admin"]}
            />
          </AdminLayout>
        </Route>

        <Route path="/analytics">
          <AdminLayout>
            <ProtectedRoute component={TaskAnalytics} />
          </AdminLayout>
        </Route>
        <Route path="/deadlines">
          <AdminLayout>
            <ProtectedRoute component={Deadlines} />
          </AdminLayout>
        </Route>
        <Route path="/overdue-tasks">
          <AdminLayout>
            <ProtectedRoute component={OverdueTasks} />
          </AdminLayout>
        </Route>

        <Route path="/tasks">
          <AdminLayout>
            <ProtectedRoute component={AllTasks} />
          </AdminLayout>
        </Route>

        <Route path="/tasks/:taskId">
          <AdminLayout>
            <ProtectedRoute component={TaskDetail} />
          </AdminLayout>
        </Route>

        <Route path="/tasks/:taskId/snooze">
          <AdminLayout>
            <ProtectedRoute component={() => <div className="p-6"><h1 className="text-2xl font-bold">Snooze Task</h1><p>Configure when to resume this task</p></div>} />
          </AdminLayout>
        </Route>

        <Route path="/tasks/:taskId/mark-risk">
          <AdminLayout>
            <ProtectedRoute component={() => <div className="p-6"><h1 className="text-2xl font-bold">Mark as Risk</h1><p>Mark this task as at risk and provide details</p></div>} />
          </AdminLayout>
        </Route>

        <Route path="/tasks/:taskId/mark-done">
          <AdminLayout>
            <ProtectedRoute component={() => <div className="p-6"><h1 className="text-2xl font-bold">Mark as Done</h1><p>Complete this task and update status</p></div>} />
          </AdminLayout>
        </Route>

        <Route path="/tasks/:taskId/delete">
          <AdminLayout>
            <ProtectedRoute component={() => <div className="p-6"><h1 className="text-2xl font-bold">Delete Task</h1><p>Permanently remove this task</p></div>} />
          </AdminLayout>
        </Route>

        <Route path="/tasks/:taskId/subtasks/create">
          <AdminLayout>
            <ProtectedRoute component={() => <div className="p-6"><h1 className="text-2xl font-bold">Create Subtask</h1><p>Add a new subtask to this task</p></div>} />
          </AdminLayout>
        </Route>
        <Route path="/setting">
          <AdminLayout>
            <ProtectedRoute component={AdminSettings} />
          </AdminLayout>
        </Route>

        <Route path="/task/view/:taskId?">
          <AdminLayout>
            <ProtectedRoute component={TaskDetail} />
          </AdminLayout>
        </Route>

        <Route path="/users">
          <AdminLayout>
            <ProtectedRoute component={Users} />
          </AdminLayout>
        </Route>
        <Route path="/user-management">
          <AdminLayout>
            <ProtectedRoute
              component={UserManagement}
              allowedRoles={["admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/team-members">
          <AdminLayout>
            <ProtectedRoute
              component={TeamMembers}
              allowedRoles={["org_admin", "admin", "member"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/admin/team-members">
          <AdminLayout>
            <ProtectedRoute
              component={TeamMembers}
              allowedRoles={["org_admin", "admin", "member"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/invite-users">
          <AdminLayout>
            <ProtectedRoute
              component={InviteUsers}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/edit-profile">
          <AdminLayout>
            <ProtectedRoute component={EditProfile} />
          </AdminLayout>
        </Route>
        <Route path="/admin/invite-users">
          <AdminLayout>
            <ProtectedRoute
              component={InviteUsers}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/admin/plans">
          <AdminLayout>
            <ProtectedRoute
              component={PlansLicenses}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/roles">
          <AdminLayout>
            <ProtectedRoute
              component={RoleManagement}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/admin/role-management">
          <AdminLayout>
            <ProtectedRoute
              component={RoleManagement}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/admin/recurring">
          <AdminLayout>
            <ProtectedRoute
              component={RecurringTaskManager}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>

        <Route path="/admin/approval">
          <AdminLayout>
            <ProtectedRoute
              component={ApprovalManager}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/admin/milestone">
          <AdminLayout>
            <ProtectedRoute
              component={MilestoneManager}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/admin/StatusManager">
          <AdminLayout>
            <ProtectedRoute
              component={StatusManager}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/admin/PriorityManager">
          <AdminLayout>
            <ProtectedRoute
              component={PriorityManager}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/admin/status">
          <AdminLayout>
            <ProtectedRoute
              component={StatusManager}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/admin/priority">
          <AdminLayout>
            <ProtectedRoute
              component={PriorityManager}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/admin/activity-feed">
          <AdminLayout>
            <ProtectedRoute
              component={ActivityFeed}
              allowedRoles={["superadmin", "org_admin", "admin"]}
            />
          </AdminLayout>
        </Route>

        <Route path="/projects">
          <AdminLayout>
            <ProtectedRoute component={Projects} />
          </AdminLayout>
        </Route>
        <Route path="/forms">
          <AdminLayout>
            <ProtectedRoute component={FormBuilder} />
          </AdminLayout>
        </Route>
        <Route path="/integrations">
          <AdminLayout>
            <ProtectedRoute component={Integrations} />
          </AdminLayout>
        </Route>
        <Route path="/roles">
          <AdminLayout>
            <ProtectedRoute component={Roles} />
          </AdminLayout>
        </Route>
        <Route path="/reports">
          <AdminLayout>
            <ProtectedRoute component={Reports} />
          </AdminLayout>
        </Route>
        <Route path="/notification-center">
          <AdminLayout>
            <ProtectedRoute
              component={NotificationCenter}
              allowedRoles={["admin"]}
            />
          </AdminLayout>
        </Route>
        <Route path="/notifications">
          <AdminLayout>
            <ProtectedRoute component={NotificationCenter} />
          </AdminLayout>
        </Route>
        <Route path="/notification">
          <AdminLayout>
            <ProtectedRoute component={AdminNotification} />
          </AdminLayout>
        </Route>
        <Route path="/sidebar-demo">
          <SidebarDemo />
        </Route>
        <Route path="/member-dashboard">
          <MemberDashboard />
        </Route>
        <Route path="/current-user-sidebar">
          <CurrentUserSidebar />
        </Route>
        {/* Settings Routes */}
        <Route path="/settings">
          <SettingsLayout>
            <ProtectedRoute requiredRole="admin">
              <div className="p-6">
                <script>
                  window.location.href = '/settings/user-management';
                </script>
                <p>Redirecting to User Management...</p>
              </div>
            </ProtectedRoute>
          </SettingsLayout>
        </Route>
        <Route path="/settings/general">
          <SettingsLayout>
            <ProtectedRoute component={GeneralSettings} requiredRole="admin" />
          </SettingsLayout>
        </Route>
        <Route path="/settings/user-management">
          <SettingsLayout>
            <ProtectedRoute
              component={SettingsUserManagement}
              allowedRoles={["org_admin", "admin"]}
            />
          </SettingsLayout>
        </Route>
        <Route path="/settings/subscription">
          <SettingsLayout>
            <ProtectedRoute component={Subscription} requiredRole="admin" />
          </SettingsLayout>
        </Route>
        
        {/* Licensing & Subscription Routes */}
        <Route path="/admin/subscription">
          <AdminLayout>
            <ProtectedRoute component={LicenseManagementPage} requiredRole="admin" />
          </AdminLayout>
        </Route>
        <Route path="/admin/billing">
          <AdminLayout>
            <ProtectedRoute component={BillingPage} requiredRole="admin" />
          </AdminLayout>
        </Route>
        <Route path="/admin/upgrade">
          <AdminLayout>
            <ProtectedRoute component={PurchaseUpgradePage} requiredRole="admin" />
          </AdminLayout>
        </Route>
        <Route path="/pricing">
          <PricingPage />
        </Route>
        <Route path="/settings/roles">
          <SettingsLayout>
            <ProtectedRoute component={SettingsRoles} requiredRole="admin" />
          </SettingsLayout>
        </Route>

        {/* 404 Not Found */}
        <Route>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Page Not Found
              </h2>
              <p className="text-gray-600">
                The page you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </Route>
      </Switch>
      <Toaster />
      <GlobalSubtaskDrawer />
      <GlobalViewModal />
      </ViewProvider>
      </SubtaskProvider>
    </QueryClientProvider>
  );
}

export default App;
