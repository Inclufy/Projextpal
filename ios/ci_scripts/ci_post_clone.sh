#!/bin/sh
set -e

echo "=== Xcode Cloud ci_post_clone.sh (ProjeXtPal) ==="

# Navigate to project root
cd "$CI_PRIMARY_REPOSITORY_PATH"
echo "Working directory: $(pwd)"

# Install Node.js
echo "=== Installing Node.js ==="
brew install node
echo "Node: $(node --version) | npm: $(npm --version)"

# Install dependencies
echo "=== Installing npm dependencies ==="
npm ci

# Set env vars
echo "=== Setting environment variables ==="
export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-https://projextpal.com/api/v1}"
# Fix Xcode Cloud setting CI=TRUE (uppercase) — Expo expects lowercase boolean
export CI=1

# Run expo prebuild (clean regenerate + install pods in one step)
echo "=== Running Expo prebuild ==="
rm -rf ios
npx expo prebuild --platform ios --clean

echo "=== ci_post_clone.sh complete ==="
