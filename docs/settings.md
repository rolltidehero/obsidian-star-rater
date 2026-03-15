# Settings

Reference for Project Browser plugin settings that affect display and behavior.

## Why it exists

Settings control how the plugin renders and behaves. This page documents display-related options that affect card titles and browser UI.

## Display settings

### Use Aliases

When enabled, card titles show the first frontmatter alias of a markdown file instead of its basename. Only applies to `.md` files with frontmatter aliases.

### Show file extension for non-markdown files

When enabled, cards for non-markdown files (PDF, images, etc.) display the full filename including extension (e.g. `document.pdf` instead of `document`). When disabled, only the basename is shown.

**Obsidian document types** (notes `.md`, canvas `.canvas`, and bases `.base`) never show the file extension, regardless of this setting. They always display the basename.

## Technical implementation

- Card titles are resolved by `getFileDisplayName()` in `src/logic/get-file-display-name.ts`.
- The function checks `useAliases` and `showFileExtForNonMdFiles` from `plugin.settings`.
- Non-markdown detection uses `file.extension`; files without extension are treated as markdown for backward compatibility.
- Settings types: `PluginSettings_0_4_0` in `src/types/plugin-settings_0_4_0.ts`.

### File type visibility

Controls which file types appear in the project browser view and the project pages menu. See [docs/file-type-visibility.md](file-type-visibility.md) for full details.
