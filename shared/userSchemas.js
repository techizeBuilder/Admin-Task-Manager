import { z } from "zod";

// Available roles
export const USER_ROLES = ['Regular User', 'Manager', 'Company Admin'];

// Available license types
export const LICENSE_TYPES = ['Explore (Free)', 'Plan', 'Execute', 'Optimize'];

// User invitation schema
export const userInvitationSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(USER_ROLES, {
    required_error: "Please select a valid role",
    invalid_type_error: "Invalid role selected"
  }),
  licenseId: z.enum(LICENSE_TYPES, {
    required_error: "License selection is required",
    invalid_type_error: "Invalid license type selected"
  }),
  department: z.string().max(50, "Department must be less than 50 characters").optional(),
  designation: z.string().max(50, "Designation must be less than 50 characters").optional(),
  location: z.string().max(50, "Location must be less than 50 characters").optional()
});

// User response schema (what we get back from the server)
export const userResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.string(),
  status: z.string(),
  licenseId: z.string(),
  department: z.string().optional(),
  designation: z.string().optional(),
  location: z.string().optional(),
  isActive: z.boolean(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});
