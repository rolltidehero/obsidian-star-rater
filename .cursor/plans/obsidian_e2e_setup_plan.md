---
name: E2E Setup Replication Guide
overview: A comprehensive step-by-step guide to replicate obsidian_ink's E2E testing setup—dependencies, configuration, scripts, test vault, TypeScript, CI, credentials, and patterns—in another Obsidian plugin project.
todos: []
isProject: false
---

# E2E Testing Setup: Complete Replication Guide

This document describes **exactly** how to set up E2E testing to match [obsidian_ink](obsidian_ink/)'s approach: dependencies, versions, config, scripts, vault, TypeScript, CI, credentials, and test patterns.

---

## 1. Dependencies (package.json)

### E2E-specific devDependencies

Add these exact versions (or compatible ranges). obsidian_ink uses:

| Package | Version | Purpose |
|---------|---------|---------|
| `wdio-obsidian-service` | `^2.4.0` | Obsidian-specific WebdriverIO service (downloads Obsidian, runs tests) |
| `wdio-obsidian-reporter` | `^2.4.0` | Reporter for Obsidian E2E runs |
| `@wdio/cli` | `^9.24.0` | WebdriverIO CLI |
| `@wdio/globals` | `^9.23.0` | Global browser APIs and types |
| `@wdio/local-runner` | `^9.24.0` | Local test runner |
| `@wdio/mocha-framework` | `^9.24.0` | Mocha adapter |
| `@wdio/spec-reporter` | `^9.24.0` | Spec reporter (optional; obsidian reporter may replace) |
| `mocha` | `^11.7.5` | Test framework |
| `@types/mocha` | `^10.0.10` | Mocha types |
| `tsx` | `^4.21.0` | Run `.mts` config and version extraction in CI |

```json
{
  "devDependencies": {
    "wdio-obsidian-service": "^2.4.0",
    "wdio-obsidian-reporter": "^2.4.0",
    "@wdio/cli": "^9.24.0",
    "@wdio/globals": "^9.23.0",
    "@wdio/local-runner": "^9.24.0",
    "@wdio/mocha-framework": "^9.24.0",
    "@wdio/spec-reporter": "^9.24.0",
    "mocha": "^11.7.5",
    "@types/mocha": "^10.0.10",
    "tsx": "^4.21.0"
  }
}
```

---

## 2. WebdriverIO Config (`wdio.conf.mts`)

Create at **project root** (e.g. `obsidian_ink/wdio.conf.mts`). Use `.mts` for native ESM and top-level await.

### Full config

```ts
import * as path from "path";
import { parseObsidianVersions, obsidianBetaAvailable } from "wdio-obsidian-service";
import { env } from "process";

const cacheDir = path.resolve(".obsidian-cache");

// E2E tests run against Obsidian latest (stable) and latest-beta when available.
// No pinned versions. Override with OBSIDIAN_VERSIONS for ad-hoc testing, e.g.:
//   OBSIDIAN_VERSIONS=latest/latest   — only stable
//   OBSIDIAN_VERSIONS=latest-beta/latest — only beta (when published)
let defaultVersions = "latest/latest";
if (await obsidianBetaAvailable({ cacheDir })) {
  defaultVersions += " latest-beta/latest";
}
const desktopVersions = await parseObsidianVersions(env.OBSIDIAN_VERSIONS ?? defaultVersions, { cacheDir });

if (env.CI) {
  console.log("obsidian-cache-key:", JSON.stringify([desktopVersions]));
}

export const config: WebdriverIO.Config = {
  runner: "local",
  framework: "mocha",

  specs: ["./tests/e2e/**/*.e2e.ts"],

  maxInstances: Number(env.WDIO_MAX_INSTANCES || 4),

  capabilities: desktopVersions.map(([appVersion, installerVersion]) => ({
    browserName: "obsidian",
    "wdio:obsidianOptions": {
      appVersion,
      installerVersion,
      plugins: ["./dist"],
      vault: "qa-test-vault",
    },
  })),

  services: ["obsidian"],
  reporters: ["obsidian"],

  mochaOpts: {
    ui: "bdd",
    timeout: 60 * 1000,
  },
  waitforInterval: 250,
  waitforTimeout: 5 * 1000,
  logLevel: "warn",

  cacheDir,

  injectGlobals: true,
};
```

### Config details

| Setting | Value | Notes |
|---------|-------|-------|
| `runner` | `"local"` | Run tests locally, not in cloud |
| `framework` | `"mocha"` | Mocha as test framework |
| `specs` | `["./tests/e2e/**/*.e2e.ts"]` | E2E spec pattern |
| `maxInstances` | `Number(env.WDIO_MAX_INSTANCES \|\| 4)` | Parallel instances; CI often uses 2 |
| `capabilities` | Dynamic from `desktopVersions` | Resolved at load: latest, or latest+beta |
| `plugins` | `["./dist"]` | Built plugin output folder |
| `vault` | `"qa-test-vault"` | Path to test vault (relative to project root) |
| `mochaOpts.timeout` | `60000` | 60s per test |
| `waitforInterval` | `250` | Poll interval for waitForExist |
| `waitforTimeout` | `5000` | Default wait timeout |
| `logLevel` | `"warn"` | Reduce noise |
| `cacheDir` | `path.resolve(".obsidian-cache")` | Where Obsidian installs are cached |
| `injectGlobals` | `true` | Inject `browser`, `$`, `expect` globally |

### Version resolution

- Default: `latest/latest` (stable)
- If `obsidianBetaAvailable()` is true: add `latest-beta/latest`
- Override: `OBSIDIAN_VERSIONS` env var (e.g. `OBSIDIAN_VERSIONS=latest/latest` for stable only)
- CI: `obsidian-cache-key:` logged for cache key generation

---

## 3. Scripts (package.json)

### E2E scripts (exact commands)

```json
{
  "scripts": {
    "test:e2e": "npm run build && bash scripts/download-test-plugins.sh && node qa-test-vault/generate.mjs && wdio run ./wdio.conf.mts",
    "test:e2e:spec": "npm run build && bash scripts/download-test-plugins.sh && node qa-test-vault/generate.mjs && wdio run ./wdio.conf.mts --spec",
    "test:e2e:versions": "node scripts/show-e2e-versions.mjs",
    "test:e2e:latest": "OBSIDIAN_VERSIONS=latest/latest npm run test:e2e",
    "test:e2e:beta": "OBSIDIAN_VERSIONS=latest-beta/latest npm run test:e2e",
    "open-qa": "npm run build && bash scripts/download-test-plugins.sh && node qa-test-vault/generate.mjs && npx obsidian-launcher launch --copy --plugin ./dist qa-test-vault",
    "download-test-plugins": "bash scripts/download-test-plugins.sh"
  }
}
```

### Script semantics

| Script | What it does |
|--------|---------------|
| `test:e2e` | build → download plugins → generate vault → run all E2E specs (latest + beta) |
| `test:e2e:spec` | Same, but pass spec path after `--` (e.g. `npm run test:e2e:spec -- tests/e2e/commands.e2e.ts`) |
| `test:e2e:versions` | Print which Obsidian version(s) will be tested (no build/run) |
| `test:e2e:latest` | Run E2E against latest stable only |
| `test:e2e:beta` | Run E2E against latest-beta only (requires Insiders credentials) |
| `open-qa` | Build, generate vault, launch Obsidian for manual QA |
| `download-test-plugins` | Download community plugins into vault |

### Simplifications for minimal setups

If you **do not** need community plugins or a generated vault:

- Replace the pipeline with: `npm run build && wdio run ./wdio.conf.mts`
- Use a static vault (e.g. `test/vaults/simple/`) instead of `qa-test-vault`
- Omit `download-test-plugins.sh` and `generate.mjs`
- In `wdio.conf.mts`, set `vault: "test/vaults/simple"`

---

## 4. Show-E2E-Versions Script

Create `scripts/show-e2e-versions.mjs` to mirror version resolution without running tests:

```mjs
#!/usr/bin/env node
/**
 * Prints which Obsidian version(s) will be tested by E2E.
 * Mirrors the resolution logic in wdio.conf.mts.
 * Run: npm run test:e2e:versions
 */
import { parseObsidianVersions, obsidianBetaAvailable } from "wdio-obsidian-service";
import path from "path";

const cacheDir = path.resolve(".obsidian-cache");
let defaultVersions = "latest/latest";
if (await obsidianBetaAvailable({ cacheDir })) {
  defaultVersions += " latest-beta/latest";
}
const versions = await parseObsidianVersions(
  process.env.OBSIDIAN_VERSIONS ?? defaultVersions,
  { cacheDir }
);
console.log(
  "E2E will test Obsidian versions:",
  versions.map(([a, i]) => `${a}/${i}`).join(", ")
);
```

---

## 5. TypeScript Configuration

### Main tsconfig.json

Exclude E2E from the main TypeScript build (different types, node-like environment):

```json
{
  "compilerOptions": { ... },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["tests/e2e", "node_modules"]
}
```

### tsconfig.e2e.json (separate E2E config)

Create a dedicated config for E2E:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": [
      "node",
      "@wdio/globals/types",
      "@wdio/mocha-framework",
      "wdio-obsidian-service"
    ]
  },
  "include": ["tests/e2e/**/*.ts", "wdio.conf.mts"],
  "exclude": ["node_modules"]
}
```

WebdriverIO picks up TypeScript via tsx/ts-node when running specs; the tsconfig.e2e ensures correct type-checking.

---

## 6. .gitignore

Add:

```
.obsidian-cache/
.env
.env.*
!.env.example
qa-test-vault/*
!qa-test-vault/generate.mjs
!qa-test-vault/README.md
```

- `.obsidian-cache/` — Obsidian install cache (large)
- `.env` — Credentials for Obsidian Insiders (beta)
- `qa-test-vault/*` — Generated vault content (except generator script and README)

---

## 7. Test Vault

### Option A: Minimal static vault

For simple plugins:

```
test/vaults/simple/
├── README.md
├── Project A/
│   └── note-1.md
└── Project B/
    └── note-1.md
```

In `wdio.conf.mts`: `vault: "test/vaults/simple"`.

### Option B: Generated vault (obsidian_ink style)

- Root: `qa-test-vault/`
- Generator: `qa-test-vault/generate.mjs` — Node script that creates notes, folders, and `.obsidian/` config
- In `wdio.conf.mts`: `vault: "qa-test-vault"`

### .obsidian configuration (when using community plugins)

Create or generate:

- `.obsidian/app.json`: `{ "safeMode": false }`
- `.obsidian/community-plugins.json`: array of plugin IDs to enable
- `.obsidian/plugins/<plugin-id>/` — plugin folders (from download script)

### Pre-seeding plugin data (popup suppression)

If your plugin or companion plugins show welcome/onboarding popups:

- `.obsidian/plugins/<your-plugin>/data.json` — pre-seed flags like `welcomeTipRead: true`
- Other plugins (e.g. Excalidraw): `.obsidian/plugins/<id>/data.json` with `previousRelease` or equivalent to suppress modals

---

## 8. Download Test Plugins Script

If you need community plugins in the vault, create `scripts/download-test-plugins.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

PLUGINS_DIR="qa-test-vault/.obsidian/plugins"

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

# Add your plugins, e.g.:
# download_plugin "owner/repo" "plugin-id"

echo "Done. Plugins at $PLUGINS_DIR"
```

Adapt plugin list to your needs. obsidian_ink uses: obsidian-columns, multi-column-markdown, obsidian-admonition, obsidian-kanban, tabs, obsidian-hover-editor, obsidian-excalidraw-plugin.

---

## 9. E2E Spec Patterns

### Basic spec (with popup helper)

```ts
import { browser, expect } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";

describe("Plugin Commands", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  it("plugin is loaded", async function () {
    const loaded = await browser.executeObsidian(({ app }) => {
      return !!app.plugins.plugins["your-plugin-id"];
    });
    expect(loaded).toBe(true);
  });

  it("command opens view", async function () {
    await obsidianPage.openFile("path/to/note.md");
    await browser.executeObsidianCommand("your-plugin:your-command");
    const view = await $(".your-selector");
    await view.waitForExist({ timeout: 10000 });
    await expect(view).toExist();
  });
});
```

### Onboarding spec (uses reloadObsidian)

```ts
describe("Onboarding", function () {
  before(async function () {
    await browser.reloadObsidian({ vault: "qa-test-vault" });
    await browser.waitUntil(
      async () => await browser.executeObsidian(({ app }) => !!app.plugins.plugins["your-plugin"]),
      { timeout: 15000 }
    );
  });

  it("completes onboarding", async function () {
    // Reset state, enable/disable plugin, interact with modal, assert
    await obsidianPage.disablePlugin("your-plugin");
    await obsidianPage.enablePlugin("your-plugin");
    // ...
  });
});
```

### Key APIs

| API | Purpose |
|-----|---------|
| `browser.executeObsidian(({ app }) => ...)` | Run code in Obsidian context |
| `browser.executeObsidianCommand("command-id")` | Run a command palette command |
| `obsidianPage.openFile("path/to/file.md")` | Open a file in the vault |
| `obsidianPage.disablePlugin("id")` / `enablePlugin("id")` | Toggle plugins |
| `browser.reloadObsidian({ vault: "..." })` | Reload with a vault |
| `$(".selector")`, `$$(".selector")` | Query DOM |
| `expect(el).toExist()` | Assert element exists |

---

## 10. Popup Helper (optional)

If your plugin shows blocking notices:

```ts
// tests/e2e/helpers/dismiss-popups.ts
import { browser } from "@wdio/globals";

export async function dismissBlockingPopups(): Promise<void> {
  await browser.pause(500);
  const dismissed = await browser.execute(() => {
    const notice = document.querySelector(".your-notice-class");
    if (notice) {
      const btn = notice.querySelector(".dismiss-btn");
      if (btn instanceof HTMLElement) {
        btn.click();
        return true;
      }
    }
    return false;
  });
  if (dismissed) await browser.pause(300);
}
```

Call in `before` hooks. Pre-seeding plugin data is preferred; this is a fallback.

---

## 11. CI Workflow (GitHub Actions)

### Full workflow (`.github/workflows/test.yaml`)

```yaml
name: Test

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
  workflow_dispatch:

permissions: {}

jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        os:
          - ubuntu-latest
    runs-on: ${{ matrix.os }}
    name: Test ${{ matrix.os }}
    defaults:
      run:
        shell: bash
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22.x"
          cache: "npm"

      - run: npm ci
      - run: npm run build

      - name: Run unit tests
        run: npm run test:unit

      - name: Get Obsidian cache key
        run: |
          npx tsx wdio.conf.mts 2>/dev/null | grep "obsidian-cache-key:" > obsidian-versions-lock.txt || true
          rm -rf .obsidian-cache
        env:
          CI: true
          OBSIDIAN_EMAIL: ${{ secrets.OBSIDIAN_EMAIL }}
          OBSIDIAN_PASSWORD: ${{ secrets.OBSIDIAN_PASSWORD }}

      - name: Cache Obsidian
        uses: actions/cache@v4
        with:
          path: .obsidian-cache
          key: obsidian-cache-${{ matrix.os }}-${{ hashFiles('obsidian-versions-lock.txt') }}

      - if: ${{ matrix.os == 'ubuntu-latest' }}
        name: Setup virtual graphics
        run: |
          sudo apt-get update -q
          sudo apt-get install -q herbstluftwm x11-xserver-utils
          export DISPLAY=:99
          echo "DISPLAY=$DISPLAY" >> "$GITHUB_ENV"
          Xvfb $DISPLAY -screen 0 1280x1024x24 +extension GLX -noreset &
          sleep 2
          herbstluftwm &
          sleep 1

      - name: Run e2e tests
        run: npm run test:e2e
        env:
          WDIO_MAX_INSTANCES: 2
          OBSIDIAN_EMAIL: ${{ secrets.OBSIDIAN_EMAIL }}
          OBSIDIAN_PASSWORD: ${{ secrets.OBSIDIAN_PASSWORD }}
```

### CI details

- **Get Obsidian cache key:** Run `wdio.conf.mts` with `CI=true` and Obsidian credentials; grep `obsidian-cache-key:` for version lock
- **Cache key:** `obsidian-cache-${{ matrix.os }}-${{ hashFiles('obsidian-versions-lock.txt') }}` — invalidates when versions change
- **Virtual display (Ubuntu):** Xvfb + herbstluftwm for headless Obsidian
- **Secrets:** `OBSIDIAN_EMAIL`, `OBSIDIAN_PASSWORD` required for beta; recommended for stable as well
- **WDIO_MAX_INSTANCES:** `2` in CI to avoid resource contention

---

## 12. Credentials (Obsidian Insiders / Beta)

Obsidian beta requires an Insiders account.

### Local

- **Env vars:** `export OBSIDIAN_EMAIL="..."` and `export OBSIDIAN_PASSWORD="..."`
- **.env:** Create `obsidian_ink/.env` (or project root) with these variables; ensure `.env` is in `.gitignore`

### CI

- Store `OBSIDIAN_EMAIL` and `OBSIDIAN_PASSWORD` as GitHub repository secrets
- Pass them to the "Get Obsidian cache key" and "Run e2e tests" steps

---

## 13. File Summary

| Action | Path |
|--------|------|
| Create | `wdio.conf.mts` |
| Create | `scripts/show-e2e-versions.mjs` |
| Create | `scripts/download-test-plugins.sh` (if using community plugins) |
| Create | `qa-test-vault/generate.mjs` (if using generated vault) |
| Create | `tests/e2e/**/*.e2e.ts` |
| Create | `tests/e2e/helpers/dismiss-popups.ts` (optional) |
| Create | `tsconfig.e2e.json` |
| Modify | `package.json` (deps, scripts) |
| Modify | `tsconfig.json` (exclude `tests/e2e`) |
| Modify | `.gitignore` |
| Create/Modify | `.github/workflows/test.yaml` |

---

## 14. References

- [wdio-obsidian-service docs](https://jesse-r-s-hines.github.io/wdio-obsidian-service/)
- [WebdriverIO docs](https://webdriver.io/docs/)
- Reference implementation: [obsidian_ink](obsidian_ink/)
