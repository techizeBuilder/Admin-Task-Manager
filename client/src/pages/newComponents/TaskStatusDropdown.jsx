import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function TaskStatusDropdown({
  task,
  currentStatus,
  statuses,
  onStatusChange,
  canEdit,
  canMarkCompleted,
}) {
  // Notes:
  // - The dropdown menu is rendered into document.body via createPortal and positioned using
  //   fixed coordinates derived from the trigger's getBoundingClientRect(). This avoids clipping
  //   inside table cells or overflow-hidden containers.
  // - Position updates on scroll and resize to keep the menu aligned with the trigger.
  // - Keep tooltip rendering inline (not portaled) as it's small and anchored to the trigger.
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [validTransitions, setValidTransitions] = useState([]);
  const buttonRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 176 });

  // Enhanced status matching with fallbacks
  let currentStatusObj = statuses.find(
    (s) => s.code === currentStatus && s.active,
  );

  // Fallback: try case-insensitive matching
  if (!currentStatusObj && currentStatus) {
    currentStatusObj = statuses.find(
      (s) => s.code.toLowerCase() === currentStatus.toLowerCase() && s.active,
    );
  }

  // Fallback: try label matching
  if (!currentStatusObj && currentStatus) {
    currentStatusObj = statuses.find(
      (s) => s.label.toLowerCase() === currentStatus.toLowerCase() && s.active,
    );
  }

  // Comprehensive debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('TaskStatusDropdown Debug Info:', {
        currentStatus,
        currentStatusType: typeof currentStatus,
        taskTitle: task?.title || 'Unknown',
        availableStatuses: statuses.map(s => ({
          code: s.code,
          label: s.label,
          color: s.color,
          active: s.active
        })),
        foundStatusObj: currentStatusObj ? {
          code: currentStatusObj.code,
          label: currentStatusObj.label,
          color: currentStatusObj.color
        } : null,
        isMatched: !!currentStatusObj
      });
    }
  }, [currentStatus, statuses, currentStatusObj, task?.title]);

  const badgeStyle = currentStatusObj
    ? {
      backgroundColor: currentStatusObj.color,
      color: "white",
      border: `2px solid ${currentStatusObj.color}`,
      boxShadow: `0 0 0 1px ${currentStatusObj.color}20`
    }
    : {
      backgroundColor: "#6c757d", // Default gray color when status not found
      color: "white",
      border: "2px solid #6c757d"
    };  // Calculate valid transitions when dropdown opens
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

  // Update floating menu position when open, on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;

      const baseWidth = 176; // matches w-44 (11rem)
      const minWidth = Math.max(baseWidth, rect.width);
      const vw = window.innerWidth;
      const left = Math.min(Math.max(8, rect.left), vw - minWidth - 8);
      const top = rect.bottom + 4;
      setPos({ top, left, width: minWidth });
    };

    updatePosition();
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen]);

  if (!canEdit) {
    return (
      <div className="relative">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-help"
          style={{
            backgroundColor: currentStatusObj?.color || "#6c757d",
            color: "white"
          }}
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
        ref={buttonRef}
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

      {isOpen &&
        createPortal(
          <>
            {/* Backdrop to capture outside clicks */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            {/* Floating menu rendered in portal */}
            <div
              className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1"
              style={{ top: pos.top, left: pos.left, minWidth: pos.width }}
              role="menu"
              aria-orientation="vertical"
            >
              {/* Valid Transitions */}
              {validTransitions.length > 0 ? (
                <div>
                  {validTransitions.map((transitionCode) => {
                    const targetStatus = statuses.find(
                      (s) => s.code === transitionCode && s.active,
                    );
                    if (!targetStatus) return null;

                    return (
                      <button
                        key={transitionCode}
                        className="w-full text-left px-2 py-1 text-sm flex items-center gap-2 transition-all duration-200 group relative overflow-hidden hover:shadow-sm"
                        onClick={() => {
                          onStatusChange(transitionCode);
                          setIsOpen(false);
                        }}
                        style={{
                          background: `linear-gradient(90deg, ${targetStatus.color}15 0%, ${targetStatus.color}08 100%)`,
                          borderLeft: `3px solid ${targetStatus.color}`
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `linear-gradient(90deg, ${targetStatus.color}25 0%, ${targetStatus.color}15 100%)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `linear-gradient(90deg, ${targetStatus.color}15 0%, ${targetStatus.color}08 100%)`;
                        }}
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: targetStatus.color }}
                        />
                        <span className="font-medium text-gray-900 flex-1">
                          {targetStatus.label}
                        </span>
                        {targetStatus.isFinal && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">
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
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
