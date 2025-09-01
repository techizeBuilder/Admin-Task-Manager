import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    if (
      process.env.MAILTRAP_HOST &&
      process.env.MAILTRAP_PORT &&
      process.env.MAILTRAP_USER &&
      process.env.MAILTRAP_PASS
    ) {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: parseInt(process.env.MAILTRAP_PORT),
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS,
        },
      });
      this.isConfigured = true;
      console.log("Mailtrap email service configured successfully");
    } else {
      console.warn("Mailtrap credentials not found - email service disabled");
      this.isConfigured = false;
    }

    // Base URL - configurable via environment variable
    this.baseUrl =
      process.env.BASE_URL ||
      "https://25b3cec7-b6b2-48b7-a8f4-7ee8a9c12574-00-36vzyej2u9kbm.kirk.replit.dev";
  }

  async sendVerificationEmail(
    email,
    verificationCode,
    firstName,
    organizationName = null,
  ) {
    if (!this.isConfigured) {
      console.error(
        "Email service not configured - Mailtrap credentials missing",
      );
      return false;
    }

    try {
      const mailOptions = {
        to: email,
        from: "noreply@tasksetu.com",
        subject: "✅ Complete Your Tasksetu Registration",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .code { font-size: 24px; font-weight: bold; color: #3B82F6; text-align: center; background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to TaskSetu!</h1>
              </div>
              <div class="content">
                <h2>Hi ${firstName},</h2>
                <p>Thanks for signing up with Tasksetu!</p>
                <p>To activate your account and set your password, please click the link below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${this.baseUrl}/verify?token=${verificationCode}" 
                     style="background: #3B82F6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                    👉 Verify Email & Set My Password
                  </a>
                </div>
                
                <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
                  <p style="margin: 0; color: #4a5568; font-size: 14px;"><strong>Can't click the button?</strong> Copy and paste this URL into your browser:</p>
                  <p style="margin: 5px 0 0 0; color: #4a5568; font-size: 14px; word-break: break-all;">${this.baseUrl}/verify?token=${verificationCode}</p>
                </div>
                
                <p>This link is <strong style="color: #e53e3e;">valid for 24 hours</strong>.</p>
                <p>Once verified, you'll be able to start managing your tasks and deadlines with ease.</p>
                <p>See you enrolled in!</p>
                
                <p><strong>— The Tasksetu Team</strong><br>
                <a href="https://www.tasksetu.com" style="color: #3B82F6;">www.Tasksetu.com</a></p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Hi ${firstName},

Thanks for signing up with Tasksetu!

To activate your account and set your password, please click the link below:
👉 Verify Email & Set My Password: ${this.baseUrl}/verify?token=${verificationCode}

(or copy and paste this URL into your browser: ${this.baseUrl}/verify?token=${verificationCode})

This link is valid for 24 hours.

Once verified, you'll be able to start managing your tasks and deadlines with ease.

See you enrolled in!

— The Tasksetu Team
www.Tasksetu.com`,
      };

      await this.transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully to:", email);
      return true;
    } catch (error) {
      console.error("Email sending error:", error);
      return false;
    }
  }

  async sendPasswordResetEmail(email, resetToken, firstName) {
    console.log("Email template using firstName:", firstName);
    if (!this.isConfigured) {
      console.error(
        "Email service not configured - Mailtrap credentials missing",
      );
      return false;
    }

    try {
      const resetUrl = `${this.baseUrl}/reset-password?token=${resetToken}`;

      const mailOptions = {
        to: email,
        from: "noreply@tasksetu.com",
        subject: "Reset Your Password - TaskSetu",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <h2>Hi ${firstName}!</h2>
                <p>We received a request to reset your password for your TaskSetu account.</p>
                
                <p>Click the button below to reset your password:</p>
                <a href="${resetUrl}" class="button">Reset Password</a>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                
                <p>This link will expire in 1 hour for security reasons.</p>
                
                <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                
                <p>Best regards,<br>The TaskSetu Team</p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `Hi ${firstName}!\n\nWe received a request to reset your password for your TaskSetu account.\n\nClick this link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour for security reasons.\n\nIf you didn't request a password reset, please ignore this email.\n\nBest regards,\nThe TaskSetu Team`,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Password reset email sent successfully to:", email);
      console.log("Email result:", result);
      return true;
    } catch (error) {
      console.error("Email sending error:", error.message);
      if (error.response) {
        console.error("Email service response:", error.response);
      }
      if (error.code) {
        console.error("Error code:", error.code);
      }
      return false;
    }
  }

  async sendInvitationEmail(
    email,
    inviteToken,
    organizationName,
    roles,
    invitedByName,
  ) {
    if (!this.isConfigured) {
      console.error(
        "Email service not configured - Mailtrap credentials missing",
      );
      return false;
    }

    try {
      const inviteUrl = `${this.baseUrl}/accept-invite?token=${inviteToken}`;

      const mailOptions = {
        to: email,
        from: "noreply@tasksetu.com",
        subject: `You're invited to join ${organizationName} - TaskSetu`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Team Invitation</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #10B981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Team Invitation</h1>
              </div>
              <div class="content">
                <h2>You're invited to join ${organizationName}!</h2>
                <p><strong>${invitedByName}</strong> has invited you to join their team on TaskSetu.</p>
                
                <p>You'll be joining as: <strong>${Array.isArray(roles) ? roles.join(", ") : roles}</strong></p>
                
                <p>Click the button below to accept the invitation and create your account:</p>
                <a href="${inviteUrl}" class="button">Accept Invitation</a>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${inviteUrl}</p>
                
                <p>This invitation will expire in 7 days.</p>
                
                <p>If you don't want to join this team, you can safely ignore this email.</p>
                
                <p>Welcome to TaskSetu!<br>The TaskSetu Team</p>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `You're invited to join ${organizationName}!\n\n${invitedByName} has invited you to join their team on TaskSetu.\n\nYou'll be joining as: ${Array.isArray(roles) ? roles.join(", ") : roles}\n\nClick this link to accept the invitation: ${inviteUrl}\n\nThis invitation will expire in 7 days.\n\nWelcome to TaskSetu!\nThe TaskSetu Team`,
      };

      await this.transporter.sendMail(mailOptions);
      console.log("Invitation email sent successfully to:", email);
      return true;
    } catch (error) {
      console.error("Email sending error:", error);
      return false;
    }
  }

  isEmailServiceAvailable() {
    return this.isConfigured;
  }
}

export const emailService = new EmailService();
