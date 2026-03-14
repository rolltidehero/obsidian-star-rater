import './small-project-card.scss';
import { TFolder } from "obsidian";
import * as React from "react";
import { ProjectCardBase } from '../project-card-base/project-card-base';

/////////
/////////

interface SmallProjectCardProps {
    folder: TFolder,
}

export const SmallProjectCard = (props: SmallProjectCardProps) => {
    const name = props.folder.name;
    const [articleRotation] = React.useState(Math.random() * 4 - 2);

    return (
        <ProjectCardBase
            folder={props.folder}
            className="ddc_pb_small-project-card"
            rotation={articleRotation}
        >
            <h3>
                {name}
            </h3>
        </ProjectCardBase>
    );
};
