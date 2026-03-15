import { TFile } from "obsidian";
import { getFileAliases } from "./frontmatter-processes";
import { getGlobals } from "./stores";

//////////////////
//////////////////

const OBSIDIAN_DOCUMENT_EXTENSIONS = new Set(['md', 'canvas', 'base']);

export const getFileDisplayName = (file: TFile): string => {
    const {plugin} = getGlobals();
    const aliases = getFileAliases(file);
    if(plugin.settings.useAliases && aliases) {
        return aliases[0];
    }
    const ext = (file.extension ?? 'md').toLowerCase();
    if(OBSIDIAN_DOCUMENT_EXTENSIONS.has(ext)) {
        return file.basename;
    }
    if(plugin.settings.showFileExtForNonMdFiles) {
        return file.name;
    }
    return file.basename;
}