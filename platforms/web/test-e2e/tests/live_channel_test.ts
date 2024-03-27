import { DateTime } from 'luxon';
import { testConfigs } from '@jwp/ott-testing/constants';

import { ShelfId } from '#utils/constants';

const programSelectedBackgroundColor = 'rgb(204, 204, 204)';
const programLiveBorder = '2px solid rgb(255, 255, 255)';

const programBackgroundColor = 'rgba(255, 255, 255, 0.08)';
const programBorder = '2px solid rgba(0, 0, 0, 0)';

const channel1Id = 'Uh7zcqVm';
const channel2Id = 'Z2evecey';

const channel1LiveProgramId = 'f99402a4-783d-4298-9ca2-d392db317927';
const channel1PreviousProgramId = 'a2f80690-86e6-46e7-8a78-b243d5c8237e';
const channel1UpcomingProgramId = '6ffd595b-3cdb-431b-b444-934a0e4f63dc';
const channel2LiveProgramId = 'b628784b-1061-4a61-98f3-fa48ce3ce81f';

Feature('live channel')
  .retry(Number(process.env.TEST_RETRY_COUNT) || 0)
  .tag('@desktop-only');

Before(async ({ I }) => {
  const today = DateTime.now();
  const winterDay = DateTime.fromObject({ month: 12, day: 31 });
  const summerDay = DateTime.fromObject({ month: 7, day: 4 });

  const isSummer = today.offset !== winterDay.offset;
  const isGMT = winterDay.offset === 0 && summerDay.offset === 0;

  // Time is mocked in GMT, so to maintain the same local time we need 1 hour later in GMT in winter
  // Example, during summer time in Amsterdam (GMT+2) 8:00 AM GMT = 10:00 AM CEST
  // In winter time in Amsterdam (GMT+1) 9:00 AM GMT = 10:00 AM CET
  await I.mockTimeGMT(isSummer || isGMT ? 8 : 9, 0, 0);
  I.useConfig(testConfigs.basicNoAuth);
});

const videoDetailsLocator = locate({ css: 'header[data-testid="video-details"]' });
const epgContainerLocator = locate({ css: 'div[data-testid="container"]' });

const makeEpgProgramLocator = (id: string) => locate({ css: `div[data-testid*="${id}"]` }).inside(epgContainerLocator);
const makeEpgChannelLocator = (id: string) => locate({ css: `div[data-testid*="${id}"]` }).inside(epgContainerLocator);

const channel1Locator = makeEpgChannelLocator(channel1Id);
const channel2Locator = makeEpgChannelLocator(channel2Id);

const channel1LiveProgramLocator = makeEpgProgramLocator(channel1LiveProgramId);
const channel1PreviousProgramLocator = makeEpgProgramLocator(channel1PreviousProgramId);
const channel1UpcomingProgramLocator = makeEpgProgramLocator(channel1UpcomingProgramId);
const channel2LiveProgramLocator = makeEpgProgramLocator(channel2LiveProgramId);

const liveChannelsCount = 5;

Scenario('I can navigate to live channels from the live channels shelf', async ({ I }) => {
  await I.scrollToShelf(ShelfId.liveChannels);

  for (let i = 1; i <= liveChannelsCount; i++) {
    I.see(`Channel ${i}`, { xpath: `//section[@data-testid="shelf-${ShelfId.liveChannels}"]` });
  }

  I.see('Live Channels');
  I.click('Channel 1');

  waitForEpgAnimation(I);
  I.see('LIVE');
  I.see('On Channel 1', locate('div').inside(videoDetailsLocator));
});

Scenario('I can navigate to live channels from the header', ({ I }) => {
  I.see('Live');
  I.click('Live');

  waitForEpgAnimation(I);
  I.see('LIVE');
  I.see('On Channel 1', locate('div').inside(videoDetailsLocator));
});

// TODO: add BCL SaaS stream
// eslint-disable-next-line codeceptjs/no-skipped-tests
Scenario.skip('I can watch the current live program on the live channel screen', async ({ I }) => {
  await I.openVideoCard('Channel 1');

  I.see('The Daily Show with Trevor Noah: Ears Edition', locate('h2').inside(videoDetailsLocator));
  I.see('LIVE');
  I.see('On Channel 1', locate('div').inside(videoDetailsLocator));
  I.see('Start watching');
  I.see('Watch from start');

  I.click('Start watching');

  // TODO: Remove this if/return statement
  // It is temporarily disabling the live channel play check because stream is broken
  if (Date.now() < Date.parse('2023-12-01')) {
    return;
  }

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

  I.see('LIVE');
  I.see('On Channel 1');
  I.see('Start watching');

  I.seeElement(channel1LiveProgramLocator);
  await isSelectedProgram(I, channel1LiveProgramLocator, 'channel 1', true);

  I.seeElement(channel1PreviousProgramLocator);
  await isProgram(I, channel1PreviousProgramLocator, 'channel 1');

  I.seeElement(channel1UpcomingProgramLocator);
  await isProgram(I, channel1UpcomingProgramLocator, 'channel 1');

  I.seeElement(channel2LiveProgramLocator);
  await isLiveProgram(I, channel2LiveProgramLocator, 'channel 2');

  I.see('The Flash');
});

Scenario('I can select an upcoming program on the same channel', async ({ I }) => {
  await I.openVideoCard('Channel 1');
  I.seeElement(channel1LiveProgramLocator);
  await isSelectedProgram(I, channel1LiveProgramLocator, 'channel 1', true);

  I.seeElement(channel1UpcomingProgramLocator);
  await isProgram(I, channel1UpcomingProgramLocator, 'channel 1');

  I.click(channel1UpcomingProgramLocator);

  waitForEpgAnimation(I);
  I.scrollTo(channel1UpcomingProgramLocator);
  await isSelectedProgram(I, channel1UpcomingProgramLocator, 'channel 1', false);

  I.see('The Flash', locate('div').inside(videoDetailsLocator));

  I.dontSee('LIVE', locate('div').inside(videoDetailsLocator));
  I.see('On Channel 1', locate('div').inside(videoDetailsLocator));

  I.seeElement(locate('button[aria-disabled]').withText('Start watching'));

  I.seeElement(channel1LiveProgramLocator);
  await isLiveProgram(I, channel1LiveProgramLocator, 'channel 1');
});

Scenario('I can select a previous program on the same channel and watch the video', async ({ I }) => {
  await I.openVideoCard('Channel 1');
  I.seeElement(channel1LiveProgramLocator);
  await isSelectedProgram(I, channel1LiveProgramLocator, 'channel 1', true);

  I.seeElement(channel1PreviousProgramLocator);
  await isProgram(I, channel1PreviousProgramLocator, 'channel 1');

  I.click(channel1PreviousProgramLocator);

  waitForEpgAnimation(I);

  await isSelectedProgram(I, channel1PreviousProgramLocator, 'channel 1', false);

  I.dontSee('LIVE', locate('div').inside(videoDetailsLocator));
  I.see('On Channel 1', locate('div').inside(videoDetailsLocator));

  I.seeElement(channel1LiveProgramLocator);
  await isLiveProgram(I, channel1LiveProgramLocator, 'channel 1');

  I.see('The Flash', locate('h1').inside(videoDetailsLocator));

  I.click('Start watching');
  I.seeElement('video');
});

Scenario('I can select a program on another channel', async ({ I }) => {
  await I.openVideoCard('Channel 1');
  I.click(channel2Locator);

  waitForEpgAnimation(I);

  I.see('LIVE');
  I.dontSee('On Channel 1', locate('div').inside(videoDetailsLocator));

  I.see('The Flash', locate('h1').inside(videoDetailsLocator));
  I.see('On Channel 2', locate('div').inside(videoDetailsLocator));

  I.scrollTo(channel2LiveProgramLocator);
  I.seeElement(channel2LiveProgramLocator);
  await isSelectedProgram(I, channel2LiveProgramLocator, 'channel 2', true);

  I.click(channel1Locator);
  waitForEpgAnimation(I);
  I.see('LIVE');
  I.dontSee('On Channel 2', locate('div').inside(videoDetailsLocator));
  I.see('LIVE');
  I.see('On Channel 1', locate('div').inside(videoDetailsLocator));
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
  I.scrollTo(channel1LiveProgramLocator);
  I.seeElement(channel1LiveProgramLocator);
  await isSelectedProgram(I, channel1LiveProgramLocator, 'channel 1', true);

  I.seeElement(channel2LiveProgramLocator);
  I.scrollTo(channel2LiveProgramLocator);
  await isLiveProgram(I, channel2LiveProgramLocator, 'channel 2');
});

Scenario('I can see the channel logo for Channel 1', async ({ I }) => {
  await I.openVideoCard('Channel 1');
  await I.seeEpgChannelLogoImage('Uh7zcqVm', 'https://cdn.jwplayer.com/v2/media/Uh7zcqVm/images/channel_logo.webp?poster_fallback=1&width=320', 'Channel 1');
});

Scenario('I can see the channel logo for Channel 2', async ({ I }) => {
  await I.openVideoCard('Channel 2');
  await I.seeEpgChannelLogoImage('Z2evecey', 'https://cdn.jwplayer.com/v2/media/Z2evecey/images/channel_logo.webp?poster_fallback=1&width=320', 'Channel 2');
});

Scenario('I can see the background image for Channel 3', async ({ I }) => {
  await I.openVideoCard('Channel 3');
  I.seeAttributesOnElements('header[data-testid="video-details"] img', {
    alt: '', // Intentionally empty
    src: 'https://cdn.jwplayer.com/v2/media/wewsVyR7/images/background.webp?poster_fallback=1&width=1280',
  });
});

Scenario('I can see the background image for Channel 4', async ({ I }) => {
  await I.openVideoCard('Channel 4');
  I.seeAttributesOnElements('header[data-testid="video-details"] img', {
    alt: '', // Intentionally empty
    src: 'https://cdn.jwplayer.com/v2/media/kH7LozaK/images/background.webp?poster_fallback=1&width=1280',
  });
});

async function isSelectedProgram(I: CodeceptJS.I, locator: CodeceptJS.Locator, channel: string, isLive: boolean) {
  I.moveCursorTo('body', 0, 0); // This prevents accidentally triggering the hover state

  await checkStyle(I, locator, {
    'background-color': programSelectedBackgroundColor,
    border: isLive ? programLiveBorder : programBorder,
  });

  I.say(`I see the program is selected on ${channel}`);
}

async function isLiveProgram(I: CodeceptJS.I, locator: CodeceptJS.Locator, channel: string) {
  await checkStyle(I, locator, {
    'background-color': programBackgroundColor,
    border: programLiveBorder,
  });

  I.say(`I see the program is live on ${channel}`);
}

async function isProgram(I: CodeceptJS.I, locator: CodeceptJS.Locator, channel: string) {
  await checkStyle(I, locator, {
    'background-color': programBackgroundColor,
    border: programBorder,
  });

  I.say(`I see the program is not active nor selected on ${channel}`);
}

async function checkStyle(I: CodeceptJS.I, locator: CodeceptJS.LocatorOrString, styles: Record<string, string>) {
  I.seeCssPropertiesOnElements(locator, styles);
}

function waitForEpgAnimation(I: CodeceptJS.I, sec: number = 1) {
  I.waitForLoaderDone();
  return I.wait(sec);
}
