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
import { taskRoutes } from "./routes/taskRoutes.js";
import { registerUserInvitationRoutes } from "./routes/userInvitation.js";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
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
  // Register rate limiter (10 requests/minute per IP)
  const registerLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: "Too many registrations. Please wait a minute." },
    standardHeaders: true,
    legacyHeaders: false,
  });
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

 

 








  // Individual registration
  app.post("/api/auth/register/individual", async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;

      // Validate required fields
      if (!firstName || !email) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        // If user exists but is pending verification, resend verification email
        if (
          existingUser.status === "pending" ||
          existingUser.status === "invited" ||
          !existingUser.emailVerified
        ) {
          // Generate new verification token
          const verificationToken = storage.generateEmailVerificationToken();

          // Update user with new verification token
          await storage.updateUser(existingUser._id, {
            emailVerificationToken: verificationToken,
            emailVerificationExpires: new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ), // 24 hours
          });

          // Resend verification email for individual user
          const emailSent = await emailService.sendVerificationEmail(
            email,
            verificationToken,
            existingUser.firstName || firstName,
            null // Individual registration - no organization
          );

          if (emailSent) {
            console.log("Verification email re-sent successfully to:", email);
          }

          return res.status(200).json({
            message: "We've re-sent your verification link.",
            resent: true,
          });
        }

        // User is fully registered
        return res.status(400).json({
          message:
            "This email is already registered. Please Login or Reset Password.",
        });
      }

      // Create pending user
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        role: "individual",
        status: "pending",
        accountType: "individual",
      };

      const user = await storage.createUser(userData);

      console.log("Individual user created:", user._id);

      // Generate verification token and send email
      const verificationToken = storage.generateEmailVerificationToken();

      // Update user with verification token
      await storage.updateUser(user._id, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // Send verification email for individual user
      const emailSent = await emailService.sendVerificationEmail(
        email,
        verificationToken,
        firstName,
        null // Individual registration - no organization
      );

      if (emailSent) {
        console.log("Verification email sent successfully to:", email);
      } else {
        console.log("Failed to send verification email to:", email);
      }

      res.status(201).json({
        message:
          "Registration successful. Please check your email for verification.",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Individual registration error:", error);
      res
        .status(500)
        .json({ message: "Registration failed. Please try again." });
    }
  });

  // Organization registration
  app.post("/api/auth/register/organization", async (req, res) => {
    try {
      const { firstName, lastName, email, organizationName, isPrimaryAdmin } =
        req.body;

      // Validate required fields
      if (!firstName || !email || !organizationName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Validate organization name length
      if (
        organizationName.trim().length < 2 ||
        organizationName.trim().length > 100
      ) {
        return res
          .status(400)
          .json({ message: "Organization name must be 2-100 characters" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        if (
          existingUser.status === "pending" ||
          existingUser.status === "invited" ||
          !existingUser.emailVerified
        ) {
          const verificationToken = storage.generateEmailVerificationToken();

          await storage.updateUser(existingUser._id, {
            emailVerificationToken: verificationToken,
            emailVerificationExpires: new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ),
          });

          const emailSent = await emailService.sendVerificationEmail(
            email,
            verificationToken,
            existingUser.firstName || firstName,
            organizationName
          );

          return res.status(200).json({
            message: "We've re-sent your verification link.",
            resent: true,
          });
        }

        return res.status(400).json({
          message:
            "This email is already registered. Please Login or Reset Password.",
        });
      }

      // Generate slug
      const organizationSlug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // Check org slug
      const existingOrg = await storage.getOrganizationBySlug(organizationSlug);
      if (existingOrg) {
        return res
          .status(400)
          .json({ message: "Organization name is already taken" });
      }

      // Create organization
      const orgData = {
        name: organizationName.trim(),
        slug: organizationSlug.toLowerCase().trim(),
        licenseCount: 10,
        isActive: true,
      };

      const organization = await storage.createOrganization(orgData);

      // Create admin user
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        role: ["org_admin"], // ✅ must be an array
        status: "pending",
        organization_id: organization._id, // ✅ match schema field
        accountType: "organization",
        isPrimaryAdmin: isPrimaryAdmin === true,
      };

      const user = await storage.createUser(userData);

      console.log("Organization and admin user created:", {
        orgId: organization._id,
        userId: user._id,
      });

      // Generate verification token and send email
      const verificationToken = storage.generateEmailVerificationToken();

      await storage.updateUser(user._id, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const emailSent = await emailService.sendVerificationEmail(
        email,
        verificationToken,
        firstName,
        organizationName
      );

      res.status(201).json({
        message:
          "Organization registration successful. Please check your email for verification.",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organization: organization._id, // ✅ updated
          organizationName: organization.name,
        },
      });
    } catch (error) {
      console.error("Organization registration error:", error);
      res
        .status(500)
        .json({ message: "Registration failed. Please try again." });
    }
  });

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
        const { firstName, lastName } = req.body;

        console.log("Profile Update - User ID:", userId);
        console.log("Profile Update - Request data:", {
          firstName,
          lastName,
          hasFile: !!req.file,
        });

        // Validate required fields
        if (!firstName || !firstName.trim()) {
          return res.status(400).json({ message: "First name is required" });
        }

        // Build update object
        const updateData = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        };

        // Handle profile image upload
        if (req.file) {
          const currentUser = await storage.getUser(userId);

          // Delete old profile image if exists
          if (currentUser?.profileImageUrl) {
            deleteOldProfileImage(currentUser.profileImageUrl);
          }

          // Set new profile image path
          updateData.profileImageUrl = `/uploads/profile-pics/${req.file.filename}`;
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
        const { firstName, lastName } = req.body;

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

  // Validate invitation token
  // app.get("/api/auth/validate-invite", async (req, res) => {
  //   try {
  //     const { token } = req.query;

  //     if (!token) {
  //       return res
  //         .status(400)
  //         .json({ message: "Invitation token is required" });
  //     }

  //     // Get invitation details by token
  //     const pendingUser = await storage.getUserByInviteToken(token);

  //     if (!pendingUser) {
  //       return res
  //         .status(404)
  //         .json({ message: "Invalid or expired invitation token" });
  //     }

  //     // Check if token is expired
  //     if (
  //       pendingUser.inviteExpires &&
  //       new Date() > new Date(pendingUser.inviteExpires)
  //     ) {
  //       return res
  //         .status(400)
  //         .json({ message: "Invitation token has expired" });
  //     }

  //     // Get organization details
  //     const organization = await storage.getOrganization(
  //       pendingUser.organization_id,
  //     );
  // console.log('Pending user found for invite token>>>:', organization);
  //     res.json({
  //       email: pendingUser.email,
  //       roles: pendingUser.roles,
  //       organization: {
  //         name: organization?.name || "Unknown Organization",
  //         id: organization?._id || pendingUser.organizationId,
  //       },
  //       invitedBy: pendingUser.invitedBy,
  //     });
  //   } catch (error) {
  //     console.error("Validate invite error:", error);
  //     res.status(500).json({ message: "Failed to validate invitation" });
  //   }
  // });

  // Accept invitation and complete registration
  app.post("/api/auth/accept-invite", async (req, res) => {
    try {
      const { token, firstName, lastName, password } = req.body;

      if (!token || !firstName || !lastName || !password) {
        return res.status(400).json({
          message: "Token, first name, last name, and password are required",
        });
      }

      // Complete the invitation
      const result = await storage.completeUserInvitation(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      // Generate auth token for the new user
      const authToken = storage.generateToken(result.user);

      res.json({
        message: "Account created successfully",
        token: authToken,
        user: {
          id: result.user._id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          // organizationId: result.user.organizationId,
        },
      });
    } catch (error) {
      console.error("Accept invite error:", error);
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  });
  // ...existing code...
  app.get("/api/auth/validate-invite", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token) {
        return res
          .status(400)
          .json({ message: "Invitation token is required" });
      }

      const pendingUser = await storage.getUserByInviteToken(token);
      if (!pendingUser) {
        return res
          .status(404)
          .json({ message: "Invalid or expired invitation token" });
      }

      if (
        pendingUser.inviteExpires &&
        new Date() > new Date(pendingUser.inviteExpires)
      ) {
        return res
          .status(400)
          .json({ message: "Invitation token has expired" });
      }

      // Unified org id extraction (handles multiple legacy field names)
      const orgId = pendingUser.organization_id || null;

      let organization = null;
      if (orgId) {
        try {
          organization = await storage.getOrganization(orgId);
        } catch (_) {}
        if (!organization) {
          // Fallback direct model lookup
          try {
            const { Organization } = await import(
              "./modals/organizationModal.js"
            );
            organization = await Organization.findById(orgId).lean();
          } catch (_) {}
        }
      }
      console.log("Pending user found for invite token>>>:", pendingUser);
      res.json({
        email: pendingUser.email,
        role: pendingUser.role,
        organization: {
          id: orgId || null,
          name: organization?.name || "Unknown Organization",
          // optional extra snapshot fields if needed later
          slug: organization?.slug || null,
        },
        organizationName: organization?.name || "Unknown Organization", // convenience field
        invitedBy: pendingUser.invitedBy || null,
      });
    } catch (error) {
      console.error("Validate invite error:", error);
      res.status(500).json({ message: "Failed to validate invitation" });
    }
  });
  // ...existing code...
  app.post("/api/auth/validate-invite-token", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res
          .status(400)
          .json({ message: "Invitation token is required" });
      }

      const pendingUser = await storage.getUserByInviteToken(token);
      if (!pendingUser) {
        return res
          .status(404)
          .json({ message: "Invalid or expired invitation token" });
      }

      if (
        pendingUser.inviteExpires &&
        new Date() > new Date(pendingUser.inviteExpires)
      ) {
        return res
          .status(400)
          .json({ message: "Invitation token has expired" });
      }

      const orgId = pendingUser.organization_id || null;

      let organization = null;
      if (orgId) {
        try {
          organization = await storage.getOrganization(orgId);
        } catch (_) {}
        if (!organization) {
          try {
            const { Organization } = await import(
              "./modals/organizationModal.js"
            );
            organization = await Organization.findById(orgId).lean();
          } catch (_) {}
        }
      }

      res.json({
        email: pendingUser.email,
        roles: Array.isArray(pendingUser.roles)
          ? pendingUser.roles
          : pendingUser.role
          ? [pendingUser.role]
          : [],
        organization: {
          id: orgId || null,
          name: organization?.name || "Unknown Organization",
          slug: organization?.slug || null,
        },
        organizationName: organization?.name || "Unknown Organization",
        invitedBy: pendingUser.invitedBy || null,
      });
    } catch (error) {
      console.error("Validate invite token error:", error);
      res.status(500).json({ message: "Failed to validate invitation token" });
    }
  });
  // ...existing code...
  // Alternative endpoint for validate-invite-token (used by auth/AcceptInvite.jsx)
  app.post("/api/auth/validate-invite-token", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res
          .status(400)
          .json({ message: "Invitation token is required" });
      }

      const pendingUser = await storage.getUserByInviteToken(token);

      if (!pendingUser) {
        return res
          .status(404)
          .json({ message: "Invalid or expired invitation token" });
      }

      if (
        pendingUser.inviteExpires &&
        new Date() > new Date(pendingUser.inviteExpires)
      ) {
        return res
          .status(400)
          .json({ message: "Invitation token has expired" });
      }

      const organization = await storage.getOrganization(
        pendingUser.organizationId
      );

      res.json({
        email: pendingUser.email,
        roles: pendingUser.roles,
        organization: {
          name: organization?.name || "Unknown Organization",
          id: organization?._id || pendingUser.organizationId,
        },
        invitedBy: pendingUser.invitedBy,
      });
    } catch (error) {
      console.error("Validate invite token error:", error);
      res.status(500).json({ message: "Failed to validate invitation token" });
    }
  });

  // Alternative endpoint for complete-invitation (used by auth/AcceptInvitation.jsx)
  app.post("/api/auth/complete-invitation", async (req, res) => {
    try {
      const { token, firstName, lastName, password } = req.body;

      if (!token || !firstName || !lastName || !password) {
        return res.status(400).json({
          message: "Token, first name, last name, and password are required",
        });
      }

      const result = await storage.completeUserInvitation(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      const authToken = storage.generateToken(result.user);

      res.json({
        message: "Account created successfully",
        token: authToken,
        user: {
          id: result.user._id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          organizationId: result.user.organizationId,
        },
      });
    } catch (error) {
      console.error("Complete invitation error:", error);
      res.status(500).json({ message: "Failed to complete invitation" });
    }
  });

  // Enhanced User Management Routes for Company Admins

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
  app.delete(
    "/api/organization/users/:userId",
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

        // Cannot remove self
        if (targetUser._id.toString() === adminUser.id) {
          return res
            .status(400)
            .json({ message: "Cannot remove your own account" });
        }

        // Check for assigned tasks (implement task reassignment logic as needed)
        // For now, we'll allow removal but in production should require task reassignment

        // Remove user
        await storage.deleteUser(userId);

        res.json({
          message: "User removed successfully",
        });
      } catch (error) {
        console.error("Remove user error:", error);
        res.status(500).json({ message: "Failed to remove user" });
      }
    }
  );

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

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
