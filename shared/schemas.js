import { z } from "zod";

// Task Schemas
export const taskSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  description: z.string().max(2000, "Description must be under 2000 characters").optional(),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "Please select a priority"
  }),
  status: z.string().optional(),
  statusId: z.string().optional(),
  dueDate: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  assignedTo: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  estimatedHours: z.number().min(0).max(1000).optional(),
  actualHours: z.number().min(0).optional(),
  createdBy: z.string().optional(),
  collaborators: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
  type: z.enum(["regular", "approval", "milestone", "recurring"]).optional(),
  // Approval task specific fields
  approvers: z.array(z.string()).optional(),
  approvalMode: z.enum(["any_one", "all_must_approve", "sequential"]).optional(),
  approvalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  // Recurring task specific fields
  recurringPattern: z.object({
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
    dayOfWeek: z.string().optional(),
    dayOfMonth: z.number().optional(),
    time: z.string().optional()
  }).optional()
});

export const createTaskSchema = taskSchema.omit({ id: true, createdAt: true, updatedAt: true });

// User Schemas
export const userSchema = z.object({
  id: z.string(),
  _id: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.enum(["individual", "member", "admin", "org_admin", "superadmin"]),
  avatar: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  department: z.string().optional(),
  position: z.string().optional()
});

// Project Schemas
export const projectSchema = z.object({
  id: z.string(),
  _id: z.string().optional(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]),
  createdAt: z.string().optional(),
  managerId: z.string(),
  teamMembers: z.array(z.string()).optional()
});

// Task Status Schemas
export const taskStatusSchema = z.object({
  id: z.string(),
  _id: z.string().optional(),
  name: z.string().min(1, "Status name is required"),
  slug: z.string(),
  color: z.string(),
  order: z.number()
});

// Comment Schemas
export const commentSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  taskId: z.string(),
  authorId: z.string(),
  content: z.string().min(1, "Comment content is required"),
  createdAt: z.string().optional(),
  mentions: z.array(z.string()).optional()
});

export const createCommentSchema = commentSchema.omit({ id: true, createdAt: true });

// Audit Log Schemas
export const auditLogSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  taskId: z.string(),
  userId: z.string(),
  action: z.enum([
    "created", "updated", "deleted", "assigned", "unassigned", 
    "status_changed", "commented", "tagged", "due_date_changed", "priority_changed"
  ]),
  description: z.string(),
  timestamp: z.string().optional(),
  oldValue: z.string().nullable().optional(),
  newValue: z.string().nullable().optional()
});

// API Response Schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional()
});

// Filter Schemas
export const taskFiltersSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  search: z.string().optional(),
  dueDate: z.string().optional(),
  createdBy: z.string().optional()
});

// Dashboard Data Schemas
export const dashboardStatsSchema = z.object({
  totalTasks: z.number(),
  completedTasks: z.number(),
  inProgressTasks: z.number(),
  overdueTasks: z.number(),
  upcomingDeadlines: z.number(),
  recentActivity: z.array(z.any()),
  tasksByPriority: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number(),
    urgent: z.number()
  }),
  tasksByStatus: z.array(z.object({
    status: z.string(),
    count: z.number(),
    color: z.string()
  }))
});

// Form field validation helpers
export const validateTaskForm = (data) => {
  try {
    return createTaskSchema.parse(data);
  } catch (error) {
    throw new Error(error.errors.map(err => err.message).join(", "));
  }
};

export const validateCommentForm = (data) => {
  try {
    return createCommentSchema.parse(data);
  } catch (error) {
    throw new Error(error.errors.map(err => err.message).join(", "));
  }
};