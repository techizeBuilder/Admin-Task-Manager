// Test PUT API with real task ID
async function testPutAPI() {
  try {
    console.log('🚀 Testing PUT API Fix...\n');
    
    // Login first
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
    console.log('✅ Login successful');
    
    // Create a quick task first
    console.log('\n1. Creating Quick Task...');
    const createResponse = await fetch('http://localhost:5000/api/quick-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Task for Update',
        priority: 'medium'
      })
    });
    
    const createData = await createResponse.json();
    console.log('Create response:', createData);
    
    if (!createData.success) {
      throw new Error('Failed to create task');
    }
    
    const taskId = createData.quickTask._id;
    console.log('✅ Task created with ID:', taskId);
    
    // Now test PUT
    console.log('\n2. Testing PUT /api/quick-tasks/' + taskId + '...');
    const updateResponse = await fetch(`http://localhost:5000/api/quick-tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Updated Task Title'
      })
    });
    
    console.log('PUT response status:', updateResponse.status);
    const updateData = await updateResponse.json();
    console.log('PUT response:', JSON.stringify(updateData, null, 2));
    
    if (updateData.success) {
      console.log('✅ PUT API working successfully!');
    } else {
      console.log('❌ PUT API failed:', updateData.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPutAPI();