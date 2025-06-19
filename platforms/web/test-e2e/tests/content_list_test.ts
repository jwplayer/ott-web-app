import { testConfigs } from '@jwp/ott-testing/constants';

import constants from '#utils/constants';

const allFilters = ['Fantasy', 'Drama', 'All'];
const fantasyFilms = ['Elephants Dream Trailer', 'Sintel Trailer', 'Cosmos Laundromat Trailer'];
const dramaFilms = ['Spring', 'Tears of Steel Trailer'];

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
  await checkSelectedFilterButton(I, 'All');
});

Scenario('I can change the filter to "fantasy"', async ({ I }) => {
  await checkSelectedFilterButton(I, 'All');
  await selectFilterAndCheck(I, 'Fantasy');

  I.seeAll(fantasyFilms);
  I.dontSeeAny(dramaFilms);
});

Scenario('I can reset the filter by selecting "all" button', async ({ I }) => {
  await selectFilterAndCheck(I, 'Drama');
  I.seeAll(dramaFilms);
  I.dontSeeAny(fantasyFilms);

  await selectFilterAndCheck(I, 'All');
  I.seeAll(fantasyFilms);
  I.seeAll(dramaFilms);
});

Scenario('I can click on a card and navigate to the video details screen', ({ I }) => {
  canNavigateToElephantsDreamTrailer(I);
});

Scenario('I can filter and click on a card and navigate to the video details screen', async ({ I }) => {
  await selectFilterAndCheck(I, 'Fantasy');
  canNavigateToElephantsDreamTrailer(I);
});

function canNavigateToElephantsDreamTrailer(I: CodeceptJS.I) {
  I.click({ css: 'a[data-testid="Elephants Dream Trailer"]' });
  I.see(constants.elephantsDreamTrailerTitle);
  I.see(constants.startWatchingButton);

  I.seeInCurrentUrl(`${constants.baseUrl}m/`);
  I.seeInCurrentUrl('/elephants-dream-trailer?');
}

async function selectFilterAndCheck(I: CodeceptJS.I, option) {
  if (await I.isMobile()) {
    I.selectOption('Filter videos by genre', option);
  } else {
    I.click(option);
  }

  await checkSelectedFilterButton(I, option);
}

async function checkSelectedFilterButton(I: CodeceptJS.I, expectedButton) {
  if (await I.isMobile()) {
    I.see(expectedButton);
    I.waitForAllInvisible(
      allFilters.filter((f) => f !== expectedButton),
      0,
    );
  } else {
    I.seeAll(allFilters);
    I.see(expectedButton, 'div[class*=filterRow] button[class*=active]');
    I.wait(0.1);

    // Check that the 'All' button is visually active
    await I.seeCssProperties({ xpath: `//button[contains(., "${expectedButton}")]` }, { color: 'rgb(0, 0, 0)', 'background-color': 'rgb(204, 204, 204)' });
    // Check that the other filter buttons are not visually active
    await I.seeCssProperties(
      { xpath: `//div[contains(@class, "filterRow")]/button[not(contains(., "${expectedButton}"))]` },
      { color: 'rgb(255, 255, 255)', 'background-color': 'rgba(0, 0, 0, 0.3)' },
    );
  }
}
