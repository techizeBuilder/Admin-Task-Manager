import "./env.ts"; // Ensure environment variables are loaded
import { createServer } from "http";
import cors from "cors";
import express from "express";
import path from "path";
import fs from "fs";
import { storage } from "./mongodb-storage.js";
import { authenticateToken, requireRole } from "./middleware/roleAuth.js";
import { requireSuperAdmin } from "./middleware/superAdminAuth.js";
import { authService } from "./services/authService.js";
import {
  uploadProfileImage,
  processProfileImage,
  deleteOldProfileImage,
} from "./middleware/upload.js";
import userRoutes from "./routes/userRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import { emailService } from "./services/emailService.js";
import { registerLoginCustomizationRoutes } from "./routes/loginCustomization.js";
import taskRoutes from "./routes/taskRoutes.js";
import { registerUserInvitationRoutes } from "./routes/userInvitation.js";
import authRoutes from "./routes/authRoutes.js";
import { googleCalendarRoutes } from "./routes/googleCalendar.js";
import rateLimit from 'express-rate-limit';

export async function registerRoutes(app) {
  // Configure CORS
  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
      ],
    })
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Serve static files for uploaded images
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  app.use("/api", userRoutes);
  app.use("/api/super-admin", superAdminRoutes);
  app.use("/api/auth", authRoutes);
  // Register user invitation routes
  try {
    registerUserInvitationRoutes(app);
    console.log("User invitation routes registered successfully");
  } catch (error) {
    console.error("Error registering user invitation routes:", error);
  }

  app.get("/api/organization/details", authenticateToken, async (req, res) => {
    try {
      if (!req.user.organizationId) {
        return res
          .status(400)
          .json({ message: "User not associated with any organization" });
      }

      const organization = await storage.getOrganization(
        req.user.organizationId
      );

      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Return complete organization object
      res.json(organization);
    } catch (error) {
      console.error("Get organization details error:", error);
      res.status(500).json({ message: "Failed to fetch organization details" });
    }
  });

  // Get team members for current user's organization
  app.get("/api/team-members", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      console.log("Team members API - User from token:", {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      });

      if (!user.organizationId) {
        console.log("No organizationId for user");
        return res
          .status(400)
          .json({ message: "User not associated with any organization" });
      }

      // Get all users in the same organization
      console.log("Fetching team members for org:", user.organizationId);
      const teamMembers = await storage.getOrganizationUsersDetailed(
        user.organizationId
      );
      console.log("Team members found:", teamMembers.length);

      // Format the response to include only necessary fields
      const formattedMembers = teamMembers.map((member) => ({
        id: member._id,
        firstName: member.firstName,
        lastName: member.lastName,
        fullName: `${member.firstName || ""} ${member.lastName || ""}`.trim(),
        email: member.email,
        role: member.role,
        status: member.status,
        profileImageUrl: member.profileImageUrl,
        isActive: member.isActive,
        emailVerified: member.emailVerified,
        lastLoginAt: member.lastLoginAt,
        createdAt: member.createdAt,
        invitedBy: member.invitedBy
          ? {
              id: member.invitedBy._id,
              name: `${member.invitedBy.firstName || ""} ${
                member.invitedBy.lastName || ""
              }`.trim(),
            }
          : null,
        invitedAt: member.invitedAt,
      }));

      res.json(formattedMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // User routes
  app.get("/api/users", authenticateToken, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get individual user by ID (no auth required for internal use)
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return clean user data without sensitive fields
      const userProfile = {
        _id: user._id,

        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profileImageUrl: user.profileImageUrl || null,
        role: user.role,
        organizationId: user.organization_id,
        status: user.status,

        isPrimaryAdmin: user.isPrimaryAdmin || false,
        lastLoginAt: user.lastLoginAt || null,
        phone: user.phone || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      res.json(userProfile);
    } catch (error) {
      console.error("Get user by ID error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile by ID
  app.put(
    "/api/users/:id/profile",
    uploadProfileImage,
    processProfileImage,
    async (req, res) => {
      try {
        const userId = req.params.id;
        const { firstName, lastName, phone, organizationName } = req.body;

        // Fetch current user once to access org id and existing image
        const currentUser = await storage.getUser(userId);

        console.log("Profil>>>>>>>>>>>>", {
          organizationName,
        });

        // Validate required fields
        if (!firstName || !firstName.trim()) {
          return res.status(400).json({ message: "First name is required" });
        }

        // Build update object
        const updateData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone ? phone.trim() : null,
        };

        // Handle profile image upload
        if (req.file) {
          // Delete old profile image if exists
          if (currentUser?.profileImageUrl) {
            deleteOldProfileImage(currentUser.profileImageUrl);
          }

          // Set new profile image path
          updateData.profileImageUrl = `/uploads/profile-pics/${req.file.filename}`;
        }

        // Update organization name if provided and user belongs to an organization
        if (organizationName?.trim() && currentUser) {
          const orgId =
            currentUser.organization_id ||
            currentUser.organizationId ||
            currentUser.organization;

          if (orgId) {
            try {
              // Check if the name already exists for a different organization
              if (typeof storage.getOrganizationByName === "function") {
                const existingOrg = await storage.getOrganizationByName(
                  organizationName.trim()
                );
               
              }
              if (typeof storage.updateOrganizationName === "function") {
                await storage.updateOrganizationName(
                  orgId,
                  organizationName.trim()
                );
              } else if (typeof storage.updateOrganization === "function") {
                await storage.updateOrganization(orgId, {
                  name: organizationName.trim(),
                });
              } else if (typeof storage.updateCompany === "function") {
                await storage.updateCompany(orgId, {
                  name: organizationName.trim(),
                });
              } else {
                console.warn(
                  "No storage method available to update organization name"
                );
              }
            } catch (e) {
              console.error("Update organization name error:", e);
              // Do not fail the entire profile update if org rename fails
            }
          }
        }

        console.log("Profile Update - Update data:", updateData);

        const updatedUser = await storage.updateUser(userId, updateData);

        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }

        // Return clean user profile data
        const userProfile = {
          _id: updatedUser._id,
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone,
          profileImageUrl: updatedUser.profileImageUrl,
          role: updatedUser.role,
          organizationId: updatedUser.organizationId,
          status: updatedUser.status,
          updatedAt: updatedUser.updatedAt,
        };

        console.log("Profile Update - Success:", userProfile);
        res.json({
          message: "Profile updated successfully",
          user: userProfile,
        });
      } catch (error) {
        console.error("Update user profile error:", error);

        // Delete uploaded file on error
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error("Error deleting uploaded file:", unlinkError);
          }
        }

        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  );

  // Get current user profile
  app.get("/api/profile", authenticateToken, async (req, res) => {
    try {
      console.log("Profile API called - User ID:", req.user.id);
      const user = await storage.getUser(req.user.id);
      if (!user) {
        console.log("Profile API - User not found for ID:", req.user.id);
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Profile API - Raw user data:", user);

      // Remove sensitive data and return clean profile
      const userProfile = {
        _id: user._id,
        id: user._id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profileImageUrl: user.profileImageUrl || null,
        role: user.role,
        organizationId: user.organizationId || user.organization,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      console.log("Profile API - Sending response:", userProfile);
      res.json(userProfile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update user profile
  app.put(
    "/api/profile",
    authenticateToken,
    uploadProfileImage,
    processProfileImage,
    async (req, res) => {
      try {
        const userId = req.user.id;
        const { firstName, lastName, phone } = req.body;

        console.log("Profile Update - Request data:", {
          userId,
          firstName,
          lastName,
          hasFile: !!req.file,
        });

        // Validate required fields
        if (!firstName || !firstName.trim()) {
          return res.status(400).json({ message: "First name is required" });
        }

        // Build update object with only allowed fields
        const updateData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone ? phone.trim() : null,
        };

        // Handle profile image upload
        if (req.file) {
          const currentUser = await storage.getUser(userId);

          // Delete old profile image if exists
          if (currentUser.profileImageUrl) {
            deleteOldProfileImage(currentUser.profileImageUrl);
          }

          // Set new profile image path
          updateData.profileImageUrl = `/uploads/profile-pics/${req.file.filename}`;
        }

        const updatedUser = await storage.updateUser(userId, updateData);

        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }

        // Return clean user profile data
        const userProfile = {
          _id: updatedUser._id,
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          profileImageUrl: updatedUser.profileImageUrl,
          role: updatedUser.role,
          organizationId:
            updatedUser.organizationId || updatedUser.organization,
          status: updatedUser.status,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        };

        res.json({
          message: "Profile updated successfully",
          user: userProfile,
        });
      } catch (error) {
        console.error("Update profile error:", error);

        // Delete uploaded file on error
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error("Error deleting uploaded file:", unlinkError);
          }
        }

        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  );

  // Organization routes
  app.get("/api/organization/users", authenticateToken, async (req, res) => {
    try {
      const users = await storage.getOrganizationUsers(req.user.organizationId);
      res.json(users);
    } catch (error) {
      console.error("Get organization users error:", error);
      res.status(500).json({ message: "Failed to fetch organization users" });
    }
  });

  app.get(
    "/api/organization/users-detailed",
    authenticateToken,
    async (req, res) => {
      try {
        const users = await storage.getOrganizationUsersDetailed(
          req.user.organizationId
        );
        res.json(users);
      } catch (error) {
        console.error("Get organization users detailed error:", error);
        res.status(500).json({ message: "Failed to fetch organization users" });
      }
    }
  );

  app.get("/api/organization/license", authenticateToken, async (req, res) => {
    try {
      const licenseInfo = await storage.getOrganizationLicenseInfo(
        req.user.organizationId
      );
      res.json(licenseInfo);
    } catch (error) {
      console.error("Get organization license error:", error);
      res.status(500).json({ message: "Failed to fetch license information" });
    }
  });

  app.post("/api/organization/invite-users", async (req, res) => {
    try {
      const { invites } = req.body;
      console.log("Processing invitation for:", invites);
      if (!invites || !Array.isArray(invites) || invites.length === 0) {
        return res.status(400).json({ message: "Invalid invitation data" });
      }

      const results = {
        successCount: 0,
        errors: [],
        details: [],
      };

      // Get the first organization for testing (temporary fix)
      const organizations = await storage.getAllCompanies();
      const defaultOrgId =
        organizations.length > 0 ? organizations[0]._id : null;

      if (!defaultOrgId) {
        return res
          .status(400)
          .json({ message: "No organization found for invitations" });
      }

      for (const invite of invites) {
        try {
          const inviteData = {
            email: invite.email,
            organizationId: defaultOrgId,
            roles: invite.role,
            invitedBy: defaultOrgId, // Use org ID as placeholder
            invitedByName: "TaskSetu Admin",
            organizationName: "TaskSetu Organization",
            name: invite.name || "",
            licenseId: invite.licenseId || null,
            department: invite.department || null,
            designation: invite.designation || null,
            location: invite.location || null,
            phone: invite.phone || null,
            sendEmail: invite.sendEmail !== false, // default true
          };

          await storage.inviteUserToOrganization(inviteData);
          results.successCount++;
          results.details.push({ email: invite.email, status: "success" });
        } catch (error) {
          console.error(
            "Invitation error for",
            invite.email,
            ":",
            error.message
          );
          results.errors.push({ email: invite.email, error: error.message });
          results.details.push({
            email: invite.email,
            status: "error",
            error: error.message,
          });
        }
      }

      const statusCode = results.successCount > 0 ? 200 : 400;
      const message =
        results.successCount === invites.length
          ? "All invitations sent successfully"
          : results.successCount > 0
          ? "Some invitations sent successfully"
          : "Failed to send invitations";

      res.status(statusCode).json({
        message,
        ...results,
      });
    } catch (error) {
      console.error("Invite users error:", error);
      res.status(500).json({ message: "Failed to process invitations" });
    }
  });

  // Check if email has already been invited (temporarily without auth for testing)
  app.post("/api/organization/check-invitation", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      console.log("Checking invitation for email:", email);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      console.log("Existing user found:", existingUser ? "Yes" : "No");

      if (existingUser) {
        console.log("User is already a member of an organization");
        return res.json({
          exists: true,
          type: "existing_user",
          message: "This email is already a member of an organization",
        });
      }

      // Check if invitation already sent
      const existingInvite = await storage.getPendingUserByEmail(email);
      console.log("Existing invite found:", existingInvite ? "Yes" : "No");

      if (existingInvite) {
        console.log("Invitation already sent to this email");
        return res.json({
          exists: true,
          type: "pending_invitation",
          message:
            "This email has already received an invitation. Try another email.",
        });
      }

      res.json({ exists: false });
    } catch (error) {
      console.error("Check invitation error:", error);
      res.status(500).json({
        message: "Failed to check invitation status",
        error: error.message,
      });
    }
  });

  // Add new user (Company Admin only)
  app.post("/api/organization/users", authenticateToken, async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        role,
        department,
        designation,
        location,
      } = req.body;
      const adminUser = req.user;

      // Check if user has admin privileges
      if (!adminUser || !["admin", "org_admin"].includes(adminUser.role)) {
        return res
          .status(403)
          .json({ message: "Insufficient privileges for user management" });
      }

      // Validate required fields
      if (!firstName || !lastName || !email || !role) {
        return res
          .status(400)
          .json({ message: "Name, email, and role are required" });
      }

      // Check license availability
      const licenseInfo = await storage.getOrganizationLicenseInfo(
        adminUser.organizationId
      );
      if (licenseInfo.availableSlots <= 0) {
        return res.status(400).json({
          message: "No available licenses. Please upgrade your plan.",
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }

      // Generate invitation token
      const inviteToken = storage.generateEmailVerificationToken();
      const inviteExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

      // Create user with invitation
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        role: role,
        department: department?.trim() || "",
        designation: designation?.trim() || "",
        location: location?.trim() || "",
        organization: adminUser.organizationId,
        status: "invited",
        inviteToken: inviteToken,
        inviteTokenExpiry: inviteExpiry,
        invitedBy: adminUser.id,
        invitedAt: new Date(),
      };

      const newUser = await storage.createUser(userData);

      // Send invitation email (placeholder - implement as needed)
      console.log(`Invitation sent to ${email} with token: ${inviteToken}`);

      res.json({
        message: "User invited successfully",
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
        },
      });
    } catch (error) {
      console.error("Add user error:", error);
      res.status(500).json({ message: "Failed to add user" });
    }
  });

  // Update user details (Company Admin only)
  app.patch(
    "/api/organization/users/:userId",
    authenticateToken,
    async (req, res) => {
      try {
        const { userId } = req.params;
        const { firstName, lastName, department, designation, location } =
          req.body;
        const adminUser = req.user;

        // Check admin privileges
        if (!adminUser || !["admin", "org_admin"].includes(adminUser.role)) {
          return res
            .status(403)
            .json({ message: "Insufficient privileges for user management" });
        }

        // Validate user exists and belongs to same organization
        const targetUser = await storage.getUser(userId);
        if (
          !targetUser ||
          targetUser.organization.toString() !== adminUser.organizationId
        ) {
          return res.status(404).json({ message: "User not found" });
        }

        // Update user data
        const updateData = {};
        if (firstName) updateData.firstName = firstName.trim();
        if (lastName) updateData.lastName = lastName.trim();
        if (department !== undefined) updateData.department = department.trim();
        if (designation !== undefined)
          updateData.designation = designation.trim();
        if (location !== undefined) updateData.location = location.trim();

        const updatedUser = await storage.updateUser(userId, updateData);

        res.json({
          message: "User updated successfully",
          user: {
            id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            department: updatedUser.department,
            designation: updatedUser.designation,
            location: updatedUser.location,
          },
        });
      } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ message: "Failed to update user" });
      }
    }
  );

  // Change user role (Company Admin only)
  app.patch(
    "/api/organization/users/:userId/role",
    authenticateToken,
    async (req, res) => {
      try {
        const { userId } = req.params;
        const { role } = req.body;
        const adminUser = req.user;

        // Check admin privileges
        if (!adminUser || !["admin", "org_admin"].includes(adminUser.role)) {
          return res
            .status(403)
            .json({ message: "Insufficient privileges for user management" });
        }

        // Validate role
        const validRoles = ["admin", "manager", "employee"];
        if (!validRoles.includes(role)) {
          return res.status(400).json({ message: "Invalid role specified" });
        }

        // Validate user exists and belongs to same organization
        const targetUser = await storage.getUser(userId);
        if (
          !targetUser ||
          targetUser.organization.toString() !== adminUser.organizationId
        ) {
          return res.status(404).json({ message: "User not found" });
        }

        // Update user role
        const updatedUser = await storage.updateUser(userId, { role: role });

        res.json({
          message: "User role updated successfully",
          user: {
            id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
          },
        });
      } catch (error) {
        console.error("Role change error:", error);
        res.status(500).json({ message: "Failed to change user role" });
      }
    }
  );

  // Deactivate user (Company Admin only)
  app.patch(
    "/api/organization/users/:userId/deactivate",
    authenticateToken,
    async (req, res) => {
      try {
        const { userId } = req.params;
        const adminUser = req.user;

        // Check admin privileges
        if (!adminUser || !["admin", "org_admin"].includes(adminUser.role)) {
          return res
            .status(403)
            .json({ message: "Insufficient privileges for user management" });
        }

        // Validate user exists and belongs to same organization
        const targetUser = await storage.getUser(userId);
        if (
          !targetUser ||
          targetUser.organization.toString() !== adminUser.organizationId
        ) {
          return res.status(404).json({ message: "User not found" });
        }

        // Cannot deactivate self
        if (targetUser._id.toString() === adminUser.id) {
          return res
            .status(400)
            .json({ message: "Cannot deactivate your own account" });
        }

        // Update user status
        const updatedUser = await storage.updateUser(userId, {
          status: "inactive",
          isActive: false,
        });

        res.json({
          message: "User deactivated successfully",
          user: {
            id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            status: updatedUser.status,
          },
        });
      } catch (error) {
        console.error("Deactivate user error:", error);
        res.status(500).json({ message: "Failed to deactivate user" });
      }
    }
  );

  // Reactivate user (Company Admin only)
  app.patch(
    "/api/organization/users/:userId/reactivate",
    authenticateToken,
    async (req, res) => {
      try {
        const { userId } = req.params;
        const adminUser = req.user;

        // Check admin privileges
        if (!adminUser || !["admin", "org_admin"].includes(adminUser.role)) {
          return res
            .status(403)
            .json({ message: "Insufficient privileges for user management" });
        }

        // Validate user exists and belongs to same organization
        const targetUser = await storage.getUser(userId);
        if (
          !targetUser ||
          targetUser.organization.toString() !== adminUser.organizationId
        ) {
          return res.status(404).json({ message: "User not found" });
        }

        // Update user status
        const updatedUser = await storage.updateUser(userId, {
          status: "active",
          isActive: true,
        });

        res.json({
          message: "User reactivated successfully",
          user: {
            id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            status: updatedUser.status,
          },
        });
      } catch (error) {
        console.error("Reactivate user error:", error);
        res.status(500).json({ message: "Failed to reactivate user" });
      }
    }
  );

  // Remove user permanently (Company Admin only)

  // Resend invitation (Company Admin only)
  app.post(
    "/api/organization/users/:userId/resend-invite",
    authenticateToken,
    async (req, res) => {
      try {
        const { userId } = req.params;
        const adminUser = req.user;

        // Check admin privileges
        if (!adminUser || !["admin", "org_admin"].includes(adminUser.role)) {
          return res
            .status(403)
            .json({ message: "Insufficient privileges for user management" });
        }

        // Validate user exists and belongs to same organization
        const targetUser = await storage.getUser(userId);
        if (
          !targetUser ||
          targetUser.organization.toString() !== adminUser.organizationId
        ) {
          return res.status(404).json({ message: "User not found" });
        }

        // Only resend for invited users
        if (targetUser.status !== "invited") {
          return res
            .status(400)
            .json({ message: "User is not in invited status" });
        }

        // Generate new invitation token
        const newInviteToken = storage.generateEmailVerificationToken();
        const newExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

        // Update user with new token
        await storage.updateUser(userId, {
          inviteToken: newInviteToken,
          inviteTokenExpiry: newExpiry,
          invitedAt: new Date(),
        });

        // Send new invitation email (placeholder)
        console.log(
          `New invitation sent to ${targetUser.email} with token: ${newInviteToken}`
        );

        res.json({
          message: "Invitation resent successfully",
        });
      } catch (error) {
        console.error("Resend invite error:", error);
        res.status(500).json({ message: "Failed to resend invitation" });
      }
    }
  );

  // Get user activities (placeholder for user activity tracking)
  app.get(
    "/api/users/activities/:userId",
    authenticateToken,
    async (req, res) => {
      try {
        const { userId } = req.params;
        const adminUser = req.user;

        // Check admin privileges or same user
        if (
          !adminUser ||
          (!["admin", "org_admin"].includes(adminUser.role) &&
            adminUser.id !== userId)
        ) {
          return res.status(403).json({ message: "Insufficient privileges" });
        }

        // Placeholder for user activities - implement actual activity tracking as needed
        const activities = [
          {
            description: "Logged in to the system",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            type: "login",
          },
          {
            description: "Completed task: Update user documentation",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            type: "task_completion",
          },
          {
            description: "Created new task: Review quarterly reports",
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            type: "task_creation",
          },
        ];

        res.json(activities);
      } catch (error) {
        console.error("Get user activities error:", error);
        res.status(500).json({ message: "Failed to fetch user activities" });
      }
    }
  );

  // Login customization routes
  registerLoginCustomizationRoutes(app);

  // Task routes
  app.use("/api", taskRoutes);

  // Google Calendar routes
  // Temporary public config route for debugging
  app.get("/api/google-calendar-debug", (req, res) => {
    res.json({
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
      clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
      redirectUri: `${process.env.CLIENT_URL || 'http://localhost:8001'}/google-calendar-callback`,
      clientIdPreview: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
      clientSecretPreview: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10) + '...'
    });
  });

  app.use("/api/google-calendar", authenticateToken, googleCalendarRoutes);
  
  // // Test Google Calendar routes (for development)
  // app.use("/api/test-google-calendar", authenticateToken, testGoogleCalendarRoutes);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
