import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, Plus, Pause, AlertTriangle, CheckCircle, Trash2 } from "lucide-react";
import { useSubtask } from "../../contexts/SubtaskContext";
import { useView } from "../../contexts/ViewContext";
import { useLocation } from "wouter";
import {
  DeleteTaskModal,
  ReassignTaskModal,
  SnoozeTaskModal,
  MarkRiskModal,
  MarkDoneModal
} from '../../components/modals/TaskModals';

export default function TaskActionsDropdown({
  task,
  onSnooze,
  onMarkAsRisk,
  onMarkAsDone,
  onQuickMarkAsDone, // New prop for quick mark done
  onDelete,
}) {
  const { openSubtaskDrawer } = useSubtask();
  const { openViewModal } = useView();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [, navigate] = useLocation();

  // Modal states
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showMarkRiskModal, setShowMarkRiskModal] = useState(false);
  const [showMarkDoneModal, setShowMarkDoneModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
              navigate(`/tasks/${task.id}`);
            }}
          >
            <Eye size={16} className="text-gray-600" />
            <span className="font-medium">View</span>
          </button>

          <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              console.log('🚀 TaskActionsDropdown: Creating subtask for task:', {
                id: task.id,
                _id: task._id,
                title: task.title,
                fullTask: task
              });
              openSubtaskDrawer(task); // Pass the full task object, not just the ID
            }}
          >
            <Plus size={16} className="text-gray-600" />
            <span className="font-medium">Create Sub-task</span>
          </button>

          {/* View Sub-task option navigates to Task Detail with Subtasks tab pre-selected */}
          <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              navigate(`/tasks/${task.id}?tab=subtasks`);
            }}
          >
            <Eye size={16} className="text-gray-600" />
            <span className="font-medium">View Sub-task</span>
          </button>

          <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setShowSnoozeModal(true);
            }}
          >
            <Pause size={16} className="text-gray-600" />
            <span className="font-medium">Snooze</span>
          </button>

          <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setShowMarkRiskModal(true);
            }}
          >
            <AlertTriangle size={16} className="text-gray-600" />
            <span className="font-medium">Mark as Risk</span>
          </button>

          {/* <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setShowMarkDoneModal(true);
            }}
          >
            <CheckCircle size={16} className="text-gray-600" />
            <span className="font-medium">Mark as Done</span>
          </button> */}

          {/* Quick Mark Done - No confirmation needed */}
          <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              if (onQuickMarkAsDone) {
                onQuickMarkAsDone();
              }
            }}
          >
            <CheckCircle size={16} className="text-green-600" />
            <span className="font-medium">Mark as Done</span>
          </button>

          <div className="border-t border-gray-200 my-1"></div>

          <button
            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setShowDeleteModal(true);
            }}
          >
            <Trash2 size={16} className="text-red-600" />
            <span className="font-medium">Delete</span>
          </button>
        </div>
      )}

      {/* Modals rendered at document root level */}
      {(showSnoozeModal || showMarkRiskModal || showMarkDoneModal || showDeleteModal) &&
        createPortal(
          <>
            <SnoozeTaskModal
              isOpen={showSnoozeModal}
              onClose={() => setShowSnoozeModal(false)}
              onConfirm={(snoozeData) => {
                onSnooze && onSnooze(snoozeData);
                setShowSnoozeModal(false);
              }}
              task={task}
            />

            <MarkRiskModal
              isOpen={showMarkRiskModal}
              onClose={() => setShowMarkRiskModal(false)}
              onConfirm={(riskData) => {
                onMarkAsRisk && onMarkAsRisk(riskData);
                setShowMarkRiskModal(false);
              }}
              task={task}
            />

            <MarkDoneModal
              isOpen={showMarkDoneModal}
              onClose={() => setShowMarkDoneModal(false)}
              onConfirm={(doneData) => {
                onMarkAsDone && onMarkAsDone(doneData);
                setShowMarkDoneModal(false);
              }}
              task={task}
            />

            <DeleteTaskModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={() => {
                onDelete && onDelete();
                setShowDeleteModal(false);
              }}
              task={task}
            />
          </>,
          document.body
        )
      }
    </div>
  );
}
