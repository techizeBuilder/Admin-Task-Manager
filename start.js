#!/usr/bin/env node

// Pure JavaScript startup script - no TypeScript
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Import the main server file
import('./server/index.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});