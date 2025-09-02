import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import SearchableSelect from "./SearchableSelect";
import ApprovalTaskCreator from "./ApprovalTaskCreator";
import useTasksStore from "../../../stores/tasksStore";

// Helper functions for approval system
const getApprovalStatusColor = (status) => {
  const colors = {
    not_started: "bg-gray-100 text-gray-800", // Grey
    pending_approval: "bg-yellow-100 text-yellow-800", // Pending
    approved: "bg-green-100 text-green-800", // Green
    rejected: "bg-red-100 text-red-800", // Red
    auto_approved: "bg-blue-100 text-blue-800", // Yellow for auto
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getApprovalIcon = (status) => {
  switch (status) {
    case "pending_approval":
      return "⏳";
    case "approved":
      return "✅";
    case "rejected":
      return "❌";
    case "auto_approved":
      return "🤖";
    default:
      return "📝";
  }
};

export default function ApprovalManager({ open = false, onclose, onClose }) {
  const { addTask, tasks, updateTask } = useTasksStore();
  const [currentUser] = useState("Current User");

  // If onClose is provided, we're being used as a form component
  if (onClose) {
    return <ApprovalTaskCreator onClose={onClose} onSubmit={addTask} />;
  }

  const [approvalTasks, setApprovalTasks] = useState([
    {
      id: 1,
      taskName: "Budget Approval Q4",
      isApprovalTask: true,
      approvers: [2, 3], // John Smith, Jane Smith
      approvalMode: "all_must_approve",
      dueDate: "2024-02-28",
      autoApproveAfter: 3,
      description: "Please review and approve the Q4 budget proposal",
      attachments: ["budget-q4.pdf", "financial-projections.xlsx"],
      collaborators: [4, 5], // Mike Johnson, Sarah Wilson
      visibility: "private",
      priority: "high",
      status: "pending_approval",
      approvalHistory: [
        {
          approverId: 2,
          approverName: "John Smith",
          decision: "approved",
          comment: "Looks good to me, approved!",
          timestamp: "2024-02-15T10:30:00Z",
        },
      ],
      currentApproverIndex: -1, // All must approve
      createdBy: 1,
      createdByName: "Current User",
    },
    {
      id: 2,
      taskName: "New Hire Approval - Sarah Johnson",
      isApprovalTask: true,
      approvers: [2, 3, 6], // Sequential approval
      approvalMode: "sequential",
      dueDate: "2024-03-05",
      autoApproveAfter: 2,
      description: "Review and approve new hire for Marketing Manager position",
      attachments: ["resume.pdf", "interview-notes.docx"],
      collaborators: [4],
      visibility: "private",
      priority: "medium",
      status: "pending_approval",
      approvalHistory: [
        {
          approverId: 2,
          approverName: "John Smith",
          decision: "approved",
          comment: "Excellent candidate, approved for next stage",
          timestamp: "2024-02-18T14:20:00Z",
        },
      ],
      currentApproverIndex: 1, // Jane Smith is next
      sequentialOrder: [2, 3, 6],
      createdBy: 1,
      createdByName: "Current User",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(null);

  const teamMembers = [
    { id: 1, name: "Current User" },
    { id: 2, name: "John Smith" },
    { id: 3, name: "Jane Smith" },
    { id: 4, name: "Mike Johnson" },
    { id: 5, name: "Sarah Wilson" },
    { id: 6, name: "Emily Davis" },
  ];

  // Handle approval decision - Prompts 2, 3, 6, 7
  const handleApprovalDecision = (taskId, decision, comment = "") => {
    const task = approvalTasks.find((t) => t.id === taskId);
    const currentUserId = 1; // Current user ID

    // Prompt 7: Validation checks
    if (!task.approvers.includes(currentUserId)) {
      alert("Only assigned approvers can make decisions on this task.");
      return;
    }

    if (
      task.status === "approved" ||
      task.status === "rejected" ||
      task.status === "auto_approved"
    ) {
      alert("Task already finalized.");
      return;
    }

    // Check if current user already made a decision
    const existingDecision = task.approvalHistory.find(
      (h) => h.approverId === currentUserId,
    );
    if (existingDecision) {
      alert("You have already made a decision on this task.");
      return;
    }

    // Sequential mode validation - Prompt 7
    if (task.approvalMode === "sequential") {
      const currentApprover = task.sequentialOrder[task.currentApproverIndex];
      if (currentUserId !== currentApprover) {
        alert(
          "It's not your turn to approve. Please wait for the previous approver.",
        );
        return;
      }
    }

    setApprovalTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;

        const newHistory = [
          ...t.approvalHistory,
          {
            approverId: currentUserId,
            approverName:
              teamMembers.find((m) => m.id === currentUserId)?.name ||
              "Unknown",
            decision,
            comment,
            timestamp: new Date().toISOString(),
          },
        ];

        let newStatus = t.status;
        let newCurrentApproverIndex = t.currentApproverIndex;

        // Prompt 2: Apply approval mode logic
        switch (t.approvalMode) {
          case "any_one":
            // First approver decides outcome
            newStatus = decision === "approved" ? "approved" : "rejected";
            break;

          case "all_must_approve":
            if (decision === "rejected") {
              // One rejection ends task
              newStatus = "rejected";
            } else {
              // Check if all have approved
              const allApprovers = t.approvers;
              const approvedBy = newHistory
                .filter((h) => h.decision === "approved")
                .map((h) => h.approverId);
              if (allApprovers.every((id) => approvedBy.includes(id))) {
                newStatus = "approved";
              }
            }
            break;

          case "sequential":
            if (decision === "rejected") {
              // Sequential rejection ends task
              newStatus = "rejected";
            } else {
              // Move to next approver or complete
              const nextIndex = t.currentApproverIndex + 1;
              if (nextIndex >= t.sequentialOrder.length) {
                newStatus = "approved";
              } else {
                newCurrentApproverIndex = nextIndex;
              }
            }
            break;
        }

        return {
          ...t,
          approvalHistory: newHistory,
          status: newStatus,
          currentApproverIndex: newCurrentApproverIndex,
        };
      }),
    );
  };

  // Check for auto-approval - Prompt 4
  useEffect(() => {
    const checkAutoApproval = () => {
      const now = new Date();

      setApprovalTasks((prev) =>
        prev.map((task) => {
          if (task.status === "pending_approval" && task.autoApproveAfter) {
            const dueDate = new Date(task.dueDate);
            const autoApprovalDate = new Date(
              dueDate.getTime() + task.autoApproveAfter * 24 * 60 * 60 * 1000,
            );

            if (now > autoApprovalDate) {
              // Auto-approve the task
              const autoApprovalHistory = {
                approverId: 0, // System
                approverName: "System Auto-Approval",
                decision: "approved",
                comment: "Auto-approved due to no response within deadline",
                timestamp: now.toISOString(),
              };

              // Notify creator and admin (simulated)
              console.log(
                `Auto-approval notification: Task "${task.taskName}" has been auto-approved`,
              );

              return {
                ...task,
                status: "auto_approved",
                approvalHistory: [...task.approvalHistory, autoApprovalHistory],
              };
            }
          }
          return task;
        }),
      );
    };

    const interval = setInterval(checkAutoApproval, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Handle editing approval task - Prompt 6: Restrictions
  const handleEditTask = (task) => {
    // Check if any approvals have been made
    if (task.approvalHistory.length > 0 && currentUser !== "Admin") {
      alert(
        "Approvers cannot be changed once decision is in progress. Contact Admin.",
      );
      return;
    }

    setEditingTask(task);
    setShowAddForm(true);
  };

  // Handle form submission
  const handleTaskSubmit = (taskData) => {
    if (editingTask) {
      setApprovalTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? { ...t, ...taskData } : t)),
      );
      setEditingTask(null);
    } else {
      const newTask = {
        ...taskData,
        id: Date.now(),
        status: "not_started",
        approvalHistory: [],
        currentApproverIndex: taskData.approvalMode === "sequential" ? 0 : -1,
        createdBy: 1,
        createdByName: "Current User",
      };
      setApprovalTasks((prev) => [...prev, newTask]);
    }
    setShowAddForm(false);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingTask(null);
  };

  // Get current approver for display
  const getCurrentApprover = (task) => {
    if (task.approvalMode === "sequential" && task.currentApproverIndex >= 0) {
      const approverId = task.sequentialOrder[task.currentApproverIndex];
      return teamMembers.find((m) => m.id === approverId)?.name || "Unknown";
    }
    return null;
  };

  // Check if current user can approve
  const canCurrentUserApprove = (task) => {
    const currentUserId = 1;

    // Not an approver
    if (!task.approvers.includes(currentUserId)) return false;

    // Task already finalized
    if (
      task.status === "approved" ||
      task.status === "rejected" ||
      task.status === "auto_approved"
    )
      return false;

    // Already made decision
    const existingDecision = task.approvalHistory.find(
      (h) => h.approverId === currentUserId,
    );
    if (existingDecision) return false;

    // Sequential mode - check turn
    if (task.approvalMode === "sequential") {
      const currentApprover = task.sequentialOrder[task.currentApproverIndex];
      return currentUserId === currentApprover;
    }

    return true;
  };

  return (
    <div className="approval-manager h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Approval Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage approval tasks and decision workflows
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
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
            Create Approval Task
          </button>
        </div>
      </div>

      {/* Approval Tasks List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
          {approvalTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getApprovalIcon(task.status)}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {task.taskName}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApprovalStatusColor(task.status)}`}
                    >
                      {task.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded"
                    title="Edit Task"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowAuditModal(task)}
                    className="text-gray-600 hover:text-gray-800 p-1 rounded"
                    title="View Audit Trail"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Task Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium text-gray-900">
                    {task.dueDate}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Mode:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {task.approvalMode.replace("_", " ")}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created by:</span>
                  <span className="font-medium text-gray-900">
                    {task.createdByName}
                  </span>
                </div>

                {getCurrentApprover(task) && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Approver:</span>
                    <span className="font-medium text-blue-600">
                      {getCurrentApprover(task)}
                    </span>
                  </div>
                )}

                {task.autoApproveAfter && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Auto-approve after:</span>
                    <span className="font-medium text-orange-600">
                      {task.autoApproveAfter} days
                    </span>
                  </div>
                )}
              </div>

              {/* Approvers List */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  Approvers
                </h4>
                <div className="flex flex-wrap gap-1">
                  {task.approvers.map((approverId) => {
                    const approver = teamMembers.find(
                      (m) => m.id === approverId,
                    );
                    const hasApproved = task.approvalHistory.find(
                      (h) => h.approverId === approverId,
                    );
                    return (
                      <span
                        key={approverId}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          hasApproved
                            ? hasApproved.decision === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {hasApproved &&
                          (hasApproved.decision === "approved" ? "✅ " : "❌ ")}
                        {approver?.name || "Unknown"}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons - Prompt 8: Inline buttons for approvers */}
              {canCurrentUserApprove(task) && (
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      const comment = prompt("Add a comment (optional):");
                      handleApprovalDecision(
                        task.id,
                        "approved",
                        comment || "",
                      );
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => {
                      const comment = prompt(
                        "Please provide a reason for rejection:",
                      );
                      if (comment) {
                        handleApprovalDecision(task.id, "rejected", comment);
                      }
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                  >
                    ❌ Reject
                  </button>
                </div>
              )}

              {/* Progress Indicator */}
              {task.approvalHistory.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-600 mb-1">
                    Progress: {task.approvalHistory.length} /{" "}
                    {task.approvers.length} responded
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${(task.approvalHistory.length / task.approvers.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {approvalTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No approval tasks yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create approval tasks to manage decision workflows
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              Create Approval Task
            </button>
          </div>
        )}
      </div>

      {/* Audit Trail Modal - Prompt 8 */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 overflow-hidden overlay-animate">
          <div
            className="drawer-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAuditModal(null)}
          ></div>
          <div className="absolute inset-x-4 top-4 bottom-4 bg-white rounded-xl shadow-2xl flex flex-col max-w-2xl mx-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Audit Trail: {showAuditModal.taskName}
              </h3>
              <button
                onClick={() => setShowAuditModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {showAuditModal.approvalHistory.length > 0 ? (
                <div className="space-y-4">
                  {showAuditModal.approvalHistory.map((entry, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-lg ${entry.decision === "approved" ? "text-green-500" : "text-red-500"}`}
                          >
                            {entry.decision === "approved" ? "✅" : "❌"}
                          </span>
                          <span className="font-medium text-gray-900">
                            {entry.approverName}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              entry.decision === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {entry.decision.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {entry.comment && (
                        <p className="text-sm text-gray-700 bg-white rounded p-2">
                          "{entry.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No approval decisions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-hidden overlay-animate">
          <div
            className="drawer-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleCloseForm}
          ></div>
          <div
            className="absolute right-0 top-0 h-full bg-white/95 backdrop-blur-sm flex flex-col modal-animate-slide-right"
            style={{
              width: "min(90vw, 800px)",
              boxShadow: "-10px 0 50px rgba(0,0,0,0.2)",
              borderLeft: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div className="drawer-header">
              <h2 className="text-2xl font-bold text-white">
                {editingTask ? "Edit Approval Task" : "Create Approval Task"}
              </h2>
              <button onClick={handleCloseForm} className="close-btn">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="drawer-body">
              <ApprovalTaskCreator
                onClose={handleCloseForm}
                onSubmit={handleTaskSubmit}
                initialData={editingTask}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
