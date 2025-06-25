import { testConfigs } from '@jwp/ott-testing/constants';

import constants from '#utils/constants';

const locators = {
  layoutGrid: '$layout-grid-content',
  layoutGridFirstElement: 'layout_grid_0-0',
  playerBackButton: 'button[aria-label="Back"]',
};

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
  I.seeElement(locators.layoutGrid);
  I.seeElement({ id: locators.layoutGridFirstElement });
});

Scenario('I can click on first card and navigate to the video details screen', async ({ I }) => {
  I.click({ id: locators.layoutGridFirstElement });
  I.see(constants.startWatchingButton);

  I.click(constants.startWatchingButton);
  I.seeElement('video');

  I.click('video');
  I.click(locators.playerBackButton);
  await I.checkPlayerClosed();
});
