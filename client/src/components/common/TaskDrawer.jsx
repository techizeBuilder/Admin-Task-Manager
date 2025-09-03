import React from "react";
import { X } from "lucide-react";

export default function TaskDrawer({ 
  isOpen, 
  onClose, 
  title, 
  children,
  width = "max-w-2xl" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className={`bg-white w-full ${width} h-full overflow-y-auto`}>
        {/* Drawer Header with Green Gradient */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            data-testid="button-close-drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}