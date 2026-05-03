#!/bin/sh
set -e

echo "=== Xcode Cloud ci_post_clone.sh (ProjeXtPal) ==="

# Navigate to project root
cd "$CI_PRIMARY_REPOSITORY_PATH"
echo "Working directory: $(pwd)"

# Install Node.js — only fall back to Homebrew if Node isn't already on PATH.
# `brew install` on an already-present formula sometimes exits non-zero on
# Xcode Cloud images and kills the script under `set -e`.
if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
  echo "=== Node already installed: $(node --version) | npm: $(npm --version) ==="
else
  echo "=== Installing Node.js via Homebrew ==="
  brew install node || { echo "brew install node failed"; exit 1; }
  echo "Node: $(node --version) | npm: $(npm --version)"
fi

# Install dependencies
echo "=== Installing npm dependencies ==="
CI=1 npm ci

# Sentry source-map upload defense — without org/token configured,
# sentry-cli fails the build with "An organization ID or slug is required".
if [ -z "${SENTRY_ORG:-}" ] || [ -z "${SENTRY_AUTH_TOKEN:-}" ]; then
  export SENTRY_DISABLE_AUTO_UPLOAD=true
  export SENTRY_ALLOW_FAILURE=true
  echo "Sentry source-map upload disabled (no SENTRY_ORG / SENTRY_AUTH_TOKEN)"
fi

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
