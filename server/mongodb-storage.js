import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { emailService } from './services/emailService.js';
import {
  Project,
  TaskStatus,
  Task,
  TaskComment,
  TaskAssignment,
  TaskAuditLog,
  Notification,
  UsageTracking,
  Form,
  ProcessFlow,
  FormResponse,
  ProcessInstance
} from './models.js';
import { Organization } from './modals/organizationModal.js';
import { PendingUser } from './modals/pendingUserModal.js';
import { User } from './modals/userModal.js';
export class MongoStorage {

  // Token generation methods
  generateToken(user) {
    const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";
    return jwt.sign({
      id: user.id || user._id,
      email: user.email,
      organizationId: user.organization ? user.organization.toString() : undefined,
      role: user.role
    }, JWT_SECRET, { expiresIn: "7d" });
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateEmailVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Organization operations
  async createOrganization(orgData) {
    const organization = new Organization(orgData);
    return await organization.save();
  }

  async getOrganization(id) {
    return await Organization.findById(id);
  }

  // async getOrganizationBySlug(slug) {
  //   return await Organization.findOne({ slug });
  // }

  async updateOrganization(id, orgData) {
    return await Organization.findByIdAndUpdate(id, orgData, { new: true });
  }

  async getOrganizationUsers(orgId) {
    return await User.find({ organization: orgId })
      .select('-passwordHash')
      .sort({ firstName: 1, lastName: 1 });
  }
  // User operations
  async getUsers() {
    return await User.find().sort({ createdAt: -1 });
  }

  async getUser(id) {
    return await User.findById(id);
  }

  async getUserByEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      console.log('getUserByEmail found user:', {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        hasFirstName: !!user.firstName,
        hasLastName: !!user.lastName
      });
    }
    return user;
  }

  async createUser(userData) {
    console.log('Creating user with data:', userData);
    // For invited users, set default values for required fields
    if (userData.status === 'invited' && !userData.passwordHash) {
      userData.firstName = userData.firstName || '';
      userData.lastName = userData.lastName || '';
      userData.passwordHash = userData.passwordHash || 'temp_invite_placeholder';
      userData.isActive = false;
      userData.emailVerified = false;
      userData.inviteToken = this.generateEmailVerificationToken();
      userData.inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      userData.invitedAt = new Date();
    }

    // Hash password if provided for non-invited users
    if (userData.password && !userData.passwordHash && userData.status !== 'invited') {
      userData.passwordHash = await this.hashPassword(userData.password);
      delete userData.password;
    }
    console.log('user created....', userData)
    const user = new User(userData);
    return await user.save();
  }

  async updateUser(id, userData) {
    return await User.findByIdAndUpdate(id, userData, { new: true });
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

  // Project operations
  async getProjects() {
    return await Project.find().sort({ createdAt: -1 });
  }

  async getProject(id) {
    return await Project.findById(id);
  }

  async createProject(projectData) {
    const project = new Project(projectData);
    return await project.save();
  }

  async updateProject(id, projectData) {
    return await Project.findByIdAndUpdate(id, projectData, { new: true });
  }

  async deleteProject(id) {
    return await Project.findByIdAndDelete(id);
  }

  // Task operations
  async getTasks(filters = {}) {
    let query = {};

    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    if (filters.priority && filters.priority !== 'all') {
      query.priority = filters.priority;
    }

    if (filters.assignee && filters.assignee !== 'all') {
      query.assigneeName = filters.assignee;
    }

    if (filters.project && filters.project !== 'all') {
      query.projectName = filters.project;
    }

    return await Task.find(query).sort({ createdAt: -1 });
  }

  async getTask(id) {
    return await Task.findById(id);
  }

  async createTask(taskData) {
    const task = new Task(taskData);
    const savedTask = await task.save();

    // Create activity log
    await this.createActivity({
      type: 'task_created',
      description: `Task "${taskData.title}" was created`,
      relatedId: savedTask._id,
      relatedType: 'task',
      user: taskData.createdBy,
      organization: taskData.organization,
    });

    return savedTask;
  }

  async updateTask(id, taskData, userId) {
    const task = await Task.findByIdAndUpdate(id, taskData, { new: true });

    // Create activity log
    if (userId) {
      await this.createActivity({
        type: 'task_updated',
        description: `Task "${task.title}" was updated`,
        relatedId: task._id,
        relatedType: 'task',
        user: userId,
        organization: task.organization,
      });
    }

    return task;
  }

  async deleteTask(id, userId) {
    const task = await Task.findById(id);
    if (task) {
      await this.createActivity({
        type: 'task_deleted',
        description: `Task "${task.title}" was deleted`,
        relatedId: id,
        relatedType: 'task',
        user: userId,
        organization: task.organization,
      });
    }
    return await Task.findByIdAndDelete(id);
  }

  // Task Status operations
  async createTaskStatus(statusData) {
    const status = new TaskStatus(statusData);
    return await status.save();
  }

  async getTaskStatuses(organizationId) {
    return await TaskStatus.find({ organizationId }).sort({ order: 1 });
  }

  // Activity operations
  async createActivity(activityData) {
    const Activity = mongoose.model('Activity');
    const activity = new Activity(activityData);
    return await activity.save();
  }

  async getRecentActivities(limit = 10) {
    const Activity = mongoose.model('Activity');
    return await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  // Dashboard stats
  async getDashboardStats() {
    const [totalTasks, completedTasks, totalUsers, totalProjects] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'Completed' }),
      User.countDocuments(),
      Project.countDocuments()
    ]);

    const pendingTasks = totalTasks - completedTasks;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      totalUsers,
      totalProjects
    };
  }

  // Initialize sample data
  async initializeSampleData() {
    try {
      // Clear existing data for regeneration
      console.log('Cleared existing data for regeneration');
      await Promise.all([
        Organization.deleteMany({}),
        User.deleteMany({}),
        Project.deleteMany({}),
        Task.deleteMany({}),
        TaskStatus.deleteMany({}),
        TaskComment.deleteMany({}),
        TaskAssignment.deleteMany({}),
        TaskAuditLog.deleteMany({}),
        Notification.deleteMany({})
      ]);

      console.log('Initializing comprehensive sample data...');

      // Create sample organizations
      const organizations = await Organization.insertMany([
        {
          name: 'TechCorp Solutions',
          slug: 'techcorp-solutions',
          description: 'Leading technology solutions provider',
          isActive: true,
          createdAt: new Date('2024-01-15'),
        },
        {
          name: 'Digital Innovations',
          slug: 'digital-innovations',
          description: 'Cutting-edge digital transformation company',
          isActive: true,
          createdAt: new Date('2024-02-10'),
        },
        {
          name: 'StartupX',
          slug: 'startupx',
          description: 'Fast-growing startup in fintech space',
          isActive: true,
          createdAt: new Date('2024-03-05'),
        }
      ]);

      // Create super admin user
      const superAdminPasswordHash = await this.hashPassword('superadmin123');
      const superAdmin = await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@tasksetu.com',
        passwordHash: superAdminPasswordHash,
        role: 'super_admin',
        isActive: true,
        emailVerified: true,
        createdAt: new Date('2024-01-01'),
      });

      // Create sample users for each organization
      const sampleUsers = [];

      // TechCorp Solutions users
      const techCorpPasswordHash = await this.hashPassword('password123');
      sampleUsers.push(
        await User.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@techcorp.com',
          passwordHash: techCorpPasswordHash,
          role: 'admin',
          organization: organizations[0]._id,
          isActive: true,
          emailVerified: true,
          createdAt: new Date('2024-01-16'),
        }),
        await User.create({
          firstName: 'Sarah',
          lastName: 'Wilson',
          email: 'sarah.wilson@techcorp.com',
          passwordHash: techCorpPasswordHash,
          role: 'member',
          organization: organizations[0]._id,
          isActive: true,
          emailVerified: true,
          createdAt: new Date('2024-01-20'),
        })
      );

      // Digital Innovations users
      sampleUsers.push(
        await User.create({
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@digitalinnov.com',
          passwordHash: techCorpPasswordHash,
          role: 'admin',
          organization: organizations[1]._id,
          isActive: true,
          emailVerified: true,
          createdAt: new Date('2024-02-12'),
        }),
        await User.create({
          firstName: 'Emily',
          lastName: 'Davis',
          email: 'emily.davis@digitalinnov.com',
          passwordHash: techCorpPasswordHash,
          role: 'member',
          organization: organizations[1]._id,
          isActive: true,
          emailVerified: true,
          createdAt: new Date('2024-02-15'),
        })
      );

      // StartupX users
      sampleUsers.push(
        await User.create({
          firstName: 'Alex',
          lastName: 'Chen',
          email: 'alex.chen@startupx.com',
          passwordHash: techCorpPasswordHash,
          role: 'admin',
          organization: organizations[2]._id,
          isActive: true,
          emailVerified: true,
          createdAt: new Date('2024-03-07'),
        })
      );

      // Add invited users to show different statuses in subscription table
      const inviteToken1 = this.generateEmailVerificationToken();
      const inviteToken2 = this.generateEmailVerificationToken();

      // TechCorp invited users
      await User.create({
        email: 'lisa.martinez@techcorp.com',
        roles: ['member'],
        status: 'invited',
        organization: organizations[0]._id,
        inviteToken: inviteToken1,
        inviteTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        invitedBy: sampleUsers[0]._id,
        invitedAt: new Date('2024-06-15'),
        isActive: false,
        emailVerified: false,
        createdAt: new Date('2024-06-15'),
      });

      await User.create({
        email: 'david.kim@techcorp.com',
        roles: ['member'],
        status: 'invited',
        organization: organizations[0]._id,
        inviteToken: inviteToken2,
        inviteTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        invitedBy: sampleUsers[0]._id,
        invitedAt: new Date('2024-06-18'),
        isActive: false,
        emailVerified: false,
        createdAt: new Date('2024-06-18'),
      });

      // Create sample projects
      const projects = await Project.insertMany([
        {
          name: 'Website Redesign',
          description: 'Complete overhaul of the company website',
          status: 'active',
          organization: organizations[0]._id,
          owner: sampleUsers[0]._id,
          createdAt: new Date('2024-02-01'),
        },
        {
          name: 'Mobile App Development',
          description: 'Native iOS and Android app development',
          status: 'active',
          organization: organizations[1]._id,
          owner: sampleUsers[2]._id,
          createdAt: new Date('2024-02-15'),
        },
        {
          name: 'API Integration',
          description: 'Integration with third-party services',
          status: 'completed',
          organization: organizations[0]._id,
          owner: sampleUsers[0]._id,
          createdAt: new Date('2024-01-20'),
        },
        {
          name: 'Financial Dashboard',
          description: 'Real-time financial analytics dashboard',
          status: 'active',
          organization: organizations[2]._id,
          owner: sampleUsers[4]._id,
          createdAt: new Date('2024-03-10'),
        }
      ]);

      // Create sample tasks
      await Task.insertMany([
        {
          title: 'Homepage Redesign',
          description: 'Design new homepage with modern UI',
          status: 'in-progress',
          priority: 'high',
          organization: organizations[0]._id,
          project: projects[0]._id,
          assignedTo: sampleUsers[1]._id,
          createdBy: sampleUsers[0]._id,
          dueDate: new Date('2024-07-15'),
          createdAt: new Date('2024-06-01'),
        },
        {
          title: 'API Documentation',
          description: 'Write comprehensive API documentation',
          status: 'todo',
          priority: 'medium',
          organization: organizations[0]._id,
          project: projects[2]._id,
          assignedTo: sampleUsers[1]._id,
          createdBy: sampleUsers[0]._id,
          dueDate: new Date('2024-07-20'),
          createdAt: new Date('2024-06-05'),
        },
        {
          title: 'Mobile UI Components',
          description: 'Create reusable UI components for mobile app',
          status: 'completed',
          priority: 'high',
          organization: organizations[1]._id,
          project: projects[1]._id,
          assignedTo: sampleUsers[3]._id,
          createdBy: sampleUsers[2]._id,
          dueDate: new Date('2024-06-30'),
          createdAt: new Date('2024-05-15'),
        },
        {
          title: 'Database Schema Design',
          description: 'Design database schema for financial data',
          status: 'in-progress',
          priority: 'urgent',
          organization: organizations[2]._id,
          project: projects[3]._id,
          assignedTo: sampleUsers[4]._id,
          createdBy: sampleUsers[4]._id,
          dueDate: new Date('2024-07-10'),
          createdAt: new Date('2024-06-10'),
        },
        {
          title: 'User Authentication',
          description: 'Implement secure user authentication system',
          status: 'todo',
          priority: 'high',
          organization: organizations[1]._id,
          project: projects[1]._id,
          assignedTo: sampleUsers[2]._id,
          createdBy: sampleUsers[2]._id,
          dueDate: new Date('2024-08-01'),
          createdAt: new Date('2024-06-12'),
        },
        {
          title: 'Performance Optimization',
          description: 'Optimize application performance and loading times',
          status: 'in-progress',
          priority: 'medium',
          organization: organizations[0]._id,
          project: projects[0]._id,
          assignedTo: sampleUsers[0]._id,
          createdBy: sampleUsers[0]._id,
          dueDate: new Date('2024-07-25'),
          createdAt: new Date('2024-06-08'),
        },
        {
          title: 'Data Visualization',
          description: 'Create interactive charts and graphs for dashboard',
          status: 'todo',
          priority: 'medium',
          organization: organizations[2]._id,
          project: projects[3]._id,
          assignedTo: sampleUsers[4]._id,
          createdBy: sampleUsers[4]._id,
          dueDate: new Date('2024-08-15'),
          createdAt: new Date('2024-06-14'),
        },
        {
          title: 'Security Audit',
          description: 'Comprehensive security audit and vulnerability assessment',
          status: 'completed',
          priority: 'urgent',
          organization: organizations[1]._id,
          project: projects[1]._id,
          assignedTo: sampleUsers[2]._id,
          createdBy: sampleUsers[2]._id,
          dueDate: new Date('2024-06-20'),
          createdAt: new Date('2024-05-20'),
        }
      ]);

      console.log('Comprehensive sample data initialized successfully');
      console.log(`Created ${organizations.length} organizations, ${sampleUsers.length + 3} users (including 2 invited), ${projects.length} projects, and 8 tasks`);
      console.log('Super admin login: superadmin@tasksetu.com / superadmin123');

    } catch (error) {
      console.error('Sample data initialization error:', error);
      throw error;
    }
  }

  // Form operations
  async getForms(organizationId) {
    return await Form.find({ organization: organizationId })
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  async getForm(id) {
    return await Form.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('organization', 'name slug');
  }

  async getFormByAccessLink(accessLink) {
    return await Form.findOne({ accessLink, isPublished: true })
      .populate('organization', 'name slug');
  }

  async createForm(formData) {
    // Generate unique access link
    const accessLink = `form-${crypto.randomBytes(8).toString('hex')}`;

    const form = new Form({
      ...formData,
      accessLink
    });
    return await form.save();
  }

  async updateForm(id, formData) {
    return await Form.findByIdAndUpdate(id, formData, { new: true });
  }

  async deleteForm(id) {
    return await Form.findByIdAndDelete(id);
  }

  async publishForm(id) {
    return await Form.findByIdAndUpdate(
      id,
      { isPublished: true },
      { new: true }
    );
  }

  async unpublishForm(id) {
    return await Form.findByIdAndUpdate(
      id,
      { isPublished: false },
      { new: true }
    );
  }

  // Process Flow operations
  async getProcessFlows(organizationId) {
    return await ProcessFlow.find({ organization: organizationId })
      .populate('createdBy', 'firstName lastName email')
      .populate('form', 'title')
      .sort({ createdAt: -1 });
  }

  async getProcessFlow(id) {
    return await ProcessFlow.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('form', 'title fields')
      .populate('steps.assignedTo', 'firstName lastName email');
  }

  async createProcessFlow(flowData) {
    const processFlow = new ProcessFlow(flowData);
    return await processFlow.save();
  }

  async updateProcessFlow(id, flowData) {
    return await ProcessFlow.findByIdAndUpdate(id, flowData, { new: true });
  }

  async deleteProcessFlow(id) {
    return await ProcessFlow.findByIdAndDelete(id);
  }

  // Form Response operations
  async getFormResponses(filters = {}) {
    let query = {};

    if (filters.formId) {
      query.form = filters.formId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.organizationId) {
      const forms = await Form.find({ organization: filters.organizationId }).select('_id');
      const formIds = forms.map(f => f._id);
      query.form = { $in: formIds };
    }

    return await FormResponse.find(query)
      .populate('form', 'title')
      .populate('submittedBy', 'firstName lastName email')
      .populate('processFlow', 'title')
      .sort({ createdAt: -1 });
  }

  async getFormResponse(id) {
    return await FormResponse.findById(id)
      .populate('form', 'title fields')
      .populate('submittedBy', 'firstName lastName email')
      .populate('processFlow', 'title steps')
      .populate('stepHistory.assignedTo', 'firstName lastName email')
      .populate('stepHistory.completedBy', 'firstName lastName email');
  }

  async createFormResponse(responseData) {
    const response = new FormResponse(responseData);
    const savedResponse = await response.save();

    // If there's a process flow, create process instance
    if (responseData.processFlow) {
      await this.createProcessInstance({
        processFlow: responseData.processFlow,
        formResponse: savedResponse._id,
        currentSteps: ['start']
      });
    }

    return savedResponse;
  }

  async updateFormResponse(id, responseData) {
    return await FormResponse.findByIdAndUpdate(id, responseData, { new: true });
  }

  async updateResponseStep(responseId, stepData) {
    const response = await FormResponse.findById(responseId);
    if (!response) return null;

    response.stepHistory.push({
      stepId: stepData.stepId,
      stepTitle: stepData.stepTitle,
      status: stepData.status,
      assignedTo: stepData.assignedTo,
      completedBy: stepData.completedBy,
      comments: stepData.comments,
      completedAt: stepData.status === 'completed' ? new Date() : undefined
    });

    response.currentStep = stepData.nextStep || null;

    if (stepData.status === 'completed' && !stepData.nextStep) {
      response.status = 'completed';
    } else if (stepData.status === 'rejected') {
      response.status = 'rejected';
    } else {
      response.status = 'in_progress';
    }

    return await response.save();
  }

  // Process Instance operations
  async getProcessInstance(responseId) {
    return await ProcessInstance.findOne({ formResponse: responseId })
      .populate('processFlow')
      .populate('formResponse');
  }

  async createProcessInstance(instanceData) {
    const instance = new ProcessInstance(instanceData);
    return await instance.save();
  }

  async updateProcessInstance(id, instanceData) {
    return await ProcessInstance.findByIdAndUpdate(id, instanceData, { new: true });
  }

  // Analytics for forms and processes
  async getFormAnalytics(formId, organizationId) {
    const matchStage = formId ?
      { form: formId } :
      { form: { $in: await this.getFormIdsByOrganization(organizationId) } };

    const analytics = await FormResponse.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          completedSubmissions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          inProgressSubmissions: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          rejectedSubmissions: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    return analytics[0] || {
      totalSubmissions: 0,
      completedSubmissions: 0,
      inProgressSubmissions: 0,
      rejectedSubmissions: 0
    };
  }

  async getFormIdsByOrganization(organizationId) {
    const forms = await Form.find({ organization: organizationId }).select('_id');
    return forms.map(f => f._id);
  }

  // Role Management Operations
  async getRoles(organizationId) {
    try {
      // Return predefined roles with metadata
      const predefinedRoles = [
        {
          _id: 'admin',
          name: 'Administrator',
          description: 'Full system access with all permissions',
          permissions: [
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete',
            'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
            'organizations.view', 'organizations.edit',
            'reports.view', 'reports.create'
          ],
          organizationId,
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'member',
          name: 'Member',
          description: 'Standard user with basic permissions',
          permissions: [
            'tasks.view', 'tasks.create', 'tasks.edit',
            'projects.view',
            'users.view'
          ],
          organizationId,
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: 'viewer',
          name: 'Viewer',
          description: 'Read-only access to tasks and projects',
          permissions: [
            'tasks.view',
            'projects.view',
            'users.view'
          ],
          organizationId,
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      return predefinedRoles;
    } catch (error) {
      console.error('Get roles error:', error);
      throw error;
    }
  }

  async getRole(roleId) {
    try {
      // Handle predefined system roles
      const predefinedRoles = {
        'admin': {
          _id: 'admin',
          name: 'Administrator',
          description: 'Full system access with all permissions',
          permissions: [
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete',
            'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
            'organizations.view', 'organizations.edit',
            'reports.view', 'reports.create'
          ],
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        'member': {
          _id: 'member',
          name: 'Member',
          description: 'Standard user with basic permissions',
          permissions: [
            'tasks.view', 'tasks.create', 'tasks.edit',
            'projects.view',
            'users.view'
          ],
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        'viewer': {
          _id: 'viewer',
          name: 'Viewer',
          description: 'Read-only access to tasks and projects',
          permissions: [
            'tasks.view',
            'projects.view',
            'users.view'
          ],
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      return predefinedRoles[roleId] || null;
    } catch (error) {
      console.error('Get role error:', error);
      throw error;
    }
  }

  async getRoleByName(name, organizationId) {
    try {
      // Check predefined roles
      const predefinedRoles = ['admin', 'member', 'viewer'];
      if (predefinedRoles.includes(name.toLowerCase())) {
        return await this.getRole(name.toLowerCase());
      }
      return null;
    } catch (error) {
      console.error('Get role by name error:', error);
      throw error;
    }
  }

  async createRole(roleData) {
    try {
      // For now, return a success response since we're using predefined roles
      // In a full implementation, this would create custom roles in the database
      throw new Error('Creating custom roles is not yet implemented. Please use predefined roles: admin, member, viewer');
    } catch (error) {
      console.error('Create role error:', error);
      throw error;
    }
  }

  async updateRole(roleId, updateData) {
    try {
      // For now, return a success response since we're using predefined roles
      // In a full implementation, this would update custom roles in the database
      throw new Error('Updating system roles is not allowed. Only custom roles can be modified.');
    } catch (error) {
      console.error('Update role error:', error);
      throw error;
    }
  }

  async deleteRole(roleId) {
    try {
      // For now, return a success response since we're using predefined roles
      // In a full implementation, this would delete custom roles from the database
      throw new Error('Deleting system roles is not allowed. Only custom roles can be deleted.');
    } catch (error) {
      console.error('Delete role error:', error);
      throw error;
    }
  }

  async getUsersByRole(roleId) {
    try {
      const users = await User.find({
        role: roleId
      }).select('_id firstName lastName email role createdAt');

      return users;
    } catch (error) {
      console.error('Get users by role error:', error);
      throw error;
    }
  }

  // Report Generation Operations
  async generateReportData(filters) {
    try {
      const { organizationId, dateRange, userId, projectId, status, department } = filters;

      // Build task query
      let taskQuery = { organization: organizationId };

      if (dateRange.startDate && dateRange.endDate) {
        taskQuery.createdAt = {
          $gte: dateRange.startDate,
          $lte: dateRange.endDate
        };
      }

      if (userId) taskQuery.assignedTo = userId;
      if (projectId) taskQuery.project = projectId;
      if (status) taskQuery.status = status;

      // Get tasks with populated data
      const tasks = await Task.find(taskQuery)
        .populate('assignedTo', 'firstName lastName email department')
        .populate('project', 'name')
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 });

      // Filter by department if specified
      const filteredTasks = department
        ? tasks.filter(task => task.assignedTo?.department === department)
        : tasks;

      // Generate summary statistics
      const summary = {
        totalUsers: await User.countDocuments({ organization: organizationId }),
        totalTasks: filteredTasks.length,
        avgCompletion: this.calculateAverageCompletion(filteredTasks),
        overdueTasks: filteredTasks.filter(task =>
          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
        ).length
      };

      // Generate user performance data
      const userPerformance = await this.generateUserPerformanceData(filteredTasks, organizationId);

      // Generate user task data for charts
      const userTaskData = await this.generateUserTaskChartData(filteredTasks);

      // Generate status distribution data
      const statusDistribution = this.generateStatusDistribution(filteredTasks);

      // Generate trend data
      const trendData = await this.generateTrendData(organizationId, dateRange);

      // Format task details
      const taskDetails = filteredTasks.map(task => ({
        _id: task._id,
        title: task.title,
        assignedTo: task.assignedTo,
        project: task.project,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        progress: task.progress || 0,
        createdAt: task.createdAt
      }));

      return {
        summary,
        userPerformance,
        userTaskData,
        statusDistribution,
        trendData,
        taskDetails
      };
    } catch (error) {
      console.error('Generate report data error:', error);
      throw error;
    }
  }

  calculateAverageCompletion(tasks) {
    if (tasks.length === 0) return 0;

    const totalProgress = tasks.reduce((sum, task) => {
      if (task.status === 'completed') return sum + 100;
      return sum + (task.progress || 0);
    }, 0);

    return Math.round(totalProgress / tasks.length);
  }

  async generateUserPerformanceData(tasks, organizationId) {
    try {
      // Get all users in the organization
      const users = await User.find({ organization: organizationId })
        .select('_id firstName lastName email department');

      const userStats = users.map(user => {
        const userTasks = tasks.filter(task =>
          task.assignedTo && task.assignedTo._id.toString() === user._id.toString()
        );

        const completedTasks = userTasks.filter(task => task.status === 'completed').length;
        const inProgressTasks = userTasks.filter(task => task.status === 'in-progress').length;
        const overdueTasks = userTasks.filter(task =>
          task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
        ).length;

        const progressPercentage = userTasks.length > 0
          ? Math.round((completedTasks / userTasks.length) * 100)
          : 0;

        return {
          userId: user._id,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          department: user.department,
          totalTasks: userTasks.length,
          completedTasks,
          inProgressTasks,
          overdueTasks,
          progressPercentage,
          hoursLogged: 0 // Placeholder for time tracking feature
        };
      });

      return userStats.sort((a, b) => b.totalTasks - a.totalTasks);
    } catch (error) {
      console.error('Generate user performance data error:', error);
      throw error;
    }
  }

  async generateUserTaskChartData(tasks) {
    try {
      const userTaskMap = new Map();

      tasks.forEach(task => {
        if (task.assignedTo) {
          const userId = task.assignedTo._id.toString();
          const userName = `${task.assignedTo.firstName} ${task.assignedTo.lastName}`;

          if (!userTaskMap.has(userId)) {
            userTaskMap.set(userId, {
              userName,
              totalTasks: 0,
              completedTasks: 0
            });
          }

          const userData = userTaskMap.get(userId);
          userData.totalTasks++;

          if (task.status === 'completed') {
            userData.completedTasks++;
          }
        }
      });

      return Array.from(userTaskMap.values())
        .sort((a, b) => b.totalTasks - a.totalTasks)
        .slice(0, 10); // Top 10 users
    } catch (error) {
      console.error('Generate user task chart data error:', error);
      throw error;
    }
  }

  generateStatusDistribution(tasks) {
    const statusMap = new Map();

    tasks.forEach(task => {
      const status = task.status || 'unknown';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    return Array.from(statusMap.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
      value
    }));
  }

  async generateTrendData(organizationId, dateRange) {
    try {
      // Simplified trend data to avoid complex queries
      const mockTrendData = [
        { date: dateRange.startDate.toISOString().split('T')[0], completed: 5, created: 8, overdue: 2 },
        { date: new Date(dateRange.startDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], completed: 3, created: 6, overdue: 1 },
        { date: new Date(dateRange.startDate.getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0], completed: 7, created: 9, overdue: 3 },
        { date: new Date(dateRange.startDate.getTime() + 72 * 60 * 60 * 1000).toISOString().split('T')[0], completed: 4, created: 5, overdue: 2 },
        { date: dateRange.endDate.toISOString().split('T')[0], completed: 6, created: 7, overdue: 1 }
      ];

      return mockTrendData;
    } catch (error) {
      console.error('Generate trend data error:', error);
      return [];
    }
  }

  async generateCSVReport(reportData) {
    try {
      const headers = [
        'User Name',
        'Email',
        'Department',
        'Total Tasks',
        'Completed Tasks',
        'In Progress Tasks',
        'Overdue Tasks',
        'Progress Percentage',
        'Hours Logged'
      ];

      const rows = reportData.userPerformance.map(user => [
        user.userName,
        user.userEmail,
        user.department || 'N/A',
        user.totalTasks,
        user.completedTasks,
        user.inProgressTasks,
        user.overdueTasks,
        user.progressPercentage + '%',
        user.hoursLogged + 'h'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Generate CSV report error:', error);
      throw error;
    }
  }

  // Super Admin Methods
  async getAllCompanies() {
    console.log("Fetching all companies from database...");
    const companies = await Organization.find({})
      .sort({ createdAt: -1 });

    console.log("Raw companies found:", companies.length);

    // Get stats for each company
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

        const companyData = {
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

        console.log(`Company ${company.name}: ${userCount} users, ${projectCount} projects`);
        return companyData;
      })
    );

    console.log("Companies with stats prepared:", companiesWithStats.length);
    return companiesWithStats;
  }

  async getCompanyDetails(companyId) {
    const company = await Organization.findById(companyId);

    if (!company) return null;

    // Get company statistics
    const userCount = await User.countDocuments({ organizationId: companyId });
    const projectCount = await Project.countDocuments({ organizationId: companyId });
    const taskCount = await Task.countDocuments({ organizationId: companyId });
    const formCount = await Form.countDocuments({ organization: companyId });

    return {
      ...company.toObject(),
      stats: {
        users: userCount,
        projects: projectCount,
        tasks: taskCount,
        forms: formCount
      }
    };
  }

  async getAllUsersAcrossCompanies() {
    console.log("Fetching all users across companies...");

    // Get all users with organization info
    const users = await User.find({})
      .populate('organizationId', 'name slug')
      .populate('organization', 'name slug')
      .sort({ createdAt: -1 });

    console.log("Raw users found:", users.length);

    // Transform users to include organization name consistently
    const transformedUsers = users.map(user => {
      const userObj = user.toObject();

      // Get organization name from either field
      let organizationName = 'Individual User';
      if (userObj.organizationId?.name) {
        organizationName = userObj.organizationId.name;
      } else if (userObj.organization?.name) {
        organizationName = userObj.organization.name;
      }

      return {
        ...userObj,
        organizationName,
        // Ensure consistent status field
        status: userObj.status || (userObj.isActive ? 'active' : 'inactive')
      };
    });

    console.log("Transformed users prepared:", transformedUsers.length);
    return transformedUsers;
  }

  async getPlatformAnalytics() {
    const totalCompanies = await Organization.countDocuments({});
    const totalUsers = await User.countDocuments({});
    const totalProjects = await Project.countDocuments({});
    const totalTasks = await Task.countDocuments({});
    const totalForms = await Form.countDocuments({});

    // Get recent activity across all companies
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('organizationId', 'name');

    const recentTasks = await Task.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('organizationId', 'name')
      .populate('assignedTo', 'firstName lastName');

    // Company growth over time
    const companyGrowth = await Organization.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    return {
      overview: {
        totalCompanies,
        totalUsers,
        totalProjects,
        totalTasks,
        totalForms
      },
      recentActivity: {
        users: recentUsers,
        tasks: recentTasks
      },
      growth: companyGrowth
    };
  }

  async updateCompanyStatus(companyId, status) {
    return await Organization.findByIdAndUpdate(
      companyId,
      { isActive: status },
      { new: true }
    );
  }

  async assignCompanyAdmin(companyId, userId) {
    return await User.findByIdAndUpdate(
      userId,
      {
        role: 'admin',
        organizationId: companyId
      },
      { new: true }
    );
  }

  async getSystemLogs(limit = 100) {
    return await TaskAuditLog.find({})
      .populate('userId', 'firstName lastName email')
      .populate('taskId', 'title')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async createSuperAdmin(userData) {
    const superAdminData = {
      ...userData,
      role: 'super_admin',
      isActive: true,
      emailVerified: true
    };

    if (userData.password) {
      superAdminData.passwordHash = await this.hashPassword(userData.password);
    }

    const superAdmin = new User(superAdminData);
    return await superAdmin.save();
  }

  // Authentication Methods for User Management Module

  // Pending User Operations
  async createPendingUser(userData) {
    const pendingUser = new PendingUser(userData);
    return await pendingUser.save();
  }

  async getPendingUserByEmail(email) {
    return await PendingUser.findOne({ email });
  }

  async updatePendingUser(id, updateData) {
    return await PendingUser.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deletePendingUser(id) {
    return await PendingUser.findByIdAndDelete(id);
  }

  // User Authentication Methods
  async getUserByResetToken(token) {
    return await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });
  }

  async getOrganizationBySlug(slug) {
    return await Organization.findOne({ slug });
  }

  // User Invitation and Management Methods
  async inviteUserToOrganization(inviteData) {
    const {
      email,
      organizationId,
      roles,
      invitedBy,
      invitedByName,
      organizationName,
      name,
      licenseId,
      department,
      designation,
      location,
      phone,
      sendEmail = true,
    } = inviteData;

    // ✅ Correct field for organization check
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      organization_id: organizationId
    });

    if (existingUser) {
      throw new Error(`${email} is already invited to your organization.`);
    }

    // ✅ Generate token
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const inviteTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // ✅ Split name into firstName & lastName
    const [firstName = "", ...lastParts] = (name || "").trim().split(" ");
    const lastName = lastParts.join(" ");

    // ✅ Create invited user
    const invitedUser = new User({
      email,
      role: roles,
      roles: [],
      organization_id: organizationId,
      status: "invited",
      isActive: false,
      emailVerified: false,
      inviteToken,
      inviteTokenExpiry,
      invitedBy,
      invitedAt: new Date(),
      licenseId: licenseId || null,
      department: department || null,
      designation: designation || null,
      location: location || null,
      phone: phone || null,
      firstName,
      lastName,
    });

    const savedUser = await invitedUser.save();
    console.log(">> New invited:", savedUser.email);

    // ✅ Send email if allowed
    if (sendEmail) {
      await this.sendInvitationEmail(
        email,
        inviteToken,
        organizationName,
        roles,
        invitedByName,
        name
      );
    }

    return savedUser;
  }


  // async inviteUserToOrganization(inviteData) {
  //   const { email, organizationId, roles, invitedBy, invitedByName, organizationName } = inviteData;

  //   // Check if user already exists in this organization (active or invited)
  //   const existingUser = await User.findOne({ 
  //     email: email.toLowerCase(),
  //     organization: organizationId 
  //   });

  //   if (existingUser) {
  //     // Return error for duplicate validation
  //     throw new Error(`${email} is already invited to your organization.`);
  //   }

  //   // Generate invitation token (48 hours expiry as requested)
  //   const inviteToken = crypto.randomBytes(32).toString('hex');
  //   const inviteTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  //   // Create invited user record with proper status
  //   const invitedUser = new User({
  //     email,
  //     role: roles.includes('admin') || roles.includes('org_admin') ? 'admin' : 'member',
  //     roles: roles, // Store full roles array
  //     organization: organizationId, // Use 'organization' field from schema
  //     status: 'invited', // Use 'invited' status to avoid validation requirements
  //     isActive: false,
  //     emailVerified: false,
  //     inviteToken,
  //     inviteTokenExpiry,
  //     invitedBy,
  //     invitedAt: new Date()
  //     // firstName, lastName, and passwordHash not required for invited status
  //   });

  //   const savedUser = await invitedUser.save();

  //   // Send invitation email
  //   await this.sendInvitationEmail(email, inviteToken, organizationName, roles, invitedByName);

  //   return savedUser;
  // }

  async getInvitedUser(token) {
    return await User.findOne({
      inviteToken: token,
      inviteTokenExpiry: { $gt: new Date() },
      status: 'invited'
    });
  }

  async completeUserInvitation(token, userData) {
    try {
      const { firstName, lastName, password } = userData;

      const user = await this.getUserByInviteToken(token);
      if (!user) {
        return { success: false, message: 'Invalid or expired invitation token' };
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Update user to active status and invalidate token
      const updatedUser = await User.findByIdAndUpdate(user._id, {
        firstName,
        lastName,
        passwordHash,
        status: 'active',
        isActive: true,
        emailVerified: true,
        inviteToken: null,
        inviteTokenExpiry: null,
        completedAt: new Date()
      }, { new: true });

      if (!updatedUser) {
        return { success: false, message: 'Failed to complete user registration' };
      }

      return {
        success: true,
        user: updatedUser,
        message: 'Account created successfully'
      };
    } catch (error) {
      console.error('Complete user invitation error:', error);
      return {
        success: false,
        message: error.message || 'Failed to complete invitation'
      };
    }
  }

  // Organization License Management
  async getOrganizationLicenseInfo(organizationId) {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    const activeUsers = await User.countDocuments({
      organization: organizationId,
      isActive: true
    });

    const totalLicenses = organization.maxUsers || 10; // Default 10 users
    const usedLicenses = activeUsers;
    const availableSlots = Math.max(0, totalLicenses - usedLicenses);

    return {
      totalLicenses,
      licenseType: organization.subscriptionType || 'Monthly',
      usedLicenses,
      availableSlots
    };
  }



  // Send user invitation email
  async sendInvitationEmail(email, inviteToken, organizationName, roles, invitedByName, name) {
    return await emailService.sendInvitationEmail(email, inviteToken, organizationName, roles, invitedByName, name);
  }

  // Get all pending users
  async getAllPendingUsers() {
    return await PendingUser.find({});
  }

  // Get user by invite token - only return if still pending invitation
  async getUserByInviteToken(token) {
    return await User.findOne({
      inviteToken: token,
      status: 'invited', // Must be invited status
      inviteTokenExpiry: { $gt: new Date() }, // Token not expired
      passwordHash: { $exists: false } // No password set yet
    });
  }

  // Get user by email verification token
  async getUserByVerificationToken(token) {
    return await User.findOne({
      emailVerificationToken: token,
      status: 'pending', // Must be pending verification
      emailVerificationExpires: { $gt: new Date() } // Token not expired
    });
  }

  // Get organization users with detailed info
  async getOrganizationUsersDetailed(organizationId) {
    return await User.find({ organization: organizationId })
      .select('firstName lastName email role roles status isActive emailVerified inviteToken inviteTokenExpiry lastLoginAt createdAt invitedBy invitedAt department designation location assignedTasks completedTasks')
      .populate('invitedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  // Task operations
  // async createTask(taskData) {
  //   const task = new Task(taskData);
  //   return await task.save();
  // }

  async getTaskById(id) {
    console.log('DEBUG - getTaskById called with id:', id);
    const task = await Task.findById(id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('project', 'name')
      .populate('organization', 'name');

    console.log('DEBUG - Found task:', task ? 'Yes' : 'No');

    if (task) {
      console.log('DEBUG - Looking for subtasks with parentTaskId:', id);
      // Get subtasks for this task
      const subtasks = await Task.find({
        parentTaskId: id,
        isDeleted: { $ne: true }
      })
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: 1 });

      console.log('DEBUG - Found subtasks count:', subtasks.length);
      console.log('DEBUG - Subtasks details:', subtasks.map(s => ({ id: s._id, title: s.title, parentTaskId: s.parentTaskId })));

      // Convert to plain object and add subtasks
      const taskObj = task.toObject();
      taskObj.subtasks = subtasks;
      console.log('DEBUG - Final taskObj has subtasks:', taskObj.subtasks ? taskObj.subtasks.length : 'undefined');
      return taskObj;
    }

    return task;
  }

  async getTasksByFilter(filter, options = {}) {
    const { page = 1, limit = 50, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('project', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get subtasks for each task
    if (tasks && tasks.length > 0) {
      const tasksWithSubtasks = [];
      for (let task of tasks) {
        const subtasks = await Task.find({
          parentTaskId: task._id,
          isDeleted: { $ne: true }
        })
          .populate('assignedTo', 'firstName lastName email')
          .populate('createdBy', 'firstName lastName email')
          .sort({ createdAt: 1 });

        // Convert to plain object and add subtasks
        const taskObj = task.toObject();
        taskObj.subtasks = subtasks;
        tasksWithSubtasks.push(taskObj);
      }
      return tasksWithSubtasks;
    }

    return tasks;
  }

  async countTasksByFilter(filter) {
    return await Task.countDocuments(filter);
  }  // async updateTask(id, updateData) {
  //   return await Task.findByIdAndUpdate(id, updateData, { new: true });
  // }

  // async deleteTask(id) {
  //   return await Task.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  // }

  // Task approval operations
  async createTaskApproval(approvalData) {
    // For MongoDB, we'll store approvals as part of the task document
    // This is a simplified implementation
    const task = await Task.findById(approvalData.taskId);
    if (!task.approvalRecords) {
      task.approvalRecords = [];
    }

    const approval = {
      approverId: approvalData.approverId,
      status: approvalData.status,
      comment: approvalData.comment || '',
      createdAt: new Date()
    };

    task.approvalRecords.push(approval);
    await task.save();
    return approval;
  }

  async getTaskApprovals(taskId) {
    const task = await Task.findById(taskId);
    return task?.approvalRecords || [];
  }

  async getTaskApprovalByTaskAndUser(taskId, userId) {
    const task = await Task.findById(taskId);
    return task?.approvalRecords?.find(approval =>
      approval.approverId.toString() === userId.toString()
    );
  }

  async updateTaskApproval(approvalId, updateData) {
    // Since we're storing approvals in the task document for simplicity,
    // we need to handle this differently - this method should update by approval ID
    // For now, we'll keep it simple and find the task containing this approval
    const task = await Task.findOne({ 'approvalRecords._id': approvalId });
    if (task) {
      const approval = task.approvalRecords.id(approvalId);
      if (approval) {
        Object.assign(approval, updateData);
        await task.save();
        return approval;
      }
    }
    return null;
  }

  // Project operations
  async getProjectsByOrganization(organizationId) {
    return await Project.find({
      $or: [
        { organization: organizationId },
        { organizationId: organizationId }
      ]
    }).sort({ createdAt: -1 });
  }

  // async getProject(id) {
  //   return await Project.findById(id);
  // }
}

export const storage = new MongoStorage();