// Debug script to check task access issues
const taskId = "68cbe018b3788a5497075bab";

// JWT token payload (decoded)
const userFromToken = {
    "id": "68c7ccbe414d85e1a8a2b5b7",
    "email": "suraj@all.com",
    "role": ["employee", "manager", "org_admin"],
    "organizationId": "68c7b212e70a5ea02a4b0abe"
};

console.log("🔍 Debugging Task Access Issue");
console.log("================================");
console.log("Task ID:", taskId);
console.log("User ID:", userFromToken.id);
console.log("User Organization:", userFromToken.organizationId);
console.log("");

// Test CURL commands to debug
console.log("🧪 Test Commands:");
console.log("");

// 1. First get the task details to see what's in the database
console.log("1. Get task details (this is failing):");
console.log(`curl -X 'GET' \\
  'http://localhost:5000/api/tasks/${taskId}' \\
  -H 'accept: application/json' \\
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzdjY2JlNDE0ZDg1ZTFhOGEyYjViNyIsImVtYWlsIjoic3VyYWpAYWxsLmNvbSIsInJvbGUiOlsiZW1wbG95ZWUiLCJtYW5hZ2VyIiwib3JnX2FkbWluIl0sIm9yZ2FuaXphdGlvbklkIjoiNjhjN2IyMTJlNzBhNWVhMDJhNGIwYWJlIiwiaWF0IjoxNzU4MTc0NDQ5LCJleHAiOjE3NTg3NzkyNDl9.VDro4QG87bfrK0YQ5YZrRHj-CigGKL_jbXAu59aw_c4'`);
console.log("");

// 2. Get all tasks to see if user can access any tasks
console.log("2. Get all tasks (to verify token works):");
console.log(`curl -X 'GET' \\
  'http://localhost:5000/api/tasks' \\
  -H 'accept: application/json' \\
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YzdjY2JlNDE0ZDg1ZTFhOGEyYjViNyIsImVtYWlsIjoic3VyYWpAYWxsLmNvbSIsInJvbGUiOlsiZW1wbG95ZWUiLCJtYW5hZ2VyIiwib3JnX2FkbWluIl0sIm9yZ2FuaXphdGlvbklkIjoiNjhjN2IyMTJlNzBhNWVhMDJhNGIwYWJlIiwiaWF0IjoxNzU4MTc0NDQ5LCJleHAiOjE3NTg3NzkyNDl9.VDro4QG87bfrK0YQ5YZrRHj-CigGKL_jbXAu59aw_c4'`);
console.log("");

console.log("🔍 Possible Issues:");
console.log("1. Task might not exist in database");
console.log("2. Task.organization doesn't match user.organizationId");
console.log("3. Task.createdBy doesn't match user.id (for non-org tasks)");
console.log("4. Database connection issue");
console.log("5. Task might be marked as deleted");
console.log("");

console.log("📋 Access Control Logic:");
console.log("If task has organization:");
console.log("  - User must have same organizationId");
console.log("If task has NO organization:");
console.log("  - User must be the creator (task.createdBy = user.id)");
console.log("  - OR user must have no organization");