import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import i18next from 'i18next';

import * as en_US from './locales/en_US';

const languageDetector = new LanguageDetector();

// i18next expects a format like `en-US`
export const resources = {
  'en-US': en_US,
};

const initI18n = async () => {
  await i18next
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
};

export default initI18n;
