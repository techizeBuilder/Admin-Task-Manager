import express from 'express';
const router = express.Router();

// Import controllers
import {
  createQuickTask,
  getQuickTasks,
  updateQuickTask,
  toggleQuickTaskStatus,
  deleteQuickTask
} from '../controller/quickTaskController.js';

// Import middleware
import { authenticateToken } from '../auth.js';
import {
  checkQuickTaskOwnership,
  validateQuickTaskCreation,
  rateLimitQuickTaskCreation
} from '../middleware/quickTaskMiddleware.js';

// All routes require authentication
router.use((req, res, next) => {
  console.log('🔍 Quick Task Route - Before Auth:', {
    path: req.path, 
    method: req.method,
    headers: Object.keys(req.headers),
    hasAuth: !!req.headers.authorization
  });
  next();
});

router.use(authenticateToken);

router.use((req, res, next) => {
  console.log('✅ Quick Task Route - After Auth:', {
    path: req.path,
    user: req.user ? { id: req.user.id, email: req.user.email } : 'NO USER'
  });
  next();
});

/**
 * @swagger
 * /api/quick-tasks:
 *   get:
 *     summary: Get all quick tasks for authenticated user
 *     tags: [Quick Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, todo, completed]
 *         description: Filter by task status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [all, low, medium, high, urgent]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: Successfully retrieved quick tasks
 *       401:
 *         description: Unauthorized
 */
router.get('/', getQuickTasks);

/**
 * @swagger
 * /api/quick-tasks:
 *   post:
 *     summary: Create a new quick task
 *     tags: [Quick Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               notes:
 *                 type: string
 *                 description: Task notes/description
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Due date
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Task tags
 *     responses:
 *       201:
 *         description: Quick task created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', rateLimitQuickTaskCreation, validateQuickTaskCreation, createQuickTask);

/**
 * @swagger
 * /api/quick-tasks/{id}/status:
 *   patch:
 *     summary: Toggle quick task status
 *     tags: [Quick Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quick task ID
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Quick task not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/:id/status', checkQuickTaskOwnership, toggleQuickTaskStatus);

/**
 * @swagger
 * /api/quick-tasks/{id}:
 *   put:
 *     summary: Update a quick task
 *     tags: [Quick Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quick task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 description: Task priority
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Due date
 *     responses:
 *       200:
 *         description: Quick task updated successfully
 *       404:
 *         description: Quick task not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', checkQuickTaskOwnership, updateQuickTask);

/**
 * @swagger
 * /api/quick-tasks/{id}:
 *   delete:
 *     summary: Delete a quick task
 *     tags: [Quick Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quick task ID
 *     responses:
 *       200:
 *         description: Quick task deleted successfully
 *       404:
 *         description: Quick task not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', checkQuickTaskOwnership, deleteQuickTask);

export default router;