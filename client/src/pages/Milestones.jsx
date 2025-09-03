import React, { useState, useEffect } from "react";
import { Target, Plus } from "lucide-react";
import useTasksStore from "../stores/tasksStore";
import TaskDrawer from "../components/common/TaskDrawer";
import MilestoneTaskForm from "../forms/MilestoneTaskForm";
import AllTasks from "./newComponents/AllTasks";

export default function Milestones() {
  const { tasks } = useTasksStore();
  const [showDrawer, setShowDrawer] = useState(false);

  // Filter only milestone tasks
  const milestones = tasks.filter(task => task.type === "milestone");

  // Auto-open drawer when page loads (simulating submenu click)
  useEffect(() => {
    setShowDrawer(true);
  }, []);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Target className="w-6 h-6 text-purple-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
            <p className="text-gray-600">Important project milestones and deadlines</p>
          </div>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          data-testid="button-create-milestone"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Milestone
        </button>
      </div>

      {/* Milestones Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">{milestones.length}</p>
              <p className="text-sm text-gray-600">Total Milestones</p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {milestones.filter(m => m.status === "not_started" || m.status === "To Do").length}
              </p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-orange-600 rounded-full" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {milestones.filter(m => m.status === "In Progress" || m.status === "in_progress").length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
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
                {milestones.filter(m => m.status === "Completed" || m.status === "completed").length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Milestones Table - Show only milestone tasks */}
      <div className="bg-white rounded-lg border border-gray-200">
        <AllTasks filterByType="milestone" />
      </div>

      {/* Milestone Creation Drawer */}
      <TaskDrawer 
        isOpen={showDrawer} 
        onClose={() => setShowDrawer(false)}
        title="Create Milestone"
      >
        <MilestoneTaskForm 
          onClose={() => setShowDrawer(false)}
          onSubmit={(task) => console.log('Milestone created:', task)}
        />
      </TaskDrawer>
    </div>
  );
}