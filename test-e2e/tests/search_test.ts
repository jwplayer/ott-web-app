import * as assert from "assert";

Feature('search').tag('@desktop');

Scenario('Search bar is visible', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.seeElement({ css: 'input[aria-label="Search"]' });
});

Scenario('I can type a search phrase in the search bar', ({ I }) => {
  I.fillField({ css: 'input[aria-label="Search"]' }, 'Caminandes');
  I.see('Search results');
});

Scenario('I get search results when typing a search phrase', ({ I }) => {
  I.fillField({ css: 'input[aria-label="Search"]' }, 'Caminandes');
  I.see('Search results');

  I.see('Caminandes 1');
  I.see('Caminandes 2');
  I.see('Caminandes 3');
});

Scenario('I can clear the search phrase with the clear button', async ({ I }) => {
  I.seeElement({ css: 'div[aria-label="Clear search"]' });
  I.seeElement({ css: 'input[aria-label="Search"]' });

  I.click({ css: 'div[aria-label="Clear search"]' });

  const clearedPhrase = await I.grabValueFrom({ css: 'input[aria-label="Search"]' });
  assert.strictEqual('', clearedPhrase);

});

Scenario('I see a message when the search phrase is empty', async ({ I }) => {
  I.see('Type something in the search box to start searching');
});
