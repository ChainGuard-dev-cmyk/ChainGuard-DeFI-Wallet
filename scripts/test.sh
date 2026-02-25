#!/bin/bash

# Chain Guard Test Runner
# Runs all tests with coverage

set -e

echo "🧪 Chain Guard Test Suite"
echo "========================="
echo ""

# Run unit tests
echo "Running unit tests..."
npm run test:unit

echo ""
echo "Running integration tests..."
npm run test:integration

echo ""
echo "Generating coverage report..."
npm run test:coverage

echo ""
echo "✅ All tests passed!"
echo ""
echo "Coverage report: ./coverage/index.html"
echo ""
