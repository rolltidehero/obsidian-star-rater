/**
 * Minimal plugin stub for tests that import src/main.
 * Avoids loading the full plugin with all its dependencies.
 */

const { Plugin } = require('./obsidianMock');

class ProjectBrowserPlugin extends Plugin {
  constructor() {
    super();
    this.settings = {};
    this.fileDependants = {};
  }

  addGlobalFileDependant() {}
  removeFileDependant() {}
  refreshFileDependants() {}
}

module.exports = ProjectBrowserPlugin;
