import React, { useState } from 'react';

function PriorityDropdown({ priority, onChange, canEdit }) {
  const [isOpen, setIsOpen] = useState(false);

  const priorities = [
    { value: "low", label: "Low", color: "#28a745" },
    { value: "medium", label: "Medium", color: "#ffc107" },
    { value: "high", label: "High", color: "#fd7e14" },
    { value: "critical", label: "Critical", color: "#dc3545" },
  ];

  if (!canEdit) {
    return (
      <div className="priority-display readonly">
        <span className={`priority-badge ${priority}`}>{priority}</span>
        <span className="readonly-indicator">🔒</span>
      </div>
    );
  }

  return (
    <div className="priority-dropdown">
      <button
        className={`priority-button ${priority}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {priority}
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="priority-options">
          {priorities.map((priorityOption) => (
            <button
              key={priorityOption.value}
              className={`priority-option ${
                priorityOption.value === priority ? "selected" : ""
              }`}
              onClick={() => {
                onChange(priorityOption.value);
                setIsOpen(false);
              }}
            >
              {priorityOption.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PriorityDropdown;