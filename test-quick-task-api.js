// Using Node.js built-in fetch (Node 18+)

async function testQuickTaskAPI() {
  try {
    console.log('🚀 Testing Quick Task API...\n');
    
    // First login to get token
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      throw new Error('Login failed: ' + JSON.stringify(loginData));
    }
    
    const token = loginData.token;
    console.log('✅ Login successful, token received\n');
    
    // Now test Quick Task creation
    console.log('2. Creating Quick Task...');
    const quickTaskResponse = await fetch('http://localhost:3001/api/quick-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test Quick Task from API',
        priority: 'high',
        notes: 'This is a test quick task'
      })
    });
    
    console.log('Quick Task API response status:', quickTaskResponse.status);
    
    const quickTaskData = await quickTaskResponse.json();
    console.log('Quick Task API response:', JSON.stringify(quickTaskData, null, 2));
    
    if (quickTaskData.success) {
      console.log('✅ Quick Task created successfully!');
    } else {
      console.log('❌ Quick Task creation failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testQuickTaskAPI();