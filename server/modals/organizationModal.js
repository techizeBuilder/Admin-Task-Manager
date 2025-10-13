import mongoose from "mongoose";
// Organization Schema
const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: String,
    logo: String,
    maxUsers: {
      type: Number,
      default: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      type: Object,
      default: {},
    },
    industry: String,
    size: {
      type: String,
      enum: ["small", "medium", "large"],
      default: "medium",
    },
    website: String,
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);
organizationSchema.index({ slug: 1 }, { unique: true }); // if slug must be unique
organizationSchema.index({ name: 1 }); // for faster name lookups
export const Organization = mongoose.model("Organization", organizationSchema);