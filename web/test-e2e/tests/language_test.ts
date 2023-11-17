import * as assert from 'assert';

import { testConfigs } from '#test/constants';
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

const localStorageKey = 'jwapp.language';

Feature('languages').retry(Number(process.env.TEST_RETRY_COUNT) || 0);

Scenario('English language is selected when the locale is `en-US`', async ({ I }) => {
  I.useConfig(testConfigs.basicNoAuth);
  I.click(languageText.en.selectLanguage);

  // validate
  await checkActiveLanguage(I, 'en');
});

Scenario('English language is selected when the locale is `en-GB`', async ({ I }) => {
  I.restartBrowser({ locale: 'en-GB' });
  I.useConfig(testConfigs.basicNoAuth);

  // validate
  await checkActiveLanguage(I, 'en');
});

Scenario('English language is selected when the locale is `nl-NL`', async ({ I }) => {
  I.restartBrowser({ locale: 'nl-NL' });
  I.useConfig(testConfigs.basicNoAuth);

  // validate
  await checkActiveLanguage(I, 'en');
});

Scenario('Spanish language is selected when the locale is `es-ES`', async ({ I }) => {
  I.restartBrowser({ locale: 'es-ES' });
  I.useConfig(testConfigs.basicNoAuth);

  // validate
  await checkActiveLanguage(I, 'es');
});

Scenario('Changing the language is persisted in the localStorage`', async ({ I }) => {
  I.restartBrowser({ locale: 'en-US' });
  I.useConfig(testConfigs.basicNoAuth);

  // change language
  I.click(languageText.en.selectLanguage);
  I.click(languageText.es.language);

  // validate
  await checkActiveLanguage(I, 'es');

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

  // validate
  await checkActiveLanguage(I, 'es');
});

async function checkActiveLanguage(I: CodeceptJS.I, activeLanguage: keyof typeof languageText) {
  // open language menu
  I.click(languageText[activeLanguage].selectLanguage);

  await checkStyle(I, locate('a').withText(languageText.en.language), {
    'font-weight': activeLanguage === 'en' ? 'bold' : 'normal',
  });
  await checkStyle(I, locate('a').withText(languageText.es.language), {
    'font-weight': activeLanguage === 'es' ? 'bold' : 'normal',
  });
}

async function checkStyle(I: CodeceptJS.I, locator: CodeceptJS.LocatorOrString, styles: Record<string, string>) {
  I.waitForElement(locator);
  I.seeCssPropertiesOnElements(locator, styles);
}
