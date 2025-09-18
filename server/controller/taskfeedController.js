import Task from "../modals/taskModal.js";

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userOrganizationId = req.user.organizationId;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Completed Today
        const completedToday = await Task.countDocuments({
            $or: [
                { createdBy: userId },
                { assignedTo: userId },
                { collaborators: userId }
            ],
            organization: userOrganizationId,
            status: "completed",
            updatedAt: {
                $gte: today,
                $lt: tomorrow
            },
            isDeleted: false
        });

        // Before Due Date (tasks due in future)
        const beforeDueDate = await Task.countDocuments({
            $or: [
                { createdBy: userId },
                { assignedTo: userId },
                { collaborators: userId }
            ],
            organization: userOrganizationId,
            dueDate: { $gt: new Date() },
            status: { $nin: ["completed", "cancelled"] },
            isDeleted: false
        });

        // Milestones
        const milestones = await Task.countDocuments({
            $or: [
                { createdBy: userId },
                { assignedTo: userId },
                { collaborators: userId }
            ],
            organization: userOrganizationId,
            taskType: "milestone",
            isDeleted: false
        });

        // Collaborator tasks (tasks where user is collaborator)
        const collaborator = await Task.countDocuments({
            collaborators: userId,
            organization: userOrganizationId,
            status: { $nin: ["completed", "cancelled"] },
            isDeleted: false
        });

        // Past Due
        const pastDue = await Task.countDocuments({
            $or: [
                { createdBy: userId },
                { assignedTo: userId },
                { collaborators: userId }
            ],
            organization: userOrganizationId,
            dueDate: { $lt: new Date() },
            status: { $nin: ["completed", "cancelled"] },
            isDeleted: false
        });

        // Approvals (pending approval tasks)
        const approvals = await Task.countDocuments({
            $or: [
                { approvers: userId },
                { createdBy: userId, taskType: "approval" }
            ],
            organization: userOrganizationId,
            taskType: "approval",
            approvalStatus: "pending",
            isDeleted: false
        });

        const stats = {
            completedToday,
            beforeDueDate,
            milestones,
            collaborator,
            pastDue,
            approvals
        };

        res.status(200).json({
            success: true,
            message: "Dashboard stats retrieved successfully",
            data: stats
        });

    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard stats",
            error: error.message
        });
    }
};

