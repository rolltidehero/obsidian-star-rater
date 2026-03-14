import './list-note-card-set.scss';
import { TAbstractFile, TFile, TFolder } from "obsidian";
import * as React from "react";
import { ListNoteCard } from '../cards/list-note-card/list-note-card';
import { ListProjectCard } from '../cards/list-project-card/list-project-card';

/////////
/////////

interface ListNoteCardSetProps {
    files: TAbstractFile[],
}
export const ListNoteCardSet = (props: ListNoteCardSetProps) => {

    const cards = props.files.map((item) => {
        if (item instanceof TFolder) {
            return <ListProjectCard folder={item} key={item.path} />;
        }
        return <ListNoteCard file={item} key={item.path} />;
    });

    return <>
        <div
            className = 'ddc_pb_list-note-card-set'
        >
            {cards}
        </div>
    </>
}

///////


