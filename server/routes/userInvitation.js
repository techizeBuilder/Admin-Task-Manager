import express from 'express';
import { authenticateToken, requireOrgAdminOrAbove } from "../middleware/roleAuth.js";
import { storage } from "../mongodb-storage.js";
import { emailService } from "../services/emailService.js";

const router = express.Router();

// Check if email exists
router.post("/check-email-exists", authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser && existingUser.organization?.toString() === req.user.organizationId) {
      return res.json({ 
        exists: true,
        message: "This email is already a member of your organization"
      });
    }

    res.json({ exists: false });
  } catch (error) {
    console.error("Email check error:", error);
    res.status(500).json({ message: "Failed to check email" });
  }
});

// Send user invitation - requires manager role or above  
router.post("/invite-users", authenticateToken, requireOrgAdminOrAbove, async (req, res) => {
  try {
    const { invites ,adminUser } = req.body;
    
    console.log('>>>>adminUser',adminUser)
    if (!invites || !Array.isArray(invites) || invites.length === 0) {
      return res.status(400).json({ message: "Invalid invitation data" });
    }

    const results = {
      success: [],
      errors: [],
      details: []
    };

    for (const invite of invites) {
      try {

        // Basic validation
        if (!invite.name || !invite.email || !invite.role) {
          results.errors.push({
            email: invite.email || 'unknown',
            error: 'All required fields must be provided (name, email, role)'
          });
          continue;
        }

        // Check email format - basic validation
        const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
        if (!emailRegex.test(invite.email)) {
          results.errors.push({
            email: invite.email,
            error: `Invalid email format: ${invite.email}`
          });
          continue;
        }
        
    
    
        // Validate role format - support both frontend and backend role values
        const validRoles = ['admin', 'user', 'manager',  'employee', 'org_admin'];
         if (!invite.role.every(r => validRoles.includes(r))) {
          results.errors.push({
            email: invite.email,
            error: `Invalid role. Must be one of: ${validRoles.join(', ')}`
          });
          continue;
        }

        // Skip license validation for now - can be added later if needed
        // License ID is optional in this implementation

        // Check for existing user
        const existingUser = await storage.getUserByEmail(invite.email);
        if (existingUser) {
          results.errors.push({
            email: invite.email,
            error: 'Email is already registered'
          });
          continue;
        }

        // Get organization details for invitation
            
        const organization = await storage.getOrganization(adminUser.organizationId);
        const organizationName = organization?.name || 'TaskSetu';

        // Create the user invitation using the correct method
        const invitationResult = await storage.inviteUserToOrganization({
          email: invite.email,
          organizationId: adminUser.organizationId,
          roles: invite.role,
          invitedBy: adminUser.id,
          invitedByName: adminUser.name || adminUser.email,
          organizationName: organizationName,
          licenseId: invite.licenseId || null,  // pass licenseId if provided
          sendEmail: invite.sendEmail !== false // default true
        });
        console.log('Invitation result:', invitationResult);
        results.success.push({
          email: invite.email,
          message: 'Invitation sent successfully'
        });

      } catch (error) {
       
        results.errors.push({
          email: invite.email,
          error: 'Failed to process invitation old'
        });
      }
    }

    res.json({
      message: "Invitations processed",
      results
    });
  } catch (error) {
    console.error("Invite users error:", error);
    res.status(500).json({ message: "Failed to process invitations old" });
  }
});

// Export router and registration function
export function registerUserInvitationRoutes(app) {
  console.log('Registering user invitation routes');
  app.use('/api/organization', router);
}
