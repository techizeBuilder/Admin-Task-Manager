#!/usr/bin/env node

// Development startup script for TaskSetu
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting TaskSetu development server...');

// Start the server
const serverProcess = spawn('node', [join(__dirname, 'server/main-index.js')], {
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

serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down TaskSetu server...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\nShutting down TaskSetu server...');
  serverProcess.kill('SIGTERM');
});