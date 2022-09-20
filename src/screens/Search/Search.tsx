import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import shallow from 'zustand/shallow';

import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { useUIStore } from '../../stores/UIStore';
import useSearchQueryUpdater from '../../hooks/useSearchQueryUpdater';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import type { PlaylistItem } from '../../../types/playlist';
import CardGrid from '../../components/CardGrid/CardGrid';
import { cardUrl } from '../../utils/formatting';
import useFirstRender from '../../hooks/useFirstRender';
import { useAccountStore } from '../../stores/AccountStore';
import { useConfigStore } from '../../stores/ConfigStore';

import styles from './Search.module.scss';

import usePlaylist from '#src/hooks/usePlaylist';
import { getShelfItemImages } from '#src/stores/ConfigController';

const Search = () => {
  const { t } = useTranslation('search');
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { siteName, features, styling } = config;

  const firstRender = useFirstRender();
  const searchQuery = useUIStore((state) => state.searchQuery);
  const { updateSearchQuery } = useSearchQueryUpdater();
  const navigate = useNavigate();
  const params = useParams();
  const query = params['*'];
  const { isFetching, error, data: playlist } = usePlaylist(features?.searchPlaylist || '', { search: query || '' }, true, !!query);

  const updateBlurImage = useBlurImageUpdater(playlist?.playlist);

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

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
    useUIStore.setState({
      searchQuery: '',
      searchActive: false,
    });

    navigate(cardUrl(playlistItem, features?.searchPlaylist));
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

  if (!playlist?.playlist.length) {
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
          {t('title', { results: playlist.playlist.length, query })} - {siteName}
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
          getCardImages={getShelfItemImages}
          isLoading={firstRender}
          enableCardTitles={styling.shelfTitles}
          accessModel={accessModel}
          isLoggedIn={!!user}
          hasSubscription={!!subscription}
        />
      </main>
    </div>
  );
};

export default Search;
