import mongoose from "mongoose";

const TaskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    taskType: {
      type: String,
      enum: ["regular", "recurring", "milestone", "approval"],
      default: "regular",
      required: true,
    },
    mainTaskType: {
      type: String,
      enum: ["regular", "recurring", "milestone", "approval"],
      default: "regular",
    },
    createdByRole: {
      type: [String],
      enum: ["super_admin", "org_admin", "manager", "individual", "employee"],
      default: ["employee"],
      required: true,
    },
    taskTypeAdvanced: {
      type: String,
      enum: ["simple", "complex"],
      default: "simple",
    },
    description: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["OPEN", "INPROGRESS", "DONE", "ONHOLD", "CANCELLED"],
      default: "OPEN",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    visibility: {
      type: String,
      enum: ["private", "public", "team"],
      default: "private",
    },
    tags: [
      {
        type: String,
      },
    ],
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    attachments: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId()
        },
        originalName: String,
        filename: String,
        path: String,
        size: Number,
        mimetype: String,
        url: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        uploadedAt: {
          type: Date,
          default: Date.now
        },
        version: {
          type: Number,
          default: 1
        },
        deleted: {
          type: Boolean,
          default: false
        },
        deletedAt: Date,
        deletedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        // Legacy fields for backward compatibility
        id: String,
        name: String,
        type: String,
      },
    ],
    // External links
    links: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId()
        },
        url: {
          type: String,
          required: true
        },
        title: String,
        description: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        createdAt: {
          type: Date,
          default: Date.now
        },
        deleted: {
          type: Boolean,
          default: false
        },
        deletedAt: Date,
        deletedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      }
    ],
    // Deleted attachments for audit trail
    deletedAttachments: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        originalName: String,
        filename: String,
        path: String,
        size: Number,
        mimetype: String,
        url: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        uploadedAt: Date,
        deletedAt: Date,
        deletedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      }
    ],
    customFields: {
      type: Object,
      default: {},
    },
    // Comments and activity
    comments: [{
      _id: {
        type: String, // Changed to String to match your controller implementation
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      content: {
        type: String, // Added for backward compatibility
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      parentId: {
        type: String, // Reference to parent comment _id for replies
        default: null,
      },
      mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }],
      attachments: [{
        id: String,
        name: String,
        filename: String,
        size: Number,
        type: String,
        url: String,
      }],
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      isEdited: {
        type: Boolean,
        default: false,
      },
    }],
    referenceProcess: {
      type: String,
      default: null,
    },
    customForm: {
      type: String,
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Recurring task fields
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
      },
      interval: {
        type: Number,
        default: 1,
      },
      daysOfWeek: [{
        type: Number, // 0 = Sunday, 1 = Monday, etc.
      }],
      dayOfMonth: {
        type: Number,
      },
      endDate: {
        type: Date,
      },
      maxOccurrences: {
        type: Number,
      },
    },
    nextDueDate: {
      type: Date,
    },
    // Milestone task fields
    isMilestone: {
      type: Boolean,
      default: false,
    },
    milestoneType: {
      type: String,
      enum: ["standalone", "linked", "project"],
      default: "standalone",
    },
    milestoneData: {
      linkedTaskIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      }],
      completionCriteria: [String],
      deliverables: [String],
      stakeholders: [String],
    },
    linkedTasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    }],
    // Approval task fields
    isApprovalTask: {
      type: Boolean,
      default: false,
    },
    approvalMode: {
      type: String,
      enum: ["any", "all"],
      default: "any",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    approvalDecisions: [{
      approverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      decision: {
        type: String,
        enum: ["approve", "reject"],
      },
      comment: String,
      decidedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    autoApproveEnabled: {
      type: Boolean,
      default: false,
    },
    autoApproveAfter: {
      type: Date,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    
    // Snooze Task Fields
    isSnooze: {
      type: Boolean,
      default: false,
    },
    snoozeUntil: {
      type: Date,
      default: null,
    },
    snoozeReason: {
      type: String,
      default: null,
    },
    snoozedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    snoozedAt: {
      type: Date,
      default: null,
    },
    
    // Risk Task Fields
    isRisk: {
      type: Boolean,
      default: false,
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: null,
    },
    riskReason: {
      type: String,
      default: null,
    },
    riskMarkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    riskMarkedAt: {
      type: Date,
      default: null,
    },
    
    // Task Completion Fields
    completedDate: {
      type: Date,
      default: null,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    completionNotes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
