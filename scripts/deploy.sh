#!/bin/bash

# Chain Guard Deployment Script
# Deploys packages to production

set -e

echo "🚀 Chain Guard Deployment"
echo "========================"
echo ""

# Check if on main branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo "❌ Must be on main branch to deploy"
    echo "Current branch: $BRANCH"
    exit 1
fi

echo "✅ On main branch"
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Uncommitted changes detected"
    echo "Please commit or stash changes before deploying"
    exit 1
fi

echo "✅ No uncommitted changes"
echo ""

# Run tests
echo "Running tests..."
npm test

echo ""
echo "Building packages..."
npm run build

echo ""
echo "Publishing packages..."
npm run publish

echo ""
echo "✅ Deployment complete!"
echo ""
