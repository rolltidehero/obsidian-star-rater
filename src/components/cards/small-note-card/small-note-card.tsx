import './small-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileDisplayNameParts } from 'src/logic/get-file-display-name';
import { NoteCardBase } from '../note-card-base/note-card-base';

/////////
/////////

interface SmallNoteCardProps {
    file: TFile,
}

export const SmallNoteCard = (props: SmallNoteCardProps) => {
    const { basename, extension } = getFileDisplayNameParts(props.file);
    const [articleRotation] = React.useState(Math.random() * 4 - 2);

    return <>
        <NoteCardBase
            file={props.file}
            className="ddc_pb_small-note-card"
            rotation={articleRotation}
        >
            <h3>
                {basename}
                {extension && <span className="ddc_pb_file-ext-faint">{extension}</span>}
            </h3>
        </NoteCardBase>
    </>
}








