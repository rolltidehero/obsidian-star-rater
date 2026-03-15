import { createRoot } from 'react-dom/client';
import * as React from 'react';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { GripVertical, Search, Trash } from 'lucide-react';
import classNames from 'classnames';
import { Notice } from 'obsidian';
import { getGlobals } from 'src/logic/stores';
import './file-type-editor.scss';

///////////
///////////

const EXTENSION_DISPLAY_NAMES: Record<string, string> = {
    md: 'Note',
    canvas: 'Canvas',
    base: 'Base',
    pdf: 'PDF',
    png: 'PNG',
    jpg: 'JPEG',
    jpeg: 'JPEG',
    gif: 'GIF',
    svg: 'SVG',
    webp: 'WebP',
    avif: 'AVIF',
    bmp: 'BMP',
    flac: 'FLAC',
    m4a: 'M4A',
    mp3: 'MP3',
    ogg: 'OGG',
    wav: 'WAV',
    webm: 'WebM',
    '3gp': '3GP',
    mkv: 'MKV',
    mov: 'MOV',
    mp4: 'MP4',
    ogv: 'OGV',
};

const OBSIDIAN_NATIVE_EXTENSIONS = new Set([
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
]);

function getDisplayNameForExtension(extension: string): string {
    const normalized = (extension ?? '').toLowerCase();
    return EXTENSION_DISPLAY_NAMES[normalized] ?? `.${normalized}`;
}

///////////
///////////

export function insertFileTypeEditor(containerEl: HTMLElement) {
    const sectionEl = containerEl.createDiv('ddc_pb_settings-sub-section');
    const contentEl = sectionEl.createDiv();
    createRoot(contentEl).render(<FileTypeEditor />);
}

interface FileTypeItem extends ItemInterface {
    id: string;
    extension: string;
}

interface FileTypeEditorProps {}

export const FileTypeEditor = (props: FileTypeEditorProps) => {
    const { plugin } = getGlobals();
    const [visibleFileTypes, setVisibleFileTypes] = React.useState<FileTypeItem[]>(() =>
        (plugin.settings.fileTypes?.visible ?? []).map((ext) => ({ id: ext, extension: ext }))
    );
    const [hiddenFileTypes, setHiddenFileTypes] = React.useState<FileTypeItem[]>(() =>
        (plugin.settings.fileTypes?.hidden ?? []).map((ext) => ({ id: ext, extension: ext }))
    );
    const [isDragging, setIsDragging] = React.useState(false);
    const deletedFileTypes: FileTypeItem[] = [];

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

    const handleScanForNewFileTypes = React.useCallback(async () => {
        const vault = plugin.app.vault;
        const files = vault.getFiles();
        const vaultExtensions = new Set<string>();

        for (const file of files) {
            const ext = (file.extension ?? '').toLowerCase();
            if (ext && ext !== 'pbs') {
                vaultExtensions.add(ext);
            }
        }

        const allKnown = new Set([
            ...OBSIDIAN_NATIVE_EXTENSIONS,
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

        if (newExtensions.length === 0) {
            new Notice('No new file types found.');
            return;
        }

        const updatedHidden = [...(plugin.settings.fileTypes?.hidden ?? []), ...newExtensions];
        plugin.settings.fileTypes.hidden = updatedHidden;
        await plugin.saveSettings();
        setHiddenFileTypes(updatedHidden.map((ext) => ({ id: ext, extension: ext })));
        new Notice(`Added ${newExtensions.length} new file type(s) to hidden list.`);
    }, [plugin]);

    return (
        <>
            <div className="ddc_pb_section-header">
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
                        onStart={() => setIsDragging(true)}
                        onEnd={() => setIsDragging(false)}
                    >
                        {visibleFileTypes.map((item) => (
                            <div key={item.id} className="ddc_pb_draggable">
                                <div className="ddc_pb_draggable-label">
                                    <GripVertical className="ddc_pb_icon ddc_pb_drag-icon" />
                                    {getDisplayNameForExtension(item.extension)}
                                </div>
                            </div>
                        ))}
                    </ReactSortable>
                </div>

                <div className="ddc_pb_file-type-section">
                    <h3>Hidden file types</h3>
                    <p className="ddc_pb_file-type-description">
                        Hidden file types do not appear in the project browser view or the project
                        pages menu.
                    </p>
                    <div className="ddc_pb_states-button-group ddc_pb_file-type-scan-row">
                        <button
                            type="button"
                            className="ddc_pb_scan-button"
                            onClick={handleScanForNewFileTypes}
                        >
                            <Search size={14} />
                            <span>Scan for new file types</span>
                        </button>
                    </div>
                    <ReactSortable
                        list={hiddenFileTypes}
                        setList={persistHidden}
                        group="fileTypes"
                        animation={200}
                        className={classNames([
                            'ddc_pb_states-ctrl',
                            'ddc_pb_hidden-states-ctrl',
                        ])}
                        onStart={() => setIsDragging(true)}
                        onEnd={() => setIsDragging(false)}
                    >
                        {hiddenFileTypes.map((item) => (
                            <div key={item.id} className="ddc_pb_draggable">
                                <div className="ddc_pb_draggable-label">
                                    <GripVertical className="ddc_pb_icon ddc_pb_drag-icon" />
                                    .{item.extension}
                                </div>
                            </div>
                        ))}
                    </ReactSortable>
                </div>

                <div
                    className={classNames([
                        'ddc_pb_states-section',
                        'ddc_pb_dropzone-section',
                        isDragging && 'ddc_pb_visible',
                    ])}
                >
                    <h3>
                        <Trash className="ddc_pb_delete-icon" />
                        Drag here to delete
                    </h3>
                    <ReactSortable
                        list={deletedFileTypes}
                        setList={() => {}}
                        group="fileTypes"
                        animation={200}
                        className={classNames([
                            'ddc_pb_states-ctrl',
                            'ddc_pb_dropzone-ctrl',
                        ])}
                    />
                </div>
            </div>
        </>
    );
};
