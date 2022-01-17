import * as assert from "assert";

Feature('search').tag('@mobile');

const searchBarLocator = { css: 'input[aria-label="Search"]' };
const emptySearchPrompt = 'Type something in the search box to start searching';
const clearSearchLocator = { css: 'div[aria-label="Clear search"]' };

Before(({I}) => {
  I.amOnPage('http://localhost:8080');
  iSeeMainPage(I);
  I.dontSee(searchBarLocator);
  I.click({ css: 'div[aria-label="Open search"]' });

  // First click of search bar doesn't open the search window
  iSeeMainPage(I);
});

Scenario('I can activate the search bar by clicking on the search icon', async ({ I }) => {
  I.seeElement(searchBarLocator);

  assert.strictEqual('Search...', await I.grabAttributeFrom(searchBarLocator, 'placeholder'));

  // Search bar is empty by default
  assert.strictEqual('', await I.grabValueFrom(searchBarLocator));
});

Scenario('I can type a search phrase in the search bar', async ({ I }) => {
  I.fillField(searchBarLocator, 'Caminandes');
  I.seeElement(clearSearchLocator);

  checkSearchResults(I, ['Caminandes 1', 'Caminandes 2', 'Caminandes 3']);

  I.click(clearSearchLocator);
  assert.strictEqual('', await I.grabValueFrom(searchBarLocator));

  checkSearchResults(I, []);
  I.see(emptySearchPrompt);
});

Scenario('I can search by partial match', ({ I }) => {
  I.fillField(searchBarLocator, 'ani');
  I.seeElement(clearSearchLocator);

  checkSearchResults(I, ['Minecraft Animation Workshop', 'Animating the Throw', 'Primitive Animals']);
});

Scenario('I get empty search results when no videos match', async ({ I }) => {
  I.fillField(searchBarLocator, 'Axdfsdfgfgfd');
  I.seeElement(clearSearchLocator);

  checkSearchResults(I, []);

  I.see('No results found for "Axdfsdfgfgfd"');
  I.see('Suggestions:');
  I.see('Make sure all words are spelled correctly');
  I.see('Make search terms more general');
  I.see('Try different search terms');

  I.dontSee(emptySearchPrompt);
});

Scenario('I can close the search bar by clicking the close icon', async ({ I }) => {
  I.click({ css: 'div[aria-label="Close search"]' });
  I.dontSee(searchBarLocator)
  iSeeMainPage(I);
  I.seeCurrentUrlEquals('http://localhost:8080/');
});

function checkSearchResults(I: CodeceptJS.I, expectedResults: string[]) {
  I.dontSee('Blender Channel');
  I.dontSee('All Films');

  if (expectedResults.length > 0) {
    I.see('Search results');
    I.dontSee(emptySearchPrompt);
    I.dontSee('No results found');
    expectedResults.forEach(result => I.see(result));

  } else {
    I.dontSee('Search results');
    I.dontSeeElement('div[class*="cell"]');
    I.dontSeeElement('div[class*="card"]');
    I.dontSeeElement('div[class*="poster"]');
  }
}

function iSeeMainPage(I: CodeceptJS.I) {
  I.see('Blender Channel');
  I.see('All Films');

  I.dontSee('No results found');
  I.dontSee(emptySearchPrompt);
  I.dontSee('Search results');
}
