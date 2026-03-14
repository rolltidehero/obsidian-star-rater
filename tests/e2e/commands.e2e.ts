import { browser, expect } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";

describe("Project Browser Commands", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  it("plugin is loaded", async function () {
    const loaded = await browser.executeObsidian(({ app }) => {
      return !!app.plugins.plugins["project-browser"];
    });
    expect(loaded).toBe(true);
  });

  it("command opens card browser view", async function () {
    await obsidianPage.openFile("Project A/note-1.md");
    await browser.executeObsidianCommand("project-browser:open-project-browser");

    const browserView = await $(".ddc_pb_browser");
    await browserView.waitForExist({ timeout: 10000 });
    await expect(browserView).toExist();
  });

  it("card browser displays folder sections at root", async function () {
    await obsidianPage.openFile("Project A/note-1.md");
    await browser.executeObsidianCommand("project-browser:open-project-browser");

    const browserView = await $(".ddc_pb_browser");
    await browserView.waitForExist({ timeout: 10000 });

    const folderSection = await $(".ddc_pb_folder-section");
    await folderSection.waitForExist({ timeout: 10000 });
    await expect(folderSection).toExist();

    const folderButtons = await $$(".ddc_pb_folder-button");
    expect(folderButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("card browser shows notes in state sections when navigating into folder", async function () {
    await obsidianPage.openFile("Project A/note-1.md");
    await browser.executeObsidianCommand("project-browser:open-project-browser");

    const browserView = await $(".ddc_pb_browser");
    await browserView.waitForExist({ timeout: 10000 });
    await browser.pause(400); // Allow transition-on animation (0.3s) to complete

    const folderButtons = await $$(".ddc_pb_folder-button");
    await folderButtons[0].waitForExist({ timeout: 5000 });
    // Use JavaScript click to bypass WebDriver interactability checks
    // (Obsidian/Electron context can trigger "element not interactable" with native click)
    await browser.execute(() => {
      const buttons = document.querySelectorAll(".ddc_pb_folder-button");
      const firstButton = buttons[0];
      if (firstButton instanceof HTMLElement) firstButton.click();
    });

    const stateSection = await $(".ddc_pb_state-section");
    await stateSection.waitForExist({ timeout: 10000 });
    await expect(stateSection).toExist();

    const noteCards = await $$(".ddc_pb_note-card-base");
    expect(noteCards.length).toBeGreaterThanOrEqual(1);
  });
});
