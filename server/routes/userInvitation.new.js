import express from 'express';
import { authenticateToken } from "../middleware/roleAuth.js";
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

// Send user invitation
router.post("/invite-users", authenticateToken, async (req, res) => {
  try {
    console.log('debugger----->>')
    const { invites } = req.body;
    const adminUser = req.user;

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
        if (!invite.name || !invite.email || !invite.role || !invite.licenseId) {
          results.errors.push({
            email: invite.email || 'unknown',
            error: 'All required fields must be provided (name, email, role, licenseId)'
          });
          continue;
        }

        // Check email format
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(invite.email)) {
          results.errors.push({
            email: invite.email,
            error: 'Invalid email format'
          });
          continue;
        }

        // Check for existing user
        const existingUser = await storage.getUserByEmail(invite.email);
        if (existingUser) {
          results.errors.push({
            email: invite.email,
            error: 'Email is already registered'
          });
          continue;
        }

        // Create the user invitation
        const invitationResult = await storage.createUserInvitation({
          ...invite,
          organizationId: adminUser.organizationId,
          invitedBy: adminUser.id
        });

        if (invite.sendEmail) {
          await emailService.sendInvitation(invite.email, {
            name: invite.name,
            role: invite.role,
            invitedBy: adminUser.name
          });
        }

        results.success.push({
          email: invite.email,
          message: 'Invitation sent successfully'
        });

      } catch (error) {
        console.error("Error processing invitation:", error);
        results.errors.push({
          email: invite.email,
          error: 'Failed to process invitation'
        });
      }
    }

    res.json({
      message: "Invitations processed",
      results
    });
  } catch (error) {
    console.error("Invite users error:", error);
    res.status(500).json({ message: "Failed to process invitations" });
  }
});

// Export router and registration function
export function registerUserInvitationRoutes(app) {
  console.log('Registering user invitation routes');
  app.use('/api/organization', router);
}
