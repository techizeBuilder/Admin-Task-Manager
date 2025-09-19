import { useState, useEffect } from "react";
import userDataManager from "@/data/userDataManager";
import {
  UserPlus,
  Users as UsersIcon,
  Shield,
  Mail,
  MoreHorizontal,
  CheckCircle,
  Clock,
  UserX,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  Crown,
  User,
  Download,
  AlertTriangle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddUserModal } from "@/components/InviteUsersModal";
import { EditUserModal } from "@/components/EditUserModal";
import { ViewUserActivityModal } from "@/components/ViewUserActivityModal";
import { useToast } from "@/hooks/use-toast";
import Pagination from "../../components/common/Pagination";
import { useUserRole } from "../../utils/auth";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { set } from "mongoose";
export default function Users() {
  const queryClient = useQueryClient();
  const [users, setUsers] = useState([]);
  const [licensePool, setLicensePool] = useState({});
  const { user,  orgId } = useUserRole();

  const [, setLocation] = useLocation();
  // Load data from UserDataManager on component mount
  useEffect(() => {
    setLicensePool(userDataManager.getLicensePool());
  }, []);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusAction, setStatusAction] = useState(null); // "deactivate" or "activate"

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isViewActivityModalOpen, setIsViewActivityModalOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // change as needed
  // Pagination

  const startIndex = (currentPage - 1) * itemsPerPage;

  const { toast } = useToast();

  // Mutation for updating user
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/organization/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        // Try to parse error message from server
        let errorMsg = "Update failed";
        try {
          const errData = await res.json();
          errorMsg = errData.message || errorMsg;
        } catch {}
        const error = new Error(errorMsg);
        error.status = res.status;
        throw error;
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully updated",
        status: "success",
      });
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        status: "error",
      });
    },
  });

  console.log("User", user);
  // Fetch users with react-query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users", currentPage, searchQuery],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/organization/${orgId}/users?page=${currentPage}&search=${encodeURIComponent(
          searchQuery
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      return res.json();
    },
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  // Prefetch next page for smoother UX
  useEffect(() => {
    if (data?.page < data?.pages) {
      queryClient.prefetchQuery({
        queryKey: ["users", currentPage + 1, searchQuery],
        queryFn: async () => {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `/api/organization/68c7b212e70a5ea02a4b0abe/users?page=${
              currentPage + 1
            }&search=${encodeURIComponent(searchQuery)}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!res.ok) {
            throw new Error(`Error: ${res.status} ${res.statusText}`);
          }

          return res.json();
        },
      });
    }
  }, [data, currentPage, searchQuery, queryClient]);

  // Helper for null/empty fields
  const safe = (val) =>
    val === null || val === undefined || val === "" ? "-" : val;
  const roleLabels = {
    org_admin: "Organization Admin",
    manager: "Manager",
    employee: "Employee",
  };

  const renderRoles = (roles) =>
    Array.isArray(roles) && roles.length > 0 ? (
      <div className="flex flex-col gap-1">
        {roles.map((role, index) => (
          <Badge
            key={role + index}
            variant="outline"
            className={`${
              role === "org_admin"
                ? "bg-purple-100 text-purple-800 border-purple-200"
                : role === "manager"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {roleLabels[role] || role}
          </Badge>
        ))}
      </div>
    ) : (
      <Badge variant="outline">-</Badge>
    );
  // Add new user using UserDataManager
  const handleAddUser = (newUserData) => {
    try {
      const newUser = userDataManager.addUser(newUserData);

      setLicensePool(userDataManager.getLicensePool());

      toast({
        title: "User Added Successfully!",
        description: `${newUser.name} has been added to your organization. License pool updated.`,
        variant: "default",
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error Adding User",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Edit user
  const handleEditUser = (user) => {
    setSelectedUser({
      ...user,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    });
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = async (userId, userData) => {
    updateUserMutation.mutate({ userId, userData });
  };

  // Deactivate/Reactivate user using UserDataManager
 const toggleUserStatus = (user, action = "activate") => {
  const status = action === "deactivate" ? "inactive" : "active";
  updateUserStatusMutation.mutate({ userId: user._id, status });
};
const updateUserStatusMutation = useMutation({
  mutationFn: async ({ userId, status }) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/organization/users/update-status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, status }),
    });
    if (!res.ok) {
      let errorMsg = "Status update failed";
      try {
        const errData = await res.json();
        errorMsg = errData.message || errorMsg;
      } catch {}
      const error = new Error(errorMsg);
      error.status = res.status;
      throw error;
    }
    return res.json();
  },
  onSuccess: (data) => {
    toast({
      title: "Success",
      description: data.message || "User status updated",
      status: "success",
    });
    queryClient.invalidateQueries(["users"]);
  },
  onError: (error) => {
    toast({
      title: "Error",
      description: error.message || "An unexpected error occurred",
      status: "error",
    });
  },
});
  // Remove user
  const handleRemoveUser = (user) => {
    setSelectedUser({
      ...user,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    });
    setIsRemoveDialogOpen(true);
  };

  const confirmRemoveUser = () => {
    if (selectedUser) {
      try {
        const removedUser = userDataManager.removeUser(selectedUser.id);

        setLicensePool(userDataManager.getLicensePool());

        toast({
          title: "User Removed Successfully!",
          description: `${removedUser.name} has been permanently removed from your organization. Their ${removedUser.licenseId} license has been returned to the available pool.`,
          variant: "default",
          duration: 5000,
        });
      } catch (error) {
        toast({
          title: "Cannot Remove User",
          description: error.message,
          variant: "destructive",
          duration: 6000,
        });
      }
    }
    setIsRemoveDialogOpen(false);
    setSelectedUser(null);
  };

  // View user activity
  const handleViewActivity = (user) => {
    setSelectedUser({
      ...user,
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    });
    setIsViewActivityModalOpen(true);
  };

  // Export user data using UserDataManager
  const exportUserData = () => {
    const csvData = userDataManager.exportUserData();

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [Object.keys(csvData[0]).join(",")]
        .concat(csvData.map((row) => Object.values(row).join(",")))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_activity_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful!",
      description:
        "User activity data has been exported to CSV with completion rates.",
      variant: "default",
      duration: 3000,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-200"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 border-red-200"
          >
            <UserX className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "invited":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            Invited
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Company Admin":
        return <Crown className="h-4 w-4 text-purple-600" />;
      case "Manager":
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const totalUsers = data?.user_stats?.total || 0;
  const activeUsers = data?.user_stats?.active || 0;
  const inactiveUsers = data?.user_stats?.inactive || 0;
  const pendingUsers = data?.user_stats?.pending || 0;

  const usersData = data?.users || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UsersIcon className="h-8 w-8 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all users within your organization&apos;s Tasksetu account
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportUserData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => setIsAddUserModalOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* License Pool Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            License Pool Status
          </CardTitle>
          <CardDescription>
            Current license allocation and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(licensePool).map(([licenseType, data]) => (
              <div
                key={licenseType}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-sm">{licenseType}</div>
                  <div className="text-xs text-gray-500">
                    {data.used} used / {data.total} total
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-green-600">
                    {data.available}
                  </div>
                  <div className="text-xs text-gray-500">available</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Users
            </CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {inactiveUsers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              Complete list of users in your organization with their details and
              status
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // reset to first page
              }}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>

        <CardContent>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {user.firstName || user.lastName
                          ? `${(user.firstName || "").charAt(0)}${(
                              user.lastName || ""
                            ).charAt(0)}`.toUpperCase()
                          : (user.email || "-").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.firstName || user.lastName
                            ? `${safe(user.firstName)} ${safe(user.lastName)}`
                            : "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {safe(user.email)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center space-x-1">
                      {renderRoles(user.role)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {safe(user.licenseId)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{safe(user.department)}</div>
                      <div className="text-sm text-gray-500">
                        {safe(user.designation)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {safe(user.completedTasks)}/{safe(user.assignedTasks)}{" "}
                        completed
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* 3. 3-DOT ACTIONS MENU */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white" align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit3 className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewActivity(user)}
                        >
                          <Eye className="h-4 w-4 mr-2" /> View Activity
                        </DropdownMenuItem>
                      {user.status?.toLowerCase() === "active" && (
    <DropdownMenuItem
      onClick={() => {
        setSelectedUser(user);
        setStatusAction("deactivate");
        setIsStatusDialogOpen(true);
      }}
    >
      <UserX className="h-4 w-4 mr-2 text-red-600" /> Deactivate
    </DropdownMenuItem>
  )}
  {user.status?.toLowerCase() === "inactive" && (
    <DropdownMenuItem
      onClick={() => {
        setSelectedUser(user);
        setStatusAction("activate");
        setIsStatusDialogOpen(true);
      }}
    >
      <RefreshCw className="h-4 w-4 mr-2 text-green-600" /> Reactivate
    </DropdownMenuItem>
  )}
                        <DropdownMenuItem
                          onClick={() => handleRemoveUser(user)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={data?.pages || 1}
            itemsPerPage={itemsPerPage}
            totalItems={data?.total || usersData.length}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleAddUser}
      />

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          isOpen={isEditUserModalOpen}
          onClose={() => {
            setIsEditUserModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onUserUpdated={(userData) =>
            handleUpdateUser(selectedUser._id, userData)
          }
        />
      )}

      {/* View User Activity Modal */}
      {selectedUser && (
        <ViewUserActivityModal
          isOpen={isViewActivityModalOpen}
          onClose={() => {
            setIsViewActivityModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {/* Remove User Confirmation Dialog */}
      <AlertDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Remove User
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <>
                  Are you sure you want to permanently remove{" "}
                  <strong>{selectedUser.name}</strong> from your organization?
                  <br />
                  <br />
                  {selectedUser.activeProcesses > 0 ? (
                    <span className="text-red-600 font-medium">
                      ⚠️ This user has {selectedUser.activeProcesses} active
                      task(s). Please reassign these tasks before removing the
                      user.
                    </span>
                  ) : (
                    <>
                      This action cannot be undone. The user will be permanently
                      deleted and their license will be returned to the
                      available pool.
                    </>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-between">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={"bg-red-600 text-white hover:bg-red-700"}
            >
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate/Activate Confirmation Dialog */}
      <AlertDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {statusAction === "deactivate" ? (
                <>
                  <UserX className="h-5 w-5 text-red-500" />
                  Deactivate User
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 text-green-500" />
                  Reactivate User
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <>
                  Are you sure you want to{" "}
                  <strong>
                    {statusAction === "deactivate"
                      ? "deactivate"
                      : "reactivate"}
                  </strong>{" "}
                  <strong>{selectedUser.name}</strong>?
            
                  {statusAction === "deactivate" ? (
                    <span className="text-red-600 font-medium">
                      They will lose access to the system and all assigned tasks
                      will show "Owner Inactive".
                    </span>
                  ) : (
                    "They will regain access and can log in normally."
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex justify-between w-full">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser) {
                  toggleUserStatus(
                    selectedUser,
                    statusAction === "deactivate" ? "deactivate" : "activate"
                  ); // Pass action type
                }
                setIsStatusDialogOpen(false);
              }}
              className={
                statusAction === "deactivate"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }
            >
              {statusAction === "deactivate" ? "Deactivate" : "Reactivate"}
            </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
