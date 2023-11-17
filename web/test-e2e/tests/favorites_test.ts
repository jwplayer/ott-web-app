import * as assert from 'assert';

import constants, { makeShelfXpath, ShelfId } from '#utils/constants';
import { testConfigs } from '#test/constants';

const videoTitle = 'Tears of Steel';

Feature('favorites').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
});

const favoritesTitle = 'Favorites';

Scenario('I can add a video to my favorites', async ({ I }) => {
  await addVideoToFavorites(I);

  const savedFavorites = await I.executeScript(function () {
    return JSON.parse(localStorage.getItem('jwapp.favorites') || '');
  });

  const url = new URL(await I.grabCurrentUrl());
  const mediaId = url.pathname.split('/')[2];

  assert.deepEqual(savedFavorites, [{ mediaid: mediaId }]);
});

Scenario('I can remove a video from my favorites', async ({ I }) => {
  await addVideoToFavorites(I);
  I.forceClick({ css: 'button[aria-label="Remove from favorites"]' });

  I.seeElement({ css: 'button[aria-label="Add to favorites"]' });

  const savedFavorites = await I.executeScript(function () {
    return JSON.parse(localStorage.getItem('jwapp.favorites') || '');
  });

  assert.strictEqual(savedFavorites.length, 0);
});

Scenario('I can see my favorited videos on the home page', async ({ I }) => {
  I.amOnPage(constants.baseUrl);
  I.dontSee(favoritesTitle);

  await addVideoToFavorites(I);

  I.amOnPage(constants.baseUrl);
  I.see(favoritesTitle);
  I.see(videoTitle, makeShelfXpath(ShelfId.favorites));
});

Scenario('I do not see favorited videos on the home page and video page if there is not such config setting', async ({ I }) => {
  await addVideoToFavorites(I);

  I.useConfig(testConfigs.cleengAuthvodNoWatchlist);

  // No favorites section
  I.seeInCurrentUrl(constants.baseUrl);
  I.dontSee(favoritesTitle);

  // No favorites button
  await I.openVideoCard(videoTitle, ShelfId.allFilms, false);
  I.see(constants.signUpToWatch);
  I.dontSee('Favorite');
});

async function addVideoToFavorites(I) {
  await I.openVideoCard(videoTitle, ShelfId.allFilms, false);
  I.see('Favorite');

  I.scrollTo({ css: 'button[aria-label="Add to favorites"]' });
  I.forceClick({ css: 'button[aria-label="Add to favorites"]' });
  I.seeElement({ css: 'button[aria-label="Remove from favorites"]' });
}
