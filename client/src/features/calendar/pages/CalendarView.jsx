import React, { useState } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useRole } from '../../shared/hooks/useRole';

/**
 * Calendar View - Future Integration Point
 * This will be the main calendar interface for task scheduling and time management
 */
const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const { canAccessFeature } = useRole();

  // Future: This will integrate with task due dates, recurring tasks, and external calendars

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-blue-600" size={28} />
              Calendar
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage your tasks and events
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canAccessFeature('calendar') && (
            <button className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
              <Settings size={18} />
            </button>
          )}
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            data-testid="button-create-event"
          >
            <Plus size={18} />
            Create Event
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setCurrentDate(newDate);
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 min-w-[180px]">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setCurrentDate(newDate);
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <button 
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            {['month', 'week', 'day'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Integration Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Calendar Integration Coming Soon
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          This will integrate with your tasks, show due dates, recurring task schedules, 
          and allow you to manage your time effectively. External calendar sync will also be available.
        </p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Task Integration</h4>
            <p className="text-sm text-blue-700">
              View task due dates and recurring schedules
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Time Blocking</h4>
            <p className="text-sm text-green-700">
              Schedule focused work sessions
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">External Sync</h4>
            <p className="text-sm text-purple-700">
              Connect Google, Outlook, and other calendars
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;