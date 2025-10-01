import { describe, expect, test, jest } from "@jest/globals";

// Provide a virtual mock for the 'obsidian' module so importing code works in tests
jest.mock("obsidian", () => {
  class TAbstractFile {}
  class TFile extends TAbstractFile {
    name: string;
    basename: string;
    stat: { ctime: number; mtime: number };
    extension: string;
    constructor(name = "file.md", ctime = 0, mtime = 0) {
      super();
      this.name = name;
      this.basename = name.replace(/\.[^.]+$/, "");
      this.extension = (name.split(".").pop() || "").toLowerCase();
      this.stat = { ctime, mtime } as any;
    }
  }
  class TFolder extends TAbstractFile {
    name: string;
    children: TAbstractFile[] = [];
    path = "";
    vault: any;
    constructor(name = "folder") {
      super();
      this.name = name;
    }
  }
  return { TAbstractFile, TFile, TFolder };
}, { virtual: true });

// Now import types and the functions under test
import { TFile, TFolder } from "obsidian";
import {
  sortItemsByName,
  sortItemsByCreationDate,
  sortItemsByModifiedDate,
  sortItemsByPriority,
  sortItemsByPriorityThenName,
  sortItemsByPriorityThenCreationDate,
  sortItemsByPriorityThenModifiedDate,
} from "./sorting";

jest.mock("src/logic/frontmatter-processes", () => ({
  getFilePrioritySettings: (file: TFile) => (file as any).__priority || null,
}));

function makeFile(name: string, ctime: number, mtime: number, priority?: "High" | "Low") {
  const f = new TFile(name, ctime, mtime) as any;
  f.__priority = priority ? { name: priority } : null;
  return f as TFile;
}

function makeFolder(name: string) {
  return new TFolder(name);
}

describe("sorting utils", () => {
  const fA = makeFile("a.md", 1, 10, "High");
  const fB = makeFile("b.md", 3, 30, "Low");
  const fC = makeFile("c.md", 2, 20);
  const folder = makeFolder("folder");

  test("sortItemsByName ascending/descending", () => {
    const asc = sortItemsByName([fB, fC, fA], "ascending").map((i) => i.name);
    const desc = sortItemsByName([fB, fC, fA], "descending").map((i) => i.name);
    expect(asc).toEqual(["a.md", "b.md", "c.md"]);
    expect(desc).toEqual(["c.md", "b.md", "a.md"]);
  });

  test("sortItemsByCreationDate respects only files, leaves folders equal", () => {
    const out = sortItemsByCreationDate([folder, fB, fA], "ascending");
    expect(out[0]).toBe(folder);
  });

  test("sortItemsByModifiedDate ascending/descending", () => {
    const asc = sortItemsByModifiedDate([fB, fC, fA], "ascending").map((i) => (i as TFile).stat.mtime);
    const desc = sortItemsByModifiedDate([fB, fC, fA], "descending").map((i) => (i as TFile).stat.mtime);
    expect(asc).toEqual([10, 20, 30]);
    expect(desc).toEqual([30, 20, 10]);
  });

  test("sortItemsByPriority puts High before Low and leaves folders", () => {
    const out = sortItemsByPriority([folder, fB, fA, fC]).map((i) => (i as any).name || "folder");
    // High a.md should come before Low b.md; folder unchanged relative where equal-comparisons occur
    expect(out).toContain("a.md");
    expect(out.indexOf("a.md")).toBeLessThan(out.indexOf("b.md"));
  });

  test("sortItemsByPriorityThenName", () => {
    const out = sortItemsByPriorityThenName([fB, fA, fC], "ascending");
    const names = out.map((i) => (i as any).name);
    // Within same priority, name ascending; High before Low; nulls after defined priorities
    expect(names.indexOf("a.md")).toBeLessThan(names.indexOf("b.md"));
  });

  test("sortItemsByPriorityThenCreationDate", () => {
    const out = sortItemsByPriorityThenCreationDate([fB, fA, fC], "ascending");
    const names = out.map((i) => (i as any).name);
    expect(names.indexOf("a.md")).toBeLessThan(names.indexOf("b.md"));
  });

  test("sortItemsByPriorityThenModifiedDate", () => {
    const out = sortItemsByPriorityThenModifiedDate([fB, fA, fC], "descending");
    const names = out.map((i) => (i as any).name);
    expect(names.indexOf("a.md")).toBeLessThan(names.indexOf("b.md"));
  });
});


