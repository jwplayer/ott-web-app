import assert from 'assert';

import constants, { ShelfId } from '../utils/constants';

const programSelectedBackgroundColor = 'rgb(204, 204, 204)';
const programLiveBorder = '2px solid rgb(255, 255, 255)';

const programBackgroundColor = 'rgba(255, 255, 255, 0.08)';
const programBorder = '2px solid rgba(0, 0, 0, 0)';

const channel1Id = 'Uh7zcqVm';
const channel2Id = 'Z2evecey';

const channel1LiveProgramId = 'f99402a4-783d-4298-9ca2-d392db317927';
const channel1PreviousProgramId = 'a2f80690-86e6-46e7-8a78-b243d5c8237e';
const channel1UpcomingProgram = '6ffd595b-3cdb-431b-b444-934a0e4f63dc';
const channel2LiveProgramId = 'b628784b-1061-4a61-98f3-fa48ce3ce81f';

Feature('live channel')
  .retry(Number(process.env.TEST_RETRY_COUNT) || 0)
  .tag('@desktop-only');

Before(async ({ I }) => {
  I.useConfig('test--blender');
  await I.mockTimeAs(8, 0, 0);
  I.amOnPage(constants.baseUrl);
});

const videoDetailsLocator = locate({ css: 'div[data-testid="video-details"]' });

const shelfContainerLocator = locate({ css: 'div[role="row"]' });
const shelfLocator = locate({ css: 'div[role="cell"]' }).inside(shelfContainerLocator);
const epgContainerLocator = locate({ css: 'div[data-testid="container"]' });
const makeEpgProgramLocator = (id: string) => locate({ css: `div[data-testid="${id}"]` }).inside(epgContainerLocator);
const makeEpgChannelLocator = (id: string) => locate({ css: `div[data-testid="${id}"]` }).inside(epgContainerLocator);
const liveChannelsCount = 5;

Scenario('I can navigate to live channels from the live channels shelf', async ({ I }) => {
  await I.scrollToShelf(ShelfId.liveChannels);

  for (let i = 1; i <= liveChannelsCount; i++) {
    I.see(`Channel ${i}`, shelfLocator);
  }

  I.see('Live Channels');
  I.click('Play Channel 1');

  waitForEpgAnimation(I);
  I.see('LIVEOn Channel 1', locate('div').inside(videoDetailsLocator));
});

Scenario('I can navigate to live channels from the header', ({ I }) => {
  I.see('Live');
  I.click('Live');

  waitForEpgAnimation(I);
  I.see('LIVEOn Channel 1', locate('div').inside(videoDetailsLocator));
});

Scenario('I can watch the current live program on the live channel screen', async ({ I }) => {
  await I.openVideoCard('Channel 1');

  I.see('The Daily Show with Trevor Noah: Ears Edition', locate('h2').inside(videoDetailsLocator));
  I.see('LIVEOn Channel 1', locate('div').inside(videoDetailsLocator));
  I.see('Start watching');
  I.see('Watch from start');

  I.click('Start watching');
  I.seeElement('video');

  // to make sure the back button is visible and can be clicked on
  I.click('video');

  I.click('div[aria-label="Back"]');
  await I.checkPlayerClosed();
});

Scenario('I see the epg on the live channel screen', async ({ I }) => {
  await I.openVideoCard('Channel 1');

  I.see('The Daily Show with Trevor Noah: Ears Edition');
  I.see('Live');

  I.see('LIVEOn Channel 1');
  I.see('Start watching');

  I.seeElement(makeEpgProgramLocator(channel1LiveProgramId));
  await isSelectedProgram(I, channel1LiveProgramId, 'channel 1');

  I.seeElement(makeEpgProgramLocator(channel1PreviousProgramId));
  await isProgram(I, channel1PreviousProgramId, 'channel 1');

  I.seeElement(makeEpgProgramLocator(channel1UpcomingProgram));
  await isProgram(I, channel1UpcomingProgram, 'channel 1');

  I.seeElement(makeEpgProgramLocator(channel2LiveProgramId));
  await isLiveProgram(I, channel2LiveProgramId, 'channel 2');

  I.see('The Flash');
});

Scenario('I can select an upcoming program on the same channel', async ({ I }) => {
  await I.openVideoCard('Channel 1');
  I.seeElement(makeEpgProgramLocator(channel1LiveProgramId));
  await isSelectedProgram(I, channel1LiveProgramId, 'channel 1');

  I.seeElement(makeEpgProgramLocator(channel1UpcomingProgram));
  await isProgram(I, channel1UpcomingProgram, 'channel 1');

  I.click(makeEpgProgramLocator(channel1UpcomingProgram));

  waitForEpgAnimation(I);
  await isSelectedProgram(I, channel1UpcomingProgram, 'channel 1');

  I.see('The Flash', locate('div').inside(videoDetailsLocator));

  I.dontSee('LIVEOn Channel 1', locate('div').inside(videoDetailsLocator));

  I.seeElement(locate('button[disabled]').withText('Start watching'));

  I.seeElement(makeEpgProgramLocator(channel1LiveProgramId));
  await isLiveProgram(I, channel1LiveProgramId, 'channel 1');
});

Scenario('I can select a previous program on the same channel and watch the video', async ({ I }) => {
  await I.openVideoCard('Channel 1');
  I.seeElement(makeEpgProgramLocator(channel1LiveProgramId));
  await isSelectedProgram(I, channel1LiveProgramId, 'channel 1');

  I.seeElement(makeEpgProgramLocator(channel1PreviousProgramId));
  await isProgram(I, channel1PreviousProgramId, 'channel 1');

  I.click(makeEpgProgramLocator(channel1PreviousProgramId));

  waitForEpgAnimation(I);
  await isSelectedProgram(I, channel1PreviousProgramId, 'channel 1');

  I.dontSee('LIVEOn Channel 1', locate('div').inside(videoDetailsLocator));

  I.seeElement(makeEpgProgramLocator(channel1LiveProgramId));
  await isLiveProgram(I, channel1LiveProgramId, 'channel 1');

  I.see('The Flash', locate('h2').inside(videoDetailsLocator));

  I.click('Start watching');
  I.seeElement('video');
});

Scenario('I can select a program on another channel', async ({ I }) => {
  await I.openVideoCard('Channel 1');
  I.click(makeEpgChannelLocator(channel2Id));

  waitForEpgAnimation(I);

  I.dontSee('LIVEOn Channel 1', locate('div').inside(videoDetailsLocator));

  I.see('The Flash', locate('h2').inside(videoDetailsLocator));
  I.see('LIVEOn Channel 2', locate('div').inside(videoDetailsLocator));

  I.seeElement(makeEpgProgramLocator(channel2LiveProgramId));
  await isSelectedProgram(I, channel2LiveProgramId, 'channel 2');

  I.click(makeEpgChannelLocator(channel1Id));
  waitForEpgAnimation(I);
  I.dontSee('LIVEOn Channel 2', locate('div').inside(videoDetailsLocator));
  I.see('LIVEOn Channel 1', locate('div').inside(videoDetailsLocator));
});

Scenario('I can navigate through the epg', async ({ I }) => {
  await I.openVideoCard('Channel 1');
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
  I.seeElement(makeEpgProgramLocator(channel1LiveProgramId));
  await isSelectedProgram(I, channel1LiveProgramId, 'channel 1');

  I.seeElement(makeEpgProgramLocator(channel2LiveProgramId));
  await isLiveProgram(I, channel2LiveProgramId, 'channel 2');
});

async function isSelectedProgram(I: CodeceptJS.I, programId: string, channel: string) {
  await checkStyle(I, makeEpgProgramLocator(programId), {
    'background-color': programSelectedBackgroundColor,
    border: programLiveBorder,
  });
  await I.say(`I see the program is selected on ${channel}`);
}

async function isLiveProgram(I: CodeceptJS.I, programId: string, channel: string) {
  await checkStyle(I, makeEpgProgramLocator(programId), {
    'background-color': programBackgroundColor,
    border: programLiveBorder,
  });
  await I.say(`I see the program is live on ${channel}`);
}

async function isProgram(I: CodeceptJS.I, programId: string, channel: string) {
  await checkStyle(I, makeEpgProgramLocator(programId), {
    'background-color': programBackgroundColor,
    border: programBorder,
  });
  await I.say(`I see the program is not active nor selected on ${channel}`);
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
