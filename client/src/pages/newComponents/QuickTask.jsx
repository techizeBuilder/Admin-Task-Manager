import React from 'react';
import { QuickTasksManager } from '../../components/tasks/QuickAddBar';

/**
 * Quick Tasks Page Component
 * This is the main page for Quick Tasks management.
 * It uses the QuickTasksManager component for full functionality.
 */
export default function QuickTask() {
    return (
        <div className="min-h-screen bg-gray-50">
            <QuickTasksManager />
        </div>
    );
}