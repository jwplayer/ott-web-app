import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import I18NextHttpBackend from 'i18next-http-backend';
import i18next from 'i18next';

import { NAMESPACES } from '#src/i18n/resources';

export type LanguageDefinition = {
  code: string;
  displayName: string;
};

// This list contains all languages that are supported by the OTT Web app by default
// To enable the language, make sure that the language code is added to the `APP_ENABLED_LANGUAGES` environment variable
// Before adding a defined language, ensure that the translation files are added to the `./public/locales/${code}` folder
export const DEFINED_LANGUAGES: LanguageDefinition[] = [
  {
    code: 'en',
    displayName: 'English',
  },
  {
    code: 'es',
    displayName: 'Español',
  },
];

export const getSupportedLanguages = () => {
  const enabledLanguages = import.meta.env.APP_ENABLED_LANGUAGES?.split(',') || [];

  return enabledLanguages.reduce((languages, languageCode) => {
    const foundLanguage = DEFINED_LANGUAGES.find(({ code }) => code === languageCode);

    if (foundLanguage) {
      return [...languages, foundLanguage];
    }

    throw new Error(`Missing defined language for code: ${languageCode}`);
  }, [] as LanguageDefinition[]);
};

const initI18n = async () => {
  const defaultLanguage = import.meta.env.APP_DEFAULT_LANGUAGE || 'en';
  const supportedLanguages = getSupportedLanguages();

  if (!supportedLanguages.some(({ code }) => code === defaultLanguage)) {
    throw new Error(`The default language is not enabled: ${defaultLanguage}`);
  }

  await i18next
    .use(I18NextHttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      supportedLngs: supportedLanguages.map(({ code }) => code),
      fallbackLng: defaultLanguage,
      // this option ensures that empty strings in translations will fall back to the default language
      returnEmptyString: false,
      ns: NAMESPACES,
      defaultNS: 'common',
      fallbackNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'jwapp.language',
      },
      react: {
        // disabled suspense to prevent re-loading the app while loading the resources
        useSuspense: false,
      },
    });
};

export default initI18n;
