import React, { useState, useEffect } from "react";
import { Zap, Plus } from "lucide-react";
import useTasksStore from "../stores/tasksStore";
import TaskDrawer from "../components/common/TaskDrawer";
import { TaskForm } from "../forms/TaskForm";
import AllTasks from "./newComponents/AllTasks";

export default function QuickTasks() {
  const { tasks } = useTasksStore();
  const [showDrawer, setShowDrawer] = useState(false);

  // Filter only quick tasks
  const quickTasks = tasks.filter(task => task.type === "quick");

  // Auto-open drawer when page loads (simulating submenu click)
  useEffect(() => {
    setShowDrawer(true);
  }, []);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Zap className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quick Tasks</h1>
            <p className="text-gray-600">Fast and simple task creation</p>
          </div>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          data-testid="button-create-quick-task"
        >
          <Plus className="w-4 h-4 mr-2" />
          Quick Task
        </button>
      </div>

      {/* Quick Tasks Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{quickTasks.length}</p>
              <p className="text-sm text-gray-600">Total Quick Tasks</p>
            </div>
            <Zap className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {quickTasks.filter(t => t.status === "To Do").length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-orange-600 rounded-full" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {quickTasks.filter(t => t.status === "Completed").length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Table - Show only quick tasks */}
      <div className="bg-white rounded-lg border border-gray-200">
        <AllTasks filterByType="quick" />
      </div>

      {/* Quick Task Creation Drawer */}
      <TaskDrawer 
        isOpen={showDrawer} 
        onClose={() => setShowDrawer(false)}
        title="Create Quick Task"
      >
        <TaskForm 
          onClose={() => setShowDrawer(false)}
          onSubmit={(task) => console.log('Quick task created:', task)}
          initialData={{
            priority: "medium",
            visibility: "private"
          }}
        />
      </TaskDrawer>
    </div>
  );
}