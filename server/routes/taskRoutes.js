import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  uploadFile,
} from "../controller/taskController";
import uploadMiddleware from "../middleware/uploadMiddleware";

const router = express.Router();

router.post("/create-task", uploadMiddleware, createTask);
router.get("/get-all-tasks", getTasks);
router.put("/update-task/:id", updateTask);
router.delete("/delete-task/:id", deleteTask);

router.post("/upload", uploadMiddleware, uploadFile);

export default router;
