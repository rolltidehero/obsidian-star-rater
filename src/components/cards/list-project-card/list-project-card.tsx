import './list-project-card.scss';
import { TFolder } from "obsidian";
import * as React from "react";
import { ProjectCardBase } from '../project-card-base/project-card-base';

/////////
/////////

interface ListProjectCardProps {
    folder: TFolder,
}

export const ListProjectCard = (props: ListProjectCardProps) => {
    const name = props.folder.name;

    return (
        <ProjectCardBase
            folder={props.folder}
            className="ddc_pb_list-project-card"
        >
            <h3>
                {name}
            </h3>
        </ProjectCardBase>
    );
};
