import { storage } from "../mongodb-storage.js";
import { authService } from "../services/authService.js";
import { emailService } from "../services/emailService.js";

export const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const ipAddress =
        req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
      const userAgent = req.get("User-Agent");
      const result = await authService.login(
        email,
        password,
        ipAddress,
        userAgent
      );
      res.json(result);
    } catch (error) {
      if (error.isLockout) {
        return res.status(423).json({
          success: false,
          message: error.message,
          isLockout: true,
          timeLeft: error.timeLeft,
          minutes: error.minutes,
        });
      }
      if (error.remainingAttempts !== undefined) {
        return res.status(401).json({
          success: false,
          message: error.message,
          remainingAttempts: error.remainingAttempts,
        });
      }
      res.status(401).json({
        success: false,
        message: error.message || "Authentication failed",
      });
    }
  },

  async register(req, res) {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        userType,
      } = req.body;

      if (!firstName || !email || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Passwords do not match",
        });
      }
      if (userType === "individual") {
        const result = await authService.registerIndividual({
          firstName,
          lastName,
          email,
          password,
        });
        res.json({ success: true, ...result });
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid user type",
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || "Registration failed",
      });
    }
  },

  async checkLockout(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }
      const lockoutStatus = await authService.isUserLockedOut(email);
      res.json({
        success: true,
        locked: lockoutStatus.locked,
        timeLeft: lockoutStatus.timeLeft || 0,
        minutes: lockoutStatus.minutes || 0,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error checking lockout status",
      });
    }
  },

  async verify(req, res) {
    try {
      res.json(req.user);
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  },

  async generateToken(req, res) {
    try {
      const { id, email, role, organizationId } = req.body;
      const jwt = await import("jsonwebtoken");
      const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
      const token = jwt.default.sign(
        { id, email, role, organizationId },
        JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate token" });
    }
  },

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({
          message: "No account found with this email.",
        });
      }
      const resetToken = storage.generatePasswordResetToken();
      const resetExpiry = new Date(Date.now() + 3600000);
      await storage.updateUser(user._id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpiry,
      });
      await emailService.sendPasswordResetEmail(
        email,
        resetToken,
        user.firstName || user.lastName || "User"
      );
      res.json({
        message: "Password reset link has been sent to your email.",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  },

  async validateResetToken(req, res) {
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
      res.status(500).json({ message: "Failed to validate reset token" });
    }
  },

  async resetPassword(req, res) {
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
      const passwordHash = await storage.hashPassword(password);
      await storage.updateUser(user._id, {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      });
      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset password" });
    }
  },

  async verifyToken(req, res) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res
          .status(400)
          .json({ message: "Token and password are required" });
      }
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired verification token" });
      }
      if (
        user.emailVerificationExpires &&
        new Date() > user.emailVerificationExpires
      ) {
        return res
          .status(400)
          .json({ message: "Verification token has expired" });
      }
      const hashedPassword = await storage.hashPassword(password);
      await storage.updateUser(user._id, {
        passwordHash: hashedPassword,
        status: "active",
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      });
      res.json({
        message: "Email verified and password set successfully",
        success: true,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Verification failed. Please try again." });
    }
  },


  // ...existing code...

  async acceptInvite(req, res) {
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
        },
      });
    } catch (error) {
      console.error("Accept invite error:", error);
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  },

  async validateInvite(req, res) {
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ message: "Invitation token is required" });
      }
      const pendingUser = await storage.getUserByInviteToken(token);
      if (!pendingUser) {
        return res.status(404).json({ message: "Invalid or expired invitation token" });
      }
      if (
        pendingUser.inviteExpires &&
        new Date() > new Date(pendingUser.inviteExpires)
      ) {
        return res.status(400).json({ message: "Invitation token has expired" });
      }
      const orgId = pendingUser.organization_id || null;
      let organization = null;
      if (orgId) {
        try {
          organization = await storage.getOrganization(orgId);
        } catch (_) {}
        if (!organization) {
          try {
            const { Organization } = await import("../modals/organizationModal.js");
            organization = await Organization.findById(orgId).lean();
          } catch (_) {}
        }
      }
      res.json({
        email: pendingUser.email,
        role: pendingUser.role,
        organization: {
          id: orgId || null,
          name: organization?.name || "Unknown Organization",
          slug: organization?.slug || null,
        },
        organizationName: organization?.name || "Unknown Organization",
        invitedBy: pendingUser.invitedBy || null,
      });
    } catch (error) {
      console.error("Validate invite error:", error);
      res.status(500).json({ message: "Failed to validate invitation" });
    }
  },

  async validateInviteToken(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Invitation token is required" });
      }
      const pendingUser = await storage.getUserByInviteToken(token);
      if (!pendingUser) {
        return res.status(404).json({ message: "Invalid or expired invitation token" });
      }
      if (
        pendingUser.inviteExpires &&
        new Date() > new Date(pendingUser.inviteExpires)
      ) {
        return res.status(400).json({ message: "Invitation token has expired" });
      }
      const orgId = pendingUser.organization_id || null;
      let organization = null;
      if (orgId) {
        try {
          organization = await storage.getOrganization(orgId);
        } catch (_) {}
        if (!organization) {
          try {
            const { Organization } = await import("../modals/organizationModal.js");
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
  },

  async completeInvitation(req, res) {
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
  },

// ...existing code...

  async registerIndividual(req, res) {
    try {
      const { firstName, lastName, email } = req.body;

      if (!firstName || !email) {
        return res.status(400).json({ message: "All fields are required" });
      }

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
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });
          await emailService.sendVerificationEmail(
            email,
            verificationToken,
            existingUser.firstName || firstName,
            null
          );
          return res.status(200).json({
            message: "We've re-sent your verification link.",
            resent: true,
          });
        }
        return res.status(400).json({
          message: "This email is already registered. Please Login or Reset Password.",
        });
      }

      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        role: "individual",
        status: "pending",
        accountType: "individual",
      };

      const user = await storage.createUser(userData);

      const verificationToken = storage.generateEmailVerificationToken();
      await storage.updateUser(user._id, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await emailService.sendVerificationEmail(
        email,
        verificationToken,
        firstName,
        null
      );

      res.status(201).json({
        message: "Registration successful. Please check your email for verification.",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Individual registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  },

  async registerOrganization(req, res) {
    try {
      const { firstName, lastName, email, organizationName, isPrimaryAdmin } = req.body;

      if (!firstName || !email || !organizationName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (
        organizationName.trim().length < 2 ||
        organizationName.trim().length > 100
      ) {
        return res
          .status(400)
          .json({ message: "Organization name must be 2-100 characters" });
      }

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
            emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });
          await emailService.sendVerificationEmail(
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
          message: "This email is already registered. Please Login or Reset Password.",
        });
      }

      const organizationSlug = organizationName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

      const existingOrg = await storage.getOrganizationBySlug(organizationSlug);
      if (existingOrg) {
        return res
          .status(400)
          .json({ message: "Organization name is already taken" });
      }

      const orgData = {
        name: organizationName.trim(),
        slug: organizationSlug.toLowerCase().trim(),
        licenseCount: 10,
        isActive: true,
      };

      const organization = await storage.createOrganization(orgData);

      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        role: ["org_admin"],
        status: "pending",
        organization_id: organization._id,
        accountType: "organization",
        isPrimaryAdmin: isPrimaryAdmin === true,
      };

      const user = await storage.createUser(userData);

      const verificationToken = storage.generateEmailVerificationToken();
      await storage.updateUser(user._id, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await emailService.sendVerificationEmail(
        email,
        verificationToken,
        firstName,
        organizationName
      );

      res.status(201).json({
        message: "Organization registration successful. Please check your email for verification.",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          organization: organization._id,
          organizationName: organization.name,
        },
      });
    } catch (error) {
      console.error("Organization registration error:", error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  },

// ...existing code...
};