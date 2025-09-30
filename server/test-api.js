/**
 * Test script to check API endpoints
 */

const testUser = {
  email: "suraj@all.com",
  organizationId: "68c7b212e70a5ea02a4b0abe"
};

console.log("Testing API endpoints...\n");

// Test subscription endpoint
fetch('http://localhost:8001/api/organization/subscription', {
  headers: {
    'Authorization': 'Bearer test-token' // You'll need actual token
  }
})
.then(response => response.json())
.then(data => {
  console.log("Subscription API Response:", JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error("Subscription API Error:", error);
});

// Test license plans endpoint
fetch('http://localhost:8001/api/license/plans', {
  headers: {
    'Authorization': 'Bearer test-token' // You'll need actual token
  }
})
.then(response => response.json())
.then(data => {
  console.log("\nLicense Plans API Response:", JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error("License Plans API Error:", error);
});