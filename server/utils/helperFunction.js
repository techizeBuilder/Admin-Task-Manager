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

// 🔄 Enhanced Recurring Task Due Date Calculation Logic
// Based on TaskSetu Recurring Task Requirements
function calculateNextDueDate(recurrencePattern, currentDueDate, anchorField = 'startDate', completionDate = null) {
    if (!recurrencePattern || !currentDueDate) return null;

    const { frequency, interval = 1, daysOfWeek, dayOfMonth, endDate, maxOccurrences, skipHolidays } = recurrencePattern;
    
    // Determine the base date for calculation based on anchor field
    let baseDate = new Date(currentDueDate);
    
    // If anchor is 'completionDate' and completion date is provided, use it
    if (anchorField === 'completionDate' && completionDate) {
        baseDate = new Date(completionDate);
    }
    
    let nextDate = new Date(baseDate);

    switch (frequency) {
        case 'daily':
            // Daily: Due Date = Start Date + (Repeat Every × n days)
            nextDate.setDate(nextDate.getDate() + interval);
            break;
            
        case 'weekly':
            if (daysOfWeek && daysOfWeek.length > 0) {
                // Weekly with specific days: Find next occurrence on specified weekdays
                nextDate = getNextWeeklyOccurrence(baseDate, daysOfWeek, interval);
            } else {
                // Weekly: Due Date = Start Date + (Repeat Every × 7 × n)
                nextDate.setDate(nextDate.getDate() + (7 * interval));
            }
            break;
            
        case 'monthly':
            if (dayOfMonth) {
                // Monthly with specific day of month
                nextDate = getNextMonthlyOccurrence(baseDate, dayOfMonth, interval);
            } else {
                // Monthly: Same day-of-month as Start Date
                nextDate.setMonth(nextDate.getMonth() + interval);
                
                // Handle edge cases for month-end dates (30th/31st)
                const originalDay = baseDate.getDate();
                const daysInTargetMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
                
                if (originalDay > daysInTargetMonth) {
                    // Adjust to last day of month if original day doesn't exist
                    nextDate.setDate(daysInTargetMonth);
                } else {
                    nextDate.setDate(originalDay);
                }
            }
            break;
            
        case 'yearly':
            // Yearly: Same date + 1 year increments
            nextDate.setFullYear(nextDate.getFullYear() + interval);
            
            // Handle leap year edge case for Feb 29
            if (baseDate.getMonth() === 1 && baseDate.getDate() === 29) {
                if (!isLeapYear(nextDate.getFullYear())) {
                    nextDate.setDate(28); // Adjust to Feb 28 in non-leap years
                }
            }
            break;
            
        case 'custom':
            // Custom frequency - handle specific patterns
            nextDate = calculateCustomFrequency(recurrencePattern, baseDate);
            break;
            
        default:
            return null;
    }

    // Skip holidays if enabled (basic implementation)
    if (skipHolidays) {
        nextDate = skipHolidayDates(nextDate);
    }

    // Check if next date exceeds end conditions
    if (endDate && nextDate > new Date(endDate)) {
        return null; // Recurrence ended
    }

    return nextDate;
}

// Helper function for weekly recurrence with specific days
function getNextWeeklyOccurrence(baseDate, daysOfWeek, interval) {
    const currentDay = baseDate.getDay();
    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
    
    // Find next occurrence within current week
    for (const day of sortedDays) {
        if (day > currentDay) {
            const nextDate = new Date(baseDate);
            nextDate.setDate(baseDate.getDate() + (day - currentDay));
            return nextDate;
        }
    }
    
    // No more occurrences in current week, move to next interval
    const nextDate = new Date(baseDate);
    const daysToAdd = (7 * interval) - currentDay + sortedDays[0];
    nextDate.setDate(baseDate.getDate() + daysToAdd);
    return nextDate;
}

// Helper function for monthly recurrence with specific day
function getNextMonthlyOccurrence(baseDate, dayOfMonth, interval) {
    const nextDate = new Date(baseDate);
    nextDate.setMonth(nextDate.getMonth() + interval);
    
    // Get days in target month
    const daysInMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
    
    // Adjust if specified day doesn't exist in target month
    const targetDay = Math.min(dayOfMonth, daysInMonth);
    nextDate.setDate(targetDay);
    
    return nextDate;
}

// Helper function for custom frequency patterns
function calculateCustomFrequency(recurrencePattern, baseDate) {
    const { customPattern } = recurrencePattern;
    
    if (!customPattern) return null;
    
    // Example custom patterns:
    // "every_10_days" - every 10 days
    // "first_and_fifteenth" - 1st and 15th of each month
    // "last_day_of_month" - last day of each month
    
    const nextDate = new Date(baseDate);
    
    switch (customPattern.type) {
        case 'every_n_days':
            nextDate.setDate(nextDate.getDate() + (customPattern.days || 1));
            break;
            
        case 'first_and_fifteenth':
            const currentDay = nextDate.getDate();
            if (currentDay < 15) {
                nextDate.setDate(15);
            } else {
                nextDate.setMonth(nextDate.getMonth() + 1);
                nextDate.setDate(1);
            }
            break;
            
        case 'last_day_of_month':
            nextDate.setMonth(nextDate.getMonth() + 1);
            nextDate.setDate(0); // Sets to last day of previous month (which is target month)
            break;
            
        default:
            return null;
    }
    
    return nextDate;
}

// Helper function to check leap year
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Helper function to skip holidays (basic implementation)
function skipHolidayDates(date) {
    // Basic implementation - skip weekends
    // You can extend this with holiday calendar integration
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0) { // Sunday
        date.setDate(date.getDate() + 1); // Move to Monday
    } else if (dayOfWeek === 6) { // Saturday
        date.setDate(date.getDate() + 2); // Move to Monday
    }
    
    return date;
}

// Function to create next occurrence of recurring task
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
