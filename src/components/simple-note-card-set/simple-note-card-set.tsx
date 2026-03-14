import './simple-note-card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { SimpleNoteCard } from '../cards/simple-note-card/simple-note-card';
import { SimpleProjectCard } from '../cards/simple-project-card/simple-project-card';

/////////
/////////

interface SimpleNoteCardSetProps {
    files: TAbstractFile[],
}
export const SimpleNoteCardSet = (props: SimpleNoteCardSetProps) => {

    const cards = props.files.map((item) => {
        if (item instanceof TFolder) {
            return <SimpleProjectCard folder={item} key={item.path} />;
        }
        return <SimpleNoteCard file={item} key={item.path} />;
    });

    return <>
        <div
            className = 'ddc_pb_simple-note-card-set'
        >
            {cards}
        </div>
    </>
}

///////


