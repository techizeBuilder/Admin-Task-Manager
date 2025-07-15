
import React, { useState, useEffect } from 'react'
import CreateTask from './CreateTask'

export default function Calendar({ onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // month, week, day
  const [recurringTasks, setRecurringTasks] = useState([])
  const [upcomingInstances, setUpcomingInstances] = useState([])
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  // Mock recurring tasks data
  useEffect(() => {
    const mockRecurringTasks = [
      {
        id: 1,
        title: "Weekly Team Standup",
        frequency: "weekly",
        repeatEvery: 1,
        repeatOnDays: ["Mon"],
        startDate: "2024-01-01",
        time: "10:00",
        status: "active",
        nextInstance: "2024-01-29"
      },
      {
        id: 2,
        title: "Monthly Security Review",
        frequency: "monthly",
        repeatEvery: 1,
        startDate: "2024-01-01",
        time: "09:00",
        status: "active",
        nextInstance: "2024-02-01"
      },
      {
        id: 3,
        title: "Daily Code Backup",
        frequency: "daily",
        repeatEvery: 1,
        startDate: "2024-01-01",
        time: "23:00",
        status: "active",
        nextInstance: "2024-01-29"
      }
    ]
    setRecurringTasks(mockRecurringTasks)
    generateUpcomingInstances(mockRecurringTasks)
  }, [])

  const generateUpcomingInstances = (tasks) => {
    const instances = []
    const today = new Date()
    
    tasks.forEach(task => {
      if (task.status === 'active') {
        // Generate only the next upcoming instance for each recurring task
        const nextDate = new Date(task.nextInstance)
        if (nextDate >= today) {
          instances.push({
            id: `${task.id}_${nextDate.getTime()}`,
            recurringTaskId: task.id,
            title: task.title,
            date: nextDate.toISOString().split('T')[0],
            time: task.time,
            frequency: task.frequency,
            isRecurring: true
          })
        }
      }
    })
    
    setUpcomingInstances(instances)
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getTasksForDate = (date) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return upcomingInstances.filter(instance => instance.date === dateStr)
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const handleDateClick = (date) => {
    if (date) {
      const dateStr = date.toISOString().split('T')[0]
      setShowCreateTask(true)
      setSelectedDate(dateStr)
    }
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="calendar-container bg-white border border-gray-200 rounded-lg">
      {/* Calendar Header */}
      <div className="calendar-header p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">📅 Recurring Tasks Calendar</h2>
            <span className="text-sm text-gray-500">
              Showing next upcoming instances only
            </span>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-lg font-medium text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Today
            </button>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="calendar-body p-4">
        {viewMode === 'month' && (
          <div className="calendar-grid">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((date, index) => {
                const tasksForDate = getTasksForDate(date)
                const isToday = date && date.toDateString() === new Date().toDateString()
                
                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-2 border border-gray-100 rounded-lg
                      ${date ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'}
                      ${isToday ? 'border-blue-500 bg-blue-50' : ''}
                      transition-colors
                    `}
                    onClick={() => handleDateClick(date)}
                    title={date ? `Click to create task for ${date.toDateString()}` : ''}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {tasksForDate.map(task => (
                            <div
                              key={task.id}
                              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md cursor-pointer hover:bg-green-200 transition-colors"
                              title={`🔁 ${task.title} - ${task.time} (Recurring ${task.frequency})`}
                            >
                              <div className="flex items-center gap-1">
                                <span>🔁</span>
                                <span className="truncate">{task.title}</span>
                              </div>
                              <div className="text-green-600">{task.time}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {viewMode === 'week' && (
          <div className="week-view">
            <div className="text-center text-gray-500 mb-4">
              Week view coming soon...
            </div>
          </div>
        )}

        {viewMode === 'day' && (
          <div className="day-view">
            <div className="text-center text-gray-500 mb-4">
              Day view coming soon...
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="calendar-footer p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Recurring Task Instance</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔁</span>
              <span>Recurring Task Indicator</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Only showing next upcoming instance per recurring pattern
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0">
          <div className="drawer-overlay absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateTask(false)}></div>
          <div className="absolute right-0 top-0 h-full bg-white/95 backdrop-blur-sm flex flex-col modal-animate-slide-right" style={{width: 'min(90vw, 600px)', boxShadow: '-10px 0 50px rgba(0,0,0,0.2)', borderLeft: '1px solid rgba(255,255,255,0.2)'}}>
            <div className="drawer-header">
              <h2 className="text-2xl font-bold text-white">Create Task for {selectedDate}</h2>
              <button
                onClick={() => setShowCreateTask(false)}
                className="close-btn"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="drawer-body">
              <CreateTask 
                onClose={() => setShowCreateTask(false)} 
                preFilledDate={selectedDate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
