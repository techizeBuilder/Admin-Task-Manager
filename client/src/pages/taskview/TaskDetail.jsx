import React, { useState, useEffect } from 'react';
import { useSubtask } from '../../contexts/SubtaskContext';
import { useRoute, useLocation } from 'wouter';
import { useActiveRole } from '../../components/RoleSwitcher';
import axios from 'axios';
import {
  ClipboardList,
  CheckSquare,
  MessageCircle,
  Activity,
  Paperclip,
  Link,
  Plus,
  Trash2,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  X,
  Calendar,
  User,
  Tag,
  AlertCircle as AlertIcon,
  ThumbsUp,
  Reply,
  Send,
  Smile,
  FileText,
  Upload,
  Cloud,
  Filter,
  CheckCircle2,
  Edit,
  UserPlus,
  Zap,
  Bell,
  Loader
} from 'lucide-react';
import CoreInfoPanel from './CoreInfoPanel';
import SubtasksPanel from './SubtasksPanel';
import SubtaskForm from '../../components/forms/SubtaskForm';
import '../../components/forms/FormsStyles.css';
import {
  DeleteTaskModal,
  ReassignTaskModal,
  SnoozeTaskModal,
  MarkRiskModal,
  MarkDoneModal
} from '../../components/modals/TaskModals';
import '../../components/modals/ModalStyles.css';
import StatusDropdown from './StatusDropdown';
import PriorityDropdown from './PriorityDropdown';
import AssigneeSelector from './AssigneeSelector';
import { EditableTitle, EditableTextArea } from './EditableComponents';
import { TaskComments } from '../../components/tasks/TaskComments';
import TaskAttachments from '../newComponents/TaskAttachments';
import './TaskView.css';
import './DetailedView.css';

export default function TaskDetail({ taskId: propTaskId, onClose }) {
  const { openSubtaskDrawer } = useSubtask();
  const [, params] = useRoute('/tasks/:taskId');
  const taskId = propTaskId || params?.taskId;

  console.log('DEBUG - TaskDetail taskId:', taskId);

  // Initialize active tab from query string to avoid first paint on Core Info
  const initialTab = (() => {
    try {
      const search = typeof window !== 'undefined' ? window.location?.search || '' : '';
      const params = new URLSearchParams(search);
      const tab = params.get('tab');
      // Dynamic valid tabs - exclude subtasks for subtasks themselves
      const validTabs = new Set(["core-info", "comments", "activity", "files", "linked"]);
      if (tab && validTabs.has(tab)) return tab;
    } catch { }
    return "core-info";
  })();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [location, setLocation] = useLocation();
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showCreateSubtaskDrawer, setShowCreateSubtaskDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [moreInfo, setMoreInfo] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // API Integration State
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Activity Feed State
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState(null);
  const [activityFilter, setActivityFilter] = useState('all');

  // Fetch task data from API
  const fetchTaskData = async () => {
    if (!taskId) {
      setError('No task ID provided');
      setLoading(false);
      return;
    }

    try {
      console.log('DEBUG - Fetching task data for ID:', taskId);
      setLoading(true);

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const apiData = response.data.data;
        console.log('DEBUG - Received API data:', apiData);

        // Find the task data - it could be directly in data or in roles.employee array
        let taskData = null;
        let subtasksData = [];

        if (apiData.roles && apiData.roles.employee) {
          // Find the task in the employee array by matching the taskId
          const taskWithSubtasks = apiData.roles.employee.find(task =>
            task._doc._id === taskId || task._doc._id.toString() === taskId
          );

          if (taskWithSubtasks) {
            taskData = taskWithSubtasks._doc;
            subtasksData = taskWithSubtasks.subtasks || [];
          }
        } else if (apiData._id || apiData.id) {
          // Direct task data
          taskData = apiData;
          subtasksData = apiData.subtasks || [];
        }

        if (!taskData) {
          throw new Error('Task not found in API response');
        }

        console.log('DEBUG - Found task data:', taskData);
        console.log('DEBUG - Task assignedTo:', taskData.assignedTo);
        console.log('DEBUG - Task createdBy:', taskData.createdBy);
        console.log('DEBUG - Found subtasks data:', subtasksData);

        // Map the API response to the component's expected format
        const mappedTask = {
          id: taskData._id || taskData.id,
          _id: taskData._id,
          title: taskData.title || 'Untitled Task',
          description: taskData.description ? taskData.description.replace(/<[^>]*>/g, '') : 'No description provided',
          status: taskData.status?.toUpperCase() || 'TODO',
          priority: taskData.priority || 'medium',
          assignee: taskData.assignedTo ? `${taskData.assignedTo.firstName} ${taskData.assignedTo.lastName}`.trim() : 'Unassigned',
          assigneeId: taskData.assignedTo?._id || null,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toLocaleDateString() : 'No due date',
          startDate: taskData.startDate ? new Date(taskData.startDate).toLocaleDateString() : 'No start date',
          timeEstimate: taskData.timeEstimate || 'Not specified',
          tags: taskData.tags || [],
          createdBy: taskData.createdBy ? `${taskData.createdBy.firstName} ${taskData.createdBy.lastName}`.trim() : 'Unknown',
          creatorId: taskData.createdBy?._id || null,
          createdAt: taskData.createdAt ? new Date(taskData.createdAt).toLocaleDateString() : 'Unknown',
          updatedAt: taskData.updatedAt ? new Date(taskData.updatedAt).toLocaleDateString() : 'Unknown',
          snoozedUntil: taskData.snoozeUntil || null,
          snoozeNote: taskData.snoozeReason || null,
          taskType: taskData.taskType === 'regular' ? 'Regular Task' : (taskData.taskType || 'Regular Task'),
          isRisky: taskData.isRisk || false,
          riskNote: taskData.riskReason || '',
          parentTaskId: taskData.parentTaskId || null,
          visibility: taskData.visibility === 'private' ? 'Private' : (taskData.visibility || 'Private'),
          colorCode: taskData.colorCode || '#007bff',
          subtasks: subtasksData.map(subtask => ({
            id: subtask._id,
            _id: subtask._id,
            title: subtask.title,
            description: subtask.description,
            status: subtask.status?.toUpperCase() || 'TODO',
            priority: subtask.priority || 'medium',
            assignee: subtask.assignedTo ? `${subtask.assignedTo.firstName} ${subtask.assignedTo.lastName}`.trim() : 'Unassigned',
            assigneeId: subtask.assignedTo?._id || null,
            dueDate: subtask.dueDate ? new Date(subtask.dueDate).toLocaleDateString() : 'No due date',
            createdBy: subtask.createdBy ? `${subtask.createdBy.firstName} ${subtask.createdBy.lastName}`.trim() : 'Unknown',
            createdAt: subtask.createdAt,
            parentTaskId: subtask.parentTaskId,
            tags: subtask.tags || []
          })),
          linkedItems: taskData.linkedTasks || [],
          collaborators: taskData.collaborators?.map(c => c.name || `${c.firstName} ${c.lastName}`.trim()).filter(Boolean) || [],
          forms: [],
          attachments: taskData.attachments || [],
          // Additional fields from API
          progress: taskData.progress || 0,
          completedAt: taskData.completedAt,
          isSnooze: taskData.isSnooze || false,
          isRisk: taskData.isRisk || false,
          category: taskData.category || '',
          taskTypeAdvanced: taskData.taskTypeAdvanced || 'simple',
          mainTaskType: taskData.mainTaskType || 'regular',
          isSubtask: taskData.isSubtask || false,
          order: taskData.order || 0,
        };

        console.log('DEBUG - Mapped task subtasks:', mappedTask.subtasks);
        console.log('DEBUG - Subtasks count:', mappedTask.subtasks ? mappedTask.subtasks.length : 'undefined');

        setTask(mappedTask);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch task');
      }
    } catch (err) {
      console.error('Error fetching task:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for the task or subtask
  const fetchComments = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      console.log('DEBUG - fetchComments called for:', { taskId, task, isSubtask: task?.parentTask });

      let apiUrl;

      // Check if this is a subtask by looking for parentTask
      if (task?.parentTask || task?.parentTaskId) {
        const parentTaskId = task.parentTask?._id || task.parentTask || task.parentTaskId;
        apiUrl = `${baseUrl}/api/tasks/${parentTaskId}/subtasks/${taskId}/comments`;
        console.log('DEBUG - Fetching subtask comments from:', apiUrl);
      } else {
        apiUrl = `${baseUrl}/api/tasks/${taskId}/comments`;
        console.log('DEBUG - Fetching task comments from:', apiUrl);
      }

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('DEBUG - Comments API response:', result);
        // Handle new API response structure
        if (result.success && result.data && result.data.comments) {
          const fetchedComments = result.data.comments;
          setComments(fetchedComments);
          
          // Calculate total comments including replies
          const totalCount = result.data.pagination?.totalCommentsWithReplies || 
                           fetchedComments.reduce((count, comment) => {
                             return count + 1 + (comment.replies?.length || 0);
                           }, 0);
          setCommentsCount(totalCount);
          
          console.log('DEBUG - Comments updated:', {
            topLevelComments: fetchedComments.length,
            totalWithReplies: totalCount
          });
        } else if (Array.isArray(result)) {
          // Fallback for old format
          setComments(result);
          setCommentsCount(result.length);
        } else {
          setComments([]);
          setCommentsCount(0);
        }
      } else {
        console.error('Failed to fetch comments:', response.status, response.statusText);
        setComments([]);
        setCommentsCount(0);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  // Fetch activities for the task
  const fetchActivities = async () => {
    if (!taskId) return;

    try {
      setActivitiesLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      console.log('DEBUG - Fetching activities for task:', taskId);
      
      const response = await fetch(`${baseUrl}/api/tasks/${taskId}/activities?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('DEBUG - Activities API response:', result);
        
        if (result.success && result.data && result.data.activities) {
          const fetchedActivities = result.data.activities;
          
          // Format activities for display
          const formattedActivities = fetchedActivities.map(activity => ({
            id: activity._id,
            type: activity.type,
            description: activity.description,
            icon: activity.metadata?.icon || '📝',
            category: activity.metadata?.category || 'general',
            user: activity.user ? {
              id: activity.user._id,
              name: activity.user.name || `${activity.user.firstName || ''} ${activity.user.lastName || ''}`.trim(),
              email: activity.user.email,
              avatar: activity.user.avatar
            } : null,
            timestamp: activity.createdAt,
            relatedId: activity.relatedId,
            relatedType: activity.relatedType,
            metadata: activity.metadata || {}
          }));

          setActivities(formattedActivities);
          setActivitiesError(null);
          console.log('DEBUG - Activities updated:', formattedActivities.length);
        } else {
          setActivities([]);
          setActivitiesError('No activities found');
        }
      } else {
        console.error('Failed to fetch activities:', response.status, response.statusText);
        setActivities([]);
        setActivitiesError('Failed to load activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
      setActivitiesError(error.message || 'Failed to load activities');
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Fetch data when component mounts or taskId changes
  useEffect(() => {
    fetchTaskData();
    if (taskId) {
      fetchComments();
      fetchActivities(); // Add activity fetching
    }
  }, [taskId]);

  // Control body scroll when drawer opens
  useEffect(() => {
    if (onClose) { // Only when drawer is open (has onClose prop)
      document.body.classList.add('drawer-open');
      return () => {
        document.body.classList.remove('drawer-open');
      };
    }
  }, [onClose]);

  // Sync tab selection from query string, e.g. ?tab=subtasks
  useEffect(() => {
    // Wouter's location doesn't include the query string, so use window.location.search
    const search = window.location?.search || "";
    if (!search) return;
    const params = new URLSearchParams(search);
    const tab = params.get("tab");
    if (tab) {
      // allow only known tabs - dynamic based on task type
      const validTabs = new Set(task?.parentTaskId ?
        ["core-info", "comments", "activity", "files", "linked"] :
        ["core-info", "subtasks", "comments", "activity", "files", "linked"]
      );
      if (validTabs.has(tab)) {
        setActiveTab(tab);
      }
    }
  }, [location, task?.parentTaskId]);

  // Get current user from authentication context or localStorage
  const [currentUser, setCurrentUser] = useState(null);
  const { activeRole } = useActiveRole(); // Get active role from context

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            console.log('DEBUG - Current user data:', userData);

            // Use activeRole from context, fallback to first role from API
            const userRole = activeRole || (Array.isArray(userData.data?.role) ? userData.data.role[0] : userData.data?.role) ||
              (Array.isArray(userData.role) ? userData.role[0] : userData.role) || 'employee';

            console.log('DEBUG - Final user role:', userRole, 'activeRole:', activeRole);

            setCurrentUser({
              id: userData.data?._id || userData._id,
              _id: userData.data?._id || userData._id,
              firstName: userData.data?.firstName || userData.firstName,
              lastName: userData.data?.lastName || userData.lastName,
              name: userData.data?.name || userData.name || `${userData.data?.firstName || userData.firstName} ${userData.data?.lastName || userData.lastName}`,
              email: userData.data?.email || userData.email,
              role: userRole // Use single role string, not array
            });
          } else {
            // Fallback to mock user if API fails
            setCurrentUser({
              id: '1',
              _id: '1',
              firstName: "Current",
              lastName: "User",
              name: "Current User",
              email: "current@company.com",
              role: activeRole || "employee", // Use activeRole or default
            });
          }
        } else {
          // No token - use mock user
          setCurrentUser({
            id: '1',
            _id: '1',
            firstName: "Current",
            lastName: "User",
            name: "Current User",
            email: "current@company.com",
            role: activeRole || "employee", // Use activeRole or default
          });
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        // Fallback to mock user
        setCurrentUser({
          id: '1',
          _id: '1',
          firstName: "Current",
          lastName: "User",
          name: "Current User",
          email: "current@company.com",
          role: activeRole || "employee", // Use activeRole or default
        });
      }
    };

    fetchCurrentUser();
  }, [activeRole]); // Refetch when activeRole changes  // Helper function to determine user permissions based on role
  const getUserPermissions = (user, task) => {
    if (!user || !task) {
      console.log('DEBUG - getUserPermissions: Missing user or task');
      return { canAdd: false, canEdit: false, canDelete: false, canView: true };
    }

    console.log('DEBUG - getUserPermissions:', {
      userRole: user.role,
      taskId: task._id,
      userId: user.id,
      userIdType: typeof user.id,
      taskAssignedTo: task.assignedTo,
      taskAssignedToType: typeof task.assignedTo,
      taskCreatedBy: task.createdBy,
      taskCreatedByType: typeof task.createdBy
    });

    // Normalize IDs for comparison
    const userId = user.id?.toString() || user._id?.toString();
    const taskAssignedTo = task.assignedTo?.toString();
    const taskCreatedBy = task.createdBy?.toString();

    const isTaskAssignee = taskAssignedTo === userId;
    const isTaskCreator = taskCreatedBy === userId;


    // Check if user is tagged as contributor in this specific task
    const isTaggedContributor = task.contributors && task.contributors.some(c => {
      const contributorId = c?.id?.toString() || c?._id?.toString() || c?.toString();
      return contributorId === userId;
    });

    // Check if user is mentioned in task or tagged as collaborator
    const isCollaboratorInTask = task.collaborators && task.collaborators.some(c => {
      const collaboratorId = c?.id?.toString() || c?._id?.toString() || c?.toString();
      return collaboratorId === userId;
    });

    console.log('DEBUG - Permission checks:', {
      isTaskAssignee,
      isTaskCreator,
      isTaggedContributor,
      isCollaboratorInTask,
      userId,
      taskAssignedTo,
      taskCreatedBy
    });    // Role-based permissions according to specifications:
    // 1. employee (Normal User) - only own tasks
    // 2. manager - own tasks + subordinates' tasks  
    // 3. contributor - tagged/mentioned tasks only (contextual role)
    // 4. org_admin (Company Admin) - all company tasks
    // 5. tasksetu-admin - platform level (all tasks)

    // Tasksetu Admin (platform level) - highest priority
    if (user.role === 'tasksetu-admin' || user.role === 'super-admin') {
      return {
        canAdd: true,
        canEdit: true, // Can edit any comment
        canDelete: true, // Can delete any comment
        canView: true,
        canModerate: true,
        canAttachFiles: true,
        canMention: true
      };
    }

    // Company Admin (org_admin) - all company tasks
    if (user.role === 'org_admin' || user.role === 'company-admin' || user.role === 'admin') {
      return {
        canAdd: true,
        canEdit: true, // Can edit own comments
        canDelete: true, // Can delete own comments + moderate
        canView: true,
        canModerate: true, // Can moderate others' comments
        canAttachFiles: true,
        canMention: true
      };
    }

    // Manager - own tasks + subordinates' tasks
    if (user.role === 'manager') {
      // Check if this is own task or subordinate's task
      const isOwnTask = isTaskAssignee || isTaskCreator;
      const isSubordinateTask = task.assignedToRole === 'employee' || task.createdByRole === 'employee';

      if (isOwnTask || isSubordinateTask || isTaggedContributor || isCollaboratorInTask) {
        return {
          canAdd: true,
          canEdit: true, // Can edit own comments
          canDelete: true, // Can delete own comments
          canView: true,
          canModerate: false,
          canAttachFiles: true,
          canMention: true
        };
      }
    }

    // Employee (Normal User) - only own tasks or when tagged as contributor
    if (user.role === 'employee' || user.role === 'normal-user' || user.role === 'user' || !user.role) {
      const isOwnTask = isTaskAssignee || isTaskCreator;

      console.log('DEBUG - Employee permission check:', {
        isOwnTask,
        isTaggedContributor,
        isCollaboratorInTask,
        userRole: user.role,
        isTaskAssignee,
        isTaskCreator
      });

      if (isOwnTask || isTaggedContributor || isCollaboratorInTask) {
        console.log('DEBUG - Permission granted: Employee own task or contributor');
        return {
          canAdd: true,
          canEdit: true, // Can edit own comments only
          canDelete: true, // Can delete own comments only
          canView: true,
          canModerate: false,
          canAttachFiles: true,
          canMention: true
        };
      }
    }    // Contributor role (contextual) - only when tagged/mentioned
    if (isTaggedContributor || isCollaboratorInTask) {
      return {
        canAdd: true,
        canEdit: true, // Can edit own comments only
        canDelete: true, // Can delete own comments only
        canView: true,
        canModerate: false,
        canAttachFiles: true, // Contributors can attach files
        canMention: true
      };
    }

    console.log('DEBUG - Permission denied: No matching conditions for role:', user.role);
    // Default - view only (for tasks user has no permission to comment on)
    return {
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canView: true,
      canModerate: false,
      canAttachFiles: false,
      canMention: false
    };
  };  // Mock users for mentions
  const [users] = useState([
    { id: 1, firstName: "John", lastName: "Smith", email: "john@company.com" },
    { id: 2, firstName: "Sarah", lastName: "Wilson", email: "sarah@company.com" },
    { id: 3, firstName: "Mike", lastName: "Johnson", email: "mike@company.com" },
    { id: 4, firstName: "Emily", lastName: "Davis", email: "emily@company.com" },
  ]);

  // Comments state managed from API
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);

  // Comment handlers
  const handleAddComment = async (commentData) => {
    try {
      console.log('DEBUG - handleAddComment called with:', commentData);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      let apiUrl;
      // Check if this is a subtask
      if (task?.parentTask || task?.parentTaskId) {
        const parentTaskId = task.parentTask?._id || task.parentTask || task.parentTaskId;
        apiUrl = `${baseUrl}/api/tasks/${parentTaskId}/subtasks/${taskId}/comments`;
        console.log('DEBUG - Adding subtask comment to:', apiUrl);
      } else {
        apiUrl = `${baseUrl}/api/tasks/${taskId}/comments`;
        console.log('DEBUG - Adding task comment to:', apiUrl);
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: commentData.content,
          mentions: commentData.mentions || [],
          parentId: commentData.parentId || null
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('DEBUG - Comment added successfully:', result);

        // Refresh comments and activities
        await fetchComments();
        await fetchActivities();
      } else {
        const errorData = await response.json();
        console.error('Failed to add comment:', errorData);
        alert('Failed to add comment: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Error adding comment: ' + error.message);
    }
  };

  const handleReplyToComment = async (commentId, replyData) => {
    try {
      console.log('DEBUG - handleReplyToComment called with:', { commentId, replyData });
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      let apiUrl;
      // Check if this is a subtask
      if (task?.parentTask || task?.parentTaskId) {
        const parentTaskId = task.parentTask?._id || task.parentTask || task.parentTaskId;
        apiUrl = `${baseUrl}/api/tasks/${parentTaskId}/subtasks/${taskId}/comments/${commentId}/reply`;
        console.log('DEBUG - Adding subtask reply to:', apiUrl);
      } else {
        apiUrl = `${baseUrl}/api/tasks/${taskId}/comments/${commentId}/reply`;
        console.log('DEBUG - Adding task reply to:', apiUrl);
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: replyData.content,
          mentions: replyData.mentions || []
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('DEBUG - Reply added successfully:', result);

        // Refresh comments and activities to show the new reply and update count
        await fetchComments();
        await fetchActivities();
      } else {
        const errorData = await response.json();
        console.error('Failed to add reply:', errorData);
        alert('Failed to add reply: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Error adding reply: ' + error.message);
    }
  };

  const handleEditComment = async (commentId, commentData) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      let apiUrl;
      // Check if this is a subtask
      if (task?.parentTask || task?.parentTaskId) {
        const parentTaskId = task.parentTask?._id || task.parentTask || task.parentTaskId;
        apiUrl = `${baseUrl}/api/tasks/${parentTaskId}/subtasks/${taskId}/comments/${commentId}`;
        console.log('DEBUG - Editing subtask comment at:', apiUrl);
      } else {
        apiUrl = `${baseUrl}/api/tasks/${taskId}/comments/${commentId}`;
        console.log('DEBUG - Editing task comment at:', apiUrl);
      }

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: commentData.content,
          mentions: commentData.mentions || []
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('DEBUG - Comment edited successfully:', result);

        // Refresh comments and activities
        await fetchComments();
        await fetchActivities();
      } else {
        const errorData = await response.json();
        console.error('Failed to edit comment:', errorData);
        alert('Failed to edit comment: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      alert('Error editing comment: ' + error.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      let apiUrl;
      // Check if this is a subtask
      if (task?.parentTask || task?.parentTaskId) {
        const parentTaskId = task.parentTask?._id || task.parentTask || task.parentTaskId;
        apiUrl = `${baseUrl}/api/tasks/${parentTaskId}/subtasks/${taskId}/comments/${commentId}`;
      } else {
        apiUrl = `${baseUrl}/api/tasks/${taskId}/comments/${commentId}`;
      }

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        console.log('DEBUG - Comment deleted successfully');

        // Refresh comments and activities
        await fetchComments();
        await fetchActivities();
      } else {
        const errorData = await response.json();
        console.error('Failed to delete comment:', errorData);
        alert('Failed to delete comment: ' + errorData.message);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment: ' + error.message);
    }
  };

  // Mock task data - matches wireframe requirements
  // const [task, setTask] = useState({
  //   id: taskId || 1,
  //   title: "Migrate the existing database from MySQL to PostgreSQL",
  //   description: "Migrate the existing database from MySQL to PostgreSQL while ensuring data integrity and minimal downtime.",
  //   status: "in-progress",
  //   priority: "high",
  //   assignee: "John Smith",
  //   assigneeId: 1,
  //   dueDate: "2024-01-25",
  //   startDate: "2024-01-15",
  //   timeEstimate: "40 hours",
  //   tags: ["database", "migration", "backend"],
  //   createdBy: "Sarah Wilson",
  //   creatorId: 2,
  //   createdAt: "2024-01-15 09:00",
  //   updatedAt: "2024-01-20 14:30",
  //   snoozedUntil: null,
  //   snoozeNote: null,
  //   taskType: "Regular Task",
  //   isRisky: false,
  //   riskNote: "",
  //   parentTaskId: null,
  //   visibility: "Private",
  //   colorCode: "#007bff",
  //   subtasks: [
  //     {
  //       id: 101,
  //       title: "Backup existing database",
  //       status: "completed",
  //       assignee: "John Smith",
  //       dueDate: "2024-01-20",
  //       priority: "high"
  //     },
  //     {
  //       id: 102,
  //       title: "Set up PostgreSQL instance",
  //       status: "completed",
  //       assignee: "Mike Johnson",
  //       dueDate: "2024-01-22",
  //       priority: "medium"
  //     },
  //     {
  //       id: 103,
  //       title: "Create migration scripts",
  //       status: "in-progress",
  //       assignee: "Sarah Wilson",
  //       dueDate: "2024-01-24",
  //       priority: "high"
  //     },
  //     {
  //       id: 104,
  //       title: "Test data integrity",
  //       status: "pending",
  //       assignee: "Emily Davis",
  //       dueDate: "2024-01-26",
  //       priority: "medium"
  //     },
  //     {
  //       id: 105,
  //       title: "Update application configs",
  //       status: "pending",
  //       assignee: "John Smith",
  //       dueDate: "2024-01-27",
  //       priority: "low"
  //     },
  //   ],
  //   linkedItems: [
  //     { id: 1, type: "task", title: "Update Documentation", status: "pending" },
  //     { id: 2, type: "document", title: "Migration Plan", status: "completed" },
  //     { id: 3, type: "form", title: "Migration Checklist", status: "in-progress" },
  //   ],
  //   collaborators: ["Mike Johnson", "Emily Davis"],
  //   forms: [
  //     {
  //       id: 1,
  //       title: "Migration Checklist",
  //       type: "checklist",
  //       status: "in-progress",
  //     },
  //   ],
  // });

  const tabs = [
    { id: "core-info", label: "Core Info", icon: ClipboardList, hasIcon: true },
    // Only show subtasks tab if this is not a subtask itself (no parentTaskId)
    ...(task?.parentTaskId ? [] : [{
      id: "subtasks",
      label: "Subtasks",
      icon: CheckSquare,
      count: task?.subtasks?.length || 0,
      hasIcon: true
    }]),
    { id: "comments", label: "Comments", icon: MessageCircle, count: commentsCount, hasIcon: true },
    { id: "activity", label: "Activity Feed", icon: Activity, hasIcon: true },
    { id: "files", label: "Files & Links", icon: Paperclip, hasIcon: true },
    {
      id: "linked",
      label: "Linked Items",
      icon: Link,
      count: task?.linkedItems?.length || 0,
      hasIcon: true
    }
  ];

  console.log('DEBUG - Tabs subtask count:', task?.subtasks?.length);

  const now = new Date();
  const snoozedUntil = task?.snoozedUntil ? new Date(task.snoozedUntil) : null;
  const isSnoozed = snoozedUntil && snoozedUntil > now;

  // Enhanced permission checks
  const permissions = {
    canView: true,
    canEdit: true,
    canReassign: true,
    canDelete: true,
    canComment: true,
    canAddFiles: true,
    canChangeStatus: true,
  };

  // Loading state
  if (loading) {
    return (
      <div className="task-view-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-lg text-gray-600">Loading task details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="task-view-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Task</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchTaskData}
                className="btn btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No task found state
  if (!task) {
    return (
      <div className="task-view-container">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h3>
              <p className="text-gray-600">The requested task could not be found or you don't have permission to view it.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (newStatus) => {
    const taskId = task?.id || task?._id;
    
    if (!taskId) {
      console.error('TaskDetail: Task ID not found for status update');
      alert('Task ID not found. Cannot update status.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log(`TaskDetail: Updating task ${taskId} status to ${newStatus}`, {
        taskTitle: task?.title || 'Unknown',
        fromStatus: task?.status,
        toStatus: newStatus
      });

      const response = await axios.patch(
        `http://localhost:5000/api/tasks/${taskId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('TaskDetail: Status update successful:', response.data);
      
      // Update local state after successful API call
      setTask({ ...task, status: newStatus });

      // Refresh activities to show the status change
      fetchActivities();

      // Trigger color update events
      const statusEvent = new CustomEvent('taskStatusUpdated', {
        detail: { 
          taskId: taskId, 
          newStatus: newStatus,
          immediate: true
        }
      });
      window.dispatchEvent(statusEvent);

      const colorEvent = new CustomEvent('taskColorUpdated', {
        detail: { 
          taskId: taskId, 
          newStatus: newStatus
        }
      });
      window.dispatchEvent(colorEvent);
      
    } catch (error) {
      console.error('TaskDetail: Error updating status:', error);
      
      let errorMessage = 'Failed to update task status';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update this task.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Task not found.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    }
  };

  const handlePriorityChange = (newPriority) => {
    setTask({ ...task, priority: newPriority });
  };

  const handleCreateSubtask = (subtaskData) => {
    const newSubtask = {
      id: Date.now(),
      ...subtaskData,
      parentTaskId: task.id,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    setTask({ ...task, subtasks: updatedSubtasks });
    setShowCreateSubtaskDrawer(false);
    
    // Refresh activities to show subtask creation
    fetchActivities();
  };

  const handleMarkDone = () => {
    setShowDoneModal(true);
  };

  const handleDeleteTask = () => {
    console.log('Deleting task');
  };

  const handleReassignTask = (assigneeId) => {
    console.log('Reassigning task to:', assigneeId);
  };

  const handleSnoozeTask = (snoozeData) => {
    console.log('Snoozing task:', snoozeData);
  };

  const handleMarkRisk = (riskNote) => {
    console.log('Marking as risk:', riskNote);
  };

  const handleExportTask = () => {
    console.log("Exporting task:", task);
  };

  return (
    <div className="task-view-container">
      {/* Top Action Bar */}
      <div className="task-action-bar">
        <div className="action-buttons-left">
          <button className="action-btn primary" onClick={() => openSubtaskDrawer(task)}>
            <Plus className="btn-icon" size={16} />
            Add Sub-task
          </button>
          <button className="action-btn secondary" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="btn-icon" size={16} />
            Delete
          </button>
          <button className="action-btn secondary" onClick={() => setShowReassignModal(true)}>
            <Users className="btn-icon" size={16} />
            Reassign
          </button>
          <button className="action-btn secondary" onClick={() => setShowSnoozeModal(true)}>
            <Clock className="btn-icon" size={16} />
            Snooze
          </button>
          <button className="action-btn warning" onClick={() => setShowRiskModal(true)}>
            <AlertTriangle className="btn-icon" size={16} />
            Mark Risk
          </button>
          <button className="action-btn success" onClick={handleMarkDone}>
            <CheckCircle className="btn-icon" size={16} />
            Mark Done
          </button>
          <button className="action-btn secondary" onClick={handleExportTask}>
            <Download className="btn-icon" size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="task-tabs">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent className="tab-icon" size={16} />
              <span className="tab-label">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="tab-count">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="task-content">
        {activeTab === "core-info" && (
          <div className="core-info-view">
            {/* Task Overview Section */}
            <div className="task-overview-card rounded-md">
              <div className="overview-header">
                <div className="overview-icon">
                  <ClipboardList size={24} />
                </div>
                <div className="overview-content">
                  <h2 className="overview-title">Task Overview</h2>
                  <p className="overview-subtitle">Complete task information and details</p>
                </div>
                <button className="view-more-btn" onClick={() => setMoreInfo(!moreInfo)}>
                  View More
                </button>
              </div>

              {/* Active Reminders */}
              <div className="active-reminders">
                <div className="reminder-icon">
                  <AlertIcon size={20} />
                </div>
                <div className="reminder-content">
                  <strong>Active Reminders:</strong>
                  <div className="reminder-text">
                    {task.dueDate !== 'No due date' ? (
                      (() => {
                        const dueDate = new Date(task.dueDate);
                        const today = new Date();
                        const diffTime = dueDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays < 0) {
                          return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} - ${task.dueDate}`;
                        } else if (diffDays === 0) {
                          return `Due today - ${task.dueDate}`;
                        } else {
                          return `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''} - ${task.dueDate}`;
                        }
                      })()
                    ) : 'No due date set'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="description-section">
                <h3 className="section-title">Description</h3>
                <div className="description-content">
                  <p className="description-text">
                    {task.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed View Panel */}
            {moreInfo && (
              <div className="detailed-view-panel">
                <div className="detailed-view-header">
                  <h3>Detailed View</h3>
                  <button className="close-btn" onClick={() => setMoreInfo(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="details-grid">
                  {/* Task Details */}
                  <div className="detail-card">
                    <div className="detail-header">
                      <ClipboardList size={16} className="detail-icon" />
                      <h4>Task Details</h4>
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-label">Type:</span>
                        <div className="detail-value">
                          <span>{task.taskType}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Color Code:</span>
                        <span className="detail-value">{task.colorCode}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Visibility:</span>
                        <span className="detail-value">{task.visibility}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="detail-card">
                    <div className="detail-header">
                      <Calendar size={16} className="detail-icon" />
                      <h4>Timeline</h4>
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-label">Start Date:</span>
                        <span className="detail-value">{task.startDate}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Due Date:</span>
                        <span className="detail-value">{task.dueDate}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Time Estimate:</span>
                        <span className="detail-value">{task.timeEstimate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Creation Info */}
                  <div className="detail-card">
                    <div className="detail-header">
                      <User size={16} className="detail-icon" />
                      <h4>Creation Info</h4>
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-label">Created By:</span>
                        <span className="detail-value">{task.createdBy}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Created:</span>
                        <span className="detail-value">{task.createdAt}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Last Updated:</span>
                        <span className="detail-value">{task.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="assignment-grid">
                  {/* Assignment & Status */}
                  <div className="detail-card">
                    <div className="detail-header">
                      <Users size={16} className="detail-icon" />
                      <h4>Assignment & Status</h4>
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-label">Assignee:</span>
                        <span className="detail-value">{task.assignee}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Current Status:</span>
                        <span className={`detail-value status-badge ${task.status.toLowerCase()}`}>{task.status}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Priority:</span>
                        <span className={`detail-value priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      </div>
                    </div>
                  </div>

                  {/* Collaborators & Tags */}
                  <div className="detail-card">
                    <div className="detail-header">
                      <Tag size={16} className="detail-icon" />
                      <h4>Collaborators & Tags</h4>
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-label">Collaborators:</span>
                        <div className="collaborators-list">
                          {task.collaborators && task.collaborators.length > 0 ? (
                            task.collaborators.map((collaborator, index) => (
                              <span key={index} className="collaborator-name">{collaborator}</span>
                            ))
                          ) : (
                            <span className="detail-value">No collaborators</span>
                          )}
                        </div>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Tags:</span>
                        <div className="tags-list">
                          {task.tags && task.tags.length > 0 ? (
                            task.tags.map((tag, index) => (
                              <span key={index} className="tag">#{tag}</span>
                            ))
                          ) : (
                            <span className="detail-value">No tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Relationships & Hierarchy */}
                  <div className="detail-card">
                    <div className="detail-header">
                      <Link size={16} className="detail-icon" />
                      <h4>Relationships & Hierarchy</h4>
                    </div>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span className="detail-label">Parent Task:</span>
                        <span className="detail-value">{task.parentTaskId ? `Task #${task.parentTaskId}` : 'None'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Sub-tasks Count:</span>
                        <span className="detail-value">{task.subtasks ? task.subtasks.length : 0}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Linked Items:</span>
                        <span className="detail-value">{task.linkedItems ? task.linkedItems.length : 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attached Forms */}
                <div className="attached-forms-section">
                  <div className="forms-header">
                    <ClipboardList size={16} className="forms-icon" />
                    <h4>Attached Forms (1)</h4>
                  </div>
                  <div className="form-item">
                    <div className="form-details">
                      <h5>Migration Checklist</h5>
                      <span className="form-type">checklist</span>
                    </div>
                    <span className="form-status in-progress">in progress</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "subtasks" && (
          <SubtasksPanel
            subtasks={task.subtasks}
            parentTask={task}
            currentUser={currentUser}
          />
        )}

        {activeTab === "comments" && currentUser && (
          <TaskComments
            taskId={taskId}
            task={task}
            comments={comments}
            onAddComment={handleAddComment}
            onReplyToComment={handleReplyToComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            currentUser={currentUser}
            users={users}
            permissions={getUserPermissions(currentUser, task)}
          />
        )}

        {activeTab === "activity" && (
          <div className="activity-view">
            <div className="activity-header">
              <h3>Activity Feed</h3>
              <p>Track all task activities and changes</p>
              <div className="activity-controls">
                <select 
                  className="activity-filter"
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                >
                  <option value="all">All Activities</option>
                  <option value="task">Task Changes</option>
                  <option value="subtask">Subtask Changes</option>
                  <option value="comment">Comments</option>
                  <option value="approval">Approvals</option>
                  <option value="file">File Operations</option>
                  <option value="user">User Actions</option>
                </select>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={fetchActivities}
                  disabled={activitiesLoading}
                >
                  {activitiesLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Refresh'}
                </button>
              </div>
            </div>

            <div className="activity-list">
              {activitiesLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading activities...</span>
                </div>
              )}

              {activitiesError && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600">{activitiesError}</p>
                    <button 
                      className="btn btn-primary btn-sm mt-2"
                      onClick={fetchActivities}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {!activitiesLoading && !activitiesError && activities.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No activities yet</p>
                    <p className="text-sm text-gray-500">Activity will appear here as actions are performed on this task</p>
                  </div>
                </div>
              )}

              {!activitiesLoading && !activitiesError && activities.length > 0 && (
                <>
                  {/* Group activities by date */}
                  {(() => {
                    const filteredActivities = activityFilter === 'all' 
                      ? activities 
                      : activities.filter(activity => activity.category === activityFilter);

                    const groupedActivities = filteredActivities.reduce((groups, activity) => {
                      const date = new Date(activity.timestamp).toDateString();
                      if (!groups[date]) {
                        groups[date] = [];
                      }
                      groups[date].push(activity);
                      return groups;
                    }, {});

                    return Object.entries(groupedActivities)
                      .sort(([a], [b]) => new Date(b) - new Date(a))
                      .map(([date, dayActivities]) => (
                        <div key={date}>
                          <div className="activity-date">
                            {new Date(date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }).toUpperCase()}
                          </div>
                          
                          {dayActivities
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                            .map((activity) => (
                              <div key={activity.id} className="activity-item">
                                <div className={`activity-avatar ${activity.category}`}>
                                  {activity.icon}
                                </div>
                                <div className="activity-content">
                                  <strong>{activity.description}</strong>
                                  {activity.user && (
                                    <div className="activity-user">
                                      by {activity.user.name || activity.user.email}
                                    </div>
                                  )}
                                  <div className="activity-time">
                                    {new Date(activity.timestamp).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })} ⏰
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ));
                  })()}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <TaskAttachments taskId={taskId} />
        )}

        {activeTab === "linked" && (
          <div className="linked-view">
            <div className="linked-header">
              <div className="linked-title">
                <Link className="linked-icon" size={24} />
                <div>
                  <h3>Linked Items (3)</h3>
                  <p>Connected tasks, documents, and resources</p>
                </div>
              </div>
              <div className="linked-controls">
                <select className="type-filter">
                  <option>All Types</option>
                  <option>Tasks</option>
                  <option>Documents</option>
                  <option>Forms</option>
                </select>
                <button
                  className="btn btn-primary flex align-middle"
                  onClick={() => setShowLinkModal(true)}
                >
                  <Plus size={16} className='mx-2 ' />
                  <h2>
                    Link Item
                  </h2>
                </button>
              </div>
            </div>

            <div className="linked-items">
              <div className="linked-item">
                <div className="item-icon">
                  <CheckSquare size={24} />
                </div>
                <div className="item-details">
                  <strong>Update Documentation</strong>
                  <div className="item-meta">
                    <span className="item-type">task</span>
                    <span className="item-status pending">pending</span>
                  </div>
                </div>
                <div className="item-type-label">Type: task</div>
                <div className="connection-status flex ">
                  <Link size={20} /> Connected
                </div>
              </div>

              <div className="linked-item">
                <div className="item-icon">
                  <FileText size={24} />
                </div>
                <div className="item-details">
                  <strong>Migration Plan</strong>
                  <div className="item-meta">
                    <span className="item-type">document</span>
                    <span className="item-status completed">completed</span>
                  </div>
                </div>
                <div className="item-type-label">Type: document</div>
                <div className="connection-status flex">
                  <Link size={20} /> Connected
                </div>
              </div>

              <div className="linked-item">
                <div className="item-icon">
                  <ClipboardList size={24} />
                </div>
                <div className="item-details">
                  <strong>Migration Checklist</strong>
                  <div className="item-meta">
                    <span className="item-type">form</span>
                    <span className="item-status in-progress">in-progress</span>
                  </div>
                </div>
                <div className="item-type-label">Type: form</div>
                <div className="connection-status flex">
                  <Link size={20} /> Connected
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SubtaskForm
        isOpen={showCreateSubtaskDrawer}
        onClose={() => setShowCreateSubtaskDrawer(false)}
        onSubmit={handleCreateSubtask}
        parentTask={task}
        mode="create"
      />

      <DeleteTaskModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteTask}
        task={task}
      />

      <ReassignTaskModal
        isOpen={showReassignModal}
        onClose={() => setShowReassignModal(false)}
        onConfirm={handleReassignTask}
        task={task}
      />

      <SnoozeTaskModal
        isOpen={showSnoozeModal}
        onClose={() => setShowSnoozeModal(false)}
        onConfirm={handleSnoozeTask}
        task={task}
      />

      <MarkRiskModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        onConfirm={handleMarkRisk}
        task={task}
      />

      <MarkDoneModal
        isOpen={showDoneModal}
        onClose={() => setShowDoneModal(false)}
        onConfirm={() => {
          setTask({ ...task, status: "DONE" });
          console.log('Task marked as done');
        }}
        task={task}
      />

      {/* Link Item Modal */}
      {showLinkModal && (
        <div className="modal-overlay">
          <div className="modal-container max-w-2xl">
            <div className="modal-header" style={{ background: '#3b82f6' }}>
              <div className="modal-title-section">
                <div className="modal-icon">
                  <Link size={20} />
                </div>
                <div>
                  <h3>Link New Item</h3>
                  <p>Connect tasks, documents, and resources</p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowLinkModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CheckSquare size={14} className="inline mr-1" />
                    Item Type
                  </label>
                  <select className="form-select w-full">
                    <option value="task">Task</option>
                    <option value="document">Document</option>
                    <option value="form">Form</option>
                    <option value="external">External Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText size={14} className="inline mr-1" />
                    Search & Select
                  </label>
                  <input
                    type="text"
                    placeholder="Search for items to link..."
                    className="form-input w-full"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowLinkModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      console.log('Link item clicked');
                      setShowLinkModal(false);
                    }}
                  >
                    Link Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}