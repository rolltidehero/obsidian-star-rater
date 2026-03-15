import classNames from 'classnames';
import './note-card-base.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { registerFileContextMenu } from 'src/context-menus/file-context-menu';
import { CardBrowserContext } from 'src/components/card-browser/card-browser';
import { getGlobals } from 'src/logic/stores';
import { openFileInBackgroundTab, openFileInSameLeaf } from 'src/logic/file-access-processes';
import { getFilePrioritySettings } from 'src/logic/frontmatter-processes';

/////////
/////////

const FILE_TYPE_LABELS: Record<string, string> = {
    canvas: 'CANVAS',
    base: 'BASE',
    pdf: 'PDF',
    png: 'PNG',
    jpg: 'JPEG',
    jpeg: 'JPEG',
    gif: 'GIF',
    svg: 'SVG',
    webp: 'WEBP',
    avif: 'AVIF',
    bmp: 'BMP',
    flac: 'FLAC',
    m4a: 'M4A',
    mp3: 'MP3',
    ogg: 'OGG',
    wav: 'WAV',
    webm: 'WEBM',
    '3gp': '3GP',
    mkv: 'MKV',
    mov: 'MOV',
    mp4: 'MP4',
    ogv: 'OGV',
};

function getFileTypeLabel(extension: string): string | null {
    const ext = (extension ?? '').toLowerCase();
    if (ext === 'md') return null;
    return FILE_TYPE_LABELS[ext] ?? ext.toUpperCase();
}

export interface NoteCardBaseProps {
    file: TFile,
    className?: string,
    children?: React.ReactNode,
    rotation?: number,
    titleRotation?: number,
    contentRotation?: number,
}

export const NoteCardBase = (props: NoteCardBaseProps) => {
    const {plugin} = getGlobals();
    const cardBrowserContext = React.useContext(CardBrowserContext);
    const noteRef = React.useRef(null);

    const prioritySettings = getFilePrioritySettings(props.file);
    const showSettleTransition = props.file.path === cardBrowserContext.lastTouchedFilePath;
    const fileTypeLabel = getFileTypeLabel(props.file.extension ?? '');

    React.useEffect( () => {
        if(!plugin) return;
        if(noteRef.current) registerFileContextMenu({
            fileButtonEl: noteRef.current,
            file: props.file,
            onFileChange: () => {
                cardBrowserContext.rememberLastTouchedFile(props.file);
            },
        });
    }, [])
    
    return <>
        <article
            ref = {noteRef}
            className = {classNames([
                'ddc_pb_note-card-base',
                props.className,
                prioritySettings?.name.includes('High') && 'ddc_pb_high-priority',
                prioritySettings?.name.includes('Low') && 'ddc_pb_low-priority',
                showSettleTransition && 'ddc_pb_closing'
            ])}
            onClick = { (event) => {
                if (event.ctrlKey || event.metaKey) {
                    openFileInBackgroundTab(props.file)
                } else {
                    cardBrowserContext.rememberLastTouchedFile(props.file);
                    openFileInSameLeaf(props.file)
                }
            }}
            style = {{
                rotate: props.rotation ? props.rotation + 'deg' : undefined,
            }}
        >
            {fileTypeLabel && (
                <span className="ddc_pb_note-card-type-label" aria-hidden>
                    {fileTypeLabel}
                </span>
            )}
            {props.children}
        </article>
    </>
} 