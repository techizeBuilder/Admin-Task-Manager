import express from "express";
import { getDashboardStats } from "../controller/taskfeedController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardStats:
 *       type: object
 *       properties:
 *         completedToday:
 *           type: integer
 *           description: Number of tasks completed today
 *           example: 5
 *         beforeDueDate:
 *           type: integer
 *           description: Number of tasks due in future
 *           example: 20
 *         milestones:
 *           type: integer
 *           description: Number of milestone tasks
 *           example: 8
 *         collaborator:
 *           type: integer
 *           description: Number of tasks where user is collaborator
 *           example: 4
 *         pastDue:
 *           type: integer
 *           description: Number of tasks past due date
 *           example: 2
 *         approvals:
 *           type: integer
 *           description: Number of pending approval tasks
 *           example: 3
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *         error:
 *           type: string
 *           description: Detailed error information
 */

/**
 * @swagger
 * /api/dashboard-stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Retrieve comprehensive dashboard statistics including completed tasks today, before due date, milestones, collaborator tasks, past due, and pending approvals
 *     tags: [Task Feed]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
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
 *                   example: "Dashboard stats retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 *             examples:
 *               dashboard_stats:
 *                 summary: Example dashboard stats
 *                 value:
 *                   success: true
 *                   message: "Dashboard stats retrieved successfully"
 *                   data:
 *                     completedToday: 5
 *                     beforeDueDate: 20
 *                     milestones: 8
 *                     collaborator: 4
 *                     pastDue: 2
 *                     approvals: 3
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/dashboard-stats", authenticateToken, getDashboardStats);

export default router;