# Snooze & Mark As Risk - Validation Implementation Summary

## 📋 Overview
Implemented comprehensive validation logic for Snooze and Mark as Risk APIs according to document specifications with proper frontend error handling.

---

## 🔧 Backend Changes (taskController.js)

### 1️⃣ **Snooze Task API** - Enhanced Validations

#### ✅ Implemented Checks:

**VALIDATION 1: Approval Tasks Cannot Be Snoozed**
```javascript
if (task.isApprovalTask || task.taskType === 'approval') {
  return res.status(400).json({
    message: "Approval tasks cannot be snoozed to maintain workflow continuity."
  });
}
```
- **Rule**: Approval tasks BLOCKED from snoozing
- **Reason**: Document explicitly states "Approval tasks cannot be snoozed"
- **Error Toast**: User sees clear message explaining why

**VALIDATION 2: Status Check - Only Active Tasks**
```javascript
const allowedStatuses = ['OPEN', 'INPROGRESS', 'OVERDUE'];
if (!allowedStatuses.includes(task.status)) {
  // Custom messages for each invalid status
  - DONE: "Cannot snooze completed task."
  - CANCELLED: "Cannot snooze cancelled task."
  - ONHOLD: "Task is already on hold. Cannot snooze."
}
```
- **Allowed**: OPEN, INPROGRESS, OVERDUE
- **Blocked**: DONE, CANCELLED, ONHOLD
- **Reason**: Document says "Snooze available only for active tasks"

**VALIDATION 3: Milestone Tasks - Role Restriction**
```javascript
if (task.taskType === 'milestone') {
  const canSnoozeMilestone = userRoles.some(role => 
    ['manager', 'org_admin', 'super_admin'].includes(role)
  );
  if (!canSnoozeMilestone) {
    return res.status(403).json({
      message: "Only Managers and Admins can snooze milestone tasks."
    });
  }
}
```
- **Allowed Roles**: Manager, Company Admin, Tasksetu Admin
- **Blocked**: Individual employees
- **Reason**: Document states milestone snooze is "Manager/Admin only"

**VALIDATION 4: Snooze Time Must Be Future**
```javascript
const snoozeDate = new Date(snoozeUntil);
if (snoozeDate <= new Date()) {
  return res.status(400).json({
    message: "Invalid snooze time. Snooze date must be in the future."
  });
}
```
- **Rule**: Cannot snooze to past/current time
- **Error**: Clear validation message

**VALIDATION 5: Permission Check**
```javascript
const isAssignee = task.assignedTo?.toString() === user.id.toString();
const isCollaborator = task.collaboratorIds?.some(id => id.toString() === user.id.toString());
const isAdmin = userRoles.some(role => ['org_admin', 'super_admin', 'manager'].includes(role));

const hasPermission = isAssignee || isCollaborator || isAdmin;
```
- **Who Can Snooze**: Assignee, Collaborators, Managers, Admins
- **Blocked**: Unrelated users

---

### 2️⃣ **Unsnooze Task API** - Enhanced Validations

#### ✅ Implemented Checks:

**CHECK 1: Task Actually Snoozed**
```javascript
if (!task.isSnooze) {
  return res.status(400).json({
    message: "Task is not currently snoozed."
  });
}
```

**CHECK 2: Permission Validation**
- Same permission logic as snooze
- Only authorized users can unsnooze

---

### 3️⃣ **Mark Task as Risk API** - Enhanced Validations

#### ✅ Implemented Checks:

**VALIDATION 1: Cannot Mark Completed/Cancelled Tasks**
```javascript
const invalidStatuses = ['DONE', 'CANCELLED'];
if (invalidStatuses.includes(task.status)) {
  return res.status(400).json({
    message: "Cannot mark completed/cancelled task as risk. Risk flag not available after task completion."
  });
}
```
- **Blocked**: DONE, CANCELLED
- **Reason**: Document says "Risk flag not available after task completion"

**VALIDATION 2: Approval Tasks - Limited Support**
```javascript
if (task.isApprovalTask || task.taskType === 'approval') {
  if (task.approvalStatus && ['submitted', 'approved', 'rejected'].includes(task.approvalStatus.toLowerCase())) {
    return res.status(400).json({
      message: "Cannot mark approval task as risk after submission. Risk marking only available before submission."
    });
  }
}
```
- **Allowed**: Before submission only
- **Blocked**: After submission/approval/rejection
- **Reason**: Document specifies "Only before submission"

**VALIDATION 3: Status Check - Only Active Tasks**
```javascript
const allowedStatuses = ['OPEN', 'INPROGRESS', 'ONHOLD', 'OVERDUE'];
if (!allowedStatuses.includes(task.status)) {
  return res.status(400).json({
    message: "Risk flag available only for active tasks (Open/In Progress/On Hold/Overdue)."
  });
}
```
- **Allowed**: OPEN, INPROGRESS, ONHOLD, OVERDUE
- **Reason**: Document allows ONHOLD for risk marking

**VALIDATION 4: Risk Level Validation**
```javascript
const validRiskLevels = ['low', 'medium', 'high'];
const finalRiskLevel = riskLevel && validRiskLevels.includes(riskLevel.toLowerCase()) 
  ? riskLevel.toLowerCase() 
  : 'medium';
```
- **Valid Levels**: low, medium, high
- **Default**: medium if invalid/not provided

**VALIDATION 5: Subtask -> Parent Propagation**
```javascript
// If it's a subtask, mark parent task as having risk
if (task.parentTaskId) {
  await storage.updateTask(task.parentTaskId, {
    hasRisk: true,
    updatedBy: user.id,
    updatedAt: new Date()
  });
}
```
- **Rule**: Risky subtask → parent gets `hasRisk: true`
- **Purpose**: Document says subtask risk affects parent

**VALIDATION 6: Permission Check**
- Same as snooze: Assignee, Collaborator, Manager, Admin

---

### 4️⃣ **Unmark Task as Risk API** - Enhanced Validations

#### ✅ Implemented Checks:

**CHECK 1: Task Actually Risky**
```javascript
if (!task.isRisk) {
  return res.status(400).json({
    message: "Task is not currently marked as risk."
  });
}
```

**CHECK 2: Smart Parent Update**
```javascript
// If subtask unmarked, check if parent still has other risky subtasks
if (task.parentTaskId) {
  const hasOtherRiskySubtasks = parentTask.subtasks.some(
    st => st._id.toString() !== taskId && st.isRisk
  );
  
  if (!hasOtherRiskySubtasks) {
    await storage.updateTask(task.parentTaskId, {
      hasRisk: false
    });
  }
}
```
- **Rule**: Only clear parent's `hasRisk` if NO other risky subtasks exist

---

## 🎨 Frontend Error Handling (AllTasks.jsx)

### Existing Error Handling (No Changes Needed!)

Both `handleSnoozeTask` and `handleMarkAsRisk` already have proper error handling:

```javascript
catch (error) {
  console.error('Error handling task snooze:', error);
  showToast(
    error.response?.data?.message || "Failed to update snooze status",
    "error"
  );
}
```

**Toast Messages Will Show:**
- ❌ "Approval tasks cannot be snoozed to maintain workflow continuity."
- ❌ "Cannot snooze completed task."
- ❌ "Only Managers and Admins can snooze milestone tasks."
- ❌ "Invalid snooze time. Snooze date must be in the future."
- ❌ "Cannot mark approval task as risk after submission."
- ❌ "Cannot mark completed task as risk."
- ✅ "Task snoozed successfully. Reminders will resume after snooze period."
- ✅ "Task marked as high risk successfully. This will be flagged for managerial escalation."

---

## 📊 Validation Matrix

### Snooze Feature

| Task Type | Status | Role | Can Snooze? | Notes |
|-----------|--------|------|-------------|-------|
| Regular | OPEN | Any | ✅ Yes | Standard use case |
| Regular | INPROGRESS | Any | ✅ Yes | Active work |
| Regular | OVERDUE | Any | ✅ Yes | Grace period |
| Regular | DONE | Any | ❌ No | Completed |
| Regular | CANCELLED | Any | ❌ No | Inactive |
| Regular | ONHOLD | Any | ❌ No | Already paused |
| Recurring | OPEN/INPROGRESS | Any | ✅ Yes | Instance level |
| Subtask | OPEN/INPROGRESS | Any | ✅ Yes | Individual |
| Milestone | OPEN/INPROGRESS | Manager/Admin | ✅ Yes | Role restricted |
| Milestone | OPEN/INPROGRESS | Employee | ❌ No | Insufficient permission |
| **Approval** | **Any** | **Any** | **❌ No** | **Document: Explicitly blocked** |
| Quick Task | OPEN/INPROGRESS | Any | ✅ Yes | Same as regular |

### Mark as Risk Feature

| Task Type | Status | Approval Status | Can Mark Risk? | Notes |
|-----------|--------|-----------------|----------------|-------|
| Regular | OPEN/INPROGRESS/ONHOLD | N/A | ✅ Yes | Main use case |
| Regular | OVERDUE | N/A | ✅ Yes | Already risky |
| Regular | DONE | N/A | ❌ No | Completed |
| Regular | CANCELLED | N/A | ❌ No | Inactive |
| Recurring | OPEN/INPROGRESS | N/A | ✅ Yes | Instance level |
| Subtask | OPEN/INPROGRESS | N/A | ✅ Yes | Marks parent too |
| Milestone | OPEN/INPROGRESS | N/A | ✅ Yes | Manager/Admin only |
| Approval | OPEN | Not submitted | ✅ Yes | Before submission only |
| Approval | Any | Submitted/Approved/Rejected | ❌ No | After submission blocked |
| Quick Task | OPEN/INPROGRESS | N/A | ✅ Yes | Optional |

---

## 🧪 Testing Scenarios

### Snooze Tests:

**Test 1: Try to snooze approval task**
- **Expected**: ❌ Error toast: "Approval tasks cannot be snoozed..."
- **Status Code**: 400

**Test 2: Try to snooze completed task**
- **Expected**: ❌ Error toast: "Cannot snooze completed task."
- **Status Code**: 400

**Test 3: Employee tries to snooze milestone**
- **Expected**: ❌ Error toast: "Only Managers and Admins can snooze milestone tasks."
- **Status Code**: 403

**Test 4: Snooze to past date**
- **Expected**: ❌ Error toast: "Invalid snooze time..."
- **Status Code**: 400

**Test 5: Valid snooze regular task**
- **Expected**: ✅ Success toast: "Task snoozed successfully..."
- **Status Code**: 200

### Risk Tests:

**Test 1: Mark completed task as risk**
- **Expected**: ❌ Error toast: "Cannot mark completed task as risk..."
- **Status Code**: 400

**Test 2: Mark submitted approval task as risk**
- **Expected**: ❌ Error toast: "Cannot mark approval task as risk after submission..."
- **Status Code**: 400

**Test 3: Mark risky subtask**
- **Expected**: ✅ Success + parent gets `hasRisk: true`
- **Status Code**: 200

**Test 4: Unmark last risky subtask**
- **Expected**: ✅ Success + parent gets `hasRisk: false`
- **Status Code**: 200

---

## 📝 Summary

### ✅ What Was Implemented:

1. **Snooze API**: 5 validation rules covering all document scenarios
2. **Unsnooze API**: Proper state checking
3. **Mark as Risk API**: 6 validation rules with subtask propagation
4. **Unmark as Risk API**: Smart parent-child relationship handling
5. **Frontend**: Already has error handling - will display all backend messages as toasts

### 🎯 Document Compliance:

- ✅ Approval tasks CANNOT be snoozed
- ✅ Snooze only for OPEN/INPROGRESS/OVERDUE
- ✅ Milestone snooze restricted to Manager/Admin
- ✅ Risk marking blocked after task completion
- ✅ Approval tasks can be marked risky BEFORE submission only
- ✅ Subtask risk propagates to parent
- ✅ ONHOLD tasks can be marked risky (but not snoozed)
- ✅ All role-based permissions implemented

### 🚀 User Experience:

Users will see:
- **Clear error messages** explaining why action failed
- **Success confirmations** when actions succeed
- **Context-aware messages** based on task type and status
- **Immediate feedback** via toast notifications

---

## 🔄 Next Steps for Testing:

1. **Test with org_admin login**: Try all scenarios from table
2. **Test with employee login**: Verify milestone snooze restriction
3. **Test approval workflow**: Create approval task → submit → try to mark risk
4. **Test subtask scenarios**: Create subtask → mark risky → verify parent flag
5. **Test edge cases**: Past snooze date, already snoozed task, etc.

All validations are now fully implemented according to the document specifications! 🎉
