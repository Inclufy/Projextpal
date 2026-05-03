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
CI=1 npm ci

# Set Supabase env vars
echo "=== Setting environment variables ==="
export EXPO_PUBLIC_SUPABASE_URL="${EXPO_PUBLIC_SUPABASE_URL}"
export EXPO_PUBLIC_SUPABASE_ANON_KEY="${EXPO_PUBLIC_SUPABASE_ANON_KEY}"

# Run expo prebuild — DO NOT use --clean. The ios/ folder is committed and
# contains hand-edited Podfile/entitlements/signing config. --clean would
# wipe those customisations and regenerate from app.json.
echo "=== Running Expo prebuild (preserving committed ios/) ==="
npx expo prebuild --platform ios --no-install

# Install CocoaPods
echo "=== Installing CocoaPods ==="
cd ios
pod install

# Workspace-path bridge: App Store Connect workflow points at
# "ProjeXtPal.xcworkspace" (root), but the Expo project nests it at
# ios/ProjeXtPal.xcworkspace. Symlink so xcodebuild finds it from root.
cd "$CI_PRIMARY_REPOSITORY_PATH"
ln -sfn ios/ProjeXtPal.xcworkspace ProjeXtPal.xcworkspace
echo "=== Workspace symlink: $(readlink ProjeXtPal.xcworkspace) ==="

echo "=== ci_post_clone.sh complete ==="
