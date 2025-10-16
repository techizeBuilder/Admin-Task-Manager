// utils/helperfunction.js

// Utility function to extract organization ID from task
function getTaskOrganizationId(taskOrganization) {
    if (!taskOrganization) return null;
    // Handle populated organization object
    if (taskOrganization._id) {
        return taskOrganization._id.toString();
    }
    // Handle direct ObjectId
    return taskOrganization.toString();
}

function calculateNextDueDate(recurrencePattern, currentDueDate) {
    if (!recurrencePattern || !currentDueDate) return null;

    const date = new Date(currentDueDate);

    switch (recurrencePattern.frequency) {
        case 'daily':
            date.setDate(date.getDate() + (recurrencePattern.interval || 1));
            break;
        case 'weekly':
            date.setDate(date.getDate() + (7 * (recurrencePattern.interval || 1)));
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + (recurrencePattern.interval || 1));
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + (recurrencePattern.interval || 1));
            break;
    }

    return date;
}

function createNextRecurringOccurrence(parentTask, completionDate = null) {
    if (!parentTask.isRecurring || !parentTask.recurrencePattern) {
        return null;
    }

    const nextDueDate = calculateNextDueDate(
        parentTask.recurrencePattern,
        parentTask.dueDate,
        parentTask.recurrencePattern.anchorField || 'startDate',
        completionDate
    );

    if (!nextDueDate) {
        return null; // Recurrence has ended
    }

    // Create new task occurrence with same structure
    const newOccurrence = {
        ...parentTask,
        _id: undefined, // Will get new ID
        dueDate: nextDueDate,
        status: 'open', // Each occurrence starts fresh
        completedDate: null,
        completedBy: null,
        comments: [], // Fresh comment/feed for each occurrence
        createdAt: new Date(),
        updatedAt: new Date(),
        // Maintain recurrence pattern for future occurrences
        nextDueDate: calculateNextDueDate(
            parentTask.recurrencePattern,
            nextDueDate,
            parentTask.recurrencePattern.anchorField || 'startDate'
        )
    };

    return newOccurrence;
}

function getTaskTypeLabel(taskType) {
    const labels = {
        regular: 'Regular task',
        recurring: 'Recurring task',
        milestone: 'Milestone',
        approval: 'Approval task'
    };
    return labels[taskType] || 'Task';
}

export { calculateNextDueDate, getTaskTypeLabel, getTaskOrganizationId, createNextRecurringOccurrence };
