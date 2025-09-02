
import { create } from 'zustand'

const useActivityStore = create((set, get) => ({
  activities: [
    {
      id: 1,
      type: 'task_created',
      user: 'John Smith',
      userId: 1,
      timestamp: '2024-01-15 09:00',
      details: {
        taskTitle: 'Database Migration'
      }
    },
    {
      id: 2,
      type: 'field_updated',
      user: 'Sarah Wilson',
      userId: 2,
      timestamp: '2024-01-15 10:15',
      details: {
        field: 'due_date',
        fieldLabel: 'Due Date',
        oldValue: '2024-05-01',
        newValue: '2024-05-07'
      }
    },
    {
      id: 3,
      type: 'field_updated',
      user: 'Mike Johnson',
      userId: 3,
      timestamp: '2024-01-15 10:30',
      details: {
        field: 'title',
        fieldLabel: 'Title',
        oldValue: 'Database Setup',
        newValue: 'Database Migration'
      }
    },
    {
      id: 4,
      type: 'subtask_added',
      user: 'Jane Smith',
      userId: 4,
      timestamp: '2024-01-15 11:30',
      details: {
        subtaskTitle: 'Design Mockup',
        subtaskId: 101
      }
    },
    {
      id: 5,
      type: 'status_changed',
      user: 'Emily Davis',
      userId: 5,
      timestamp: '2024-01-15 12:45',
      details: {
        oldStatus: 'Open',
        newStatus: 'In Progress'
      }
    },
    {
      id: 6,
      type: 'priority_changed',
      user: 'Sarah Wilson',
      userId: 2,
      timestamp: '2024-01-15 13:15',
      details: {
        oldPriority: 'medium',
        newPriority: 'high'
      }
    },
    {
      id: 7,
      type: 'assignment_changed',
      user: 'Admin User',
      userId: 0,
      timestamp: '2024-01-15 14:20',
      details: {
        assignedTo: 'Sarah Wilson',
        assignedToId: 2,
        previousAssignee: 'Mike Johnson'
      }
    },
    {
      id: 8,
      type: 'comment_added',
      user: 'Jane Smith',
      userId: 4,
      timestamp: '2024-01-15 15:45',
      details: {
        commentId: 123,
        commentPreview: 'I\'ve started working on the database schema and found some issues...',
        isEdited: false
      }
    },
    {
      id: 9,
      type: 'comment_edited',
      user: 'Jane Smith',
      userId: 4,
      timestamp: '2024-01-15 16:00',
      details: {
        commentId: 123,
        commentPreview: 'I\'ve started working on the database schema and resolved the issues...',
        isEdited: true
      }
    },
    {
      id: 10,
      type: 'file_attached',
      user: 'Anil Kumar',
      userId: 6,
      timestamp: '2024-01-15 16:20',
      details: {
        fileName: 'Report.docx',
        fileSize: '2.5MB',
        fileId: 'file_123'
      }
    },
    {
      id: 11,
      type: 'file_removed',
      user: 'John Smith',
      userId: 1,
      timestamp: '2024-01-15 17:30',
      details: {
        fileName: 'Wireframe.png',
        fileSize: '1.2MB'
      }
    },
    {
      id: 12,
      type: 'recurrence_updated',
      user: 'Mike Johnson',
      userId: 3,
      timestamp: '2024-01-15 18:00',
      details: {
        oldPattern: 'Weekly',
        newPattern: 'Bi-weekly',
        nextInstance: '2024-01-29'
      }
    },
    {
      id: 13,
      type: 'form_attached',
      user: 'Sarah Wilson',
      userId: 2,
      timestamp: '2024-01-16 09:15',
      details: {
        formTitle: 'Vendor Review',
        formId: 'form_456'
      }
    },
    {
      id: 14,
      type: 'form_submitted',
      user: 'Emily Davis',
      userId: 5,
      timestamp: '2024-01-16 10:30',
      details: {
        formTitle: 'Vendor Review',
        formId: 'form_456',
        submittedBy: 'Emily Davis'
      }
    },
    {
      id: 15,
      type: 'task_completed',
      user: 'Ajay Patel',
      userId: 7,
      timestamp: '2024-01-16 14:45',
      details: {
        previousStatus: 'In Progress'
      }
    },
    {
      id: 16,
      type: 'task_reopened',
      user: 'Neha Singh',
      userId: 8,
      timestamp: '2024-01-16 16:20',
      details: {
        previousStatus: 'Completed',
        newStatus: 'In Progress',
        reason: 'Found additional requirements'
      }
    },
    {
      id: 17,
      type: 'subtask_completed',
      user: 'Jane Smith',
      userId: 4,
      timestamp: '2024-01-16 17:00',
      details: {
        subtaskTitle: 'Design Mockup',
        subtaskId: 101
      }
    },
    {
      id: 18,
      type: 'milestone_reached',
      user: 'System',
      userId: 0,
      timestamp: '2024-01-16 18:00',
      details: {
        milestoneTitle: 'Phase 1 Complete',
        milestoneId: 'milestone_789'
      }
    },
    {
      id: 19,
      type: 'reminder_sent',
      user: 'System',
      userId: 0,
      timestamp: '2024-01-17 09:00',
      details: {
        reminderType: 'due_date',
        message: 'Task due in 3 days',
        recipient: 'Sarah Wilson'
      }
    },
    {
      id: 20,
      type: 'task_snoozed',
      user: 'Mike Johnson',
      userId: 3,
      timestamp: '2024-01-17 10:30',
      details: {
        snoozeUntil: '2024-01-23T09:00',
        note: 'Waiting for API changes to be finalized'
      }
    }
  ],
  
  filter: 'all',
  
  // Actions
  setFilter: (filter) => set({ filter }),
  
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities]
  })),
  
  getFilteredActivities: () => {
    const { activities, filter } = get()
    
    if (filter === 'all') return activities
    if (filter === 'comments') return activities.filter(activity => 
      activity.type === 'comment_added' || activity.type === 'comment_edited'
    )
    if (filter === 'updates') return activities.filter(activity => 
      activity.type === 'field_updated' || activity.type === 'status_changed' || activity.type === 'priority_changed'
    )
    if (filter === 'files') return activities.filter(activity => 
      activity.type === 'file_attached' || activity.type === 'file_removed'
    )
    if (filter === 'assignments') return activities.filter(activity => 
      activity.type === 'assignment_changed'
    )
    if (filter === 'forms') return activities.filter(activity => 
      activity.type === 'form_attached' || activity.type === 'form_submitted'
    )
    if (filter === 'system') return activities.filter(activity => 
      activity.type === 'reminder_sent' || activity.type === 'milestone_reached'
    )
    
    return activities
  }
}))

export default useActivityStore
