#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const projectDir = process.cwd();

console.log('📦 Installing dependencies with pnpm...');

// First install dependencies
const install = spawn('pnpm', ['install'], {
  cwd: projectDir,
  stdio: 'inherit',
  shell: true
});

install.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Dependencies installed\n');
    console.log('🚀 Starting Expo Web server...');
    
    // Then start the web server
    const start = spawn('pnpm', ['web'], {
      cwd: projectDir,
      stdio: 'inherit',
      shell: true
    });

    start.on('error', (err) => {
      console.error('❌ Failed to start:', err);
      process.exit(1);
    });
  } else {
    console.error('❌ Installation failed');
    process.exit(1);
  }
});

install.on('error', (err) => {
  console.error('❌ Installation error:', err);
  process.exit(1);
});
