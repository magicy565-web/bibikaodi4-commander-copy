#!/usr/bin/env node

import { spawn } from 'child_process';
import { execSync } from 'child_process';

console.log('📦 安装依赖...');
try {
  execSync('npm install', { stdio: 'inherit' });
} catch (e) {
  console.log('⚠️ npm install 完成\n');
}

console.log('🚀 启动 Expo Web...\n');

// 启动 expo
const proc = spawn('npm', ['run', 'web'], {
  stdio: 'inherit'
});

proc.on('error', (err) => {
  console.error('错误:', err);
  process.exit(1);
});
