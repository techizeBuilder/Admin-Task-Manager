import jwt from "jsonwebtoken";
import { storage } from "../mongodb-storage.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Role hierarchy: superadmin > org_admin > employee > individual
const ROLE_HIERARCHY = {
  superadmin: 4,
  org_admin: 3,
  employee: 2,
  individual: 1,
};

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    console.log("Auth middleware - Request URL:", req.url);
    console.log("Auth middleware - Auth header exists:", !!authHeader);
    console.log("Auth middleware - Token extracted:", !!token);

    if (!token) {
      console.log("Auth middleware - No token provided");
      return res.status(401).json({ error: "Access token required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Auth middleware - Token decoded successfully:", {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    // Get fresh user data to ensure role/organization info is current
    const user = await storage.getUser(decoded.id);
    console.log(
      "Auth middleware - User from DB:",
      user
        ? {
            id: user._id,
            email: user.email,
            role: user.role,
            organization: user.organization,
            isActive: user.isActive,
          }
        : "User not found",
    );

    if (!user || !user.isActive) {
      console.log("Auth middleware - User invalid or inactive");
      return res.status(401).json({ error: "Invalid or inactive user" });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      organizationId: user.organization || user.organizationId,
      permissions: user.permissions || [],
    };

    console.log("Auth middleware - Final user object:", req.user);
    next();
  } catch (error) {
    console.log("Auth middleware - Error:", error.message);
    return res.status(403).json({ error: "Invalid token" });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userRole = req.user.role;

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ error: "Insufficient permissions" });
  };
};

export const requireSuperAdmin = requireRole(["superadmin"]);

export const requireOrgAdminOrAbove = requireRole([
  "superadmin",
  "org_admin",
  "admin",
  "manager",
]);

export const requireEmployee = requireRole([
  "superadmin",
  "org_admin",
  "employee",
]);

// Strict middleware for org_admin only access (excludes superadmin)
export const requireOrgAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Allow 'org_admin', 'admin', and 'manager' roles for organization management
  if (req.user.role !== "org_admin" && req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({
      error:
        "Access denied. This feature is only available to organization administrators.",
    });
  }

  next();
};

// New middleware for organization management features
export const requireOrganizationManagement = (req, res, next) => {
  // Explicitly block individual users from organization management
  if (req.user && req.user.role === "individual") {
    return res
      .status(403)
      .json({
        error:
          "Individual users cannot access organization management features",
      });
  }

  // Allow superadmin, org_admin, admin, and manager roles
  return requireRole(["superadmin", "org_admin", "admin", "manager"])(req, res, next);
};

export const requireOrganizationAccess = async (req, res, next) => {
  try {
    const { organizationId } = req.params;
    const user = req.user;

    // Individual users should not access organization features
    if (user.role === "individual") {
      return res
        .status(403)
        .json({
          error: "Individual users cannot access organization features",
        });
    }

    // Super admins have access to all organizations
    if (user.role === "superadmin") {
      return next();
    }

    // Admins and employees can only access their own organization
    if (
      user.organizationId &&
      user.organizationId.toString() === organizationId
    ) {
      return next();
    }

    return res
      .status(403)
      .json({ error: "Access denied to this organization" });
  } catch (error) {
    return res.status(500).json({ error: "Authorization check failed" });
  }
};

export const getRedirectRoute = (role) => {
  switch (role) {
    case "superadmin":
      return "/super-admin";
    case "super_admin":
      return "/super-admin";
    case "admin":
      return "/dashboard";
    case "employee":
      return "/dashboard";
    default:
      return "/dashboard";
  }
};
