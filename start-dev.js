#!/usr/bin/env node

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const cwd = process.cwd();

console.log('🧹 清理缓存...');
try {
  // 清理 Expo 缓存
  const cacheDir = path.join(cwd, '.expo');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('✅ Expo 缓存已清理');
  }
} catch (error) {
  console.log('⚠️  缓存清理出现问题，继续...');
}

console.log('📦 安装依赖...');
try {
  spawnSync('npm', ['install', '--legacy-peer-deps'], { 
    cwd, 
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });
  console.log('✅ 依赖安装完成\n');
} catch (error) {
  console.error('安装失败:', error.message);
}

console.log('🚀 启动 Expo Web...\n');

// 使用 spawnSync 以保持进程运行
spawnSync('npx', ['expo', 'start', '--web', '--clear'], {
  cwd,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});
