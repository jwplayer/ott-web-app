import React, { useEffect, useMemo, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import shallow from 'zustand/shallow';

import { cardUrl } from '../../utils/formatting';
import usePlaylist from '../../hooks/usePlaylist';
import { filterPlaylist, getFiltersFromConfig } from '../../utils/collection';
import CardGrid from '../../components/CardGrid/CardGrid';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import Filter from '../../components/Filter/Filter';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';
import { useAccountStore } from '../../stores/AccountStore';
import { useConfigStore } from '../../stores/ConfigStore';

import styles from './Playlist.module.scss';

import type { PlaylistItem } from '#types/playlist';

type PlaylistRouteParams = {
  id: string;
};

function Playlist({
  match: {
    params: { id },
  },
}: RouteComponentProps<PlaylistRouteParams>) {
  const history = useHistory();
  const config = useConfigStore((state) => state.config);
  const accessModel = useConfigStore((state) => state.accessModel);

  const { isLoading, isPlaceholderData, error, data: { title, playlist } = { title: '', playlist: [] } } = usePlaylist(id);

  const [filter, setFilter] = useState<string>('');

  const categories = getFiltersFromConfig(config, id);
  const filteredPlaylist = useMemo(() => filterPlaylist(playlist, filter), [playlist, filter]);
  const updateBlurImage = useBlurImageUpdater(filteredPlaylist);

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  useEffect(() => {
    // reset filter when the playlist id changes
    setFilter('');
  }, [id]);

  const onCardClick = (playlistItem: PlaylistItem) => history.push(cardUrl(playlistItem, id));
  const onCardHover = (playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image);

  if (error || !playlist) {
    return <ErrorPage title="Playlist not found!" />;
  }

  const pageTitle = `${title} - ${config.siteName}`;

  return (
    <div className={styles.playlist}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
        <meta name="twitter:title" content={pageTitle} />
      </Helmet>
      <header className={styles.header}>
        <h2>{isLoading || isPlaceholderData ? 'Loading' : title}</h2>
        {!isLoading && !isPlaceholderData && <Filter name="categories" value={filter} defaultLabel="All" options={categories} setValue={setFilter} />}
      </header>
      <main className={styles.main}>
        <CardGrid
          playlist={filteredPlaylist}
          onCardClick={onCardClick}
          onCardHover={onCardHover}
          isLoading={isLoading}
          enableCardTitles={config.options.shelfTitles}
          accessModel={accessModel}
          isLoggedIn={!!user}
          hasSubscription={!!subscription}
        />
      </main>
    </div>
  );
}

export default Playlist;
