import React, { useState } from "react";

// Helper function moved outside component
const getSystemPriorityLabel = (systemCode, systemPriorities) => {
  const systemPriority = systemPriorities.find((p) => p.code === systemCode);
  return systemPriority ? systemPriority.label : systemCode;
};

// Calculate due date based on priority
export const calculateDueDateFromPriority = (
  priority,
  creationDate = new Date(),
) => {
  const date = new Date(creationDate);
  const prioritySettings = JSON.parse(
    localStorage.getItem("prioritySettings") || "{}",
  );

  // Default days mapping
  const defaultDays = {
    LOW: 30,
    MEDIUM: 14,
    HIGH: 7,
    CRITICAL: 2,
    URGENT: 2,
  };

  const daysToAdd =
    prioritySettings[priority?.toUpperCase()] ||
    defaultDays[priority?.toUpperCase()] ||
    7;
  date.setDate(date.getDate() + daysToAdd);

  return date.toISOString().split("T")[0]; // Return YYYY-MM-DD format
};

function CompanyPriorityRow({
  priority,
  systemPriorities,
  onEdit,
  onDelete,
  onSetDefault,
  canEdit,
}) {
  // Guard against undefined priority
  if (!priority) {
    return null;
  }

  const getTaskCount = (priorityCode) => {
    const mockCounts = {
      LOW: 45,
      MEDIUM: 78,
      HIGH: 23,
      URGENT: 12,
      CRITICAL: 5,
    };
    return mockCounts[priorityCode] || 0;
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">
        {priority.name || "Unnamed Priority"}
      </td>
      <td className="px-6 py-4">
        <div className="system-mapping-display">
          <span className="system-priority-label text-sm text-gray-600">
            {getSystemPriorityLabel(
              priority.systemMapping,
              systemPriorities,
            )}{" "}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {priority.daysToDue} days
          </span>
          {priority.isDefault && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Default
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="btn btn-secondary btn-sm"
            disabled={!canEdit}
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="btn btn-danger btn-sm"
            disabled={!canEdit}
          >
            Delete
          </button>
          <button
            onClick={onSetDefault}
            className="btn btn-success btn-sm"
            disabled={!canEdit}
          >
            Set Default
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function PriorityManager() {
  const [priorities, setPriorities] = useState([
    {
      id: 1,
      name: "Low Priority",
      systemMapping: "LOW",
      isDefault: false,
      daysToDue: 30,
    },
    {
      id: 2,
      name: "Medium Priority",
      systemMapping: "MEDIUM",
      isDefault: true,
      daysToDue: 14,
    },
    {
      id: 3,
      name: "High Priority",
      systemMapping: "HIGH",
      isDefault: false,
      daysToDue: 7,
    },
    {
      id: 4,
      name: "Critical Priority",
      systemMapping: "CRITICAL",
      isDefault: false,
      daysToDue: 2,
    },
    {
      id: 5,
      name: "Urgent Priority",
      systemMapping: "URGENT",
      isDefault: false,
      daysToDue: 2,
    },
  ]);

  const systemPriorities = [
    { code: "LOW", label: "Low" },
    { code: "MEDIUM", label: "Medium" },
    { code: "HIGH", label: "High" },
    { code: "CRITICAL", label: "Critical" },
    { code: "URGENT", label: "Urgent" },
  ];

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPriority, setEditingPriority] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    systemMapping: "LOW",
    daysToDue: 7,
  });

  // Save priority settings to localStorage whenever priorities change
  React.useEffect(() => {
    const settings = {};
    priorities.forEach((priority) => {
      settings[priority.systemMapping] = priority.daysToDue;
    });
    localStorage.setItem("prioritySettings", JSON.stringify(settings));
  }, [priorities]);

  const handleEdit = (priority) => {
    setEditingPriority(priority);
    setFormData({
      name: priority.name,
      systemMapping: priority.systemMapping,
      daysToDue: priority.daysToDue,
    });
    setShowAddForm(true);
  };

  const handleDelete = (priority) => {
    if (window.confirm(`Are you sure you want to delete "${priority.name}"?`)) {
      setPriorities(priorities.filter((p) => p.id !== priority.id));
    }
  };

  const handleSetDefault = (priority) => {
    setPriorities(
      priorities.map((p) => ({ ...p, isDefault: p.id === priority.id })),
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPriority) {
      setPriorities(
        priorities.map((p) =>
          p.id === editingPriority.id
            ? {
                ...p,
                name: formData.name,
                systemMapping: formData.systemMapping,
                daysToDue: parseInt(formData.daysToDue),
              }
            : p,
        ),
      );
    } else {
      const newPriority = {
        id: Date.now(),
        name: formData.name,
        systemMapping: formData.systemMapping,
        daysToDue: parseInt(formData.daysToDue),
        isDefault: false,
      };
      setPriorities([...priorities, newPriority]);
    }
    setShowAddForm(false);
    setEditingPriority(null);
    setFormData({ name: "", systemMapping: "LOW", daysToDue: 7 });
  };

  return (
    <div className="space-y-6 p-5 h-auto overflow-scroll">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Priority Manager</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage task priorities and their system mappings
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary mt-4 lg:mt-0"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Priority
        </button>
      </div>

      {showAddForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPriority ? "Edit Priority" : "Add New Priority"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3  gap-4">
              <div>
                <label className="form-label">Priority Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="form-input"
                  placeholder="Enter priority name..."
                  required
                />
              </div>
              <div>
                <label className="form-label">System Mapping</label>
                <select
                  value={formData.systemMapping}
                  onChange={(e) =>
                    setFormData({ ...formData, systemMapping: e.target.value })
                  }
                  className="form-select"
                >
                  {systemPriorities.map((priority) => (
                    <option key={priority.code} value={priority.code}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Days to Due Date</label>
                <input
                  type="number"
                  value={formData.daysToDue}
                  onChange={(e) =>
                    setFormData({ ...formData, daysToDue: e.target.value })
                  }
                  className="form-input"
                  placeholder="7"
                  min="1"
                  max="365"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-assign due date after this many days
                </p>
              </div>
            </div>
            <div className="flex justify-between space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingPriority(null);
                  setFormData({ name: "", systemMapping: "LOW", daysToDue: 7 });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingPriority ? "Update Priority" : "Add Priority"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System Mapping
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days to Due
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {priorities
                .filter((priority) => priority && priority.id)
                .map((priority) => (
                  <CompanyPriorityRow
                    key={priority.id}
                    priority={priority}
                    systemPriorities={systemPriorities}
                    onEdit={() => handleEdit(priority)}
                    onDelete={() => handleDelete(priority)}
                    onSetDefault={() => handleSetDefault(priority)}
                    canEdit={true}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
