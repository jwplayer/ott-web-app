import React, { useContext, useMemo, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import type { PlaylistItem } from 'types/playlist';
import type { Config } from 'types/Config';
import { Helmet } from 'react-helmet';

import { ConfigContext } from '../../providers/ConfigProvider';
import { cardUrl } from '../../utils/formatting';
import usePlaylist from '../../hooks/usePlaylist';
import { filterPlaylist, getFiltersFromConfig } from '../../utils/collection';
import CardGrid from '../../components/CardGrid/CardGrid';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import Filter from '../../components/Filter/Filter';
import useBlurImageUpdater from '../../hooks/useBlurImageUpdater';

import styles from './Playlist.module.scss';

type PlaylistRouteParams = {
  id: string;
};

function Playlist({
  match: {
    params: { id },
  },
}: RouteComponentProps<PlaylistRouteParams>) {
  const history = useHistory();
  const config: Config = useContext(ConfigContext);
  const { isLoading, error, data: { title, playlist } = { title: '', playlist: [] } } = usePlaylist(id);

  const [filter, setFilter] = useState<string>('');

  const categories = getFiltersFromConfig(config, id);
  const filteredPlaylist = useMemo(() => filterPlaylist(playlist, filter), [playlist, filter]);
  const updateBlurImage = useBlurImageUpdater(filteredPlaylist);

  const onCardClick = (playlistItem: PlaylistItem) => history.push(cardUrl(playlistItem, id));
  const onCardHover = (playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image);

  if (error || !playlist) {
    return <ErrorPage title="Playlist not found!" />;
  }

  return (
    <div className={styles.playlist}>
      <Helmet>
        <title>{title} - {config.siteName}</title>
      </Helmet>
      <header className={styles.header}>
        <h2>{title}</h2>
        <Filter name="categories" value={filter} defaultLabel="All" options={categories} setValue={setFilter} />
      </header>
      <main className={styles.main}>
        <CardGrid
          playlist={filteredPlaylist}
          onCardClick={onCardClick}
          onCardHover={onCardHover}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default Playlist;
