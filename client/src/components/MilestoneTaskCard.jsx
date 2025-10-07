import React from 'react';
import { Star, Target, Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * MilestoneTaskCard - Displays milestone task with progress tracking
 */
const MilestoneTaskCard = ({ 
  milestone, 
  onEdit, 
  onDelete, 
  onMarkAchieved, 
  onLinkTask, 
  onUnlinkTask 
}) => {
  // Calculate progress based on linked tasks
  const calculateProgress = () => {
    if (!milestone.linkedTasks || milestone.linkedTasks.length === 0) return 0;
    
    const completedTasks = milestone.linkedTasks.filter(
      task => task.status === 'completed' || task.completionPercentage === 100
    );
    
    return Math.round((completedTasks.length / milestone.linkedTasks.length) * 100);
  };

  const progress = milestone.progressPercentage || calculateProgress();
  const isOverdue = milestone.isOverdue || (new Date(milestone.dueDate) < new Date() && milestone.status !== 'ACHIEVED');
  const isAchieved = milestone.status === 'ACHIEVED';

  // Status badge styling
  const getStatusBadge = () => {
    const statusMap = {
      'OPEN': { label: 'Open', color: 'bg-blue-100 text-blue-800' },
      'INPROGRESS': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
      'ACHIEVED': { label: 'Achieved', color: 'bg-green-100 text-green-800' },
      'CANCELLED': { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    };
    
    const status = statusMap[milestone.status] || statusMap['OPEN'];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
        {status.label}
      </span>
    );
  };

  // Priority badge styling
  const getPriorityBadge = () => {
    const priorityMap = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    
    const color = priorityMap[milestone.priority] || priorityMap['medium'];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color}`}>
        {milestone.priority || 'medium'}
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-lg border ${isOverdue ? 'border-red-300' : 'border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isAchieved ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {isAchieved ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Star className="w-5 h-5 text-yellow-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{milestone.title}</h3>
              {milestone.description && (
                <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            {getPriorityBadge()}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              progress === 100 ? 'bg-green-500' : progress >= 75 ? 'bg-blue-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Linked Tasks */}
      {milestone.linkedTasks && milestone.linkedTasks.length > 0 && (
        <div className="px-4 pb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Linked Tasks ({milestone.linkedTasks.length})
          </h4>
          <div className="space-y-1">
            {milestone.linkedTasks.slice(0, 3).map((task, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <span className="text-gray-600 truncate">{task.taskTitle}</span>
              </div>
            ))}
            {milestone.linkedTasks.length > 3 && (
              <div className="text-xs text-gray-500">
                +{milestone.linkedTasks.length - 3} more tasks
              </div>
            )}
          </div>
        </div>
      )}

      {/* Due Date & Info */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className={`${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
              Due: {new Date(milestone.dueDate).toLocaleDateString()}
            </span>
            {isOverdue && !isAchieved && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(milestone)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            {!isAchieved && progress === 100 && (
              <button
                onClick={() => onMarkAchieved(milestone._id)}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Mark Achieved
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {milestone.linkedTasks && milestone.linkedTasks.length > 0 && (
              <span className="text-xs text-gray-500 flex items-center">
                <Target className="w-3 h-3 mr-1" />
                {milestone.linkedTasks.length} linked
              </span>
            )}
            <button
              onClick={() => onDelete(milestone._id)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneTaskCard;