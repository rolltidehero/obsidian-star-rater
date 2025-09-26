import { describe, expect, test, jest } from "@jest/globals";

// Mock obsidian types
jest.mock("obsidian", () => {
  class TFile {
    basename = "file";
    extension = "md";
  }
  return { TFile };
}, { virtual: true });

const makeGlobals = (visible: any[], hidden: any[]) => ({
  plugin: {
    settings: {
      states: { visible, hidden },
    },
  },
});

describe("offsetState", () => {
  test("moves to next state with clamp when cycle=false", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({ getGlobals: () => makeGlobals(
        [ { name: "Todo" }, { name: "Doing" } ],
        [ { name: "Done" } ]
      ) }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileStateSettings: () => ({ name: "Todo" }),
      }));
      const { offsetState } = require("./offset-state");
      const file = {} as any;
      const next = offsetState(file, 1, false);
      expect(next.name).toBe("Doing");
      const clamp = offsetState(file, 10, false);
      expect(clamp.name).toBe("Done");
    });
  });

  test("wraps around when cycle=true", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({ getGlobals: () => makeGlobals(
        [ { name: "Todo" }, { name: "Doing" } ],
        [ { name: "Done" } ]
      ) }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileStateSettings: () => ({ name: "Done" }),
      }));
      const { offsetState } = require("./offset-state");
      const file = {} as any;
      const wrapped = offsetState(file, 1, true);
      expect(wrapped.name).toBe("Todo");
      const wrappedNeg = offsetState(file, -1, true);
      expect(wrappedNeg.name).toBe("Doing");
    });
  });

  test("no current state selects first or last depending on offset sign", () => {
    jest.isolateModules(() => {
      jest.doMock("./stores", () => ({ getGlobals: () => makeGlobals(
        [ { name: "A" }, { name: "B" } ],
        [ { name: "C" } ]
      ) }));
      jest.doMock("./frontmatter-processes", () => ({
        getFileStateSettings: () => null,
      }));
      const { offsetState } = require("./offset-state");
      const file = {} as any;
      expect(offsetState(file, 1, false).name).toBe("A");
      expect(offsetState(file, -1, false).name).toBe("C");
    });
  });
});


