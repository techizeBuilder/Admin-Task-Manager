import { storage } from "../mongodb-storage.js";
import { authenticateToken } from "../middleware/roleAuth.js";
import { requireSuperAdmin } from "../middleware/superAdminAuth.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Login customization settings storage
let loginSettings = {
  backgroundColor: "#f3f4f6",
  gradientFrom: "#e5e7eb", 
  gradientTo: "#d1d5db",
  useGradient: true,
  backgroundImage: "",
  overlayOpacity: 0.5
};

export const registerLoginCustomizationRoutes = (app) => {
  // Get current login customization settings
  app.get("/api/super-admin/login-settings", authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      res.json(loginSettings);
    } catch (error) {
      console.error("Get login settings error:", error);
      res.status(500).json({ message: "Failed to fetch login settings" });
    }
  });

  // Update login customization settings
  app.post("/api/super-admin/login-settings", authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
      const { backgroundColor, gradientFrom, gradientTo, useGradient, backgroundImage, overlayOpacity } = req.body;
      
      loginSettings = {
        backgroundColor: backgroundColor || loginSettings.backgroundColor,
        gradientFrom: gradientFrom || loginSettings.gradientFrom,
        gradientTo: gradientTo || loginSettings.gradientTo,
        useGradient: useGradient !== undefined ? useGradient : loginSettings.useGradient,
        backgroundImage: backgroundImage !== undefined ? backgroundImage : loginSettings.backgroundImage,
        overlayOpacity: overlayOpacity !== undefined ? overlayOpacity : loginSettings.overlayOpacity
      };

      res.json({ 
        message: "Login settings updated successfully", 
        settings: loginSettings 
      });
    } catch (error) {
      console.error("Update login settings error:", error);
      res.status(500).json({ message: "Failed to update login settings" });
    }
  });

  // Public endpoint to get login settings (no auth required)
  app.get("/api/public/login-settings", async (req, res) => {
    try {
      res.json(loginSettings);
    } catch (error) {
      console.error("Get public login settings error:", error);
      res.status(500).json({ message: "Failed to fetch login settings" });
    }
  });
};