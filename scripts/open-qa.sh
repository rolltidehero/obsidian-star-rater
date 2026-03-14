#!/bin/bash
# Build the plugin, install it into qa-test-vault, and open Obsidian with that vault.
# Usage: npm run open-qa [--verbose]

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VAULT_DIR="$PROJECT_ROOT/qa-test-vault"
PLUGIN_DIR="$VAULT_DIR/.obsidian/plugins/project-browser"
VERBOSE="${1:-}"

cd "$PROJECT_ROOT"

echo "Building plugin..."
npm run build

echo "Generating QA vault..."
bash "$SCRIPT_DIR/download-test-plugins.sh"
node "$VAULT_DIR/generate.mjs"

echo "Copying plugin files to vault..."
mkdir -p "$PLUGIN_DIR"
cp "$PROJECT_ROOT/dist/main.js" "$PLUGIN_DIR/"
cp "$PROJECT_ROOT/dist/styles.css" "$PLUGIN_DIR/"
cp "$PROJECT_ROOT/manifest.json" "$PLUGIN_DIR/"

echo "Opening Obsidian with QA vault..."
if [ "$VERBOSE" = "--verbose" ] || [ "$VERBOSE" = "-v" ]; then
  open -a "Obsidian" --args "$VAULT_DIR" --verbose
else
  open -a "Obsidian" --args "$VAULT_DIR"
fi

echo "Done. Obsidian should open with the QA vault."
