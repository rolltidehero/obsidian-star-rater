#!/bin/bash
# Build the plugin, generate QA vault, and open an isolated Obsidian instance with that vault.
# Uses obsidian-launcher for a sandboxed instance (separate from your system Obsidian).
# Usage: npm run open-qa [--verbose]

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VERBOSE="${1:-}"

cd "$PROJECT_ROOT"

echo "Building plugin..."
npm run build

echo "Generating QA vault..."
bash "$SCRIPT_DIR/download-test-plugins.sh"
node "$PROJECT_ROOT/qa-test-vault/generate.mjs"

echo "Opening Obsidian with QA vault (isolated instance)..."
if [ "$VERBOSE" = "--verbose" ] || [ "$VERBOSE" = "-v" ]; then
  npx obsidian-launcher launch --copy --plugin ./dist qa-test-vault -- --verbose
else
  npx obsidian-launcher launch --copy --plugin ./dist qa-test-vault
fi

echo "Done. Obsidian should open with the QA vault."
