#!/bin/bash

# Chain Guard Setup Script
# This script sets up the development environment

set -e

echo "🛡️  Chain Guard Setup"
echo "===================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18 or higher is required"
    echo "Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

echo ""
echo "Building packages..."
npm run build

echo ""
echo "Running tests..."
npm test

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Copy .env.example to .env and configure"
echo "  2. Run 'npm run dev' to start development"
echo "  3. Check the examples/ directory for usage examples"
echo ""
