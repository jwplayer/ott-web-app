import React, { useEffect } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import { useHistory } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { UIStore } from '../../stores/UIStore';
import useSearchQueryUpdater from '../../hooks/useSearchQueryUpdater';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import type { PlaylistItem } from '../../../types/playlist';
import CardGrid from '../../components/CardGrid/CardGrid';
import { cardUrl } from '../../utils/formatting';
import useFirstRender from '../../hooks/useFirstRender';
import useSearchPlaylist from '../../hooks/useSearchPlaylist';
import { useAccountStore } from '../../stores/AccountStore';
import { ConfigStore } from '../../stores/ConfigStore';

import styles from './Search.module.scss';

type SearchRouteParams = {
  query: string;
};

const Search: React.FC<RouteComponentProps<SearchRouteParams>> = ({
  match: {
    params: { query },
  },
}) => {
  const { t } = useTranslation('search');
  const config = ConfigStore.useState((state) => state.config);
  const { siteName, searchPlaylist, options } = config;
  const accessModel = ConfigStore.useState((s) => s.accessModel);

  const firstRender = useFirstRender();
  const searchQuery = UIStore.useState((s) => s.searchQuery);
  const { updateSearchQuery } = useSearchQueryUpdater();
  const history = useHistory();
  const { isFetching, error, data: { playlist } = { playlist: [] } } = useSearchPlaylist(searchPlaylist || '', query, firstRender);

  const updateBlurImage = useBlurImageUpdater(playlist);

  // User
  const user = useAccountStore((state) => state.user);
  const subscription = !!useAccountStore((state) => state.subscription);

  // Update the search bar query to match the route param on mount
  useEffect(() => {
    if (!firstRender) {
      return;
    }

    if (query && query !== searchQuery) {
      updateSearchQuery(query);
    }
  }, [firstRender, query, searchQuery, updateSearchQuery]);

  const onCardClick = (playlistItem: PlaylistItem) => {
    UIStore.update((s) => {
      s.searchQuery = '';
      s.searchActive = false;
    });

    history.push(cardUrl(playlistItem, searchPlaylist));
  };
  const onCardHover = (playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image);

  if ((error || !playlist) && !isFetching) {
    return (
      <ErrorPage title={t('error_heading')}>
        <h6>{t('error_subheading')}</h6>
        <p>{t('error_description')}</p>
      </ErrorPage>
    );
  }

  if (!query) {
    return <ErrorPage title={t('start_typing')} />;
  }

  if (!playlist.length) {
    return (
      <ErrorPage title={t('no_results_heading', { query })}>
        <h6>{t('suggestions')}</h6>
        <ul>
          <li>{t('tip_one')}</li>
          <li>{t('tip_two')}</li>
          <li>{t('tip_three')}</li>
        </ul>
      </ErrorPage>
    );
  }

  return (
    <div className={styles.search}>
      <Helmet>
        <title>
          {t('title', { results: playlist.length, query })} - {siteName}
        </title>
      </Helmet>
      <header className={styles.header}>
        <h2>{t('heading')}</h2>
      </header>
      <main className={styles.main}>
        <CardGrid
          playlist={playlist}
          onCardClick={onCardClick}
          onCardHover={onCardHover}
          isLoading={firstRender}
          enableCardTitles={options.shelfTitles}
          accessModel={accessModel}
          isLoggedIn={!!user}
          hasSubscription={!!subscription}
        />
      </main>
    </div>
  );
};

export default Search;
