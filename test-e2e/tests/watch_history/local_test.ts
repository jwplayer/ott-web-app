import { checkElapsed, checkProgress, playVideo } from '#utils/watch_history';
import constants, { makeShelfXpath, ShelfId } from '#utils/constants';
import { testConfigs } from '#test/constants';

const videoTitle = constants.bigBuckBunnyTitle;
const videoLength = 596;

Feature('watch_history - local').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
});

Scenario('I can get my watch progress stored (locally)', async ({ I }) => {
  await I.openVideoCard(videoTitle, ShelfId.allFilms);
  I.dontSee(constants.continueWatchingButton);

  await playVideo(I, 100, videoTitle);

  I.see(constants.continueWatchingButton);
});

Scenario('I can continue watching', async ({ I }) => {
  await I.openVideoCard(videoTitle);
  await playVideo(I, 100, videoTitle);
  I.click(constants.continueWatchingButton);
  await I.waitForPlayerPlaying(videoTitle);
  I.click('video');
  await checkElapsed(I, 1, 40);
});

Scenario('I can see my watch history on the Home screen', async ({ I }) => {
  I.dontSee(constants.continueWatchingShelfTitle);

  await I.openVideoCard(videoTitle);
  await playVideo(I, 200, videoTitle);

  I.amOnPage(constants.baseUrl);

  I.see(constants.continueWatchingShelfTitle);

  await within(makeShelfXpath(ShelfId.continueWatching), async () => {
    I.see(videoTitle);
    I.see('10 min');
  });

  const selector = `${makeShelfXpath(ShelfId.continueWatching)}//a[@aria-label="${videoTitle}"]`;
  await checkProgress(I, selector, (200 / videoLength) * 100);

  I.click(selector);
  await I.waitForPlayerPlaying(videoTitle);
  I.click('video');

  await checkElapsed(I, 3, 20);
  await I.seeQueryParams({ play: '1' });
});

Scenario('Video removed from continue watching when finished', async ({ I }) => {
  await I.openVideoCard(videoTitle);
  await playVideo(I, 100, videoTitle);

  // Continue watching on video detail page
  I.see(constants.continueWatchingButton);

  // Continue watching on home page
  I.amOnPage(constants.baseUrl);
  I.see(constants.continueWatchingShelfTitle);

  await I.openVideoCard(videoTitle, ShelfId.continueWatching);
  await playVideo(I, videoLength, videoTitle, null);

  I.see(constants.startWatchingButton);
  I.dontSee(constants.continueWatchingButton);

  I.amOnPage(constants.baseUrl);

  I.dontSee(constants.continueWatchingButton);
  I.dontSee(constants.continueWatchingShelfTitle);

  await I.openVideoCard(constants.agent327Title);
  await playVideo(I, 50, constants.agent327Title);

  I.clickHome();
  I.waitForLoaderDone();

  I.see(constants.continueWatchingShelfTitle);
  I.dontSee(videoTitle, makeShelfXpath(ShelfId.continueWatching));
});

Scenario('I do not see continue_watching videos on the home page and video page if there is not such config setting', async ({ I }) => {
  I.useConfig(testConfigs.cleengAuthvodNoWatchlist);

  await I.openVideoCard(videoTitle);
  I.dontSee(constants.continueWatchingButton);

  await playVideo(I, 50, videoTitle);
  I.see(constants.startWatchingButton);
  I.dontSee(constants.continueWatchingButton);

  I.amOnPage(constants.baseUrl);

  // Looking for continue watching shelf, not button
  I.dontSee(constants.continueWatchingShelfTitle);
});
