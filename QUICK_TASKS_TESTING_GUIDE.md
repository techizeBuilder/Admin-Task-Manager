# 🚀 Quick Tasks Testing Guide

## Quick Setup & Testing

### 1. Start the Server
```bash
cd D:\demo\Admin-Task-Manager\Admin-Task-Manager
npm run dev
```

### 2. Test API Endpoints

#### Using Swagger UI (Recommended)
1. Open browser: `http://localhost:5000/api-docs`
2. Find "Quick Tasks" section
3. Test all endpoints with authentication

#### Manual API Testing

**Get All Quick Tasks:**
```bash
GET http://localhost:5000/api/quick-tasks
Headers: Authorization: Bearer YOUR_JWT_TOKEN
```

**Create Quick Task:**
```bash
POST http://localhost:5000/api/quick-tasks
Headers: Authorization: Bearer YOUR_JWT_TOKEN
Body: {
  "title": "Test Quick Task",
  "priority": "high",
  "dueDate": "2024-12-25"
}
```

**Update Quick Task:**
```bash
PUT http://localhost:5000/api/quick-tasks/:id
Headers: Authorization: Bearer YOUR_JWT_TOKEN
Body: {
  "status": "done"
}
```

### 3. Frontend Testing

#### Start Client
```bash
cd D:\demo\Admin-Task-Manager\Admin-Task-Manager\client
npm run dev
```

#### Navigate to Quick Tasks
1. Login to application
2. Go to: `http://localhost:3000/quick-tasks`
3. Test CRUD operations via UI

### 4. Feature Testing Checklist

#### ✅ Core Features
- [ ] Create new quick task
- [ ] View all quick tasks
- [ ] Update task status (pending → in-progress → done)
- [ ] Update task priority (low, medium, high)
- [ ] Delete quick task
- [ ] Search tasks by title
- [ ] Filter by status
- [ ] Filter by priority

#### ✅ Advanced Features
- [ ] Task statistics view
- [ ] Convert quick task to full task
- [ ] Bulk operations
- [ ] Due date management
- [ ] Task age calculation
- [ ] Overdue task detection

#### ✅ Security Features
- [ ] JWT authentication required
- [ ] User can only see own tasks
- [ ] Rate limiting on creation
- [ ] Input validation
- [ ] XSS protection

### 5. Database Verification

#### Check MongoDB Collection
```javascript
// In MongoDB shell
use TaskSetu
db.quicktasks.find().pretty()
```

#### Verify Indexes
```javascript
db.quicktasks.getIndexes()
```

### 6. Common Issues & Solutions

#### Issue: Import/Export Errors
**Solution:** All files use ES6 modules now
- ✅ `import/export` syntax
- ✅ `.js` extensions in imports
- ✅ Default exports properly handled

#### Issue: Authentication Errors
**Solution:** Use existing auth middleware
- ✅ Import from `../auth.js`
- ✅ JWT token validation
- ✅ User context available

#### Issue: Database Connection
**Solution:** Uses existing MongoDB connection
- ✅ Same connection string
- ✅ Model properly registered
- ✅ Indexes created automatically

### 7. Performance Monitoring

#### Check Query Performance
```javascript
// Enable MongoDB profiling
db.setProfilingLevel(2)
db.system.profile.find().limit(5).sort({ts:-1}).pretty()
```

#### Monitor API Response Times
- Use browser dev tools
- Check server logs
- Monitor rate limiting

### 8. Production Readiness

#### Security Checklist
- ✅ Authentication middleware
- ✅ Input validation
- ✅ Rate limiting
- ✅ Error handling
- ✅ CORS configuration

#### Performance Checklist
- ✅ Database indexing
- ✅ Pagination support
- ✅ Query optimization
- ✅ Response caching headers

#### Documentation Checklist
- ✅ Swagger API documentation
- ✅ Code comments
- ✅ Implementation guide
- ✅ Error handling guide

## 🎉 Testing Complete!

If all tests pass, your Quick Tasks module is ready for production use!

### Next Steps:
1. Deploy to staging environment
2. Run integration tests
3. Performance testing
4. User acceptance testing
5. Production deployment

### Support:
- Check logs: `server/logs/`
- API docs: `http://localhost:5000/api-docs`
- MongoDB: `mongodb://localhost:27017/TaskSetu`