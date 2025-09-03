import React, { useState, useEffect } from "react";

export default function TaskStatusDropdown({
  task,
  currentStatus,
  statuses,
  onStatusChange,
  canEdit,
  canMarkCompleted,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [validTransitions, setValidTransitions] = useState([]);

  const currentStatusObj = statuses.find(
    (s) => s.code === currentStatus && s.active,
  );
  const badgeStyle = currentStatusObj
    ? {
        backgroundColor: currentStatusObj.color,
        color: "white",
      }
    : {};

  // Calculate valid transitions when dropdown opens
  useEffect(() => {
    if (isOpen && currentStatusObj) {
      const transitions = currentStatusObj.allowedTransitions.filter(
        (transitionCode) => {
          const targetStatus = statuses.find(
            (s) => s.code === transitionCode && s.active,
          );

          // Check if target status exists and is active
          if (!targetStatus) return false;

          // Check sub-task completion logic for DONE status
          if (
            transitionCode === "DONE" &&
            task.subtasks &&
            task.subtasks.length > 0
          ) {
            const hasIncompleteSubtasks = task.subtasks.some(
              (subtask) =>
                subtask.status !== "DONE" && subtask.status !== "CANCELLED",
            );
            return !hasIncompleteSubtasks;
          }

          return true;
        },
      );

      setValidTransitions(transitions);
    }
  }, [isOpen, currentStatusObj, task.subtasks, statuses]);

  if (!canEdit) {
    return (
      <div className="relative">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-help"
          style={badgeStyle}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {currentStatusObj?.label || currentStatus}
          <svg
            className="ml-1 w-3 h-3 opacity-50"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10 max-w-xs">
            {currentStatusObj?.tooltip || "No permission to edit"}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity"
        style={badgeStyle}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {currentStatusObj?.label || currentStatus}
        <svg className="ml-1 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Status tooltip */}
      {showTooltip && !isOpen && currentStatusObj?.tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10 max-w-xs">
          {currentStatusObj.tooltip}
        </div>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-70 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {/* Current Status */}
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentStatusObj?.color }}
                />
                <span className="font-medium">
                  Current: {currentStatusObj?.label}
                </span>
              </div>
            </div>

            {/* Valid Transitions */}
            {validTransitions.length > 0 ? (
              <div className="py-1">
                <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Available Transitions
                </div>
                {validTransitions.map((transitionCode) => {
                  const targetStatus = statuses.find(
                    (s) => s.code === transitionCode && s.active,
                  );
                  if (!targetStatus) return null;

                  return (
                    <button
                      key={transitionCode}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors group"
                      onClick={() => {
                        onStatusChange(transitionCode);
                        setIsOpen(false);
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: targetStatus.color }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {targetStatus.label}
                        </div>
                        {targetStatus.description && (
                          <div className="text-xs text-gray-500">
                            {targetStatus.description}
                          </div>
                        )}
                      </div>
                      {targetStatus.isFinal && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Final
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-4 text-center">
                <div className="text-sm text-gray-500">
                  No valid transitions available
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {task.subtasks?.length > 0 &&
                  task.subtasks.some(
                    (s) => s.status !== "DONE" && s.status !== "CANCELLED",
                  )
                    ? "Complete all sub-tasks first"
                    : "This status cannot be changed further"}
                </div>
              </div>
            )}

            {/* All Statuses (for reference) */}
            <div className="border-t border-gray-200 py-1">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                All Available Statuses
              </div>
              {statuses
                .filter((s) => s.active)
                .map((status) => (
                  <div
                    key={status.code}
                    className={`px-3 py-2 text-sm flex items-center gap-2 ${
                      status.code === currentStatus
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="font-medium">{status.label}</span>
                    {status.code === currentStatus && (
                      <svg
                        className="ml-auto w-4 h-4 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {status.isFinal && status.code !== currentStatus && (
                      <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Final
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
