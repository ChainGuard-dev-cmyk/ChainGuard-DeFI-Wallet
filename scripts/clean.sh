#!/bin/bash

# Chain Guard Clean Script
# Removes build artifacts and dependencies

set -e

echo "🧹 Chain Guard Cleanup"
echo "====================="
echo ""

echo "Removing node_modules..."
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

echo "Removing dist directories..."
find . -name "dist" -type d -prune -exec rm -rf '{}' +

echo "Removing build directories..."
find . -name "build" -type d -prune -exec rm -rf '{}' +

echo "Removing coverage reports..."
find . -name "coverage" -type d -prune -exec rm -rf '{}' +

echo "Removing .turbo cache..."
rm -rf .turbo

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Run './scripts/setup.sh' to reinstall dependencies"
echo ""
