import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import RegularTaskDrawer from "./newComponents/RegularTaskDrawer";

export default function TaskCreate() {
  const [showDrawer, setShowDrawer] = useState(false);

  // Auto-open drawer when page loads (simulating submenu click)
  useEffect(() => {
    setShowDrawer(true);
  }, []);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Plus className="w-6 h-6 text-green-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Task</h1>
            <p className="text-gray-600">Create a new regular task</p>
          </div>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          data-testid="button-create-regular-task"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </button>
      </div>

      {/* Task Creation Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ready to Create a Task?
          </h2>
          <p className="text-gray-600 mb-6">
            Click the button above to open the task creation form. You can create regular tasks 
            with detailed descriptions, assignments, attachments, and more.
          </p>
          <button
            onClick={() => setShowDrawer(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            data-testid="button-open-task-creator"
          >
            Open Task Creator
          </button>
        </div>
      </div>

      {/* Regular Task Creation Drawer */}
      <RegularTaskDrawer 
        isOpen={showDrawer} 
        onClose={() => setShowDrawer(false)} 
      />
    </div>
  );
}