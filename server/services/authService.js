import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { MongoStorage } from '../mongodb-storage.js';
import { emailService } from './emailService.js';
import { LoginAttempt } from '../models.js';

const storage = new MongoStorage();

export class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_EXPIRES_IN = '7d';
    this.VERIFICATION_TOKEN_EXPIRES = 24 * 60 * 60 * 1000; // 24 hours
    this.RESET_TOKEN_EXPIRES = 30 * 60 * 1000; // 30 minutes
    
    // Testing configuration - disable email verification bypass for production email flow
    this.BYPASS_EMAIL_VERIFICATION = false; // Always require email verification
    this.AUTO_AUTHENTICATE_ON_REGISTER = false; // Always require verification
    
    // Login attempt tracking
    this.MAX_LOGIN_ATTEMPTS = 3;
    this.LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
  }

  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        organizationId: user.organization || user.organizationId || null
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Hash password
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate verification code
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Generate reset token
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Individual user registration
  async registerIndividual(userData) {
    const { email, firstName, lastName } = userData;

    // Check if user already exists (registered and verified)
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error('This email is already registered. Please Login or Reset Password.');
    }

    // Check if there's already a pending registration
    const existingPendingUser = await storage.getPendingUserByEmail(email);
    if (existingPendingUser) {
      throw new Error('This email is already registered. Please Login or Reset Password.');
    }

    // Auto-authenticate in development mode
    if (this.AUTO_AUTHENTICATE_ON_REGISTER) {
      // Create user directly without verification
      const hashedPassword = await this.hashPassword('temp123'); // Temporary password
      
      const userData = {
        firstName,
        lastName,
        email,
        username: email.split('@')[0],
        passwordHash: hashedPassword,
        role: 'member',
        isActive: true,
        emailVerified: true
      };

      const user = await storage.createUser(userData);
      const token = this.generateToken(user);
      
      return {
        success: true,
        user,
        token,
        autoAuthenticated: true,
        message: 'Auto-authenticated for testing. Please set a password.'
      };
    }

    // Normal flow with email verification - use secure token instead of OTP
    const verificationToken = this.generateResetToken(); // Uses crypto.randomBytes for security
    const verificationExpires = new Date(Date.now() + this.VERIFICATION_TOKEN_EXPIRES);

    // Create pending user
    const pendingUser = await storage.createPendingUser({
      email,
      firstName,
      lastName,
      type: 'individual',
      verificationCode: verificationToken, // Using secure token instead of 6-digit code
      verificationExpires,
      isVerified: false
    });

    // Send verification email
    await this.sendVerificationEmail(email, verificationToken, firstName);

    return { message: 'A verification link has been sent to your email. Please complete your registration.' };
  }

  // Organization registration
  async registerOrganization(userData) {
    const { organizationName, organizationSlug, email, firstName, lastName } = userData;

    // Check if user already exists (registered and verified)
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error('This email is already registered. Please Login or Reset Password.');
    }

    // Check if there's already a pending registration
    const existingPendingUser = await storage.getPendingUserByEmail(email);
    if (existingPendingUser) {
      throw new Error('This email is already registered. Please Login or Reset Password.');
    }

    // Use provided slug or generate from name
    const orgSlug = organizationSlug || organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(orgSlug) || orgSlug.length < 3) {
      throw new Error('Organization URL must be at least 3 characters and contain only lowercase letters, numbers, and hyphens');
    }

    // Check if organization slug already exists
    const existingOrg = await storage.getOrganizationBySlug(orgSlug);
    if (existingOrg) {
      throw new Error('Organization URL already exists');
    }

    // Auto-authenticate in development mode
    if (this.AUTO_AUTHENTICATE_ON_REGISTER) {
      // Create organization first
      const organization = await storage.createOrganization({
        name: organizationName,
        slug: orgSlug,
        settings: {
          maxUsers: 10,
          features: ['tasks', 'projects', 'collaboration']
        },
        subscriptionPlan: 'basic',
        isActive: true
      });

      // Create admin user directly
      const hashedPassword = await this.hashPassword('temp123'); // Temporary password
      
      const adminUserData = {
        firstName,
        lastName,
        email,
        username: email.split('@')[0],
        passwordHash: hashedPassword,
        organization: organization._id,
        organizationId: organization._id,
        role: 'admin',
        isActive: true,
        emailVerified: true
      };

      const user = await storage.createUser(adminUserData);
      const token = this.generateToken(user);
      
      return {
        success: true,
        user,
        token,
        organization,
        autoAuthenticated: true,
        message: 'Auto-authenticated for testing. Please set a password.'
      };
    }

    // Normal flow with email verification - use secure token instead of OTP
    const verificationToken = this.generateResetToken(); // Uses crypto.randomBytes for security
    const verificationExpires = new Date(Date.now() + this.VERIFICATION_TOKEN_EXPIRES);

    // Create pending user with organization data
    const pendingUser = await storage.createPendingUser({
      email,
      firstName,
      lastName,
      type: 'organization',
      organizationName,
      organizationSlug: orgSlug,
      verificationCode: verificationToken, // Using secure token instead of 6-digit code
      verificationExpires,
      isVerified: false
    });

    // Send verification email
    await this.sendVerificationEmail(email, verificationToken, firstName, organizationName);

    return { message: 'A verification link has been sent to your email. Please complete your registration.' };
  }

  // Verify email
  async verifyEmail(email, verificationCode) {
    const pendingUser = await storage.getPendingUserByEmail(email);
    
    if (!pendingUser) {
      throw new Error('Verification request not found');
    }

    if (pendingUser.verificationExpires < new Date()) {
      throw new Error('Verification code has expired');
    }

    if (pendingUser.verificationCode !== verificationCode) {
      throw new Error('Invalid verification code');
    }

    // Mark as verified
    await storage.updatePendingUser(pendingUser._id, { 
      isVerified: true,
      verificationCode: null,
      verificationExpires: null 
    });

    return { message: 'Email verified successfully' };
  }

  // Complete individual registration
  async completeIndividualRegistration(email, password) {
    const pendingUser = await storage.getPendingUserByEmail(email);
    
    if (!pendingUser || !pendingUser.isVerified) {
      throw new Error('Email not verified');
    }

    if (pendingUser.type !== 'individual') {
      throw new Error('Invalid registration type');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create actual user as individual (individual registration)
    const user = await storage.createUser({
      email: pendingUser.email,
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      passwordHash,
      role: 'individual',
      isActive: true,
      emailVerified: true,
      status: 'active'
    });

    // Remove pending user
    await storage.deletePendingUser(pendingUser._id);

    // Generate token
    const token = this.generateToken(user);

    return {
      message: 'Registration completed successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  }

  // Complete organization registration
  async completeOrganizationRegistration(email, password) {
    const pendingUser = await storage.getPendingUserByEmail(email);
    
    if (!pendingUser || !pendingUser.isVerified) {
      throw new Error('Email not verified');
    }

    if (pendingUser.type !== 'organization') {
      throw new Error('Invalid registration type');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create organization first
    const organization = await storage.createOrganization({
      name: pendingUser.organizationName,
      slug: pendingUser.organizationSlug,
      description: `${pendingUser.organizationName} workspace`,
      isActive: true
    });

    // Create organization admin user
    const user = await storage.createUser({
      email: pendingUser.email,
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      passwordHash,
      role: 'org_admin',
      organization: organization._id,
      organizationId: organization._id,
      isActive: true,
      emailVerified: true
    });

    // Update organization with creator
    await storage.updateOrganization(organization._id, { createdBy: user._id });

    // Create default task statuses for the organization
    const defaultStatuses = [
      { name: "To Do", color: "#6B7280", order: 0, isDefault: true, organization: organization._id },
      { name: "In Progress", color: "#3B82F6", order: 1, organization: organization._id },
      { name: "Review", color: "#F59E0B", order: 2, organization: organization._id },
      { name: "Done", color: "#10B981", order: 3, isCompleted: true, organization: organization._id },
    ];

    for (const status of defaultStatuses) {
      await storage.createTaskStatus(status);
    }

    // Remove pending user
    await storage.deletePendingUser(pendingUser._id);

    // Generate token
    const token = this.generateToken(user);

    return {
      message: 'Organization created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId
      }
    };
  }

  // Check if user is locked out (Database version)
  async isUserLockedOut(email) {
    try {
      const loginAttempt = await LoginAttempt.findOne({ email });
      if (!loginAttempt) return { locked: false };
      
      // Check if lockout has expired
      if (loginAttempt.isLocked && loginAttempt.lockoutExpiresAt) {
        if (new Date() > loginAttempt.lockoutExpiresAt) {
          // Lockout has expired, remove the record
          await LoginAttempt.deleteOne({ email });
          return { locked: false };
        } else {
          // Still locked
          const timeLeft = Math.ceil((loginAttempt.lockoutExpiresAt - Date.now()) / 1000);
          return { 
            locked: true, 
            timeLeft: timeLeft,
            minutes: Math.ceil(timeLeft / 60)
          };
        }
      }
      
      return { locked: false };
    } catch (error) {
      console.error('Error checking lockout status:', error);
      return { locked: false }; // Fail open for security
    }
  }

  // Record failed login attempt (Database version)
  async recordFailedAttempt(email, ipAddress = null, userAgent = null) {
    try {
      const now = new Date();
      const existingAttempt = await LoginAttempt.findOne({ email });
      
      if (!existingAttempt) {
        // First failed attempt
        await LoginAttempt.create({
          email,
          attemptCount: 1,
          firstAttemptAt: now,
          lastAttemptAt: now,
          ipAddress,
          userAgent
        });
      } else {
        // Check if 15 minutes have passed since first attempt
        const timeSinceFirst = now - existingAttempt.firstAttemptAt;
        
        if (timeSinceFirst > this.LOCKOUT_TIME) {
          // Reset the counter if more than 15 minutes have passed
          existingAttempt.attemptCount = 1;
          existingAttempt.firstAttemptAt = now;
          existingAttempt.lastAttemptAt = now;
          existingAttempt.isLocked = false;
          existingAttempt.lockoutExpiresAt = null;
        } else {
          // Increment attempt count
          existingAttempt.attemptCount += 1;
          existingAttempt.lastAttemptAt = now;
          
          // Lock account if max attempts reached
          if (existingAttempt.attemptCount >= this.MAX_LOGIN_ATTEMPTS) {
            existingAttempt.isLocked = true;
            existingAttempt.lockoutExpiresAt = new Date(now.getTime() + this.LOCKOUT_TIME);
          }
        }
        
        await existingAttempt.save();
      }
    } catch (error) {
      console.error('Error recording failed attempt:', error);
    }
  }

  // Clear login attempts (on successful login) (Database version)
  async clearLoginAttempts(email) {
    try {
      await LoginAttempt.deleteOne({ email });
    } catch (error) {
      console.error('Error clearing login attempts:', error);
    }
  }

  // Login
  async login(email, password, ipAddress = null, userAgent = null) {
    // Check if user is locked out
    const lockoutStatus = await this.isUserLockedOut(email);
    if (lockoutStatus.locked) {
      const error = new Error('Account temporarily locked due to too many failed login attempts. Please try again later.');
      error.isLockout = true;
      error.timeLeft = lockoutStatus.timeLeft;
      error.minutes = lockoutStatus.minutes;
      throw error;
    }

    const user = await storage.getUserByEmail(email);
    
    console.log("Login debug - User object:", {
      id: user?._id,
      email: user?.email,
      hasPasswordHash: !!user?.passwordHash,
      passwordHashValue: user?.passwordHash ? 'Present' : 'Missing',
      status: user?.status,
      emailVerified: user?.emailVerified,
      isActive: user?.isActive
    });
    
    if (!user) {
      await this.recordFailedAttempt(email, ipAddress, userAgent);
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    if (!user.emailVerified) {
      throw new Error('Email not verified');
    }

    if (!user.passwordHash) {
      throw new Error('Password not set. Please complete email verification first.');
    }

    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      await this.recordFailedAttempt(email, ipAddress, userAgent);
      
      // Check current attempt count to determine remaining attempts
      const loginAttempt = await LoginAttempt.findOne({ email });
      const currentCount = loginAttempt?.attemptCount || 0;
      const remainingAttempts = this.MAX_LOGIN_ATTEMPTS - currentCount;
      
      if (remainingAttempts <= 0) {
        const error = new Error('Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes.');
        error.isLockout = true;
        error.timeLeft = 15 * 60; // 15 minutes in seconds
        error.minutes = 15;
        throw error;
      }
      
      const error = new Error(`Invalid email or password. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`);
      error.remainingAttempts = remainingAttempts;
      throw error;
    }

    // Clear login attempts on successful login
    await this.clearLoginAttempts(email);

    // Update last login
    await storage.updateUser(user._id, { lastLoginAt: new Date() });

    // Generate token
    const token = this.generateToken(user);

    // Get organization info if user belongs to one
    let organizationInfo = null;
    if (user.organization) {
      organizationInfo = await storage.getOrganization(user.organization);
    }

    // Determine redirect route based on role
    const getRedirectRoute = (role) => {
      switch (role) {
        case 'superadmin':
          return '/super-admin';
        case 'super_admin':
          return '/super-admin';
        case 'org_admin':
          return '/dashboard';
        case 'individual':
          return '/dashboard';
        case 'employee':
          return '/dashboard';
        default:
          return '/dashboard';
      }
    };

    return {
      message: 'Login successful',
      token,
      redirectTo: getRedirectRoute(user.role),
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organization,
        permissions: user.permissions || [],
        organization: organizationInfo ? {
          id: organizationInfo._id,
          name: organizationInfo.name,
          slug: organizationInfo.slug
        } : null
      }
    };
  }

  // Forgot password
  async forgotPassword(email) {
    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    console.log('User found for password reset:', {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      hasFirstName: !!user.firstName
    });

    // Generate reset token
    const resetToken = this.generateResetToken();
    const resetExpires = new Date(Date.now() + this.RESET_TOKEN_EXPIRES);

    // Store reset token with explicit field updates
    const updateResult = await storage.updateUser(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires
    });

    // Verify token was stored
    const updatedUser = await storage.getUserByEmail(email);
    if (!updatedUser.passwordResetToken) {
      console.error('Failed to store reset token for user:', email);
      throw new Error('Failed to generate reset token');
    }

    // Use firstName or fallback to a default greeting
    const userName = user.firstName || user.lastName || 'User';
    console.log('Using name for email:', userName);

    // Send reset email
    try {
      const emailSent = await this.sendPasswordResetEmail(email, resetToken, userName);
      if (!emailSent) {
        console.error('Failed to send password reset email to:', email);
      } else {
        console.log('Password reset email sent successfully to:', email, 'with name:', userName);
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
    }

    return { message: 'If the email exists, a reset link has been sent' };
  }

  // Validate reset token
  async validateResetToken(token) {
    const user = await storage.getUserByResetToken(token);
    
    if (!user) {
      // Fallback: search all users for the token
      const allUsers = await storage.getUsers();
      const userWithToken = allUsers.find(u => 
        u.passwordResetToken === token && 
        u.passwordResetExpires && 
        u.passwordResetExpires > new Date()
      );
      
      if (!userWithToken) {
        throw new Error('Invalid or expired reset token');
      }
      
      return { message: 'Reset token is valid' };
    }
    
    if (user.passwordResetExpires < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    return { message: 'Reset token is valid' };
  }

  // Reset password
  async resetPassword(token, newPassword) {
    const user = await storage.getUserByResetToken(token);
    
    if (!user) {
      // Fallback: search all users for the token
      const allUsers = await storage.getUsers();
      const userWithToken = allUsers.find(u => 
        u.passwordResetToken === token && 
        u.passwordResetExpires && 
        u.passwordResetExpires > new Date()
      );
      
      if (!userWithToken) {
        throw new Error('Invalid or expired reset token');
      }
      
      const passwordHash = await this.hashPassword(newPassword);
      
      // Update password and clear reset token
      await storage.updateUser(userWithToken._id, {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null
      });
      
      return { message: 'Password reset successfully' };
    }
    
    if (user.passwordResetExpires < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update user password and clear reset token
    await storage.updateUser(user._id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null
    });

    return { message: 'Password reset successfully' };
  }

  // Resend verification code
  async resendVerificationCode(email) {
    const pendingUser = await storage.getPendingUserByEmail(email);
    
    if (!pendingUser) {
      throw new Error('Verification request not found');
    }

    if (pendingUser.isVerified) {
      throw new Error('Email already verified');
    }

    // Generate new verification code
    const verificationCode = this.generateVerificationCode();
    const verificationExpires = new Date(Date.now() + this.VERIFICATION_TOKEN_EXPIRES);

    // Update pending user
    await storage.updatePendingUser(pendingUser._id, {
      verificationCode,
      verificationExpires
    });

    // Send new verification email
    await this.sendVerificationEmail(
      email, 
      verificationCode, 
      pendingUser.firstName, 
      pendingUser.organizationName
    );

    return { message: 'Verification code resent successfully' };
  }

  // Send verification email
  async sendVerificationEmail(email, code, firstName, organizationName = null) {
    return await emailService.sendVerificationEmail(email, code, firstName, organizationName);
  }

  // Send password reset email
  async sendPasswordResetEmail(email, token, firstName) {
    console.log('AuthService sending email with firstName:', firstName);
    return await emailService.sendPasswordResetEmail(email, token, firstName);
  }

  // Validate verification token and return user info
  async validateVerificationToken(token) {
    // First try to find pending user by verification code (new registrations)
    const allPendingUsers = await storage.getAllPendingUsers();
    const pendingUser = allPendingUsers.find(user => user.verificationCode === token);
    
    if (pendingUser) {
      if (pendingUser.verificationExpires < new Date()) {
        throw new Error('Verification token has expired');
      }

      return {
        user: {
          email: pendingUser.email,
          firstName: pendingUser.firstName,
          lastName: pendingUser.lastName,
          organizationName: pendingUser.organizationName,
          type: pendingUser.type
        },
        tokenType: 'registration'
      };
    }

    // Try to find invited user by invite token (user invitations)
    try {
      const invitedUser = await storage.getUserByInviteToken(token);
      if (invitedUser) {
        if (invitedUser.inviteTokenExpiry < new Date()) {
          throw new Error('Invitation token has expired');
        }

        const organization = await storage.getOrganization(invitedUser.organization);
        
        return {
          user: {
            email: invitedUser.email,
            firstName: invitedUser.firstName || '',
            lastName: invitedUser.lastName || '',
            organizationName: organization?.name || 'Unknown Organization',
            type: 'invitation'
          },
          tokenType: 'invitation'
        };
      }
    } catch (error) {
      // Continue to check other token types
    }
    
    throw new Error('Invalid or expired verification token');
  }

  // Set password with verification token
  async setPasswordWithToken(token, password) {
    // First validate the token to determine its type
    const validationResult = await this.validateVerificationToken(token);
    const { user: userInfo, tokenType } = validationResult;

    // Hash password
    const passwordHash = await this.hashPassword(password);

    if (tokenType === 'registration') {
      // Handle pending user registration
      const allPendingUsers = await storage.getAllPendingUsers();
      const pendingUser = allPendingUsers.find(user => user.verificationCode === token);

      if (userInfo.type === 'individual') {
        // Complete individual registration
        const user = await storage.createUser({
          email: pendingUser.email,
          firstName: pendingUser.firstName,
          lastName: pendingUser.lastName,
          passwordHash,
          role: 'member',
          isActive: true,
          emailVerified: true
        });

        // Remove pending user
        await storage.deletePendingUser(pendingUser._id);

        return { 
          message: 'Account activated successfully',
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        };
      } else if (userInfo.type === 'organization') {
        // Create organization first
        const organization = await storage.createOrganization({
          name: pendingUser.organizationName,
          slug: pendingUser.organizationSlug,
          description: `Organization for ${pendingUser.organizationName}`,
          settings: { timezone: 'UTC', language: 'en' }
        });

        // Create admin user
        const user = await storage.createUser({
          email: pendingUser.email,
          firstName: pendingUser.firstName,
          lastName: pendingUser.lastName,
          passwordHash,
          organization: organization._id,
          role: 'admin',
          isActive: true,
          emailVerified: true
        });

        // Remove pending user
        await storage.deletePendingUser(pendingUser._id);

        return { 
          message: 'Organization and account activated successfully',
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            organizationId: organization._id
          }
        };
      }
    } else if (tokenType === 'invitation') {
      // Handle invited user completing setup
      const invitedUser = await storage.getUserByInviteToken(token);
      
      // Update the invited user with password and activate account
      const updatedUser = await storage.updateUser(invitedUser._id, {
        firstName: userInfo.firstName || 'User',
        lastName: userInfo.lastName || 'User',
        passwordHash,
        isActive: true,
        emailVerified: true,
        inviteToken: null,
        inviteTokenExpiry: null,
        status: 'active'
      });

      return {
        message: 'Account setup completed successfully',
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          organizationId: updatedUser.organization
        }
      };
    }

    throw new Error('Invalid verification token type');
  }
}

export const authService = new AuthService();