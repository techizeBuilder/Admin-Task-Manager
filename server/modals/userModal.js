import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      required: function () {
        return this.status === "active";
      },
    },
    lastName: {
      type: String,
      trim: true,
      required: function () {
        return this.status === "active";
      },
    },
    profileImageUrl: String,
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    passwordHash: {
      type: String,
      required: function () {
        return this.status === "active";
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    role: {
      type: [String],
      enum: ["super_admin", "org_admin", "manager", "individual", "employee"],
      default: ["employee"],
      required: true,
    },
    isPrimaryAdmin: {
      type: Boolean,
      default: false,
    },
    permissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "invited", "active", "inactive", "suspended"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    department: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    designation: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    inviteToken: String,
    inviteTokenExpiry: Date,
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    invitedAt: Date,
    lastLoginAt: Date,
    preferences: {
      type: Object,
      default: {},
    },

    assignedTasks: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    // Legacy fields for backward compatibility
    roles: {
      type: [String],
      default: [],
    },
    
    // Google Calendar integration
    googleCalendarTokens: {
      access_token: String,
      refresh_token: String,
      scope: String,
      token_type: String,
      expiry_date: Number,
    },
    googleCalendarConnected: {
      type: Boolean,
      default: false,
    },
    googleCalendarEmail: String,
  },
  {
    timestamps: true,
  }
);
userSchema.index({ email: 1 });
userSchema.index({ organization_id: 1 });

// User Schema
export const User = mongoose.model("User", userSchema);
