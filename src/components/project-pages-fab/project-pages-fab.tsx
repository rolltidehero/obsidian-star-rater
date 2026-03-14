import './project-pages-fab.scss';
import { TFile, TFolder } from 'obsidian';
import * as React from 'react';
import { FileStack, Folder } from 'lucide-react';
import classNames from 'classnames';
import { getItemsInFolder } from 'src/logic/folder-processes';

//////////
//////////

interface ProjectPagesFABProps {
    projectFolder: TFolder;
    currentFile: TFile;
    onNavigateToPage: (file: TFile) => void;
    onOpenProjectFolder: (folder: TFolder) => void;
}

export const ProjectPagesFAB = (props: ProjectPagesFABProps) => {
    const [menuIsOpen, setMenuIsOpen] = React.useState(false);
    const fabContainerRef = React.useRef<HTMLDivElement>(null);

    const pagesInProject = React.useMemo(() => {
        const items = getItemsInFolder(props.projectFolder);
        if (!items) return [];

        const pageFiles = items
            .filter((item): item is TFile => item instanceof TFile)
            .filter((file) => file.extension.toLowerCase() !== 'pbs');

        return [...pageFiles].sort((a, b) => a.name.localeCompare(b.name));
    }, [props.projectFolder]);

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

    function handleOpenProjectFolderClick() {
        props.onOpenProjectFolder(props.projectFolder);
        setMenuIsOpen(false);
    }

    return (
        <div className="ddc_pb_project-pages-fab" ref={fabContainerRef}>
            {menuIsOpen && (
                <div className="ddc_pb_project-pages-fab__page-buttons">
                    {pagesInProject.map((file) => {
                        const isCurrentPage = file.path === props.currentFile.path;
                        return (
                            <button
                                key={file.path}
                                className={classNames(
                                    'ddc_pb_project-pages-fab__page-button',
                                    isCurrentPage && 'ddc_pb_project-pages-fab__page-button--active'
                                )}
                                onClick={isCurrentPage ? undefined : () => handlePageClick(file)}
                                disabled={isCurrentPage}
                            >
                                {file.basename}
                            </button>
                        );
                    })}
                    <button
                        className="ddc_pb_project-pages-fab__folder-button"
                        onClick={handleOpenProjectFolderClick}
                        title={`Open ${props.projectFolder.name} in project browser`}
                    >
                        <Folder size={16} />
                        <span className="ddc_pb_project-pages-fab__folder-button-label">
                            {props.projectFolder.name}
                        </span>
                    </button>
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
