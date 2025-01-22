import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { useUIStore } from '@jwp/ott-common/src/stores/UIStore';
import { getModule } from '@jwp/ott-common/src/modules/container';
import FavoritesController from '@jwp/ott-common/src/controllers/FavoritesController';
import WatchHistoryController from '@jwp/ott-common/src/controllers/WatchHistoryController';

import LanguageMenu from '../../components/LanguageMenu/LanguageMenu';

const HeaderLanguageSwitcher = () => {
  const { i18n } = useTranslation('menu');
  const supportedLanguages = useConfigStore((state) => state.supportedLanguages);
  const languageMenuOpen = useUIStore((state) => state.languageMenuOpen);

  const favoritesController = getModule(FavoritesController);
  const watchlistController = getModule(WatchHistoryController);

  const openLanguageMenu = useCallback(() => useUIStore.setState({ languageMenuOpen: true }), []);
  const closeLanguageMenu = useCallback(() => useUIStore.setState({ languageMenuOpen: false }), []);

  const languageClickHandler = (code: string) => {
    i18n.changeLanguage(code);
    favoritesController.restoreFavorites(code);
    watchlistController.restoreWatchHistory(code);
  };

  const currentLanguage = useMemo(() => supportedLanguages.find(({ code }) => code === i18n.language), [i18n.language, supportedLanguages]);

  if (supportedLanguages.length < 2) return null;

  return (
    <LanguageMenu
      openLanguageMenu={openLanguageMenu}
      closeLanguageMenu={closeLanguageMenu}
      languageMenuOpen={languageMenuOpen}
      onClick={languageClickHandler}
      languages={supportedLanguages}
      currentLanguage={currentLanguage}
    />
  );
};

export default HeaderLanguageSwitcher;
