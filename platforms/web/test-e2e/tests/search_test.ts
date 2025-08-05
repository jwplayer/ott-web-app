import * as assert from 'assert';

import { testConfigs } from '@jwp/ott-testing/constants';

import constants from '#utils/constants';

const openSearchLocator = { css: 'button[aria-label="Open search"]' };
const searchBarLocator = 'input[type="search"]';
const emptySearchPrompt = 'Type something in the search box to start searching';
const clearSearchLocator = { css: 'button[aria-label="Clear search"]' };
const closeSearchLocator = { css: 'button[aria-label="Close search"]' };

Feature('search').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  verifyOnHomePage(I);
});

Scenario('Opening / activating search bar stays on home page', async ({ I }) => {
  await openSearch(I);

  verifyOnHomePage(I);

  I.seeElement(searchBarLocator);

  assert.strictEqual('Search...', await I.grabAttributeFrom(searchBarLocator, 'placeholder'));

  // Search bar is empty by default
  assert.strictEqual('', await I.grabValueFrom(searchBarLocator));
});

Scenario('Closing search return to original page (@mobile-only)', async ({ I }) => {
  await I.openVideoCard(constants.elephantsDreamTitle);
  I.see(constants.elephantsDreamTitle);
  const url = await I.grabCurrentUrl();

  await openSearch(I);

  I.seeCurrentUrlEquals(url);

  I.seeElement(searchBarLocator);
  I.fillField(searchBarLocator, 'Test');
  I.seeCurrentUrlEquals(`${constants.baseUrl}q/Test`);
  I.dontSee(constants.elephantsDreamTitle);

  I.fillField(searchBarLocator, 'HelloWorld');
  I.seeCurrentUrlEquals(`${constants.baseUrl}q/HelloWorld`);
  I.dontSee(constants.elephantsDreamTitle);

  I.click(closeSearchLocator);
  I.seeCurrentUrlEquals(url);
  I.see(constants.elephantsDreamTitle);
});

Scenario('I can type a search phrase in the search bar', async ({ I }) => {
  const searchTerm = 'Caminandes';
  await openSearch(I);
  I.fillField(searchBarLocator, searchTerm);
  I.seeElement(clearSearchLocator);

  checkSearchResults(I, searchTerm, 3, ['Caminandes 1', 'Caminandes 2', 'Caminandes 3']);

  I.click(clearSearchLocator);
  assert.strictEqual('', await I.grabValueFrom(searchBarLocator));

  I.dontSee('Search results');
  I.see(emptySearchPrompt);
});

Scenario('I can search by partial match', async ({ I }) => {
  const searchTerm = 'ani';
  await openSearch(I);
  I.fillField(searchBarLocator, searchTerm);
  I.seeElement(clearSearchLocator);

  checkSearchResults(I, searchTerm, 5, ['Minecraft Animation Workshop', 'Animating the Throw', 'Primitive Animals']);
});

Scenario('I get empty search results when no videos match', async ({ I }) => {
  const searchTerm = 'Axdfsdfgfgfd';
  await openSearch(I);
  I.fillField(searchBarLocator, searchTerm);
  I.seeElement(clearSearchLocator);

  checkSearchResults(I, searchTerm, 0, []);

  I.see('No results found for "Axdfsdfgfgfd"');
  I.see('Suggestions:');
  I.see('Make sure all words are spelled correctly');
  I.see('Make search terms more general');
  I.see('Try different search terms');

  I.dontSee(emptySearchPrompt);
});

Scenario('The search URL is encoded', async ({ I }) => {
  await openSearch(I);

  I.fillField(searchBarLocator, 'Hello/World! How are you? 這是中國人');
  I.seeInCurrentUrl(`${constants.baseUrl}q/Hello%2FWorld!%20How%20are%20you%3F%20%E9%80%99%E6%98%AF%E4%B8%AD%E5%9C%8B%E4%BA%BA`);
});

Scenario('I can clear the search phrase with the clear button', async ({ I }) => {
  await openSearch(I);
  I.fillField(searchBarLocator, 'Hello');
  I.seeElement(clearSearchLocator);
  I.click(clearSearchLocator);

  I.see(emptySearchPrompt);
  I.dontSee('No results found');
  I.dontSee('Suggestions:');

  I.waitForValue(searchBarLocator, '', 0);
});

Scenario('I can clear the search phrase manually', async ({ I }) => {
  await openSearch(I);
  I.fillField(searchBarLocator, 'Hello');

  I.click(searchBarLocator);
  I.pressKey(['CommandOrControl', 'A']);
  I.pressKey('Backspace');

  I.see(emptySearchPrompt);
  I.dontSee('No results found');
  I.dontSee('Suggestions:');
});

function checkSearchResults(I: CodeceptJS.I, searchTerm: string, expectedResults: number, searchMatches: string[]) {
  I.dontSee('Blender Channel');
  I.dontSee('All Films');

  if (expectedResults > 0) {
    I.see(`${expectedResults} results for "${searchTerm}"`, 'h1');
    I.dontSee(emptySearchPrompt);
    I.dontSee('No results found');
    searchMatches.forEach((result) => I.see(result));
  } else {
    I.see(`No results found for "${searchTerm}"`, 'h1');
    I.dontSeeElement('div[class*="cell"]');
    I.dontSeeElement('div[class*="card"]');
    I.dontSeeElement('div[class*="poster"]');
  }
}

function verifyOnHomePage(I: CodeceptJS.I) {
  I.see('Blender Channel');
  I.see('All Films');

  I.dontSee('No results found');
  I.dontSee(emptySearchPrompt);
  I.dontSee('Search results');
}

async function openSearch(I: CodeceptJS.I) {
  I.dontSeeElement(searchBarLocator);
  I.click(openSearchLocator);

  I.seeElement(searchBarLocator);
}
