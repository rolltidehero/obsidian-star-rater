import { describe, expect, test, jest } from "@jest/globals";

describe("getFileDisplayName", () => {
  test("returns first alias when useAliases enabled and aliases exist", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({ plugin: { settings: { useAliases: true } } }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => ["Alias Name"],
      }));
      const { getFileDisplayName } = require("./get-file-display-name");
      const file = { basename: "Base" } as any;
      expect(getFileDisplayName(file)).toBe("Alias Name");
    });
  });

  test("returns basename when useAliases disabled", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({ plugin: { settings: { useAliases: false } } }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => ["Alias Name"],
      }));
      const { getFileDisplayName } = require("./get-file-display-name");
      const file = { basename: "Base" } as any;
      expect(getFileDisplayName(file)).toBe("Base");
    });
  });

  test("returns basename when no aliases", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({ plugin: { settings: { useAliases: true } } }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => null,
      }));
      const { getFileDisplayName } = require("./get-file-display-name");
      const file = { basename: "Base" } as any;
      expect(getFileDisplayName(file)).toBe("Base");
    });
  });

  test("returns file.name for non-md file when showFileExtForNonMdFiles enabled", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({
          plugin: { settings: { useAliases: false, showFileExtForNonMdFiles: true } },
        }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => null,
      }));
      const { getFileDisplayName } = require("./get-file-display-name");
      const file = { basename: "document", name: "document.pdf", extension: "pdf" } as any;
      expect(getFileDisplayName(file)).toBe("document.pdf");
    });
  });

  test("returns basename for non-md file when showFileExtForNonMdFiles disabled", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({
        getGlobals: () => ({
          plugin: { settings: { useAliases: false, showFileExtForNonMdFiles: false } },
        }),
      }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileAliases: () => null,
      }));
      const { getFileDisplayName } = require("./get-file-display-name");
      const file = { basename: "document", name: "document.pdf", extension: "pdf" } as any;
      expect(getFileDisplayName(file)).toBe("document");
    });
  });
});


