import * as assert from 'assert';

import constants from '../../utils/constants';
import { playVideo, checkProgress, checkElapsed } from '../../utils/watch_history';

const videoLength = 231;

Feature('watch_history - logged in').retry(3);

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
  const xpath = '//*[@data-mediaid="continue_watching"]//*[@aria-label="Play Agent 327"]';

  I.seeCurrentUrlEquals(constants.baseUrl);
  I.dontSee('Continue watching');

  I.login();
  I.see('Continue watching');

  await within('div[data-mediaid="continue_watching"]', async () => {
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

Scenario('I do not see continue_watching videos on the home page and video page if there is not such config setting', async ({ I }) => {
  I.useConfig('test--watchlists');

  I.dontSee('Continue watching');

  await playVideo(I, 50);

  I.amOnPage(constants.baseUrl);

  I.dontSee('Continue watching');
});
