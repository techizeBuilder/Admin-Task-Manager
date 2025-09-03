import React, { useState, useEffect } from "react";
import { ClipboardCheck, Plus } from "lucide-react";
import useTasksStore from "../stores/tasksStore";
import TaskDrawer from "../components/common/TaskDrawer";
import { TaskForm } from "../forms/TaskForm";
import AllTasks from "./newComponents/AllTasks";

export default function Approvals() {
  const { tasks } = useTasksStore();
  const [showDrawer, setShowDrawer] = useState(false);

  // Filter only approval tasks
  const approvals = tasks.filter(task => task.type === "approval");

  // Auto-open drawer when page loads (simulating submenu click)
  useEffect(() => {
    setShowDrawer(true);
  }, []);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <ClipboardCheck className="w-6 h-6 text-orange-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
            <p className="text-gray-600">Tasks requiring approval or sign-off</p>
          </div>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          data-testid="button-create-approval"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Approval
        </button>
      </div>

      {/* Approval Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">{approvals.length}</p>
              <p className="text-sm text-gray-600">Total Approvals</p>
            </div>
            <ClipboardCheck className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {approvals.filter(a => a.status === "pending_approval" || a.status === "To Do").length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-yellow-600 rounded-full" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {approvals.filter(a => a.status === "under_review" || a.status === "In Progress").length}
              </p>
              <p className="text-sm text-gray-600">Under Review</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {approvals.filter(a => a.status === "approved" || a.status === "Completed").length}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Approval Process Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <ClipboardCheck className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Approval Process</h3>
            <p className="text-sm text-blue-700">
              Create tasks that require approval from team members or stakeholders. Define approval criteria, 
              add approvers, and track the approval status throughout the process.
            </p>
          </div>
        </div>
      </div>

      {/* Approvals Table - Show only approval tasks */}
      <div className="bg-white rounded-lg border border-gray-200">
        <AllTasks filterByType="approval" />
      </div>

      {/* Approval Task Creation Drawer */}
      <TaskDrawer 
        isOpen={showDrawer} 
        onClose={() => setShowDrawer(false)}
        title="Create Approval Task"
      >
        <TaskForm 
          onClose={() => setShowDrawer(false)}
          onSubmit={(task) => console.log('Approval task created:', task)}
          initialData={{
            isApproval: true,
            priority: "medium"
          }}
        />
      </TaskDrawer>
    </div>
  );
}