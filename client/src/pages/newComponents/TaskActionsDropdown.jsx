import React, { useState, useRef, useEffect } from "react";
import { useSubtask } from "../../contexts/SubtaskContext";

export default function TaskActionsDropdown({
  task,
  onSnooze,
  onMarkAsRisk,
  onMarkAsDone,
  onView,
  onDelete,
}) {
  const { openSubtaskDrawer } = useSubtask();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors p-2 rounded-md hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="More actions"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 transform origin-top-right"
          style={{ zIndex: 9999 }}
        >
          <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onView);
            }}
          >
            <span className="text-lg">👁️</span>
            <span className="font-medium">View</span>
          </button>

          <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(() => openSubtaskDrawer(task));
            }}
          >
            <span className="text-lg">🔗</span>
            <span className="font-medium">Create Sub-task</span>
          </button>

          <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onSnooze);
            }}
          >
            <span className="text-lg">⏸️</span>
            <span className="font-medium">Snooze</span>
          </button>

          <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onMarkAsRisk);
            }}
          >
            <span className="text-lg">⚠️</span>
            <span className="font-medium">Mark as Risk</span>
          </button>

          <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onMarkAsDone);
            }}
          >
            <span className="text-lg">✅</span>
            <span className="font-medium">Mark as Done</span>
          </button>

          <div className="border-t border-gray-200 my-1"></div>

          <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleAction(onDelete);
            }}
          >
            <span className="text-lg">🗑️</span>
            <span className="font-medium">Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
