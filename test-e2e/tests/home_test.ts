import constants, { makeShelfXpath, ShelfId } from '#utils/constants';
import { testConfigs } from '#test/constants';

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

Scenario('I can slide within the featured shelf', async ({ I }) => {
  const isDesktop = await I.isDesktop();

  async function slide(swipeText) {
    if (isDesktop) {
      I.click({ css: 'div[aria-label="Slide right"]' });
    } else {
      await I.swipeLeft({ text: swipeText });
    }
  }

  await within(makeShelfXpath(ShelfId.featured), async () => {
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
});

Scenario('I can slide within non-featured shelves', async ({ I }) => {
  const isDesktop = await I.isDesktop();

  async function slideRight(swipeText) {
    if (isDesktop) {
      I.click({ css: 'div[aria-label="Slide right"]' }, makeShelfXpath(ShelfId.allFilms));
    } else {
      await I.swipeLeft({ text: swipeText });
    }
  }

  async function slideLeft(swipeText) {
    if (isDesktop) {
      I.click({ css: 'div[aria-label="Slide left"]' }, makeShelfXpath(ShelfId.allFilms));
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

Scenario('I can see alternate shelf images for the `All Films` shelf', async ({ I }) => {
  // scroll to shelf to make it visible and for screenshot
  await I.scrollToShelf(ShelfId.allFilms);
  await I.seeCardImageSrc('Agent 327', ShelfId.allFilms, 'https://img.jwplayer.com/v1/media/uB8aRnu6/images/shelf.webp?width=320');
  await I.seeCardImageSrc('Big Buck Bunny', ShelfId.allFilms, 'https://img.jwplayer.com/v1/media/awWEFyPu/images/shelf.webp?width=320');
});

Scenario('I can see poster images for the `All courses` shelf', async ({ I }) => {
  // scroll to shelf to make it visible and for screenshot
  await I.scrollToShelf(ShelfId.allCourses);
  await I.seeCardImageSrc('Primitive Animals', ShelfId.allCourses, 'https://cdn.jwplayer.com/v2/media/9NZgbtMV/poster.jpg?width=320');
  await I.seeCardImageSrc('Fantasy Vehicle Creation', ShelfId.allCourses, 'https://cdn.jwplayer.com/v2/media/b43Lsibs/poster.jpg?width=320');
});

Scenario('I can see the footer', ({ I }) => {
  I.scrollPageToBottom();
  I.see('© JW Player');
  I.see('jwplayer.com');
  I.click('jwplayer.com');
  I.switchToNextTab();
  I.seeCurrentUrlEquals('https://jwplayer.com/');
});
