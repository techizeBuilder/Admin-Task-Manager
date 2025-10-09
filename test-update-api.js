// Test Quick Task Update API
async function testUpdateAPI() {
  try {
    console.log('🚀 Testing Quick Task Update API...\n');
    
    // Test login first
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('Login failed');
    }
    
    const token = loginData.token;
    console.log('✅ Login successful\n');
    
    // Test PUT endpoint
    console.log('2. Testing PUT /api/quick-tasks/:id...');
    const updateResponse = await fetch('http://localhost:5000/api/quick-tasks/test-id', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Updated task title'
      })
    });
    
    console.log('PUT response status:', updateResponse.status);
    const updateData = await updateResponse.text();
    console.log('PUT response:', updateData);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUpdateAPI();