import express from "express";
import * as userController from "../controller/userController.js";
import { authenticateToken, roleAuth } from "../middleware/roleAuth.js";

const router = express.Router();

// Get basic organization stats
router.get("/organization/:orgId/stats", authenticateToken,  roleAuth(["org_admin"]), userController.getOrgStats);

/**
 * @swagger
 * /api/organization/users/{userId}:
 *   delete:
 *     summary: Remove/Delete a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User removed successfully
 *       400:
 *         description: Cannot remove primary admin
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/organization/users/:userId",
  authenticateToken,
  roleAuth(["org_admin"]),
  userController.removeUser
);
/**
 * @swagger
 * /api/organization/users/update-status:
 *   put:
 *     summary: Update a user's status (active/inactive)
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put(
  "/organization/users/update-status",
  authenticateToken,
  roleAuth(["org_admin"]),
  userController.updateUserStatus
);
/**
 * @swagger
 * /api/organization/{orgId}/users:
 *   get:
 *     summary: Get all users in an organization
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/organization/:orgId/users",
  authenticateToken, // <-- authentication middleware (should set req.user)
  roleAuth(["org_admin"]),
  userController.getUsersByOrg
);
// Only org_admin can update user
/**
 * @swagger
 * /api/organization/users/{userId}:
 *   put:
 *     summary: Update a user's details
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.put(
  "/organization/users/:userId",
  authenticateToken,
  roleAuth(["org_admin"]),
  userController.updateUser
);

export default router;
