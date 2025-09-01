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
import { emailService } from "./services/emailService.js";
import { registerLoginCustomizationRoutes } from "./routes/loginCustomization.js";
import { taskRoutes } from "./routes/taskRoutes.js";

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
    }),
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Serve static files for uploaded images
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      const userAgent = req.get('User-Agent');
      const result = await authService.login(email, password, ipAddress, userAgent);
      res.json(result);
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle lockout errors specially
      if (error.isLockout) {
        return res.status(423).json({ 
          success: false, 
          message: error.message,
          isLockout: true,
          timeLeft: error.timeLeft,
          minutes: error.minutes
        });
      }
      
      // Handle remaining attempts warnings
      if (error.remainingAttempts !== undefined) {
        return res.status(401).json({ 
          success: false, 
          message: error.message,
          remainingAttempts: error.remainingAttempts
        });
      }
      
      res.status(401).json({ 
        success: false, 
        message: error.message || 'Authentication failed' 
      });
    }
  });

  // Registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { firstName, lastName, email, password, confirmPassword, userType } = req.body;
      
      // Basic validation
      if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "All fields are required"
        });
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match"
        });
      }
      
      // Handle individual registration
      if (userType === 'individual') {
        const result = await authService.registerIndividual({
          firstName,
          lastName,
          email,
          password
        });
        res.json({ success: true, ...result });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid user type"
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Registration failed"
      });
    }
  });

  // Check lockout status endpoint
  app.post("/api/auth/check-lockout", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is required' 
        });
      }
      
      const lockoutStatus = await authService.isUserLockedOut(email);
      res.json({
        success: true,
        locked: lockoutStatus.locked,
        timeLeft: lockoutStatus.timeLeft || 0,
        minutes: lockoutStatus.minutes || 0
      });
    } catch (error) {
      console.error("Check lockout error:", error);
      res.status(500).json({ 
        success: false, 
        message: 'Error checking lockout status' 
      });
    }
  });

  app.get("/api/auth/verify", authenticateToken, async (req, res) => {
    try {
      res.json(req.user);

      console.log("req user in backend : ", req.user);
    } catch (error) {
      console.error("Auth verify error:", error);
      res.status(401).json({ message: "Invalid token" });
    }
  });

  // Generate fresh token endpoint
  app.post("/api/auth/generate-token", async (req, res) => {
    try {
      const { id, email, role, organizationId } = req.body;
      const jwt = await import("jsonwebtoken");
      const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

      const token = jwt.default.sign(
        { id, email, role, organizationId },
        JWT_SECRET,
        { expiresIn: "7d" },
      );

      res.json({ token });
    } catch (error) {
      console.error("Token generation error:", error);
      res.status(500).json({ message: "Failed to generate token" });
    }
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      console.log("User found for forgot password:", user?.email, "firstName:", user?.firstName)
      if (!user) {
        // Return success even if user doesn't exist for security
        return res.json({
          message:
            "If an account with that email exists, a password reset link has been sent.",
        });
      }

      // Generate reset token
      const resetToken = storage.generatePasswordResetToken();
      const resetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save reset token to user
      await storage.updateUser(user._id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpiry,
      });

      // Send reset email
      await emailService.sendPasswordResetEmail(email, resetToken, user.firstName || user.lastName || 'User');

      res.json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res
        .status(500)
        .json({ message: "Failed to process password reset request" });
    }
  });

  // Validate reset token endpoint
  app.post("/api/auth/validate-reset-token", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Reset token is required" });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user || user.passwordResetExpires < new Date()) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      res.json({ message: "Token is valid", userId: user._id });
    } catch (error) {
      console.error("Validate reset token error:", error);
      res.status(500).json({ message: "Failed to validate reset token" });
    }
  });

  // Reset password endpoint
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res
          .status(400)
          .json({ message: "Token and password are required" });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user || user.passwordResetExpires < new Date()) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      // Hash new password
      const passwordHash = await storage.hashPassword(password);

      // Update user with new password and clear reset token
      await storage.updateUser(user._id, {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Email verification endpoint
  app.post("/api/auth/verify-token", async (req, res) => {
    try {
      const { token, password } = req.body;

      console.log("Email verification attempt with token:", token);

      if (!token || !password) {
        return res
          .status(400)
          .json({ message: "Token and password are required" });
      }

      // Debug: Check if any user has this token
      const { User } = await import("./models.js");
      const userWithToken = await User.findOne({
        emailVerificationToken: token,
      });
      console.log(
        "User with token found:",
        userWithToken
          ? {
              id: userWithToken._id,
              email: userWithToken.email,
              status: userWithToken.status,
              hasExpiration: !!userWithToken.emailVerificationExpires,
              expiration: userWithToken.emailVerificationExpires,
              isExpired: userWithToken.emailVerificationExpires
                ? new Date() > userWithToken.emailVerificationExpires
                : "No expiration set",
            }
          : "No user found with this token",
      );

      // Find user by verification token
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired verification token" });
      }

      // Check if token is expired
      if (
        user.emailVerificationExpires &&
        new Date() > user.emailVerificationExpires
      ) {
        return res
          .status(400)
          .json({ message: "Verification token has expired" });
      }

      // Hash the password and update user
      const hashedPassword = await storage.hashPassword(password);

      await storage.updateUser(user._id, {
        passwordHash: hashedPassword,
        status: "active",
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      });

      console.log("User verification successful:", user.email);

      // Get updated user object with new password
      const updatedUser = await storage.getUser(user._id);

      // Don't auto-login, just confirm success
      res.json({
        message: "Email verified and password set successfully",
        success: true,
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res
        .status(500)
        .json({ message: "Verification failed. Please try again." });
    }
  });

  // Individual registration
  app.post("/api/auth/register/individual", async (req, res) => {
    try {
      const { firstName, lastName, email } = req.body;

      console.log("Individual registration attempt:", {
        firstName,
        lastName,
        email,
      });

      // Validate required fields
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }

      // Create pending user
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        role: "member",
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

      // Send verification email
      const emailSent = await emailService.sendVerificationEmail(
        email,
        verificationToken,
        firstName,
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
      const { firstName, lastName, email, organizationName } = req.body;

      console.log("Organization registration attempt:", {
        firstName,
        lastName,
        email,
        organizationName,
      });

      // Validate required fields
      if (!firstName || !lastName || !email || !organizationName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }

      // Generate slug from organization name
      const organizationSlug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      // Check if organization slug is available
      const existingOrg = await storage.getOrganizationBySlug(organizationSlug);
      if (existingOrg) {
        return res
          .status(400)
          .json({ message: "Organization name is already taken" });
      }

      // Create organization first
      const orgData = {
        name: organizationName.trim(),
        slug: organizationSlug.toLowerCase().trim(),
        licenseCount: 10,
        isActive: true,
      };

      const organization = await storage.createOrganization(orgData);

      // Create admin user for the organization
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        role: "admin",
        status: "pending",
        organizationId: organization._id,
        accountType: "organization",
      };

      const user = await storage.createUser(userData);

      console.log("Organization and admin user created:", {
        orgId: organization._id,
        userId: user._id,
      });

      // Generate verification token and send email
      const verificationToken = storage.generateEmailVerificationToken();

      // Update user with verification token
      await storage.updateUser(user._id, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // Send verification email with organization name
      const emailSent = await emailService.sendVerificationEmail(
        email,
        verificationToken,
        firstName,
        organizationName,
      );

      if (emailSent) {
        console.log("Verification email sent successfully to:", email);
      } else {
        console.log("Failed to send verification email to:", email);
      }

      res.status(201).json({
        message:
          "Organization registration successful. Please check your email for verification.",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organizationId: organization._id,
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
        user.organizationId,
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
              name: `${member.invitedBy.firstName || ""} ${member.invitedBy.lastName || ""}`.trim(),
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
        id: user._id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profileImageUrl: user.profileImageUrl || null,
        role: user.role,
        organizationId: user.organizationId,
        status: user.status,
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
        if (!lastName || !lastName.trim()) {
          return res.status(400).json({ message: "Last name is required" });
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
    },
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
        if (!lastName || !lastName.trim()) {
          return res.status(400).json({ message: "Last name is required" });
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
    },
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
          req.user.organizationId,
        );
        res.json(users);
      } catch (error) {
        console.error("Get organization users detailed error:", error);
        res.status(500).json({ message: "Failed to fetch organization users" });
      }
    },
  );

  app.get("/api/organization/license", authenticateToken, async (req, res) => {
    try {
      const licenseInfo = await storage.getOrganizationLicenseInfo(
        req.user.organizationId,
      );
      res.json(licenseInfo);
    } catch (error) {
      console.error("Get organization license error:", error);
      res.status(500).json({ message: "Failed to fetch license information" });
    }
  });

  app.post("/api/organization/invite-users-test", async (req, res) => {
    try {
      const { invites } = req.body;

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
            roles: invite.roles,
            invitedBy: defaultOrgId, // Use org ID as placeholder
            invitedByName: "TaskSetu Admin",
            organizationName: "TaskSetu Organization",
          };

          await storage.inviteUserToOrganization(inviteData);
          results.successCount++;
          results.details.push({ email: invite.email, status: "success" });
        } catch (error) {
          console.error(
            "Invitation error for",
            invite.email,
            ":",
            error.message,
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

      console.log("Email is available for invitation");
      res.json({ exists: false });
    } catch (error) {
      console.error("Check invitation error:", error);
      res
        .status(500)
        .json({
          message: "Failed to check invitation status",
          error: error.message,
        });
    }
  });

  // Validate invitation token
  app.get("/api/auth/validate-invite", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token) {
        return res
          .status(400)
          .json({ message: "Invitation token is required" });
      }

      // Get invitation details by token
      const pendingUser = await storage.getUserByInviteToken(token);

      if (!pendingUser) {
        return res
          .status(404)
          .json({ message: "Invalid or expired invitation token" });
      }

      // Check if token is expired
      if (
        pendingUser.inviteExpires &&
        new Date() > new Date(pendingUser.inviteExpires)
      ) {
        return res
          .status(400)
          .json({ message: "Invitation token has expired" });
      }

      // Get organization details
      const organization = await storage.getOrganization(
        pendingUser.organizationId,
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
      console.error("Validate invite error:", error);
      res.status(500).json({ message: "Failed to validate invitation" });
    }
  });

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
          organizationId: result.user.organizationId,
        },
      });
    } catch (error) {
      console.error("Accept invite error:", error);
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  });

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
        pendingUser.organizationId,
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

  // Super Admin Routes - Add debug endpoint and sample data creation
  app.get("/api/super-admin/test", async (req, res) => {
    try {
      const { Organization, User } = await import('./models.js');
      const totalOrgs = await Organization.countDocuments() || 0;
      const totalUsers = await User.countDocuments() || 0;
      res.json({ 
        message: "Test endpoint working", 
        totalOrgs, 
        totalUsers,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.json({ error: error.message, timestamp: new Date().toISOString() });
    }
  });

  app.post("/api/super-admin/create-sample-data", async (req, res) => {
    try {
      const { Organization, User, Project, Task } = await import('./models.js');
      
      // Clear existing data if force flag is set
      if (req.body.force) {
        await Promise.all([
          Task.deleteMany({}),
          Project.deleteMany({}), 
          User.deleteMany({ role: { $ne: 'super_admin' } }),
          Organization.deleteMany({})
        ]);
        console.log("Cleared existing sample data");
      }
      
      // Create sample organizations
      const org1 = await Organization.create({
        name: "TechCorp Solutions",
        slug: "techcorp-solutions",
        description: "Leading technology solutions provider",
        industry: "Technology",
        size: "medium",
        website: "https://techcorp.example.com",
        status: "active"
      });

      const org2 = await Organization.create({
        name: "Design Studio Pro",
        slug: "design-studio-pro", 
        description: "Creative design and branding agency",
        industry: "Design",
        size: "small",
        website: "https://designstudio.example.com",
        status: "active"
      });

      const org3 = await Organization.create({
        name: "Global Marketing Inc",
        slug: "global-marketing-inc",
        description: "International marketing and advertising firm",
        industry: "Marketing",
        size: "large",
        status: "pending"
      });

      // Create sample users
      const users = await User.create([
        {
          firstName: "John",
          lastName: "Smith", 
          email: "john.smith@techcorp.example.com",
          role: "admin",
          organization: org1._id,
          status: "active",
          passwordHash: await storage.hashPassword("password123")
        },
        {
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.johnson@techcorp.example.com", 
          role: "member",
          organization: org1._id,
          status: "active",
          passwordHash: await storage.hashPassword("password123")
        },
        {
          firstName: "Mike",
          lastName: "Davis",
          email: "mike.davis@designstudio.example.com",
          role: "admin", 
          organization: org2._id,
          status: "active",
          passwordHash: await storage.hashPassword("password123")
        },
        {
          firstName: "Emily",
          lastName: "Wilson",
          email: "emily.wilson@designstudio.example.com",
          role: "member",
          organization: org2._id, 
          status: "active",
          passwordHash: await storage.hashPassword("password123")
        },
        {
          firstName: "David",
          lastName: "Brown",
          email: "david.brown@globalmarketing.example.com",
          role: "admin",
          organization: org3._id,
          status: "pending",
          passwordHash: await storage.hashPassword("password123")
        },
        {
          firstName: "Lisa",
          lastName: "Taylor",
          email: "lisa.taylor@individual.example.com",
          role: "member", 
          status: "active",
          passwordHash: await storage.hashPassword("password123")
        }
      ]);

      // Create sample projects
      const projects = await Project.create([
        {
          name: "Website Redesign",
          description: "Complete redesign of company website",
          organization: org1._id,
          status: "active"
        },
        {
          name: "Mobile App Development", 
          description: "iOS and Android mobile application",
          organization: org1._id,
          status: "active"
        },
        {
          name: "Brand Identity Project",
          description: "New brand identity and logo design",
          organization: org2._id,
          status: "completed"
        }
      ]);

      // Create sample tasks
      await Task.create([
        {
          title: "Design Homepage Mockup",
          description: "Create initial homepage design mockup",
          project: projects[0]._id,
          organization: org1._id,
          assignedTo: users[1]._id,
          status: "in-progress"
        },
        {
          title: "Develop User Authentication",
          description: "Implement user login and registration",
          project: projects[1]._id, 
          organization: org1._id,
          assignedTo: users[0]._id,
          status: "completed"
        },
        {
          title: "Create Logo Concepts",
          description: "Design multiple logo concept variations",
          project: projects[2]._id,
          organization: org2._id,
          assignedTo: users[2]._id,
          status: "completed"
        }
      ]);

      const finalCounts = {
        organizations: await Organization.countDocuments(),
        users: await User.countDocuments(), 
        projects: await Project.countDocuments(),
        tasks: await Task.countDocuments()
      };

      res.json({
        message: "Sample data created successfully",
        counts: finalCounts,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Sample data creation error:", error);
      res.status(500).json({ error: error.message, timestamp: new Date().toISOString() });
    }
  });

  app.get(
    "/api/super-admin/analytics",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {
      try {
        console.log("Fetching analytics for super admin...");
        const stats = await storage.getPlatformAnalytics();
        console.log("Analytics fetched successfully");
        res.json(stats);
      } catch (error) {
        console.error("Platform analytics error:", error);
        res
          .status(500)
          .json({ message: "Failed to fetch platform analytics" });
      }
    },
  );

  // Temporary bypass for debugging - remove auth temporarily
  app.get("/api/super-admin/companies", async (req, res) => {
    try {
      console.log("=== COMPANIES ENDPOINT DEBUG ===");
      const { Organization, User, Project, Task, Form } = await import('./models.js');
      
      const companies = await Organization.find({}).sort({ createdAt: -1 });
      console.log("Raw companies from DB:", companies.length);
      
      const companiesWithStats = await Promise.all(
        companies.map(async (company) => {
          const userCount = await User.countDocuments({ 
            $or: [
              { organizationId: company._id },
              { organization: company._id }
            ]
          });
          const projectCount = await Project.countDocuments({ 
            $or: [
              { organizationId: company._id },
              { organization: company._id }
            ]
          });
          const taskCount = await Task.countDocuments({ 
            $or: [
              { organizationId: company._id },
              { organization: company._id }
            ]
          });
          const formCount = await Form.countDocuments({ 
            $or: [
              { organizationId: company._id },
              { organization: company._id }
            ]
          });

          return {
            ...company.toObject(),
            userCount,
            projectCount,
            taskCount,
            formCount,
            stats: {
              users: userCount,
              projects: projectCount,
              tasks: taskCount,
              forms: formCount
            }
          };
        })
      );
      
      console.log("Companies with stats:", companiesWithStats.length);
      res.json(companiesWithStats);
    } catch (error) {
      console.error("Get companies error:", error);
      res.status(500).json({ message: "Failed to fetch companies", error: error.message });
    }
  });

  // Temporary bypass for debugging - remove auth temporarily  
  app.get("/api/super-admin/users", async (req, res) => {
    try {
      console.log("=== USERS ENDPOINT DEBUG ===");
      const { User, Organization } = await import('./models.js');
      
      const users = await User.find({})
        .populate('organization', 'name slug')
        .sort({ createdAt: -1 });
      
      console.log("Raw users from DB:", users.length);
      
      const transformedUsers = users.map(user => {
        const userObj = user.toObject();
        
        let organizationName = 'Individual User';
        if (userObj.organizationId?.name) {
          organizationName = userObj.organizationId.name;
        } else if (userObj.organization?.name) {
          organizationName = userObj.organization.name;
        }
        
        return {
          ...userObj,
          organizationName,
          status: userObj.status || (userObj.isActive ? 'active' : 'inactive')
        };
      });
      
      console.log("Transformed users:", transformedUsers.length);
      res.json(transformedUsers);
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
  });

  app.post(
    "/api/super-admin/create-super-admin",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {
      try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
          return res.status(400).json({ message: "All fields are required" });
        }

        const superAdmin = await storage.createSuperAdmin({
          firstName,
          lastName,
          email,
          password,
        });

        res.json({
          message: "Super admin created successfully",
          user: {
            id: superAdmin._id,
            email: superAdmin.email,
            firstName: superAdmin.firstName,
            lastName: superAdmin.lastName,
            role: superAdmin.role,
          },
        });
      } catch (error) {
        console.error("Create super admin error:", error);
        res
          .status(500)
          .json({ message: error.message || "Failed to create super admin" });
      }
    },
  );

  app.get(
    "/api/super-admin/logs",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {
      try {
        const { limit = 100 } = req.query;
        const logs = await storage.getSystemLogs(parseInt(limit));
        res.json(logs);
      } catch (error) {
        console.error("Get system logs error:", error);
        res.status(500).json({ message: "Failed to fetch system logs" });
      }
    },
  );

  app.post(
    "/api/super-admin/assign-admin",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {
      try {
        const { companyId, userId } = req.body;
        await storage.assignCompanyAdmin(companyId, userId);
        res.json({ message: "Company admin assigned successfully" });
      } catch (error) {
        console.error("Assign admin error:", error);
        res.status(500).json({ message: "Failed to assign company admin" });
      }
    },
  );

  app.patch(
    "/api/super-admin/companies/:id/status",
    authenticateToken,
    requireSuperAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        await storage.updateCompanyStatus(id, status);
        res.json({ message: "Company status updated successfully" });
      } catch (error) {
        console.error("Update company status error:", error);
        res.status(500).json({ message: "Failed to update company status" });
      }
    },
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
