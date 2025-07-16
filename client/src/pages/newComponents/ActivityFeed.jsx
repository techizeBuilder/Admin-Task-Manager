
import React, { useState } from 'react'

export default function ActivityFeed({ taskId }) {
  const [activities] = useState([
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
  ])

  const [filter, setFilter] = useState('all')

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    if (filter === 'comments') return activity.type === 'comment_added' || activity.type === 'comment_edited'
    if (filter === 'updates') return activity.type === 'field_updated' || activity.type === 'status_changed' || activity.type === 'priority_changed'
    if (filter === 'files') return activity.type === 'file_attached' || activity.type === 'file_removed'
    if (filter === 'assignments') return activity.type === 'assignment_changed'
    if (filter === 'forms') return activity.type === 'form_attached' || activity.type === 'form_submitted'
    if (filter === 'system') return activity.type === 'reminder_sent' || activity.type === 'milestone_reached'
    return true
  })

  const getActivityIcon = (type) => {
    const icons = {
      task_created: '✅',
      field_updated: '✏️',
      subtask_added: '📝',
      subtask_completed: '✅',
      status_changed: '🔄',
      priority_changed: '🎯',
      assignment_changed: '👤',
      comment_added: '💬',
      comment_edited: '✏️',
      file_attached: '📎',
      file_removed: '🗑️',
      recurrence_updated: '🔁',
      form_attached: '📋',
      form_submitted: '✅',
      task_completed: '🎉',
      task_reopened: '🔄',
      milestone_reached: '🏆',
      reminder_sent: '🔔',
      task_snoozed: '😴'
    }
    return icons[type] || '📝'
  }

  const getActivityMessage = (activity) => {
    const { type, user, details } = activity
    
    switch (type) {
      case 'task_created':
        return `${user} created this task.`
      
      case 'field_updated':
        if (details.field === 'due_date') {
          return `Due Date changed from ${formatDate(details.oldValue)} to ${formatDate(details.newValue)}.`
        } else if (details.field === 'title') {
          return `Title changed from "${details.oldValue}" to "${details.newValue}".`
        } else if (details.field === 'description') {
          return `Description updated.`
        } else {
          return `${details.fieldLabel} changed from "${details.oldValue}" to "${details.newValue}".`
        }
      
      case 'subtask_added':
        return `Subtask '${details.subtaskTitle}' added by ${user}.`
      
      case 'subtask_completed':
        return `Subtask '${details.subtaskTitle}' completed by ${user}.`
      
      case 'status_changed':
        return `Status updated to '${details.newStatus}'.`
      
      case 'priority_changed':
        return `Priority changed to '${capitalizeFirst(details.newPriority)}'.`
      
      case 'assignment_changed':
        if (details.previousAssignee) {
          return `Task assigned to ${details.assignedTo} by ${user}.`
        } else {
          return `Task assigned to ${details.assignedTo} by ${user}.`
        }
      
      case 'comment_added':
        return (
          <span>
            {user} commented: 
            <span className="comment-preview" title="Click to view full comment">
              "{details.commentPreview.length > 50 
                ? details.commentPreview.substring(0, 50) + '...' 
                : details.commentPreview}"
            </span>
          </span>
        )
      
      case 'comment_edited':
        return (
          <span>
            {user} edited a comment: 
            <span className="comment-preview" title="Click to view full comment">
              "{details.commentPreview.length > 50 
                ? details.commentPreview.substring(0, 50) + '...' 
                : details.commentPreview}"
            </span>
          </span>
        )
      
      case 'file_attached':
        return `${details.fileName} (${details.fileSize}) added by ${user}.`
      
      case 'file_removed':
        return `${details.fileName} removed by ${user}.`
      
      case 'recurrence_updated':
        return `Recurring pattern updated from ${details.oldPattern} to ${details.newPattern}.`
      
      case 'form_attached':
        return `Form '${details.formTitle}' attached by ${user}.`
      
      case 'form_submitted':
        return `Form '${details.formTitle}' submitted.`
      
      case 'task_completed':
        return `Task marked Complete by ${user}.`
      
      case 'task_reopened':
        return `Task reopened by ${user}${details.reason ? ` - ${details.reason}` : ''}.`
      
      case 'milestone_reached':
        return `Milestone '${details.milestoneTitle}' reached.`
      
      case 'reminder_sent':
        return `System sent reminder: ${details.message} to ${details.recipient}.`
      
      case 'task_snoozed':
        const snoozeDate = new Date(details.snoozeUntil).toLocaleString()
        const noteText = details.note ? ` - ${details.note}` : ''
        return `Task snoozed until ${snoozeDate} by ${user}${noteText}.`
      
      default:
        return `${user} performed an action.`
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        })
      }
    }
  }

  const getUserAvatar = (user, userId) => {
    if (userId === 0 || user === 'System') {
      return (
        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
          <span className="text-xs text-white">⚙️</span>
        </div>
      )
    }
    
    const initials = user.split(' ').map(n => n[0]).join('').slice(0, 2)
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500']
    const colorIndex = userId % colors.length
    
    return (
      <div className={`w-8 h-8 ${colors[colorIndex]} rounded-full flex items-center justify-center`}>
        <span className="text-xs font-medium text-white">{initials}</span>
      </div>
    )
  }

  const groupActivitiesByDay = (activities) => {
    const groups = {}
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
    })
    return groups
  }

  const groupedActivities = groupActivitiesByDay(filteredActivities)

  const formatDayHeader = (dateString) => {
    const date = new Date(dateString)
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
    
    if (dateString === today) return 'Today'
    if (dateString === yesterday) return 'Yesterday'
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const handleCommentClick = (commentId) => {
    // In a real app, this would scroll to or highlight the comment
    console.log(`Navigate to comment ${commentId}`)
  }

  const handleFileClick = (fileId, fileName) => {
    // In a real app, this would download or preview the file
    console.log(`Open file ${fileName} (ID: ${fileId})`)
  }

  return (
    <div className="space-y-6 p-5 h-auto overflow-scroll">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Feed</h1>
          <p className="mt-2 text-lg text-gray-600">Track all task activities and changes</p>
        </div>
        <div className="mt-4 lg:mt-0">
          <select 
            className="form-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Activities</option>
            <option value="comments">Comments</option>
            <option value="updates">Field Updates</option>
            <option value="files">File Actions</option>
            <option value="assignments">Assignments</option>
            <option value="forms">Forms</option>
            <option value="system">System Actions</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {Object.entries(groupedActivities).map(([date, dayActivities]) => (
          <div key={date} className="activity-day-group">
            {/* Day Header */}
            <div className="day-header sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-3 z-10">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {formatDayHeader(date)}
              </h3>
            </div>

            {/* Day Activities */}
            <div className="space-y-1">
              {dayActivities.map((activity, index) => (
                <div key={activity.id} className="activity-item flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors duration-200 border-l-4 border-transparent hover:border-l-blue-200">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {getUserAvatar(activity.user, activity.userId)}
                  </div>
                  
                  {/* Activity Icon */}
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs">{getActivityIcon(activity.type)}</span>
                  </div>
                  
                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 activity-message">
                      {getActivityMessage(activity)}
                      
                      {/* Special click handlers for interactive elements */}
                      {(activity.type === 'comment_added' || activity.type === 'comment_edited') && (
                        <button
                          className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                          onClick={() => handleCommentClick(activity.details.commentId)}
                        >
                          View
                        </button>
                      )}
                      
                      {activity.type === 'file_attached' && (
                        <button
                          className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                          onClick={() => handleFileClick(activity.details.fileId, activity.details.fileName)}
                        >
                          Download
                        </button>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                      <span>{formatTimestamp(activity.timestamp)}</span>
                      
                      {/* Show exact timestamp on hover */}
                      <span 
                        className="cursor-help border-b border-dotted border-gray-400"
                        title={new Date(activity.timestamp).toLocaleString()}
                      >
                        ⓘ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-500">No activities found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
