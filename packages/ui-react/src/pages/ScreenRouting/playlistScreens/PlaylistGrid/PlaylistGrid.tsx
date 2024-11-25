import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { shallow } from '@jwp/ott-common/src/utils/compare';
import type { Playlist, PlaylistItem } from '@jwp/ott-common/types/playlist';
import { useAccountStore } from '@jwp/ott-common/src/stores/AccountStore';
import { useConfigStore } from '@jwp/ott-common/src/stores/ConfigStore';
import { filterPlaylist, getFiltersFromConfig } from '@jwp/ott-common/src/utils/collection';
import { mediaURL } from '@jwp/ott-common/src/utils/urlFormatting';
import { useTranslationKey } from '@jwp/ott-hooks-react/src/useTranslationKey';

import type { ScreenComponent } from '../../../../../types/screens';
import CardGrid from '../../../../components/CardGrid/CardGrid';
import Filter from '../../../../components/Filter/Filter';

import styles from './PlaylistGrid.module.scss';

const PlaylistGrid: ScreenComponent<Playlist> = ({ data, isLoading }) => {
  const translationKey = useTranslationKey('title');
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

  const title = (data?.[translationKey] as string) || data.title;
  const pageTitle = `${title} - ${config.siteName}`;

  const getUrl = (playlistItem: PlaylistItem) =>
    mediaURL({
      id: playlistItem.mediaid,
      title: playlistItem.title,
      playlistId: playlistItem.feedid,
    });

  return (
    <div className={styles.playlist}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
        <meta name="twitter:title" content={pageTitle} />
      </Helmet>
      <header className={styles.header}>
        <h1>{title}</h1>
        {shouldShowFilter && <Filter name="genre" value={filter} defaultLabel="All" options={categories} setValue={setFilter} />}
      </header>
      <CardGrid
        getUrl={getUrl}
        playlist={filteredPlaylist}
        accessModel={accessModel}
        isLoggedIn={!!user}
        hasSubscription={!!subscription}
        isLoading={isLoading}
        headingLevel={2}
      />
    </div>
  );
};

export default PlaylistGrid;
