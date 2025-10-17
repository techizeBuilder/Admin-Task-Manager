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
  // triggerRef: the button inside the table cell
  const triggerRef = useRef(null);
  // menuRef: the floating menu rendered in a portal
  const menuRef = useRef(null);
  // computed menu position in viewport
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [, navigate] = useLocation();

  // Modal states
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showMarkRiskModal, setShowMarkRiskModal] = useState(false);
  const [showMarkDoneModal, setShowMarkDoneModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Compute and set menu position relative to the trigger button
  const updateMenuPosition = () => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const gap = 6; // space between button and menu
    const menuWidth = 224; // w-56 = 14rem = 224px
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = rect.right - menuWidth; // right aligned to button
    // Clamp to viewport with small padding
    left = Math.max(8, Math.min(left, viewportWidth - menuWidth - 8));
    let top = rect.bottom + gap;
    // If not enough space below, flip above
    const estimatedMenuHeight = 260; // conservative estimate
    if (top + estimatedMenuHeight > viewportHeight - 8) {
      top = Math.max(8, rect.top - gap - estimatedMenuHeight);
    }
    setMenuPos({ top, left });
  };

  // Close on outside click (both trigger and portal menu considered)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const t = triggerRef.current;
      const m = menuRef.current;
      if (
        isOpen &&
        t && m &&
        !t.contains(event.target) &&
        !m.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleResizeOrScroll = () => {
      if (isOpen) updateMenuPosition();
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside, true);
      window.addEventListener("resize", handleResizeOrScroll);
      window.addEventListener("scroll", handleResizeOrScroll, true);
      // initial position
      updateMenuPosition();
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
    };
  }, [isOpen]);

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative z-10">
      <button
        className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors p-2 rounded-md hover:bg-gray-100"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => {
            const next = !prev;
            if (!prev && next) {
              // opening
              setTimeout(updateMenuPosition, 0);
            }
            return next;
          });
        }}
        title="More actions"
        ref={triggerRef}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2"
            style={{ top: menuPos.top, left: menuPos.left }}
            role="menu"
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
          </div>,
          document.body
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
