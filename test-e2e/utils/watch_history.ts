import * as assert from 'assert';

import constants, { ShelfId } from '#utils/constants';
import LocatorOrString = CodeceptJS.LocatorOrString;

export async function playVideo(I: CodeceptJS.I, seekTo: number, title: string, startButton: string | null = constants.startWatchingButton) {
  if (startButton) {
    I.click(startButton);
  }

  await I.waitForPlayerPlaying(title);
  await I.executeScript((seekTo) => {
    if (!window.jwplayer) {
      throw "Can't find jwplayer ref";
    }

    window.jwplayer().seek(seekTo);
  }, seekTo);
  I.clickPlayerContainer();
  I.click('div[aria-label="Back"]');

  // We need to wait for the player to be removed before proceeding, otherwise race conditions occur when the player is reloaded
  await I.waitForPlayerState('', ['paused']);
}

export async function checkProgress(
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

export function pixelsToNumber(value: string) {
  return Number(value.substring(0, value.indexOf('px')));
}

export async function checkElapsed(I: CodeceptJS.I, expectedMinutes: number, expectedSeconds: number, bufferSeconds: number = 5) {
  const elapsed = await I.grabTextFrom('[class*=jw-text-elapsed]');
  const [minutes, seconds] = elapsed.split(':').map((item) => Number.parseInt(item));
  assert.strictEqual(minutes, expectedMinutes);

  if (seconds < expectedSeconds || seconds > expectedSeconds + bufferSeconds) {
    assert.fail(`Elapsed time of ${minutes}m ${seconds}s is not within ${bufferSeconds} seconds of ${expectedMinutes}m ${expectedSeconds}s`);
  } else {
    assert.ok(expectedSeconds);
  }
}

export async function registerAndPlayVideo(I: CodeceptJS.I, videoTitle: string, progress: number = 80) {
  I.registerOrLogin();
  I.clickHome();

  // New user has no continue watching history shelf
  I.dontSee(constants.continueWatchingShelfTitle);

  await I.openVideoCard(videoTitle, ShelfId.allFilms);

  await playVideo(I, 0, videoTitle);
  I.see(constants.startWatchingButton);
  I.dontSee(constants.continueWatchingButton);

  await playVideo(I, progress, videoTitle);

  I.see(constants.continueWatchingButton);
  I.dontSee(constants.startWatchingButton);
}
