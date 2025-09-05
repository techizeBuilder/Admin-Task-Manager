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
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
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

export default function Users() {
  const [users, setUsers] = useState([]);
  const [licensePool, setLicensePool] = useState({});

  // Load data from UserDataManager on component mount
  useEffect(() => {
    setUsers(userDataManager.getAllUsers());
    setLicensePool(userDataManager.getLicensePool());
  }, []);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isViewActivityModalOpen, setIsViewActivityModalOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isRoleChangeDialogOpen, setIsRoleChangeDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleChangeData, setRoleChangeData] = useState(null);

  const { toast } = useToast();

  // Add new user using UserDataManager
  const handleAddUser = (newUserData) => {
    try {
      const newUser = userDataManager.addUser(newUserData);
      setUsers(userDataManager.getAllUsers());
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
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = (updatedUserData, oldRole = null) => {
    // If role changed, show confirmation dialog
    if (oldRole && updatedUserData.role !== oldRole) {
      setRoleChangeData({ updatedUser: updatedUserData, oldRole });
      setIsRoleChangeDialogOpen(true);
      return;
    }

    try {
      // Update user using UserDataManager
      const updatedUser = userDataManager.updateUser(updatedUserData.id, updatedUserData);
      setUsers(userDataManager.getAllUsers());
      setLicensePool(userDataManager.getLicensePool());

      toast({
        title: "User Updated Successfully!",
        description: `${updatedUser.name}'s details have been updated.`,
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error Updating User",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Confirm role change
  const confirmRoleChange = () => {
    if (roleChangeData) {
      try {
        const updatedUser = userDataManager.updateUser(roleChangeData.updatedUser.id, roleChangeData.updatedUser);
        setUsers(userDataManager.getAllUsers());
        setLicensePool(userDataManager.getLicensePool());

        toast({
          title: "Role Changed Successfully!",
          description: `${updatedUser.name}'s role has been changed from ${roleChangeData.oldRole} to ${updatedUser.role}. Access rights have been updated.`,
          variant: "default",
          duration: 5000,
        });
      } catch (error) {
        toast({
          title: "Error Changing Role",
          description: error.message,
          variant: "destructive",
          duration: 5000,
        });
      }
    }
    setRoleChangeData(null);
    setIsRoleChangeDialogOpen(false);
  };

  // Deactivate/Reactivate user using UserDataManager
  const toggleUserStatus = (user) => {
    try {
      let updatedUser;
      let action;
      
      if (user.status === 'Active') {
        updatedUser = userDataManager.deactivateUser(user.id);
        action = 'deactivated';
      } else {
        updatedUser = userDataManager.reactivateUser(user.id);
        action = 'reactivated';
      }
      
      setUsers(userDataManager.getAllUsers());

      toast({
        title: `User ${action.charAt(0).toUpperCase() + action.slice(1)}!`,
        description: `${user.name} has been ${action}. ${updatedUser.status === 'Inactive' ? 'They cannot log in and assigned tasks will show Owner Inactive label.' : 'They can now log in normally.'}`,
        variant: updatedUser.status === 'Inactive' ? 'destructive' : 'default',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Error Updating User Status",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Remove user
  const handleRemoveUser = (user) => {
    setSelectedUser(user);
    setIsRemoveDialogOpen(true);
  };

  const confirmRemoveUser = () => {
    if (selectedUser) {
      try {
        const removedUser = userDataManager.removeUser(selectedUser.id);
        setUsers(userDataManager.getAllUsers());
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
    setSelectedUser(user);
    setIsViewActivityModalOpen(true);
  };

  // Export user data using UserDataManager
  const exportUserData = () => {
    const csvData = userDataManager.exportUserData();

    const csvContent = "data:text/csv;charset=utf-8," 
      + [Object.keys(csvData[0]).join(',')]
        .concat(csvData.map(row => Object.values(row).join(',')))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_activity_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful!",
      description: "User activity data has been exported to CSV with completion rates.",
      variant: "default",
      duration: 3000,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'Inactive':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200"><UserX className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Company Admin':
        return <Crown className="h-4 w-4 text-purple-600" />;
      case 'Manager':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const activeUsers = users.filter(user => user.status === 'Active').length;
  const inactiveUsers = users.filter(user => user.status === 'Inactive').length;
  const pendingUsers = users.filter(user => user.status === 'Pending').length;

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
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
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
              <div key={licenseType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{licenseType}</div>
                  <div className="text-xs text-gray-500">
                    {data.used} used / {data.total} total
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-green-600">{data.available}</div>
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
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inactiveUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Complete list of users in your organization with their details and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
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
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span>{user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {user.licenseId}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.department || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{user.designation || ''}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{user.tasksCompleted}/{user.tasksAssigned} completed</div>
                      {user.activeProcesses > 0 && (
                        <div className="text-blue-600">{user.activeProcesses} active</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleViewActivity(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Activity
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                          {user.status === 'Active' ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reactivate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleRemoveUser(user)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
          onUserUpdated={handleUpdateUser}
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

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={isRoleChangeDialogOpen} onOpenChange={setIsRoleChangeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Role Change
            </AlertDialogTitle>
            <AlertDialogDescription>
              {roleChangeData && (
                <>
                  You are changing <strong>{roleChangeData.updatedUser.name}</strong>&apos;s role from{' '}
                  <strong>{roleChangeData.oldRole}</strong> to{' '}
                  <strong>{roleChangeData.updatedUser.role}</strong>.
                  <br /><br />
                  This will immediately update their access rights and permissions. Are you sure you want to continue?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setRoleChangeData(null);
              setIsRoleChangeDialogOpen(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} className="bg-amber-600 hover:bg-amber-700">
              Confirm Role Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove User Confirmation Dialog */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Remove User
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser && (
                <>
                  Are you sure you want to permanently remove <strong>{selectedUser.name}</strong> from your organization?
                  <br /><br />
                  {selectedUser.activeProcesses > 0 ? (
                    <span className="text-red-600 font-medium">
                      ⚠️ This user has {selectedUser.activeProcesses} active task(s). Please reassign these tasks before removing the user.
                    </span>
                  ) : (
                    <>
                      This action cannot be undone. The user will be permanently deleted and their license will be returned to the available pool.
                    </>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveUser} 
              className="bg-red-600 hover:bg-red-700"
              disabled={selectedUser?.activeProcesses > 0}
            >
              {selectedUser?.activeProcesses > 0 ? 'Cannot Remove' : 'Remove User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}