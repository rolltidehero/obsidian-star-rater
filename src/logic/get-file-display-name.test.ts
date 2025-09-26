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
});


