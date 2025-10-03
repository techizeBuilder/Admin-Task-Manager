import mongoose from "mongoose";




// Project Schema
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "archived", "completed"],
      default: "active",
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    settings: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Task Status Schema
const taskStatusSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#6B7280",
    },
    order: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Task Schema
const taskSchema = new mongoose.Schema(
  {
    isDeleted: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: false,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["open", "todo", "in-progress", "review", "completed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical", "urgent"],
      default: "medium",
    },
    dueDate: Date,
    completedAt: Date,
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metadata: {
      type: Object,
      default: {},
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringConfig: Object,
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    order: {
      type: Number,
      default: 0,
    },
    estimatedHours: Number,
    actualHours: Number,
    // Advanced task fields for comprehensive task management
    taskType: {
      type: String,
      enum: ["regular", "recurring", "milestone", "approval", "subtask"],
      default: "regular",
    },
    mainTaskType: {
      type: String,
      enum: ["regular", "recurring", "milestone", "approval", "subtask"],
      default: "regular",
    }, // Clear task category identification
    // Subtask specific fields
    parentTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: false,
      index: true
    },
    isSubtask: {
      type: Boolean,
      default: false
    },
    createdByRole: {
      type: [String],
      enum: ["super_admin", "org_admin", "manager", "individual", "employee"],
      default: ["employee"],
      required: true,
    },
    taskTypeAdvanced: {
      type: String,
      enum: ["simple", "complex", "recurring", "milestone", "approval"],
      default: "simple",
    }, // Task complexity classification
    category: { type: String, default: "" },
    visibility: {
      type: String,
      enum: ["private", "team", "organization"],
      default: "private",
    },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dependencies: [{ type: String }], // Store as strings for now, can be converted to ObjectIds later when tasks exist
    attachments: [
      {
        id: { type: String },
        name: { type: String },
        filename: { type: String },
        size: { type: Number },
        type: { type: String },
        url: { type: String },
      },
    ],
    customFields: { type: Map, of: mongoose.Schema.Types.Mixed },

    // Comments array for subtasks and tasks
    comments: [{
      _id: { type: String, required: true },
      text: { type: String, required: true },
      content: { type: String }, // Added for backward compatibility
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      parentId: { type: String, default: null }, // Added parentId field for reply nesting
      mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      isEdited: { type: Boolean, default: false }
    }],

    // Advanced options fields - always available regardless of task type
    referenceProcess: { type: String, default: null }, // Links to existing process/workflow
    customForm: { type: String, default: null }, // Links to predefined form for data collection

    // Milestone fields
    isMilestone: { type: Boolean, default: false },
    milestoneType: {
      type: String,
      enum: ["standalone", "project"],
      default: "standalone",
    },
    milestoneData: {
      type: { type: String },
      linkedTaskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
      completionCriteria: [{ type: String }],
    },
    linkedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],

    // Approval task fields
    isApprovalTask: { type: Boolean, default: false },
    approvalMode: {
      type: String,
      enum: ["any", "all", "majority"],
      default: "any",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    approvalDecisions: [
      {
        approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        decision: { type: String, enum: ["approved", "rejected"] },
        comment: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    autoApproveEnabled: { type: Boolean, default: false },
    autoApproveAfter: { type: Number }, // hours
    
    // Snooze Task Fields
    isSnooze: { type: Boolean, default: false },
    snoozeUntil: { type: Date, default: null },
    snoozeReason: { type: String, default: null },
    snoozedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    snoozedAt: { type: Date, default: null },
    
    // Risk Task Fields
    isRisk: { type: Boolean, default: false },
    riskLevel: { type: String, enum: ["low", "medium", "high"], default: null },
    riskReason: { type: String, default: null },
    riskMarkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    riskMarkedAt: { type: Date, default: null },
    
    // Task Completion Fields
    completedDate: { type: Date, default: null },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    completionNotes: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

// Task Comment Schema
const taskCommentSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
        mimeType: String,
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
  },
  {
    timestamps: true,
  }
);

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    relatedType: {
      type: String, // e.g., 'task', 'project', 'user'
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);
// Task Assignment Schema
const taskAssignmentSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
});

// Task Audit Log Schema
const taskAuditLogSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    oldValues: Object,
    newValues: Object,
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Notification Schema
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: String,
    data: {
      type: Object,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    sentViaEmail: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
  },
  {
    timestamps: true,
  }
);

// Usage Tracking Schema
const usageTrackingSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
    tasksCreated: {
      type: Number,
      default: 0,
    },
    tasksCompleted: {
      type: Number,
      default: 0,
    },
    commentsPosted: {
      type: Number,
      default: 0,
    },
    storageUsed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes


taskSchema.index({ organization: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1 });
taskCommentSchema.index({ task: 1 });
notificationSchema.index({ user: 1, isRead: 1 });
usageTrackingSchema.index({ organization: 1, month: 1 }, { unique: true });

// Export models
// Form Schema
const formSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fields: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
          enum: [
            "text",
            "date",
            "dropdown",
            "multiselect",
            "number",
            "textarea",
            "email",
            "phone",
          ],
        },
        label: {
          type: String,
          required: true,
        },
        placeholder: String,
        required: {
          type: Boolean,
          default: false,
        },
        options: [String], // For dropdown and multiselect
        validation: {
          min: Number,
          max: Number,
          pattern: String,
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    accessLink: {
      type: String,
      unique: true,
      sparse: true,
    },
    settings: {
      allowAnonymous: {
        type: Boolean,
        default: true,
      },
      maxSubmissions: Number,
      submitMessage: {
        type: String,
        default: "Thank you for your submission!",
      },
      redirectUrl: String,
    },
  },
  {
    timestamps: true,
  }
);

// Process Flow Schema
const processFlowSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    steps: [
      {
        id: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: String,
        type: {
          type: String,
          required: true,
          enum: ["task", "approval", "notification", "conditional"],
        },
        assignedTo: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        ],
        dueInDays: Number,
        conditions: [
          {
            field: String,
            operator: {
              type: String,
              enum: [
                "equals",
                "not_equals",
                "contains",
                "greater_than",
                "less_than",
              ],
            },
            value: String,
          },
        ],
        nextSteps: [String], // Array of step IDs
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    flowType: {
      type: String,
      required: true,
      enum: ["sequential", "parallel", "conditional"],
      default: "sequential",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Form Response Schema
const formResponseSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
    },
    processFlow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcessFlow",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    submitterEmail: String, // For anonymous submissions
    responses: [
      {
        fieldId: {
          type: String,
          required: true,
        },
        fieldLabel: String,
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    status: {
      type: String,
      enum: ["submitted", "in_progress", "completed", "rejected"],
      default: "submitted",
    },
    currentStep: String, // Current step ID in process flow
    stepHistory: [
      {
        stepId: String,
        stepTitle: String,
        status: {
          type: String,
          enum: ["pending", "completed", "rejected", "skipped"],
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        completedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comments: String,
        completedAt: Date,
      },
    ],
    metadata: {
      ipAddress: String,
      userAgent: String,
      referrer: String,
    },
  },
  {
    timestamps: true,
  }
);

// Process Instance Schema (for tracking workflow execution)
const processInstanceSchema = new mongoose.Schema(
  {
    processFlow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcessFlow",
      required: true,
    },
    formResponse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FormResponse",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "terminated", "paused"],
      default: "active",
    },
    currentSteps: [String], // Current active step IDs
    completedSteps: [String], // Completed step IDs
    variables: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);





export const Project = mongoose.model("Project", projectSchema);
export const TaskStatus = mongoose.model("TaskStatus", taskStatusSchema);
export const Task = mongoose.model("Task", taskSchema);
export const Activity = mongoose.model("Activity", activitySchema);
export const TaskComment = mongoose.model("TaskComment", taskCommentSchema);
export const TaskAssignment = mongoose.model(
  "TaskAssignment",
  taskAssignmentSchema
);
export const TaskAuditLog = mongoose.model("TaskAuditLog", taskAuditLogSchema);
export const Notification = mongoose.model("Notification", notificationSchema);
export const UsageTracking = mongoose.model(
  "UsageTracking",
  usageTrackingSchema
);
export const Form = mongoose.model("Form", formSchema);
export const ProcessFlow = mongoose.model("ProcessFlow", processFlowSchema);
export const FormResponse = mongoose.model("FormResponse", formResponseSchema);
export const ProcessInstance = mongoose.model(
  "ProcessInstance",
  processInstanceSchema
);

