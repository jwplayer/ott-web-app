import assert from 'assert';

import constants from '../utils/constants';

const selectedProgramBackgroundColor = 'rgb(204, 204, 204)';
const liveProgramOutline = 'rgb(255, 255, 255) solid 2px';

const programBackgroundColor = 'rgba(255, 255, 255, 0.08)';
const programOutline = 'rgb(255, 255, 255) none 0px';

const channel1Id = 'Uh7zcqVm';
const channel2Id = 'Z2evecey';

const channel1LiveProgramId = 'f99402a4-783d-4298-9ca2-d392db317927';
const channel1PreviousProgramId = 'a2f80690-86e6-46e7-8a78-b243d5c8237e';
const channel1UpcomingProgram = '6ffd595b-3cdb-431b-b444-934a0e4f63dc';
const channel2LiveProgramId = 'b628784b-1061-4a61-98f3-fa48ce3ce81f';

Feature('live channel').retry(3).tag('@desktop-only');

Before(({ I }) => {
  I.useConfig('test--blender');
});

const videoDetailLocator = locate({ css: 'div[data-testid="video-detail"]' });

const shelfContainerLocator = locate({ css: 'div[role="row"]' });
const shelfLocator = locate({ css: 'div[role="cell"]' }).inside(shelfContainerLocator);
const epgContainer = locate({ css: 'div[data-testid="container"]' });
const epgProgram = (id: string) => locate({ css: `div[data-testid="${id}"]` }).inside(epgContainer);
const epgChannel = (id: string) => locate({ css: `div[data-testid="${id}"]` }).inside(epgContainer);
const amountOfLiveChannels = 5;

Scenario('I can navigate to live channels from the live channels shelf', async ({ I }) => {
  I.see('Blender');
  I.see('Agent 327');

  await I.scrollToShelf(constants.playlistLiveChannelId);

  for (let i = 1; i <= amountOfLiveChannels; i++) {
    I.see(`Channel ${i}`, shelfLocator);
  }

  I.see('Live Channels');
  I.click('Play Channel 1');

  waitForEpgAnimation(I);
  I.see('LIVEOn Channel 1', locate('div').inside(videoDetailLocator));
});

Scenario('I can navigate to live channels from the header', ({ I }) => {
  I.see('Live');
  I.click('Live');

  waitForEpgAnimation(I);
  I.see('LIVEOn Channel 1', locate('div').inside(videoDetailLocator));
});

Scenario('I can watch the current live program on the live channel screen', async ({ I }) => {
  I.mockTimeAs('10:00:00');

  I.amOnPage(`${constants.baseUrl}p/${constants.playlistLiveChannelId}`);

  I.see('The Daily Show with Trevor Noah: Ears Edition', locate('h2').inside(videoDetailLocator));
  I.see('LIVEOn Channel 1', locate('div').inside(videoDetailLocator));
  I.see('Start watching');

  I.click('Start watching');
  I.seeElement('video');

  // to make sure the back button is visible and can be clicked on
  I.click('video');

  I.click('div[aria-label="Back"]');
  await I.checkPlayerClosed();
});

Scenario('I see the epg on the live channel screen', async ({ I }) => {
  I.mockTimeAs('10:00:00');

  I.amOnPage(`${constants.baseUrl}p/${constants.playlistLiveChannelId}`);

  I.see('The Daily Show with Trevor Noah: Ears Edition');
  I.see('Live');

  I.see('LIVEOn Channel 1');
  I.see('Start watching');

  I.seeElement(epgProgram(channel1LiveProgramId));
  await isSelectedProgram(I, channel1LiveProgramId, 'channel 1');

  I.seeElement(epgProgram(channel1PreviousProgramId));
  await isProgram(I, channel1PreviousProgramId, 'channel 1');

  I.seeElement(epgProgram(channel1UpcomingProgram));
  await isProgram(I, channel1UpcomingProgram, 'channel 1');

  I.seeElement(epgProgram(channel2LiveProgramId));
  await isLiveProgram(I, channel2LiveProgramId, 'channel 2');

  I.see('The Flash');
});

Scenario('I can select a upcoming program on the same channel', async ({ I }) => {
  I.mockTimeAs('10:00:00');

  I.amOnPage(`${constants.baseUrl}p/${constants.playlistLiveChannelId}`);

  I.seeElement(epgProgram(channel1LiveProgramId));
  await isSelectedProgram(I, channel1LiveProgramId, 'channel 1');

  I.seeElement(epgProgram(channel1UpcomingProgram));
  await isProgram(I, channel1UpcomingProgram, 'channel 1');

  I.click(epgProgram(channel1UpcomingProgram));

  waitForEpgAnimation(I);
  await isSelectedProgram(I, channel1UpcomingProgram, 'channel 1');

  I.see('The Flash', locate('div').inside(videoDetailLocator));

  I.dontSee('LIVEOn Channel 1', locate('div').inside(videoDetailLocator));

  I.seeElement(locate('button[disabled]').withText('Start watching'));

  I.seeElement(epgProgram(channel1LiveProgramId));
  await isLiveProgram(I, channel1LiveProgramId, 'channel 1');
});

Scenario('I can select a previous program on the same channel, and watch the video', async ({ I }) => {
  I.mockTimeAs('10:00:00');

  I.amOnPage(`${constants.baseUrl}p/${constants.playlistLiveChannelId}`);

  I.seeElement(epgProgram(channel1LiveProgramId));
  await isSelectedProgram(I, channel1LiveProgramId, 'channel 1');

  I.seeElement(epgProgram(channel1PreviousProgramId));
  await isProgram(I, channel1PreviousProgramId, 'channel 1');

  I.click(epgProgram(channel1PreviousProgramId));

  waitForEpgAnimation(I);
  await isSelectedProgram(I, channel1PreviousProgramId, 'channel 1');

  I.dontSee('LIVEOn Channel 1', locate('div').inside(videoDetailLocator));

  I.seeElement(epgProgram(channel1LiveProgramId));
  await isLiveProgram(I, channel1LiveProgramId, 'channel 1');

  I.see('The Flash', locate('h2').inside(videoDetailLocator));

  I.click('Start watching');
  I.seeElement('video');
});

Scenario('I can select an program on a other channel', async ({ I }) => {
  I.mockTimeAs('10:00:00');

  I.amOnPage(`${constants.baseUrl}p/${constants.playlistLiveChannelId}`);

  I.click(epgChannel(channel2Id));

  waitForEpgAnimation(I);

  I.dontSee('LIVEOn Channel 1', locate('div').inside(videoDetailLocator));

  I.see('The Flash', locate('h2').inside(videoDetailLocator));
  I.see('LIVEOn Channel 2', locate('div').inside(videoDetailLocator));

  I.seeElement(epgProgram(channel2LiveProgramId));
  await isSelectedProgram(I, channel2LiveProgramId, 'channel 2');

  I.click(epgChannel(channel1Id));
  waitForEpgAnimation(I);
  I.dontSee('LIVEOn Channel 2', locate('div').inside(videoDetailLocator));
  I.see('LIVEOn Channel 1', locate('div').inside(videoDetailLocator));
});

Scenario('I can navigate through the epg', async ({ I }) => {
  I.mockTimeAs('10:00:00');

  I.amOnPage(`${constants.baseUrl}p/${constants.playlistLiveChannelId}`);

  I.see('The Silent Sea');
  I.dontSee('House');

  waitForEpgAnimation(I);
  I.click('Slide right');

  I.dontSee('The Silent Sea');
  I.see('Peaky Blinders');

  I.click('Slide right');

  waitForEpgAnimation(I);
  I.dontSee('Euphoria');
  I.see('Peaky Blinders');

  I.click('Now');

  waitForEpgAnimation(I);
  I.seeElement(epgProgram(channel1LiveProgramId));
  await isSelectedProgram(I, channel1LiveProgramId, 'channel 1');

  I.seeElement(epgProgram(channel2LiveProgramId));
  await isLiveProgram(I, channel2LiveProgramId, 'channel 2');
});

async function isSelectedProgram(I: CodeceptJS.I, programId: string, channel: string) {
  await checkStyle(I, epgProgram(programId), { 'background-color': selectedProgramBackgroundColor, outline: liveProgramOutline });
  I.say(`I see the program is selected on ${channel}`);
}

async function isLiveProgram(I: CodeceptJS.I, programId: string, channel: string) {
  await checkStyle(I, epgProgram(programId), { 'background-color': programBackgroundColor, outline: liveProgramOutline });
  I.say(`I see the program is live on ${channel}`);
}

async function isProgram(I: CodeceptJS.I, programId: string, channel: string) {
  await checkStyle(I, epgProgram(programId), { 'background-color': programBackgroundColor, outline: programOutline });
  I.say(`I see the program is not active nor selected on ${channel}`);
}

async function checkStyle(I: CodeceptJS.I, locator: CodeceptJS.LocatorOrString, styles: Record<string, string>) {
  for (const style in styles) {
    const value = await I.grabCssPropertyFrom(locator, style);

    assert.strictEqual(styles[style], value);
  }

  return true;
}

function waitForEpgAnimation(I: CodeceptJS.I, sec: number = 1) {
  return I.wait(sec);
}
