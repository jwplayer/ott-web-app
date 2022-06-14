import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import * as en_US from './locales/en_US';

const languageDetector = new LanguageDetector();

// i18next expects a format like `en-US`
export const resources = {
  'en-US': en_US,
};

i18n
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    resources,
    lng: 'en-US',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
