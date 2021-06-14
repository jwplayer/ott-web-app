const assert = require('assert');

Feature('search').tag('@mobile');

Scenario('I can activate the search bar by clicking on the search icon', ({ I }) => {
  I.amOnPage('http://localhost:8080');
  I.click({ css: 'div[aria-label="Open search"]' });
  I.seeElement({ css: 'input[aria-label="Search"]' });
});

Scenario('I can type a search phrase in the search bar', ({ I }) => {
  I.fillField({ css: 'input[aria-label="Search"]' }, 'test');
  I.see('Search results');
});

Scenario('I get search results when typing a search phrase', ({ I }) => {
  I.fillField({ css: 'input[aria-label="Search"]' }, 'test');
  I.see('Search results');

  I.see('Bug test');
  I.see('Testing uploading');
  I.see('Ben is Back');
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

Scenario('I can close the search bar by clicking the close icon', async ({ I }) => {
  I.click({ css: 'div[aria-label="Close search"]' });
  I.dontSee({ css: 'input[aria-label="Search"]' })
  I.seeCurrentUrlEquals('http://localhost:8080/');
});
