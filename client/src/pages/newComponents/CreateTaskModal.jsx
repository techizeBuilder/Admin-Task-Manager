import React, { useState } from 'react';
import { RegularTaskContent } from '../../components/forms/RegularTaskContent';
import { MilestoneTaskContent } from '../../components/forms/MilestoneTaskContent';
import { EnhancedRegularTaskContent } from '../../components/forms/EnhancedRegularTaskContent';
import { RegularTaskForm } from '../../forms/RegularTaskForm';

export default function CreateTaskModal({ onClose, onSubmit, initialTaskType = 'regular' }) {
  const [selectedTaskType, setSelectedTaskType] = useState(initialTaskType);
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('Normal');
  
  // Additional fields
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  
  // Milestone specific fields
  const [milestoneType, setMilestoneType] = useState('project');
  const [linkedTasks, setLinkedTasks] = useState([]);
  
  // Special task type toggles
  const [showRecurring, setShowRecurring] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showApproval, setShowApproval] = useState(false);

  const taskTypes = [
    {
      id: 'regular',
      name: 'Regular Task',
      description: 'Standard one-time task',
      icon: '📋',
      iconBg: 'bg-blue-500',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'recurring',
      name: 'Recurring Task', 
      description: 'Repeats on schedule',
      icon: '🔄',
      iconBg: 'bg-blue-500',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'milestone',
      name: 'Milestone',
      description: 'Project checkpoint',
      icon: '🎯',
      iconBg: 'bg-red-500',
      borderColor: 'border-red-500',
      bgColor: 'bg-red-50'
    },
    {
      id: 'approval',
      name: 'Approval Task',
      description: 'Requires approval',
      icon: '✅',
      iconBg: 'bg-green-500',
      borderColor: 'border-green-500',
      bgColor: 'bg-green-50'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: taskName,
      description,
      assignedTo,
      priority,
      taskType: selectedTaskType,
      category: "general",
      visibility: "private",
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tags: [],
      collaborators: [],
      attachments: []
    });
  };

  const characterCount = taskName.length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
          {/* Task Type Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Task Type</h3>
            <p className="text-gray-600 mb-4">Choose the type of task you want to create</p>
            
            <div className="grid grid-cols-2 gap-3">
              {taskTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedTaskType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                    selectedTaskType === type.id
                      ? `${type.borderColor} ${type.bgColor}`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  data-testid={`task-type-${type.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedTaskType === type.id ? type.iconBg : 'bg-gray-200'
                    } text-white`}>
                      <span className="text-lg">{type.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Task Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Task Details</h3>
            <p className="text-gray-600 mb-4">Fill in the basic information for your task</p>

            {/* Dynamic Task Content Based on Type */}
            {selectedTaskType === 'regular' && (
              <div className="mt-4">
                <RegularTaskForm
                  onSubmit={(data) => {
                    // Transform data to match expected format
                    onSubmit({
                      title: data.taskName,
                      description: data.description,
                      assignedTo: data.assignedTo,
                      priority: data.priority,
                      taskType: selectedTaskType,
                      category: "general",
                      visibility: data.visibility,
                      dueDate: data.dueDate,
                      tags: data.tags.split(',').filter(tag => tag.trim()),
                      collaborators: [],
                      attachments: data.attachments || []
                    });
                  }}
                  onCancel={onClose}
                  isOrgUser={true}
                  isSoloUser={false}
                />
              </div>
            )}

            {selectedTaskType === 'milestone' && (
              <MilestoneTaskContent
                taskName={taskName}
                setTaskName={setTaskName}
                description={description}
                setDescription={setDescription}
                assignedTo={assignedTo}
                setAssignedTo={setAssignedTo}
                priority={priority}
                setPriority={setPriority}
                characterCount={characterCount}
                milestoneType={milestoneType}
                setMilestoneType={setMilestoneType}
                linkedTasks={linkedTasks}
                setLinkedTasks={setLinkedTasks}
                dueDate={dueDate}
                setDueDate={setDueDate}
              />
            )}

            {selectedTaskType === 'recurring' && (
              <EnhancedRegularTaskContent
                taskName={taskName}
                setTaskName={setTaskName}
                description={description}
                setDescription={setDescription}
                assignedTo={assignedTo}
                setAssignedTo={setAssignedTo}
                priority={priority}
                setPriority={setPriority}
                characterCount={characterCount}
                category={category}
                setCategory={setCategory}
                dueDate={dueDate}
                setDueDate={setDueDate}
                tags={tags}
                setTags={setTags}
                collaborators={collaborators}
                setCollaborators={setCollaborators}
                showRecurring={true}
                setShowRecurring={setShowRecurring}
                showMilestone={showMilestone}
                setShowMilestone={setShowMilestone}
                showApproval={showApproval}
                setShowApproval={setShowApproval}
              />
            )}

            {selectedTaskType === 'approval' && (
              <EnhancedRegularTaskContent
                taskName={taskName}
                setTaskName={setTaskName}
                description={description}
                setDescription={setDescription}
                assignedTo={assignedTo}
                setAssignedTo={setAssignedTo}
                priority={priority}
                setPriority={setPriority}
                characterCount={characterCount}
                category={category}
                setCategory={setCategory}
                dueDate={dueDate}
                setDueDate={setDueDate}
                tags={tags}
                setTags={setTags}
                collaborators={collaborators}
                setCollaborators={setCollaborators}
                showRecurring={showRecurring}
                setShowRecurring={setShowRecurring}
                showMilestone={showMilestone}
                setShowMilestone={setShowMilestone}
                showApproval={true}
                setShowApproval={setShowApproval}
              />
            )}
          </div>

        {/* Actions - Only show for non-regular tasks */}
        {selectedTaskType !== 'regular' && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              data-testid="button-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!taskName || !assignedTo}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              data-testid="button-create-task"
            >
              Create Task
            </button>
          </div>
        )}
      </form>
    </div>
  );
}