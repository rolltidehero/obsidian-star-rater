/**
 * Stubs for Obsidian API used in tests.
 * Extracted from inline mocks to centralize and support component tests.
 */

class TAbstractFile {}

class TFile extends TAbstractFile {
  constructor(name = 'file.md', ctime = 0, mtime = 0) {
    super();
    this.name = name;
    this.basename = name.replace(/\.[^.]+$/, '');
    this.extension = (name.split('.').pop() || '').toLowerCase();
    this.stat = { ctime, mtime };
  }
}

class TFolder extends TAbstractFile {
  constructor(name = 'folder') {
    super();
    this.name = name;
    this.children = [];
    this.path = '';
    this.vault = null;
  }
}

class Plugin {
  constructor() {
    this.app = {
      vault: { on: () => {}, off: () => {} },
    };
  }
}

const noop = () => {};
const noopReturn = (x) => x;

const Notice = jest.fn();
const Modal = jest.fn().mockImplementation(() => ({ open: noop, close: noop }));
const Menu = jest.fn().mockImplementation(() => ({
  addItem: jest.fn().mockReturnThis(),
  addSeparator: jest.fn().mockReturnThis(),
}));
const MenuItem = jest.fn();
const Setting = jest.fn().mockImplementation(() => ({
  addText: jest.fn().mockReturnThis(),
  addDropdown: jest.fn().mockReturnThis(),
  addToggle: jest.fn().mockReturnThis(),
  setValue: jest.fn().mockReturnThis(),
  onChange: jest.fn().mockReturnThis(),
}));
const createVaultStub = () => {
  const rootFolder = new TFolder('');
  rootFolder.path = '';
  rootFolder.children = [];
  return {
    getAbstractFileByPath: noopReturn,
    getFolderByPath: jest.fn().mockReturnValue(null),
    getRoot: jest.fn().mockReturnValue(rootFolder),
    create: noop,
    modify: noop,
    on: noop,
    off: noop,
  };
};

const App = jest.fn().mockImplementation(() => ({
  vault: createVaultStub(),
}));
const Vault = jest.fn();
const PluginSettingTab = jest.fn();
const ToggleComponent = jest.fn();
const TextComponent = jest.fn();
const Editor = jest.fn();
const View = jest.fn();
const ItemView = jest.fn();
const MarkdownView = jest.fn();
const FileView = jest.fn();
const WorkspaceLeaf = jest.fn();
const normalizePath = (p) => p;

module.exports = {
  TAbstractFile,
  TFile,
  TFolder,
  Plugin,
  Notice,
  Modal,
  Menu,
  MenuItem,
  Setting,
  App,
  Vault,
  PluginSettingTab,
  ToggleComponent,
  TextComponent,
  Editor,
  View,
  ItemView,
  MarkdownView,
  FileView,
  WorkspaceLeaf,
  normalizePath,
  // Minimal stubs for types that may be imported
  DataWriteOptions: {},
  FileManager: jest.fn(),
  FrontMatterCache: {},
  CachedMetadata: {},
  ViewState: {},
  ViewStateResult: {},
};
