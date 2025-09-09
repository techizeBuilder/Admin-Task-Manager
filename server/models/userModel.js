// User Schema
export const User = mongoose.model("User", userSchema);
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
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    role: {
      type: String,
      enum: [
      
        "super_admin",
        "org_admin",
        "manager",
        "individual",
        "employee",
  
      ],
      default: "employee",
      required: true,
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
      maxlength: 50
    },
    designation: {
      type: String,
      trim: true,
      maxlength: 50
    },
    location: {
      type: String,
      trim: true,
      maxlength: 50
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
    // Additional fields for comprehensive user management
    department: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);