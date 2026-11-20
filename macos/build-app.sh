#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:-$ROOT/dist/mac}"
APP="$OUT/Luma Retouch.app"

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js 22.12+ and npm are required to build the bundled editor." >&2
  exit 1
fi
if ! command -v swiftc >/dev/null 2>&1; then
  echo "Xcode Command Line Tools are required to build the Mac app." >&2
  exit 1
fi

cd "$ROOT"
npm run build --workspace=apps/web
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources/web"
cp macos/Info.plist "$APP/Contents/Info.plist"
cp -R apps/web/dist/. "$APP/Contents/Resources/web/"
swiftc -O -target arm64-apple-macos13.0 macos/App/main.swift \
  -framework AppKit -framework WebKit \
  -o "$APP/Contents/MacOS/LumaRetouch"
codesign --force --deep --sign - "$APP"

echo "Built: $APP"
