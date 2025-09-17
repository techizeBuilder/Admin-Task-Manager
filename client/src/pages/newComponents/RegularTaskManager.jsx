import React, { useState } from "react";
import { createPortal } from "react-dom";
import { 
  Plus,
  Target,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Edit3,
  Trash2,
  Share2,
  X,
  File
} from "lucide-react";
import CreateTask from "./CreateTask";

// Helper functions moved outside component
const getStatusColor = (status) => {
  const colors = {
    not_started: "bg-gray-100 text-gray-800 border-gray-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    overdue: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getPriorityColor = (priority) => {
  const colors = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    critical: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[priority] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'in_progress':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'overdue':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

export default function RegularTaskManager() {
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
    {
      id: 3,
      taskName: "Database Migration",
      isMilestone: true,
      milestoneType: "standalone",
      linkedTasks: [8, 9],
      dueDate: "2024-01-20",
      assignedTo: "Tech Team",
      description: "Migrate existing database to new infrastructure",
      visibility: "public",
      priority: "critical",
      collaborators: ["Dev Team", "QA Team"],
      status: "completed",
      progress: 100,
      tasks: [
        { id: 8, title: "Data Backup", completed: true },
        { id: 9, title: "Schema Migration", completed: true },
      ],
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Filter milestones
  const filteredMilestones = milestones.filter(milestone => {
    const statusMatch = statusFilter === "all" || milestone.status === statusFilter;
    const priorityMatch = priorityFilter === "all" || milestone.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const stats = {
    total: milestones.length,
    completed: milestones.filter(m => m.status === 'completed').length,
    inProgress: milestones.filter(m => m.status === 'in_progress').length,
    notStarted: milestones.filter(m => m.status === 'not_started').length,
    overdue: milestones.filter(m => m.status === 'overdue').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center">
                <File className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Regular Task</h1>
                <p className="text-sm text-gray-600">Track and manage simple task</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Regular Task
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Not Started</p>
                <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters and View Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm text-purple-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm text-purple-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Target className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{milestone.taskName}</h3>
                        <p className="text-sm text-gray-600">{milestone.milestoneType}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{milestone.description}</p>

                  {/* Status and Priority */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                      {getStatusIcon(milestone.status)}
                      <span className="ml-1">{milestone.status.replace("_", " ").toUpperCase()}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(milestone.priority)}`}>
                      {milestone.priority.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                      <Target className="h-3 w-3 mr-1" />
                      MILESTONE
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm text-gray-500">{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{milestone.assignedTo}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {milestone.visibility === 'public' ? (
                        <Eye className="h-4 w-4 text-gray-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-gray-600 capitalize">{milestone.visibility}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{milestone.tasks.filter(t => t.completed).length}/{milestone.tasks.length} Tasks</span>
                    </div>
                  </div>

                  {/* Collaborators */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Collaborators</h4>
                    <div className="flex items-center space-x-2">
                      {milestone.collaborators.map((collaborator, index) => (
                        <div
                          key={index}
                          className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                        >
                          {collaborator.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      <button className="h-8 w-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Associated Tasks Preview */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Tasks</h4>
                    <div className="space-y-1">
                      {milestone.tasks.slice(0, 2).map((task) => (
                        <div key={task.id} className="flex items-center space-x-2">
                          <CheckCircle2 className={`h-4 w-4 ${task.completed ? 'text-green-500' : 'text-gray-300'}`} />
                          <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                      {milestone.tasks.length > 2 && (
                        <p className="text-xs text-gray-500 ml-6">+{milestone.tasks.length - 2} more tasks</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </button>
                    </div>
                    <button className="inline-flex items-center px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredMilestones.map((milestone) => (
                <div key={milestone.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Target className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{milestone.taskName}</h3>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                            {getStatusIcon(milestone.status)}
                            <span className="ml-1">{milestone.status.replace("_", " ").toUpperCase()}</span>
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(milestone.priority)}`}>
                            {milestone.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{milestone.assignedTo}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{milestone.tasks.filter(t => t.completed).length}/{milestone.tasks.length} Tasks</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{milestone.progress}%</div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${milestone.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit3 className="h-4 w-4 text-gray-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Share2 className="h-4 w-4 text-gray-500" />
                        </button>
                        <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredMilestones.length === 0 && (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first milestone.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </button>
          </div>
        )}
      </div>

      {/* Milestone Creation Modal */}
      {showAddForm && createPortal(
        <div className="modal-overlay">
          <div className="modal-container max-w-4xl">
            <div className="modal-header" style={{ background: '#8b5cf6' }}>
              <div className="modal-title-section">
                <div className="modal-icon">
                  <Target size={20} />
                </div>
                <div>
                  <h3>Create Milestone</h3>
                  <p>Create a new milestone to track project progress</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <CreateTask
                onClose={() => setShowAddForm(false)}
                onSubmit={(milestoneData) => {
                  console.log('Creating milestone:', milestoneData);
                  setShowAddForm(false);
                }}
                initialTaskType="milestone"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}