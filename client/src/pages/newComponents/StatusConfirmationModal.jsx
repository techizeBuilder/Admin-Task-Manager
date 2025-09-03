import React from "react";

export default function StatusConfirmationModal({
  taskTitle,
  statusLabel,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-animate">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md modal-animate-slide-right">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Status Change
              </h3>
              <p className="text-sm text-gray-600">
                Please confirm this action
              </p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-900 mb-2">
              Are you sure you want to mark this task as{" "}
              <strong>{statusLabel}</strong>?
            </p>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              "{taskTitle}"
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
