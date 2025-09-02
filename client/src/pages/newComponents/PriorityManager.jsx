import React from 'react';

// Priority calculation utility
export const calculateDueDateFromPriority = (priority, startDate = new Date()) => {
  const baseDate = new Date(startDate);
  
  switch (priority?.toLowerCase()) {
    case 'critical':
    case 'high':
      // High priority: 1-3 days
      baseDate.setDate(baseDate.getDate() + 2);
      break;
    case 'medium':
      // Medium priority: 1 week
      baseDate.setDate(baseDate.getDate() + 7);
      break;
    case 'low':
      // Low priority: 2 weeks
      baseDate.setDate(baseDate.getDate() + 14);
      break;
    default:
      // Default: 1 week
      baseDate.setDate(baseDate.getDate() + 7);
      break;
  }
  
  return baseDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
};

// Priority color helper
export const getPriorityColor = (priority) => {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-green-100 text-green-800 border-green-200',
  };
  return colors[priority?.toLowerCase()] || colors.medium;
};

// Priority icon helper
export const getPriorityIcon = (priority) => {
  const icons = {
    critical: '🔴',
    high: '🟠', 
    medium: '🟡',
    low: '🟢',
  };
  return icons[priority?.toLowerCase()] || icons.medium;
};

const PriorityManager = ({ priority, onChange }) => {
  const priorities = ['low', 'medium', 'high', 'critical'];
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Priority Level
      </label>
      <div className="flex gap-2">
        {priorities.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange?.(p)}
            className={`
              px-3 py-2 rounded-md border text-sm font-medium capitalize transition-colors
              ${priority === p 
                ? getPriorityColor(p)
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }
            `}
          >
            {getPriorityIcon(p)} {p}
          </button>
        ))}
      </div>
      {priority && (
        <p className="text-xs text-gray-500">
          Estimated due: {calculateDueDateFromPriority(priority)}
        </p>
      )}
    </div>
  );
};

export default PriorityManager;