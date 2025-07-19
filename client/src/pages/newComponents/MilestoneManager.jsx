import React, { useState } from "react";
import MilesToneCreateModal from "./MilesToneCreateModal";

// Helper functions moved outside component
const getStatusColor = (status) => {
  const colors = {
    not_started: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getPriorityColor = (priority) => {
  const colors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
    critical: "bg-purple-100 text-purple-800",
  };
  return colors[priority] || "bg-gray-100 text-gray-800";
};

export default function MilestoneManager() {
  const [milestones, setMilestones] = useState([
    {
      id: 1,
      taskName: "Project Alpha Launch",
      isMilestone: true,
      milestoneType: "standalone",
      linkedTasks: [1, 2, 3, 4],
      dueDate: "2024-02-15",
      assignedTo: "John Smith",
      description: "Complete launch of the new project management system",
      visibility: "public",
      priority: "high",
      collaborators: ["Sarah Wilson", "Mike Johnson"],
      status: "in_progress",
      progress: 75,
      tasks: [
        { id: 1, title: "UI Design Complete", completed: true },
        { id: 2, title: "Backend API Development", completed: true },
        { id: 3, title: "Testing Phase", completed: false },
        { id: 4, title: "Deployment", completed: false },
      ],
    },
    {
      id: 2,
      taskName: "Q1 Marketing Campaign",
      isMilestone: true,
      milestoneType: "linked",
      linkedTasks: [5, 6, 7],
      dueDate: "2024-03-31",
      assignedTo: "Emily Davis",
      description: "Launch comprehensive marketing campaign for Q1",
      visibility: "private",
      priority: "medium",
      collaborators: ["Current User"],
      status: "not_started",
      progress: 0,
      tasks: [
        { id: 5, title: "Content Strategy", completed: false },
        { id: 6, title: "Creative Assets", completed: false },
        { id: 7, title: "Campaign Launch", completed: false },
      ],
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6 p-5 h-auto overflow-scroll">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Milestone Manager
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Track and manage project milestones
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Milestone
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {milestone.taskName}
                </h3>
                <p className="text-gray-600 mb-4">{milestone.description}</p>

                <div className="flex items-center space-x-4 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      milestone.status
                    )}`}
                  >
                    {milestone.status.replace("_", " ").toUpperCase()}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                      milestone.priority
                    )}`}
                  >
                    {milestone.priority.toUpperCase()} PRIORITY
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {milestone.milestoneType.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    Assigned: {milestone.assignedTo}
                  </span>
                  <span className="text-sm text-gray-500">
                    Due: {new Date(milestone.dueDate).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    👁️ {milestone.visibility}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {milestone.progress}%
                </div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress
                </span>
                <span className="text-sm text-gray-500">
                  {milestone.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${milestone.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Collaborators
                </h4>
                <div className="flex flex-wrap gap-2">
                  {milestone.collaborators.map((collaborator, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      👤 {collaborator}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Associated Tasks
                </h4>
                <div className="space-y-2">
                  {milestone.tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        readOnly
                      />
                      <span
                        className={`text-sm ${
                          task.completed
                            ? "text-gray-500 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
              <button className="btn btn-secondary btn-sm">Edit</button>
              <button className="btn btn-primary btn-sm">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {showAddForm && <MilesToneCreateModal setShowAddForm={setShowAddForm} />}
    </div>
  );
}
