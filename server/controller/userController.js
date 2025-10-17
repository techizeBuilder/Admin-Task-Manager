import { User } from "../modals/userModal.js";
import { storage } from "../mongodb-storage.js";
import { emailService } from "../services/emailService.js";
import Task from "../modals/taskModal.js"; // <-- added
/**
 * Remove/Delete user
 * Only org_admin can remove user (enforced in route middleware)
 */
export const removeUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized - user not authenticated",
      });
    }

    // Find the user first to check if exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Check if user belongs to the same organization as the admin
    if (
      user.organization_id.toString() !== req.user.organizationId.toString()
    ) {
      return res.status(403).json({
        status: 403,
        message: "Cannot remove user from different organization",
      });
    }

    // Prevent removing primary admin
    if (user.isPrimaryAdmin) {
      return res.status(400).json({
        status: 400,
        message: "Cannot remove primary admin",
      });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      status: 200,
      message: "User removed successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to remove user",
      error: err.message,
    });
  }
};

/**
 * Get organization statistics
 * Returns user stats by status
 */
export const getOrgStats = async (req, res) => {
  try {
    const { orgId } = req.params;

    // Fetch all users for the organization
    const allUsers = await User.find({
      organization_id: orgId,
     
    })
      .select("status")
      .lean();

    const user_stats = {
      total: allUsers.length - allUsers.filter((u) => u.status === "invited").length,
      active: allUsers.filter((u) => u.status === "active").length,
      pending: allUsers.filter((u) => u.status === "invited").length,
      inactive: allUsers.filter((u) => u.status === "inactive").length,
    };

    res.json({
      user_stats,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * Get users by organization

 */
export const getUsersByOrg = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { page = 1, search = "" } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Common base query (always exclude primary admin)
    const baseQuery = {
      organization_id: orgId,
     
    };
    console.log("Base Query:", baseQuery);
    // If searching, extend with OR conditions
    const searchQuery = search
      ? {
          ...baseQuery,
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            {department: { $regex: search, $options: "i" } },
            {designation: { $regex: search, $options: "i" } },
          ],
        }
      : baseQuery;

    // Count total users for pagination
    const total = await User.countDocuments(searchQuery);

    // Fetch paginated users
    const users = await User.find(searchQuery)
      .select(
        "firstName lastName role department designation location assignedTasks completedTasks status lastLoginAt isPrimaryAdmin email createdAt"
      )
      .skip(skip)
      .limit(limit)
      .lean();

    // Compute assigned/completed counts for each user on this page
    const counts = await Promise.all(
      users.map(async (u) => {
        const userId = u._id;
        const [assignedCount, completedCount] = await Promise.all([
          Task.countDocuments({ assignedTo: userId, isDeleted: { $ne: true } }),
          Task.countDocuments({
            assignedTo: userId,
            status: "completed",
            isDeleted: { $ne: true },
          }),
        ]);
        return {
          id: userId.toString(),
          assignedTasks: assignedCount,
          completedTasks: completedCount,
        };
      })
    );
    const countsMap = counts.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});

    const formattedUsers = users.map((u) => ({
      ...u,
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      lastLoginAt: u.lastLoginAt || null,
      // override with live counts computed from tasks
      assignedTasks: countsMap[u._id.toString()]?.assignedTasks ?? 0,
      completedTasks: countsMap[u._id.toString()]?.completedTasks ?? 0,
    }));

    res.json({
      users: formattedUsers,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
/**
 * Update user details
 * Only org_admin can update user (enforced in route middleware)
 * Fields that can be updated: firstName, lastName, role, designation, department, location
 */
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, role, designation, department, location } =
      req.body;

    // Find and update user
    const updated = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, role, designation, department, location },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Successfully updated",
      data: updated, // optional: send updated user back
    });
  } catch (err) {
    return res.status(400).json({
      status: 400,
      message: "Update failed",
      error: err.message,
    });
  }
};

/**
 * Update user status (active/inactive)
 * If activating and last login > 90 days, send invitation email
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    if (!userId || !["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid userId or status" });
    }

    // Use storage utility to get user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if status is changing
    if (user.status === status) {
      return res
        .status(200)
        .json({ message: "Status already set", data: user });
    }

    // Update status
    await storage.updateUser(userId, { status });

    let invitationSent = false;

    // If activating and last login > 90 days, send reset email
    if (
      status === "active" &&
      (!user.lastLoginAt ||
        (new Date() - new Date(user.lastLoginAt)) / (1000 * 60 * 60 * 24) > 90)
    ) {
      // Generate reset token and expiry
      const resetToken = storage.generatePasswordResetToken();
      const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Save token to user
      await storage.updateUser(userId, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpiry,
      });

      // Send reset email
      await emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.firstName || user.lastName || "User"
      );
      invitationSent = true;
    }

    // Get updated user for response
    const updatedUser = await storage.getUser(userId);

    return res.status(200).json({
      message: "Status updated successfully",
      invitationSent,
      data: updatedUser,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * Send invitation to user
 * Generates a password reset token and sends invite email
 */
export const sendInvite = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.user) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized - user not authenticated",
      });
    }
    if (!userId) {
      return res.status(400).json({
        status: 400,
        message: "userId is required",
      });
    }

    const user = await User.findById(userId).select(
      "email firstName lastName organization_id status role invitedBy"
    );
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    if (
      user.organization_id.toString() !== req.user.organizationId.toString()
    ) {
      return res.status(403).json({
        status: 403,
        message: "Cannot invite user from different organization",
      });
    }

  // Generate invitation token (1 minute expiry)
  // Note: store in inviteToken/inviteTokenExpiry so validation works
  const token = storage.generatePasswordResetToken();
  const expires = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

    // Mark as invited if not active
    const nextStatus = user.status === "active" ? "active" : "invited";

    // Resolve inviter info
    const inviterUserId = req.user.userId || req.user.id || req.user._id;
    let inviterName = req.user.email || "Admin";
    let inviterIdToSave = inviterUserId;
    if (inviterUserId) {
      const inviter = await User.findById(inviterUserId).select(
        "firstName lastName email"
      );
      if (inviter) {
        inviterName =
          `${inviter.firstName || ""} ${inviter.lastName || ""}`.trim() ||
          inviter.email ||
          inviterName;
      }
    }

    // Resolve organization name from organization_id (fallback to id if model not available)
    let organizationName = String(user.organization_id);
    try {
      const { Organization } = await import("../modals/organizationModal.js");
      if (Organization) {
        const org = await Organization.findById(user.organization_id).select(
          "name"
        );
        if (org?.name) organizationName = org.name;
      }
    } catch {
      // Fallback already set to organization_id string
    }

    // Roles
    const roles = Array.isArray(user.role)
      ? user.role
      : user.role
      ? [user.role]
      : [];

    // Recipient display name
    const displayName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.email ||
      "User";

    // Persist invite token/expiry/status and invitedBy
    await User.findByIdAndUpdate(userId, {
      inviteToken: token,
      inviteTokenExpiry: expires,
      status: nextStatus,
      invitedBy: inviterIdToSave || user.invitedBy || null,
      invitedAt: new Date(),
    });

    // Send invite email with extended parameters
    await emailService.sendInvitationEmail(
      user.email,
      token,                 // inviteToken
      organizationName,      // organizationName
      roles,                 // roles
      inviterName,           // invitedByName
      displayName            // name
    );

    return res.status(200).json({
      status: 200,
      message: "Invitation sent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Failed to send invitation",
      error: err.message,
    });
  }
};
