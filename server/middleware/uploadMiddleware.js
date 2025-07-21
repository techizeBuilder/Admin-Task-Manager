import multer from "multer";

const storage = multer.memoryStorage();

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
}).single("attachment"); // Ensure the field name matches the request

export default uploadMiddleware;
