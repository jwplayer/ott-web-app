import { testConfigs } from '@jwp/ott-testing/constants';

import constants from '#utils/constants';

Feature('content list').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);

  if (await I.isMobile()) {
    I.openMenuDrawer();
  }
});

Scenario('Header button navigates to content list screen', async ({ I }) => {
  I.see('Popular');
  I.click('Popular');
  I.seeInCurrentUrl(`${constants.baseUrl}n/`);
  I.see('All Popular');
});
