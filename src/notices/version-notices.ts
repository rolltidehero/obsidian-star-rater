import * as semVer from 'semver';
import { createNoticeTemplate, createNoticeCtaBar, launchPersistentNotice } from 'src/components/dom-components/notice-components';
import { getGlobals } from 'src/logic/stores';

///////////
///////////

export function showVersionNotice() {
    const {plugin} = getGlobals()
    const curVersion = plugin.manifest.version;

    const lastVersionTipRead = plugin.settings.onboardingNotices.lastVersionNoticeRead;
    const noLastVersionTipRead = !semVer.valid(lastVersionTipRead)
    const updatedToNewerVersion = semVer.gt(curVersion, lastVersionTipRead);

    if(noLastVersionTipRead || updatedToNewerVersion) {
        showLatestChanges();
    }
}

//////////

function showLatestChanges() {
    const {plugin} = getGlobals()

    const noticeBody = createNoticeTemplate(1,3);
    noticeBody.createEl('h1').setText(`Changes in Star Rater v0.3.2`);
    // noticeBody.createEl('p').setText(`Added:`);
    const listEl = noticeBody.createEl('ul');
    listEl.createEl('li').setText(`Transformed from state-based to star rating system.`);
    listEl.createEl('li').setText(`Now uses 1-5 star ratings for organizing notes.`);
    listEl.createEl('li').setText(`Changed frontmatter field from 'state' to 'rating'.`);
        
    const link = noticeBody.createEl('a');
    link.setAttribute('href', 'https://github.com/rolltidehero/obsidian-star-rater')
    link.setText(`View on GitHub`);

    noticeBody.createEl('h2').setText('Also...');
    noticeBody.createEl('p').appendText('This is a fork of Project Browser, transformed into a star rating system!');

    // Prevent clicking link from closing notice
    link.onClickEvent( e => e.stopPropagation())
        
    const {
        tertiaryBtnEl
    } = createNoticeCtaBar(noticeBody, {
        tertiaryLabel: 'Dismiss',
    })

    const notice = launchPersistentNotice(noticeBody);

    if(tertiaryBtnEl) {
        tertiaryBtnEl.addEventListener('click', () => {
            notice.hide();
            plugin.settings.onboardingNotices.lastVersionNoticeRead = plugin.manifest.version;
            plugin.saveSettings();
        });
    }
    
}