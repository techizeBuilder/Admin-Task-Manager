import React, { useState, useEffect } from 'react';

// Simple Task Form Component
const SimpleTaskForm = ({ taskType }) => {
  const getTaskTypeDisplay = (type) => {
    switch(type) {
      case 'regular': return 'Regular Task';
      case 'recurring': return 'Recurring Task'; 
      case 'milestone': return 'Milestone';
      case 'approval': return 'Approval Task';
      default: return type.charAt(0).toUpperCase() + type.slice(1) + ' Task';
    }
  };

  return (
    <div className="p-8 text-center">
      <div className="bg-gray-100 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{getTaskTypeDisplay(taskType)}</h2>
        <p className="text-gray-600">This form will be customized for {taskType} task creation</p>
      </div>
    </div>
  );
};



// Main RegularTaskForm Component
export const RegularTaskForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = {},
  isOrgUser = false,
  isSoloUser = false,
  taskType = 'regular'
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder submit
    onSubmit({ taskType });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SimpleTaskForm taskType={taskType} />
      
      {/* Action Buttons */}
      <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
          data-testid="button-cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          data-testid="button-save"
        >
          Save Task
        </button>
      </div>
    </form>
  );
};

export default RegularTaskForm;