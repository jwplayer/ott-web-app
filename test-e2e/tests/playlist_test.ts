import constants from '#utils/constants';
import { testConfigs } from '#test/constants';

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

const allFilters = ['Action', 'Fantasy', 'Comedy', 'Drama', 'All'];
const actionFilms = ['Agent 327', 'Coffee Run', 'Tears of Steel'];
const comedyFilms = ['Big Buck Bunny', 'Caminandes 1: Llama Drama', 'Caminandes 2: Gran Dillama'];
const dramaFilms = ['Elephants Dream', 'Glass Half'];

Scenario('Playlist screen loads', async ({ I }) => {
  await checkSelectedFilterButton(I, 'All');
});

Scenario('I can change the filter to "action"', async ({ I }) => {
  await checkSelectedFilterButton(I, 'All');

  await selectFilterAndCheck(I, 'Action');

  I.seeAll(actionFilms);
  I.dontSeeAny(comedyFilms);
  I.dontSeeAny(dramaFilms);
});

Scenario('I can reset the filter by selection the "All" option', async ({ I }) => {
  await selectFilterAndCheck(I, 'Drama');

  I.seeAll(dramaFilms);
  I.dontSeeAny(actionFilms);
  I.dontSeeAny(comedyFilms);

  await selectFilterAndCheck(I, 'All');

  I.seeAll(actionFilms);
  I.seeAll(comedyFilms);
  I.seeAll(dramaFilms);
});

Scenario('I can click on a card and navigate to the video screen', ({ I }) => {
  canNavigateToBigBuckBunny(I);
});

Scenario('I can filter and click on a card and navigate to the video screen', async ({ I }) => {
  await selectFilterAndCheck(I, 'Comedy');
  canNavigateToBigBuckBunny(I);
});

function canNavigateToBigBuckBunny(I: CodeceptJS.I) {
  I.click({ css: 'a[aria-label="Big Buck Bunny"]' });

  I.see(constants.bigBuckBunnyDescription);
  I.see(constants.startWatchingButton);

  // Check the URL structure, but not the playlist and video ID
  I.seeInCurrentUrl(`${constants.baseUrl}m/`);
  I.seeInCurrentUrl('/big-buck-bunny?');
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

    // Check that the 'All' button is visually active
    I.seeCssPropertiesOnElements({ xpath: `//button[contains(., "${expectedButton}")]` }, { color: 'rgb(0, 0, 0)', 'background-color': 'rgb(204, 204, 204)' });
    // Check that the other filter buttons are not visually active
    I.seeCssPropertiesOnElements(
      { xpath: `//div[contains(@class, "filterRow")]/button[not(contains(., "${expectedButton}"))]` },
      { color: 'rgb(255, 255, 255)', 'background-color': 'rgba(0, 0, 0, 0.6)' },
    );
  }
}
