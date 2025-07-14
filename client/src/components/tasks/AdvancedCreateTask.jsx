import { useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Users,
  Flag,
  Tag,
  Upload,
  FileText,
  Image,
  Paperclip,
  AlertCircle,
  CheckCircle,
  Save,
  Keyboard,
  Trash2,
  Plus
} from "lucide-react";

// Form validation schema
const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be under 200 characters"),
  description: z.string().max(2000, "Description must be under 2000 characters").optional(),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "Please select a priority level"
  }),
  dueDate: z.date().optional(),
  projectId: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
  estimatedHours: z.number().min(0).max(1000).optional()
});

export function AdvancedCreateTask({ 
  isOpen, 
  onClose, 
  users = [], 
  projects = [],
  onTaskCreated
}) {
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const [draftKey] = useState(`task-draft-${Date.now()}`);
  
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup with validation
  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: null,
      projectId: "",
      assigneeIds: [],
      tags: [],
      estimatedHours: ""
    },
    mode: "onChange" // Real-time validation
  });

  const { handleSubmit, watch, setValue, formState: { errors, isValid, isDirty } } = form;

  // Watch form values for auto-save
  const watchedValues = watch();

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData) => {
      const formData = new FormData();
      
      // Append basic task data
      Object.keys(taskData).forEach(key => {
        if (taskData[key] !== null && taskData[key] !== undefined) {
          if (Array.isArray(taskData[key])) {
            formData.append(key, JSON.stringify(taskData[key]));
          } else {
            formData.append(key, taskData[key]);
          }
        }
      });

      // Append files
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await fetch("/api/tasks", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create task");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["/api/tasks"]);
      toast({
        title: "Task created successfully",
        description: `"${data.title}" has been created and assigned.`,
        duration: 4000
      });
      clearDraft();
      resetForm();
      onTaskCreated?.(data);
      onClose();
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

  // Auto-save functionality
  const saveDraft = useCallback(async () => {
    if (isDirty && watchedValues.title?.trim()) {
      const draftData = {
        ...watchedValues,
        assignees,
        tags,
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      setAutoSaveStatus("Draft saved");
      
      setTimeout(() => setAutoSaveStatus(""), 2000);
    }
  }, [watchedValues, assignees, tags, files, isDirty, draftKey]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        Object.keys(draftData).forEach(key => {
          if (key === 'assignees') {
            setAssignees(draftData[key] || []);
          } else if (key === 'tags') {
            setTags(draftData[key] || []);
          } else if (key !== 'files' && key !== 'timestamp') {
            setValue(key, draftData[key]);
          }
        });
        setAutoSaveStatus("Draft loaded");
        setTimeout(() => setAutoSaveStatus(""), 2000);
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    }
  }, [draftKey, setValue]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isValid) {
          handleSubmit(onSubmit)();
        }
      }

      // Escape to close
      if (e.key === 'Escape' && !e.shiftKey) {
        onClose();
      }

      // Ctrl/Cmd + S to save draft
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isValid, handleSubmit, onClose, saveDraft]);

  // Priority levels configuration
  const priorityLevels = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800 border-green-200", icon: "🟢" },
    { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800 border-blue-200", icon: "🔵" },
    { value: "high", label: "High", color: "bg-blue-100 text-blue-800 border-blue-200", icon: "🔵" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800 border-red-200", icon: "🔴" }
  ];

  // Form handlers
  const onSubmit = (data) => {
    const taskData = {
      ...data,
      assigneeIds: assignees.map(a => a._id),
      tags,
      dueDate: data.dueDate?.toISOString(),
      estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : undefined
    };

    createTaskMutation.mutate(taskData);
  };

  const resetForm = () => {
    form.reset();
    setTags([]);
    setAssignees([]);
    setFiles([]);
    setTagInput("");
  };

  const clearDraft = () => {
    localStorage.removeItem(draftKey);
  };

  // Tag management
  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 10) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Assignee management
  const addAssignee = (userId) => {
    const user = users.find(u => u._id === userId);
    if (user && !assignees.find(a => a._id === userId)) {
      setAssignees([...assignees, user]);
    }
  };

  const removeAssignee = (userId) => {
    setAssignees(assignees.filter(a => a._id !== userId));
  };

  // File handling
  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).filter(file => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        });
        return false;
      }
      // Check if already added
      return !files.find(f => f.name === file.name && f.size === file.size);
    });

    setFiles(prev => [...prev, ...newFiles].slice(0, 10)); // Max 10 files
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // File icon helper
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <Paperclip className="h-4 w-4" />;
  };

  // File size formatter
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">Create New Task</DialogTitle>
              <DialogDescription className="mt-1">
                Fill in the details below to create a comprehensive task
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {autoSaveStatus && (
                <div className="flex items-center gap-1">
                  <Save className="h-3 w-3" />
                  {autoSaveStatus}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Keyboard className="h-3 w-3" />
                Ctrl+Enter to save
              </div>
            </div>
          </div>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Task Title <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter a descriptive task title..."
                className={`pr-10 ${errors.title ? 'border-red-500 focus:border-red-500' : ''}`}
                autoFocus
              />
              {errors.title && (
                <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Provide detailed information about the task..."
              rows={4}
              className={`resize-none ${errors.description ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description.message}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {watch("description")?.length || 0}/2000 characters
            </p>
          </div>

          {/* Priority and Project Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="priority"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <span>{priority.icon}</span>
                            <span>{priority.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.priority && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.priority.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Project</Label>
              <Controller
                name="projectId"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Due Date and Estimated Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Due Date</Label>
              <Controller
                name="dueDate"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : "Pick a due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours" className="text-sm font-medium">
                Estimated Hours
              </Label>
              <div className="relative">
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.5"
                  min="0"
                  max="1000"
                  {...form.register("estimatedHours", { valueAsNumber: true })}
                  placeholder="e.g., 8.5"
                  className="pr-10"
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              {errors.estimatedHours && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.estimatedHours.message}
                </p>
              )}
            </div>
          </div>

          {/* Assignees Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Assignees</Label>
            <Select onValueChange={addAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Add team members" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(user => !assignees.find(a => a._id === user._id))
                  .map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        {user.firstName} {user.lastName}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {assignees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {assignees.map((user) => (
                  <Badge key={user._id} variant="secondary" className="flex items-center gap-2 py-1 px-3">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.firstName} {user.lastName}</span>
                    <button
                      type="button"
                      onClick={() => removeAssignee(user._id)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="pr-10"
                />
                <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {tags.length >= 10 && (
              <p className="text-xs text-blue-600">Maximum 10 tags reached</p>
            )}
          </div>

          {/* File Attachments */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">File Attachments</Label>
            
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                accept="image/*,application/pdf,.doc,.docx,.txt,.xlsx,.csv"
              />
              
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Click to upload
                  </button>
                  <span className="text-gray-500"> or drag and drop</span>
                </div>
                <p className="text-xs text-gray-500">
                  Images, PDFs, Documents (max 10MB each, 10 files total)
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <div>
                            <p className="text-sm font-medium truncate max-w-xs">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {files.length >= 10 && (
              <p className="text-xs text-blue-600">Maximum 10 files reached</p>
            )}
          </div>

          <Separator />

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={saveDraft}
                className="text-sm"
              >
                <Save className="h-4 w-4 mr-1" />
                Save Draft
              </Button>
              {isDirty && (
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Unsaved changes
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isValid || createTaskMutation.isPending}
                className="min-w-[120px]"
              >
                {createTaskMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Create Task
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}