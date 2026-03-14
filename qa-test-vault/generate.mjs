#!/usr/bin/env node
/**
 * Generates the E2E test vault for Project Browser.
 * Run: node qa-test-vault/generate.mjs
 * Or via: npm run test:e2e (runs this automatically)
 *
 * Creates folders, notes with state frontmatter, and .obsidian config.
 * Idempotent — safe to re-run (overwrites existing files).
 */
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT_ROOT = __dirname;

async function ensureDir(path) {
  await mkdir(path, { recursive: true });
}

async function write(path, content) {
  await writeFile(join(VAULT_ROOT, path), content, "utf8");
}

// Plugin version for pre-seeded data (suppresses onboarding)
const PLUGIN_VERSION = "0.3.2";

const PLUGIN_DATA_JSON = {
  settingsVersion: "0.3.0",
  onboardingNotices: {
    welcomeNoticeRead: true,
    lastVersionNoticeRead: PLUGIN_VERSION,
  },
  access: {
    replaceNewTab: true,
    enableRibbonIcon: true,
    enableCommand: true,
    launchFolder: "/",
  },
  useAliases: true,
  showFileExtForNonMdFiles: true,
  showStateMenu: true,
  loopStatesWhenCycling: true,
  folders: { defaultView: "Small" },
  states: {
    visible: [
      {
        name: "Idea",
        link: true,
        defaultViewMode: "Small Cards",
        defaultViewOrder: "AliasOrFilename",
        defaultViewPriorityVisibility: true,
        defaultViewPriorityGrouping: true,
      },
      {
        name: "Shortlisted",
        link: true,
        defaultViewMode: "Small Cards",
        defaultViewOrder: "AliasOrFilename",
        defaultViewPriorityVisibility: true,
        defaultViewPriorityGrouping: true,
      },
      {
        name: "Drafting",
        link: true,
        defaultViewMode: "Detailed Cards",
        defaultViewOrder: "AliasOrFilename",
        defaultViewPriorityVisibility: true,
        defaultViewPriorityGrouping: true,
      },
      {
        name: "Focus",
        link: true,
        defaultViewMode: "Simple Cards",
        defaultViewOrder: "AliasOrFilename",
        defaultViewPriorityVisibility: true,
        defaultViewPriorityGrouping: true,
      },
      {
        name: "Final",
        link: true,
        defaultViewMode: "Small Cards",
        defaultViewOrder: "ModifiedDate",
        defaultViewPriorityVisibility: false,
        defaultViewPriorityGrouping: false,
      },
    ],
    hidden: [
      {
        name: "Archived",
        link: true,
        defaultViewMode: "Small Cards",
        defaultViewOrder: "ModifiedDate",
        defaultViewPriorityVisibility: false,
        defaultViewPriorityGrouping: false,
      },
      {
        name: "Cancelled",
        link: true,
        defaultViewMode: "Detailed Cards",
        defaultViewOrder: "ModifiedDate",
        defaultViewPriorityVisibility: false,
        defaultViewPriorityGrouping: false,
      },
    ],
  },
  stateless: {
    name: "",
    defaultViewMode: "List",
    defaultViewOrder: "ModifiedDate",
    defaultViewPriorityVisibility: true,
    defaultViewPriorityGrouping: true,
  },
  defaultState: "Idea",
  priorities: [
    { name: "High", link: false },
    { name: "Low", link: false },
  ],
};

async function main() {
  await ensureDir(join(VAULT_ROOT, ".obsidian/plugins/project-browser"));
  await ensureDir(join(VAULT_ROOT, "Project A"));
  await ensureDir(join(VAULT_ROOT, "Project B"));

  await write(".obsidian/app.json", JSON.stringify({ safeMode: false }));
  await write(
    ".obsidian/community-plugins.json",
    JSON.stringify(["project-browser"])
  );
  await write(
    ".obsidian/plugins/project-browser/data.json",
    JSON.stringify(PLUGIN_DATA_JSON, null, 2)
  );

  await write(
    "Project A/note-1.md",
    `---
state: Idea
---

# Note 1 (Project A)

Sample note for E2E tests.
`
  );

  await write(
    "Project B/note-1.md",
    `---
state: Drafting
---

# Note 1 (Project B)

Sample note for E2E tests.
`
  );

  // Non-markdown files for testing showFileExtForNonMdFiles setting
  await write(
    "Project A/sample-readme.txt",
    "Sample text file for manual testing of card display names.\n"
  );
  await write(
    "Project A/reference-data.json",
    JSON.stringify({ description: "Sample JSON for card display testing", items: [] })
  );
  await write(
    "Project B/notes-export.txt",
    "Exported notes data for manual QA.\n"
  );

  console.log("Generated qa-test-vault at", VAULT_ROOT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
