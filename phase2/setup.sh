#!/bin/bash
# Setup script for Phase 2 Todo Application

set -e  # Exit on any error

echo "Setting up Phase 2 Todo Application..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists python3; then
    echo "Error: python3 is not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "Error: npm is not installed"
    exit 1
fi

if ! command_exists git; then
    echo "Error: git is not installed"
    exit 1
fi

echo "All prerequisites found."

# Setup backend
echo "Setting up backend..."
cd ../backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

echo "Backend setup complete."

# Setup frontend
echo "Setting up frontend..."
cd ../frontend

echo "Installing frontend dependencies..."
npm install

echo "Frontend setup complete."

echo "Setup complete! Please update your environment variables as described in SETUP_INSTRUCTIONS.md"
echo ""
echo "To start the application:"
echo "1. Terminal 1 - Start backend: cd ../backend && source venv/bin/activate && uvicorn src.main:app --host localhost --port 8000 --reload"
echo "2. Terminal 2 - Start frontend: cd ../frontend && npm run dev"
echo ""
echo "To run tests: cd ../frontend && npx playwright test (with both services running)"