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
};