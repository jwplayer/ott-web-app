import type { LanguageDefinition } from '../../types/i18n';

export const filterSupportedLanguages = (definedLanguages: LanguageDefinition[], enabledLanguages: string[]) => {
  return enabledLanguages.reduce((languages, languageCode) => {
    const foundLanguage = definedLanguages.find(({ code }) => code === languageCode);

    if (foundLanguage) {
      return [...languages, foundLanguage];
    }

    throw new Error(`Missing defined language for code: ${languageCode}`);
  }, [] as LanguageDefinition[]);
};
