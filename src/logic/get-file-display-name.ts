import { TFile } from "obsidian";
import { getFileAliases } from "./frontmatter-processes";
import { getGlobals } from "./stores";

//////////////////
//////////////////

export const getFileDisplayName = (file: TFile): string => {
    const {plugin} = getGlobals();
    const aliases = getFileAliases(file);
    if(plugin.settings.useAliases && aliases) {
        return aliases[0];
    }
    const isMarkdownFile = (file.extension ?? 'md').toLowerCase() === 'md';
    if(!isMarkdownFile && plugin.settings.showFileExtForNonMdFiles) {
        return file.name;
    }
    return file.basename;
}