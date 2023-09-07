import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import shallow from 'zustand/shallow';

import styles from './PlaylistGrid.module.scss';

import { filterPlaylist, getFiltersFromConfig } from '#src/utils/collection';
import CardGrid from '#components/CardGrid/CardGrid';
import Filter from '#components/Filter/Filter';
import { useAccountStore } from '#src/stores/AccountStore';
import { useConfigStore } from '#src/stores/ConfigStore';
import type { Playlist, PlaylistItem } from '#types/playlist';
import type { ScreenComponent } from '#types/screens';
import { mediaURL } from '#src/utils/formatting';

const PlaylistGrid: ScreenComponent<Playlist> = ({ data, isLoading }) => {
  const { config, accessModel } = useConfigStore(({ config, accessModel }) => ({ config, accessModel }), shallow);

  const [filter, setFilter] = useState<string>('');

  const categories = getFiltersFromConfig(config, data.feedid);
  const filteredPlaylist = useMemo(() => filterPlaylist(data, filter), [data, filter]);
  const shouldShowFilter = Boolean(categories.length);

  // User
  const { user, subscription } = useAccountStore(({ user, subscription }) => ({ user, subscription }), shallow);

  useEffect(() => {
    // reset filter when the playlist id changes
    setFilter('');
  }, [data.feedid]);

  const pageTitle = `${data.title} - ${config.siteName}`;

  const getUrl = (playlistItem: PlaylistItem) => mediaURL({ media: playlistItem, playlistId: playlistItem.feedid });

  return (
    <div className={styles.playlist}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
        <meta name="twitter:title" content={pageTitle} />
      </Helmet>
      <header className={styles.header}>
        <h2>{data.title}</h2>
        {shouldShowFilter && <Filter name="genre" value={filter} defaultLabel="All" options={categories} setValue={setFilter} />}
      </header>
      <main className={styles.main}>
        <CardGrid
          getUrl={getUrl}
          playlist={filteredPlaylist}
          accessModel={accessModel}
          isLoggedIn={!!user}
          hasSubscription={!!subscription}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default PlaylistGrid;
