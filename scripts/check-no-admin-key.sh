#!/usr/bin/env bash
# Verify no backend admin key or x-api-key injection in the frontend bundle.
# Exits 0 (PASS) if clean, exits 1 (FAIL) if any forbidden pattern found.
#
# Safe patterns (NOT flagged):
#   - Firebase apiKey ("AIzaSy...") — this is a client-side key by design

set -euo pipefail
cd "$(dirname "$0")/.."

FORBIDDEN=(
  "x-api-key"
  "BACKEND_API_KEY"
  "c919848182e3e4250082ea7bacd14e170"
)

FAIL=0
for pattern in "${FORBIDDEN[@]}"; do
  # Case-insensitive grep, exclude this script and node_modules
  if grep -rli --include='*.ts' --include='*.html' --include='*.json' \
       --exclude-dir=node_modules --exclude-dir=.angular \
       "$pattern" src/ 2>/dev/null; then
    echo "❌ FAIL: found '$pattern' in the files above"
    FAIL=1
  fi
done

if [ "$FAIL" -eq 0 ]; then
  echo "✅ PASS — no backend admin key or x-api-key found in src/"
  exit 0
else
  echo ""
  echo "❌ FAIL — forbidden patterns detected. Remove them before deploying."
  exit 1
fi
