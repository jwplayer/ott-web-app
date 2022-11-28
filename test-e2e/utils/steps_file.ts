import * as assert from 'assert';

import { TestConfig } from '#test/constants';
import constants, { makeShelfXpath, normalTimeout, ShelfId } from '#utils/constants';
import passwordUtils, { LoginContext } from '#utils/password_utils';

const configFileQueryKey = 'app-config';
const loaderElement = '[class*=_loadingOverlay]';

const stepsObj = {
  useConfig: function (this: CodeceptJS.I, config: TestConfig) {
    const url = new URL(constants.baseUrl);
    url.searchParams.delete(configFileQueryKey);
    url.searchParams.append(configFileQueryKey, config.id);

    this.amOnPage(url.toString());
    this.waitForLoaderDone();
  },
  login: async function (this: CodeceptJS.I, { email, password }: { email: string; password: string }) {
    await this.openSignInMenu();
    this.click('Sign in');

    this.waitForElement('input[name=email]', normalTimeout);
    this.fillField('email', email);
    this.waitForElement('input[name=password]', normalTimeout);
    this.fillField('password', password);
    this.submitForm(15);

    this.dontSee('Incorrect email/password combination');
    this.dontSee(constants.loginFormSelector);

    return {
      email,
      password,
    };
  },
  logout: async function (this: CodeceptJS.I) {
    await this.openMainMenu();

    this.click('div[aria-label="Log out"]');
  },
  // This function will register the user on the first call and return the context
  // then assuming context is passed in the next time, will log that same user back in
  // Use it for tests where you want a new user for the suite, but not for each test
  registerOrLogin: async function (this: CodeceptJS.I, context: LoginContext | undefined, onRegister?: () => void) {
    if (context) {
      await this.login({ email: context.email, password: context.password });
    } else {
      context = { email: passwordUtils.createRandomEmail(), password: passwordUtils.createRandomPassword() };

      await this.openSignInMenu();
      this.click('Sign up');

      await this.fillRegisterForm(context, onRegister);
    }

    return context;
  },
  fillRegisterForm: async function (this: CodeceptJS.I, context: LoginContext, onRegister?: () => void) {
    await this.seeQueryParams({ u: 'create-account' });
    this.waitForElement(constants.registrationFormSelector, normalTimeout);

    this.fillField('Email', context.email);
    this.wait(2);

    this.clearField('Password');
    this.fillField('Password', context.password);
    this.wait(2);

    this.checkOption('Terms and Conditions');
    this.click('Continue');
    this.waitForElement('form[data-testid="personal_details-form"]', 20);

    if (onRegister) {
      onRegister();
    } else {
      this.clickCloseButton();
    }
  },
  submitForm: function (this: CodeceptJS.I, loaderTimeout: number | false = normalTimeout) {
    this.click('button[type="submit"]');
    this.waitForLoaderDone(loaderTimeout);
  },
  waitForLoaderDone: function (this: CodeceptJS.I, timeout: number | false = normalTimeout) {
    // Specify false when the loader is NOT expected to be shown at all
    if (timeout === false) {
      this.dontSeeElement(loaderElement);
    } else {
      this.waitForInvisible(loaderElement, timeout);
    }
  },
  openSignInMenu: async function (this: CodeceptJS.I) {
    const isMobile = await this.isMobile();
    if (isMobile) {
      this.openMenuDrawer();
    }

    return { isMobile };
  },
  openMainMenu: async function (this: CodeceptJS.I) {
    const { isMobile } = await this.openSignInMenu();

    if (!isMobile) {
      this.openUserMenu();
    }

    return isMobile;
  },
  openMenuDrawer: function (this: CodeceptJS.I) {
    this.click('div[aria-label="Open menu"]');
  },
  openUserMenu: function (this: CodeceptJS.I) {
    this.click('div[aria-label="Open user menu"]');
  },
  clickCloseButton: function (this: CodeceptJS.I) {
    this.click('div[aria-label="Close"]');
  },
  seeAll: function (this: CodeceptJS.I, allStrings: string[]) {
    allStrings.forEach((s) => this.see(s));
  },
  dontSeeAny: function (this: CodeceptJS.I, allStrings: string[]) {
    allStrings.forEach((s) => this.dontSee(s));
  },
  waitForAllInvisible: function (this: CodeceptJS.I, allStrings: string[], timeout: number | undefined = undefined) {
    allStrings.forEach((s) => this.waitForInvisible(s, timeout));
  },
  swipeLeft: async function (this: CodeceptJS.I, args) {
    args.direction = 'left';
    await this.swipe(args);
  },
  swipeRight: async function (this: CodeceptJS.I, args) {
    args.direction = 'right';
    await this.swipe(args);
  },
  swipe: async function (this: CodeceptJS.I, args) {
    await this.executeScript((args) => {
      const xpath = args.xpath || `//*[text() = "${args.text}"]`;

      const points =
        args.direction === 'left'
          ? { x1: 100, y1: 1, x2: 50, y2: 1 }
          : args.direction === 'right'
          ? {
              x1: 50,
              y1: 1,
              x2: 100,
              y2: 1,
            }
          : args.points;

      const element = document.evaluate(xpath, document, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null).singleNodeValue;

      if (!element) {
        throw `Could not find element by xpath: "${xpath}"`;
      }

      element.dispatchEvent(
        new TouchEvent('touchstart', {
          bubbles: true,
          touches: [
            new Touch({
              identifier: Date.now(),
              target: element,
              clientX: points.x1,
              clientY: points.y1,
            }),
          ],
        }),
      );

      element.dispatchEvent(
        new TouchEvent('touchend', {
          bubbles: true,
          changedTouches: [
            new Touch({
              identifier: Date.now() + 1,
              target: element,
              clientX: points.x2,
              clientY: points.y2,
            }),
          ],
        }),
      );
    }, args);
  },
  waitForPlayerPlaying: async function (title, tries = normalTimeout) {
    this.seeElement('div[class*="jwplayer"]');
    this.see(title);
    await this.waitForPlayerState('playing', ['buffering', 'idle', ''], tries);
  },
  waitForPlayerState: async function (this: CodeceptJS.I, expectedState, allowedStates: string[] = [], tries = 5) {
    // Since this check executes a script in the browser, it won't use the codecept retries,
    // so we have to manually retry (this is because the video can take time to load and the state will be buffering)
    for (let i = 0; i < tries; i++) {
      // In theory this expression can be simplified, but without the typeof's codecept throws an error when the value is undefined.
      const state = await this.executeScript(() =>
        typeof window.jwplayer === 'undefined' || typeof window.jwplayer().getState === 'undefined' ? '' : jwplayer().getState(),
      );

      await this.say(`Waiting for Player state. Expected: "${expectedState}", Current: "${state}"`);

      if (state === expectedState) {
        return;
      }

      if (allowedStates.indexOf(state) >= 0) {
        this.wait(1);
      } else {
        assert.fail(`Unexpected player state: ${state}`);
      }
    }

    assert.fail(`Player did not reach "${expectedState}"`);
  },
  checkPlayerClosed: async function (this: CodeceptJS.I) {
    this.dontSeeElement('div[class*="jwplayer"]');
    this.dontSeeElement('video');
    // eslint-disable-next-line no-console
    assert.equal(await this.executeScript(() => (typeof jwplayer === 'undefined' ? undefined : jwplayer().getState)), undefined);
  },
  isMobile: async function (this: CodeceptJS.I): Promise<boolean> {
    let isMobile = false;

    await this.usePlaywrightTo('Get is Mobile', async ({ browserContext }) => {
      isMobile = Boolean(browserContext._options.isMobile);
    });

    return isMobile;
  },
  isDesktop: async function (this: CodeceptJS.I) {
    return !(await this.isMobile());
  },
  enableClipboard: async function (this: CodeceptJS.I) {
    await this.usePlaywrightTo('Setup the clipboard', async ({ browserContext }) => {
      await browserContext.grantPermissions(['clipboard-read', 'clipboard-write']);
    });
  },
  readClipboard: async function (this: CodeceptJS.I) {
    return this.executeScript(async () => navigator.clipboard.readText());
  },
  writeClipboard: async function (this: CodeceptJS.I, text: string) {
    await this.executeScript((text) => navigator.clipboard.writeText(text), text);
  },
  scrollToShelf: async function (this: CodeceptJS.I, shelf: ShelfId) {
    this.waitForLoaderDone();

    const targetSelector = makeShelfXpath(shelf);

    let tries = 5;

    // Scroll down until the target shelf is visible
    while ((await this.grabNumberOfVisibleElements(targetSelector)) <= 0) {
      // If we've run out of tries, fail and return
      if (tries-- <= 0) {
        assert.fail(`Shelf row not found with id '${shelf}'`);
        return;
      }

      // Scroll to the bottom of the grid to trigger loading more virtualized rows
      this.scrollTo('[role="row"]:last-child');
      this.wait(0.2);
    }

    // Scroll directly to the shelf
    this.scrollTo(targetSelector);
    return;
  },
  mockTimeGMT: async function (this: CodeceptJS.I, hours: number, minutes: number, seconds: number) {
    return this.usePlaywrightTo(`Mock current time as ${hours}:${minutes}:${seconds}`, async ({ page }) => {
      const today = new Date().setUTCHours(hours, minutes, seconds, 0);
      const mockedNow = today.valueOf();

      await page.addInitScript(`{
        // Extend Date constructor to default to mockedNow
        Date = class extends Date {
          constructor(...args) {
            if (args.length === 0) {
              super(${mockedNow});
            } else {
              super(...args);
            }
          }
        }
        // Override Date.now() to start from mockedNow
        const __DateNowOffset = ${mockedNow} - Date.now();
        const __DateNow = Date.now;
        Date.now = () => __DateNow() + __DateNowOffset;
      }`);
    });
  },
  seeCardImageSrc: async function (this: CodeceptJS.I, name: string, shelf: ShelfId, src: string) {
    const locator = `//img[@alt="${name}"]`;
    await within(makeShelfXpath(shelf), async () => {
      const cardSrc = await this.grabAttributeFrom(locator, 'src');
      assert.equal(cardSrc, src, "img element src attribute doesn't match");
    });
  },
  seeVideoDetailsBackgroundImage: async function (this: CodeceptJS.I, name: string, src: string) {
    const imageLocator = locate({ css: `div[data-testid="video-details"] img[alt="${name}"]` });
    const imgSrc = await this.grabAttributeFrom(imageLocator, 'src');
    assert.equal(imgSrc, src, "img element src attribute doesn't match");
  },
  seeEpgChannelLogoImage: async function (this: CodeceptJS.I, channelId: string, src: string) {
    const imageLocator = locate({ css: `div[data-testid="${channelId}"] img[alt="Logo"]` });
    const imgSrc = await this.grabAttributeFrom(imageLocator, 'src');
    assert.equal(imgSrc, src, "img element src attribute doesn't match");
  },
  openVideoCard: async function (
    this: CodeceptJS.I,
    name: string,
    shelf?: ShelfId,
    scrollToTheRight: boolean = true,
    preOpenCallback?: (locator: string) => void,
  ) {
    const locator = `//div[@aria-label="Play ${name}"]`;
    const shelfXpath = shelf ? makeShelfXpath(shelf) : undefined;

    if (shelfXpath) {
      for (let n = 0; n < 5; n++) {
        const visible = await this.grabNumberOfVisibleElements(shelfXpath);

        if (visible > 0) {
          this.scrollTo(shelfXpath);
          break;
        } else {
          this.scrollPageToBottom();
          this.wait(0.2);
        }
      }
    } else {
      this.scrollTo(locator);
    }

    const isMobile = await this.isMobile();
    // Easy way to limit to 10 swipes
    for (let i = 0; i < 10; i++) {
      const [isElementVisible, tabindex] = await within(shelfXpath || 'body', async () => {
        const isElementVisible = (await this.grabNumberOfVisibleElements(locator)) === 1;
        const tabindex = isElementVisible ? Number(await this.grabAttributeFrom(locator, 'tabindex')) : -1;

        return [isElementVisible, tabindex];
      });

      // If the item isn't virtualized yet, throw an error (we need more information)
      if (!shelfXpath && !isElementVisible) {
        throw `Can't find item with locator: "${locator}". Try specifying which shelf to look in.`;
      }

      if (tabindex >= 0) {
        break;
      }

      if (isMobile) {
        // This swipes on the current item in the carousel where the card we're trying to click is
        await this.swipe({
          xpath: shelfXpath ? `${shelfXpath}//*[@tabindex=0]` : `${locator}/ancestor::ul/li/div[@tabindex=0]`,
          direction: scrollToTheRight ? 'left' : 'right',
        });
      } else {
        this.click({ css: `div[aria-label="Slide ${scrollToTheRight ? 'right' : 'left'}"]` }, shelfXpath);
      }

      this.wait(0.5);
    }

    if (preOpenCallback) {
      preOpenCallback(shelfXpath + locator);
    }

    this.click(locator, shelfXpath);
  },
  clickPlayerContainer: function (this: CodeceptJS.I) {
    // sometimes Playwright throws an error when the click hits a different element than specified
    // see {@link https://github.com/microsoft/playwright/issues/12298}
    this.usePlaywrightTo('click the player container', async ({ page }) => {
      await page.locator('div[data-testid="player-container"]').click({ force: true });
    });
  },
  seeQueryParams: async function (this: CodeceptJS.I, params: { [key: string]: string }) {
    const searchParams = new URLSearchParams(await this.grabCurrentUrl());

    Object.entries(params).forEach(([key, value]) => {
      assert.equal(searchParams.get(key), value);
    });
  },
  clickHome: function (this: CodeceptJS.I) {
    this.click('img[alt="logo"]');
  },
};
declare global {
  // noinspection JSUnusedGlobalSymbols
  type Steps = typeof stepsObj;
}

export = function () {
  return actor(stepsObj);
};
