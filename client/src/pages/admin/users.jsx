import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRole } from "../../features/shared/hooks/useRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, UserPlus, UserX, Mail, Trash2, Plus, Shield, Clock, CheckCircle, 
  XCircle, AlertCircle, MoreHorizontal, Calendar, Search, Filter, Edit, 
  UserCheck, User, Building, MapPin, Briefcase, RefreshCw, Eye, Download,
  AlertTriangle, CheckSquare, TrendingUp, Activity
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
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

export default function AdminUserManagement() {
  const { isCompanyAdmin, canManageOrganization } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Modal states
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [viewUserModalOpen, setViewUserModalOpen] = useState(false);
  const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [removeUserModalOpen, setRemoveUserModalOpen] = useState(false);
  
  // Form states
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "employee",
    department: "",
    designation: "",
    location: ""
  });
  
  const [editingUser, setEditingUser] = useState({});
  const [roleChangeData, setRoleChangeData] = useState({ userId: null, newRole: "", currentRole: "" });
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const [userToRemove, setUserToRemove] = useState(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check role permissions
  useEffect(() => {
    if (!canManageOrganization) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access user management.",
        variant: "destructive"
      });
    }
  }, [canManageOrganization, toast]);

  // Fetch organization users with detailed information
  const { data: userData = [], isLoading } = useQuery({
    queryKey: ["/api/organization/users-detailed"],
    enabled: canManageOrganization,
    refetchInterval: 30000
  });

  // Fetch organization license info
  const { data: licenseInfo } = useQuery({
    queryKey: ["/api/organization/license"],
    enabled: canManageOrganization
  });

  // Fetch user activities for selected user
  const { data: userActivities } = useQuery({
    queryKey: ["/api/users/activities", selectedUser?.id],
    enabled: !!selectedUser?.id && viewUserModalOpen
  });

  // Add new user mutation
  const addUserMutation = useMutation({
    mutationFn: (userData) => apiRequest("/api/organization/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    }),
    onSuccess: (data) => {
      setAddUserModalOpen(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        role: "employee",
        department: "",
        designation: "",
        location: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/organization/users-detailed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organization/license"] });
      
      toast({
        title: "User Added Successfully",
        description: `Invitation sent to ${newUser.email}. License allocated.`,
        className: "border-green-200 bg-green-50 text-green-800"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add User",
        description: error.message || "Could not create user invitation",
        variant: "destructive"
      });
    }
  });

  // Edit user mutation
  const editUserMutation = useMutation({
    mutationFn: ({ userId, userData }) => apiRequest(`/api/organization/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    }),
    onSuccess: () => {
      setEditUserModalOpen(false);
      setEditingUser({});
      queryClient.invalidateQueries({ queryKey: ["/api/organization/users-detailed"] });
      
      toast({
        title: "User Updated",
        description: "User details have been updated successfully",
        className: "border-green-200 bg-green-50 text-green-800"
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update user details",
        variant: "destructive"
      });
    }
  });

  // Role change mutation
  const roleChangeMutation = useMutation({
    mutationFn: ({ userId, newRole }) => apiRequest(`/api/organization/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole })
    }),
    onSuccess: () => {
      setRoleChangeModalOpen(false);
      setRoleChangeData({ userId: null, newRole: "", currentRole: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/organization/users-detailed"] });
      
      toast({
        title: "Role Changed",
        description: "User role has been updated successfully",
        className: "border-green-200 bg-green-50 text-green-800"
      });
    },
    onError: (error) => {
      toast({
        title: "Role Change Failed",
        description: error.message || "Could not change user role",
        variant: "destructive"
      });
    }
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: (userId) => apiRequest(`/api/organization/users/${userId}/deactivate`, {
      method: "PATCH"
    }),
    onSuccess: () => {
      setDeactivateModalOpen(false);
      setUserToDeactivate(null);
      queryClient.invalidateQueries({ queryKey: ["/api/organization/users-detailed"] });
      
      toast({
        title: "User Deactivated",
        description: "User has been deactivated. Their tasks remain assigned.",
        className: "border-orange-200 bg-orange-50 text-orange-800"
      });
    },
    onError: (error) => {
      toast({
        title: "Deactivation Failed",
        description: error.message || "Could not deactivate user",
        variant: "destructive"
      });
    }
  });

  // Reactivate user mutation
  const reactivateUserMutation = useMutation({
    mutationFn: (userId) => apiRequest(`/api/organization/users/${userId}/reactivate`, {
      method: "PATCH"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organization/users-detailed"] });
      
      toast({
        title: "User Reactivated",
        description: "User access has been restored",
        className: "border-green-200 bg-green-50 text-green-800"
      });
    },
    onError: (error) => {
      toast({
        title: "Reactivation Failed",
        description: error.message || "Could not reactivate user",
        variant: "destructive"
      });
    }
  });

  // Remove user mutation
  const removeUserMutation = useMutation({
    mutationFn: (userId) => apiRequest(`/api/organization/users/${userId}`, {
      method: "DELETE"
    }),
    onSuccess: () => {
      setRemoveUserModalOpen(false);
      setUserToRemove(null);
      queryClient.invalidateQueries({ queryKey: ["/api/organization/users-detailed"] });
      queryClient.invalidateQueries({ queryKey: ["/api/organization/license"] });
      
      toast({
        title: "User Removed",
        description: "User has been permanently deleted. License freed.",
        className: "border-red-200 bg-red-50 text-red-800"
      });
    },
    onError: (error) => {
      toast({
        title: "Removal Failed",
        description: error.message || "Could not remove user",
        variant: "destructive"
      });
    }
  });

  // Resend invite mutation
  const resendInviteMutation = useMutation({
    mutationFn: (userId) => apiRequest(`/api/organization/users/${userId}/resend-invite`, {
      method: "POST"
    }),
    onSuccess: () => {
      toast({
        title: "Invitation Resent",
        description: "New invitation email sent. Expires in 72 hours.",
        className: "border-blue-200 bg-blue-50 text-blue-800"
      });
    },
    onError: (error) => {
      toast({
        title: "Resend Failed",
        description: error.message || "Could not resend invitation",
        variant: "destructive"
      });
    }
  });

  // Filter users based on search and filters
  const filteredUsers = userData.filter(user => {
    const matchesSearch = searchTerm === "" || 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Helper functions
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, label: "Active" },
      invited: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Mail, label: "Invited" },
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, label: "Pending" },
      inactive: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: UserX, label: "Inactive" }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRoleIcon = (role) => {
    const roleIcons = {
      admin: Shield,
      manager: Users,
      employee: User
    };
    const Icon = roleIcons[role] || User;
    return <Icon className="h-4 w-4" />;
  };

  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast({
        title: "Validation Error",
        description: "Name and email are required fields",
        variant: "destructive"
      });
      return;
    }

    if (licenseInfo && licenseInfo.availableSlots <= 0) {
      toast({
        title: "No Available Licenses",
        description: "Please upgrade your plan to add more users",
        variant: "destructive"
      });
      return;
    }

    addUserMutation.mutate(newUser);
  };

  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      department: user.department || "",
      designation: user.designation || "",
      location: user.location || ""
    });
    setEditUserModalOpen(true);
  };

  const handleRoleChange = (user, newRole) => {
    setRoleChangeData({
      userId: user.id,
      newRole: newRole,
      currentRole: user.role,
      userName: `${user.firstName} ${user.lastName}`
    });
    setRoleChangeModalOpen(true);
  };

  const handleDeactivateUser = (user) => {
    setUserToDeactivate(user);
    setDeactivateModalOpen(true);
  };

  const handleRemoveUser = (user) => {
    setUserToRemove(user);
    setRemoveUserModalOpen(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewUserModalOpen(true);
  };

  if (!canManageOrganization) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your organization's users, roles, and permissions
          </p>
        </div>
        
        <Button 
          onClick={() => setAddUserModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={licenseInfo && licenseInfo.availableSlots <= 0}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* License Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{licenseInfo?.totalLicenses || 0}</div>
            <p className="text-xs text-muted-foreground">Maximum capacity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used Licenses</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{licenseInfo?.usedLicenses || 0}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{licenseInfo?.availableSlots || 0}</div>
            <p className="text-xs text-muted-foreground">Can add users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {licenseInfo?.totalLicenses ? Math.round((licenseInfo.usedLicenses / licenseInfo.totalLicenses) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">License utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-users"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Organization Users ({filteredUsers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">
                {userData.length === 0 ? "Start by adding your first team member" : "Try adjusting your search filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Joined</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`user-row-${user.email}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profileImageUrl} />
                            <AvatarFallback>
                              {user.firstName && user.lastName 
                                ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                                : user.email?.substring(0, 2).toUpperCase()
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user.email?.split('@')[0]
                              }
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.department && (
                              <div className="text-xs text-gray-400">{user.department}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Assigned: {user.assignedTasks || 0}</div>
                          <div className="text-green-600">Completed: {user.completedTasks || 0}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`user-actions-${user.email}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => handleViewUser(user)} data-testid={`view-user-${user.email}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => handleEditUser(user)} data-testid={`edit-user-${user.email}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            
                            {user.status === "invited" && (
                              <DropdownMenuItem 
                                onClick={() => resendInviteMutation.mutate(user.id)}
                                disabled={resendInviteMutation.isPending}
                                data-testid={`resend-invite-${user.email}`}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Resend Invite
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem onClick={() => handleRoleChange(user, user.role === 'admin' ? 'manager' : 'admin')}>
                              <Shield className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            
                            {user.status === "active" ? (
                              <DropdownMenuItem 
                                onClick={() => handleDeactivateUser(user)}
                                className="text-orange-600"
                                data-testid={`deactivate-user-${user.email}`}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : user.status === "inactive" && (
                              <DropdownMenuItem 
                                onClick={() => reactivateUserMutation.mutate(user.id)}
                                className="text-green-600"
                                data-testid={`reactivate-user-${user.email}`}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                              onClick={() => handleRemoveUser(user)}
                              className="text-red-600"
                              data-testid={`remove-user-${user.email}`}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={addUserModalOpen} onOpenChange={setAddUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <span>Add New User</span>
            </DialogTitle>
            <DialogDescription>
              Invite a new team member to your organization. They will receive an email invitation valid for 72 hours.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={newUser.firstName}
                onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                placeholder="John"
                data-testid="input-first-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={newUser.lastName}
                onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                placeholder="Doe"
                data-testid="input-last-name"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="john.doe@company.com"
                data-testid="input-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                <SelectTrigger data-testid="select-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={newUser.department}
                onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                placeholder="Engineering"
                data-testid="input-department"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={newUser.designation}
                onChange={(e) => setNewUser({...newUser, designation: e.target.value})}
                placeholder="Software Engineer"
                data-testid="input-designation"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newUser.location}
                onChange={(e) => setNewUser({...newUser, location: e.target.value})}
                placeholder="New York, NY"
                data-testid="input-location"
              />
            </div>
          </div>
          
          {licenseInfo && licenseInfo.availableSlots <= 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">
                  No available licenses. Please upgrade your plan to add more users.
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddUser}
              disabled={addUserMutation.isPending || (licenseInfo && licenseInfo.availableSlots <= 0)}
              data-testid="button-add-user"
            >
              {addUserMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editUserModalOpen} onOpenChange={setEditUserModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogDescription>
              Update user information. Email cannot be changed directly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editFirstName">First Name</Label>
              <Input
                id="editFirstName"
                value={editingUser.firstName || ""}
                onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                data-testid="edit-first-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editLastName">Last Name</Label>
              <Input
                id="editLastName"
                value={editingUser.lastName || ""}
                onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                data-testid="edit-last-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editDepartment">Department</Label>
              <Input
                id="editDepartment"
                value={editingUser.department || ""}
                onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                data-testid="edit-department"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editDesignation">Designation</Label>
              <Input
                id="editDesignation"
                value={editingUser.designation || ""}
                onChange={(e) => setEditingUser({...editingUser, designation: e.target.value})}
                data-testid="edit-designation"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="editLocation">Location</Label>
              <Input
                id="editLocation"
                value={editingUser.location || ""}
                onChange={(e) => setEditingUser({...editingUser, location: e.target.value})}
                data-testid="edit-location"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => editUserMutation.mutate({ userId: editingUser.id, userData: editingUser })}
              disabled={editUserMutation.isPending}
              data-testid="button-save-changes"
            >
              {editUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation Modal */}
      <AlertDialog open={roleChangeModalOpen} onOpenChange={setRoleChangeModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <span>Confirm Role Change</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change the role of <strong>{roleChangeData.userName}</strong> from{" "}
              <strong>{roleChangeData.currentRole}</strong> to <strong>{roleChangeData.newRole}</strong>.
              <br /><br />
              This will immediately affect their access permissions and capabilities within the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roleChangeMutation.mutate({ userId: roleChangeData.userId, newRole: roleChangeData.newRole })}
              className="bg-orange-600 hover:bg-orange-700"
              data-testid="confirm-role-change"
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deactivate User Confirmation Modal */}
      <AlertDialog open={deactivateModalOpen} onOpenChange={setDeactivateModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <UserX className="h-5 w-5 text-orange-600" />
              <span>Deactivate User</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to deactivate <strong>{userToDeactivate?.firstName} {userToDeactivate?.lastName}</strong>.
              <br /><br />
              • User will be unable to log in<br />
              • Assigned tasks will remain with "Owner Inactive" label<br />
              • License remains assigned (use Remove to free the license)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deactivateUserMutation.mutate(userToDeactivate?.id)}
              className="bg-orange-600 hover:bg-orange-700"
              data-testid="confirm-deactivate"
            >
              Deactivate User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove User Confirmation Modal */}
      <AlertDialog open={removeUserModalOpen} onOpenChange={setRemoveUserModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              <span>Remove User Permanently</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently remove <strong>{userToRemove?.firstName} {userToRemove?.lastName}</strong>.
              <br /><br />
              <strong>This action cannot be undone:</strong><br />
              • User will be permanently deleted<br />
              • All assigned tasks must be reassigned first<br />
              • License will be freed immediately<br />
              • User data will be permanently lost
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeUserMutation.mutate(userToRemove?.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-remove"
            >
              Remove Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View User Details Modal */}
      <Dialog open={viewUserModalOpen} onOpenChange={setViewUserModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser?.profileImageUrl} />
                <AvatarFallback>
                  {selectedUser?.firstName && selectedUser?.lastName 
                    ? `${selectedUser.firstName[0]}${selectedUser.lastName[0]}`.toUpperCase()
                    : selectedUser?.email?.substring(0, 2).toUpperCase()
                  }
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xl font-semibold">
                  {selectedUser?.firstName} {selectedUser?.lastName}
                </div>
                <div className="text-sm text-gray-500">{selectedUser?.email}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        <strong>Role:</strong> {selectedUser.role}
                      </span>
                    </div>
                    
                    {selectedUser.department && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          <strong>Department:</strong> {selectedUser.department}
                        </span>
                      </div>
                    )}
                    
                    {selectedUser.designation && (
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          <strong>Designation:</strong> {selectedUser.designation}
                        </span>
                      </div>
                    )}
                    
                    {selectedUser.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          <strong>Location:</strong> {selectedUser.location}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        <strong>Joined:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        <strong>Last Login:</strong> {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CheckSquare className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        <strong>Status:</strong> {getStatusBadge(selectedUser.status)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Task Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Task Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedUser.assignedTasks || 0}</div>
                        <div className="text-sm text-blue-800">Assigned Tasks</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedUser.completedTasks || 0}</div>
                        <div className="text-sm text-green-800">Completed Tasks</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* User Activities */}
              {userActivities && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userActivities.length > 0 ? (
                      <div className="space-y-3">
                        {userActivities.slice(0, 5).map((activity, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Activity className="h-4 w-4 text-gray-400" />
                            <div className="flex-1">
                              <div className="text-sm">{activity.description}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <div>No recent activities</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewUserModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}