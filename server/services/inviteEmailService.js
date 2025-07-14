import nodemailer from 'nodemailer';

class InviteEmailService {
  constructor() {
    if (process.env.MAILTRAP_HOST && process.env.MAILTRAP_USERNAME && process.env.MAILTRAP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT || 587,
        auth: {
          user: process.env.MAILTRAP_USERNAME,
          pass: process.env.MAILTRAP_PASSWORD
        }
      });
      this.isConfigured = true;
      console.log('Mailtrap email service configured for invitations');
    } else {
      this.isConfigured = false;
      console.warn('Mailtrap credentials not found. Email invitations will not be sent.');
    }
  }

  async sendInvitationEmail(email, inviteToken, organizationName, roles, invitedByName) {
    if (!this.isConfigured) {
      throw new Error('Email service is not configured. Please check Mailtrap credentials.');
    }

    const inviteUrl = `https://25b3cec7-b6b2-48b7-a8f4-7ee8a9c12574-00-36vzyej2u9kbm.kirk.replit.dev/accept-invite?token=${inviteToken}`;
    const rolesList = Array.isArray(roles) ? roles.join(', ') : roles;
    
    const mailOptions = {
      to: email,
      from: 'noreply@tasksetu.com',
      subject: `You're invited to join TaskSetu by ${organizationName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Join ${organizationName} on TaskSetu</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; color: #374151; }
            .greeting { font-size: 18px; margin-bottom: 24px; }
            .invitation-text { font-size: 16px; margin-bottom: 30px; }
            .btn-container { text-align: center; margin: 30px 0; }
            .btn { display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
            .btn:hover { transform: translateY(-1px); box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3); }
            .features { background-color: #F8FAFC; padding: 24px; border-radius: 8px; margin: 24px 0; }
            .features h3 { margin: 0 0 16px 0; color: #1F2937; font-size: 18px; }
            .features ul { margin: 0; padding-left: 0; list-style: none; }
            .features li { padding: 8px 0; color: #4B5563; }
            .features li:before { content: "✓"; color: #10B981; font-weight: bold; margin-right: 12px; }
            .footer { background-color: #F9FAFB; color: #6B7280; padding: 24px 30px; text-align: center; font-size: 14px; border-top: 1px solid #E5E7EB; }
            .footer a { color: #3b82f6; text-decoration: none; }
            h2 { color: #1e293b; margin: 0 0 16px 0; }
            p { color: #475569; line-height: 1.6; margin: 0 0 16px 0; }
            .highlight { color: #3b82f6; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to TaskSetu</h1>
            </div>
            
            <div class="content">
              <h2>You've been invited to join ${organizationName}</h2>
              
              <p>Hello!</p>
              
              <p><strong>${invitedByName}</strong> has invited you to join <strong>${organizationName}</strong>'s workspace on TaskSetu.</p>
              
              <div class="btn-container">
                <a href="${inviteUrl}" class="btn">Accept Invitation</a>
              </div>
              
              <div class="features">
                <h3>Once inside, you'll be able to:</h3>
                <ul>
                  <li>Collaborate with your team</li>
                  <li>Manage and follow up on tasks</li>
                  <li>Stay on top of your deadlines</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px; font-size: 14px; color: #64748b;">This invitation will expire in 7 days. If you have any questions, please contact your organization administrator.</p>
            </div>
            
            <div class="footer">
              <p>See you inside,<br>— Team TaskSetu</p>
              <br>
              <p style="font-size: 12px;">This email was sent by TaskSetu on behalf of ${organizationName}</p>
              <p style="font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
You've been invited to join ${organizationName} on TaskSetu

${invitedByName} has invited you to join ${organizationName} as a ${role}.

To accept your invitation and set up your account, please visit:
${inviteUrl}

Organization: ${organizationName}
Your Role: ${role}
Invited by: ${invitedByName}

This invitation will expire in 7 days.

If you didn't expect this invitation, you can safely ignore this email.

TaskSetu - Streamline your workflow
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Invitation email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('Mailtrap email error:', error);
      throw new Error(`Failed to send invitation email: ${error.message}`);
    }
  }

  async sendWelcomeEmail(email, firstName, organizationName) {
    if (!this.isConfigured) {
      console.warn('Email service not configured, skipping welcome email');
      return false;
    }

    const mailOptions = {
      to: email,
      from: 'noreply@tasksetu.com',
      subject: `Welcome to ${organizationName} on TaskSetu!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${organizationName}!</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .welcome-box { background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; }
            .btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; }
            .footer { background-color: #1e293b; color: #94a3b8; padding: 30px; text-align: center; font-size: 14px; }
            h2 { color: #1e293b; margin: 0 0 16px 0; }
            p { color: #475569; line-height: 1.6; margin: 0 0 16px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to TaskSetu!</h1>
            </div>
            
            <div class="content">
              <h2>Hi ${firstName}!</h2>
              
              <div class="welcome-box">
                <h3 style="color: #065f46; margin: 0 0 16px 0;">Your account is ready!</h3>
                <p style="color: #047857;">You've successfully joined <strong>${organizationName}</strong> and your account is now active.</p>
              </div>
              
              <p>You're all set to start collaborating with your team on TaskSetu. Here's what you can do:</p>
              
              <ul style="color: #475569; padding-left: 20px;">
                <li>Create and manage tasks</li>
                <li>Collaborate on projects</li>
                <li>Track progress and deadlines</li>
                <li>Generate reports and insights</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}/login" class="btn">Go to Dashboard</a>
              </div>
              
              <p>If you need any help getting started, don't hesitate to reach out to your team administrator.</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2024 TaskSetu. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to TaskSetu, ${firstName}!

Your account is ready! You've successfully joined ${organizationName} and your account is now active.

You're all set to start collaborating with your team on TaskSetu. Here's what you can do:
- Create and manage tasks
- Collaborate on projects  
- Track progress and deadlines
- Generate reports and insights

Login to your dashboard: ${process.env.CLIENT_URL || 'http://localhost:5000'}/login

If you need any help getting started, don't hesitate to reach out to your team administrator.

TaskSetu - Streamline your workflow
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Welcome email sent successfully to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  isServiceAvailable() {
    return this.isConfigured;
  }
}

export const inviteEmailService = new InviteEmailService();