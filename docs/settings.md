# Settings

Reference for Project Browser plugin settings that affect display and behavior.

## Why it exists

Settings control how the plugin renders and behaves. This page documents display-related options that affect card titles and browser UI.

## Display settings

### Use Aliases

When enabled, card titles show the first frontmatter alias of a markdown file instead of its basename. Only applies to `.md` files with frontmatter aliases.

### Show file extension for non-markdown files

When enabled, cards for non-markdown files (PDF, images, etc.) display the full filename including extension (e.g. `document.pdf` instead of `document`). When disabled, only the basename is shown.

This setting is exposed in the Notes section of the plugin settings tab and defaults to on.

## Technical implementation

- Card titles are resolved by `getFileDisplayName()` in `src/logic/get-file-display-name.ts`.
- The function checks `useAliases` and `showFileExtForNonMdFiles` from `plugin.settings`.
- Non-markdown detection uses `file.extension`; files without extension are treated as markdown for backward compatibility.
- Settings types: `PluginSettings_0_3_0` in `src/types/plugin-settings_0_3_0.ts`.
