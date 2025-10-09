import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmailInput from '@/components/ui/EmailInput';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Send, X } from 'lucide-react';
import { USER_ROLES } from '@/constants/userRoles';

export default function InviteUserDialog({ isOpen, onOpenChange, onInvite }) {
  const [inviteData, setInviteData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: USER_ROLES.NORMAL_USER,
    department: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailValid, setEmailValid] = useState(false);

  const handleEmailChange = (email) => {
    setInviteData(prev => ({ ...prev, email }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!emailValid || !inviteData.email) {
      alert('Please enter a valid, available email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Mock invite API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onInvite?.(inviteData);
      
      // Reset form
      setInviteData({
        email: '',
        firstName: '',
        lastName: '',
        role: USER_ROLES.NORMAL_USER,
        department: '',
        message: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Invite error:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableRoles = [
    { value: USER_ROLES.NORMAL_USER, label: 'Normal User', description: 'Basic task management' },
    { value: USER_ROLES.MANAGER, label: 'Manager', description: 'Team lead with approval rights' },
    { value: USER_ROLES.USER_AS_ADMIN, label: 'User as Admin', description: 'Administrative privileges' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Invite New User</span>
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email with validation */}
          <EmailInput
            label="Email Address *"
            placeholder="user@company.com"
            value={inviteData.email}
            onChange={handleEmailChange}
            onValidationChange={(isValid) => setEmailValid(isValid)}
            required
            showSuggestions={true}
          />

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                placeholder="John"
                value={inviteData.firstName}
                onChange={(e) => setInviteData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                placeholder="Smith"
                value={inviteData.lastName}
                onChange={(e) => setInviteData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          {/* Role selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={inviteData.role}
              onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-xs text-gray-500">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={inviteData.department}
              onValueChange={(value) => setInviteData(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Welcome to our team! Looking forward to working with you."
              value={inviteData.message}
              onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!emailValid || !inviteData.email || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Usage Component for User Management
export function UserManagementWithInvite() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitations, setInvitations] = useState([]);

  const handleInviteUser = (inviteData) => {
    const newInvitation = {
      id: Date.now().toString(),
      ...inviteData,
      status: 'pending',
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
    
    setInvitations(prev => [...prev, newInvitation]);
    console.log('User invited:', newInvitation);
  };

  return (
    <div className="space-y-6">
      {/* Header with invite button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button onClick={() => setShowInviteDialog(true)} className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Pending Invitations</h3>
          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-gray-500">
                      {invitation.firstName} {invitation.lastName} • {invitation.role}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Pending
                  </Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Dialog */}
      <InviteUserDialog
        isOpen={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onInvite={handleInviteUser}
      />
    </div>
  );
}