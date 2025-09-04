import React, { useState } from 'react';
import { 
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Grid3X3,
  List,
  Eye,
  User,
  Calendar,
  FileText,
  MoreHorizontal,
  MessageSquare,
  Users,
  Workflow,
  X
} from 'lucide-react';
import ApprovalTaskCreator from './ApprovalTaskCreator';

export default function ApprovalManager() {
  const [currentUser] = useState({ id: 1, name: 'Current User', role: 'manager' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [approvalTasks, setApprovalTasks] = useState([
    {
      id: 1,
      title: "Budget Approval Q1 2024",
      mode: "sequential",
      status: "pending",
      approvers: [
        { id: 1, name: "John Smith", role: "manager", status: "approved", comment: "Looks good", approvedAt: "2024-01-15" },
        { id: 2, name: "Sarah Wilson", role: "director", status: "pending", comment: null, approvedAt: null },
        { id: 3, name: "Mike Johnson", role: "cfo", status: "waiting", comment: null, approvedAt: null }
      ],
      creator: "Emily Davis",
      createdAt: "2024-01-10",
      dueDate: "2024-01-30",
      autoApprove: false,
      description: "Quarterly budget approval for development team",
      priority: "high"
    },
    {
      id: 2,
      title: "Security Policy Update",
      mode: "all",
      status: "in-progress",
      approvers: [
        { id: 4, name: "Alex Turner", role: "security", status: "approved", comment: "Security measures adequate", approvedAt: "2024-01-12" },
        { id: 5, name: "Lisa Chen", role: "compliance", status: "pending", comment: null, approvedAt: null },
        { id: 6, name: "David Brown", role: "legal", status: "rejected", comment: "Need additional clauses", approvedAt: "2024-01-14" }
      ],
      creator: "Security Team",
      createdAt: "2024-01-08",
      dueDate: "2024-01-25",
      autoApprove: false,
      description: "Updated security policy for remote work guidelines",
      priority: "medium"
    },
    {
      id: 3,
      title: "New Hire Approval",
      mode: "any",
      status: "approved",
      approvers: [
        { id: 7, name: "HR Manager", role: "hr", status: "approved", comment: "Excellent candidate", approvedAt: "2024-01-16" },
        { id: 8, name: "Team Lead", role: "manager", status: "waiting", comment: null, approvedAt: null }
      ],
      creator: "Recruiting Team",
      createdAt: "2024-01-14",
      dueDate: "2024-01-20",
      autoApprove: false,
      description: "Approval for new senior developer position",
      priority: "critical"
    },
    {
      id: 4,
      title: "Marketing Campaign Budget",
      mode: "all",
      status: "rejected",
      approvers: [
        { id: 9, name: "Marketing Lead", role: "marketing", status: "approved", comment: "Good strategy", approvedAt: "2024-01-18" },
        { id: 10, name: "Finance Director", role: "finance", status: "rejected", comment: "Budget exceeds limits", approvedAt: "2024-01-19" }
      ],
      creator: "Marketing Team",
      createdAt: "2024-01-16",
      dueDate: "2024-01-28",
      autoApprove: false,
      description: "Q1 marketing campaign budget approval",
      priority: "low"
    }
  ]);

  const getApprovalStatus = (task) => {
    const { approvers, mode } = task;
    const approved = approvers.filter(a => a.status === 'approved');
    const rejected = approvers.filter(a => a.status === 'rejected');
    const pending = approvers.filter(a => a.status === 'pending');

    if (rejected.length > 0 && mode !== 'any') return 'rejected';
    
    switch (mode) {
      case 'any':
        return approved.length > 0 ? 'approved' : pending.length > 0 ? 'pending' : 'waiting';
      case 'all':
        return approved.length === approvers.length ? 'approved' : 
               rejected.length > 0 ? 'rejected' : 'pending';
      case 'sequential':
        const currentIndex = approved.length;
        if (currentIndex === approvers.length) return 'approved';
        if (rejected.length > 0) return 'rejected';
        return 'pending';
      default:
        return 'pending';
    }
  };

  const canUserApprove = (task, approver) => {
    if (approver.status !== 'pending') return false;
    if (task.mode === 'sequential') {
      const approverIndex = task.approvers.findIndex(a => a.id === approver.id);
      const previousApproved = task.approvers.slice(0, approverIndex).every(a => a.status === 'approved');
      return previousApproved;
    }
    return true;
  };

  const handleApproval = (taskId, approverId, action, comment) => {
    setApprovalTasks(tasks => tasks.map(task => {
      if (task.id !== taskId) return task;
      
      const updatedApprovers = task.approvers.map(approver => {
        if (approver.id === approverId) {
          return {
            ...approver,
            status: action,
            comment: comment || null,
            approvedAt: new Date().toISOString().split('T')[0]
          };
        }
        return approver;
      });

      return {
        ...task,
        approvers: updatedApprovers,
        status: getApprovalStatus({ ...task, approvers: updatedApprovers })
      };
    }));
  };

  const handleCreateApprovalTask = (taskData) => {
    setApprovalTasks([...approvalTasks, taskData]);
    setShowCreateModal(false);
  };

  // Filter tasks
  const filteredTasks = approvalTasks.filter(task => {
    const overallStatus = getApprovalStatus(task);
    const statusMatch = statusFilter === "all" || overallStatus === statusFilter;
    const modeMatch = modeFilter === "all" || task.mode === modeFilter;
    return statusMatch && modeMatch;
  });

  // Calculate stats
  const stats = {
    total: approvalTasks.length,
    pending: approvalTasks.filter(task => getApprovalStatus(task) === 'pending').length,
    approved: approvalTasks.filter(task => getApprovalStatus(task) === 'approved').length,
    rejected: approvalTasks.filter(task => getApprovalStatus(task) === 'rejected').length,
    waiting: approvalTasks.filter(task => getApprovalStatus(task) === 'waiting').length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
                <p className="text-sm text-gray-600">Manage approval workflows and tasks</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Approval Task
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
              <Workflow className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Waiting</p>
                <p className="text-2xl font-bold text-gray-600">{stats.waiting}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-400" />
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
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="waiting">Waiting</option>
              </select>

              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Modes</option>
                <option value="any">Any Approver</option>
                <option value="all">All Approvers</option>
                <option value="sequential">Sequential</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <ApprovalTaskCard 
                key={task.id} 
                task={task} 
                currentUser={currentUser}
                onApproval={handleApproval}
                getApprovalStatus={getApprovalStatus}
                canUserApprove={canUserApprove}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredTasks.map(task => (
                <ApprovalTaskListItem
                  key={task.id}
                  task={task}
                  currentUser={currentUser}
                  onApproval={handleApproval}
                  getApprovalStatus={getApprovalStatus}
                  canUserApprove={canUserApprove}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No approval tasks found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first approval task.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Approval Task
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="absolute right-0 top-0 h-full bg-white flex flex-col shadow-2xl" style={{width: 'min(90vw, 900px)'}}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Create Approval Task</h2>
                    <p className="text-blue-100 text-sm">Set up a new approval workflow</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ApprovalTaskCreator
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateApprovalTask}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApprovalTaskCard({ task, currentUser, onApproval, getApprovalStatus, canUserApprove, getStatusIcon, getStatusColor, getPriorityColor }) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState(null);

  const overallStatus = getApprovalStatus(task);
  const userApprover = task.approvers.find(a => a.id === currentUser.id);
  const canApprove = userApprover && canUserApprove(task, userApprover);

  const handleApproveClick = (approver) => {
    setSelectedApprover(approver);
    setShowApprovalModal(true);
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'any':
        return <User className="h-4 w-4" />;
      case 'all':
        return <Users className="h-4 w-4" />;
      case 'sequential':
        return <Workflow className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                <p className="text-sm text-gray-600">{task.creator}</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">{task.description}</p>

          {/* Status and Priority */}
          <div className="flex items-center space-x-2 mb-4">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(overallStatus)}`}>
              {getStatusIcon(overallStatus)}
              <span className="ml-1 capitalize">{overallStatus}</span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
              {task.priority.toUpperCase()}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              {getModeIcon(task.mode)}
              <span className="ml-1 capitalize">{task.mode}</span>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {/* Details */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Due Date:</span>
              </span>
              <span className="font-medium text-gray-900">{task.dueDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span>Approvers:</span>
              </span>
              <span className="font-medium text-gray-900">{task.approvers.length}</span>
            </div>
          </div>

          {/* Approval Chain */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Approval Chain</h4>
            <div className="space-y-2">
              {task.approvers.map((approver, index) => (
                <div key={approver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      approver.status === 'approved' ? 'bg-green-100' :
                      approver.status === 'rejected' ? 'bg-red-100' :
                      approver.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      {approver.status === 'approved' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : approver.status === 'rejected' ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : approver.status === 'pending' ? (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <User className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{approver.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{approver.role}</p>
                    </div>
                  </div>
                  
                  {approver.status === 'pending' && canUserApprove(task, approver) && approver.id === currentUser.id && (
                    <button 
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      onClick={() => handleApproveClick(approver)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Created: {task.createdAt}</span>
            </div>
            <button className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <FileText className="h-4 w-4 mr-1" />
              View Details
            </button>
          </div>
        </div>
      </div>

      {showApprovalModal && (
        <ApprovalModal
          task={task}
          approver={selectedApprover}
          onApproval={onApproval}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedApprover(null);
          }}
        />
      )}
    </>
  );
}

function ApprovalTaskListItem({ task, currentUser, onApproval, getApprovalStatus, canUserApprove, getStatusIcon, getStatusColor, getPriorityColor }) {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState(null);

  const overallStatus = getApprovalStatus(task);
  const userApprover = task.approvers.find(a => a.id === currentUser.id);
  const canApprove = userApprover && canUserApprove(task, userApprover);

  const handleApproveClick = (approver) => {
    setSelectedApprover(approver);
    setShowApprovalModal(true);
  };

  return (
    <>
      <div className="p-6 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(overallStatus)}`}>
                  {getStatusIcon(overallStatus)}
                  <span className="ml-1 capitalize">{overallStatus}</span>
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {task.dueDate}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{task.creator}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{task.approvers.length} approvers</span>
                </span>
                <span className="capitalize">{task.mode} mode</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {task.approvers.filter(a => a.status === 'approved').length}/{task.approvers.length} Approved
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {canApprove && (
                <button 
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => handleApproveClick(userApprover)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Review
                </button>
              )}
              <button className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                <FileText className="h-4 w-4 mr-1" />
                Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {showApprovalModal && (
        <ApprovalModal
          task={task}
          approver={selectedApprover}
          onApproval={onApproval}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedApprover(null);
          }}
        />
      )}
    </>
  );
}

function ApprovalModal({ task, approver, onApproval, onClose }) {
  const [comment, setComment] = useState('');

  const handleSubmit = (selectedAction) => {
    if (!comment.trim() && selectedAction === 'rejected') {
      alert('Please provide a comment for rejection');
      return;
    }
    
    onApproval(task.id, approver.id, selectedAction, comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Review Approval</h3>
                <p className="text-sm text-gray-600">{task.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{task.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mode</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{task.mode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Due Date</label>
              <p className="mt-1 text-sm text-gray-900">{task.dueDate}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Creator</label>
              <p className="mt-1 text-sm text-gray-900">{task.creator}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment {comment.trim() ? '(optional)' : '(required for rejection)'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your review comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => handleSubmit('rejected')}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            <XCircle className="h-4 w-4 mr-1 inline" />
            Reject
          </button>
          <button 
            onClick={() => handleSubmit('approved')}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="h-4 w-4 mr-1 inline" />
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}