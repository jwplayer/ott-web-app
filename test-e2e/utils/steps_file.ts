import * as assert from 'assert';

import constants, { makeShelfXpath, normalTimeout, ShelfId } from '#utils/constants';
import passwordUtils, { LoginContext } from '#utils/password_utils';
import { TestConfig } from '#test/types';

const configFileQueryKey = 'app-config';
const loaderElement = '[class*=_loadingOverlay]';

type SwipeTarget = { text: string } | { xpath: string };
type SwipeDirection = { direction: 'left' | 'right' } | { points: { x1: number; y1: number; x2: number; y2: number } };

const stepsObj = {
  useConfig: function (this: CodeceptJS.I, config: TestConfig) {
    const url = new URL(constants.baseUrl);
    url.searchParams.delete(configFileQueryKey);
    url.searchParams.append(configFileQueryKey, config.id);

    this.amOnPage(url.toString());
    this.waitForLoaderDone();
  },
  login: async function (this: CodeceptJS.I, { email, password }: { email: string; password: string }) {
    await this.openSignInModal();

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
  registerOrLogin: async function (this: CodeceptJS.I, context?: LoginContext, onRegister?: () => void) {
    if (context) {
      await this.login({ email: context.email, password: context.password });
    } else {
      context = { email: passwordUtils.createRandomEmail(), password: passwordUtils.createRandomPassword() };

      await this.openSignUpModal();
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
  payWithCreditCard: async function (
    this: CodeceptJS.I,
    creditCardFieldName: string,
    creditCard: string,
    cardNumber: string,
    expiryDate: string,
    securityCode: string,
    fieldWrapper: string = '',
  ) {
    this.waitForText('Credit card');

    if (creditCardFieldName) {
      this.waitForText(creditCardFieldName);
      this.fillByLabel(creditCardFieldName, 'John Doe');
    }

    // Adyen credit card form is loaded asynchronously, so wait for it
    this.waitForElement(`[class*="${cardNumber}"]`, normalTimeout);

    // Each of the 3 credit card fields is a separate iframe
    this.fillByLabel('Card number', creditCard, fieldWrapper ? `[class*="${cardNumber}"] ${fieldWrapper}` : undefined);

    this.fillByLabel('Expiry date', '03/30', fieldWrapper ? `[class*="${expiryDate}"] ${fieldWrapper}` : undefined);

    this.fillByLabel('Security code', '737', fieldWrapper ? `[class*="${securityCode}"] ${fieldWrapper}` : undefined);
  },
  fillByLabel: function (this: CodeceptJS.I, label: string, value: string, frameLocator?: string) {
    this.usePlaywrightTo('Fill field by label', async ({ page }) => {
      const locator = frameLocator ? page.frameLocator(frameLocator) : page;

      await locator.getByLabel(label).fill(value);
    });
  },
  waitForLoaderDone: function (this: CodeceptJS.I, timeout: number | false = normalTimeout) {
    // Specify false when the loader is NOT expected to be shown at all
    if (timeout === false) {
      this.dontSeeElement(loaderElement);
    } else {
      this.waitForInvisible(loaderElement, timeout);
    }
  },
  openSignUpModal: async function (this: CodeceptJS.I) {
    const { isMobile } = await this.openSignInMenu();

    // the sign-up button is visible in header and in the mobile menu
    this.click('Sign up');

    return { isMobile };
  },
  openSignInModal: async function (this: CodeceptJS.I) {
    const { isMobile } = await this.openSignInMenu();

    this.click('Sign in');

    return { isMobile };
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
  swipeLeft: async function (this: CodeceptJS.I, args: SwipeTarget) {
    await this.swipe({ ...args, direction: 'left' });
  },
  swipeRight: async function (this: CodeceptJS.I, args: SwipeTarget) {
    await this.swipe({ ...args, direction: 'right' });
  },
  swipe: async function (this: CodeceptJS.I, args: SwipeTarget & SwipeDirection) {
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
  waitForPlayerPlaying: async function (title: string, tries = 10) {
    this.waitForElement('div[class*="jwplayer"]', normalTimeout);
    this.see(title);
    await this.waitForPlayerState('playing', ['buffering', 'idle', ''], tries);
  },
  waitForPlayerState: async function (this: CodeceptJS.I, expectedState: string, allowedStates: string[] = [], tries = 5) {
    // Since this check executes a script in the browser, it won't use the codecept retries,
    // so we have to manually retry (this is because the video can take time to load and the state will be buffering)
    for (let i = 0; i < tries; i++) {
      // In theory this expression can be simplified, but without the typeof's codecept throws an error when the value is undefined.
      const state = await this.executeScript(() =>
        typeof window.jwplayer === 'undefined' || typeof window.jwplayer().getState === 'undefined' ? '' : jwplayer().getState(),
      );

      this.say(`Waiting for Player state. Expected: "${expectedState}", Current: "${state}"`);

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
    return await this.executeScript(() => {
      return window.navigator.userAgent.toLowerCase().includes('pixel');
    });
  },
  isDesktop: async function (this: CodeceptJS.I) {
    return !(await this.isMobile());
  },
  enableClipboard: async function (this: CodeceptJS.I) {
    this.usePlaywrightTo('Setup the clipboard', async ({ browserContext }) => {
      await browserContext.grantPermissions(['clipboard-read', 'clipboard-write']);
    });
  },
  writeClipboard: async function (this: CodeceptJS.I, text: string) {
    await this.executeScript((text) => navigator.clipboard.writeText(text), text);
  },
  scrollToShelf: async function (this: CodeceptJS.I, shelf: ShelfId) {
    this.waitForLoaderDone();
    this.scrollPageToTop();
    this.wait(1);

    const targetSelector = makeShelfXpath(shelf);

    // Scroll down until the target shelf is visible
    for (let tries = 0; tries < 5; tries++) {
      if ((await this.grabNumberOfVisibleElements(targetSelector)) > 0) {
        // Scroll directly to the shelf
        this.scrollTo(targetSelector);
        return;
      }

      // Scroll to the bottom of the grid to trigger loading more virtualized rows
      this.scrollTo('header', undefined, tries * 800);
      this.wait(1);
    }

    // If we've run out of tries, fail and return
    assert.fail(`Shelf row not found with id '${shelf}'`);
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
    const cardLocator = `//a[@aria-label="${name}"]`;
    const shelfLocator = shelf ? makeShelfXpath(shelf) : undefined;

    this.scrollPageToTop();
    this.wait(1);

    for (let n = 0; n < 5; n++) {
      if ((await this.grabNumberOfVisibleElements(shelfLocator || cardLocator)) > 0) {
        this.scrollTo(shelfLocator || cardLocator);
        this.wait(1);
        break;
      }

      // Scroll down from the top of the page
      this.scrollTo('header', undefined, 800 * n);
      this.wait(1);
    }

    const isMobile = await this.isMobile();
    // Easy way to limit to 10 swipes
    for (let i = 0; i < 10; i++) {
      const [isElementVisible, tabindex] = await within(shelfLocator || 'body', async () => {
        const isElementVisible = (await this.grabNumberOfVisibleElements(cardLocator)) >= 1;
        const tabindex = isElementVisible ? Number(await this.grabAttributeFrom(cardLocator, 'tabindex')) : -1;

        return [isElementVisible, tabindex];
      });

      // If the item isn't virtualized yet, throw an error (we need more information)
      if (!shelfLocator && !isElementVisible) {
        throw `Can't find item with locator: "${cardLocator}". Try specifying which shelf to look in.`;
      }

      if (tabindex >= 0) {
        break;
      }

      if (isMobile) {
        // This swipes on the current item in the carousel where the card we're trying to click is
        await this.swipe({
          xpath: shelfLocator ? `${shelfLocator}//*[@tabindex=0]` : `${cardLocator}/ancestor::ul/li/a[@tabindex=0]`,
          direction: scrollToTheRight ? 'left' : 'right',
        });
      } else {
        this.click({ css: `div[aria-label="Slide ${scrollToTheRight ? 'right' : 'left'}"]` }, shelfLocator);
      }

      this.wait(1);
    }

    if (preOpenCallback) {
      preOpenCallback(shelfLocator + cardLocator);
    }

    this.click(cardLocator, shelfLocator);
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
    this.click('a[href="/"]');
  },
};
declare global {
  // noinspection JSUnusedGlobalSymbols
  type Steps = typeof stepsObj;
}

export = function () {
  return actor(stepsObj);
};
