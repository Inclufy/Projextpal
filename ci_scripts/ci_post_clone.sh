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

# Set Supabase env vars
echo "=== Setting environment variables ==="
export EXPO_PUBLIC_SUPABASE_URL="${EXPO_PUBLIC_SUPABASE_URL:-}"
export EXPO_PUBLIC_SUPABASE_ANON_KEY="${EXPO_PUBLIC_SUPABASE_ANON_KEY:-}"

# Sentry source-map upload defense — without org/token configured,
# sentry-cli fails the build with "An organization ID or slug is required".
if [ -z "${SENTRY_ORG:-}" ] || [ -z "${SENTRY_AUTH_TOKEN:-}" ]; then
  export SENTRY_DISABLE_AUTO_UPLOAD=true
  export SENTRY_ALLOW_FAILURE=true
  echo "Sentry source-map upload disabled (no SENTRY_ORG / SENTRY_AUTH_TOKEN)"
fi

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
