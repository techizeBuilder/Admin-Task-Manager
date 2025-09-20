import React, { useState } from 'react';
import { RegularTaskForm } from '../forms/RegularTaskForm';

export const TaskModal = ({ isOpen, onClose }) => {
    const [isOrgUser, setIsOrgUser] = useState(true); // Set based on user role

    const handleTaskCreated = (taskData) => {
        console.log('Task created:', taskData);
        // Refresh task list or update state
        // Close modal
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">
                    <RegularTaskForm
                        onSubmit={handleTaskCreated}
                        onCancel={handleCancel}
                        isOrgUser={isOrgUser}
                    />
                </div>
            </div>
        </div>
    );
};

export default TaskModal;