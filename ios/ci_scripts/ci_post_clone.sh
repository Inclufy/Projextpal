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

# Run expo prebuild (without --clean to preserve ios/ config)
echo "=== Running Expo prebuild ==="
npx expo prebuild --platform ios --no-install

# Install CocoaPods
echo "=== Installing CocoaPods ==="
cd ios
pod install

# Workspace-path bridge: the App Store Connect Xcode Cloud workflow has its
# primary workspace path set to "ProjeXtPal.xcworkspace" (repo root), but the
# Expo project nests it at ios/ProjeXtPal.xcworkspace. Without this symlink
# xcodebuild fails with "Workspace ProjeXtPal.xcworkspace does not exist".
# `ln -sfn` is idempotent so re-runs are safe.
cd "$CI_PRIMARY_REPOSITORY_PATH"
ln -sfn ios/ProjeXtPal.xcworkspace ProjeXtPal.xcworkspace
echo "=== Workspace symlink: $(readlink ProjeXtPal.xcworkspace) ==="

echo "=== ci_post_clone.sh complete ==="
