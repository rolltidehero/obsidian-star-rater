import { browser } from "@wdio/globals";

/**
 * Dismiss blocking popups (e.g. onboarding notices) if present.
 * Pre-seeding plugin data.json with welcomeNoticeRead: true is preferred;
 * this is a fallback when notices still appear.
 */
export async function dismissBlockingPopups(): Promise<void> {
  await browser.pause(500);
  const dismissed = await browser.execute(() => {
    const notice = document.querySelector(".ddc_pb_notice");
    if (notice) {
      const dismissBtn = notice.querySelector("button");
      if (dismissBtn instanceof HTMLElement) {
        dismissBtn.click();
        return true;
      }
    }
    return false;
  });
  if (dismissed) await browser.pause(300);
}
