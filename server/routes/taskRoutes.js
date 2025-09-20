import express from "express";
import { authenticateToken } from "../middleware/roleAuth.js";
import { upload } from "../utils/upload.js";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  approveOrRejectTask,
  getTasksByType,
} from "../controller/taskController.js";

const router = express.Router();

/**
 * @swagger
 * /api/create-task:
 *   post:
 *     summary: Create a new task (regular, recurring, milestone, approval)
 *     description: |
 *       Creates a comprehensive task with support for different task types including regular tasks, recurring tasks, milestone tracking, and approval workflows.
 *       
 *       **Note**: The `createdByRole` field should be provided in the request to specify the role of the user creating the task.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *                 example: "Complete quarterly report"
 *               description:
 *                 type: string
 *                 description: Detailed task description
 *                 example: "Prepare and submit the Q4 financial report"
 *               taskType:
 *                 type: string
 *                 enum: ["regular", "recurring", "milestone", "approval"]
 *                 description: Type of task
 *                 example: "regular"
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Task due date
 *                 example: "2025-12-31T23:59:59.000Z"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Task start date
 *                 example: "2025-01-01T09:00:00.000Z"
 *               priority:
 *                 type: string
 *                 enum: ["low", "medium", "high", "urgent"]
 *                 description: Task priority level
 *                 example: "high"
 *               category:
 *                 type: string
 *                 description: Task category
 *                 example: "Finance"
 *               assignedTo:
 *                 type: string
 *                 description: User ID of the assigned person
 *                 example: "507f1f77bcf86cd799439011"
 *               createdByRole:
 *                 type: string
 *                 enum: ["super_admin", "org_admin", "manager", "individual", "employee"]
 *                 description: Role of the user creating the task
 *                 example: "manager"
 *               status:
 *                 type: string
 *                 enum: ["todo", "in-progress", "completed", "on-hold", "cancelled"]
 *                 description: Current task status
 *                 example: "todo"
 *               visibility:
 *                 type: string
 *                 enum: ["private", "public", "team"]
 *                 description: Task visibility level
 *                 example: "team"
 *               tags:
 *                 type: string
 *                 description: JSON array string of task tags
 *                 example: '["urgent", "finance", "quarterly"]'
 *               collaboratorIds:
 *                 type: string
 *                 description: JSON array string of collaborator user IDs
 *                 example: '["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]'
 *               dependsOnTaskIds:
 *                 type: string
 *                 description: JSON array string of task IDs this task depends on
 *                 example: '["507f1f77bcf86cd799439014", "507f1f77bcf86cd799439015"]'
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: File attachments for the task
 *               recurrencePattern:
 *                 type: string
 *                 description: JSON object string for recurring task pattern
 *                 example: '{"frequency": "weekly", "interval": 1, "daysOfWeek": [1, 3, 5]}'
 *               milestoneData:
 *                 type: string
 *                 description: JSON object string for milestone-specific data
 *                 example: '{"deliverables": ["Report", "Presentation"], "stakeholders": ["Manager", "Client"]}'
 *               approvalData:
 *                 type: string
 *                 description: JSON object string for approval-specific data
 *                 example: '{"approvalType": "sequential", "requiredApprovals": 2}'
 *               approverIds:
 *                 type: string
 *                 description: JSON array string of approver user IDs (for approval tasks)
 *                 example: '["507f1f77bcf86cd799439016", "507f1f77bcf86cd799439017"]'
 *               linkedTaskIds:
 *                 type: string
 *                 description: JSON array string of linked task IDs (for milestone tasks)
 *                 example: '["507f1f77bcf86cd799439018", "507f1f77bcf86cd799439019"]'
 *               referenceProcess:
 *                 type: string
 *                 description: Reference to a process or workflow template
 *                 example: "standard-reporting-process"
 *               customForm:
 *                 type: string
 *                 description: Custom form data or template reference
 *                 example: "quarterly-report-form"
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task created successfully"
 *                 task:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439020"
 *                     title:
 *                       type: string
 *                       example: "Complete quarterly report"
 *                     description:
 *                       type: string
 *                       example: "Prepare and submit the Q4 financial report"
 *                     status:
 *                       type: string
 *                       example: "todo"
 *                     priority:
 *                       type: string
 *                       example: "high"
 *                     createdBy:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439010"
 *                     createdByRole:
 *                       type: string
 *                       enum: ["super_admin", "org_admin", "manager", "individual", "employee"]
 *                       example: "manager"
 *                       description: "Role of the user who created the task"
 *                     taskType:
 *                       type: string
 *                       enum: ["regular", "recurring", "milestone", "approval"]
 *                       example: "regular"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-18T10:30:00.000Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid input data"
 *                 error:
 *                   type: string
 *                   example: "Title is required"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to create task"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.post("/create-task", authenticateToken, upload.array('attachments', 5), createTask);


/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the user's organization or created by the user
 *     description: Retrieves a paginated list of tasks with filtering capabilities. For organization users, returns tasks within their organization. For individual users, returns tasks they created.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["regular", "recurring", "milestone", "approval"]
 *         description: Filter tasks by type
 *         example: "regular"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["todo", "in-progress", "completed", "on-hold", "cancelled"]
 *         description: Filter tasks by status
 *         example: "in-progress"
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *         description: Filter tasks by assignee user ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Filter tasks by project ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: ["low", "medium", "high", "urgent"]
 *         description: Filter tasks by priority level
 *         example: "high"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of tasks per page
 *         example: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search tasks by title or description
 *         example: "quarterly report"
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439020"
 *                           title:
 *                             type: string
 *                             example: "Complete quarterly report"
 *                           description:
 *                             type: string
 *                             example: "Prepare and submit the Q4 financial report"
 *                           status:
 *                             type: string
 *                             example: "in-progress"
 *                           priority:
 *                             type: string
 *                             example: "high"
 *                           dueDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-12-31T23:59:59.000Z"
 *                           assignedTo:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439011"
 *                           createdBy:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439010"
 *                           createdByRole:
 *                             type: array
 *                             items:
 *                               type: string
 *                               enum: [super_admin, org_admin, manager, individual, employee]
 *                             example: ["manager"]
 *                             description: "Role of the user who created the task"
 *                           taskType:
 *                             type: string
 *                             enum: [regular, recurring, milestone, approval]
 *                             example: "regular"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-09-18T10:30:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalTasks:
 *                           type: integer
 *                           example: 95
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch tasks"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get("/tasks", authenticateToken, getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     description: Retrieves detailed information about a specific task including approval details if it's an approval task. Access is restricted based on organization membership or task ownership.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the task
 *         example: "507f1f77bcf86cd799439020"
 *     responses:
 *       200:
 *         description: Task details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439020"
 *                     title:
 *                       type: string
 *                       example: "Complete quarterly report"
 *                     description:
 *                       type: string
 *                       example: "Prepare and submit the Q4 financial report"
 *                     status:
 *                       type: string
 *                       example: "in-progress"
 *                     priority:
 *                       type: string
 *                       example: "high"
 *                     taskType:
 *                       type: string
 *                       example: "regular"
 *                     dueDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-12-31T23:59:59.000Z"
 *                     assignedTo:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     createdBy:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439010"
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["urgent", "finance", "quarterly"]
 *                     attachments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           url:
 *                             type: string
 *                           size:
 *                             type: number
 *                           type:
 *                             type: string
 *                     approvalDetails:
 *                       type: array
 *                       description: Present only for approval tasks
 *                       items:
 *                         type: object
 *                         properties:
 *                           approverId:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [pending, approve, reject]
 *                           comment:
 *                             type: string
 *                           approvedAt:
 *                             type: string
 *                             format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-18T10:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-18T15:45:00.000Z"
 *       403:
 *         description: Access denied - User doesn't have permission to view this task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Task not found"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch task"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get("/tasks/:id", authenticateToken, getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task by ID
 *     description: Updates an existing task with new information. Only users with appropriate permissions (task creator, assignee, or organization member) can update tasks.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the task to update
 *         example: "507f1f77bcf86cd799439020"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Updated task title
 *                 example: "Complete quarterly report (Updated)"
 *               description:
 *                 type: string
 *                 description: Updated task description
 *                 example: "Prepare and submit the Q4 financial report with additional analysis"
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, completed, on-hold, cancelled]
 *                 description: Updated task status
 *                 example: "in-progress"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: Updated task priority
 *                 example: "urgent"
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Updated due date
 *                 example: "2025-12-25T23:59:59.000Z"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Updated start date
 *                 example: "2025-01-05T09:00:00.000Z"
 *               assignedTo:
 *                 type: string
 *                 description: Updated assignee user ID
 *                 example: "507f1f77bcf86cd799439012"
 *               category:
 *                 type: string
 *                 description: Updated task category
 *                 example: "Finance - Reporting"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated task tags
 *                 example: ["urgent", "finance", "quarterly", "updated"]
 *               visibility:
 *                 type: string
 *                 enum: [private, public, team]
 *                 description: Updated task visibility
 *                 example: "public"
 *               collaborators:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated list of collaborator user IDs
 *                 example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439020"
 *                     title:
 *                       type: string
 *                       example: "Complete quarterly report (Updated)"
 *                     description:
 *                       type: string
 *                       example: "Prepare and submit the Q4 financial report with additional analysis"
 *                     status:
 *                       type: string
 *                       example: "in-progress"
 *                     priority:
 *                       type: string
 *                       example: "urgent"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-18T15:45:00.000Z"
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid input data"
 *                 error:
 *                   type: string
 *                   example: "Invalid status value"
 *       403:
 *         description: Access denied - User doesn't have permission to update this task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Task not found"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to update task"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.put("/tasks/:id", authenticateToken, updateTask);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     summary: Update task status by ID
 *     description: Updates only the status of a specific task. This is a lightweight operation compared to full task update. Users with appropriate permissions can update task status.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the task to update status
 *         example: "507f1f77bcf86cd799439020"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, completed, on-hold, cancelled]
 *                 description: New status for the task
 *                 example: "completed"
 *               completedDate:
 *                 type: string
 *                 format: date-time
 *                 description: Optional completion date (auto-set when status is 'completed')
 *                 example: "2025-09-18T16:30:00.000Z"
 *               notes:
 *                 type: string
 *                 description: Optional notes about the status change
 *                 example: "Task completed ahead of schedule"
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task status updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439020"
 *                     title:
 *                       type: string
 *                       example: "Complete quarterly report"
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     completedDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-18T16:30:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-18T16:30:00.000Z"
 *                     statusHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             example: "completed"
 *                           changedBy:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439011"
 *                           changedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-09-18T16:30:00.000Z"
 *                           notes:
 *                             type: string
 *                             example: "Task completed ahead of schedule"
 *       400:
 *         description: Invalid status value or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid status value"
 *                 error:
 *                   type: string
 *                   example: "Status must be one of: todo, in-progress, completed, on-hold, cancelled"
 *       403:
 *         description: Access denied - User doesn't have permission to update this task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Task not found"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to update task status"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.patch("/tasks/:id/status", authenticateToken, updateTaskStatus);

/**
 * @swagger
 * /api/tasks/delete/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     description: Performs a soft delete on a task by marking it as deleted. Only users with appropriate permissions (task creator, admin, or organization member) can delete tasks. This action can be undone by restoring the task.
 *     tags:
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the task to delete
 *         example: "507f1f77bcf86cd799439020"
 *     responses:
 *       200:
 *         description: Task deleted successfully (soft delete)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedTaskId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439020"
 *                     isDeleted:
 *                       type: boolean
 *                       example: true
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-18T17:00:00.000Z"
 *       403:
 *         description: Access denied - User doesn't have permission to delete this task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Access denied"
 *                 error:
 *                   type: string
 *                   example: "You don't have permission to delete this task"
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Task not found"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to delete task"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.delete("/tasks/delete/:id", authenticateToken, deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/approve:
 *   post:
 *     summary: Approve or reject an approval task
 *     description: Processes approval or rejection of a task that requires approval. Only designated approvers can perform this action. Supports both 'any' and 'all' approval modes.
 *     tags:
 *       - Tasks
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier of the approval task
 *         example: "507f1f77bcf86cd799439020"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: The approval action to take
 *                 example: "approve"
 *               comment:
 *                 type: string
 *                 description: Optional comment explaining the approval/rejection decision
 *                 example: "Approved - meets all requirements and quality standards"
 *               reviewDate:
 *                 type: string
 *                 format: date-time
 *                 description: Date when the review was conducted (auto-set if not provided)
 *                 example: "2025-09-18T18:00:00.000Z"
 *     responses:
 *       200:
 *         description: Approval action processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task approved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     taskId:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439020"
 *                     approvalStatus:
 *                       type: string
 *                       enum: [pending, approved, rejected]
 *                       example: "approved"
 *                     taskStatus:
 *                       type: string
 *                       example: "approved"
 *                     approvedBy:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     approvedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-18T18:00:00.000Z"
 *                     comment:
 *                       type: string
 *                       example: "Approved - meets all requirements and quality standards"
 *                     approvalProgress:
 *                       type: object
 *                       properties:
 *                         totalApprovers:
 *                           type: integer
 *                           example: 3
 *                         approvedCount:
 *                           type: integer
 *                           example: 2
 *                         rejectedCount:
 *                           type: integer
 *                           example: 0
 *                         pendingCount:
 *                           type: integer
 *                           example: 1
 *                         approvalMode:
 *                           type: string
 *                           enum: [any, all]
 *                           example: "all"
 *       400:
 *         description: Invalid action or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid action"
 *                 error:
 *                   type: string
 *                   example: "Action must be either 'approve' or 'reject'"
 *       403:
 *         description: Access denied - User is not authorized to approve this task
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "You are not authorized to approve this task"
 *                 error:
 *                   type: string
 *                   example: "User is not in the list of designated approvers"
 *       404:
 *         description: Approval task not found or approval record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Approval task not found"
 *                 error:
 *                   type: string
 *                   example: "Task does not exist or is not an approval task"
 *       409:
 *         description: Conflict - Approval already processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Approval already processed"
 *                 error:
 *                   type: string
 *                   example: "This approver has already provided their decision"
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to process approval"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.post("/tasks/:id/approve", authenticateToken, approveOrRejectTask);

/**
 * @swagger
 * /api/tasks/filter/{type}:
 *   get:
 *     summary: Get tasks filtered by task type
 *     description: Retrieves tasks filtered by specific task type (regular, recurring, milestone, approval) with additional filtering capabilities. Supports pagination and comprehensive search options.
 *     tags:
 *       - Tasks
 *       - Tasks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [regular, recurring, milestone, approval]
 *         description: Type of tasks to filter by
 *         example: "regular"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, completed, on-hold, cancelled]
 *         description: Filter by task status
 *         example: "in-progress"
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *         description: Filter by assignee user ID
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by task priority
 *         example: "high"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by task category (case-insensitive partial match)
 *         example: "Finance"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in task title, description, and tags
 *         example: "quarterly report"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tasks with due date on or after this date
 *         example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tasks with due date on or before this date
 *         example: "2025-12-31"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of tasks per page
 *         example: 20
 *     responses:
 *       200:
 *         description: Tasks filtered by type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Regular tasks retrieved successfully"
 *                 taskType:
 *                   type: string
 *                   example: "regular"
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439020"
 *                           title:
 *                             type: string
 *                             example: "Complete quarterly report"
 *                           description:
 *                             type: string
 *                             example: "Prepare and submit the Q4 financial report"
 *                           taskType:
 *                             type: string
 *                             example: "regular"
 *                           status:
 *                             type: string
 *                             example: "in-progress"
 *                           priority:
 *                             type: string
 *                             example: "high"
 *                           category:
 *                             type: string
 *                             example: "Finance"
 *                           dueDate:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-12-31T23:59:59.000Z"
 *                           assignedTo:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439011"
 *                           createdBy:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439010"
 *                           createdByRole:
 *                             type: array
 *                             items:
 *                               type: string
 *                               enum: [super_admin, org_admin, manager, individual, employee]
 *                             example: ["manager"]
 *                             description: "Role of the user who created the task"
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["urgent", "finance", "quarterly"]
 *                           isRecurring:
 *                             type: boolean
 *                             description: Present for recurring tasks
 *                             example: false
 *                           isMilestone:
 *                             type: boolean
 *                             description: Present for milestone tasks
 *                             example: false
 *                           isApprovalTask:
 *                             type: boolean
 *                             description: Present for approval tasks
 *                             example: false
 *                           approvalDetails:
 *                             type: array
 *                             description: Present only for approval tasks
 *                             items:
 *                               type: object
 *                               properties:
 *                                 approverId:
 *                                   type: string
 *                                 status:
 *                                   type: string
 *                                 comment:
 *                                   type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-09-18T10:30:00.000Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-09-18T15:45:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         totalTasks:
 *                           type: integer
 *                           example: 95
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                     summary:
 *                       type: object
 *                       properties:
 *                         taskType:
 *                           type: string
 *                           example: "regular"
 *                         totalCount:
 *                           type: integer
 *                           example: 95
 *                         filters:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               example: "in-progress"
 *                             assignee:
 *                               type: string
 *                               example: "507f1f77bcf86cd799439011"
 *                             priority:
 *                               type: string
 *                               example: "high"
 *                             category:
 *                               type: string
 *                               example: "Finance"
 *                             search:
 *                               type: string
 *                               example: "quarterly report"
 *                             dateRange:
 *                               type: object
 *                               properties:
 *                                 from:
 *                                   type: string
 *                                   example: "2025-01-01"
 *                                 to:
 *                                   type: string
 *                                   example: "2025-12-31"
 *       400:
 *         description: Invalid task type parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid task type. Must be one of: regular, recurring, milestone, approval"
 *                 validTypes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["regular", "recurring", "milestone", "approval"]
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized access"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch tasks by type"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get("/tasks/filter/:type", authenticateToken, getTasksByType);

export { router as taskRoutes };