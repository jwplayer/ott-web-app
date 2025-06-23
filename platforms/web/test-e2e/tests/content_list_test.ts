import { testConfigs } from '@jwp/ott-testing/constants';

import constants from '#utils/constants';

Feature('content list').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);

  if (await I.isMobile()) {
    I.openMenuDrawer();
  }
});

Scenario('Content list screen loads', async ({ I }) => {
  I.click('Popular');
  I.seeElement('video');
  I.click('video');
  I.click('button[aria-label="Back"]');
  await I.checkPlayerClosed();
});

Scenario('I can click on a card and navigate to the video details screen', ({ I }) => {
  canNavigateToElephantsDreamTrailer(I);
});

function canNavigateToElephantsDreamTrailer(I: CodeceptJS.I) {
  I.click({ css: 'a[data-testid="Elephants Dream Trailer"]' });
  I.see(constants.elephantsDreamTrailerTitle);
  I.see(constants.startWatchingButton);

  I.seeInCurrentUrl(`${constants.baseUrl}m/`);
  I.seeInCurrentUrl('/elephants-dream-trailer?');
}
