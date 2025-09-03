import React, { useState } from 'react';
import { RegularTaskForm } from '../../forms/RegularTaskForm';

export default function CreateTaskDrawer({ onClose, onSubmit }) {
  const [selectedTaskType, setSelectedTaskType] = useState(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-full max-w-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="close-modal"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedTaskType ? (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Type</h3>
                <p className="text-gray-600 text-sm">Choose the type of task you want to create</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Regular Task */}
                <button
                  onClick={() => setSelectedTaskType('regular')}
                  className="flex flex-col items-start p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                  data-testid="task-type-regular"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-500 text-white mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-900">Regular Task</h4>
                    <p className="text-sm text-gray-600 group-hover:text-blue-700">Standard one-time task</p>
                  </div>
                </button>

                {/* Recurring Task */}
                <button
                  onClick={() => setSelectedTaskType('recurring')}
                  className="flex flex-col items-start p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                  data-testid="task-type-recurring"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-500 text-white mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-900">Recurring Task</h4>
                    <p className="text-sm text-gray-600 group-hover:text-blue-700">Repeats on schedule</p>
                  </div>
                </button>

                {/* Milestone */}
                <button
                  onClick={() => setSelectedTaskType('milestone')}
                  className="flex flex-col items-start p-4 border border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all group text-left"
                  data-testid="task-type-milestone"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-red-500 text-white mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-red-900">Milestone</h4>
                    <p className="text-sm text-gray-600 group-hover:text-red-700">Project checkpoint</p>
                  </div>
                </button>

                {/* Approval Task */}
                <button
                  onClick={() => setSelectedTaskType('approval')}
                  className="flex flex-col items-start p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group text-left"
                  data-testid="task-type-approval"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-green-500 text-white mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-green-900">Approval Task</h4>
                    <p className="text-sm text-gray-600 group-hover:text-green-700">Requires approval</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                <button
                  onClick={() => setSelectedTaskType(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  data-testid="back-to-types"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
                  <p className="text-gray-600 text-sm">Fill in the basic information for your task</p>
                </div>
              </div>

              {/* Dynamic Task Content Based on Type */}
              <RegularTaskForm
                onSubmit={(data) => {
                  onSubmit({
                    title: data.taskName,
                    description: data.description,
                    assignedTo: data.assignedTo,
                    priority: data.priority,
                    taskType: selectedTaskType,
                    category: "general",
                    visibility: data.visibility,
                    dueDate: data.dueDate,
                    tags: data.tags ? data.tags.split(',').filter(tag => tag.trim()) : [],
                    collaborators: [],
                    attachments: data.attachments || []
                  });
                }}
                onCancel={onClose}
                isOrgUser={true}
                isSoloUser={false}
                taskType={selectedTaskType}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}