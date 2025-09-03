export const calculateDueDateFromPriority = (priority) => {
  const today = new Date();
  let daysToAdd = 7; // Default for medium priority
  
  switch (priority.toLowerCase()) {
    case "urgent":
      daysToAdd = 1;
      break;
    case "high":
      daysToAdd = 3;
      break;
    case "medium":
      daysToAdd = 5;
      break;
    case "low":
    default:
      daysToAdd = 7;
      break;
  }
  
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + daysToAdd);
  return dueDate.toISOString().split("T")[0];
};