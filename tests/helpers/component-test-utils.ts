/**
 * Helpers for React component tests.
 * Use makePlugin() and setGlobalsForComponentTest() before rendering components
 * that call getGlobals().
 */

import ProjectBrowserPlugin from 'src/main';
import { TFile, TFolder } from 'obsidian';
import { setGlobals } from 'src/logic/stores';
import { DEFAULT_SETTINGS, PluginSettings } from 'src/types/types-map';

export function makePlugin(
  settingsOverrides?: Partial<PluginSettings>
): ProjectBrowserPlugin {
  const plugin = new ProjectBrowserPlugin();
  plugin.settings = { ...DEFAULT_SETTINGS, ...settingsOverrides } as PluginSettings;
  return plugin;
}

export function makeTFile(
  name = 'file.md',
  ctime = 0,
  mtime = 0
): TFile {
  return new TFile(name, ctime, mtime);
}

export function makeTFolder(name = 'folder'): TFolder {
  return new TFolder(name);
}

/**
 * Call before rendering a component that uses getGlobals().
 * Pass a plugin or omit to use makePlugin().
 */
export function setGlobalsForComponentTest(
  plugin?: ProjectBrowserPlugin
): void {
  setGlobals({ plugin: plugin ?? makePlugin() });
}
