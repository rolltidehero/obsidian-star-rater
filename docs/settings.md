# Settings

Reference for Project Browser plugin settings that affect display and behavior.

## Why it exists

Settings control how the plugin renders and behaves. This page documents display-related options that affect card titles and browser UI.

## Display settings

### Use Aliases

When enabled, card titles show the first frontmatter alias of a markdown file instead of its basename. Only applies to `.md` files with frontmatter aliases.

### Show extension for non-document files

When enabled, non-document files (PDF, images, etc.) display the full filename including extension (e.g. `document.pdf` instead of `document`) on both project browser cards and page menu buttons. When disabled, only the basename is shown. The extension portion (`.pdf`, `.png`, etc.) is rendered with `var(--text-faint)` so it appears slightly faded.

**Document types** (notes `.md`, canvas `.canvas`, and bases `.base`) never show the file extension, regardless of this setting. They always display the basename.

Only canvas and base files show a small type tag (CANVAS, BASE) at the top-right of their cards and page menu buttons; other file types do not.

## Technical implementation

- Card titles use `getFileDisplayNameParts()` for split basename/extension rendering; `getFileDisplayName()` returns the full string.
- The function checks `useAliases` and `showFileExtForNonMdFiles` from `plugin.settings`.
- Non-document detection uses `OBSIDIAN_DOCUMENT_EXTENSIONS` (`md`, `canvas`, `base`); files without extension are treated as markdown for backward compatibility.
- Settings types: `PluginSettings_0_4_0` in `src/types/plugin-settings_0_4_0.ts`.

### File type visibility

Controls which file types appear in the project browser view and the project pages menu. See [docs/file-type-visibility.md](file-type-visibility.md) for full details.
