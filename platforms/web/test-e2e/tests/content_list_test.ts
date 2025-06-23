import { testConfigs } from '@jwp/ott-testing/constants';

import constants from '#utils/constants';
import { checkSelectedFilterButton, selectFilterAndCheck } from '#utils/filters';

const allFilters = ['Fantasy', 'Drama', 'All'];
const dramaFilms = ['Spring', 'Tears of Steel Trailer'];
const fantasyFilms = ['Elephants Dream Trailer', 'Sintel Trailer', 'Cosmos Laundromat Trailer'];

Feature('content list').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);

  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.click('Popular');
  I.seeAll(fantasyFilms);
  I.seeAll(dramaFilms);
});

Scenario('Content list screen loads', async ({ I }) => {
  await checkSelectedFilterButton(I, 'All', allFilters);
});

Scenario('I can change the filter to "fantasy"', async ({ I }) => {
  await checkSelectedFilterButton(I, 'All', allFilters);
  await selectFilterAndCheck(I, 'Fantasy', allFilters);

  I.seeAll(fantasyFilms);
  I.dontSeeAny(dramaFilms);
});

Scenario('I can reset the filter by selecting "all" button', async ({ I }) => {
  await selectFilterAndCheck(I, 'Drama', allFilters);
  I.seeAll(dramaFilms);
  I.dontSeeAny(fantasyFilms);

  await selectFilterAndCheck(I, 'All', allFilters);
  I.seeAll(fantasyFilms);
  I.seeAll(dramaFilms);
});

Scenario('I can click on a card and navigate to the video details screen', ({ I }) => {
  canNavigateToElephantsDreamTrailer(I);
});

Scenario('I can filter and click on a card and navigate to the video details screen', async ({ I }) => {
  await selectFilterAndCheck(I, 'Fantasy', allFilters);
  canNavigateToElephantsDreamTrailer(I);
});

function canNavigateToElephantsDreamTrailer(I: CodeceptJS.I) {
  I.click({ css: 'a[data-testid="Elephants Dream Trailer"]' });
  I.see(constants.elephantsDreamTrailerTitle);
  I.see(constants.startWatchingButton);

  I.seeInCurrentUrl(`${constants.baseUrl}m/`);
  I.seeInCurrentUrl('/elephants-dream-trailer?');
}
