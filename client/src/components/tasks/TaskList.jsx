import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { TaskCard } from "./TaskCard";
import { TaskFilters } from "./TaskFilters";
import { TaskForm } from "./TaskForm";
import { Plus, AlertCircle } from "lucide-react";

export function TaskList() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    statusId: "all",
    priority: "all",
    assignedToId: "all",
    projectId: "all"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks with filters
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ["/api/tasks", filters, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.statusId !== "all") params.append("statusId", filters.statusId);
      if (filters.priority !== "all") params.append("priority", filters.priority);
      if (filters.assignedToId !== "all") params.append("assignedToId", filters.assignedToId);
      if (filters.projectId !== "all") params.append("projectId", filters.projectId);
      if (searchTerm) params.append("search", searchTerm);
      
      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }
      return response.json();
    },
    retry: 2,
    staleTime: 30000, // 30 seconds
  });

  // Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    }
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) throw new Error("Failed to fetch projects");
      return response.json();
    }
  });

  // Fetch task statuses
  const { data: taskStatuses = [] } = useQuery({
    queryKey: ["/api/task-statuses"],
    queryFn: async () => {
      const response = await fetch("/api/task-statuses");
      if (!response.ok) throw new Error("Failed to fetch task statuses");
      return response.json();
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create task");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["/api/tasks"]);
      setShowCreateForm(false);
      toast({
        title: "Task created successfully",
        description: `"${data.title}" has been created.`,
        duration: 4000
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          updatedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update task");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["/api/tasks"]);
      setEditingTask(null);
      toast({
        title: "Task updated successfully",
        description: `"${data.title}" has been updated.`,
        duration: 4000
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id) => {
      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(`/api/tasks/${id}`, { 
        method: "DELETE" 
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete task");
      }
      
      return { id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["/api/tasks"]);
      toast({
        title: "Task deleted successfully",
        description: "The task has been removed.",
        duration: 4000
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // Handlers
  const handleCreateTask = (taskData) => {
    createTaskMutation.mutate(taskData);
  };

  const handleUpdateTask = (taskData) => {
    updateTaskMutation.mutate({ 
      id: editingTask._id, 
      data: taskData 
    });
  };

  const handleDeleteTask = (taskId) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      statusId: "all",
      priority: "all",
      assignedToId: "all",
      projectId: "all"
    });
  };

  const handleTaskClick = (task) => {
    // You can implement task detail view here
    console.log("Task clicked:", task);
  };

  // Error state
  if (tasksError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Failed to load tasks
        </h3>
        <p className="text-muted-foreground text-center mb-4">
          {tasksError.message}
        </p>
        <Button 
          onClick={() => queryClient.invalidateQueries(["/api/tasks"])}
          variant="outline"
          className="border-border hover:bg-accent"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Tasks Management
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-medium mt-1">
            Create, manage and track all your tasks
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-600"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <TaskFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={setFilters}
        users={users}
        projects={projects}
        taskStatuses={taskStatuses}
        onClearFilters={handleClearFilters}
      />

      {/* Task Grid */}
      {tasksLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="h-3 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded mb-4 w-3/4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
              <div className="h-3 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm || filters.statusId !== "all" || filters.priority !== "all" || 
             filters.assignedToId !== "all" || filters.projectId !== "all"
              ? "No tasks found"
              : "No tasks yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || filters.statusId !== "all" || filters.priority !== "all" || 
             filters.assignedToId !== "all" || filters.projectId !== "all"
              ? "Try adjusting your filters or search terms."
              : "Get started by creating your first task."}
          </p>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onClick={handleTaskClick}
              users={users}
              taskStatuses={taskStatuses}
            />
          ))}
        </div>
      )}

      {/* Create Task Form */}
      <TaskForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateTask}
        users={users}
        projects={projects}
        taskStatuses={taskStatuses}
        isLoading={createTaskMutation.isPending}
      />

      {/* Edit Task Form */}
      <TaskForm
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
        initialData={editingTask}
        users={users}
        projects={projects}
        taskStatuses={taskStatuses}
        isLoading={updateTaskMutation.isPending}
      />
    </div>
  );
}