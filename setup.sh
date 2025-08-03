#!/bin/bash

# Focus Coach - Virtual Environment Setup Script
# This script sets up a virtual environment for development

set -e

echo "🎯 Focus Coach - Virtual Environment Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_status "Detected macOS"
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        print_warning "Homebrew not found. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        print_success "Homebrew is installed"
    fi
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        print_status "Installing Node.js..."
        brew install node
    else
        print_success "Node.js is already installed: $(node --version)"
    fi
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    print_status "Detected Linux"
    
    # Install Node.js on Linux
    if ! command -v node &> /dev/null; then
        print_status "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        print_success "Node.js is already installed: $(node --version)"
    fi
    
else
    print_error "Unsupported operating system: $OSTYPE"
    print_error "Please install Node.js manually from https://nodejs.org/"
    exit 1
fi

# Verify Node.js and npm
print_status "Verifying Node.js installation..."
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    print_success "Node.js: $(node --version)"
    print_success "npm: $(npm --version)"
else
    print_error "Node.js or npm not found after installation"
    exit 1
fi

# Install dependencies
print_status "Installing project dependencies..."
if npm install; then
    print_success "Dependencies installed successfully!"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# Focus Coach Environment Variables
# Optional: ElevenLabs API Key for premium voice
# VITE_ELEVENLABS_API_KEY=your_api_key_here

# Development settings
NODE_ENV=development
VITE_APP_TITLE=Focus Coach
EOF
    print_success ".env file created"
fi

# Make setup script executable
chmod +x setup.sh

print_success "Setup complete!"
echo ""
echo "🎯 Available commands:"
echo "   npm run dev     - Start development server"
echo "   npm run build   - Build for production"
echo "   npm run preview - Preview production build"
echo "   npm run lint    - Run linter"
echo ""
echo "🌐 Open http://localhost:5173 to view the app"
echo ""
echo "📱 PWA Installation:"
echo "   - Desktop: Click install icon in browser address bar"
echo "   - Mobile: Add to home screen from browser menu"
echo ""
echo "⌨️  Keyboard Shortcuts:"
echo "   Space - Start/Stop session"
echo "   Escape - Pause/Resume"
echo "   Ctrl/Cmd + , - Settings"
echo "   M - Mute/Unmute voice" 