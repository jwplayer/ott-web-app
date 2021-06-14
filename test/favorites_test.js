const assert = require('assert');

Feature('favorites').tag('@desktop').tag('@mobile');

Scenario('I can add a video to my favorites', async ({ I }) => {
  I.amOnPage('http://localhost:8080/m/DqGECHhT/central-intelligence?list=WXu7kuaW');
  I.see('Favorite');

  I.scrollTo({ css: 'button[aria-label="Add to favorites"]' });
  I.forceClick({ css: 'button[aria-label="Add to favorites"]' });
  I.seeElement({ css: 'button[aria-label="Remove from favorites"]' });

  const savedFavorites = await I.executeScript(function() {
    return JSON.parse(localStorage.getItem('jwshowcase.favorites'));
  });

  assert.deepEqual(savedFavorites, [{ mediaid: 'DqGECHhT', title: 'Central Intelligence', duration: '109', tags: 'action and adventure and fun,comedy,trailer,simi dash feed'}]);
});

Scenario('I can remove a video from my favorites', async({ I }) => {
  I.forceClick({ css: 'button[aria-label="Remove from favorites"]' });

  I.seeElement({ css: 'button[aria-label="Add to favorites"]' });

  const savedFavorites = await I.executeScript(function() {
    return JSON.parse(localStorage.getItem('jwshowcase.favorites'));
  });

  assert.strictEqual(savedFavorites.length, 0);
});

Scenario('I can see my favorited videos on the home page', async ({ I }) => {
  I.amOnPage('http://localhost:8080/');
  I.dontSee('Favorites');

  I.amOnPage('http://localhost:8080/m/DqGECHhT/central-intelligence?list=WXu7kuaW');
  I.see('Favorite');

  I.scrollTo({ css: 'button[aria-label="Add to favorites"]' });
  I.forceClick({ css: 'button[aria-label="Add to favorites"]' });
  I.seeElement({ css: 'button[aria-label="Remove from favorites"]' });

  I.amOnPage('http://localhost:8080/');
  I.see('Favorites')
  I.see('Central Intelligence', { css: '[data-mediaid="favorites"]'});
});
