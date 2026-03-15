import { createRoot } from 'react-dom/client';
import * as React from 'react';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { GripVertical } from 'lucide-react';
import classNames from 'classnames';
import type { App } from 'obsidian';
import { getGlobals } from 'src/logic/stores';
import './file-type-editor.scss';

///////////
///////////

/** Pretty names only for Note, Canvas, Base; all others show .ext */
const EXTENSION_DISPLAY_NAMES: Record<string, string> = {
    md: 'Note',
    canvas: 'Canvas',
    base: 'Base',
};

/** Note, Canvas, Base use full primary colour; other default types use semi-outline */
const CORE_EXTENSIONS_FULL_PRIMARY = new Set(['md', 'canvas', 'base']);

/** Minimal fallback when viewRegistry is inaccessible */
const REGISTRY_FALLBACK_EXTENSIONS = new Set(['md', 'canvas', 'base']);

function getDisplayNameForExtension(extension: string): string {
    const normalized = (extension ?? '').toLowerCase();
    return EXTENSION_DISPLAY_NAMES[normalized] ?? `.${normalized}`;
}

type FileTypeCategory = 'default' | 'registered' | 'unsupported';

function isPluginRegisteredExtension(app: App, extension: string): boolean {
    try {
        const registry = (app as {
            viewRegistry?: {
                typeByExtension?: Record<string, string>;
                typeByExt?: Record<string, string>;
                views?: Record<string, { pluginId?: string; plugin?: { id?: string } }>;
                byType?: Record<string, { pluginId?: string; plugin?: { id?: string } }>;
            };
        }).viewRegistry;
        if (!registry) return false;
        const typeByExtension = registry.typeByExtension ?? registry.typeByExt ?? {};
        const viewType = typeByExtension[(extension ?? '').toLowerCase()];
        if (!viewType || typeof viewType !== 'string') return false;
        const views = registry.views ?? registry.byType ?? {};
        const viewMeta = views[viewType];
        if (!viewMeta) return false;
        return !!(viewMeta.pluginId ?? viewMeta.plugin?.id);
    } catch {
        return false;
    }
}

function getFileTypeCategory(
    app: App,
    extension: string,
    registeredExtensions: Set<string>,
    unsupportedSet: Set<string>
): FileTypeCategory {
    const norm = (extension ?? '').toLowerCase();
    if (unsupportedSet.has(norm)) return 'unsupported';
    if (registeredExtensions.has(norm)) {
        return isPluginRegisteredExtension(app, extension) ? 'registered' : 'default';
    }
    return 'unsupported';
}

function getRegisteredExtensionsFromApp(app: App): Set<string> {
    try {
        const appWithRegistry = app as {
            viewRegistry?: { typeByExtension?: Record<string, unknown>; typeByExt?: Record<string, unknown> };
            workspace?: { viewRegistry?: { typeByExtension?: Record<string, unknown>; typeByExt?: Record<string, unknown> } };
        };
        const registry = appWithRegistry.viewRegistry ?? appWithRegistry.workspace?.viewRegistry;
        if (!registry) return new Set([...REGISTRY_FALLBACK_EXTENSIONS]);
        const typeByExtension = registry.typeByExtension ?? registry.typeByExt ?? {};
        const keys = Object.keys(typeByExtension);
        const result = new Set(keys.map((k) => k.toLowerCase()).filter((k) => k && k !== 'pbs'));
        if (result.size === 0) return new Set([...REGISTRY_FALLBACK_EXTENSIONS]);
        return result;
    } catch {
        return new Set([...REGISTRY_FALLBACK_EXTENSIONS]);
    }
}

function getPluginNameForExtension(app: App, extension: string): string | null {
    try {
        const registry = (app as {
            viewRegistry?: {
                typeByExtension?: Record<string, string>;
                typeByExt?: Record<string, string>;
                views?: Record<string, { pluginId?: string; plugin?: { id?: string } }>;
                byType?: Record<string, { pluginId?: string; plugin?: { id?: string } }>;
            };
        }).viewRegistry;
        if (!registry) return null;
        const typeByExtension = registry.typeByExtension ?? registry.typeByExt ?? {};
        const viewType = typeByExtension[(extension ?? '').toLowerCase()];
        if (!viewType || typeof viewType !== 'string') return null;
        const views = registry.views ?? registry.byType ?? {};
        const viewMeta = views[viewType];
        if (!viewMeta) return null;
        const pluginId = viewMeta.pluginId ?? viewMeta.plugin?.id;
        if (!pluginId) return null;
        const plugin = app.plugins?.plugins?.[pluginId];
        return (plugin as { manifest?: { name?: string } })?.manifest?.name ?? null;
    } catch {
        return null;
    }
}

///////////
///////////

export function insertFileTypeEditor(containerEl: HTMLElement, onScansComplete?: () => void) {
    const sectionEl = containerEl.createDiv('ddc_pb_settings-sub-section');
    const contentEl = sectionEl.createDiv();
    createRoot(contentEl).render(<FileTypeEditor onScansComplete={onScansComplete} />);
}

interface FileTypeItem extends ItemInterface {
    id: string;
    extension: string;
}

interface FileTypeEditorProps {
    onScansComplete?: () => void;
}

export const FileTypeEditor = (props: FileTypeEditorProps) => {
    const { plugin } = getGlobals();
    const { onScansComplete } = props;
    const [visibleFileTypes, setVisibleFileTypes] = React.useState<FileTypeItem[]>(() =>
        (plugin.settings.fileTypes?.visible ?? []).map((ext) => ({ id: ext, extension: ext }))
    );
    const [hiddenFileTypes, setHiddenFileTypes] = React.useState<FileTypeItem[]>(() =>
        (plugin.settings.fileTypes?.hidden ?? []).map((ext) => ({ id: ext, extension: ext }))
    );

    const registeredExtensions = React.useMemo(
        () => getRegisteredExtensionsFromApp(plugin.app),
        [plugin.app]
    );
    const unsupportedSet = React.useMemo(() => {
        const hidden = plugin.settings.fileTypes?.hidden ?? [];
        return new Set(
            hidden
                .map((e) => e.toLowerCase())
                .filter((ext) => !registeredExtensions.has(ext))
        );
    }, [plugin.settings.fileTypes?.hidden, registeredExtensions]);

    const runAddPluginRegisteredTypes = React.useCallback((): boolean => {
        const registered = getRegisteredExtensionsFromApp(plugin.app);
        const allKnown = new Set([
            ...registered,
            ...(plugin.settings.fileTypes?.visible ?? []).map((e) => e.toLowerCase()),
            ...(plugin.settings.fileTypes?.hidden ?? []).map((e) => e.toLowerCase()),
        ]);
        const toAdd: string[] = [];
        for (const ext of registered) {
            const norm = ext.toLowerCase();
            if (!allKnown.has(norm)) {
                toAdd.push(norm);
                allKnown.add(norm);
            }
        }
        if (toAdd.length > 0) {
            plugin.settings.fileTypes.visible = [...(plugin.settings.fileTypes?.visible ?? []), ...toAdd];
            plugin.saveSettings();
            setVisibleFileTypes((prev) => [...prev, ...toAdd.map((ext) => ({ id: ext, extension: ext }))]);
            return true;
        }
        return false;
    }, [plugin]);

    const runScanForNewFileTypes = React.useCallback(() => {
        const vault = plugin.app.vault;
        const files = vault.getFiles();
        const vaultExtensions = new Set<string>();

        for (const file of files) {
            const ext = (file.extension ?? '').toLowerCase();
            if (ext && ext !== 'pbs') {
                vaultExtensions.add(ext);
            }
        }

        const registered = getRegisteredExtensionsFromApp(plugin.app);
        const allKnown = new Set([
            ...registered,
            ...(plugin.settings.fileTypes?.visible ?? []).map((e) => e.toLowerCase()),
            ...(plugin.settings.fileTypes?.hidden ?? []).map((e) => e.toLowerCase()),
        ]);

        const newExtensions: string[] = [];
        for (const ext of vaultExtensions) {
            if (!allKnown.has(ext)) {
                newExtensions.push(ext);
                allKnown.add(ext);
            }
        }

        if (newExtensions.length > 0) {
            const updatedHidden = [...(plugin.settings.fileTypes?.hidden ?? []), ...newExtensions];
            plugin.settings.fileTypes.hidden = updatedHidden;
            plugin.saveSettings();
            setHiddenFileTypes(updatedHidden.map((ext) => ({ id: ext, extension: ext })));
            return true;
        }
        return false;
    }, [plugin]);

    React.useEffect(() => {
        const runOnMount = () => {
            const addedPluginTypes = runAddPluginRegisteredTypes();
            const addedScanTypes = runScanForNewFileTypes();
            if (addedPluginTypes || addedScanTypes) {
                onScansComplete?.();
            }
        };
        setTimeout(runOnMount, 0);
    }, [runAddPluginRegisteredTypes, runScanForNewFileTypes, onScansComplete]);

    const persistVisible = React.useCallback(
        async (items: FileTypeItem[]) => {
            plugin.settings.fileTypes.visible = items.map((item) => item.extension);
            await plugin.saveSettings();
            setVisibleFileTypes(items);
        },
        [plugin]
    );

    const persistHidden = React.useCallback(
        async (items: FileTypeItem[]) => {
            plugin.settings.fileTypes.hidden = items.map((item) => item.extension);
            await plugin.saveSettings();
            setHiddenFileTypes(items);
        },
        [plugin]
    );

    return (
        <>
            <div className="ddc_pb_section-header">
                <div className="ddc_pb_file-type-legend">
                    <span className="ddc_pb_file-type-legend-item ddc_pb_file-type-default">Native</span>
                    <span className="ddc_pb_file-type-legend-sep">Obsidian built-in</span>
                    <span className="ddc_pb_file-type-legend-item ddc_pb_file-type-registered">Plugin</span>
                    <span className="ddc_pb_file-type-legend-sep">Plugin-registered</span>
                    <span className="ddc_pb_file-type-legend-item ddc_pb_file-type-unsupported">Unsupported</span>
                    <span className="ddc_pb_file-type-legend-sep">From vault scan</span>
                </div>
                <div className="ddc_pb_file-type-section">
                    <h3>Visible file types</h3>
                    <p className="ddc_pb_file-type-description">
                        Files with these types appear in the project browser view and pages menu.
                    </p>
                    <ReactSortable
                        list={visibleFileTypes}
                        setList={persistVisible}
                        group="fileTypes"
                        animation={200}
                        className={classNames([
                            'ddc_pb_states-ctrl',
                            'ddc_pb_visible-states-ctrl',
                        ])}
                    >
                        {visibleFileTypes.map((item) => {
                            const category = getFileTypeCategory(plugin.app, item.extension, registeredExtensions, unsupportedSet);
                            const pluginName = getPluginNameForExtension(plugin.app, item.extension);
                            const displayName = getDisplayNameForExtension(item.extension);
                            return (
                            <div
                                key={item.id}
                                className={classNames(
                                    'ddc_pb_draggable',
                                    `ddc_pb_file-type-${category}`,
                                    category === 'default' && CORE_EXTENSIONS_FULL_PRIMARY.has(item.extension.toLowerCase()) && 'ddc_pb_file-type-default-full'
                                )}
                            >
                                <div className="ddc_pb_draggable-label ddc_pb_hidden-item-label">
                                    <GripVertical className="ddc_pb_icon ddc_pb_drag-icon" />
                                    <span className="ddc_pb_hidden-item-text">
                                        <span className="ddc_pb_hidden-item-ext">{displayName}</span>
                                        {pluginName && (
                                            <span className="ddc_pb_hidden-item-plugin">via {pluginName}</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                            );
                        })}
                    </ReactSortable>
                </div>

                <div className="ddc_pb_file-type-section">
                    <h3>Hidden file types</h3>
                    <p className="ddc_pb_file-type-description">
                        Hidden file types do not appear in the project browser view or the project
                        pages menu.
                    </p>
                    <ReactSortable
                        list={hiddenFileTypes}
                        setList={persistHidden}
                        group="fileTypes"
                        animation={200}
                        className={classNames([
                            'ddc_pb_states-ctrl',
                            'ddc_pb_hidden-states-ctrl',
                        ])}
                    >
                        {hiddenFileTypes.map((item) => {
                            const displayName = getDisplayNameForExtension(item.extension);
                            const pluginName = getPluginNameForExtension(plugin.app, item.extension);
                            const category = getFileTypeCategory(plugin.app, item.extension, registeredExtensions, unsupportedSet);
                            return (
                                <div
                                    key={item.id}
                                    className={classNames(
                                        'ddc_pb_draggable',
                                        `ddc_pb_file-type-${category}`,
                                        category === 'default' && CORE_EXTENSIONS_FULL_PRIMARY.has(item.extension.toLowerCase()) && 'ddc_pb_file-type-default-full'
                                    )}
                                >
                                    <div className="ddc_pb_draggable-label ddc_pb_hidden-item-label">
                                        <GripVertical className="ddc_pb_icon ddc_pb_drag-icon" />
                                        <span className="ddc_pb_hidden-item-text">
                                            <span className="ddc_pb_hidden-item-ext">{displayName}</span>
                                            {pluginName && (
                                                <span className="ddc_pb_hidden-item-plugin">via {pluginName}</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </ReactSortable>
                </div>
            </div>
        </>
    );
};
