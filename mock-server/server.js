const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Enable CORS for all routes
server.use(middlewares);

// Add custom middleware for API endpoints
server.use(jsonServer.bodyParser);

// Authentication middleware (mock)
server.use('/api/*', (req, res, next) => {
  // Mock authentication - always allow for development
  req.user = { id: '1', role: 'individual' }; // Default to individual user
  next();
});

// Custom routes for specific API endpoints
server.get('/api/auth/verify', (req, res) => {
  // Return mock user data based on role
  const users = router.db.get('users').value();
  const user = users.find(u => u.id === '2') || users[1]; // Default to Sarah (individual user)
  
  res.json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    department: user.department,
    position: user.position,
    isActive: user.isActive
  });
});

// Dashboard stats endpoint
server.get('/api/dashboard/stats', (req, res) => {
  const tasks = router.db.get('tasks').value();
  const now = new Date();
  
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    overdueTasks: tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now && t.status !== 'completed';
    }).length,
    upcomingDeadlines: tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      const dueDate = new Date(t.dueDate);
      const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
      return dueDate <= threeDaysFromNow && dueDate > now;
    }).length,
    tasksByPriority: {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      high: tasks.filter(t => t.priority === 'high').length,
      urgent: tasks.filter(t => t.priority === 'urgent').length
    },
    tasksByStatus: [
      { status: 'To Do', count: tasks.filter(t => t.status === 'todo').length, color: '#6B7280' },
      { status: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length, color: '#3B82F6' },
      { status: 'Review', count: tasks.filter(t => t.status === 'review').length, color: '#F59E0B' },
      { status: 'Completed', count: tasks.filter(t => t.status === 'completed').length, color: '#10B981' }
    ],
    recentActivity: tasks
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        title: t.title,
        action: 'updated',
        timestamp: t.updatedAt,
        user: 'Current User'
      }))
  };
  
  res.json(stats);
});

// Tasks endpoint with filtering
server.get('/api/tasks', (req, res) => {
  const tasks = router.db.get('tasks').value();
  const { status, priority, assigneeId, projectId, search } = req.query;
  
  let filteredTasks = [...tasks];
  
  if (status && status !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.status === status);
  }
  
  if (priority && priority !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.priority === priority);
  }
  
  if (assigneeId && assigneeId !== 'all') {
    filteredTasks = filteredTasks.filter(t => 
      t.assignedTo && t.assignedTo.includes(assigneeId)
    );
  }
  
  if (projectId && projectId !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.projectId === projectId);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTasks = filteredTasks.filter(t => 
      t.title.toLowerCase().includes(searchLower) ||
      (t.description && t.description.toLowerCase().includes(searchLower)) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  }
  
  res.json(filteredTasks);
});

// Task creation endpoint
server.post('/api/tasks', (req, res) => {
  const newTask = {
    ...req.body,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: req.body.status || 'todo',
    statusId: req.body.statusId || '1',
    type: req.body.type || 'regular'
  };
  
  const tasks = router.db.get('tasks');
  tasks.push(newTask).write();
  
  res.status(201).json(newTask);
});

// Task update endpoint
server.put('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const updates = {
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  const tasks = router.db.get('tasks');
  const task = tasks.find({ id: taskId });
  
  if (task.value()) {
    task.assign(updates).write();
    res.json(task.value());
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Task deletion endpoint
server.delete('/api/tasks/:id', (req, res) => {
  const taskId = req.params.id;
  const tasks = router.db.get('tasks');
  
  const removedTask = tasks.remove({ id: taskId }).write();
  
  if (removedTask.length > 0) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

// Comments endpoints
server.get('/api/tasks/:taskId/comments', (req, res) => {
  const taskId = req.params.taskId;
  const comments = router.db.get('comments').filter({ taskId }).value();
  res.json(comments);
});

server.post('/api/tasks/:taskId/comments', (req, res) => {
  const taskId = req.params.taskId;
  const newComment = {
    id: Date.now(),
    taskId,
    authorId: req.user.id,
    content: req.body.content,
    mentions: req.body.mentions || [],
    createdAt: new Date().toISOString()
  };
  
  const comments = router.db.get('comments');
  comments.push(newComment).write();
  
  res.status(201).json(newComment);
});

// Audit logs endpoint
server.get('/api/tasks/:taskId/audit-logs', (req, res) => {
  const taskId = req.params.taskId;
  const logs = router.db.get('auditLogs').filter({ taskId }).value();
  res.json(logs);
});

// Map /api/* routes to database collections
server.use('/api/users', router);
server.use('/api/projects', router);
server.use('/api/task-statuses', router);

// Use default router for other routes
server.use(router);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Mock API Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/`);
});