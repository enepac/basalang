#!/bin/bash

echo "🧼 Cleaning previous install..."
rm -rf node_modules pnpm-lock.yaml

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🐳 Checking Docker..."
if docker info >/dev/null 2>&1; then
  echo "✅ Docker is running"
else
  echo "❌ Docker not running or not installed"
  exit 1
fi

echo "🧪 Running smoke test (placeholder)..."
echo "✅ Basalang dev environment ready!"
