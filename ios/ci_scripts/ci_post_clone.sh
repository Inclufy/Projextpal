#!/bin/sh
# =============================================================================
# Forwarder — the real hook lives in ci_scripts/ci_post_clone.sh at the repo root.
# -----------------------------------------------------------------------------
# Xcode Cloud looks for ci_scripts/ next to the path configured as the workflow's
# primary workspace. Today that is the repo root; if it is ever repointed at
# ios/ProjeXtPal.xcworkspace, Xcode Cloud finds this file and still ends up
# running the same logic.
#
# Until 14 September 2026 this held a second, full copy that had drifted from the
# first. One place with the logic, one forwarder.
# =============================================================================
set -e
exec "${CI_PRIMARY_REPOSITORY_PATH}/ci_scripts/ci_post_clone.sh" "$@"
