# Milestone Task & Subtask Logic Implementation

## Document Reference: Section 4.3 - Milestone Tasks

### ✅ Implementation Summary

This implementation ensures **strict role-based access control** for milestone tasks and their subtasks, as per the document specification.

---

## 🏔️ 1. Milestone Task Creation Validation

### Location: `server/controller/taskController.js` - `createTask` function

### Rules Implemented:
- ✅ **Only Manager, Org Admin, and Tasksetu Admin** can create milestone tasks
- ✅ **Employee and Individual users CANNOT** create milestone tasks
- ✅ **Individual users** (no organization context) are blocked from creating milestones
- ✅ Milestone tasks require organization context

### Code Added:
```javascript
// 🏔️ MILESTONE TASK CREATION VALIDATION (Doc Ref: 4.3.1)
// "Only managers and organizational admins can establish milestone dependencies or subtasks."
if (parsedTaskData.taskType === 'milestone') {
  const userRoles = Array.isArray(user.role) ? user.role : [user.role];
  const isTasksetuAdmin = userRoles.includes('tasksetu-admin') || userRoles.includes('super-admin');
  const isOrgAdmin = userRoles.includes('org_admin') || userRoles.includes('company-admin') || userRoles.includes('admin');
  const isManager = userRoles.includes('manager');

  // Only Manager, Org Admin, or Tasksetu Admin can create milestone tasks
  if (!isManager && !isOrgAdmin && !isTasksetuAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only Manager or Org Admin can create milestone tasks.'
    });
  }

  // Individual users cannot create milestone tasks
  if (isIndividual || (!user.organizationId && !isTasksetuAdmin)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Milestone tasks require an organization context.'
    });
  }
}
```

### Error Messages:
| User Role | Error Message |
|-----------|---------------|
| Employee | "Access denied: Only Manager or Org Admin can create milestone tasks. Milestone tasks represent major project phases and can only be managed by project leads." |
| Individual | "Access denied: Milestone tasks require an organization context. Individual users cannot create milestone tasks." |

---

## 🧩 2. Subtask Creation Under Milestone

### Location: `server/controller/taskController.js` - `createSubtask` function

### Rules Implemented:
- ✅ **Only Manager, Org Admin, and Tasksetu Admin** can create subtasks under milestone
- ✅ **Employee CANNOT** create subtasks under milestone (read-only access)
- ✅ **Individual CANNOT** create subtasks under milestone (no access)
- ✅ Early validation before permission checks
- ✅ Enhanced permission checks specifically for milestone tasks

### Code Added:
```javascript
// 🏔️ MILESTONE TASK SUBTASK VALIDATION (Doc Ref: 4.3.2, 4.3.5)
// "Only managers and organizational admins can establish milestone dependencies or subtasks."
// "Subtasks under milestone behave like mini-deliverables and are managed by project leads only."
if (parentTask.taskType === 'milestone' || parentTask.isMilestone === true) {
  // Only Manager, Org Admin, or Tasksetu Admin can create subtasks under milestone
  if (!isManager && !isOrgAdmin && !isTasksetuAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only Manager or Org Admin can create subtasks under milestone tasks. Milestone subtasks are managed by project leads only.'
    });
  }
}
```

### Enhanced Permission Logic:
```javascript
// Role-based permission check (enhanced with milestone logic)
let hasPermission = false;
const isMilestoneTask = parentTask.taskType === 'milestone' || parentTask.isMilestone === true;

if (isEmployee) {
  // Employee can create subtasks for regular tasks only (NOT milestone)
  if (isMilestoneTask) {
    hasPermission = false;
  } else {
    // Regular task subtask logic
    const isOwnTask = parentTask.createdBy?.toString() === user.id?.toString();
    const isAssignedToSelf = parentTask.assignedTo?.toString() === user.id?.toString();
    hasPermission = isOwnTask || isAssignedToSelf;
  }
}
```

### Error Messages:
| Scenario | Error Message |
|----------|---------------|
| Employee tries to create milestone subtask | "Access denied: Only Manager or Org Admin can create subtasks under milestone tasks. Milestone subtasks are managed by project leads only." |
| Individual tries to create milestone subtask | "Access denied: Only Manager or Org Admin can create subtasks under milestone tasks" |

---

## 🔗 3. Linking Tasks to Milestone

### Location: `server/controller/milestoneTaskController.js` - `linkTaskToMilestone` function

### Rules Implemented:
- ✅ **Only Manager, Org Admin, and Tasksetu Admin** can link tasks
- ✅ **Employee and Individual CANNOT** link tasks (read-only access)
- ✅ **Quick tasks CANNOT** be linked to milestones
- ✅ **Approval tasks CANNOT** be linked to milestones
- ✅ **Recurring patterns CANNOT** be linked (only instances can be linked)
- ✅ **Regular tasks** can be linked ✓
- ✅ **Recurring instances** can be linked ✓
- ✅ **Milestone child tasks** can be linked ✓

### Code Added:
```javascript
// 🏔️ MILESTONE LINK TASK VALIDATION (Doc Ref: 4.3.2)
const userRoles = Array.isArray(userRole) ? userRole : [userRole];
const isTasksetuAdmin = userRoles.includes('tasksetu-admin') || userRoles.includes('super-admin');
const isOrgAdmin = userRoles.includes('org_admin') || userRoles.includes('company-admin') || userRoles.includes('admin');
const isManager = userRoles.includes('manager');

if (!isManager && !isOrgAdmin && !isTasksetuAdmin) {
  return res.status(403).json({
    success: false,
    message: 'Access denied: Only Manager or Org Admin can link tasks to milestones. Employees can view linked tasks but cannot modify them.'
  });
}

// 🏔️ TASK TYPE VALIDATION FOR LINKING
if (task.taskType === 'quick' || task.isQuickTask === true) {
  return res.status(400).json({
    success: false,
    message: 'Quick tasks cannot be linked to milestones. Quick tasks are single-step actions.'
  });
}

if (task.taskType === 'approval' || task.isApprovalTask === true) {
  return res.status(400).json({
    success: false,
    message: 'Approval tasks cannot be linked to milestones. Approval tasks are atomic by design.'
  });
}

// 🏔️ RECURRING PATTERN VALIDATION
if (task.isRecurring === true && task.taskType === 'recurring' && !task.recurringInstanceOf) {
  return res.status(400).json({
    success: false,
    message: 'Recurring pattern cannot be linked to milestones. Only specific recurring instances can be linked.'
  });
}
```

### Supported Task Types for Linking:
| Task Type | Can Link? | Notes |
|-----------|-----------|-------|
| ✅ Regular Task | Yes | Fully supported |
| ✅ Recurring Instance | Yes | Individual occurrences only |
| ✅ Milestone (child) | Yes | Other milestones can be linked |
| ❌ Quick Task | **NO** | Single-step by design |
| ❌ Approval Task | **NO** | Atomic by design |
| ❌ Recurring Pattern | **NO** | Only instances allowed |

---

## 🔓 4. Unlinking Tasks from Milestone

### Location: `server/controller/milestoneTaskController.js` - `unlinkTaskFromMilestone` function

### Rules Implemented:
- ✅ **Only Manager, Org Admin, and Tasksetu Admin** can unlink tasks
- ✅ **Employee and Individual CANNOT** unlink tasks

### Code Added:
```javascript
// 🏔️ MILESTONE UNLINK TASK VALIDATION (Doc Ref: 4.3.2)
const userRoles = Array.isArray(userRole) ? userRole : [userRole];
const isTasksetuAdmin = userRoles.includes('tasksetu-admin') || userRoles.includes('super-admin');
const isOrgAdmin = userRoles.includes('org_admin') || userRoles.includes('company-admin') || userRoles.includes('admin');
const isManager = userRoles.includes('manager');

if (!isManager && !isOrgAdmin && !isTasksetuAdmin) {
  return res.status(403).json({
    success: false,
    message: 'Access denied: Only Manager or Org Admin can unlink tasks from milestones. Employees can view linked tasks but cannot modify them.'
  });
}
```

---

## 📊 5. Complete Access Control Matrix

### Milestone Task Operations:

| Action | Individual | Employee | Manager | Org Admin | Tasksetu Admin |
|--------|-----------|----------|---------|-----------|----------------|
| **Create Milestone** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **View Milestone** | ❌ | ✅ (assigned only) | ✅ | ✅ | ✅ |
| **Edit Milestone** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Delete Milestone** | ❌ | ❌ | ✅ (if OPEN) | ✅ | ✅ |
| **Link Task** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Unlink Task** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Create Subtask** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **View Subtask** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Edit Subtask** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Delete Subtask** | ❌ | ❌ | ✅ (if OPEN) | ✅ | ✅ |

### Regular Task Subtask Operations (for comparison):

| Action | Individual | Employee | Manager | Org Admin | Tasksetu Admin |
|--------|-----------|----------|---------|-----------|----------------|
| **Create Subtask** | ✅ (own/assigned) | ✅ (own/assigned) | ✅ | ✅ | ✅ |
| **View Subtask** | ✅ (own) | ✅ (own/assigned) | ✅ | ✅ | ✅ |
| **Edit Subtask** | ✅ (own) | ✅ (own/assigned) | ✅ | ✅ | ✅ |
| **Delete Subtask** | ✅ (own) | ✅ (own/assigned) | ✅ | ✅ | ✅ |

---

## 🎯 6. Key Differences: Milestone vs Regular Tasks

### Milestone Tasks (Restricted):
- **Creation**: Manager+ only
- **Subtask Creation**: Manager+ only
- **Link Task**: Manager+ only
- **Unlink Task**: Manager+ only
- **Purpose**: Major project phases/goals
- **Access**: Organization context required

### Regular Tasks (Flexible):
- **Creation**: All roles (including Employee, Individual)
- **Subtask Creation**: Creator or Assignee
- **Purpose**: Day-to-day work items
- **Access**: Individual or organization context

---

## 🔍 7. Validation Flow Diagram

```
┌─────────────────────────────────────────┐
│   User Attempts Milestone Operation    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Extract User Roles (Array/String)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Check Role Permissions                │
│   - Tasksetu Admin? → ✅ ALLOW          │
│   - Org Admin? → ✅ ALLOW               │
│   - Manager? → ✅ ALLOW                 │
│   - Employee? → ❌ DENY                 │
│   - Individual? → ❌ DENY               │
└──────────────┬──────────────────────────┘
               │
               ▼
         ┌─────┴─────┐
         │  DENIED?  │
         └─────┬─────┘
               │
        ┌──────┴──────┐
        │             │
       YES            NO
        │             │
        ▼             ▼
   ┌────────┐   ┌──────────┐
   │ Return │   │ Continue │
   │  403   │   │ with     │
   │ Error  │   │ Validation│
   └────────┘   └──────────┘
                      │
                      ▼
           ┌──────────────────┐
           │ Additional Checks│
           │ - Org Validation │
           │ - Status Check   │
           │ - Type Check     │
           └──────────────────┘
```

---

## 📝 8. Console Logging

All operations include comprehensive logging:

```javascript
console.log('🏔️ Milestone task detected - applying strict role validation:', {
  taskType: parentTask.taskType,
  isMilestone: parentTask.isMilestone,
  userRoles,
  isManager,
  isOrgAdmin,
  isTasksetuAdmin
});

console.log('✅ Milestone subtask permission granted for Manager/Admin');
```

### Log Emojis:
- 🏔️ = Milestone operation
- ✅ = Permission granted
- ❌ = Permission denied
- 🔗 = Link task operation
- 🔓 = Unlink task operation
- 🚀 = API call start
- 📋 = Task details

---

## 🧪 9. Testing Checklist

### Test Scenarios:

#### Milestone Creation:
- [ ] Individual user attempts to create milestone → **403 Error**
- [ ] Employee attempts to create milestone → **403 Error**
- [ ] Manager creates milestone → **Success**
- [ ] Org Admin creates milestone → **Success**
- [ ] Tasksetu Admin creates milestone → **Success**

#### Subtask Under Milestone:
- [ ] Individual user attempts to create milestone subtask → **403 Error**
- [ ] Employee attempts to create milestone subtask → **403 Error**
- [ ] Manager creates milestone subtask → **Success**
- [ ] Org Admin creates milestone subtask → **Success**
- [ ] Employee creates regular task subtask → **Success** (if own/assigned)

#### Link Task to Milestone:
- [ ] Individual user attempts to link task → **403 Error**
- [ ] Employee attempts to link task → **403 Error**
- [ ] Manager links regular task → **Success**
- [ ] Manager attempts to link quick task → **400 Error**
- [ ] Manager attempts to link approval task → **400 Error**
- [ ] Manager attempts to link recurring pattern → **400 Error**
- [ ] Manager links recurring instance → **Success**

#### Unlink Task from Milestone:
- [ ] Individual user attempts to unlink task → **403 Error**
- [ ] Employee attempts to unlink task → **403 Error**
- [ ] Manager unlinks task → **Success**
- [ ] Org Admin unlinks task → **Success**

---

## 🎓 10. Document References

All implementations follow these document sections:

- **Section 4.3.1**: Milestone Task Definition
- **Section 4.3.2**: User-Wise Control — Milestone Task Access
- **Section 4.3.5**: Subtasks Under Milestone
- **Section 2**: Supported Relationships (Task Types)

---

## ✅ Implementation Status

| Component | Status | File | Lines |
|-----------|--------|------|-------|
| Milestone Creation Validation | ✅ Complete | `taskController.js` | 99-136 |
| Subtask Creation Validation | ✅ Complete | `taskController.js` | 361-383 |
| Enhanced Permission Checks | ✅ Complete | `taskController.js` | 424-493 |
| Link Task Validation | ✅ Complete | `milestoneTaskController.js` | 485-521 |
| Task Type Link Validation | ✅ Complete | `milestoneTaskController.js` | 540-580 |
| Unlink Task Validation | ✅ Complete | `milestoneTaskController.js` | 604-655 |

---

## 🚀 Frontend Integration Guide

### Hide Buttons for Restricted Users:

```javascript
// In TaskActionsDropdown or similar components
const canCreateMilestone = ['MANAGER', 'ORG_ADMIN', 'TASKSETU_ADMIN'].includes(activeRole);
const canManageMilestoneSubtasks = task.taskType === 'milestone' 
  && ['MANAGER', 'ORG_ADMIN', 'TASKSETU_ADMIN'].includes(activeRole);

// Show milestone creation button
{canCreateMilestone && (
  <button onClick={() => openMilestoneForm()}>
    Create Milestone
  </button>
)}

// Show subtask button for milestone
{task.taskType === 'milestone' && canManageMilestoneSubtasks && (
  <button onClick={() => openSubtaskDrawer(task)}>
    Create Sub-task
  </button>
)}

// Show link task button for milestone
{task.taskType === 'milestone' && canManageMilestoneSubtasks && (
  <button onClick={() => openLinkTaskDrawer(task)}>
    Link Task
  </button>
)}
```

---

## 📞 Support

For any questions or issues with milestone task logic, refer to:
1. This implementation document
2. Original document specification (Section 4.3)
3. Code comments in controller files (🏔️ markers)

---

**Document Version**: 1.0  
**Last Updated**: Current Session  
**Implementation**: Complete ✅
