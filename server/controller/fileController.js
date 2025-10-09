import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import { storage } from '../mongodb-storage.js';
import Task from '../modals/taskModal.js';
import { User } from '../modals/userModal.js';

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.docx', '.xlsx', '.pptx', '.zip'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: JPG, PNG, PDF, DOCX, XLSX, PPTX, ZIP'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: fileFilter
});

// Permission checking function
const checkFilePermission = async (userId, userRole, taskId, action) => {
  // Get task details
  const task = await Task.findById(taskId);
  if (!task) {
    throw new Error('Task not found');
  }

  // Handle both single role string and role array
  const roles = Array.isArray(userRole) ? userRole : [userRole];
  
  // Super Admin and Company Admin have full access
  if (roles.includes('Super Admin') || roles.includes('Company Admin') || roles.includes('super_admin') || roles.includes('org_admin')) {
    return true;
  }

  // Manager has full access to tasks in their company
  if (roles.includes('Manager') || roles.includes('manager')) {
    const user = await User.findById(userId);
    if (user && user.companyId && user.companyId.toString() === task.companyId.toString()) {
      return true;
    }
  }

  // Employee can view files and add files to assigned tasks
  if (roles.includes('Employee') || roles.includes('employee')) {
    if (action === 'view') return true;
    if (action === 'upload' && (
      task.assignee?.toString() === userId ||
      task.assignees?.some(assignee => assignee.toString() === userId)
    )) {
      return true;
    }
  }

  // Viewer can only view files
  if ((roles.includes('Viewer') || roles.includes('viewer')) && action === 'view') {
    return true;
  }

  return false;
};

// Get files for a task
const getTaskFiles = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check permission
    const hasPermission = await checkFilePermission(userId, userRole, taskId, 'view');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Get files (non-deleted)
    const files = task.attachments || [];
    const activeFiles = files.filter(file => !file.deleted);

    // Populate uploadedBy user details
    for (let file of activeFiles) {
      if (file.uploadedBy) {
        const user = await User.findById(file.uploadedBy).select('name email');
        file.uploadedBy = user;
      }
    }

    res.json({
      success: true,
      data: activeFiles
    });

  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files'
    });
  }
};

// Upload file to task
const uploadFile = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check permission
    const hasPermission = await checkFilePermission(userId, userRole, taskId, 'upload');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const fileData = {
      _id: new ObjectId(),
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: new ObjectId(userId),
      uploadedAt: new Date(),
      version: 1,
      deleted: false
    };

    // Add file to task attachments
    await Task.findByIdAndUpdate(
      taskId,
      { 
        $push: { attachments: fileData },
        $set: { updatedAt: new Date() }
      }
    );

    // Add activity log (using storage helper if available)
    try {
      // Try to use activity helper if it exists
      if (storage && storage.addActivity) {
        await storage.addActivity({
          taskId: taskId,
          userId: userId,
          action: 'file_uploaded',
          description: `File "${req.file.originalname}" uploaded`,
          metadata: {
            fileName: req.file.originalname,
            fileSize: req.file.size
          }
        });
      }
    } catch (activityError) {
      console.warn('Could not log activity:', activityError);
    }

    // Get user details for response
    const user = await User.findById(userId).select('name email');
    fileData.uploadedBy = user;

    res.json({
      success: true,
      data: fileData,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload file'
    });
  }
};

// Delete file from task
const deleteFile = async (req, res) => {
  try {
    const { taskId, fileId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check permission
    const hasPermission = await checkFilePermission(userId, userRole, taskId, 'delete');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get task and file
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const file = task.attachments?.find(f => f._id.toString() === fileId && !f.deleted);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Soft delete the file
    await Task.updateOne(
      { 
        _id: taskId,
        'attachments._id': fileId
      },
      { 
        $set: { 
          'attachments.$.deleted': true,
          'attachments.$.deletedAt': new Date(),
          'attachments.$.deletedBy': userId,
          updatedAt: new Date()
        }
      }
    );

    // Move to deleted attachments for audit
    const deletedFile = {
      ...file,
      deleted: true,
      deletedAt: new Date(),
      deletedBy: userId
    };

    await Task.findByIdAndUpdate(
      taskId,
      { $push: { deletedAttachments: deletedFile } }
    );

    // Add activity log
    try {
      if (storage && storage.addActivity) {
        await storage.addActivity({
          taskId: taskId,
          userId: userId,
          action: 'file_deleted',
          description: `File "${file.originalName}" deleted`,
          metadata: {
            fileName: file.originalName,
            fileId: fileId
          }
        });
      }
    } catch (activityError) {
      console.warn('Could not log activity:', activityError);
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
};

// Get links for a task
const getTaskLinks = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check permission
    const hasPermission = await checkFilePermission(userId, userRole, taskId, 'view');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const task = await Task.findById(taskId);
    console.log('📋 Found task with ID:', taskId);
    console.log('📋 Task exists:', !!task);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Get links (non-deleted)
    const links = task.links || [];
    console.log('📋 All links in task:', links.length);
    const activeLinks = links.filter(link => !link.deleted);
    console.log('📋 Active links (non-deleted):', activeLinks.length);
    console.log('📋 Active links data:', activeLinks);

    // Populate addedBy user details
    for (let link of activeLinks) {
      if (link.addedBy) {
        const user = await User.findById(link.addedBy).select('name email');
        link.addedBy = user;
      }
    }

    res.json({
      success: true,
      data: activeLinks
    });

  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch links'
    });
  }
};

// Add link to task
const addLink = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { url, title, description } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate required fields
    if (!url || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
    }

    // Check permission
    const hasPermission = await checkFilePermission(userId, userRole, taskId, 'upload');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const linkData = {
      _id: new ObjectId(),
      url: url.trim(),
      title: title?.trim() || '',
      description: description?.trim() || '',
      addedBy: userId,
      createdAt: new Date(),
      deleted: false
    };

    // Add link to task
    console.log('📝 Adding link to task:', taskId, linkData);
    
    // Use a more explicit approach to ensure the update persists
    if (!task.links) {
      task.links = [];
    }
    task.links.push(linkData);
    task.updatedAt = new Date();
    
    const savedTask = await task.save();
    console.log('📝 Saved task links count:', savedTask?.links?.length || 0);
    console.log('📝 Last link added:', savedTask?.links?.[savedTask?.links?.length - 1]);
    
    // Wait a bit and verify with a fresh query including explicit field selection
    await new Promise(resolve => setTimeout(resolve, 100));
    const verifyTask = await Task.findById(taskId).select('links');
    console.log('📝 Verification - task links count:', verifyTask?.links?.length || 0);
    console.log('📝 Verification - all links:', JSON.stringify(verifyTask?.links || [], null, 2));

    // Add activity log
    try {
      if (storage && storage.addActivity) {
        await storage.addActivity({
          taskId: taskId,
          userId: userId,
          action: 'link_added',
          description: `Link "${linkData.title || linkData.url}" added`,
          metadata: {
            linkTitle: linkData.title,
            linkUrl: linkData.url
          }
        });
      }
    } catch (activityError) {
      console.warn('Could not log activity:', activityError);
    }

    // Get user details for response
    const user = await User.findById(userId).select('name email');
    linkData.addedBy = user;

    res.json({
      success: true,
      data: linkData,
      message: 'Link added successfully'
    });

  } catch (error) {
    console.error('Error adding link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add link'
    });
  }
};

// Delete link from task
const deleteLink = async (req, res) => {
  try {
    const { taskId, linkId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check permission
    const hasPermission = await checkFilePermission(userId, userRole, taskId, 'delete');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get task and link
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const link = task.links?.find(l => l._id.toString() === linkId && !l.deleted);
    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    // Soft delete the link
    await Task.updateOne(
      { 
        _id: taskId,
        'links._id': linkId
      },
      { 
        $set: { 
          'links.$.deleted': true,
          'links.$.deletedAt': new Date(),
          'links.$.deletedBy': userId,
          updatedAt: new Date()
        }
      }
    );

    // Add activity log
    try {
      if (storage && storage.addActivity) {
        await storage.addActivity({
          taskId: taskId,
          userId: userId,
          action: 'link_deleted',
          description: `Link "${link.title || link.url}" deleted`,
          metadata: {
            linkTitle: link.title,
            linkUrl: link.url,
            linkId: linkId
          }
        });
      }
    } catch (activityError) {
      console.warn('Could not log activity:', activityError);
    }

    res.json({
      success: true,
      message: 'Link deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete link'
    });
  }
};

// Download file from task
const downloadFile = async (req, res) => {
  try {
    const { taskId, fileId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check permission
    const hasPermission = await checkFilePermission(userId, userRole, taskId, 'view');
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get task and file
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const file = task.attachments?.find(f => f._id.toString() === fileId && !f.deleted);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Check if file exists on disk
    const filePath = path.resolve(file.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
    res.setHeader('Content-Length', file.size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });

  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file'
    });
  }
};

export {
  upload,
  getTaskFiles,
  uploadFile,
  downloadFile,
  deleteFile,
  getTaskLinks,
  addLink,
  deleteLink
};