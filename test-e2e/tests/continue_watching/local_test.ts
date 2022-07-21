import { playVideo, checkProgress, checkElapsed } from '../../utils/watch_history';
import constants from '../../utils/constants';

const videoLength = 231;

Feature('continue_watching - local').retry(3);

Before(({ I }) => {
  I.useConfig('test--no-cleeng');
});

Scenario('I can get my watch progress stored (locally)', async ({ I }) => {
  I.amOnPage(constants.agent327DetailUrl);
  I.dontSee('Continue watching');

  await playVideo(I, constants.agent327Title, constants.agent327DetailUrl, 100, videoLength);

  I.see('Continue watching');
});

Scenario('I can continue watching', async ({ I }) => {
  I.amOnPage(constants.agent327DetailUrl);
  await playVideo(I, constants.agent327Title, constants.agent327DetailUrl, 100, videoLength);
  I.click('Continue watching');
  await I.waitForPlayerPlaying('Agent 327');
  I.click('video');
  await checkElapsed(I, 1, 40);
});

Scenario('I can see my watch history on the Home screen', async ({ I }) => {
  I.seeCurrentUrlEquals(constants.baseUrl);
  I.dontSee('Continue watching');

  await playVideo(I, constants.agent327Title, constants.agent327DetailUrl, 200, videoLength);
  I.amOnPage(constants.baseUrl);

  I.see('Continue watching');

  await within('div[data-mediaid="continue_watching"]', async () => {
    I.see('Agent 327');
    I.see('4 min');
  });

  const xpath = '//*[@data-mediaid="continue_watching"]//*[@aria-label="Play Agent 327"]';
  await checkProgress(I, xpath, (200 / videoLength) * 100);

  I.click(xpath);
  await I.waitForPlayerPlaying('Agent 327');
  I.click('video');

  await checkElapsed(I, 3, 20);
  I.seeInCurrentUrl('play=1');
});

Scenario('Video removed from continue watching when finished', async ({ I }) => {
  I.amOnPage(constants.agent327DetailUrl);
  await playVideo(I, constants.agent327Title, constants.agent327DetailUrl, 100, videoLength);
  // Continue watching on video detail page
  I.see('Continue watching');

  // Continue watching on home page
  I.amOnPage(constants.baseUrl);
  I.see('Continue watching');

  await playVideo(I, constants.agent327Title, constants.agent327DetailUrl, videoLength, videoLength);

  I.see('Start watching');
  I.dontSee('Continue watching');

  I.amOnPage(constants.baseUrl);

  I.dontSee('Continue watching');
});
