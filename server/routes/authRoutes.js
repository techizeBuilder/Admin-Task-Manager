import express from "express";


import rateLimit from "express-rate-limit";
import { authController } from "../controller/authController.js";
import { authenticateToken } from "../middleware/roleAuth.js";

const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many registrations. Please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});
router.post("/register/individual", authController.registerIndividual);
router.post("/register/organization", authController.registerOrganization);

router.post("/login", authController.login);
router.post("/register", registerLimiter, authController.register);
router.post("/check-lockout", authController.checkLockout);
router.get("/verify", authenticateToken, authController.verify);
router.post("/generate-token", authController.generateToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/validate-reset-token", authController.validateResetToken);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-token", authController.verifyToken);
router.post("/accept-invite", authController.acceptInvite);
router.get("/validate-invite", authController.validateInvite);
router.post("/validate-invite-token", authController.validateInviteToken);
router.post("/complete-invitation", authController.completeInvitation);

export default router;