import { getGlobals } from './stores';

///////////
///////////

/**
 * Returns true if files with the given extension should be shown in the project
 * browser view and the project pages menu.
 * Only extensions in the visible list are shown.
 */
export function isExtensionVisible(extension: string): boolean {
    const { plugin } = getGlobals();
    const normalizedExt = (extension ?? '').toLowerCase();
    if (!normalizedExt) return false;

    return plugin.settings.fileTypes.visible.some(
        (ext) => ext.toLowerCase() === normalizedExt
    );
}
