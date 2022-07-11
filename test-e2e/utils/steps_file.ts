import * as assert from 'assert';

import constants from './constants';
import passwordUtils, { LoginContext } from './password_utils';

const configFileQueryKey = 'c';
const loaderElement = '[class*=_loadingOverlay]';

const stepsObj = {
  useConfig: function (
    this: CodeceptJS.I,
    config: 'test--subscription' | 'test--accounts' | 'test--no-cleeng' | 'test--watchlists' | 'test--blender',
    baseUrl: string = constants.baseUrl,
  ) {
    const url = new URL(baseUrl);
    url.searchParams.delete(configFileQueryKey);
    url.searchParams.append(configFileQueryKey, config);

    this.amOnPage(url.toString());
  },
  login: function (this: CodeceptJS.I, { email, password }: { email: string; password: string } = { email: constants.username, password: constants.password }) {
    this.amOnPage(constants.loginUrl);
    this.waitForElement('input[name=email]', 10);
    this.fillField('email', email);
    this.waitForElement('input[name=password]', 10);
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
    const isMobile = await this.isMobile();

    if (isMobile) {
      this.openMenuDrawer();
    } else {
      this.openUserMenu();
    }

    this.click('div[aria-label="Log out"]');
  },
  // This function will register the user on the first call and return the context
  // then assuming context is passed in the next time, will log that same user back in
  // Use it for tests where you want a new user for the suite, but not for each test
  registerOrLogin: function (this: CodeceptJS.I, context?: LoginContext, onRegister?: () => void) {
    if (context) {
      this.login({ email: context.email, password: context.password });
    } else {
      context = { email: passwordUtils.createRandomEmail(), password: passwordUtils.createRandomPassword() };

      this.amOnPage(`${constants.baseUrl}?u=create-account`);
      this.waitForElement(constants.registrationFormSelector, 10);

      // Sometimes wrong value is saved at the back-end side. We want to be sure that it is correct
      this.clearField('Email');
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
    }

    return context;
  },
  submitForm: function (this: CodeceptJS.I, loaderTimeout: number | false = 5) {
    this.click('button[type="submit"]');
    this.waitForLoaderDone(loaderTimeout);
  },
  waitForLoaderDone: function (this: CodeceptJS.I, timeout: number | false = 5) {
    // Specify false when the loader is NOT expected to be shown at all
    if (timeout === false) {
      this.dontSeeElement(loaderElement);
    } else {
      this.waitForInvisible(loaderElement, timeout);
    }
  },
  openMainMenu: async function (this: CodeceptJS.I) {
    const isMobile = await this.isMobile();
    if (isMobile) {
      this.openMenuDrawer();
    } else {
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
  seeValueEquals: async function (this: CodeceptJS.I, value: string, locator: CodeceptJS.LocatorOrString) {
    assert.equal(await this.grabValueFrom(locator), value);
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
  waitForPlayerPlaying: async function (title, tries = 10) {
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
};
declare global {
  type Steps = typeof stepsObj;
}

export = function () {
  return actor(stepsObj);
};
