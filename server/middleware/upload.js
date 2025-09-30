import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'profile-pics');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

// File filter for image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg, .png, and .webp files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: fileFilter
});

export const uploadProfileImage = upload.single('profileImage');

// Process uploaded image (resize and optimize)
export const processProfileImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const inputPath = req.file.path;
    const outputPath = path.join(uploadsDir, `processed-${req.file.filename}`);

    // Process image with sharp
    await sharp(inputPath)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    // Delete original file
    fs.unlinkSync(inputPath);

    // Update req.file with processed file info
    req.file.path = outputPath;
    req.file.filename = `processed-${req.file.filename}`;

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    // Delete uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Error processing image' });
  }
};

// Delete old profile image
export const deleteOldProfileImage = (imagePath) => {
  if (imagePath && imagePath.includes('/uploads/profile-pics/')) {
    const fullPath = path.join(process.cwd(), imagePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (error) {
        console.error('Error deleting old profile image:', error);
      }
    }
  }
};