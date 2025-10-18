import express from "express";
import { getTaskCounts } from "../controller/dashboardController.js";
import { authenticateToken, roleAuth } from "../middleware/roleAuth.js";

const router = express.Router();

router.get("/task-counts", authenticateToken,
  roleAuth(["org_admin", 'individual']), getTaskCounts);

export default router;
