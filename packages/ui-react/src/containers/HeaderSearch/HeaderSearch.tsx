import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import { isTruthyCustomParamValue } from '@jwp/ott-common/src/utils/common';
import { useUIStore } from '@jwp/ott-common/src/stores/UIStore';
import SearchIcon from '@jwp/ott-theme/assets/icons/search.svg?react';
import CloseIcon from '@jwp/ott-theme/assets/icons/close.svg?react';

import Icon from '../../components/Icon/Icon';
import SearchBar from '../../components/SearchBar/SearchBar';
import useSearchQueryUpdater from '../../hooks/useSearchQueryUpdater';
import HeaderActionButton from '../../components/Header/HeaderActionButton';

import styles from './HeaderSearch.module.scss';

const HeaderSearch = () => {
  const { t } = useTranslation('menu');
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;

  const config = useConfigStore(({ config }) => config);
  const { features, custom } = config;

  const { searchPlaylist } = features || {};
  const hasAppContentSearch = isTruthyCustomParamValue(custom?.appContentSearch);
  const searchEnabled = !!searchPlaylist || hasAppContentSearch;

  const { searchQuery, searchActive } = useUIStore(
    ({ searchQuery, searchActive, userMenuOpen, languageMenuOpen }) => ({
      languageMenuOpen,
      searchQuery,
      searchActive,
      userMenuOpen,
    }),
    shallow,
  );
  const { updateSearchQuery, resetSearchQuery } = useSearchQueryUpdater();

  const closeSearchButtonClickHandler = () => {
    resetSearchQuery();

    useUIStore.setState({
      searchActive: false,
    });
  };

  const searchButtonClickHandler = () => {
    useUIStore.setState({
      searchActive: true,
      preSearchPage: `${location.pathname}${location.search || ''}`,
    });
  };

  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchActive]);

  if (!searchEnabled) return null;

  return searchActive ? (
    <div className={styles.searchContainer}>
      <SearchBar
        query={searchQuery}
        onQueryChange={(event) => updateSearchQuery(event.target.value)}
        onClearButtonClick={() => updateSearchQuery('')}
        inputRef={searchInputRef}
        onClose={closeSearchButtonClickHandler}
      />
      <HeaderActionButton aria-label={t('search_close')} onClick={closeSearchButtonClickHandler}>
        <Icon icon={CloseIcon} />
      </HeaderActionButton>
    </div>
  ) : (
    <HeaderActionButton aria-label={t('search_open')} onClick={searchButtonClickHandler}>
      <Icon icon={SearchIcon} />
    </HeaderActionButton>
  );
};

export default HeaderSearch;
