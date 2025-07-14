import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FileText,
  Link,
  Tag,
  Bell,
  RefreshCw,
  DollarSign,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Upload,
  PaperclipIcon
} from "lucide-react";

export function CreateTaskModal({ 
  isOpen, 
  onClose, 
  onCreateTask, 
  users = [], 
  projects = [], 
  taskStatuses = [],
  existingTasks = [] 
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [urls, setUrls] = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const [reminders, setReminders] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      projectId: "",
      taskType: "task",
      priority: "medium",
      statusId: "",
      startDate: null,
      dueDate: null,
      startTime: "09:00",
      dueTime: "17:00",
      parentTaskId: "",
      isRecurring: false,
      recurringPattern: "weekly",
      isBillable: false,
      isPrivate: false,
      estimatedHours: "",
      notificationSettings: {
        onAssignment: true,
        onDueDate: true,
        onCompletion: false
      }
    }
  });

  const handleAddAssignee = (userId) => {
    const user = users.find(u => u._id === userId);
    if (user && !assignedUsers.find(u => u._id === userId)) {
      setAssignedUsers([...assignedUsers, user]);
    }
  };

  const handleRemoveAssignee = (userId) => {
    setAssignedUsers(assignedUsers.filter(u => u._id !== userId));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddUrl = () => {
    if (urlInput.trim() && !urls.some(url => url.url === urlInput.trim())) {
      setUrls([...urls, { 
        id: Date.now(), 
        url: urlInput.trim(), 
        title: urlInput.trim() 
      }]);
      setUrlInput("");
    }
  };

  const handleRemoveUrl = (urlId) => {
    setUrls(urls.filter(url => url.id !== urlId));
  };

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, {
      id: Date.now(),
      title: "",
      assignedTo: "",
      dueDate: null,
      isCompleted: false
    }]);
  };

  const handleUpdateSubtask = (id, field, value) => {
    setSubtasks(subtasks.map(subtask => 
      subtask.id === id ? { ...subtask, [field]: value } : subtask
    ));
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== id));
  };

  const handleAddReminder = () => {
    setReminders([...reminders, {
      id: Date.now(),
      type: "email",
      timing: "1",
      unit: "days",
      message: ""
    }]);
  };

  const handleUpdateReminder = (id, field, value) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, [field]: value } : reminder
    ));
  };

  const handleRemoveReminder = (id) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    const taskData = {
      ...data,
      assignedTo: assignedUsers.map(u => u._id),
      tags,
      subtasks: subtasks.filter(st => st.title.trim()),
      urls,
      reminders,
      files: selectedFiles,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onCreateTask(taskData);
    form.reset();
    setAssignedUsers([]);
    setTags([]);
    setSubtasks([]);
    setUrls([]);
    setReminders([]);
    setSelectedFiles([]);
    onClose();
  };

  const taskTypes = [
    { value: "task", label: "Task" },
    { value: "bug", label: "Bug" },
    { value: "feature", label: "Feature" },
    { value: "improvement", label: "Improvement" },
    { value: "research", label: "Research" }
  ];

  const priorities = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-800" },
    { value: "high", label: "High", color: "bg-blue-100 text-blue-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a comprehensive task with all necessary information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">Task Title *</Label>
                  <Input
                    id="title"
                    {...form.register("title", { required: true })}
                    placeholder="Enter task title..."
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Describe the task in detail..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taskType">Task Type</Label>
                    <Select onValueChange={(value) => form.setValue("taskType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select onValueChange={(value) => form.setValue("priority", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${priority.color.split(' ')[0]}`} />
                              {priority.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project">Project</Label>
                    <Select onValueChange={(value) => form.setValue("projectId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project._id} value={project._id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={(value) => form.setValue("statusId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskStatuses.map(status => (
                          <SelectItem key={status._id} value={status._id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tags..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="assignment" className="space-y-4">
              <div className="space-y-4">
                {/* Assign To */}
                <div>
                  <Label>Assign To</Label>
                  <Select onValueChange={handleAddAssignee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team members" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => !assignedUsers.find(au => au._id === u._id)).map(user => (
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
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {assignedUsers.map(user => (
                      <Badge key={user._id} variant="outline" className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        {user.firstName} {user.lastName}
                        <button
                          type="button"
                          onClick={() => handleRemoveAssignee(user._id)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Parent Task */}
                <div>
                  <Label htmlFor="parentTask">Parent Task (if this is a subtask)</Label>
                  <Select onValueChange={(value) => form.setValue("parentTaskId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent task" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingTasks.map(task => (
                        <SelectItem key={task._id} value={task._id}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subtasks */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Subtasks</Label>
                    <Button type="button" onClick={handleAddSubtask} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subtask
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {subtasks.map((subtask) => (
                      <Card key={subtask.id}>
                        <CardContent className="p-3">
                          <div className="grid grid-cols-12 gap-2 items-center">
                            <Input
                              placeholder="Subtask title"
                              value={subtask.title}
                              onChange={(e) => handleUpdateSubtask(subtask.id, 'title', e.target.value)}
                              className="col-span-5"
                            />
                            <Select onValueChange={(value) => handleUpdateSubtask(subtask.id, 'assignedTo', value)}>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Assignee" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map(user => (
                                  <SelectItem key={user._id} value={user._id}>
                                    {user.firstName} {user.lastName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="date"
                              value={subtask.dueDate || ''}
                              onChange={(e) => handleUpdateSubtask(subtask.id, 'dueDate', e.target.value)}
                              className="col-span-3"
                            />
                            <Button
                              type="button"
                              onClick={() => handleRemoveSubtask(subtask.id)}
                              variant="outline"
                              size="sm"
                              className="col-span-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scheduling" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("startDate") ? format(new Date(form.watch("startDate")), "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch("startDate") ? new Date(form.watch("startDate")) : undefined}
                        onSelect={(date) => form.setValue("startDate", date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("dueDate") ? format(new Date(form.watch("dueDate")), "PPP") : "Pick due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch("dueDate") ? new Date(form.watch("dueDate")) : undefined}
                        onSelect={(date) => form.setValue("dueDate", date?.toISOString())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...form.register("startTime")}
                  />
                </div>

                <div>
                  <Label htmlFor="dueTime">Due Time</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    {...form.register("dueTime")}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.5"
                  placeholder="e.g., 8.5"
                  {...form.register("estimatedHours")}
                />
              </div>

              {/* Recurring Task */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isRecurring"
                    checked={form.watch("isRecurring")}
                    onCheckedChange={(checked) => form.setValue("isRecurring", checked)}
                  />
                  <Label htmlFor="isRecurring">Recurring Task</Label>
                </div>
                
                {form.watch("isRecurring") && (
                  <Select onValueChange={(value) => form.setValue("recurringPattern", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recurrence pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Reminders */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Reminders & Notifications</Label>
                  <Button type="button" onClick={handleAddReminder} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Reminder
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {reminders.map((reminder) => (
                    <Card key={reminder.id}>
                      <CardContent className="p-3">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <Select onValueChange={(value) => handleUpdateReminder(reminder.id, 'type', value)}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="push">Push</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            placeholder="1"
                            value={reminder.timing}
                            onChange={(e) => handleUpdateReminder(reminder.id, 'timing', e.target.value)}
                            className="col-span-2"
                          />
                          <Select onValueChange={(value) => handleUpdateReminder(reminder.id, 'unit', value)}>
                            <SelectTrigger className="col-span-2">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutes">Minutes</SelectItem>
                              <SelectItem value="hours">Hours</SelectItem>
                              <SelectItem value="days">Days</SelectItem>
                              <SelectItem value="weeks">Weeks</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Custom message"
                            value={reminder.message}
                            onChange={(e) => handleUpdateReminder(reminder.id, 'message', e.target.value)}
                            className="col-span-4"
                          />
                          <Button
                            type="button"
                            onClick={() => handleRemoveReminder(reminder.id)}
                            variant="outline"
                            size="sm"
                            className="col-span-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              {/* File Uploads */}
              <div>
                <Label>Files & Attachments</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload files or drag and drop</p>
                  </label>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <PaperclipIcon className="h-4 w-4" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* URLs */}
              <div>
                <Label>Reference URLs</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Add reference URLs..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                  />
                  <Button type="button" onClick={handleAddUrl} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {urls.length > 0 && (
                  <div className="space-y-1">
                    {urls.map((url) => (
                      <div key={url.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4" />
                          <a href={url.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {url.title}
                          </a>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleRemoveUrl(url.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isBillable"
                      checked={form.watch("isBillable")}
                      onCheckedChange={(checked) => form.setValue("isBillable", checked)}
                    />
                    <Label htmlFor="isBillable" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Mark as Billable
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPrivate"
                      checked={form.watch("isPrivate")}
                      onCheckedChange={(checked) => form.setValue("isPrivate", checked)}
                    />
                    <Label htmlFor="isPrivate" className="flex items-center gap-2">
                      {form.watch("isPrivate") ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      Private Task
                    </Label>
                  </div>
                </div>

                <div>
                  <Label>Notification Settings</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifyAssignment"
                        checked={form.watch("notificationSettings.onAssignment")}
                        onCheckedChange={(checked) => 
                          form.setValue("notificationSettings.onAssignment", checked)
                        }
                      />
                      <Label htmlFor="notifyAssignment">Notify on assignment</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifyDueDate"
                        checked={form.watch("notificationSettings.onDueDate")}
                        onCheckedChange={(checked) => 
                          form.setValue("notificationSettings.onDueDate", checked)
                        }
                      />
                      <Label htmlFor="notifyDueDate">Notify before due date</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifyCompletion"
                        checked={form.watch("notificationSettings.onCompletion")}
                        onCheckedChange={(checked) => 
                          form.setValue("notificationSettings.onCompletion", checked)
                        }
                      />
                      <Label htmlFor="notifyCompletion">Notify on completion</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}