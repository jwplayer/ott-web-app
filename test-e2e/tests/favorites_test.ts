import * as assert from 'assert';

Feature('favorites');

Scenario('I can add a video to my favorites', async ({ I }) => {
  addVideoToFavorites(I);

  const savedFavorites = await I.executeScript(function() {
    return JSON.parse(localStorage.getItem('jwshowcase.favorites') || '');
  });

  assert.deepEqual(savedFavorites, [{ mediaid: '6o9KxWAo', title: 'Tears of Steel', duration: 734, tags: 'movie,Action'}]);
});

Scenario('I can remove a video from my favorites', async({ I }) => {
  addVideoToFavorites(I);
  I.forceClick({ css: 'button[aria-label="Remove from favorites"]' });

  I.seeElement({ css: 'button[aria-label="Add to favorites"]' });

  const savedFavorites = await I.executeScript(function() {
    return JSON.parse(localStorage.getItem('jwshowcase.favorites') || '');
  });

  assert.strictEqual(savedFavorites.length, 0);
});

Scenario('I can see my favorited videos on the home page', async ({ I }) => {
  I.amOnPage('http://localhost:8080/');
  I.dontSee('Favorites');

  addVideoToFavorites(I);

  I.amOnPage('http://localhost:8080/');
  I.see('Favorites')
  I.see('Tears of Steel', { css: '[data-mediaid="favorites"]'});
});

function addVideoToFavorites(I) {
  I.amOnPage('http://localhost:8080/m/6o9KxWAo/tears-of-steel?r=D4soEviP');
  I.see('Favorite');

  I.scrollTo({ css: 'button[aria-label="Add to favorites"]' });
  I.forceClick({ css: 'button[aria-label="Add to favorites"]' });
  I.seeElement({ css: 'button[aria-label="Remove from favorites"]' });
}