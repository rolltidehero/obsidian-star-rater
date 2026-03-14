#!/usr/bin/env bash
# Download community plugins into the E2E test vault.
# Used by npm run test:e2e and npm run download-test-plugins.
#
# How to add plugins: uncomment or add download_plugin "owner/repo" "plugin-id" lines below.
# When to use: if E2E needs to test interactions with other plugins (e.g. Kanban, Excalidraw).
# Re-download: run with FORCE=1 to overwrite existing plugin files.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGINS_DIR="$SCRIPT_DIR/../qa-test-vault/.obsidian/plugins"

download_plugin() {
  local repo="$1"
  local id="$2"
  local dest="$PLUGINS_DIR/$id"
  if [[ "${FORCE:-0}" != "1" ]] && [[ -f "$dest/main.js" ]]; then
    echo "Skipping $id (already present; run with FORCE=1 to re-download)"
    return
  fi
  echo "Downloading $id from $repo..."
  mkdir -p "$dest"
  curl -fsSL "https://github.com/$repo/releases/latest/download/main.js" -o "$dest/main.js"
  curl -fsSL "https://github.com/$repo/releases/latest/download/manifest.json" -o "$dest/manifest.json"
  curl -fsSL "https://github.com/$repo/releases/latest/download/styles.css" -o "$dest/styles.css" 2>/dev/null || true
  echo "  -> $dest"
}

# Add community plugins here. Example:
# download_plugin "owner/repo" "plugin-id"

echo "Done. Plugins at $PLUGINS_DIR"
