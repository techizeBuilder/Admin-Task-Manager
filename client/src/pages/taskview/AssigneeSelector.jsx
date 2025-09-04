import React, { useState } from 'react';

function AssigneeSelector({ assignee, assigneeId, onChange, canEdit }) {
  const [isOpen, setIsOpen] = useState(false);

  const teamMembers = [
    { id: 1, name: "John Smith", avatar: "JS" },
    { id: 2, name: "Sarah Wilson", avatar: "SW" },
    { id: 3, name: "Mike Johnson", avatar: "MJ" },
    { id: 4, name: "Emily Davis", avatar: "ED" },
  ];

  const currentAssignee =
    teamMembers.find((m) => m.id === assigneeId) || teamMembers[0];

  if (!canEdit) {
    return (
      <div className="assignee-display readonly">
        <span className="assignee-avatar">{currentAssignee.avatar}</span>
        <span className="assignee-name">{assignee}</span>
        <span className="readonly-indicator">🔒</span>
      </div>
    );
  }

  return (
    <div className="assignee-selector">
      <button className="assignee-button" onClick={() => setIsOpen(!isOpen)}>
        <span className="assignee-avatar">{currentAssignee.avatar}</span>
        <span className="assignee-name">{assignee}</span>
        <span className="dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="assignee-options">
          {teamMembers.map((member) => (
            <button
              key={member.id}
              className={`assignee-option ${
                member.id === assigneeId ? "selected" : ""
              }`}
              onClick={() => {
                onChange(member);
                setIsOpen(false);
              }}
            >
              <span className="assignee-avatar">{member.avatar}</span>
              <span className="assignee-name">{member.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AssigneeSelector;