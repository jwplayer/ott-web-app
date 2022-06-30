import * as assert from 'assert';

Feature('favorites').retry(3);

Scenario('I can add a video to my favorites', async ({ I }) => {
  addVideoToFavorites(I);

  const savedFavorites = await I.executeScript(function () {
    return JSON.parse(localStorage.getItem('jwapp.favorites') || '');
  });

  assert.deepEqual(savedFavorites, [{ mediaid: '6o9KxWAo' }]);
});

Scenario('I can remove a video from my favorites', async ({ I }) => {
  addVideoToFavorites(I);
  I.forceClick({ css: 'button[aria-label="Remove from favorites"]' });

  I.seeElement({ css: 'button[aria-label="Add to favorites"]' });

  const savedFavorites = await I.executeScript(function () {
    return JSON.parse(localStorage.getItem('jwapp.favorites') || '');
  });

  assert.strictEqual(savedFavorites.length, 0);
});

Scenario('I can see my favorited videos on the home page', async ({ I }) => {
  I.amOnPage('http://localhost:8080/');
  I.dontSee('Favorites');

  addVideoToFavorites(I);

  I.amOnPage('http://localhost:8080/');
  I.see('Favorites');
  I.see('Tears of Steel', { css: '[data-mediaid="favorites"]' });
});

Scenario('I do not see favorited videos on the home page and video page if there is not such config setting', async ({ I }) => {
  I.useConfig('test--watchlists');

  I.amOnPage('http://localhost:8080/');
  I.dontSee('Favorites');

  I.amOnPage('http://localhost:8080/m/6o9KxWAo/tears-of-steel?r=D4soEviP');
  I.dontSee('Favorite');
});

function addVideoToFavorites(I) {
  I.amOnPage('http://localhost:8080/m/6o9KxWAo/tears-of-steel?r=D4soEviP');
  I.see('Favorite');

  I.scrollTo({ css: 'button[aria-label="Add to favorites"]' });
  I.forceClick({ css: 'button[aria-label="Add to favorites"]' });
  I.seeElement({ css: 'button[aria-label="Remove from favorites"]' });
}
