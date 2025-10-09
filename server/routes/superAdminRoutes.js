import express from "express";
import { superAdminController } from "../controller/superAdminController";
import { requireSuperAdmin } from "../middleware/superAdminAuth";
import { authenticateToken } from "../middleware/roleAuth";


const router = express.Router();

router.get("/test", superAdminController.test);
router.post("/create-sample-data", superAdminController.createSampleData);
router.get("/analytics", authenticateToken, requireSuperAdmin, superAdminController.analytics);
router.get("/companies", superAdminController.companies);
router.get("/users", superAdminController.users);
router.post("/create-super-admin", authenticateToken, requireSuperAdmin, superAdminController.createSuperAdmin);
router.get("/logs", authenticateToken, requireSuperAdmin, superAdminController.logs);
router.post("/assign-admin", authenticateToken, requireSuperAdmin, superAdminController.assignAdmin);
router.patch("/companies/:id/status", authenticateToken, requireSuperAdmin, superAdminController.updateCompanyStatus);

export default router;