import './list-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileDisplayNameParts } from 'src/logic/get-file-display-name';
import { NoteCardBase } from '../note-card-base/note-card-base';

/////////
/////////

interface ListNoteCardProps {
    file: TFile,
}

export const ListNoteCard = (props: ListNoteCardProps) => {
    const { basename, extension } = getFileDisplayNameParts(props.file);

    return <>
        <NoteCardBase
            file={props.file}
            className="ddc_pb_list-note-card"
        >
            <h3>
                {basename}
                {extension && <span className="ddc_pb_file-ext-faint">{extension}</span>}
            </h3>
        </NoteCardBase>
    </>
}








