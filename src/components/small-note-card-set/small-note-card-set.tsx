import './small-note-card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { SmallNoteCard } from '../cards/small-note-card/small-note-card';
import { SmallProjectCard } from '../cards/small-project-card/small-project-card';

/////////
/////////

interface SmallNoteCardSetProps {
    files: TAbstractFile[],
}
export const SmallNoteCardSet = (props: SmallNoteCardSetProps) => {

    const cards = props.files.map((item) => {
        if (item instanceof TFolder) {
            return <SmallProjectCard folder={item} key={item.path} />;
        }
        return <SmallNoteCard file={item} key={item.path} />;
    });

    return <>
        <div
            className = 'ddc_pb_small-note-card-set'
        >
            {cards}
        </div>
    </>
}

///////


