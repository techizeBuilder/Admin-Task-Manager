# 🔄 Recurring Task Implementation Guide

## Overview
Enhanced Recurring Task system के साथ comprehensive due date calculation logic, auto-generation, और manual controls.

## 🎯 Features Implemented

### 1. Enhanced Due Date Calculation
- **Daily Recurring**: `Due Date = Start Date + (Repeat Every × n days)`
- **Weekly Recurring**: Support for specific weekdays (Mon/Wed/Fri)
- **Monthly Recurring**: Same day-of-month with automatic adjustment for month-end
- **Yearly Recurring**: Same date with leap year handling
- **Custom Patterns**: Every 10 days, 1st & 15th of month, last day of month

### 2. Anchor Field Support
- **Start Date Based**: Next occurrence calculated from original start date
- **Completion Date Based**: Next occurrence calculated from completion date

### 3. Auto-generation Triggers
- **On Task Completion**: Automatically creates next occurrence when task marked complete
- **Scheduled Cron Job**: Daily cron job creates upcoming occurrences
- **Manual Generation**: API endpoint to trigger generation manually

### 4. Manual Controls
- **Skip Occurrence**: Skip next scheduled occurrence with reason
- **Stop Recurrence**: Permanently stop recurring sequence
- **Pause/Resume**: (Can be extended)

## 🔧 Technical Implementation

### File Changes Made:

#### 1. `server/utils/helperFunction.js`
- Enhanced `calculateNextDueDate()` function
- Added support for all frequency types and patterns
- Helper functions for edge cases (leap year, month-end, holidays)
- New `createNextRecurringOccurrence()` function

#### 2. `server/controller/taskController.js`
- Enhanced `createTask()` for recurring task setup
- Modified `updateTaskStatus()` for auto-generation on completion
- Added `generateScheduledRecurringTasks()` for cron job
- Added `skipRecurringTaskOccurrence()` and `stopRecurringTask()` functions

#### 3. `server/routes/taskRoutes.js`
- Added `/recurring-tasks/generate` endpoint
- Added `/tasks/:id/recurring/skip` endpoint
- Added `/tasks/:id/recurring/stop` endpoint
- Comprehensive Swagger documentation

#### 4. `server/modals/taskModal.js`
- Added `anchorField`, `skipHolidays`, `customPattern` fields
- Extended frequency enum to include 'custom'
- Added `occurrenceCount` tracking

#### 5. `server/utils/recurringTaskScheduler.js` (New File)
- Cron job setup with node-cron
- Scheduler management class
- Statistics tracking and monitoring

## 🚀 Usage Examples

### 1. Create Daily Recurring Task
```javascript
POST /api/create-task
{
  "title": "Daily Standup Meeting",
  "taskType": "recurring",
  "dueDate": "2025-10-15T09:00:00.000Z",
  "startDate": "2025-10-15T09:00:00.000Z",
  "recurrencePattern": {
    "frequency": "daily",
    "interval": 1,
    "anchorField": "startDate"
  }
}
```

### 2. Create Weekly Task with Specific Days
```javascript
{
  "title": "Team Meeting",
  "taskType": "recurring", 
  "recurrencePattern": {
    "frequency": "weekly",
    "interval": 1,
    "daysOfWeek": [1, 3, 5],  // Mon, Wed, Fri
    "anchorField": "startDate"
  }
}
```

### 3. Create Monthly Task (15th of Every Month)
```javascript
{
  "title": "Monthly Report",
  "taskType": "recurring",
  "recurrencePattern": {
    "frequency": "monthly", 
    "interval": 1,
    "dayOfMonth": 15,
    "anchorField": "startDate"
  }
}
```

### 4. Create Custom Pattern (Every 10 Days)
```javascript
{
  "title": "Equipment Check",
  "taskType": "recurring",
  "recurrencePattern": {
    "frequency": "custom",
    "customPattern": {
      "type": "every_n_days",
      "days": 10
    },
    "anchorField": "completionDate"
  }
}
```

## 📅 Due Date Calculation Examples

| Pattern Type | Start Date | Next Occurrence | Logic |
|-------------|------------|----------------|--------|
| Daily (Every 2 days) | Oct 15, 2025 | Oct 17, 2025 | Start + 2 days |
| Weekly (Every week) | Oct 15, 2025 | Oct 22, 2025 | Start + 7 days |
| Weekly (Mon/Wed/Fri) | Oct 15, 2025 (Tue) | Oct 17, 2025 (Fri) | Next weekday in pattern |
| Monthly (Same day) | Oct 15, 2025 | Nov 15, 2025 | Same day next month |
| Monthly (31st) | Jan 31, 2025 | Feb 28, 2025 | Adjusted for Feb |
| Yearly | Oct 15, 2025 | Oct 15, 2026 | Same date next year |
| Custom (10 days) | Oct 15, 2025 | Oct 25, 2025 | Start + 10 days |

## 🔄 Process Flow

### Task Completion Flow:
1. User marks recurring task as "completed"
2. System checks if task `isRecurring` and has `recurrencePattern`
3. Calculates next due date using enhanced logic
4. Creates new task occurrence with fresh status and comments
5. Adds activity log for audit trail
6. Updates original task completion data

### Scheduled Generation Flow:
1. Cron job runs daily at 6:00 AM (configurable)
2. Finds recurring tasks with `nextDueDate` within 24 hours
3. Checks if next occurrence already exists (prevents duplicates)
4. Creates new occurrences using `createNextRecurringOccurrence()`
5. Logs generation statistics

### Manual Control Flow:
- **Skip**: Calculates next-next due date, updates task, logs activity
- **Stop**: Sets end date to now, removes nextDueDate, logs activity

## 🛠 Setup Instructions

### 1. Install Dependencies
```bash
npm install node-cron
```

### 2. Enable Cron Job (Add to server.js)
```javascript
import recurringTaskScheduler from './utils/recurringTaskScheduler.js';

// Start scheduler when server starts
recurringTaskScheduler.start();

// Optional: Add admin routes for monitoring
app.get('/api/admin/recurring-scheduler/status', (req, res) => {
  res.json(recurringTaskScheduler.getStatus());
});
```

### 3. Database Migration (if needed)
Existing tasks will work as-is. New fields are optional with defaults.

## 🧪 Testing

### Run Test Suite:
```bash
node test-recurring-tasks.js
```

### Manual API Testing:
1. Create recurring task using POST `/api/create-task`
2. Mark task complete using PUT `/api/tasks/{id}/status`
3. Verify next occurrence created automatically
4. Test skip/stop functionality
5. Test cron job endpoint

## 🔍 Monitoring & Debugging

### Console Logs:
- All recurring operations are logged with 🔄 emoji
- Detailed debug info for calculations
- Error handling with specific error messages

### Activity Feed:
- "Recurring Task: Next occurrence generated" messages
- "Recurring Task: Occurrence skipped" messages  
- "Recurring Task: Sequence completed" messages

### Statistics:
- Cron job success/failure rates
- Total tasks generated
- Performance metrics

## 🚨 Important Notes

### For Existing Tasks:
- Non-recurring tasks are completely unaffected
- Existing recurring tasks will work with enhanced logic
- No breaking changes to current functionality

### Edge Cases Handled:
- Month-end dates (Jan 31 → Feb 28/29)
- Leap year adjustments (Feb 29 → Feb 28)
- Weekend skipping (optional)
- End date conditions
- Maximum occurrence limits

### Performance Considerations:
- Cron job runs efficiently with database queries
- Duplicate prevention logic
- Bulk operations for large datasets
- Error handling doesn't affect other tasks

## 🎯 Next Steps (Future Enhancements)

1. **Holiday Calendar Integration**: Skip company holidays automatically
2. **Time Zone Support**: Handle different user time zones  
3. **Bulk Recurring Operations**: Create multiple occurrences at once
4. **Advanced Patterns**: Every 2nd Tuesday, last Friday of month
5. **Notification System**: Alert users about upcoming recurring tasks
6. **Recurring Subtasks**: Clone subtask structure in each occurrence
7. **Template Management**: Save recurring patterns as templates

## 📞 Support

For any issues or questions:
- Check console logs for detailed error messages
- Use test file to validate calculations
- Monitor cron job statistics
- Review activity feed for audit trail

## Summary

✅ Enhanced due date calculation logic implemented  
✅ Auto-generation on completion and scheduled cron job  
✅ Manual controls for skip and stop operations  
✅ Comprehensive testing and documentation  
✅ Backward compatibility maintained  
✅ Production-ready with monitoring and error handling