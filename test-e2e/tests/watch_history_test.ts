import * as assert from 'assert';

import constants from '../utils/constants';

import LocatorOrString = CodeceptJS.LocatorOrString;

const videoLength = 231;

Feature('watch_history - local');

Before(({ I }) => {
  I.useConfig('test--no-cleeng');
});

Scenario('I can get my watch progress stored (locally)', async ({ I }) => {
  I.amOnPage(constants.agent327DetailUrl);
  I.dontSee('Continue watching');

  await playVideo(I, 100);

  I.see('Continue watching');
});

Scenario('I can continue watching', async ({ I }) => {
  I.amOnPage(constants.agent327DetailUrl);
  await playVideo(I, 100);
  I.click('Continue watching');
  await I.waitForPlayerPlaying('Agent 327');
  I.click('video');
  await checkElapsed(I, 1, 40);
});

Scenario('I can see my watch history on the Home screen', async ({ I }) => {
  I.seeCurrentUrlEquals(constants.baseUrl);
  I.dontSee('Continue watching');

  await playVideo(I, 200);
  I.amOnPage(constants.baseUrl);

  I.see('Continue watching');

  await within('div[data-mediaid="continue-watching"]', async () => {
    I.see('Agent 327');
    I.see('4 min');
  });

  const xpath = '//*[@data-mediaid="continue-watching"]//*[@aria-label="Play Agent 327"]';
  await checkProgress(I, xpath, (200 / videoLength) * 100);

  I.click(xpath);
  await I.waitForPlayerPlaying('Agent 327');
  I.click('video');

  await checkElapsed(I, 3, 20);
  I.seeInCurrentUrl('play=1');
});

Scenario('Video removed from continue watching when finished', async ({ I }) => {
  I.amOnPage(constants.agent327DetailUrl);
  await playVideo(I, 100);
  // Continue watching on video detail page
  I.see('Continue watching');

  // Continue watching on home page
  I.amOnPage(constants.baseUrl);
  I.see('Continue watching');

  await playVideo(I, videoLength);

  I.see('Start watching');
  I.dontSee('Continue watching');

  I.amOnPage(constants.baseUrl);

  I.dontSee('Continue watching');
});

Feature('watch_history - logged in');

Before(({ I }) => {
  I.useConfig('test--accounts');
});

Scenario('I can get my watch history when logged in', async ({ I }) => {
  I.login();
  await playVideo(I, 0);
  I.see('Start watching');
  I.dontSee('Continue watching');

  await playVideo(I, 80);

  I.see('Continue watching');
  I.dontSee('Start watching');
  await checkProgress(I, '//button[contains(., "Continue watching")]', (80 / videoLength) * 100, 5, '_progressRail_', '_progress_');
});

Scenario('I can get my watch history stored to my account after login', async ({ I }) => {
  I.amOnPage(constants.agent327DetailUrl);
  I.dontSee('Continue watching');
  I.see('Sign up to start watching');

  I.login();
  I.amOnPage(constants.agent327DetailUrl);
  I.dontSee('Start watching');
  I.see('Continue watching');
  await checkProgress(I, '//button[contains(., "Continue watching")]', (80 / videoLength) * 100, 5, '_progressRail_', '_progress_');

  I.click('Continue watching');
  await I.waitForPlayerPlaying('Agent 327');
  I.click('video');
  await checkElapsed(I, 1, 20);
});

Scenario('I can see my watch history on the Home screen when logged in', async ({ I }) => {
  const xpath = '//*[@data-mediaid="continue-watching"]//*[@aria-label="Play Agent 327"]';

  I.seeCurrentUrlEquals(constants.baseUrl);
  I.dontSee('Continue watching');

  I.login();
  I.see('Continue watching');

  await within('div[data-mediaid="continue-watching"]', async () => {
    I.see('Agent 327');
    I.see('4 min');
  });

  await checkProgress(I, xpath, (80 / videoLength) * 100);

  // Automatic scroll leads to click problems for some reasons
  I.scrollTo(xpath);
  I.click(xpath);
  await I.waitForPlayerPlaying('Agent 327');

  await checkElapsed(I, 1, 20);
  I.seeInCurrentUrl('play=1');
});

async function playVideo(I: CodeceptJS.I, seekTo: number) {
  I.amOnPage(constants.agent327DetailUrl + '&play=1');
  await I.waitForPlayerPlaying('Agent 327');
  await I.executeScript((seekTo) => {
    if (!window.jwplayer) {
      throw "Can't find jwplayer ref";
    }

    window.jwplayer().seek(seekTo);
  }, seekTo);
  I.click('div[class="_cinema_1w0uk_1 _fill_1w0uk_1"]'); //re-enable controls overlay
  I.click('div[aria-label="Back"]');
  I.waitForClickable(seekTo < videoLength && seekTo > 0 ? 'Continue watching' : 'Start watching', 5);
}

async function checkProgress(
  I: CodeceptJS.I,
  context: LocatorOrString,
  expectedPercent: number,
  tolerance: number = 5,
  containerClass: string = '_progressContainer',
  barClass: string = '_progressBar',
) {
  return within(context, async () => {
    const containerWidth = await I.grabCssPropertyFrom(`div[class*=${containerClass}]`, 'width');
    const progressWidth = await I.grabCssPropertyFrom(`div[class*=${barClass}]`, 'width');

    const percentage = Math.round((100 * pixelsToNumber(progressWidth)) / pixelsToNumber(containerWidth));

    await I.say(`Checking that percentage ${percentage} is between ${expectedPercent - tolerance} and ${expectedPercent + tolerance}`);

    if (percentage < expectedPercent - tolerance) {
      assert.fail(`Expected percentage ${percentage} to be greater than ${expectedPercent - tolerance}`);
    } else if (percentage > expectedPercent + tolerance) {
      assert.fail(`Expected percentage ${percentage} to be less than ${expectedPercent + tolerance}`);
    } else {
      assert.ok(percentage);
    }
  });
}

function pixelsToNumber(value: string) {
  return Number(value.substring(0, value.indexOf('px')));
}

async function checkElapsed(I: CodeceptJS.I, expectedMinutes: number, expectedSeconds: number, bufferSeconds: number = 5) {
  const elapsed = await I.grabTextFrom('[class*=jw-text-elapsed]');
  const [minutes, seconds] = elapsed.split(':').map((item) => Number.parseInt(item));
  assert.strictEqual(minutes, expectedMinutes);

  if (seconds < expectedSeconds || seconds > expectedSeconds + bufferSeconds) {
    assert.fail(`Elapsed time of ${minutes}m ${seconds}s is not within ${bufferSeconds} seconds of ${expectedMinutes}m ${expectedSeconds}s`);
  } else {
    assert.ok(expectedSeconds);
  }
}
