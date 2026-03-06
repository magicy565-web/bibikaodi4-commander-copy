#!/usr/bin/env python3

import subprocess
import os
import sys

project_dir = os.path.dirname(os.path.abspath(__file__))

print("📦 Installing dependencies...")
try:
    subprocess.run(['npm', 'install'], cwd=project_dir, check=False)
    print("✅ Dependencies installed\n")
except Exception as e:
    print(f"⚠️  Installation warning: {e}\n")

print("🚀 Starting Expo Web server...")
try:
    subprocess.run(['npx', 'expo', 'start', '--web'], cwd=project_dir)
except KeyboardInterrupt:
    print("\n✅ Expo Web stopped")
    sys.exit(0)
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
