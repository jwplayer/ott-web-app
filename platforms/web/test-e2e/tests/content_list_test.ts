import { testConfigs } from '@jwp/ott-testing/constants';

import constants from '#utils/constants';

Feature('content list').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);

  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.click('Popular');
});

Scenario('Header button navigates to content list screen', async ({ I }) => {
  I.see('All Popular');
  I.seeInCurrentUrl(`${constants.baseUrl}n/`);
});

Scenario('Content list screen loads', async ({ I }) => {
  I.seeElement('div[role="grid"]');
  I.seeElement('div[role="gridcell"]');
  I.seeElement('div[id="layout_grid_0-0"]');
});

Scenario('I can click on first card and navigate to the video details screen', async ({ I }) => {
  I.click('div[id="layout_grid_0-0"]');
  I.see(constants.startWatchingButton);
  I.click(constants.startWatchingButton);
  I.seeElement('video');

  I.click('video');
  I.click('button[aria-label="Back"]');
  await I.checkPlayerClosed();
});
