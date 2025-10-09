import { QuickTask } from '../modals/quickTaskModal.js';
import { User } from '../modals/userModal.js';
import { Task } from '../models.js';
import mongoose from 'mongoose';

/**
 * Quick Task Controller
 * Handles all Quick Task related operations
 * Quick Tasks are personal, lightweight tasks for individual users
 */

// @desc    Create a quick task
// @route   POST /api/quick-tasks
// @access  Private
const createQuickTask = async (req, res) => {
  try {
    console.log('🚀 CREATE QUICK TASK - START');
    console.log('📋 req.user:', JSON.stringify(req.user, null, 2));
    console.log('📋 req.body:', JSON.stringify(req.body, null, 2));
    console.log('📋 req.headers.authorization:', req.headers.authorization?.substring(0, 30) + '...');
    
    const userId = req.user?.id || req.user?._id;
    console.log('👤 Extracted userId:', userId);
    
    const { title, priority, dueDate, notes, tags, reminder } = req.body;

    // Validation
    if (!userId) {
      console.error('❌ VALIDATION ERROR - No userId found');
      console.error('❌ req.user object:', JSON.stringify(req.user, null, 2));
      console.error('❌ typeof req.user:', typeof req.user);
      console.error('❌ req.user?.id:', req.user?.id);
      console.error('❌ req.user?._id:', req.user?._id);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: ['User is required']
      });
    }
    
    console.log('✅ User validation passed, userId:', userId);

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: ['Title is required']
      });
    }

    // Create quick task
    const quickTaskData = {
      title: title.trim(),
      user: userId,
      priority: priority || 'medium',
      description: notes || '',
      tags: tags || []
    };
    
    console.log('📝 Quick Task Data to create:', JSON.stringify(quickTaskData, null, 2));

    // Add optional fields
    if (dueDate) {
      quickTaskData.dueDate = new Date(dueDate);
    }

    if (reminder) {
      quickTaskData.reminder = new Date(reminder);
    }

    console.log('💾 Creating QuickTask with data...');
    const newQuickTask = new QuickTask(quickTaskData);
    console.log('💾 QuickTask instance created, saving...');
    const savedTask = await newQuickTask.save();
    console.log('✅ QuickTask saved successfully:', savedTask._id);

    // Populate user details for response
    await savedTask.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Quick task created successfully',
      quickTask: savedTask
    });

  } catch (error) {
    console.error('❌ ERROR in createQuickTask:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating quick task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get all quick tasks for the authenticated user
// @route   GET /api/quick-tasks
// @access  Private
const getQuickTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      status = 'all', 
      priority = 'all', 
      dueDate, 
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      page = 1,
      search
    } = req.query;

    // Build query
    let query = { user: userId };
    
    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      query.dueDate = {
        $gte: date,
        $lt: nextDay
      };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [quickTasks, total] = await Promise.all([
      QuickTask.find(query)
        .populate('user', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      QuickTask.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      quickTasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error in getQuickTasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quick tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Toggle quick task status (todo/completed)
// @route   PATCH /api/quick-tasks/:id/status
// @access  Private
const toggleQuickTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quick task ID'
      });
    }

    const quickTask = await QuickTask.findOne({ 
      _id: id, 
      user: userId 
    });

    if (!quickTask) {
      return res.status(404).json({
        success: false,
        message: 'Quick task not found'
      });
    }

    // Toggle status
    quickTask.status = quickTask.status === 'completed' ? 'todo' : 'completed';
    quickTask.completedAt = quickTask.status === 'completed' ? new Date() : null;
    quickTask.updatedAt = new Date();

    await quickTask.save();
    await quickTask.populate('user', 'name email');

    res.json({
      success: true,
      message: `Quick task marked as ${quickTask.status}`,
      quickTask
    });

  } catch (error) {
    console.error('Error in toggleQuickTaskStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quick task status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete a quick task
// @route   DELETE /api/quick-tasks/:id
// @access  Private
const deleteQuickTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quick task ID'
      });
    }

    const quickTask = await QuickTask.findOneAndDelete({ 
      _id: id, 
      user: userId 
    });

    if (!quickTask) {
      return res.status(404).json({
        success: false,
        message: 'Quick task not found'
      });
    }

    res.json({
      success: true,
      message: 'Quick task deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteQuickTask:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quick task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update a quick task
// @route   PUT /api/quick-tasks/:id
// @access  Private
const updateQuickTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quick task ID'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updates.user;
    delete updates.createdAt;
    delete updates._id;

    // Validate title if being updated
    if (updates.title && updates.title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot be empty'
      });
    }

    // Process dates
    if (updates.dueDate) {
      updates.dueDate = new Date(updates.dueDate);
    }
    if (updates.reminder) {
      updates.reminder = new Date(updates.reminder);
    }

    const quickTask = await QuickTask.findOneAndUpdate(
      { _id: id, user: userId },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!quickTask) {
      return res.status(404).json({
        success: false,
        message: 'Quick task not found'
      });
    }

    res.json({
      success: true,
      message: 'Quick task updated successfully',
      quickTask
    });

  } catch (error) {
    console.error('Error in updateQuickTask:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quick task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export {
  createQuickTask,
  getQuickTasks,
  updateQuickTask,
  toggleQuickTaskStatus,
  deleteQuickTask
};