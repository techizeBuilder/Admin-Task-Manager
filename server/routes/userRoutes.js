import express from "express";
import * as userController from "../controller/userController.js";
import { authenticateToken, roleAuth } from "../middleware/roleAuth.js";

const router = express.Router();

// Only org_admin can access
router.get(
    '/organization/:orgId/users',
    authenticateToken, // <-- authentication middleware (should set req.user)
    roleAuth(['org_admin']),
    userController.getUsersByOrg
);

export default router;