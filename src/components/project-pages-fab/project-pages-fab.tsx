import './project-pages-fab.scss';
import { TFile, TFolder } from 'obsidian';
import * as React from 'react';
import { FileStack } from 'lucide-react';
import classNames from 'classnames';
import { getItemsInFolder } from 'src/logic/folder-processes';

//////////
//////////

interface ProjectPagesFABProps {
    projectFolder: TFolder;
    currentFile: TFile;
    onNavigateToPage: (file: TFile) => void;
}

export const ProjectPagesFAB = (props: ProjectPagesFABProps) => {
    const [menuIsOpen, setMenuIsOpen] = React.useState(false);
    const fabContainerRef = React.useRef<HTMLDivElement>(null);

    const otherPagesInProject = React.useMemo(() => {
        const items = getItemsInFolder(props.projectFolder);
        if (!items) return [];

        const pageFiles = items
            .filter((item): item is TFile => item instanceof TFile)
            .filter((file) => file.extension.toLowerCase() !== 'pbs')
            .filter((file) => file.path !== props.currentFile.path);

        return [...pageFiles].sort((a, b) => a.name.localeCompare(b.name));
    }, [props.projectFolder, props.currentFile.path]);

    React.useEffect(() => {
        function handleClickOutside(event: PointerEvent) {
            if (fabContainerRef.current && !fabContainerRef.current.contains(event.target as Node)) {
                setMenuIsOpen(false);
            }
        }

        document.addEventListener('pointerdown', handleClickOutside);
        return () => document.removeEventListener('pointerdown', handleClickOutside);
    }, []);

    function handleFABClick() {
        setMenuIsOpen((prev) => !prev);
    }

    function handlePageClick(file: TFile) {
        props.onNavigateToPage(file);
        setMenuIsOpen(false);
    }

    return (
        <div className="ddc_pb_project-pages-fab" ref={fabContainerRef}>
            {menuIsOpen && (
                <div className="ddc_pb_project-pages-fab__page-buttons">
                    {otherPagesInProject.map((file) => (
                        <button
                            key={file.path}
                            className="ddc_pb_project-pages-fab__page-button"
                            onClick={() => handlePageClick(file)}
                        >
                            {file.basename}
                        </button>
                    ))}
                </div>
            )}
            <button
                className={classNames(
                    'ddc_pb_project-pages-fab__main-button',
                    menuIsOpen && 'ddc_pb_active'
                )}
                onClick={handleFABClick}
                title="Project pages"
            >
                <FileStack size={24} />
            </button>
        </div>
    );
};
