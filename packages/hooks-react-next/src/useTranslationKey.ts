import { useTranslation } from 'react-i18next';

export const useTranslationKey = (key: string) => {
  const { i18n } = useTranslation();

  return `${key}-${i18n.language}`;
};
