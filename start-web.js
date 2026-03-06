const { execSync } = require('child_process');
const path = require('path');

console.log('[v0] Starting Expo Web...');

try {
  // Install dependencies first
  console.log('[v0] Installing dependencies...');
  execSync('npm install', { 
    cwd: path.dirname(__filename),
    stdio: 'inherit'
  });
  
  // Start Expo Web
  console.log('[v0] Launching Expo Web...');
  execSync('npx expo start --web --clear', {
    cwd: path.dirname(__filename),
    stdio: 'inherit'
  });
} catch (error) {
  console.error('[v0] Error:', error.message);
  process.exit(1);
}
