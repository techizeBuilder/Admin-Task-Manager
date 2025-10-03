// Database migration script to fix comment issues
// Run this script to fix existing comments in the database

import mongoose from 'mongoose';
import { User } from './server/modals/userModal.js';
import Task from './server/modals/taskModal.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasksetu';

async function fixComments() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all tasks with comments
    const tasksWithComments = await Task.find({
      'comments.0': { $exists: true }
    });

    console.log(`Found ${tasksWithComments.length} tasks with comments`);

    let fixedCount = 0;
    let totalComments = 0;

    for (const task of tasksWithComments) {
      let taskUpdated = false;

      for (const comment of task.comments) {
        totalComments++;
        let commentUpdated = false;

        // Fix missing text content
        if (!comment.text && !comment.content) {
          comment.text = '[Comment content not available - please re-add your comment]';
          comment.content = comment.text;
          commentUpdated = true;
          console.log(`Fixed missing text for comment ${comment._id} in task ${task._id}`);
        } else if (!comment.text && comment.content) {
          comment.text = comment.content;
          commentUpdated = true;
          console.log(`Added text field from content for comment ${comment._id}`);
        } else if (comment.text && !comment.content) {
          comment.content = comment.text;
          commentUpdated = true;
          console.log(`Added content field from text for comment ${comment._id}`);
        }

        // Fix author field if it's just an ID string
        if (typeof comment.author === 'string') {
          try {
            const user = await User.findById(comment.author);
            if (user) {
              // Keep the original ID reference but add author data for immediate use
              comment.authorData = {
                _id: user._id,
                firstName: user.firstName || 'Unknown',
                lastName: user.lastName || 'User',
                email: user.email || ''
              };
              commentUpdated = true;
              console.log(`Added author data for comment ${comment._id} - ${user.firstName} ${user.lastName}`);
            } else {
              console.log(`User not found for comment ${comment._id}, author ID: ${comment.author}`);
            }
          } catch (error) {
            console.error(`Error fetching user for comment ${comment._id}:`, error.message);
          }
        }

        if (commentUpdated) {
          fixedCount++;
          taskUpdated = true;
        }
      }

      // Save the task if any comments were updated
      if (taskUpdated) {
        try {
          await task.save();
          console.log(`Saved updates for task ${task._id}`);
        } catch (error) {
          console.error(`Error saving task ${task._id}:`, error.message);
        }
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`- Total comments processed: ${totalComments}`);
    console.log(`- Comments fixed: ${fixedCount}`);
    console.log(`- Tasks updated: ${tasksWithComments.filter(t => t.comments.some(c => c.text || c.authorData)).length}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
fixComments().catch(console.error);