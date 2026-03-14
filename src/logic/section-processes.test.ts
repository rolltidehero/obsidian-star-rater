import { describe, expect, test, jest } from "@jest/globals";
import type { Section } from "./section-processes";

const makePluginWithStates = (
  visible: Array<{ name: string }>,
  hidden: Array<{ name: string }>,
  stateless: { name: string }
) => ({
  settings: {
    states: { visible, hidden },
    stateless,
    folders: { defaultView: "Small" as const },
  },
});

describe("orderSections", () => {
  test("orders sections according to visible states (reversed), then folders, then stateless", () => {
    jest.isolateModules(() => {
      const visible = [
        { name: "Idea" },
        { name: "Shortlisted" },
        { name: "Drafting" },
      ];
      const hidden = [{ name: "Archived" }];
      const stateless = { name: "" };
      jest.doMock("./stores", () => ({
        getGlobals: () => ({
          plugin: makePluginWithStates(visible, hidden, stateless),
        }),
      }));
      const { orderSections } = require("./section-processes");

      const unorderedSections: Section[] = [
        { title: "Drafting", type: "state", items: [], settings: {} as any },
        { title: "folders", type: "folders", items: [], settings: {} as any },
        { title: " ", type: "stateless", items: [], settings: {} as any },
        { title: "Idea", type: "state", items: [], settings: {} as any },
        { title: "Shortlisted", type: "state", items: [], settings: {} as any },
      ];

      const ordered = orderSections(unorderedSections);

      expect(ordered.map((s) => s.title)).toEqual([
        "folders",
        "Drafting",
        "Shortlisted",
        "Idea",
        " ",
      ]);
    });
  });

  test("filters out hidden state sections", () => {
    jest.isolateModules(() => {
      const visible = [{ name: "Idea" }];
      const hidden = [{ name: "Archived" }, { name: "Cancelled" }];
      const stateless = { name: "" };
      jest.doMock("./stores", () => ({
        getGlobals: () => ({
          plugin: makePluginWithStates(visible, hidden, stateless),
        }),
      }));
      const { orderSections } = require("./section-processes");

      const unorderedSections: Section[] = [
        { title: "folders", type: "folders", items: [], settings: {} as any },
        { title: "Idea", type: "state", items: [], settings: {} as any },
        { title: "Archived", type: "state", items: [], settings: {} as any },
        { title: " ", type: "stateless", items: [], settings: {} as any },
      ];

      const ordered = orderSections(unorderedSections);

      const titles = ordered.map((s) => s.title);
      expect(titles).toContain("folders");
      expect(titles).toContain("Idea");
      expect(titles).toContain(" ");
      expect(titles).not.toContain("Archived");
    });
  });
});
