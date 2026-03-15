import { getGlobals } from './stores';
import type { FileTypeSurface } from 'src/types/plugin-settings_0_4_0';

///////////
///////////

/**
 * Returns true if files with the given extension should be shown in the specified
 * surface (Project Browser or Page Menu). Only extensions in that surface's
 * visible list are shown.
 */
export function isExtensionVisible(extension: string, surface: FileTypeSurface): boolean {
    const { plugin } = getGlobals();
    const normalizedExt = (extension ?? '').toLowerCase();
    if (!normalizedExt) return false;

    const surfaceSettings = plugin.settings.fileTypes[surface];
    return surfaceSettings?.visible?.some(
        (ext) => ext.toLowerCase() === normalizedExt
    ) ?? false;
}
