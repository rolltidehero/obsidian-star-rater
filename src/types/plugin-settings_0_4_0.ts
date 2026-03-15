import { DEFAULT_PLUGIN_SETTINGS_0_3_0, PluginSettings_0_3_0 } from "./plugin-settings_0_3_0";

///////////
///////////

export interface FileTypeSettings_0_4_0 {
    visible: string[];
    hidden: string[];
}

export const DEFAULT_FILE_TYPE_SETTINGS_0_4_0: FileTypeSettings_0_4_0 = {
    visible: [
        'md',
        'canvas',
        'base',
        'pdf',
        'avif',
        'bmp',
        'gif',
        'jpeg',
        'jpg',
        'png',
        'svg',
        'webp',
        'flac',
        'm4a',
        'mp3',
        'ogg',
        'wav',
        'webm',
        '3gp',
        'mkv',
        'mov',
        'mp4',
        'ogv',
    ],
    hidden: ['pbs'],
};

///////////

export interface PluginSettings_0_4_0 extends PluginSettings_0_3_0 {
    settingsVersion: '0.4.0';
    fileTypes: FileTypeSettings_0_4_0;
}

export const DEFAULT_PLUGIN_SETTINGS_0_4_0: PluginSettings_0_4_0 = {
    ...DEFAULT_PLUGIN_SETTINGS_0_3_0,
    settingsVersion: '0.4.0',
    fileTypes: { ...DEFAULT_FILE_TYPE_SETTINGS_0_4_0 },
};
