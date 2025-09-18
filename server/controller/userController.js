import { User } from "../models.js";

export const getUsersByOrg = async (req, res) => {
  try {
    const { orgId } = req.params;
    const { page = 1, search = "" } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = {
      organization_id: orgId,
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };

    // Count total users for pagination
    const total = await User.countDocuments(
      search ? searchQuery : { organization_id: orgId }
    );

    // Fetch users
    const users = await User.find(
      search ? searchQuery : { organization_id: orgId }
    )
      .select(
        "firstName lastName role department designation location status lastLoginAt assignedTasks completedTasks email createdAt"
      )
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedUsers = users.map((u) => ({
      ...u,
      firstName: u.firstName || "", // force empty string if missing
      lastName: u.lastName || "", // force empty string if missing

      lastLoginAt: u.lastLoginAt || null, // force null if missing
    }));
 const allUsers = await User.find({ organization_id: orgId }).select("status").lean();
    const user_stats = {
      total: allUsers.length,
      active: allUsers.filter(u => u.status === "active").length,
      pending: allUsers.filter(u => u.status === "invited").length,
      inactive: allUsers.filter(u => u.status === "inactive").length,
    };
    res.json({
      users: formattedUsers,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      user_stats,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
