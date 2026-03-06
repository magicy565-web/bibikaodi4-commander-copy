#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 安装依赖
console.log('Installing dependencies...');
const installProcess = spawn('pnpm', ['install'], {
  cwd: __dirname,
  stdio: 'inherit'
});

installProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('Installation failed');
    process.exit(1);
  }
  
  // 启动 Expo Web
  console.log('Starting Expo Web...');
  const webProcess = spawn('pnpm', ['run', 'web'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  webProcess.on('close', (code) => {
    process.exit(code);
  });
});
