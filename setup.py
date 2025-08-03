#!/usr/bin/env python3
"""
Focus Coach - Virtual Environment Setup
This script sets up a virtual environment with Node.js for development
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(cmd, check=True):
    """Run a command and return the result"""
    try:
        result = subprocess.run(cmd, shell=True, check=check, capture_output=True, text=True)
        return result
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {cmd}")
        print(f"Error: {e}")
        return None

def install_nodejs():
    """Install Node.js using the appropriate method for the platform"""
    system = platform.system().lower()
    
    if system == "darwin":  # macOS
        print("📦 Installing Node.js on macOS...")
        
        # Check if Homebrew is installed
        if run_command("which brew", check=False):
            print("🍺 Using Homebrew to install Node.js...")
            run_command("brew install node")
        else:
            print("❌ Homebrew not found. Please install Homebrew first:")
            print("   /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"")
            return False
            
    elif system == "linux":
        print("📦 Installing Node.js on Linux...")
        run_command("curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -")
        run_command("sudo apt-get install -y nodejs")
        
    elif system == "windows":
        print("📦 Please install Node.js manually on Windows:")
        print("   Download from: https://nodejs.org/")
        return False
        
    return True

def setup_project():
    """Setup the Focus Coach project"""
    print("🎯 Setting up Focus Coach...")
    
    # Check if Node.js is installed
    node_result = run_command("node --version", check=False)
    npm_result = run_command("npm --version", check=False)
    
    if not node_result or not npm_result:
        print("❌ Node.js or npm not found. Installing...")
        if not install_nodejs():
            return False
    
    print("✅ Node.js environment ready!")
    print(f"   Node.js: {run_command('node --version').stdout.strip()}")
    print(f"   npm: {run_command('npm --version').stdout.strip()}")
    
    # Install dependencies
    print("📦 Installing dependencies...")
    if run_command("npm install"):
        print("✅ Dependencies installed successfully!")
    else:
        print("❌ Failed to install dependencies")
        return False
    
    return True

def main():
    """Main setup function"""
    print("🚀 Focus Coach - Virtual Environment Setup")
    print("=" * 50)
    
    if setup_project():
        print("\n✅ Setup complete!")
        print("\n🎯 Available commands:")
        print("   npm run dev     - Start development server")
        print("   npm run build   - Build for production")
        print("   npm run preview - Preview production build")
        print("   npm run lint    - Run linter")
        print("\n🌐 Open http://localhost:5173 to view the app")
    else:
        print("\n❌ Setup failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main() 