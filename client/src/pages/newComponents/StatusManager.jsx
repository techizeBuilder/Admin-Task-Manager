import React, { useState } from "react";
import StatusFormModal from "./StatusFormModal";
import { SearchableSelect } from "../../components/ui/SearchableSelect";

// Helper functions moved outside component
const getTaskCount = (statusCode) => {
  const mockCounts = {
    OPEN: 142,
    INPROGRESS: 87,
    ONHOLD: 23,
    DONE: 452,
    CANCELLED: 18,
  };
  return mockCounts[statusCode] || 0;
};

const getSystemStatusLabel = (systemCode, systemStatuses) => {
  const systemStatus = systemStatuses.find((s) => s.code === systemCode);
  return systemStatus ? systemStatus.label : systemCode;
};

export default function StatusManager() {
  const [currentUser] = useState({
    id: 1,
    name: "Current User",
    role: "admin",
  });

  // System-defined priorities (Core Layer - cannot be deleted)
  const [systemStatuses] = useState([
    {
      id: "sys1",
      code: "SYS_OPEN",
      label: "Open",
      description: "Task is created but not yet started",
      color: "#6c757d",
      isFinal: false,
      isDefault: true,
      active: true,
      order: 1,
      isSystem: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "sys2",
      code: "SYS_INPROGRESS",
      label: "In Progress",
      description: "Task is being actively worked on",
      color: "#3498db",
      isFinal: false,
      isDefault: false,
      active: true,
      order: 2,
      isSystem: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "sys3",
      code: "SYS_ONHOLD",
      label: "On Hold",
      description: "Task is temporarily paused",
      color: "#f39c12",
      isFinal: false,
      isDefault: false,
      active: true,
      order: 3,
      isSystem: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "sys4",
      code: "SYS_DONE",
      label: "Completed",
      description: "Task has been completed successfully",
      color: "#28a745",
      isFinal: true,
      isDefault: false,
      active: true,
      order: 4,
      isSystem: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "sys5",
      code: "SYS_CANCELLED",
      label: "Cancelled",
      description: "Task was cancelled and will not be completed",
      color: "#dc3545",
      isFinal: true,
      isDefault: false,
      active: true,
      order: 5,
      isSystem: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
  ]);

  // Company-defined statuses (configurable by admin)
  const [companyStatuses, setCompanyStatuses] = useState([
    {
      id: 1,
      code: "OPEN",
      label: "Open",
      description: "Task is created but not yet started",
      color: "#6c757d",
      isFinal: false,
      isDefault: true,
      active: true,
      order: 1,
      systemMapping: "SYS_OPEN",
      allowedTransitions: ["INPROGRESS", "ONHOLD", "CANCELLED"],
      isSystem: false,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 2,
      code: "INPROGRESS",
      label: "In Progress",
      description: "Task is being actively worked on",
      color: "#3498db",
      isFinal: false,
      isDefault: false,
      active: true,
      order: 2,
      systemMapping: "SYS_INPROGRESS",
      allowedTransitions: ["ONHOLD", "DONE", "CANCELLED"],
      isSystem: false,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 3,
      code: "ONHOLD",
      label: "On Hold",
      description: "Task is temporarily paused",
      color: "#f39c12",
      isFinal: false,
      isDefault: false,
      active: true,
      order: 3,
      systemMapping: "SYS_ONHOLD",
      allowedTransitions: ["INPROGRESS", "CANCELLED"],
      isSystem: false,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 4,
      code: "DONE",
      label: "Completed",
      description: "Task has been completed successfully",
      color: "#28a745",
      isFinal: true,
      isDefault: false,
      active: true,
      order: 4,
      systemMapping: "SYS_DONE",
      allowedTransitions: [],
      isSystem: false,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: 5,
      code: "CANCELLED",
      label: "Cancelled",
      description: "Task was cancelled and will not be completed",
      color: "#dc3545",
      isFinal: true,
      isDefault: false,
      active: true,
      order: 5,
      systemMapping: "SYS_CANCELLED",
      allowedTransitions: [],
      isSystem: false,
      createdAt: "2024-01-01T00:00:00Z",
    },
  ]);

  const [showSystemStatuses, setShowSystemStatuses] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [statusChangeModal, setStatusChangeModal] = useState(null);

  const handleAddStatus = (statusData) => {
    const newStatus = {
      id: Date.now(),
      ...statusData,
      active: true,
      order: companyStatuses.length + 1,
      isSystem: false,
    };
    setCompanyStatuses([...companyStatuses, newStatus]);
    setShowAddForm(false);
  };

  const handleUpdateStatus = (updatedStatus) => {
    setCompanyStatuses(
      companyStatuses.map((status) =>
        status.id === updatedStatus.id ? updatedStatus : status,
      ),
    );
    setEditingStatus(null);
  };

  const handleDeleteStatus = (statusId, mappingStatusId) => {
    const statusToDelete = companyStatuses.find((s) => s.id === statusId);
    const mappingStatus = companyStatuses.find((s) => s.id === mappingStatusId);

    // Mark status as inactive and create mapping entry
    setCompanyStatuses(
      companyStatuses.map((status) =>
        status.id === statusId
          ? {
              ...status,
              active: false,
              retiredAt: new Date().toISOString(),
              mappedTo: mappingStatusId,
            }
          : status,
      ),
    );

    // Log the status change for audit trail
    console.log("Status deleted and mapped:", {
      deletedStatus: statusToDelete.label,
      mappedTo: mappingStatus.label,
      timestamp: new Date().toISOString(),
      affectedTasks: getTaskCount(statusToDelete.code),
    });

    setDeleteModal(null);
  };

  const handleSetDefault = (statusId) => {
    setCompanyStatuses(
      companyStatuses.map((status) => ({
        ...status,
        isDefault: status.id === statusId,
      })),
    );
  };

  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  const handleReorderStatuses = (reorderedStatuses) => {
    const updatedStatuses = reorderedStatuses.map((status, index) => ({
      ...status,
      order: index + 1,
    }));
    setCompanyStatuses(updatedStatuses);
  };

  const handleDragStart = (e, status) => {
    setDraggedItem(status);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e, status) => {
    e.preventDefault();
    setDragOverItem(status);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetStatus.id) {
      return;
    }

    const currentStatuses = [...activeCompanyStatuses].sort(
      (a, b) => a.order - b.order,
    );
    const draggedIndex = currentStatuses.findIndex(
      (s) => s.id === draggedItem.id,
    );
    const targetIndex = currentStatuses.findIndex(
      (s) => s.id === targetStatus.id,
    );

    // Remove dragged item from its current position
    currentStatuses.splice(draggedIndex, 1);
    // Insert at new position
    currentStatuses.splice(targetIndex, 0, draggedItem);

    // Update order numbers
    const reorderedStatuses = currentStatuses.map((status, index) => ({
      ...status,
      order: index + 1,
    }));

    // Update the full statuses array maintaining inactive items
    const updatedAllStatuses = companyStatuses.map((status) => {
      const reordered = reorderedStatuses.find((r) => r.id === status.id);
      return reordered || status;
    });

    setCompanyStatuses(updatedAllStatuses);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const getValidTransitions = (currentStatusCode, taskData = null) => {
    const currentStatus = companyStatuses.find(
      (s) => s.code === currentStatusCode,
    );
    if (!currentStatus) return [];

    let validTransitions = currentStatus.allowedTransitions;

    // Apply sub-task completion logic
    if (taskData && taskData.subtasks && taskData.subtasks.length > 0) {
      const hasIncompleteSubtasks = taskData.subtasks.some(
        (subtask) =>
          subtask.status !== "DONE" && subtask.status !== "CANCELLED",
      );

      // Prevent parent task from being marked as completed if sub-tasks are incomplete
      if (hasIncompleteSubtasks) {
        validTransitions = validTransitions.filter(
          (transition) => transition !== "DONE",
        );
      }
    }

    return validTransitions;
  };

  const canEditTaskStatus = (task, currentUser) => {
    // Edit permissions: Only task assignee, collaborators, or admins
    return (
      task.assigneeId === currentUser.id ||
      task.collaborators?.includes(currentUser.id) ||
      currentUser.role === "admin"
    );
  };

  const validateBulkStatusChange = (
    selectedTasks,
    newStatusCode,
    currentUser,
  ) => {
    const errors = [];

    selectedTasks.forEach((task) => {
      // Check edit permissions
      if (!canEditTaskStatus(task, currentUser)) {
        errors.push(`No permission to edit task: ${task.title}`);
        return;
      }

      // Check valid transitions
      const validTransitions = getValidTransitions(task.status, task);
      if (!validTransitions.includes(newStatusCode)) {
        errors.push(`Invalid status transition for task: ${task.title}`);
        return;
      }

      // Check sub-task completion logic
      if (newStatusCode === "DONE" && task.subtasks?.length > 0) {
        const incompleteSubtasks = task.subtasks.filter(
          (st) => st.status !== "DONE" && st.status !== "CANCELLED",
        );
        if (incompleteSubtasks.length > 0) {
          errors.push(
            `Task "${task.title}" has ${incompleteSubtasks.length} incomplete sub-tasks`,
          );
        }
      }
    });

    return errors;
  };

  const getSystemStatusLabelMain = (systemCode) => {
    const systemStatus = systemStatuses.find((s) => s.code === systemCode);
    return systemStatus ? systemStatus.label : systemCode;
  };

  const activeCompanyStatuses = companyStatuses.filter((s) => s.active);

  return (
    <div className="space-y-8 p-5 h-auto overflow-scroll">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Company Status Configuration
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Configure custom task statuses for your organization
          </p>
          <div className="absolute -top-2 -left-2 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <button
              className="btn btn-primary relative overflow-hidden group"
              onClick={() => setShowAddForm(true)}
            >
              <svg
                className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-90"
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
              Add Custom Status
            </button>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showSystemStatuses}
                onChange={(e) => setShowSystemStatuses(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Show System Statuses
              </span>
            </label>
          </div>
          <div className="text-sm text-gray-500">
            Company Statuses: {companyStatuses.filter((s) => s.active).length} |
            System Statuses: {systemStatuses.length}
          </div>
        </div>

        <div className="status-sections mb-8">
          <div className="status-list company-statuses">
            <div className="section-header">
              <h3>Company Status Workflow</h3>
              <p>
                Visual representation of status transitions and system mappings
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System Mapping
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allowed Transitions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companyStatuses
                    .filter((s) => s.active)
                    .sort((a, b) => a.order - b.order)
                    .map((status) => (
                      <tr
                        key={status.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {status.order}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <span
                              className="inline-block w-3 h-3 rounded-full"
                              style={{ backgroundColor: status.color }}
                            ></span>
                            <span className="text-sm font-medium text-gray-900">
                              {status.label}
                            </span>
                            {status.isDefault && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                DEFAULT
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="text-gray-900">
                              → {getSystemStatusLabelMain(status.systemMapping)}
                            </div>
                            <code className="text-xs text-gray-500">
                              ({status.systemMapping})
                            </code>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              status.isFinal
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {status.isFinal ? "Final" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {status.allowedTransitions.length > 0 ? (
                              status.allowedTransitions.map(
                                (transitionCode) => {
                                  const targetStatus = companyStatuses.find(
                                    (s) => s.code === transitionCode,
                                  );
                                  return targetStatus ? (
                                    <span
                                      key={transitionCode}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                      style={{
                                        backgroundColor: targetStatus.color,
                                      }}
                                    >
                                      → {targetStatus.label}
                                    </span>
                                  ) : null;
                                },
                              )
                            ) : (
                              <span className="text-sm text-gray-400">
                                No transitions
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="status-sections">
          <div className="status-list company-statuses">
            <div className="section-header">
              <h3>Company Statuses</h3>
              <p>Custom statuses configured for your organization</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      System Mapping
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks Using
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeCompanyStatuses
                    .sort((a, b) => a.order - b.order)
                    .map((status) => (
                      <CompanyStatusRow
                        key={status.id}
                        status={status}
                        systemStatuses={systemStatuses}
                        onEdit={() => setEditingStatus(status)}
                        onDelete={() => setDeleteModal(status)}
                        onSetDefault={() => handleSetDefault(status.id)}
                        canEdit={currentUser.role === "admin"}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDrop={handleDrop}
                        isDraggedOver={
                          dragOverItem && dragOverItem.id === status.id
                        }
                      />
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {showSystemStatuses && (
            <div className="status-list system-statuses">
              <div className="section-header">
                <h3>System Statuses (Read-Only)</h3>
                <p>
                  Core statuses used for internal logic and analytics - Required
                  for application consistency
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Mappings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {systemStatuses.map((status) => (
                      <SystemStatusRow
                        key={status.id}
                        status={status}
                        companyStatuses={activeCompanyStatuses}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="status-form-modal-overlay">
          <div className="status-form-modal">
            <h2>Create New Status</h2>
            <StatusFormModal
              onSubmit={handleAddStatus}
              onClose={() => setShowAddForm(false)}
              existingStatuses={companyStatuses}
              systemStatuses={systemStatuses}
            />
          </div>
        </div>
      )}

      {editingStatus && (
        <div className="status-form-modal-overlay">
          <div className="status-form-modal">
            <h2>Edit Status</h2>
            <StatusFormModal
              status={editingStatus}
              onSubmit={handleUpdateStatus}
              onClose={() => setEditingStatus(null)}
              existingStatuses={companyStatuses}
              systemStatuses={systemStatuses}
              isEdit={true}
            />
          </div>
        </div>
      )}

      {deleteModal && (
        <DeleteStatusModal
          status={deleteModal}
          statuses={companyStatuses.filter(
            (s) => s.active && s.id !== deleteModal.id,
          )}
          onConfirm={handleDeleteStatus}
          onClose={() => setDeleteModal(null)}
        />
      )}

      {/* Slide-in Drawer */}
    </div>
  );
}

function CompanyStatusRow({
  status,
  systemStatuses,
  onEdit,
  onDelete,
  onSetDefault,
  canEdit,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDrop,
  isDraggedOver,
}) {
  const taskCount = getTaskCount(status.code);

  return (
    <tr
      className={`${isDraggedOver ? "bg-blue-50" : "hover:bg-gray-50"} transition-colors duration-200`}
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, status)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragEnter={(e) => onDragEnter(e, status)}
      onDrop={(e) => onDrop(e, status)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <div className={`text-gray-400 ${canEdit ? "cursor-move" : ""}`}>
            ⋮⋮
          </div>
          <span className="text-sm font-medium text-gray-900">
            {status.order}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: status.color }}
          ></span>
          <span className="text-sm font-medium text-gray-900">
            {status.label}
          </span>
          {status.isDefault && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              DEFAULT
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
          {status.code}
        </code>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="text-gray-900">
            {getSystemStatusLabel(status.systemMapping, systemStatuses)}
          </div>
          <code className="text-xs text-gray-500">
            ({status.systemMapping})
          </code>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status.isFinal
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {status.isFinal ? "Final" : "Active"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="text-gray-900 font-medium">{taskCount}</div>
          <div className="text-gray-500">tasks</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          {canEdit && (
            <>
              <button
                className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                onClick={onEdit}
              >
                Edit
              </button>
              {!status.isDefault && (
                <button
                  className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                  onClick={onSetDefault}
                >
                  Set Default
                </button>
              )}
              <button
                className={`transition-colors duration-200 ${
                  taskCount > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-600 hover:text-red-900"
                }`}
                onClick={onDelete}
                disabled={taskCount > 0}
                title={
                  taskCount > 0
                    ? `Cannot delete: ${taskCount} tasks using this status`
                    : "Delete status"
                }
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function SystemStatusRow({ status, companyStatuses }) {
  const mappedCompanyStatuses = companyStatuses.filter(
    (cs) => cs.systemMapping === status.code,
  );

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ backgroundColor: status.color }}
          ></span>
          <span className="text-sm font-medium text-gray-900">
            {status.label}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            SYSTEM
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
          {status.code}
        </code>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-900">{status.description}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status.isFinal
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {status.isFinal ? "Final" : "Active"}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {mappedCompanyStatuses.length > 0 ? (
            mappedCompanyStatuses.map((cs) => (
              <span
                key={cs.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: cs.color }}
              >
                {cs.label}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">No mappings</span>
          )}
        </div>
      </td>
    </tr>
  );
}

function DeleteStatusModal({ status, statuses, onConfirm, onClose }) {
  const [mappingStatusId, setMappingStatusId] = useState("");

  const handleConfirm = () => {
    if (mappingStatusId) {
      onConfirm(status.id, mappingStatusId);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Delete Status: {status.label}</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="warning-message">
            <span className="warning-icon">⚠️</span>
            <p>
              This action will permanently delete the "{status.label}" status.
              All tasks currently using this status must be mapped to another
              status.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="mappingStatus">
              Map existing tasks to status:*
            </label>
            <select
              id="mappingStatus"
              value={mappingStatusId}
              onChange={(e) => setMappingStatusId(e.target.value)}
              required
            >
              <option value="">Select a status...</option>
              {statuses.map((mappingStatus) => (
                <option key={mappingStatus.id} value={mappingStatus.id}>
                  {mappingStatus.label}
                </option>
              ))}
            </select>
            <small className="form-hint">
              All tasks with "{status.label}" status will be changed to the
              selected status.
            </small>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleConfirm}
              disabled={!mappingStatusId}
            >
              Delete Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
