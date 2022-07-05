import * as assert from 'assert';

import constants from './constants';

import LocatorOrString = CodeceptJS.LocatorOrString;

const videoLength = 231;

export async function playVideo(I: CodeceptJS.I, seekTo: number) {
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
