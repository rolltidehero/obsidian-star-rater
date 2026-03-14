import './detailed-note-card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { DetailedNoteCard } from "../cards/detailed-note-card/detailed-note-card";
import { DetailedProjectCard } from "../cards/detailed-project-card/detailed-project-card";
import { CardBrowserContext } from '../card-browser/card-browser';

/////////
/////////

interface DetailedNoteCardSetProps {
    files: TAbstractFile[],
}
export const DetailedNoteCardSet = (props: DetailedNoteCardSetProps) => {
    
    const cards = props.files.map((item) => {
        if (item instanceof TFolder) {
            return <DetailedProjectCard folder={item} key={item.path} />;
        }
        return <DetailedNoteCard file={item} key={item.path} />;
    });

    return <>
        <div
            className = 'ddc_pb_detailed-note-card-set'
        >
            {cards}
        </div>
    </>
}

///////


