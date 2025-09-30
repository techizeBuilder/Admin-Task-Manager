import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, serial, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  profileImageUrl: varchar('profile_image_url', { length: 500 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  bio: text('bio'),
  passwordHash: varchar('password_hash', { length: 255 }),
  emailVerified: boolean('email_verified').default(false),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  emailVerificationExpires: timestamp('email_verification_expires'),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  organizationId: integer('organization_id'),
  role: varchar('role', { length: 50 }).notNull().default('employee'),
  permissions: text('permissions').array(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  invitationToken: varchar('invitation_token', { length: 255 }),
  invitationExpires: timestamp('invitation_expires'),
  invitedBy: integer('invited_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Organizations table
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  logo: varchar('logo', { length: 500 }),
  maxUsers: integer('max_users').default(10),
  isActive: boolean('is_active').default(true),
  settings: jsonb('settings'),
  industry: varchar('industry', { length: 100 }),
  size: varchar('size', { length: 20 }).default('medium'),
  website: varchar('website', { length: 255 }),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Projects table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  organizationId: integer('organization_id').notNull(),
  ownerId: integer('owner_id').notNull(),
  status: varchar('status', { length: 20 }).default('active'),
  color: varchar('color', { length: 7 }).default('#3B82F6'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Tasks table - comprehensive for all task types
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  
  // Basic task properties
  organizationId: integer('organization_id').notNull(),
  projectId: integer('project_id'),
  createdById: integer('created_by_id').notNull(),
  assignedToId: integer('assigned_to_id'),
  
  // Status and priority
  status: varchar('status', { length: 50 }).default('todo'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  
  // Dates
  dueDate: timestamp('due_date'),
  startDate: timestamp('start_date'),
  completedAt: timestamp('completed_at'),
  
  // Task type and behavior
  taskType: varchar('task_type', { length: 50 }).notNull().default('regular'), // regular, recurring, milestone, approval
  
  // Progress and estimation
  progress: integer('progress').default(0),
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours'),
  
  // Tags and categorization
  tags: text('tags').array(),
  category: varchar('category', { length: 100 }),
  
  // Visibility and collaboration
  visibility: varchar('visibility', { length: 20 }).default('private'), // private, team, organization
  collaboratorIds: text('collaborator_ids').array(),
  
  // Recurring task properties
  isRecurring: boolean('is_recurring').default(false),
  recurrencePattern: jsonb('recurrence_pattern'), // {frequency: 'weekly', interval: 1, days: [1,2,3], endDate: ...}
  parentTaskId: integer('parent_task_id'), // For recurring task instances
  nextDueDate: timestamp('next_due_date'),
  
  // Milestone properties
  isMilestone: boolean('is_milestone').default(false),
  milestoneType: varchar('milestone_type', { length: 50 }), // standalone, linked
  linkedTaskIds: text('linked_task_ids').array(),
  milestoneData: jsonb('milestone_data'),
  
  // Approval workflow properties
  isApprovalTask: boolean('is_approval_task').default(false),
  approvalData: jsonb('approval_data'), // {mode: 'any'|'all', approvers: [...], autoApprove: {...}}
  approvalStatus: varchar('approval_status', { length: 20 }), // pending, approved, rejected
  
  // Dependencies
  dependsOnTaskIds: text('depends_on_task_ids').array(),
  blockingTaskIds: text('blocking_task_ids').array(),
  
  // Attachments and files
  attachments: jsonb('attachments'), // [{id, name, url, size, type}]
  
  // Additional metadata
  customFields: jsonb('custom_fields'),
  isArchived: boolean('is_archived').default(false),
  isDeleted: boolean('is_deleted').default(false),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Task approvals table for approval workflow tracking
export const taskApprovals = pgTable('task_approvals', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').notNull(),
  approverId: integer('approver_id').notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // pending, approved, rejected
  comment: text('comment'),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// Task comments table
export const taskComments = pgTable('task_comments', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').notNull(),
  userId: integer('user_id').notNull(),
  content: text('content').notNull(),
  parentCommentId: integer('parent_comment_id'),
  attachments: jsonb('attachments'),
  isSystemComment: boolean('is_system_comment').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Task status definitions
export const taskStatuses = pgTable('task_statuses', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(),
  order: integer('order').notNull(),
  isDefault: boolean('is_default').default(false),
  isCompleted: boolean('is_completed').default(false),
  organizationId: integer('organization_id').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

// Types for insert and select operations
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export type TaskApproval = typeof taskApprovals.$inferSelect;
export type InsertTaskApproval = typeof taskApprovals.$inferInsert;

export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = typeof taskComments.$inferInsert;

export type TaskStatus = typeof taskStatuses.$inferSelect;
export type InsertTaskStatus = typeof taskStatuses.$inferInsert;

// Validation schemas using Drizzle Zod
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertProjectSchema = createInsertSchema(projects).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTaskApprovalSchema = createInsertSchema(taskApprovals).omit({ 
  id: true, 
  createdAt: true 
});

export const insertTaskCommentSchema = createInsertSchema(taskComments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTaskStatusSchema = createInsertSchema(taskStatuses).omit({ 
  id: true, 
  createdAt: true 
});

// Extended validation schemas for different task types
export const regularTaskSchema = insertTaskSchema.extend({
  taskType: z.literal('regular'),
  title: z.string().min(1, 'Title is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.string().default('todo')
});

export const recurringTaskSchema = insertTaskSchema.extend({
  taskType: z.literal('recurring'),
  isRecurring: z.literal(true),
  recurrencePattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().min(1).default(1),
    days: z.array(z.number()).optional(),
    endDate: z.string().optional(),
    time: z.string().optional()
  }),
  title: z.string().min(1, 'Title is required')
});

export const milestoneTaskSchema = insertTaskSchema.extend({
  taskType: z.literal('milestone'),
  isMilestone: z.literal(true),
  milestoneType: z.enum(['standalone', 'linked']),
  milestoneData: z.object({
    isToggle: z.boolean().default(false),
    linkedTaskIds: z.array(z.number()).optional()
  }),
  title: z.string().min(1, 'Milestone title is required'),
  dueDate: z.string().min(1, 'Due date is required')
});

export const approvalTaskSchema = insertTaskSchema.extend({
  taskType: z.literal('approval'),
  isApprovalTask: z.literal(true),
  approvalData: z.object({
    mode: z.enum(['any', 'all']).default('any'),
    approverIds: z.array(z.number()).min(1, 'At least one approver is required'),
    autoApproveEnabled: z.boolean().default(false),
    autoApproveAfter: z.string().optional()
  }),
  title: z.string().min(1, 'Task name is required'),
  dueDate: z.string().min(1, 'Due date is required')
});

// Union type for all task schemas
export const taskFormSchema = z.discriminatedUnion('taskType', [
  regularTaskSchema,
  recurringTaskSchema,
  milestoneTaskSchema,
  approvalTaskSchema
]);

export type TaskFormData = z.infer<typeof taskFormSchema>;
export type RegularTaskData = z.infer<typeof regularTaskSchema>;
export type RecurringTaskData = z.infer<typeof recurringTaskSchema>;
export type MilestoneTaskData = z.infer<typeof milestoneTaskSchema>;
export type ApprovalTaskData = z.infer<typeof approvalTaskSchema>;