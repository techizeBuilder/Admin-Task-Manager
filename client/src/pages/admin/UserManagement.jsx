import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, UserPlus, UserX, Mail, Trash2, Plus, Shield, Clock, CheckCircle, XCircle, AlertCircle, MoreHorizontal, Calendar } from "lucide-react";
import { getInitials } from "@/lib/utils";
export default function UserManagement() {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteUsers, setInviteUsers] = useState([{ email: "", roles: ["member"] }]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch organization users with detailed information including invited users
  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/organization/users-detailed"],
    enabled: true
  });

  // Fetch organization license info
  const { data: orgLicenseInfo } = useQuery({
    queryKey: ["/api/organization/license"],
    enabled: true
  });

  // Invite users mutation
  const inviteUsersMutation = useMutation({
    mutationFn: (invites) => apiRequest("/api/organization/invite-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invites })
    }),
    onSuccess: (data) => {
      setInviteModalOpen(false);
      setInviteUsers([{ email: "", roles: ["member"] }]);
      queryClient.invalidateQueries({ queryKey: ["/api/organization/users-detailed"] });
      
      if (data.errors && data.errors.length > 0) {
        toast({
          title: "Partial Success",
          description: `${data.successCount} users invited successfully. ${data.errors.length} errors occurred.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Invitation sent successfully",
          description: `Successfully invited ${data.successCount} users`,
          variant: "default"
        });
      }
    },
    onError: (error) => {
      // Handle duplicate invite error specifically
      if (error.message && error.message.includes("already invited")) {
        toast({
          title: "User already invited or registered",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to invite users",
          variant: "destructive"
        });
      }
    }
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: (userId) => apiRequest("PATCH", `/api/users/${userId}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/organization"] });
      toast({
        title: "Success",
        description: "User deactivated successfully",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate user",
        variant: "destructive"
      });
    }
  });

  // Resend invite mutation
  const resendInviteMutation = useMutation({
    mutationFn: (userId) => apiRequest("POST", `/api/users/${userId}/resend-invite`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invitation resent successfully",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
        variant: "destructive"
      });
    }
  });

  const handleAddUserRow = () => {
    setInviteUsers([...inviteUsers, { email: "", roles: ["member"] }]);
  };

  const handleRemoveUserRow = (index) => {
    if (inviteUsers.length > 1) {
      setInviteUsers(inviteUsers.filter((_, i) => i !== index));
    }
  };

  const handleUserChange = (index, field, value) => {
    const updated = [...inviteUsers];
    updated[index][field] = value;
    setInviteUsers(updated);
  };

  const handleRoleChange = (index, role, checked) => {
    const updated = [...inviteUsers];
    if (checked && !updated[index].roles.includes(role)) {
      updated[index].roles.push(role);
    } else if (!checked) {
      updated[index].roles = updated[index].roles.filter(r => r !== role);
    }
    // Always ensure 'member' is included
    if (!updated[index].roles.includes('member')) {
      updated[index].roles.push('member');
    }
    setInviteUsers(updated);
  };

  const handleInviteSubmit = () => {
    const validUsers = inviteUsers.filter(user => user.email.trim() !== "");
    
    if (validUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid email address",
        variant: "destructive"
      });
      return;
    }

    inviteUsersMutation.mutate(validUsers);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { 
        variant: "default", 
        icon: CheckCircle, 
        color: "text-green-600 bg-green-50 border-green-200",
        label: "Active"
      },
      invited: { 
        variant: "secondary", 
        icon: Mail, 
        color: "text-blue-600 bg-blue-50 border-blue-200",
        label: "Invited"
      },
      pending: { 
        variant: "outline", 
        icon: Clock, 
        color: "text-slate-700 bg-slate-100 border-slate-300",
        label: "Pending"
      },
      inactive: { 
        variant: "destructive", 
        icon: XCircle, 
        color: "text-red-600 bg-red-50 border-red-200",
        label: "Inactive"
      },
      suspended: { 
        variant: "destructive", 
        icon: AlertCircle, 
        color: "text-orange-600 bg-orange-50 border-orange-200",
        label: "Suspended"
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </div>
    );
  };

  const getRolesBadges = (roles) => {
    if (!Array.isArray(roles)) return null;
    
    const roleConfig = {
      admin: { color: "text-purple-700 bg-purple-100 border-purple-200", icon: Shield },
      manager: { color: "text-indigo-700 bg-indigo-100 border-indigo-200", icon: Users },
      member: { color: "text-gray-700 bg-gray-100 border-gray-200", icon: Users }
    };
    
    return (
      <div className="flex gap-1.5 flex-wrap">
        {roles.map((role, index) => {
          const config = roleConfig[role] || roleConfig.member;
          const Icon = config.icon;
          return (
            <div key={index} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${config.color}`}>
              <Icon className="h-3 w-3" />
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </div>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };


  const getDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email.split('@')[0];
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const users = userData || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage team members and their access</p>
        </div>
        
        <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Users
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="border-b border-gray-200 pb-4">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                </div>
                Invite Team Members
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-2">
                Send invitations to new team members. They'll receive an email with instructions to join your organization.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-6">
              {inviteUsers.map((user, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4 relative">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Team Member {index + 1}</Label>
                        <p className="text-sm text-gray-600">Configure access and permissions</p>
                      </div>
                    </div>
                    {inviteUsers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUserRow(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor={`email-${index}`} className="text-sm font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id={`email-${index}`}
                        type="email"
                        value={user.email}
                        onChange={(e) => handleUserChange(index, "email", e.target.value)}
                        placeholder="colleague@company.com"
                        className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">Role Permissions</Label>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <Checkbox
                            id={`member-${index}`}
                            checked={true}
                            disabled={true}
                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`member-${index}`} className="text-sm font-medium text-blue-700">
                              Member
                            </Label>
                            <p className="text-xs text-blue-600">Basic access (Required)</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <Checkbox
                            id={`manager-${index}`}
                            checked={user.roles.includes("manager")}
                            onCheckedChange={(checked) => handleRoleChange(index, "manager", checked)}
                            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`manager-${index}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                              Manager
                            </Label>
                            <p className="text-xs text-gray-500">Project oversight and team coordination</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <Checkbox
                            id={`admin-${index}`}
                            checked={user.roles.includes("admin")}
                            onCheckedChange={(checked) => handleRoleChange(index, "admin", checked)}
                            className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`admin-${index}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                              Administrator
                            </Label>
                            <p className="text-xs text-gray-500">Full system access and user management</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                <Button
                  variant="ghost"
                  onClick={handleAddUserRow}
                  className="w-full h-auto py-4 text-gray-600 hover:text-gray-900 hover:bg-white"
                >
                  <Plus className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Add Another Team Member</div>
                    <div className="text-sm text-gray-500">Invite multiple people at once</div>
                  </div>
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-8">
                <div className="flex gap-3">
                  <Button
                    onClick={handleInviteSubmit}
                    disabled={inviteUsersMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
                  >
                    {inviteUsersMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Invitations...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send {inviteUsers.length} Invitation{inviteUsers.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-8 h-12 text-base border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Invited users will receive an email with instructions to join your organization
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* License Summary Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">License Overview</h3>
              <p className="text-sm text-gray-600 mt-1">Monitor your team capacity and usage</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-blue-600">{orgLicenseInfo?.totalLicenses || 0}</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Total Licenses</h4>
              <p className="text-sm text-gray-600">Maximum team size</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-green-600">{orgLicenseInfo?.usedLicenses || 0}</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Active Users</h4>
              <p className="text-sm text-gray-600">Currently using licenses</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-100">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-orange-600">{orgLicenseInfo?.availableSlots || 0}</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Available</h4>
              <p className="text-sm text-gray-600">Ready for new team members</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-lg font-bold text-purple-600">{orgLicenseInfo?.licenseType || 'Standard'}</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Plan Type</h4>
              <p className="text-sm text-gray-600">Current subscription</p>
            </div>
          </div>
          
          {/* Usage Progress Bar */}
          <div className="mt-6 bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">License Usage</span>
              <span className="text-sm text-gray-600">
                {orgLicenseInfo?.usedLicenses || 0} of {orgLicenseInfo?.totalLicenses || 0} used
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${orgLicenseInfo?.totalLicenses > 0 ? (orgLicenseInfo.usedLicenses / orgLicenseInfo.totalLicenses) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Team Members</CardTitle>
              <CardDescription className="mt-1">
                Manage your organization's users and their permissions
              </CardDescription>
            </div>
            <div className="text-sm text-gray-600">
              {users.length} {users.length === 1 ? 'member' : 'members'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900">User</TableHead>
                    <TableHead className="font-semibold text-gray-900">Roles</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="font-semibold text-gray-900">Joined</TableHead>
                    <TableHead className="font-semibold text-gray-900">Last Active</TableHead>
                    <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                              {getInitials(user.firstName, user.lastName, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-gray-900 truncate">
                              {getDisplayName(user)}
                            </div>
                            <div className="text-sm text-gray-600 truncate">
                              {user.email}
                            </div>
                            {user.invitedBy && (
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Mail className="h-3 w-3" />
                                Invited by {user.invitedBy.firstName} {user.invitedBy.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getRolesBadges(user.roles)}
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-sm text-gray-600">
                          {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {(user.status === 'invited' || user.status === 'pending') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resendInviteMutation.mutate(user._id)}
                              disabled={resendInviteMutation.isPending}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Resend Invitation"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          {user.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deactivateUserMutation.mutate(user._id)}
                              disabled={deactivateUserMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Deactivate User"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-gray-600"
                            title="More Options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-600 mb-4">Start building your team by inviting members to collaborate.</p>
              <Button
                onClick={() => setInviteModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite First Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}