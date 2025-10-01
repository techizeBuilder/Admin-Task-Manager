// Test script for new Task APIs
const axios = require('axios');

const baseURL = 'http://localhost:5000/api';
const taskId = '671b5df2b83cb5a8c14b9bb5'; // Replace with actual task ID

// Mock authentication token - replace with actual token
const authToken = 'your_actual_jwt_token_here';

const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
};

async function testSnoozeAPI() {
    try {
        console.log('\n🔍 Testing Snooze API...');
        const response = await axios.patch(`${baseURL}/tasks/${taskId}/snooze`, {
            snoozeUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            reason: 'Need more time to review requirements'
        }, { headers });

        console.log('✅ Snooze API Response:', response.status, response.data);
    } catch (error) {
        console.log('❌ Snooze API Error:', error.response?.status, error.response?.data || error.message);
    }
}

async function testUnsnoozeAPI() {
    try {
        console.log('\n🔍 Testing Unsnooze API...');
        const response = await axios.patch(`${baseURL}/tasks/${taskId}/unsnooze`, {}, { headers });

        console.log('✅ Unsnooze API Response:', response.status, response.data);
    } catch (error) {
        console.log('❌ Unsnooze API Error:', error.response?.status, error.response?.data || error.message);
    }
}

async function testMarkAsRiskAPI() {
    try {
        console.log('\n🔍 Testing Mark as Risk API...');
        const response = await axios.patch(`${baseURL}/tasks/${taskId}/mark-risk`, {
            riskType: 'deadline',
            reason: 'Approaching deadline with pending dependencies'
        }, { headers });

        console.log('✅ Mark as Risk API Response:', response.status, response.data);
    } catch (error) {
        console.log('❌ Mark as Risk API Error:', error.response?.status, error.response?.data || error.message);
    }
}

async function testUnmarkRiskAPI() {
    try {
        console.log('\n🔍 Testing Unmark Risk API...');
        const response = await axios.patch(`${baseURL}/tasks/${taskId}/unmark-risk`, {}, { headers });

        console.log('✅ Unmark Risk API Response:', response.status, response.data);
    } catch (error) {
        console.log('❌ Unmark Risk API Error:', error.response?.status, error.response?.data || error.message);
    }
}

async function testQuickMarkAsDoneAPI() {
    try {
        console.log('\n🔍 Testing Quick Mark as Done API...');
        const response = await axios.patch(`${baseURL}/tasks/${taskId}/quick-done`, {
            completionNotes: 'Completed quickly without review'
        }, { headers });

        console.log('✅ Quick Mark as Done API Response:', response.status, response.data);
    } catch (error) {
        console.log('❌ Quick Mark as Done API Error:', error.response?.status, error.response?.data || error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting API Tests...');
    console.log('📋 Task ID:', taskId);

    // Test all APIs
    await testSnoozeAPI();
    await testUnsnoozeAPI();
    await testMarkAsRiskAPI();
    await testUnmarkRiskAPI();
    await testQuickMarkAsDoneAPI();

    console.log('\n✨ API Tests Completed!');
}

// Note: This test requires a valid JWT token and task ID
console.log('⚠️  Update the authToken and taskId variables with actual values before running');
console.log('💡 To run: node test-new-apis.js');

// Uncomment the line below to run tests immediately
// runTests();