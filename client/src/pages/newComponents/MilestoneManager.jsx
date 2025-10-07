import React, { useEffect, useState } from "react";
import { taskService } from "../../services/taskService";
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
  MoreVerticalIcon
} from "lucide-react";
import CreateTask from "./CreateTask";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
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

export default function MilestoneManager() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true);

        const filters = { page: 1, limit: 20 }; // pagination

        const res = await taskService.getTasksByType("milestone", filters);

        // Backend me data.roles.manager me actual milestones hain
        const managerMilestones = res?.data?.roles?.manager || [];

        // map karke frontend ke liye shape bana sakte hain
        const formattedMilestones = managerMilestones.map((m) => ({
          id: m._id,
          taskName: m.title,
          description: m.description,
          assignedTo: `${m.assignedTo.firstName} ${m.assignedTo.lastName}`,
          status: m.status || "not_started", // agar status missing ho to default
          priority: m.priority || "medium",
          visibility: m.visibility || "public",
          progress: m.progress || 0,
          milestoneType: m.milestoneData?.type || "standalone",
          tasks: m.milestoneData?.linkedTaskIds?.map((t) => ({
            id: t._id,
            title: t.title,
            completed: t.completed,
          })) || [],
          collaborators: m.collaborators?.map(c => c.firstName.charAt(0)) || [],
          dueDate: m.dueDate || new Date().toISOString(),
        }));

        setMilestones(formattedMilestones);
        setError(null);
      } catch (err) {
        console.error("Error fetching milestones:", err);
        setError("Failed to load milestones");
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, []);

  // Delete milestone
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this milestone?")) return;

    try {
      await taskService.deleteTask(id);
      setMilestones((prev) => prev.filter((m) => m._id !== id)); // remove locally
    } catch (err) {
      console.error("Error deleting milestone:", err);
      alert("Failed to delete milestone");
    }
  };

  // ✅ Placeholder for edit (you can open modal etc.)
  const handleEdit = (milestone) => {
    console.log("Edit milestone:", milestone);
    // TODO: Add your modal or edit logic here
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading milestones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-yellow-500 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
                <p className="text-sm text-gray-600">Track and manage project milestones</p>
              </div>
            </div>
            <Link href="/tasks/create?type=milestone">
              <button

                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </button></Link>
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
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                  className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-yellow-600" : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-yellow-600" : "text-gray-600 hover:text-gray-900"
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
                <div className="flex items-start justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <Target className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-gray-900">{milestone.taskName}</h3>
                      <p className="text-xs text-gray-500">{milestone.milestoneType}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                        <MoreVerticalIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 bg-white">
                      <DropdownMenuItem onClick={() => handleEdit(milestone.id)}>
                        <Edit3 className="h-4 w-4 mr-2 text-gray-600" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(milestone.id)}>
                        <Trash2 className="h-4 w-4 mr-2 text-red-600" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 px-4 py-2 truncate">{milestone.description}</p>

                {/* Status, Priority & Type */}
                <div className="flex items-center space-x-2 px-4 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                    {getStatusIcon(milestone.status)}
                    <span className="ml-1">{milestone.status.replace("_", " ").toUpperCase()}</span>
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(milestone.priority)}`}>
                    {milestone.priority.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    <Target className="h-3 w-3 mr-1" />
                    MILESTONE
                  </span>
                </div>

                {/* Progress */}
                <div className="px-4 mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{milestone.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1 rounded-full">
                    <div
                      className="bg-yellow-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${milestone.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Details: Due, Assigned, Visibility, Tasks */}
                <div className="px-4 py-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(milestone.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{milestone.assignedTo}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {milestone.visibility === "public" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    <span className="capitalize">{milestone.visibility}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{milestone.tasks.filter(t => t.completed).length}/{milestone.tasks.length}</span>
                  </div>
                </div>

                {/* Collaborators */}
                <div className="px-4 py-2 flex items-center space-x-1 overflow-x-auto">
                  {milestone.collaborators.map((c, i) => (
                    <div key={i} className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                      {c.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  <button className="h-6 w-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 flex-shrink-0">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Recent Tasks */}
                {milestone.tasks.length > 0 && (
                  <div className="px-4 py-2 space-y-1 text-xs text-gray-500">
                    {milestone.tasks.slice(0, 2).map(task => (
                      <div key={task.id} className="flex items-center space-x-1">
                        <CheckCircle2 className={`h-3 w-3 ${task.completed ? "text-green-500" : "text-gray-300"}`} />
                        <span className={`${task.completed ? "line-through text-gray-400" : "text-gray-700"} truncate`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {milestone.tasks.length > 2 && <span>+{milestone.tasks.length - 2} more tasks</span>}
                  </div>
                )}

                {/* Footer */}
                <div className="px-4 py-2 border-t border-gray-200 flex justify-between items-center">
                  <button className="text-xs text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                    <Edit3 className="h-3 w-3" /> <span>Edit</span>
                  </button>
                  <button className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700">View Details</button>
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
                      <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <Target className="h-6 w-6 text-yellow-600" />
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
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{ width: `${milestone.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit3 className="h-4 w-4 text-gray-500" />
                        </button>

                        <button className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors">
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
            <Link href="/tasks/create?type=milestone">
              <button

                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </button>
            </Link>
          </div>
        )}
      </div>


    </div>
  );
}