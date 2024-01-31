import * as assert from 'assert';

import { testConfigs } from '@jwp/ott-testing/constants';

import constants from '#utils/constants';

const languageText = {
  en: {
    selectLanguage: 'Select language',
    language: 'English',
  },
  es: {
    selectLanguage: 'Seleccionar idioma',
    language: 'Español',
  },
};

// Prefix locators with `$` to indicate that they are test-id attributes
// See ott-web-app/platforms/web/test-e2e/codecept.desktop.js

const locators = {
  languageMenuButton: '$language-menu-button',
  languageMenuPanel: 'language-panel',
};

const localStorageKey = 'jwapp.language';

Feature('languages').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Scenario('English language is selected when the locale is `nl-NL`', async ({ I }) => {
  I.restartBrowser({ locale: 'nl-NL' });
  I.useConfig(testConfigs.basicNoAuth);

  await assertActiveLanguage(I, 'en');
});

Scenario('Validate that the language menu is closed by default', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.dontSeeElement({ id: locators.languageMenuPanel });
});

Scenario('Validate that the language menu is opened by clicking the language menu button', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.click(locators.languageMenuButton);

  I.seeElement({ id: locators.languageMenuPanel });
});

Scenario('English language is selected when the locale is `en-US`', async ({ I }) => {
  I.restartBrowser({ locale: 'en-US' });
  I.useConfig(testConfigs.basicNoAuth);
  await assertActiveLanguage(I, 'en');
});

Scenario('English language is selected when the locale is `en-GB`', async ({ I }) => {
  I.restartBrowser({ locale: 'en-GB' });
  I.useConfig(testConfigs.basicNoAuth);
  await assertActiveLanguage(I, 'en');
});

Scenario('Spanish language is selected when the locale is `es-ES`', async ({ I }) => {
  I.restartBrowser({ locale: 'es-ES' });
  I.useConfig(testConfigs.basicNoAuth);

  await assertActiveLanguage(I, 'es');
});

Scenario('Changing the language is persisted in the localStorage`', async ({ I }) => {
  I.restartBrowser({ locale: 'en-US' });
  I.useConfig(testConfigs.basicNoAuth);

  switchLanguage(I, 'es');

  // validate
  await assertActiveLanguage(I, 'es');
  const persistedLanguage = await I.executeScript(function (lookupKey) {
    return localStorage.getItem(lookupKey) || '';
  }, localStorageKey);

  assert.strictEqual(persistedLanguage, 'es');
});

Scenario('The language is restored from localStorage`', async ({ I }) => {
  I.restartBrowser({
    storageState: {
      origins: [
        {
          origin: constants.baseUrl,
          localStorage: [
            {
              name: localStorageKey,
              value: 'es',
            },
          ],
        },
      ],
    },
  });
  I.useConfig(testConfigs.basicNoAuth);

  await assertActiveLanguage(I, 'es');
});

// assert that the active language is bolded in the menu (selected).
async function assertActiveLanguage(I: CodeceptJS.I, activeLanguage: keyof typeof languageText) {
  I.click(locators.languageMenuButton);

  await checkStyle(I, locate('a').withText(languageText.en.language), {
    'font-weight': activeLanguage === 'en' ? 'bold' : 'normal',
  });
  await checkStyle(I, locate('a').withText(languageText.es.language), {
    'font-weight': activeLanguage === 'es' ? 'bold' : 'normal',
  });
}

// switch the language using the menu.
async function switchLanguage(I: CodeceptJS.I, language: keyof typeof languageText) {
  I.click(locators.languageMenuButton);
  I.click(locate('a').withText(languageText[language].language));
}

// check the style of an element.
async function checkStyle(I: CodeceptJS.I, locator: CodeceptJS.LocatorOrString, styles: Record<string, string>) {
  I.waitForElement(locator);
  I.seeCssPropertiesOnElements(locator, styles);
}
