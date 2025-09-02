import { create } from 'zustand';

const useTasksStore = create((set, get) => ({
  tasks: [],
  notifications: [],
  
  // Add task
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, { ...task, id: Date.now() }]
  })),
  
  // Update task
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    )
  })),
  
  // Remove task
  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== taskId)
  })),
  
  // Get task by ID
  getTaskById: (taskId) => {
    const { tasks } = get();
    return tasks.find(task => task.id === taskId);
  },
  
  // Add notification
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: Date.now() }]
  })),
  
  // Mark notification as read
  markNotificationRead: (notificationId) => set((state) => ({
    notifications: state.notifications.map(notification =>
      notification.id === notificationId 
        ? { ...notification, read: true } 
        : notification
    )
  })),
  
  // Clear all notifications
  clearNotifications: () => set({ notifications: [] }),
}));

export default useTasksStore;