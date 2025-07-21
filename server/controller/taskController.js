import { TaskTitle } from "../models";
import fs from "fs";
import path from "path";
import axios from "axios"; // Import axios for API integration

export const createTask = async (req, res) => {
  try {
    let filePath = null;

    if (req.file) {
      const uploadDir = path.join(__dirname, "../../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      filePath = path.join(uploadDir, req.file.originalname);
      fs.writeFileSync(filePath, req.file.buffer);
    }

    const taskData = { ...req.body, attachment: filePath };
    const task = await TaskTitle.create(taskData);

    // API integration logic

    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await TaskTitle.findAll();
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await TaskTitle.update(req.body, { where: { id } });
    if (updated) {
      const updatedTask = await TaskTitle.findOne({ where: { id } });
      res.status(200).json(updatedTask);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TaskTitle.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

