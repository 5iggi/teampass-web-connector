#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "Error: Safari packaging requires macOS with Xcode." >&2
  exit 1
fi
command -v xcrun >/dev/null || { echo "Error: xcrun not found. Install Xcode." >&2; exit 1; }
xcrun safari-web-extension-packager --help >/dev/null
python3 build.py
rm -rf dist/safari-xcode
xcrun safari-web-extension-packager dist/chromium \
  --project-location dist/safari-xcode \
  --app-name "TeamPass Web Connector" \
  --bundle-identifier "io.github.5iggi.teampass-web-connector" \
  --swift \
  --macos-only \
  --copy-resources
printf '\nSafari Xcode project created in: %s\n' "$ROOT/dist/safari-xcode"
printf 'Open the project in Xcode, select a Signing Team, build, launch, and enable the extension in Safari.\n'
