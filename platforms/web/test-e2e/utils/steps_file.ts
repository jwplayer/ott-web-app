import * as assert from 'assert';

import { TestConfig } from '@jwp/ott-testing/constants';

import { randomDate } from './randomizers';

import constants, { longTimeout, makeShelfXpath, normalTimeout, ShelfId } from '#utils/constants';
import passwordUtils, { LoginContext } from '#utils/password_utils';

const configFileQueryKey = 'app-config';
const loaderElement = '[class*=_loadingOverlay]';

type SwipeTarget = { text: string } | { xpath: string };
type SwipeDirection = { direction: 'left' | 'right'; delta?: number } | { points: { x1: number; y1: number; x2: number; y2: number } };

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
    this.click('button[type="submit"]');
    this.waitForInvisible(loaderElement, 20);

    this.dontSee('Incorrect email/password combination');
    this.dontSee(constants.loginFormSelector);

    return {
      email,
      password,
    };
  },
  logout: async function (this: CodeceptJS.I) {
    await this.openMainMenu();

    this.click('text=Log out');
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

    await this.fillCustomRegistrationFields();

    this.click('Continue');
    this.waitForElement('form[data-testid="personal_details-form"]', 20);

    if (onRegister) {
      onRegister();
    } else {
      this.clickCloseButton();
    }
  },
  hasCustomRegistrationFields: function (this: CodeceptJS.I) {
    return tryTo(() => {
      this.seeElement(constants.customRegFields.topContainerSelector);
    });
  },
  hasTermsAndConditionField: async function (this: CodeceptJS.I) {
    return tryTo(() => {
      this.seeElement(constants.customRegFields.termsAndConditionsField);
    });
  },
  fillCustomRegistrationFields: async function (this: CodeceptJS.I) {
    if (!(await this.hasCustomRegistrationFields())) {
      return;
    }

    if (await this.hasTermsAndConditionField()) {
      this.checkOption(constants.customRegFields.termsAndConditionsField);
    }

    await this.checkRequiredCheckboxes();
    await this.fillRequiredTextInputs();
    await this.checkRequiredRadioBoxes();
    await this.selectFromRequiredDropdownLists();
    await this.fillRequiredDateFields();
  },
  checkRequiredCheckboxes: async function (this: CodeceptJS.I) {
    const container = constants.customRegFields.topContainerSelector;

    const requiredCheckboxNames: string[] = await this.executeScript(
      ([container, crfFieldSelector]: [string, string]) =>
        Array.from(document.querySelectorAll(`${container} ${crfFieldSelector}`))
          .filter((element) => element.querySelector('label')?.innerText.startsWith('*'))
          .map((element) => (element.querySelector('input[type="checkbox"]') as HTMLInputElement)?.name),
      [container, constants.customRegFields.crfCheckbox],
    );

    await within(container, () => {
      requiredCheckboxNames.forEach((name) => {
        this.checkOption(name);
      });
    });
  },
  fillRequiredTextInputs: async function (this: CodeceptJS.I) {
    const container = constants.customRegFields.topContainerSelector;

    const requiredTextInputNames: string[] = await this.executeScript(
      ([container, crfFieldSelector]: [string, string]) =>
        Array.from(document.querySelectorAll(`${container} ${crfFieldSelector}`))
          .filter((element) => element.querySelector('label')?.innerText.includes('*'))
          .map((element) => (element.querySelector('input[type="text"]') as HTMLInputElement)?.name),
      [container, constants.customRegFields.crfTextInput],
    );

    await within(container, () => {
      requiredTextInputNames.forEach((inputField) => {
        this.fillField(inputField, 'Random text');
      });
    });
  },
  checkRequiredRadioBoxes: async function (this: CodeceptJS.I) {
    const container = constants.customRegFields.topContainerSelector;

    const requiredRadioValues: string[] = await this.executeScript(
      ([container, crfFieldSelector]: [string, string]) =>
        Array.from(document.querySelectorAll(`${container} ${crfFieldSelector}`))
          .filter((element) => (element.querySelector('[data-testid="radio-header"]') as HTMLElement)?.innerText.includes('*'))
          .map((element) => (element.querySelector('input[type="radio"]') as HTMLInputElement)?.value),
      [container, constants.customRegFields.crfRadioBox],
    );

    await within(container, () => {
      requiredRadioValues.forEach((radioValue) => {
        this.checkOption(`[value="${radioValue}"]`);
      });
    });
  },
  selectFromRequiredDropdownLists: async function (this: CodeceptJS.I) {
    const container = constants.customRegFields.topContainerSelector;

    const requiredDropdownNames: string[] = await this.executeScript((container: string) => {
      const querySelector = ['crf-select', 'crf-country', 'crf-us_state'].map((testId) => `${container} [data-testid="${testId}"]`).join(', ');

      return Array.from(document.querySelectorAll(querySelector))
        .filter((element) => element.querySelector('label')?.innerText.includes('*'))
        .map((element) => element.querySelector('select')?.name);
    }, container);

    await within(container, () => {
      requiredDropdownNames.forEach(async (dropdownName) => {
        const firstOption: string = await this.executeScript(
          (dropdownName: string) => (document.querySelector(`select[name="${dropdownName}"] option:not(:disabled)`) as HTMLOptionElement)?.value,
          dropdownName,
        );

        this.selectOption(`select[name="${dropdownName}"]`, firstOption);
      });
    });
  },
  fillRequiredDateFields: async function (this: CodeceptJS.I) {
    const container = constants.customRegFields.topContainerSelector;

    const requiredDatepickerIds: string[] = await this.executeScript(
      ([container, crfFieldSelector]: [string, string]) =>
        Array.from(document.querySelectorAll(`${container} ${crfFieldSelector}`))
          .filter((element) => element.querySelector('label')?.innerText.includes('*'))
          .map((element) => element.id),
      [container, constants.customRegFields.crfDateField],
    );

    requiredDatepickerIds.forEach(async (datepickerId) => {
      await within(`#${datepickerId}`, () => {
        const [day, month, year] = randomDate();

        this.fillField('date', day);
        this.fillField('month', month);
        this.fillField('year', year);
      });
    });
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
  waitForLoaderDone: function (this: CodeceptJS.I) {
    this.limitTime(longTimeout).dontSeeElement(loaderElement);
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
    this.click('button[aria-label="Open menu"]');
  },
  openUserMenu: function (this: CodeceptJS.I) {
    this.click('button[aria-label="Open user menu"]');
  },
  clickCloseButton: function (this: CodeceptJS.I) {
    this.click('button[aria-label="Close panel"]');
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
      const delta = args.delta || 25;

      const points =
        args.direction === 'left'
          ? { x1: delta, y1: 1, x2: 0, y2: 1 }
          : args.direction === 'right'
          ? {
              x1: 0,
              y1: 1,
              x2: delta,
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

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          element.dispatchEvent(
            new TouchEvent('touchmove', {
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

          element.dispatchEvent(
            new TouchEvent('touchend', {
              bubbles: true,
              changedTouches: [
                new Touch({
                  identifier: Date.now() + 2,
                  target: element,
                  clientX: points.x2,
                  clientY: points.y2,
                }),
              ],
            }),
          );
          resolve();
        }, 16);
      });
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
        typeof window.jwplayer === 'undefined' || typeof window.jwplayer().getState === 'undefined' ? '' : window.jwplayer().getState(),
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
    assert.equal(await this.executeScript(() => (typeof window.jwplayer === 'undefined' ? undefined : window.jwplayer().getState)), undefined);
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
  seeEpgChannelLogoImage: async function (this: CodeceptJS.I, channelId: string, src: string, alt: string) {
    const imageLocator = locate({ css: `div[data-testid="${channelId}"] img[alt="${alt}"]` });
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
    const cardLocator = `//a[@data-testid="${name}"]`;
    const shelfLocator = shelf ? makeShelfXpath(shelf) : undefined;
    const gridCellLocator = locate(cardLocator).inside('//div[@role="gridcell"]');

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
      const [isWithinGridCell, isElementVisible, tabindex] = await within(shelfLocator || 'body', async () => {
        const isWithinGridCell = (await this.grabNumberOfVisibleElements(gridCellLocator)) >= 1;
        const isElementVisible = (await this.grabNumberOfVisibleElements(cardLocator)) >= 1;
        const tabindex = isElementVisible ? Number(await this.grabAttributeFrom(cardLocator, 'tabindex')) : -1;

        return [isWithinGridCell, isElementVisible, tabindex];
      });

      // If the item isn't virtualized yet, throw an error (we need more information)
      if (!shelfLocator && !isElementVisible) {
        throw `Can't find item with locator: "${cardLocator}". Try specifying which shelf to look in.`;
      }

      // CardGrid component uses keyboard or regular mouse (click) navigation
      if (isWithinGridCell) {
        break;
      }

      if (tabindex >= 0) {
        break;
      }

      if (isMobile) {
        // This swipes on the current item in the carousel where the card we're trying to click is
        await this.swipe({
          xpath: shelfLocator ? `${shelfLocator}//*[@tabindex=0]` : `${cardLocator}/ancestor::ul/li/a[@tabindex=0]`,
          direction: scrollToTheRight ? 'left' : 'right',
          delta: 15, // slow swipe to prevent sliding over
        });
      } else {
        this.click({ css: `button[aria-label="${scrollToTheRight ? 'Next slide' : 'Previous slide'}"]` }, shelfLocator);
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
  seeCssProperties: async function (this: CodeceptJS.I, locatorOrString: CodeceptJS.LocatorOrString, cssProperties: Record<string, string>) {
    for (const property in cssProperties) {
      const locator = locate(locatorOrString);
      const actual = await this.grabCssPropertyFrom(locator, property);
      const expected = cssProperties[property];

      assert.equal(actual, expected, `CSS property '${property}' for ${locator.toString()} doesn't match the expected value.`);
    }
  },
};
declare global {
  // noinspection JSUnusedGlobalSymbols
  type Steps = typeof stepsObj;
}

export = function () {
  return actor(stepsObj);
};
