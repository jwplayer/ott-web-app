import { testConfigs } from '@jwp/ott-testing/constants';

import constants, { makeShelfXpath, ShelfId } from '#utils/constants';

Feature('home').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Before(({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
});

Scenario('Home screen loads', async ({ I }) => {
  I.see('Blender');
  I.see('Agent 327');
  I.see('LIVE');

  // On mobile, the headings are nested in the hamburger menu
  if (await I.isMobile()) {
    I.waitForInvisible('Home', 0);
    I.waitForInvisible('Films', 0);
    I.waitForInvisible('Courses', 0);

    I.openMenuDrawer();
  }

  I.waitForInvisible('Home', 0);
  I.waitForInvisible('Films', 0);
  I.waitForInvisible('Courses', 0);
});

Scenario('Header button navigates to playlist screen', async ({ I }) => {
  if (await I.isMobile()) {
    I.openMenuDrawer();
  }

  I.see('Films');
  I.click('Films');
  I.seeInCurrentUrl(`${constants.baseUrl}p/`);
  I.see('All Films');
  I.see('The Daily Dweebs');
});

// @todo: this test requires the testconfig to have `layoutType: 'hero'` on the first shelf
// eslint-disable-next-line codeceptjs/no-skipped-tests
Scenario.skip('I can slide within the hero shelf', async ({ I }) => {
  const isDesktop = await I.isDesktop();
  const visibleTileLocator = locate({ css: `section[data-testid="shelf-${ShelfId.hero}"] div[data-testid="shelf-hero-metadata--visible"]` });

  async function slide(swipeText: string, forward = true) {
    if (isDesktop) {
      I.click({ css: `button[aria-label="${forward ? 'Next' : 'Previous'} slide"]` });
    } else {
      await I[forward ? 'swipeLeft' : 'swipeRight']({ text: swipeText });
    }
  }

  await within(makeShelfXpath(ShelfId.hero), async () => {
    I.see('Blender Channel');
  });

  await within(visibleTileLocator, function () {
    I.dontSee('Spring');
    I.dontSee('Spring is a 2019 animated');
  });

  await within(makeShelfXpath(ShelfId.hero), async () => {
    await slide('Blender Channel');
  });

  await within(visibleTileLocator, function () {
    I.waitForElement('text=Spring', 3);
    I.see('Spring is a 2019 animated');
  });

  // Without this extra wait, the second slide action happens too fast after the first and even though the
  // expected elements are present, the slide doesn't work. I think there must be a debounce check on the carousel.
  I.wait(1);

  await within(makeShelfXpath(ShelfId.hero), async () => {
    await slide('Spring', false);
  });

  await within(visibleTileLocator, function () {
    I.waitForElement('text="Blender Channel"', 3);
    I.dontSee('Spring');
  });
});

Scenario('I can slide within the featured shelf', async ({ I }) => {
  const isDesktop = await I.isDesktop();
  const visibleTilesLocator = locate({ css: `section[data-testid="shelf-${ShelfId.featured}"] .TileSlider--visible` });

  async function slide(swipeText: string) {
    if (isDesktop) {
      I.click({ css: 'button[aria-label="Next slide"]' });
    } else {
      await I.swipeLeft({ text: swipeText });
    }
  }

  await within(makeShelfXpath(ShelfId.featured), async () => {
    I.see('Blender Channel');
  });

  await within(visibleTilesLocator, function () {
    I.dontSee('Spring');
    I.dontSee('8 min');
  });

  await within(makeShelfXpath(ShelfId.featured), async () => {
    await slide('Blender Channel');
  });

  await within(visibleTilesLocator, function () {
    I.waitForElement('text=Spring', 3);
    I.see('8 min');
  });

  // Without this extra wait, the second slide action happens too fast after the first and even though the
  // expected elements are present, the slide doesn't work. I think there must be a debounce check on the carousel.
  I.wait(1);

  await within(makeShelfXpath(ShelfId.featured), async () => {
    await slide('Spring');
  });

  await within(visibleTilesLocator, function () {
    I.waitForElement('text="Blender Channel"', 3);
    I.dontSee('Spring');
  });
});

Scenario('I can slide within non-featured shelves', async ({ I }) => {
  const isDesktop = await I.isDesktop();
  const visibleTilesLocator = locate({ css: `section[data-testid="shelf-${ShelfId.allFilms}"] .TileSlider--visible` });

  async function slideRight(swipeText) {
    if (isDesktop) {
      I.click({ css: 'button[aria-label="Next slide"]' }, makeShelfXpath(ShelfId.allFilms));
    } else {
      await I.swipeLeft({ text: swipeText });
    }
  }

  async function slideLeft(swipeText) {
    if (isDesktop) {
      I.click({ css: 'button[aria-label="Previous slide"]' }, makeShelfXpath(ShelfId.allFilms));
    } else {
      await I.swipeRight({ text: swipeText });
    }
  }

  const rightMedia = isDesktop
    ? { name: 'Cosmos Laundromat', duration: '13 min' }
    : {
        name: 'Elephants Dream',
        duration: '11 min',
      };

  await within(makeShelfXpath(ShelfId.allFilms), function () {
    I.see('All Films');
  });

  await within(visibleTilesLocator, function () {
    I.see('Agent 327');
    I.see('4 min');
    I.dontSee(rightMedia.name);
    I.dontSee(rightMedia.duration);
  });

  await slideRight('Agent 327');

  await within(visibleTilesLocator, function () {
    I.waitForText(rightMedia.name, 3);
    I.waitForText(rightMedia.duration, 3);
    I.dontSee('Agent 327');
  });

  // Without this extra wait, the second slide action happens too fast after the first and even though the
  // expected elements are present, the slide doesn't work. I think there must be a debounce on the carousel.
  I.wait(1);
  await slideLeft(rightMedia.name);

  await within(visibleTilesLocator, function () {
    I.waitForElement('text="Agent 327"', 3);
    I.dontSee(rightMedia.name);
  });

  // Without this extra wait, the second slide action happens too fast after the first and even though the
  // expected elements are present, the slide doesn't work. I think there must be a debounce on the carousel.
  I.wait(1);
  await slideLeft('Agent 327');

  await within(visibleTilesLocator, function () {
    I.waitForText('The Daily Dweebs', 3);
    I.dontSee('Agent 327');
  });
});

Scenario('I can see the footer', ({ I }) => {
  I.scrollPageToBottom();
  I.see('© JW Player');
  I.see('jwplayer.com');
  I.click('jwplayer.com');
  I.wait(2);
  I.switchToNextTab();
  I.seeCurrentUrlEquals('https://jwplayer.com/');
});
