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

function getTaskTypeLabel(taskType) {
    const labels = {
        regular: 'Regular task',
        recurring: 'Recurring task',
        milestone: 'Milestone',
        approval: 'Approval task'
    };
    return labels[taskType] || 'Task';
}

export { calculateNextDueDate, getTaskTypeLabel, getTaskOrganizationId };
