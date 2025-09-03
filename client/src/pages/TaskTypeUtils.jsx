export const getTaskTypeInfo = (taskType) => {
  const taskTypes = {
    regular: {
      icon: "📋",
      label: "Regular Task",
      color: "#3B82F6",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
    },
    recurring: {
      icon: "🔄",
      label: "Recurring Task",
      color: "#10B981",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
    },
    milestone: {
      icon: "🎯",
      label: "Milestone",
      color: "#8B5CF6",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
    },
    approval: {
      icon: "✅",
      label: "Approval Task",
      color: "#F59E0B",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
    },
  };

  return taskTypes[taskType] || taskTypes.regular;
};

export const getTaskPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "low":
      return "#10B981"; // Green
    case "medium":
      return "#F59E0B"; // Yellow
    case "high":
      return "#EF4444"; // Red
    case "critical":
    case "urgent":
      return "#DC2626"; // Dark Red
    default:
      return "#6B7280"; // Gray
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case "OPEN":
      return "#6B7280"; // Gray
    case "INPROGRESS":
      return "#3B82F6"; // Blue
    case "ONHOLD":
      return "#F59E0B"; // Yellow
    case "DONE":
      return "#10B981"; // Green
    case "CANCELLED":
      return "#EF4444"; // Red
    default:
      return "#6B7280"; // Gray
  }
};
