import mongoose from "mongoose";

const TaskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    taskType: {
      type: String,
      enum: ["Simple", "Recurring", "Milestone", "Approval"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    assignees: [
      {
        type: String,
        required: true,
      },
    ],
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "To Do",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    attachments: [
      {
        type: String,
      },
    ],
    referenceProcess: {
      type: String,
    },
    customForm: {
      type: String,
    },
    dependencies: [
      {
        type: String,
      },
    ],
    recurrencePattern: {
      frequency: {
        type: String,
        enum: ["Daily", "Weekly", "Monthly"],
      },
      repeatEvery: {
        type: Number,
      },
      time: {
        type: String,
      },
      repeatOnDays: [
        {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
      ],
      startDate: {
        type: Date,
      },
      endCondition: {
        type: String,
        enum: ["Never", "End After", "End On"],
      },
    },
    milestoneDetails: {
      milestoneTitle: {
        type: String,
      },
      milestoneToggle: {
        type: Boolean,
      },
      milestoneType: {
        type: String,
        enum: ["Standalone", "Linked"],
      },
      linkedTasks: [
        {
          type: String,
        },
      ],
      visibility: {
        type: String,
        enum: ["Private", "Public"],
      },
      collaborators: [
        {
          type: String,
        },
      ],
    },
    approvalDetails: {
      approvers: [
        {
          type: String,
        },
      ],
      approvalMode: {
        type: String,
        enum: ["Any One", "All"],
      },
      autoApproval: {
        type: Boolean,
      },
      justification: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("TaskTitle", TaskSchema);
