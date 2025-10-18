import Task from "../modals/taskModal.js";

export const getTaskCounts = async (req, res) => {
    try {
        const { user_id, user_type } = req.query;
        
        if (!user_id || !user_type) {
            return res.status(400).json({
                success: false,
                message: "User ID and User Type are required"
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Base query conditions
        const baseQuery = {
            isDeleted: false
        };

        // Add user-specific conditions based on user type
        switch (user_type) {
            case "org_admin":
                // Org admin can see all tasks in their organization
                // No additional filter needed
                break;
            case "manager":
                baseQuery.$or = [
                    { assignedTo: user_id },
                    { createdBy: user_id },
                    { 'collaborators': user_id }
                ];
                break;
            case "individual":
            case "employee":
                // Both individual and employee can only see tasks assigned to them or where they are collaborators
                baseQuery.$or = [
                    { assignedTo: user_id },
                    { 'collaborators': user_id }
                ];
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid user type"
                });
        }

        // Regular tasks count
        const regularTasksCount = await Task.countDocuments({
            ...baseQuery,
            taskType: "regular"
        });

        // Recurring tasks count
        const recurringTasksCount = await Task.countDocuments({
            ...baseQuery,
            taskType: "recurring"
        });

        // Quick tasks count
        const quickTasksCount = await Task.countDocuments({
            ...baseQuery,
            taskType: "regular",
            taskTypeAdvanced: "simple"
        });

        // Milestone tasks count
        const milestoneTasksCount = await Task.countDocuments({
            ...baseQuery,
            taskType: "milestone"
        });

        // Approval tasks count
        const approvalTasksCount = await Task.countDocuments({
            ...baseQuery,
            taskType: "approval"
        });

        // Tasks completed today
        const completedTodayCount = await Task.countDocuments({
            ...baseQuery,
            completedDate: {
                $gte: today,
                $lt: tomorrow
            },
            status: "completed"
        });

        // Tasks due in future
        const beforeDueDateCount = await Task.countDocuments({
            ...baseQuery,
            dueDate: { $gt: today },
            status: { $ne: "completed" }
        });

        // Past due date tasks
        const pastDueDateCount = await Task.countDocuments({
            ...baseQuery,
            dueDate: { $lt: today },
            status: { $ne: "completed" }
        });

        res.status(200).json({
            success: true,
            data: {
                regularTasksCount,
                recurringTasksCount,
                quickTasksCount,
                milestoneTasksCount,
                approvalTasksCount,
                completedTodayCount,
                beforeDueDateCount,
                pastDueDateCount,
                userDetails: {
                    userId: user_id,
                    userType: user_type,
                    accessLevel: user_type === "org_admin" ? "full" : "limited"
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching task counts",
            error: error.message
        });
    }
};
