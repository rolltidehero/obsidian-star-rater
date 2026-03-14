import './markdown-view-mods.scss';
import { ItemView, MarkdownView, Menu, MenuItem, TFile, TFolder, View } from "obsidian";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { StateMenu } from 'src/components/state-menu/state-menu';
import { ProjectPagesFAB } from 'src/components/project-pages-fab/project-pages-fab';
import { getGlobals, getStateMenuSettings } from 'src/logic/stores';
import { toggleStateMenu } from 'src/logic/toggle-state-menu';
import { openStateMenuIfClosed } from 'src/logic/toggle-state-menu';
import { openFileInSameLeaf } from 'src/logic/file-access-processes';
import { getFolderSettings } from 'src/utils/file-manipulation';
import { CARD_BROWSER_VIEW_TYPE } from 'src/views/card-browser-view/card-browser-view';

//////////
//////////

const stateMenuContainerClassName = 'ddc_pb_state-menu-container';
const projectPagesFabContainerClassName = 'ddc_pb_project-pages-fab-container';

interface ProjectPagesFabRoot {
    unmount: () => void;
    render: (element: React.ReactElement) => void;
}

//////////

export function registerMarkdownViewMods() {
    const {plugin} = getGlobals();

    addViewMenuOptions();

    // NOTE: Opening a different file in the same leaf counts as an active-leaf-change, but the header gets replaced, it updates.
    plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', (leaf) => {
        if(!leaf) return;

		const viewType = leaf.view.getViewType();
		if(viewType === 'markdown') {
            addStateHeader();
            addOrRemoveProjectPagesFAB();
        }
	}));
}

function addViewMenuOptions() {
    const {plugin} = getGlobals();
    plugin.app.workspace.on('file-menu', (menu, file, source) => {
        if(source !== 'more-options') return;
        menu.addItem((item: MenuItem) => {
            item.setTitle('Toggle State Menu');
            item.setChecked(getStateMenuSettings().visible);
            item.onClick(toggleStateMenu);
            item.setSection('pane');
            item.setIcon('file-check');
        });
    });
}

function addActionButtons(view: View) {
    // TODO: Currently adding an extra button every time the view is clicked in.
    if (!(view instanceof MarkdownView)) return;
    const element = view.addAction('file-stack', 'Toggle State Menu', toggleStateMenu);
}

function addStateHeader() {
    const {plugin} = getGlobals();
    let { workspace } = plugin.app;
    let leaf = workspace.getActiveViewOfType(ItemView)?.leaf;
    if(!leaf) return;

    const activeFile = workspace.getActiveFile();
    if(!activeFile) return;

    const containerEl = leaf.view.containerEl;
    let stateMenuContainerEl = containerEl.find(`.${stateMenuContainerClassName}`)
    if(!stateMenuContainerEl) {
        const headerEl = containerEl.children[0];
        stateMenuContainerEl = headerEl.createDiv(stateMenuContainerClassName);
        headerEl.after(stateMenuContainerEl);
        let stateMenuRoot = createRoot(stateMenuContainerEl);
        stateMenuRoot.render(
            <StateMenu file={activeFile}/>
        )
    }
}

async function addOrRemoveProjectPagesFAB() {
    const {plugin} = getGlobals();
    const workspace = plugin.app.workspace;
    const leaf = workspace.getActiveViewOfType(ItemView)?.leaf;
    if (!leaf) return;

    const activeFile = workspace.getActiveFile();
    const containerEl = leaf.view.containerEl;
    let fabContainerEl = containerEl.find(`.${projectPagesFabContainerClassName}`);

    const parentFolder = activeFile?.parent;
    const parentIsProject = parentFolder instanceof TFolder
        ? (await getFolderSettings(plugin.app.vault, parentFolder)).isProject === true
        : false;

    if (!activeFile || !parentIsProject) {
        removeProjectPagesFAB(containerEl);
        return;
    }

    function onNavigateToPage(file: TFile) {
        openFileInSameLeaf(file);
        openStateMenuIfClosed();
    }

    function onOpenProjectFolder(folder: TFolder) {
        const activeLeaf = workspace.getMostRecentLeaf();
        if (activeLeaf) {
            activeLeaf.setViewState({
                type: CARD_BROWSER_VIEW_TYPE,
                state: { path: folder.path },
            });
        }
    }

    if (!fabContainerEl) {
        fabContainerEl = containerEl.createDiv(projectPagesFabContainerClassName);
        containerEl.appendChild(fabContainerEl);
        const root = createRoot(fabContainerEl);
        (fabContainerEl as HTMLElement & { __projectPagesFabRoot?: ProjectPagesFabRoot }).__projectPagesFabRoot = root;
    }

    const root = (fabContainerEl as HTMLElement & { __projectPagesFabRoot?: ProjectPagesFabRoot }).__projectPagesFabRoot;
    if (root) {
        root.render(
            <ProjectPagesFAB
                projectFolder={parentFolder}
                currentFile={activeFile}
                onNavigateToPage={onNavigateToPage}
                onOpenProjectFolder={onOpenProjectFolder}
            />
        );
    }
}

function removeProjectPagesFAB(containerEl: HTMLElement) {
    const fabContainerEl = containerEl.find(`.${projectPagesFabContainerClassName}`);
    if (!fabContainerEl) return;

    const el = fabContainerEl as HTMLElement & { __projectPagesFabRoot?: ProjectPagesFabRoot };
    if (el.__projectPagesFabRoot) {
        el.__projectPagesFabRoot.unmount();
        delete el.__projectPagesFabRoot;
    }
    fabContainerEl.remove();
}
