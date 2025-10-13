# Google Calendar Integration Implementation

## Overview
This implementation adds comprehensive Google Calendar integration to the Admin Task Manager. When users connect their Google Calendar and tasks are created with due dates, corresponding calendar events are automatically created in their Google Calendar.

## Features Implemented

### 1. User Model Updates
- Added `googleCalendarTokens` field to store OAuth tokens
- Added `googleCalendarConnected` boolean flag
- Added `googleCalendarEmail` to store connected account email

**File:** `server/modals/userModal.js`

### 2. Task Model Updates
- Added `googleCalendarEventId` field to track calendar events
- Enables linking tasks to their corresponding Google Calendar events

**File:** `server/models.js`

### 3. Storage Layer Enhancements
- `storeGoogleCalendarTokens(userId, tokens)` - Store OAuth tokens
- `getGoogleCalendarTokens(userId)` - Retrieve OAuth tokens
- `removeGoogleCalendarTokens(userId)` - Remove OAuth tokens
- `createGoogleCalendarEventForTask(task)` - Create calendar event for task
- `updateGoogleCalendarEventForTask(task)` - Update existing calendar event
- `deleteGoogleCalendarEventForTask(task)` - Delete calendar event

**File:** `server/mongodb-storage.js`

### 4. Automatic Calendar Event Management
When tasks are:
- **Created**: Automatically creates Google Calendar event if user has connected calendar and task has due date
- **Updated**: Updates the calendar event if task details change
- **Deleted**: Removes the corresponding calendar event

### 5. Enhanced Google Calendar Routes
- Updated OAuth callback to use new storage methods
- Updated disconnect functionality
- Enhanced status check with connection details

**File:** `server/routes/googleCalendar.js`

### 6. Test Routes (Development)
- `/api/test-google-calendar/test-create-event` - Test event creation
- `/api/test-google-calendar/test-connection/:userId` - Test connection status

**File:** `server/routes/testGoogleCalendar.js`

## Calendar Event Features

### Event Details
- **Title**: "Task: [Task Title]"
- **Description**: Task description + metadata (Task ID, Priority, Status)
- **Duration**: 1 hour (can be customized)
- **Color**: Based on task priority
  - Urgent: Red
  - High: Orange
  - Medium: Yellow
  - Low: Green
- **Reminders**: 
  - Email: 1 day before
  - Popup: 30 minutes before

### Priority Color Mapping
```javascript
const colorMap = {
  'urgent': '11', // Red
  'high': '6',    // Orange
  'medium': '5',  // Yellow
  'low': '10',    // Green
};
```

## Usage Flow

### 1. Connect Google Calendar
```javascript
// User clicks "Connect Google Calendar" button
// OAuth flow redirects to Google
// Tokens are stored using storeGoogleCalendarTokens()
```

### 2. Create Task with Due Date
```javascript
// When task is created with dueDate and assignedTo
// createGoogleCalendarEventForTask() is automatically called
// Calendar event is created and eventId is stored in task
```

### 3. Update Task
```javascript
// When task details change (title, description, priority, dueDate)
// updateGoogleCalendarEventForTask() is automatically called
// Calendar event is updated with new details
```

### 4. Delete Task
```javascript
// When task is deleted
// deleteGoogleCalendarEventForTask() is automatically called
// Calendar event is removed from Google Calendar
```

## Environment Variables Required
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=your_redirect_uri
```

## Testing the Integration

### Test Calendar Connection
```bash
GET /api/test-google-calendar/test-connection/{userId}
```

### Test Event Creation
```bash
POST /api/test-google-calendar/test-create-event
{
  "taskId": "task_id_here",
  "userId": "user_id_here"
}
```

## Database Schema Changes

### User Model
```javascript
googleCalendarTokens: {
  access_token: String,
  refresh_token: String,
  scope: String,
  token_type: String,
  expiry_date: Number,
},
googleCalendarConnected: {
  type: Boolean,
  default: false,
},
googleCalendarEmail: String,
```

### Task Model
```javascript
googleCalendarEventId: { type: String, default: null },
```

## Error Handling
- All calendar operations are wrapped in try-catch blocks
- Calendar failures don't prevent task operations from completing
- Comprehensive logging for debugging
- Graceful degradation when calendar tokens are invalid or expired

## Security Considerations
- OAuth tokens are stored securely in the database
- Tokens are only accessible by the authenticated user
- All calendar operations require valid authentication
- Token refresh is handled automatically by googleapis library

## Future Enhancements
1. **Token Refresh**: Automatic refresh of expired tokens
2. **Calendar Selection**: Allow users to choose specific calendars
3. **Event Customization**: Let users customize event details
4. **Sync Status**: Show sync status in the UI
5. **Bulk Operations**: Bulk create/update/delete calendar events
6. **Recurring Tasks**: Support for recurring task events
7. **Meeting Integration**: Create calendar events for task meetings
8. **Notification Settings**: Customizable reminder settings

## Troubleshooting

### Common Issues
1. **"process is not defined"**: Environment variables not properly configured in Vite
2. **Token errors**: User needs to reconnect Google Calendar
3. **Event creation fails**: Check if task has due date and assigned user
4. **Permission errors**: Verify Google Calendar API permissions

### Debug Steps
1. Check environment variables are set
2. Verify user has connected Google Calendar
3. Ensure task has required fields (dueDate, assignedTo)
4. Check server logs for detailed error messages
5. Use test routes to verify functionality

## Implementation Notes
- Calendar events are created asynchronously to avoid blocking task operations
- Event IDs are stored in the task document for future reference
- All calendar operations include comprehensive error handling
- The implementation follows Google Calendar API best practices
- Tokens are automatically refreshed when needed (handled by googleapis library)