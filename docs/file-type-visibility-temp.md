# File Type Visibility

Reference for how file type visibility controls what appears in the project browser view and the project pages menu.
## Why it exists
By default, the project browser shows all file types that Obsidian natively supports (notes, canvas files, PDFs, images, audio, video, etc.). File type visibility lets you hide file types you do not want to see in the browser or the pages menu—for example, plugin-generated JSON files, config files, or other auxiliary formats.
## Conceptual understanding
- **Visible file types** — Extensions in this list are shown in the project browser view and the project pages FAB menu.
- **Hidden file types** — Extensions in this list are suppressed. They do not appear in the project browser view or the project pages menu.
The same filter applies consistently across both surfaces. Only files whose extension is in the visible list are shown.
## Flows and relationships
```mermaid
flowchart LR
    subgraph Settings [Settings tab]
        Visible[Visible file types]
        Hidden[Hidden file types]
    end
    subgraph Filter [Filter]
        IsVisible[isExtensionVisible]
    subgraph Browser [Project browser]
        CardBrowser[Card browser view]
    subgraph Pages [Pages menu]
        ProjectPagesFAB[Project Pages FAB]
    Settings --> Filter
    Filter --> CardBrowser
    Filter --> ProjectPagesFAB
```
## Using file type visibility
### Default visible file types
By default, visible file types include Obsidian’s native formats:
- **Note** (`.md`)
- **Canvas** (`.canvas`)
- **Base** (`.base`)
- **PDF** (`.pdf`)
- Image formats (`.png`, `.jpg`, `.gif`, `.svg`, etc.)
- Audio formats (`.mp3`, `.ogg`, `.wav`, etc.)
- Video formats (`.mp4`, `.mov`, `.webm`, etc.)
### Drag-and-drop
You can drag file types between **Visible** and **Hidden** to change what appears in the browser and pages menu.
### Scan for new file types
The **Scan for new file types** button in the Hidden section:
1. Scans all files in your vault for unique extensions.
2. Merges that with a known set of Obsidian-native extensions.
3. Adds any extensions not already in Visible or Hidden to the **Hidden** list.
Newly discovered types are added to Hidden by default so you can review and drag them to Visible if you want to show them.
### Add Obsidian-registered types
The **Add Obsidian-registered types** button (next to Scan for new file types):
1. Attempts to read file extensions from Obsidian’s internal view registry (`viewRegistry.typeByExtension`). This reflects extensions that Obsidian and its plugins have registered with `registerExtensions()`.
2. If the registry is missing or inaccessible, falls back to a hardcoded list of known Obsidian-native extensions.
Use this when you want to hide only file types Obsidian actually recognises, rather than every extension present in your vault.
## Technical implementation
- **Settings**: `plugin.settings.fileTypes.visible` and `plugin.settings.fileTypes.hidden` (string arrays of extensions).
- **Filter**: `isExtensionVisible(extension)` in `src/logic/file-type-filter.ts` — returns `true` only when the extension is in the visible list.
- **Project browser**: `getSortedSectionsInFolder` and `getSortedSectionsInFolderAsync` in `src/logic/folder-processes.ts` skip files whose extension fails the filter.
- **Pages menu**: `ProjectPagesFAB` in `src/components/project-pages-fab/` filters its page list with the same function.
- **File type editor**: `FileTypeEditor` in `src/components/file-type-editor/` renders the visible/hidden sections with ReactSortable for drag-and-drop.
## Technical gotchas
- Extensions are compared case-insensitively.
- `.pbs` (project settings) is in the default hidden list and never appears in the browser or pages menu.
- The scan excludes empty extensions and `.pbs`.
- Unknown types in the visible list are shown with their extension (e.g. `.json`) instead of a display name.
- The Add Obsidian-registered types button reads from Obsidian's internal view registry (`viewRegistry.typeByExtension`), which is undocumented. If Obsidian changes this structure in a future version, the registry-based scan may need adjustment.
- The Add Obsidian-registered types button reads from Obsidian’s internal view registry (`viewRegistry.typeByExtension`), which is undocumented. If Obsidian changes this structure in a future version, the registry-based scan may need adjustment.
- The Add Obsidian-registered types button uses Obsidian’s internal view registry (`viewRegistry.typeByExtension`), which is undocumented. If Obsidian changes this structure in a future version, the registry-based scan may need adjustment.
- Add Obsidian-registered types uses Obsidian's internal `viewRegistry.typeByExtension`, which is undocumented. If Obsidian changes this structure in a future version, the registry-based scan may need adjustment.
- Add Obsidian-registered types uses Obsidian’s internal `viewRegistry.typeByExtension`, which is undocumented. If Obsidian changes this structure in a future version, the registry-based scan may need adjustment.
- Add Obsidian-registered types uses Obsidian’s internal view registry (`viewRegistry.typeByExtension`), which is undocumented. If Obsidian changes this structure in a future version, the registry-based scan may need adjustment.
- The **Add Obsidian-registered types** button uses Obsidian's internal view registry (`viewRegistry.typeByExtension`), which is undocumented. If Obsidian changes this structure in a future version, the registry-based scan may need adjustment.
- Add Obsidian-registered types uses Obsidian’s internal view registry, which is undocumented. The structure may change in future Obsidian versions; the registry-based scan may need adjustment if that happens.
- The Add Obsidian-registered types button uses Obsidian's internal view registry (`viewRegistry.typeByExtension`), which is undocumented. If Obsidian changes this structure in a future version, the registry-based scan may need adjustment.
- The **Add Obsidian-registered types** button reads from `viewRegistry.typeByExtension`, which is an unofficial internal structure. If Obsidian changes its internals in a future version, this access may need adjustment.
- The **Add Obsidian-registered types** button reads from `viewRegistry.typeByExtension`, which is an unofficial internal API. If Obsidian changes its internals in a future version, this may need adjustment.
- Registry access for "Add Obsidian-registered types" is unofficial; `viewRegistry.typeByExtension` may need adjustment if Obsidian changes its internals.
- The "Add Obsidian-registered types" button reads from Obsidian's internal `viewRegistry.typeByExtension`, which is undocumented. The property path or shape may change in future Obsidian versions; the implementation falls back to a hardcoded list if the registry is inaccessible.
- The **Add Obsidian-registered types** button reads from Obsidian's internal `viewRegistry.typeByExtension`; this is an unofficial API and may need adjustment if Obsidian changes its internals.
- The registry access for “Add Obsidian-registered types” (`viewRegistry.typeByExtension`) is unofficial; the property path may change if Obsidian updates internals.
- **Add Obsidian-registered types** relies on Obsidian’s internal `viewRegistry.typeByExtension`, which is undocumented. If Obsidian changes this structure in a future version, the helper may need adjustment.
- **Add Obsidian-registered types**: The `viewRegistry.typeByExtension` access is unofficial; Obsidian does not expose a public API for this. The implementation may need adjustment if Obsidian changes its internal structure.
- The **Add Obsidian-registered types** button reads `viewRegistry.typeByExtension` (or `typeByExt`), which is an undocumented Obsidian internal. If Obsidian changes its internals in a future version, this may need adjustment.
- **Add Obsidian-registered types**: The `viewRegistry.typeByExtension` access is unofficial. If Obsidian changes its internals in a future version, this may need adjustment.
- Add Obsidian-registered types uses Obsidian’s internal `viewRegistry.typeByExtension`, which is unofficial and may need adjustment if Obsidian changes its internals.
- Registry access for "Add Obsidian-registered types" uses `viewRegistry.typeByExtension` — an undocumented internal structure. The property path may change between Obsidian versions; the implementation falls back gracefully if the registry is missing or inaccessible.
- **Add Obsidian-registered types** uses `viewRegistry.typeByExtension`, which is an unofficial internal API. The property path may change between Obsidian versions; if the registry becomes inaccessible, the feature falls back to the hardcoded native extensions list.
- **Add Obsidian-registered types** uses Obsidian’s internal `viewRegistry.typeByExtension` — an undocumented API. The property path may change in future Obsidian versions; the fallback to `OBSIDIAN_NATIVE_EXTENSIONS` handles this.
- **Add Obsidian-registered types** uses `viewRegistry.typeByExtension`, which is an undocumented internal structure. If Obsidian changes its internals in a future version, the registry access may need adjustment.
- The registry access (`viewRegistry.typeByExtension`) used by "Add Obsidian-registered types" is unofficial; the internal structure may change in future Obsidian versions and may require adjustment.
- **Add Obsidian-registered types** uses Obsidian’s internal `viewRegistry.typeByExtension`, which is not part of the public API. The property path may change in future Obsidian versions; the code falls back to a hardcoded list if the registry is inaccessible.
- The "Add Obsidian-registered types" button reads from `viewRegistry.typeByExtension`, an undocumented internal structure. Obsidian may change this in future versions; the implementation uses defensive try/catch and falls back to a hardcoded list if the registry is inaccessible.
- **Add Obsidian-registered types** reads from `viewRegistry.typeByExtension`, an undocumented internal API. The property path or structure may change in future Obsidian versions; the fallback to a hardcoded list mitigates this.
- **Registry access**: The "Add Obsidian-registered types" button reads from `app.viewRegistry.typeByExtension`, which is an undocumented internal structure. It may need adjustment if Obsidian changes its internals in a future release.
- **Registry access**: The “Add Obsidian-registered types” button reads from `viewRegistry.typeByExtension`, which is an undocumented internal structure. It may need adjustment if Obsidian changes its internals in a future release.
- **Registry access is unofficial**: "Add Obsidian-registered types" reads from `viewRegistry.typeByExtension`, which is an internal Obsidian structure. If Obsidian changes its internals in a future version, the helper may need adjustment.
- **Registry access**: The Add Obsidian-registered types button reads from `viewRegistry.typeByExtension`, which is an undocumented internal structure. If Obsidian changes its internals in a future version, this may need adjustment; the fallback to known Obsidian types mitigates most breakage.
- **Registry access**: "Add Obsidian-registered types" uses `app.viewRegistry.typeByExtension`, which is an undocumented internal API. Obsidian does not expose a public way to list registered extensions. If Obsidian changes this internal structure in a future version, the fallback to known Obsidian-native extensions ensures the feature still works.
