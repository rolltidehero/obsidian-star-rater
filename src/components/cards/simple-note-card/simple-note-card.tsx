import './simple-note-card.scss';
import { TFile } from "obsidian";
import * as React from "react";
import { getFileDisplayNameParts } from 'src/logic/get-file-display-name';
import { NoteCardBase } from '../note-card-base/note-card-base';

/////////
/////////

interface SimpleNoteCardProps {
    file: TFile,
}

export const SimpleNoteCard = (props: SimpleNoteCardProps) => {
    const { basename, extension } = getFileDisplayNameParts(props.file);
    const [articleRotation] = React.useState(Math.random() * 4 - 2);
    const [blurbRotation] = React.useState(Math.random() * 2 - 1);
    
    return <>
        <NoteCardBase
            file={props.file}
            className="ddc_pb_simple-note-card"
            rotation={articleRotation}
        >
            <h3
                style={{
                    rotate: blurbRotation + 'deg',
                }}
            >
                {basename}
                {extension && <span className="ddc_pb_file-ext-faint">{extension}</span>}
            </h3>
        </NoteCardBase>
    </>
}








