import express from 'express';
import { authenticateToken, requireOrgAdminOrAbove } from "../middleware/roleAuth.js";
import { storage } from "../mongodb-storage.js";
import { emailService } from "../services/emailService.js";
import { User } from "../modals/userModal.js";
const router = express.Router();
/**
 * @swagger
 * /api/organization/check-email-exists:
 *   post:
 *     summary: Check if an email is already a member of your organization
 *     tags: [Organization - User Invitation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Email is required
 *       500:
 *         description: Failed to check email
 */
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

/**
 * @swagger
 * /api/organization/invite-users:
 *   post:
 *     summary: Invite users to your organization
 *     tags: [Organization - User Invitation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invites:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["employee"]
 *                     licenseId:
 *                       type: string
 *                     department:
 *                       type: string
 *                     designation:
 *                       type: string
 *                     location:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     sendEmail:
 *                       type: boolean
 *               adminUser:
 *                 type: object
 *                 description: (Usually injected by backend, not required in request)
 *     responses:
 *       200:
 *         description: Invitations processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                           message:
 *                             type: string
 *                           userId:
 *                             type: string
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           email:
 *                             type: string
 *                           error:
 *                             type: string
 *       400:
 *         description: Invalid invitation data
 *       500:
 *         description: Failed to process invitations
 */
// Send user invitation - requires manager role or above  
router.post(
  "/invite-users",
  authenticateToken,
  requireOrgAdminOrAbove,
  async (req, res) => {
    try {
      const { invites, adminUser } = req.body;

      if (!invites || !Array.isArray(invites) || invites.length === 0) {
        return res.status(400).json({ message: "Invalid invitation data" });
      }
      console.log("Processing invitation for:",  invites);
      const results = {
        success: [],
        errors: [],
        details: [],
      };

      for (const invite of invites) {
        try {
          // ✅ Basic validation
          if (!invite.name || !invite.email || !invite.role) {
            results.errors.push({
              email: invite.email || "unknown",
              error: "All required fields must be provided (name, email, role)",
            });
            continue;
          }

          // ✅ Email format validation
          const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
          if (!emailRegex.test(invite.email)) {
            results.errors.push({
              email: invite.email,
              error: `Invalid email format: ${invite.email}`,
            });
            continue;
          }

          // ✅ Validate role
          const validRoles = [
            "admin",
            "user",
            "manager",
            "employee",
            "org_admin",
          ];
          if (!invite.role.every((r) => validRoles.includes(r))) {
            results.errors.push({
              email: invite.email,
              error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
            });
            continue;
          }

          // ✅ Check for existing user (org-specific)
          const existingUser = await User.findOne({
            email: invite.email.toLowerCase(),
            organization_id: adminUser.organizationId,
          });

          if (existingUser) {
            results.errors.push({
              email: invite.email,
              error: "Email is already registered in this organization",
            });
            continue;
          }

          // ✅ Get organization details
          const organization = await storage.getOrganization(
            adminUser.organizationId
          );
          const organizationName = organization?.name || "TaskSetu";

          // ✅ Pass full inviteData
          const invitationResult = await storage.inviteUserToOrganization({
            email: invite.email,
            organizationId: adminUser.organizationId,
            roles: invite.role,
            invitedBy: adminUser.id,
            invitedByName: adminUser.name || adminUser.email,
            organizationName,
            licenseId: invite.licenseId || null,
            department: invite.department || null,
            designation: invite.designation || null,
            location: invite.location || null,
            phone: invite.phone || null,
            name: invite.name,
            sendEmail: invite.sendEmail !== false, // default true
          });

          results.success.push({
            email: invite.email,
            message: "Invitation sent successfully",
            userId: invitationResult._id,
          });
        } catch (error) {
          results.errors.push({
            email: invite.email,
            error: error.message || "Failed to process invitation",
          });
        }
      }

      res.json({
        message: "Invitations processed",
        results,
      });
    } catch (error) {
      console.error("Invite users error:", error);
      res
        .status(500)
        .json({ message: "Failed to process invitations", error: error.message });
    }
  }
);


// Export router and registration function
export function registerUserInvitationRoutes(app) {
  console.log('Registering user invitation routes');
  app.use('/api/organization', router);
}
