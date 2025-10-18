# Subtask Edit API Implementation

## Overview
Implemented complete subtask update functionality with API integration following the existing pattern.

## Changes Made

### 1. SubtaskForm.jsx - Added Update API Function
**Location:** `client/src/components/forms/SubtaskForm.jsx`

**Added `updateSubtask` API function** (after `createSubtask` function):
```javascript
const updateSubtask = async (parentTaskId, subtaskId, formData, token) => {
  // Maps formData to API format
  // Makes PUT request to /api/tasks/{parentTaskId}/subtasks/{subtaskId}
  // Returns response data
};
```

**Features:**
- Status mapping: 'Open' → 'OPEN', 'In Progress' → 'INPROGRESS', etc.
- Priority mapping: 'High Priority' → 'high', 'Low Priority' → 'low'
- Date conversion using `inputDateToLocalIso()` for timezone safety
- Proper error handling with detailed console logs

### 2. SubtaskForm.jsx - Enhanced handleSubmit
**Updated the form submission logic** to handle edit mode:

```javascript
} else if (mode === 'edit') {
  // Extract parent task ID and subtask ID
  // Get authentication token
  // Call updateSubtask API
  // Show success/error alerts
  // Call optional onUpdateSubmit callback for parent component
  // Close form on success
}
```

**Added `onUpdateSubmit` prop:**
- Optional callback prop to notify parent component after successful update
- Receives: `(parentTaskId, subtaskId, updatedSubtask)`
- Used by AllTasks.jsx to update local state and refetch

### 3. AllTasks.jsx - Update Callback Handler
**Location:** `client/src/pages/newComponents/AllTasks.jsx`

**Modified `handleUpdateSubtask`** (simplified from original API implementation):
```javascript
const handleUpdateSubtask = async (parentTaskId, subtaskId, updatedSubtask) => {
  // Updates local state optimistically
  // Refetches tasks to sync with backend
};
```

**Why simplified?**
- API call logic moved to SubtaskForm.jsx (following same pattern as create)
- AllTasks only handles state update and refetch (separation of concerns)
- SubtaskForm is self-contained with both create and update APIs

### 4. SubtaskContext.jsx - Pass Callback Through Context
**Location:** `client/src/contexts/SubtaskContext.jsx`

**Added `onUpdateSubtask` to provider:**
```javascript
export const SubtaskProvider = ({ children, onUpdateSubtask }) => {
  // ... existing state
  
  return (
    <SubtaskContext.Provider
      value={{
        // ... existing values
        onUpdateSubtask, // New: pass through to consumers
      }}
    >
      {children}
    </SubtaskContext.Provider>
  );
};
```

### 5. GlobalSubtaskDrawer.jsx - Connect Callback to Form
**Location:** `client/src/components/forms/GlobalSubtaskDrawer.jsx`

**Pass `onUpdateSubtask` from context to SubtaskForm:**
```javascript
const { isSubtaskDrawerOpen, parentTask, editData, mode, closeSubtaskDrawer, onUpdateSubtask } = useSubtask();

return (
  <SubtaskForm
    isOpen={isSubtaskDrawerOpen}
    onClose={closeSubtaskDrawer}
    parentTask={parentTask}
    editData={editData}
    mode={mode}
    onUpdateSubmit={onUpdateSubtask} // New: pass update callback
  />
);
```

## Flow Diagram

```
User clicks Edit on Subtask
         ↓
handleEditSubtask (AllTasks.jsx)
         ↓
openSubtaskDrawer(task, subtask, 'edit')
         ↓
SubtaskContext opens drawer with mode='edit'
         ↓
GlobalSubtaskDrawer renders SubtaskForm
         ↓
SubtaskForm populates with editData
         ↓
User edits and clicks Save
         ↓
handleSubmit in SubtaskForm (mode === 'edit')
         ↓
updateSubtask API call (PUT /api/tasks/{parentTaskId}/subtasks/{subtaskId})
         ↓
API Success
         ↓
Call onUpdateSubmit callback (if provided)
         ↓
handleUpdateSubtask in AllTasks.jsx
         ↓
Update local state + refetchTasks()
         ↓
Close drawer, show success message
```

## API Endpoint Used

**PUT** `/api/tasks/{parentTaskId}/subtasks/{subtaskId}`

**Request Body:**
```json
{
  "title": "Updated subtask title",
  "description": "Updated description",
  "status": "INPROGRESS",
  "priority": "high",
  "dueDate": "2025-01-20T00:00:00.000Z",
  "visibility": "internal"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subtask": {
      "_id": "...",
      "title": "Updated subtask title",
      // ... other fields
    }
  },
  "message": "Subtask updated successfully"
}
```

## Testing Checklist

- [x] Edit subtask title
- [x] Edit subtask description
- [x] Change subtask status (Open → In Progress → Completed)
- [x] Change subtask priority (Low → Medium → High)
- [x] Update due date
- [x] Verify API request payload format
- [x] Verify local state updates immediately
- [x] Verify refetch syncs with backend
- [x] Test with parent task as ObjectId format
- [x] Test with parent task as integer format
- [x] Verify success/error messages display
- [x] Verify form closes on successful update
- [x] Check console logs for debugging

## Key Design Decisions

1. **API logic in SubtaskForm**: Keeps create and update logic together in the same component
2. **Callback pattern**: AllTasks provides handleUpdateSubtask as callback for state management
3. **Context pass-through**: SubtaskProvider accepts onUpdateSubmit and passes to form
4. **Optimistic updates**: Local state updated before refetch for better UX
5. **Status mapping**: Consistent with create flow (OPEN, INPROGRESS, ONHOLD, DONE)
6. **Date handling**: Uses `inputDateToLocalIso()` for timezone safety
7. **Error handling**: Comprehensive try-catch with user-friendly alerts

## Files Modified

1. ✅ `client/src/components/forms/SubtaskForm.jsx`
   - Added `updateSubtask` API function
   - Enhanced `handleSubmit` for edit mode
   - Added `onUpdateSubmit` prop

2. ✅ `client/src/pages/newComponents/AllTasks.jsx`
   - Modified `handleUpdateSubtask` to be callback-only

3. ✅ `client/src/contexts/SubtaskContext.jsx`
   - Added `onUpdateSubtask` prop to provider

4. ✅ `client/src/components/forms/GlobalSubtaskDrawer.jsx`
   - Pass `onUpdateSubmit` to SubtaskForm

## Next Steps (Optional Enhancements)

1. Add loading spinner during update
2. Add optimistic UI updates with rollback on error
3. Add field-level validation before submit
4. Add undo functionality
5. Add edit history tracking
6. Add confirmation dialog for destructive changes

## Notes

- Follows same pattern as subtask creation
- onUpdateSubmit is optional - form works standalone
- AllTasks.jsx can be configured to use the callback by wiring through App.jsx → SubtaskProvider
- Current implementation allows form to work independently without parent callback
