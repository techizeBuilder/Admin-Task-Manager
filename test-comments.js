// Simple test script to check comment functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const TASK_ID = '68da7e286b4192284d71d88a'; // From the logs

async function testComments() {
  try {
    console.log('Testing comment retrieval...');
    
    const response = await axios.get(`${BASE_URL}/api/tasks/${TASK_ID}/comments`, {
      headers: {
        'Authorization': `Bearer YOUR_TOKEN_HERE` // Replace with actual token
      }
    });
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data.comments) {
      const comments = response.data.data.comments;
      console.log(`\nFound ${comments.length} comments:`);
      
      comments.forEach((comment, index) => {
        console.log(`\nComment ${index + 1}:`);
        console.log(`- ID: ${comment._id}`);
        console.log(`- Text: ${comment.text || comment.content || 'NO CONTENT'}`);
        console.log(`- Author: ${comment.author?.firstName} ${comment.author?.lastName} (${comment.author?._id})`);
        console.log(`- Created: ${comment.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testComments();