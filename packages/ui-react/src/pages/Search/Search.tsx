import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useUIStore } from '@jwp/ott-common/src/stores/UIStore';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import useFirstRender from '@jwp/ott-hooks-react/src/useFirstRender';
import useSearchQueryUpdater from '@jwp/ott-ui-react/src/hooks/useSearchQueryUpdater';
import { useSearch } from '@jwp/ott-hooks-react/src/useSearch';
import useOpaqueId from '@jwp/ott-hooks-react/src/useOpaqueId';

import CardGrid from '../../components/CardGrid/CardGrid';
import ErrorPage from '../../components/ErrorPage/ErrorPage';

import styles from './Search.module.scss';

const Search = () => {
  const { t } = useTranslation('search');
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);
  const { siteName, features } = config;
  const headingId = useOpaqueId('search_heading');

  const firstRender = useFirstRender();
  const searchQuery = useUIStore((state) => state.searchQuery);
  const { updateSearchQuery } = useSearchQueryUpdater();
  const params = useParams();
  const query = params['*'];
  const { isFetching, error, data: playlist } = useSearch(query || '');

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  const getURL = (playlistItem: PlaylistItem) => mediaURL({ media: playlistItem, playlistId: features?.searchPlaylist });

  // Update the search bar query to match the route param on mount
  useEffect(() => {
    if (!firstRender) {
      return;
    }

    if (query && query !== searchQuery) {
      updateSearchQuery(query);
    }
  }, [firstRender, query, searchQuery, updateSearchQuery]);

  useEffect(() => {
    return () => {
      useUIStore.setState({
        searchQuery: '',
        searchActive: false,
      });
    };
  }, []);

  if ((error || !playlist) && !isFetching) {
    return (
      <ErrorPage title={t('error_heading')}>
        <h2 className={styles.subHeading}>{t('error_subheading')}</h2>
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
        <h2 className={styles.subHeading}>{t('suggestions')}</h2>
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
          {t('title', { count: playlist.playlist.length, query })} - {siteName}
        </title>
      </Helmet>
      <header className={styles.header}>
        <h2 id={headingId}>{t('heading')}</h2>
      </header>
      <CardGrid
        aria-labelledby={headingId}
        getUrl={getURL}
        playlist={playlist}
        isLoading={firstRender}
        accessModel={accessModel}
        isLoggedIn={!!user}
        hasSubscription={!!subscription}
      />
    </div>
  );
};

export default Search;
