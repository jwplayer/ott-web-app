import constants from '../utils/constants';

Feature('home').retry(3);

Before(({ I }) => {
  I.useConfig('test--blender');
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
  I.amOnPage(`${constants.baseUrl}p/${constants.filmsPlaylistId}`);
  I.see('All Films');
  I.see('The Daily Dweebs');
});

Scenario('I can slide within the featured shelf', async ({ I }) => {
  const isDesktop = await I.isDesktop();

  async function slide(swipeText) {
    if (isDesktop) {
      I.click({ css: 'div[aria-label="Slide right"]' });
    } else {
      await I.swipeLeft({ text: swipeText });
    }
  }

  I.see('Blender Channel');
  I.see('LIVE');
  I.dontSee('Spring');
  I.dontSee('8 min');

  await slide('Blender Channel');

  I.waitForElement('text=Spring', 3);
  I.see('8 min');
  I.waitForInvisible('text="Blender Channel"', 3);
  I.dontSee('Blender Channel');
  I.dontSee('LIVE');

  // Without this extra wait, the second slide action happens too fast after the first and even though the
  // expected elements are present, the slide doesn't work. I think there must be a debounce on the carousel.
  I.wait(1);

  await slide('Spring');

  I.waitForElement('text="Blender Channel"', 3);
  I.dontSee('Spring');
});

Scenario('I can slide within non-featured shelves', async ({ I }) => {
  const isDesktop = await I.isDesktop();

  async function slideRight(swipeText) {
    if (isDesktop) {
      I.click({ css: 'div[aria-label="Slide right"]' }, `div[data-mediaid="${constants.filmsPlaylistId}"]`);
    } else {
      await I.swipeLeft({ text: swipeText });
    }
  }

  async function slideLeft(swipeText) {
    if (isDesktop) {
      I.click({ css: 'div[aria-label="Slide left"]' }, `div[data-mediaid="${constants.filmsPlaylistId}"]`);
    } else {
      await I.swipeRight({ text: swipeText });
    }
  }

  const rightMedia = isDesktop ? { name: 'Cosmos Laundromat', duration: '13 min' } : { name: 'Big Buck Bunny', duration: '10 min' };

  I.see('All Films');
  I.see('Agent 327');
  I.see('4 min');
  I.dontSee(rightMedia.name);
  I.dontSee(rightMedia.duration);
  await slideRight('Agent 327');
  I.waitForElement(`text="${rightMedia.name}"`, 3);
  I.see(rightMedia.duration);
  I.dontSee('Agent 327');

  // Without this extra wait, the second slide action happens too fast after the first and even though the
  // expected elements are present, the slide doesn't work. I think there must be a debounce on the carousel.
  I.wait(1);
  await slideLeft(rightMedia.name);

  I.waitForElement('text="Agent 327"', 3);
  I.dontSee(rightMedia.name);

  // Without this extra wait, the second slide action happens too fast after the first and even though the
  // expected elements are present, the slide doesn't work. I think there must be a debounce on the carousel.
  I.wait(1);
  await slideLeft('Agent 327');

  I.waitForText('The Daily Dweebs', 3);
  I.dontSee('Agent 327');
});

Scenario('I can see the footer', ({ I }) => {
  I.scrollPageToBottom();
  I.see('© Blender Foundation');
  I.see('cloud.blender.org');
  I.click('cloud.blender.org');
});
