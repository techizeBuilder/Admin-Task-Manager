import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";

export default function SubtaskActionsDropdown({
    subtask,
    parentTaskId,
    onEdit,
    onDelete,
    onView,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [, navigate] = useLocation();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const handleAction = (action) => {
        setIsOpen(false);

        switch (action) {
            case 'view':
                // Navigate to subtask detail page
                if (onView) {
                    onView(subtask);
                } else {
                    // Use TaskDetail page with subtask id
                    navigate(`/tasks/${subtask.id || subtask._id}`);
                }
                break;
            case 'edit':
                if (onEdit) {
                    onEdit(subtask);
                }
                break;
            case 'delete':
                if (onDelete) {
                    onDelete(parentTaskId, subtask.id);
                }
                break;
            default:
                break;
        }
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
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <button
                        onClick={() => handleAction('view')}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                    </button>

                    <button
                        onClick={() => handleAction('edit')}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Subtask
                    </button>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                        onClick={() => handleAction('delete')}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Subtask
                    </button>
                </div>
            )}
        </div>
    );
}