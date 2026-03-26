#!/bin/sh
set -e

echo "=== Xcode Cloud ci_post_clone.sh (ProjeXtPal) ==="

# Navigate to project root
cd "$CI_PRIMARY_REPOSITORY_PATH"
echo "Working directory: $(pwd)"

# Fix Xcode Cloud setting CI=TRUE (uppercase) — Expo expects lowercase boolean
# Must be set BEFORE npm ci and expo prebuild, which both read CI env var
export CI=1

# Set env vars
echo "=== Setting environment variables ==="
export EXPO_PUBLIC_API_URL="${EXPO_PUBLIC_API_URL:-https://projextpal.com/api/v1}"

# Install Node.js
echo "=== Installing Node.js ==="
brew install node
echo "Node: $(node --version) | npm: $(npm --version)"

# Install dependencies
echo "=== Installing npm dependencies ==="
npm ci

# Run expo prebuild (clean regenerate)
echo "=== Running Expo prebuild ==="
rm -rf ios
npx expo prebuild --platform ios --clean

# Disable Explicitly Built Modules (Xcode 26 default breaks Expo SDK 52 pods)
# Inject into the existing post_install block (avoid adding a duplicate post_install)
echo "=== Disabling Explicitly Built Modules for Xcode 26 compatibility ==="
ruby -i -e '
  content = ARGF.read
  injection = <<~RUBY
    # Xcode 26: disable Explicitly Built Modules for all pods
    installer.pods_project.build_configurations.each do |config|
      config.build_settings["SWIFT_ENABLE_EXPLICIT_MODULES"] = "NO"
    end
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings["SWIFT_ENABLE_EXPLICIT_MODULES"] = "NO"
      end
    end
  RUBY
  content.sub!("post_install do |installer|\n", "post_install do |installer|\n#{injection}")
  print content
' ios/Podfile

# Re-run pod install with the updated Podfile
cd ios && pod install

echo "=== ci_post_clone.sh complete ==="
