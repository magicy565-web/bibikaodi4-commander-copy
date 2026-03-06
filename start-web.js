#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 先确保依赖已安装
console.log('📦 检查并安装依赖...');
try {
  execSync('npm install', {
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('✅ 依赖安装完成\n');
} catch (error) {
  console.error('❌ 依赖安装出错，但继续尝试启动...\n');
}

// 直接启动 Expo Web
console.log('🚀 启动 Expo Web 开发服务器...\n');
const webProcess = spawn('npx', ['expo', 'start', '--web'], {
  cwd: __dirname,
  stdio: 'inherit'
});

webProcess.on('close', (code) => {
  process.exit(code);
});

webProcess.on('error', (error) => {
  console.error('❌ 启动失败:', error.message);
  process.exit(1);
});
