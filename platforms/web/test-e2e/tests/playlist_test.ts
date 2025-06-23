import { testConfigs } from '@jwp/ott-testing/constants';

import constants from '#utils/constants';
import { checkSelectedFilterButton, selectFilterAndCheck } from '#utils/filters';

const allFilters = ['Action', 'Fantasy', 'Comedy', 'Drama', 'All'];
const actionFilms = ['Agent 327', 'Coffee Run', 'Tears of Steel'];
const comedyFilms = ['Big Buck Bunny', 'Caminandes 1: Llama Drama', 'Caminandes 2: Gran Dillama'];
const dramaFilms = ['Elephants Dream', 'Glass Half'];

Feature('playlist').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);

  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.click('Films');

  I.seeAll(actionFilms);
  I.seeAll(comedyFilms);
  I.seeAll(dramaFilms);
});

Scenario('Playlist screen loads', async ({ I }) => {
  await checkSelectedFilterButton(I, 'All', allFilters);
});

Scenario('I can change the filter to "action"', async ({ I }) => {
  await checkSelectedFilterButton(I, 'All', allFilters);

  await selectFilterAndCheck(I, 'Action', allFilters);

  I.seeAll(actionFilms);
  I.dontSeeAny(comedyFilms);
  I.dontSeeAny(dramaFilms);
});

Scenario('I can reset the filter by selection the "All" option', async ({ I }) => {
  await selectFilterAndCheck(I, 'Drama', allFilters);

  I.seeAll(dramaFilms);
  I.dontSeeAny(actionFilms);
  I.dontSeeAny(comedyFilms);

  await selectFilterAndCheck(I, 'All', allFilters);

  I.seeAll(actionFilms);
  I.seeAll(comedyFilms);
  I.seeAll(dramaFilms);
});

Scenario('I can click on a card and navigate to the video screen', ({ I }) => {
  canNavigateToBigBuckBunny(I);
});

Scenario('I can filter and click on a card and navigate to the video screen', async ({ I }) => {
  await selectFilterAndCheck(I, 'Comedy', allFilters);
  canNavigateToBigBuckBunny(I);
});

function canNavigateToBigBuckBunny(I: CodeceptJS.I) {
  I.click({ css: 'a[data-testid="Big Buck Bunny"]' });

  I.see(constants.bigBuckBunnyDescription);
  I.see(constants.startWatchingButton);

  // Check the URL structure, but not the playlist and video ID
  I.seeInCurrentUrl(`${constants.baseUrl}m/`);
  I.seeInCurrentUrl('/big-buck-bunny?');
}
