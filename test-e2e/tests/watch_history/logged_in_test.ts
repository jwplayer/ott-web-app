import constants, { makeShelfXpath, normalTimeout, ShelfId } from '#utils/constants';
import { checkElapsed, checkProgress, playVideo } from '#utils/watch_history';
import { LoginContext } from '#utils/password_utils';
import { testConfigs } from '#test/constants';

const videoLength = 596;
const videoTitle = constants.bigBuckBunnyTitle;

runTestSuite(testConfigs.jwpAuth, testConfigs.jwpAuthNoWatchlist, 'JW Player');
runTestSuite(testConfigs.cleengAuthvod, testConfigs.cleengAuthvodNoWatchlist, 'Cleeng');

function runTestSuite(config: typeof testConfigs.svod, configNoWatchlist: typeof testConfigs.jwpAuthNoWatchlist, providerName: string) {
  let loginContext: LoginContext;

  Feature(`watch_history - logged in - ${providerName}`).retry(Number(process.env.TEST_RETRY_COUNT) || 0);

  Before(({ I }) => {
    I.useConfig(config);
  });

  Scenario(`I can get my watch history when logged in - ${providerName}`, async ({ I }) => {
    await registerOrLogin(I);

    // New user has no continue watching history shelf
    I.dontSee(constants.continueWatchingShelfTitle);

    await I.openVideoCard(videoTitle, ShelfId.allFilms);

    await playVideo(I, 0, videoTitle);
    I.see(constants.startWatchingButton);
    I.dontSee(constants.continueWatchingButton);

    await playVideo(I, 80, videoTitle);

    I.see(constants.continueWatchingButton);
    I.dontSee(constants.startWatchingButton);
    await checkProgress(I, `//button[contains(., "${constants.continueWatchingButton}")]`, (80 / videoLength) * 100, 5, '_progressRail_', '_progress_');
  });

  Scenario(`I can get my watch history stored to my account after login - ${providerName}`, async ({ I }) => {
    I.dontSee(constants.continueWatchingShelfTitle);

    await I.openVideoCard(videoTitle);
    I.dontSee(constants.continueWatchingButton);
    I.see(constants.startWatchingButton);

    await registerOrLogin(I);
    I.clickHome();
    I.waitForText(constants.continueWatchingShelfTitle, normalTimeout);

    await I.openVideoCard(videoTitle, ShelfId.allFilms);
    I.dontSee(constants.startWatchingButton);
    I.see(constants.continueWatchingButton);
    await checkProgress(I, `//button[contains(., "${constants.continueWatchingButton}")]`, (80 / videoLength) * 100, 5, '_progressRail_', '_progress_');

    I.click(constants.continueWatchingButton);
    await I.waitForPlayerPlaying(videoTitle);
    I.click('video');
    await checkElapsed(I, 1, 20);
  });

  Scenario(`I can see my watch history on the Home screen when logged in - ${providerName}`, async ({ I }) => {
    I.dontSee(constants.continueWatchingShelfTitle);

    await registerOrLogin(I);
    I.clickHome();
    I.waitForText(constants.continueWatchingShelfTitle, normalTimeout);

    await within(makeShelfXpath(ShelfId.continueWatching), async () => {
      I.see(videoTitle);
      I.see('10 min');
    });

    const selector = `${makeShelfXpath(ShelfId.continueWatching)}//a[@aria-label="${videoTitle}"]`;
    await checkProgress(I, selector, (80 / videoLength) * 100);

    I.click(selector);
    await I.waitForPlayerPlaying(videoTitle);

    await checkElapsed(I, 1, 20);
    I.seeInCurrentUrl('play=1');
  });

  Scenario(
    `I do not see continue_watching videos on the home page and video page if there is not such config setting (logged in) - ${providerName}`,
    async ({ I }) => {
      I.useConfig(configNoWatchlist);

      await registerOrLogin(I);
      I.wait(5);
      I.waitForText('All Films');

      I.dontSee(constants.continueWatchingShelfTitle);

      await I.openVideoCard(videoTitle, ShelfId.allFilms);
      I.dontSee(constants.continueWatchingButton);

      await playVideo(I, 50, videoTitle);
      I.see(constants.startWatchingButton);
      I.dontSee(constants.continueWatchingButton);

      I.amOnPage(constants.baseUrl);
      I.dontSee(constants.continueWatchingShelfTitle);
    },
  );

  async function registerOrLogin(I: CodeceptJS.I) {
    loginContext = await I.registerOrLogin(loginContext);
  }
}
