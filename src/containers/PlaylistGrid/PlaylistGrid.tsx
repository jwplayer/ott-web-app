import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import shallow from 'zustand/shallow';

import styles from './PlaylistGrid.module.scss';

import { cardUrl } from '#src/utils/formatting';
import { filterPlaylist, getFiltersFromConfig } from '#src/utils/collection';
import CardGrid from '#src/components/CardGrid/CardGrid';
import Filter from '#src/components/Filter/Filter';
import useBlurImageUpdater from '#src/hooks/useBlurImageUpdater';
import { useAccountStore } from '#src/stores/AccountStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { Playlist, PlaylistItem } from '#types/playlist';

function PlaylistGrid({ playlist }: { playlist: Playlist }) {
  const navigate = useNavigate();
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);

  const [filter, setFilter] = useState<string>('');

  const categories = getFiltersFromConfig(config, playlist.feedid);
  const filteredPlaylist = useMemo(() => filterPlaylist(playlist, filter), [playlist, filter]);
  const shouldShowFilter = Boolean(categories.length);
  const updateBlurImage = useBlurImageUpdater(filteredPlaylist.playlist);

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  useEffect(() => {
    // reset filter when the playlist id changes
    setFilter('');
  }, [playlist.feedid]);

  const onCardClick = (playlistItem: PlaylistItem) => navigate(cardUrl(playlistItem, playlist.feedid));
  const onCardHover = (playlistItem: PlaylistItem) => updateBlurImage(playlistItem);

  const pageTitle = `${playlist.title} - ${config.siteName}`;

  return (
    <div className={styles.playlist}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
        <meta name="twitter:title" content={pageTitle} />
      </Helmet>
      <header className={styles.header}>
        <h2>{playlist.title}</h2>
        {shouldShowFilter && <Filter name="categories" value={filter} defaultLabel="All" options={categories} setValue={setFilter} />}
      </header>
      <main className={styles.main}>
        <CardGrid
          playlist={filteredPlaylist}
          onCardClick={onCardClick}
          onCardHover={onCardHover}
          enableCardTitles={config.styling.shelfTitles}
          accessModel={accessModel}
          isLoggedIn={!!user}
          hasSubscription={!!subscription}
          isLoading={false}
        />
      </main>
    </div>
  );
}

export default PlaylistGrid;
