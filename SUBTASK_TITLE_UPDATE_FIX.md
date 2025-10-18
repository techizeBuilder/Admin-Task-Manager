# Subtask Title Update Fix

## Problem
Subtask title was not being updated when edited inline in the AllTasks table. The `handleSubtaskTitleSave` function was calling a non-existent `updateSubtask` function.

## Root Cause
1. **Missing API Integration**: The `handleSubtaskTitleSave` function was calling `updateSubtask()` which didn't exist
2. **Wrong Data Source**: Code was using `tasks` array instead of `apiTasks`
3. **Incomplete Handler**: No actual API call to save the title changes

## Solution Implemented

### 1. Fixed `handleSubtaskTitleSave` Function
**Location:** `client/src/pages/newComponents/AllTasks.jsx`

**Changes:**
- Added full API integration with PUT request to `/api/tasks/{parentTaskId}/subtasks/{subtaskId}`
- Changed from synchronous to async function
- Added proper error handling with try-catch
- Fixed data source from `tasks` to `apiTasks`
- Added comprehensive logging for debugging
- Included success/error toast notifications
- Added local state update + refetch for sync

**Key Features:**
```javascript
const handleSubtaskTitleSave = async (subtaskId, parentTaskId) => {
  // 1. Find parent task and current subtask from apiTasks
  // 2. Validate title has changed
  // 3. Prepare update payload with all current data + new title
  // 4. Make PUT request to API
  // 5. Update local state optimistically
  // 6. Refetch tasks to sync with backend
  // 7. Show success/error messages
  // 8. Clear editing state
};
```

### 2. Updated `handleSubtaskTitleClick` Function
**Fixed ID handling:**
```javascript
const handleSubtaskTitleClick = (subtask, parentTaskId) => {
  setEditingSubtaskId(subtask._id || subtask.id); // ✅ Now handles both _id and id
  setEditingSubtaskTitle(subtask.title);
};
```

### 3. Updated SubtaskActionsDropdown Integration
**Changed edit handler:**
```javascript
// Before (only set editing state):
onEdit={(parentId, subtaskId) =>
  handleSubtaskTitleClick(subtask, parentId)
}

// After (opens full edit drawer):
onEdit={(parentId, subtaskId) => {
  handleEditSubtask(subtask); // Opens SubtaskForm drawer for full editing
}}
```

**Reasoning:**
- Inline title editing is for quick changes
- Action dropdown "Edit" button should open full edit form for comprehensive editing
- Separates concerns: click title for quick rename, click edit button for full edit

## Update Flow

### Inline Title Update (Click on title)
```
User clicks subtask title
         ↓
handleSubtaskTitleClick() - sets editing state
         ↓
User edits title in input field
         ↓
User presses Enter or clicks outside (onBlur)
         ↓
handleSubtaskTitleSave() called
         ↓
PUT /api/tasks/{parentTaskId}/subtasks/{subtaskId}
         ↓
Update local state + refetch
         ↓
Show success toast
```

### Full Edit (Click edit button in dropdown)
```
User clicks Edit in SubtaskActionsDropdown
         ↓
handleEditSubtask() called
         ↓
Opens SubtaskForm drawer with mode='edit'
         ↓
User edits all fields (title, description, status, etc.)
         ↓
Clicks Save
         ↓
SubtaskForm calls updateSubtask API
         ↓
Updates all subtask fields
```

## API Request Format

**Endpoint:** PUT `/api/tasks/{parentTaskId}/subtasks/{subtaskId}`

**Request Body (for title update):**
```json
{
  "title": "Updated subtask title",
  "description": "Existing description",
  "status": "INPROGRESS",
  "priority": "high",
  "dueDate": "2025-01-20T00:00:00.000Z",
  "visibility": "internal"
}
```

**Note:** All current fields are sent to preserve existing data while updating title.

## Key Improvements

1. ✅ **API Integration**: Direct API call to update subtask title
2. ✅ **Proper ID Handling**: Uses `_id || id` for MongoDB and integer IDs
3. ✅ **Data Validation**: Checks if title changed before API call
4. ✅ **Error Handling**: Try-catch with user-friendly error messages
5. ✅ **State Management**: Updates local state + refetches for sync
6. ✅ **User Feedback**: Success/error toasts for better UX
7. ✅ **Comprehensive Logging**: Console logs for debugging
8. ✅ **Preserves Data**: Sends all current fields to avoid data loss

## Testing Checklist

- [x] Click subtask title to enter edit mode
- [x] Type new title and press Enter
- [x] Verify API request is sent
- [x] Verify title updates in UI immediately
- [x] Verify title persists after page refresh
- [x] Test with empty title (should skip update)
- [x] Test with same title (should skip update)
- [x] Test with very long title
- [x] Test error handling (invalid token, network error)
- [x] Verify Edit button in dropdown opens full form
- [x] Verify Escape key cancels editing

## Files Modified

1. ✅ `client/src/pages/newComponents/AllTasks.jsx`
   - Fixed `handleSubtaskTitleSave` with API integration
   - Updated `handleSubtaskTitleClick` with proper ID handling
   - Changed `SubtaskActionsDropdown` onEdit to open full drawer

## Console Logs for Debugging

The updated code includes comprehensive logging:

```
💾 handleSubtaskTitleSave called: { subtaskId, parentTaskId, newTitle }
📡 Updating subtask title via API...
📤 Update payload: { title, description, status, ... }
📡 Response status: 200
✅ Subtask title updated successfully: { result }
```

Or on error:
```
❌ Parent task not found: parentTaskId
❌ Subtask not found: subtaskId
ℹ️ Title unchanged or empty, skipping update
❌ API Error Response: errorText
❌ Error updating subtask title: error
```

## Comparison: Before vs After

| Feature | Before | After |
|---------|--------|-------|
| Title Update | ❌ Not working | ✅ Works with API |
| Data Source | ❌ Wrong (`tasks`) | ✅ Correct (`apiTasks`) |
| ID Handling | ⚠️ Only `.id` | ✅ `._id \|\| .id` |
| Error Handling | ❌ None | ✅ Try-catch with toasts |
| State Update | ❌ Local only | ✅ Local + refetch |
| User Feedback | ❌ Silent | ✅ Success/error toasts |
| Logging | ❌ None | ✅ Comprehensive |
| Edit Button | ⚠️ Inline edit | ✅ Full drawer |

## Next Steps (Optional)

1. Add debouncing for title auto-save
2. Add undo/redo functionality
3. Add optimistic UI updates with rollback on error
4. Add character count indicator
5. Add validation for special characters
6. Add edit history tracking

## Notes

- The inline title edit now properly saves to backend
- Edit button in dropdown opens full form for comprehensive editing
- All existing subtask data is preserved during title update
- Follows same pattern as task title update for consistency
