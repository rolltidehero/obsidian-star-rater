# E2E test vault

This vault is **generated** by `generate.mjs` for E2E tests and manual QA. No vault content is committed — only this README and the generator script.

## How to use

- **E2E:** Run `npm run test:e2e` — the pipeline runs generate automatically before wdio.
- **Manual:** Run `node qa-test-vault/generate.mjs`, then `npm run open-qa` to build, copy the plugin, and open Obsidian.

## download-test-plugins.sh

If E2E needs community plugins (e.g. Kanban, Excalidraw), add them in `scripts/download-test-plugins.sh`:

```bash
download_plugin "owner/repo" "plugin-id"
```

Then run `npm run download-test-plugins` before `generate.mjs`. Ensure `generate.mjs` adds those plugin IDs to `community-plugins.json` so Obsidian enables them.

## Customisation

Edit `generate.mjs` to add folders, notes, or adjust plugin data. The script is idempotent — re-running overwrites files.

## Pre-seeding

`data.json` pre-seeds Project Browser settings to suppress onboarding notices. Add similar pre-seeds in `generate.mjs` for other plugins (e.g. `previousRelease` for Excalidraw) when needed.
