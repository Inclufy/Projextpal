#!/bin/sh
set -e

echo "=== Xcode Cloud ci_post_clone.sh (ProjeXtPal) ==="

# Navigate to project root
cd "$CI_PRIMARY_REPOSITORY_PATH"
echo "Working directory: $(pwd)"

# Save this script before prebuild --clean deletes ios/
cp ios/ci_scripts/ci_post_clone.sh /tmp/ci_post_clone_backup.sh

# Install Node.js
echo "=== Installing Node.js ==="
brew install node
echo "Node: $(node --version) | npm: $(npm --version)"

# Install dependencies
echo "=== Installing npm dependencies ==="
CI=1 npm ci

# Set Supabase env vars
echo "=== Setting environment variables ==="
export EXPO_PUBLIC_SUPABASE_URL="${EXPO_PUBLIC_SUPABASE_URL}"
export EXPO_PUBLIC_SUPABASE_ANON_KEY="${EXPO_PUBLIC_SUPABASE_ANON_KEY}"

# Run expo prebuild (regenerates ios/ directory)
echo "=== Running Expo prebuild ==="
npx expo prebuild --platform ios --clean --no-install

# Restore ci_scripts after prebuild wiped ios/
echo "=== Restoring ci_scripts ==="
mkdir -p ios/ci_scripts
cp /tmp/ci_post_clone_backup.sh ios/ci_scripts/ci_post_clone.sh

# Install CocoaPods
echo "=== Installing CocoaPods ==="
cd ios
pod install

echo "=== ci_post_clone.sh complete ==="
