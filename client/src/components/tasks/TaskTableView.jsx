import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { TaskForm } from "./TaskForm";
import { 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  SortAsc,
  SortDesc
} from "lucide-react";

export function TaskTableView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const tasksPerPage = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks with filters and pagination
  const { data: tasksResponse, isLoading, error } = useQuery({
    queryKey: ["/api/tasks", searchTerm, statusFilter, priorityFilter, userFilter, currentPage, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (userFilter !== "all") params.append("assignedTo", userFilter);
      params.append("page", currentPage.toString());
      params.append("limit", tasksPerPage.toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();

      // Handle different response formats
      if (Array.isArray(data)) {
        return { tasks: data, total: data.length };
      }
      return data;
    },
    retry: 2,
    staleTime: 30000
  });

  // Safely extract tasks data with fallbacks
  const tasksData = tasksResponse || { tasks: [], total: 0 };
  const tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : (Array.isArray(tasksData) ? tasksData : []);
  const totalTasks = tasksData.total || tasks.length || 0;

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

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete task");
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/tasks"]);
      toast({
        title: "Task deleted successfully",
        description: "The task has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
      });
      if (!response.ok) throw new Error("Failed to create task");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["/api/tasks"]);
      setShowCreateForm(false);
      toast({
        title: "Task created successfully",
        description: `"${data.title}" has been created.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["/api/tasks"]);
      setEditingTask(null);
      toast({
        title: "Task updated successfully",
        description: `"${data.title}" has been updated.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleDeleteTask = (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleCreateTask = (taskData) => {
    createTaskMutation.mutate(taskData);
  };

  const handleUpdateTask = (taskData) => {
    updateTaskMutation.mutate({ 
      id: editingTask._id, 
      data: taskData 
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      "todo": "bg-slate-100 text-slate-700 border-slate-300",
      "in-progress": "bg-blue-100 text-blue-700 border-blue-300",
      "completed": "bg-green-100 text-green-700 border-green-300",
      "on-hold": "bg-blue-100 text-blue-700 border-blue-300"
    };

    return statusColors[status?.toLowerCase()] || "bg-slate-100 text-slate-700 border-slate-300";
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      "low": "bg-green-100 text-green-700 border-green-300",
      "medium": "bg-blue-100 text-blue-700 border-blue-300",
      "high": "bg-red-100 text-red-700 border-red-300"
    };

    return priorityColors[priority?.toLowerCase()] || "bg-slate-100 text-slate-700 border-slate-300";
  };

  const formatDate = (date) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unassigned";
  };

  const totalPages = Math.ceil(totalTasks / tasksPerPage);

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          Failed to load tasks
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
          {error.message}
        </p>
        <Button 
          onClick={() => queryClient.invalidateQueries(["/api/tasks"])}
          variant="outline"
          className="border-slate-300"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters and Search */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-900 dark:text-white flex items-center">
            <Filter className="h-4 w-4 mr-1 text-blue-600" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-slate-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 border-slate-300 focus:border-blue-500 h-8 text-sm"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-slate-300 h-8 text-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="border-slate-300 h-8 text-sm">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="border-slate-300 h-8 text-sm">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Showing {tasks.length} of {totalTasks} tasks
            </p>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-sm px-3 py-1"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-700">
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-300 py-2 text-sm"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Task Title</span>
                      {sortBy === "title" && (
                        sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-slate-700 dark:text-slate-300 py-2 text-sm">Description</TableHead>
                  <TableHead className="font-medium text-slate-700 dark:text-slate-300 py-2 text-sm">Assigned User</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-300 py-2 text-sm"
                    onClick={() => handleSort("dueDate")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Due Date</span>
                      {sortBy === "dueDate" && (
                        sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-slate-700 dark:text-slate-300 py-2 text-sm">Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-300 py-2 text-sm"
                    onClick={() => handleSort("priority")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Priority</span>
                      {sortBy === "priority" && (
                        sortOrder === "asc" ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="font-medium text-slate-700 dark:text-slate-300 text-right py-2 text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="border-slate-200 dark:border-slate-700">
                      <TableCell><div className="h-4 bg-slate-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-slate-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-slate-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-slate-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-6 bg-slate-200 rounded animate-pulse w-20"></div></TableCell>
                      <TableCell><div className="h-6 bg-slate-200 rounded animate-pulse w-16"></div></TableCell>
                      <TableCell><div className="h-8 bg-slate-200 rounded animate-pulse w-20 ml-auto"></div></TableCell>
                    </TableRow>
                  ))
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-3">
                        <AlertCircle className="h-8 w-8 text-slate-400" />
                        <p className="text-slate-500 dark:text-slate-400">No tasks found</p>
                        <Button 
                          onClick={() => setShowCreateForm(true)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Task
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task._id} className="hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-white dark:bg-slate-800">
                      <TableCell className="font-medium text-slate-900 dark:text-white">
                        <div className="max-w-xs truncate">{task.title}</div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        <div className="max-w-xs truncate">{task.description || "No description"}</div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span>{getUserName(task.assignedToId)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-300">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                            <Badge 
                              variant="outline"
                              className={`status-${task.status}`}
                            >
                              {task.status?.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={`priority-${task.priority}`}
                            >
                              {task.priority?.toUpperCase()}
                            </Badge>
                          </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTask(task)}
                            className="hover:bg-blue-50 hover:text-blue-700 border-slate-300"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTask(task._id)}
                            className="hover:bg-red-50 hover:text-red-700 border-slate-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-slate-300"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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