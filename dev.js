#!/usr/bin/env node

// Development startup for TaskSetu JavaScript project
import { spawn } from 'child_process';

console.log('Starting TaskSetu development server...');

const serverProcess = spawn('node', ['server/index.js'], {
  env: {
    ...process.env,
    NODE_ENV: 'development'
  },
  stdio: 'inherit'
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down TaskSetu server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  serverProcess.kill('SIGTERM');
});