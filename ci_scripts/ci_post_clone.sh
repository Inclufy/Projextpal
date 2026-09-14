#!/bin/sh
# =============================================================================
# Xcode Cloud post-clone hook — ProjeXtPal
# -----------------------------------------------------------------------------
# THIS IS THE ONLY SCRIPT. ios/ci_scripts/ci_post_clone.sh forwards here and
# holds no logic of its own.
#
# Until 14 September 2026 there were two full variants, here and in
# ios/ci_scripts/, and they had drifted apart: only this one exported the
# Supabase variables, only the other one carried the note on `set -x`. Which of
# the two ran depended on what the App Store Connect workflow pointed at — the
# kind of uncertainty you least want while a build is failing.
#
# Why this location wins: the workflow has its primary workspace path set to
# "ProjeXtPal.xcworkspace" at the repo root, and Xcode Cloud looks for
# ci_scripts/ next to that path. If the workflow is ever repointed at
# ios/ProjeXtPal.xcworkspace, the forwarder catches it.
#
# Note: there is DELIBERATELY no opt-in gate here, unlike Inclufy Finance. That
# project skips builds with `exit 1`, which is the only signal Xcode Cloud has —
# so a skip is reported and mailed as a FAILED build. If you don't want a build
# on every push, set that in the workflow's Start Conditions (Tag Changes, or a
# Files-and-Folders condition), not here.
# =============================================================================

set -e
# `set -x` echoes every command before running it — invaluable when the build
# log gives a bare "exited with code 1" without telling you which line failed.
set -x

phase() {
  set +x
  echo ""
  echo "::group::$1"
  echo "=== [Phase] $1 ==="
  set -x
}

phase "ci_post_clone start (ProjeXtPal)"
date
sw_vers || true
xcodebuild -version || true

# Navigate to the project root. The Expo source lives at the repo root under
# src/, not in a mobile/ directory — that one does not exist.
cd "$CI_PRIMARY_REPOSITORY_PATH"
echo "Working directory: $(pwd)"
ls -la

phase "Node + npm setup"
if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
  echo "Node already installed: $(node --version) | npm: $(npm --version)"
else
  echo "Installing Node.js via Homebrew"
  brew install node || { echo "brew install node failed"; exit 1; }
  echo "Node: $(node --version) | npm: $(npm --version)"
fi

phase "npm dependencies"
if ! CI=1 npm ci; then
  echo "WARN: npm ci failed (likely lockfile drift) — falling back to npm install"
  CI=1 npm install
fi

phase "Environment variables"
# Pass through whatever App Store Connect set as a secret; leave empty if it did
# not, so the build fails on something visible in the log rather than on an
# unset variable.
export EXPO_PUBLIC_SUPABASE_URL="${EXPO_PUBLIC_SUPABASE_URL:-}"
export EXPO_PUBLIC_SUPABASE_ANON_KEY="${EXPO_PUBLIC_SUPABASE_ANON_KEY:-}"
[ -n "${EXPO_PUBLIC_SUPABASE_URL}" ] || echo "NOTE: EXPO_PUBLIC_SUPABASE_URL not set in the workflow"

# Sentry source-map upload defense — without org/token configured,
# sentry-cli fails the build with "An organization ID or slug is required".
if [ -z "${SENTRY_ORG:-}" ] || [ -z "${SENTRY_AUTH_TOKEN:-}" ]; then
  export SENTRY_DISABLE_AUTO_UPLOAD=true
  export SENTRY_ALLOW_FAILURE=true
  echo "Sentry source-map upload disabled (no SENTRY_ORG / SENTRY_AUTH_TOKEN)"
fi

phase "Expo prebuild (preserve committed ios/)"
npx expo prebuild --platform ios --no-install

phase "CocoaPods install"
cd ios
echo "react-native version in package.json:"
grep '"react-native"' "$CI_PRIMARY_REPOSITORY_PATH/package.json" || true
echo "First few RN-pinned pods in Podfile.lock:"
grep -E "FBLazyVector|RCTDeprecation|React-Core-prebuilt" Podfile.lock | head -5 || true
pod install

phase "Workspace-path bridge"
# The workflow has its primary workspace path set to "ProjeXtPal.xcworkspace" at
# the root, but the Expo project nests it at ios/ProjeXtPal.xcworkspace. Without
# this symlink xcodebuild fails with "Workspace ProjeXtPal.xcworkspace does not
# exist". `ln -sfn` is idempotent, so re-runs are safe.
cd "$CI_PRIMARY_REPOSITORY_PATH"
ln -sfn ios/ProjeXtPal.xcworkspace ProjeXtPal.xcworkspace
echo "=== Workspace symlink: $(readlink ProjeXtPal.xcworkspace) ==="

echo "=== ci_post_clone.sh complete ==="
