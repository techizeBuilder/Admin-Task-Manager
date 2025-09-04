import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InviteUsersModal } from '@/components/InviteUsersModal';
import { UserPlus, Users, Mail, Shield, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

export default function InviteUsers() {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Fetch organization license info
  const { data: licenseInfo, isLoading: licenseLoading } = useQuery({
    queryKey: ["/api/organization/license"],
    enabled: true
  });

  // Fetch pending invitations
  const { data: pendingInvites, isLoading: pendingLoading } = useQuery({
    queryKey: ["/api/organization/users-detailed"],
    enabled: true,
    select: (data) => data?.users?.filter(user => user.status === 'invited') || []
  });

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="invite-users-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="page-title">
            Invite Users
          </h1>
          <p className="text-gray-600" data-testid="page-description">
            Invite new team members to join your organization
          </p>
        </div>
        
        <Button 
          onClick={() => setInviteModalOpen(true)}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="invite-users-button"
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Invite Users
        </Button>
      </div>

      {/* License Information Card */}
      {!licenseLoading && licenseInfo && (
        <Card data-testid="license-info-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>License Information</span>
            </CardTitle>
            <CardDescription>
              Current license usage and availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {licenseInfo.totalLicenses}
                </div>
                <div className="text-sm text-gray-600">Total Licenses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {licenseInfo.usedLicenses}
                </div>
                <div className="text-sm text-gray-600">Used Licenses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {licenseInfo.availableSlots}
                </div>
                <div className="text-sm text-gray-600">Available Slots</div>
              </div>
            </div>
            
            {licenseInfo.availableSlots === 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700 text-sm">
                  No licenses available. Please upgrade your subscription to invite more users.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {!pendingLoading && pendingInvites && pendingInvites.length > 0 && (
        <Card data-testid="pending-invites-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-amber-600" />
              <span>Pending Invitations</span>
              <Badge variant="secondary">{pendingInvites.length}</Badge>
            </CardTitle>
            <CardDescription>
              Users who have been invited but haven't accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvites.map((invite, index) => (
                <div 
                  key={invite._id || index}
                  className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                  data-testid={`pending-invite-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-amber-600" />
                    <div>
                      <div className="font-medium text-gray-900">{invite.email}</div>
                      <div className="text-sm text-gray-600">
                        Invited as {invite.role || 'Member'} • {new Date(invite.invitedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="single-invite-card">
          <CardContent className="p-6 text-center">
            <UserPlus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Single User Invite</h3>
            <p className="text-gray-600 text-sm mb-4">
              Invite one user at a time with specific role assignment
            </p>
            <Button 
              onClick={() => setInviteModalOpen(true)}
              variant="outline"
              className="w-full"
            >
              Invite Single User
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="bulk-invite-card">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Bulk Invite</h3>
            <p className="text-gray-600 text-sm mb-4">
              Invite multiple users at once using email list
            </p>
            <Button 
              onClick={() => setInviteModalOpen(true)}
              variant="outline"
              className="w-full"
            >
              Bulk Invite Users
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="manage-users-card">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Manage Users</h3>
            <p className="text-gray-600 text-sm mb-4">
              View and manage all organization users
            </p>
            <Button 
              onClick={() => window.location.href = '/admin/users'}
              variant="outline"
              className="w-full"
            >
              Go to User Management
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Invitation Instructions */}
      <Card data-testid="instructions-card">
        <CardHeader>
          <CardTitle>Invitation Process</CardTitle>
          <CardDescription>
            How the user invitation process works
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Send Invitation</h4>
                <p className="text-gray-600 text-sm">
                  Enter user email and assign role. An invitation email will be sent with a 72-hour activation link.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900">User Accepts</h4>
                <p className="text-gray-600 text-sm">
                  Invited user clicks the activation link and completes their profile setup.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Account Activated</h4>
                <p className="text-gray-600 text-sm">
                  User account becomes active and they can access the organization with assigned permissions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Users Modal */}
      <InviteUsersModal 
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </div>
  );
}