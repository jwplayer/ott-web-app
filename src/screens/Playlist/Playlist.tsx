import React, { useContext, useEffect, useMemo, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import type { PlaylistItem } from 'types/playlist';
import type { Config } from 'types/Config';

import { ConfigContext } from '../../providers/ConfigProvider';
import { cardUrl } from '../../utils/formatting';
import usePlaylist from '../../hooks/usePlaylist';
import { filterPlaylist, getFiltersFromConfig } from '../../utils/collection';
import CardGrid from '../../components/CardGrid/CardGrid';
import ErrorPage from '../../components/ErrorPage/ErrorPage';
import Filter from '../../components/Filter/Filter';
import { UIStateContext } from '../../providers/uiStateProvider';

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
  const { updateBlurImage } = useContext(UIStateContext);
  const config: Config = useContext(ConfigContext);
  const { isLoading, error, data: { title, playlist } = { title: '', playlist: [] } } = usePlaylist(id);

  const [filter, setFilter] = useState<string>('');

  const categories = getFiltersFromConfig(config, id);
  const filteredPlaylist = useMemo(() => filterPlaylist(playlist, filter), [playlist, filter]);

  const onCardClick = (playlistItem: PlaylistItem) => history.push(cardUrl(playlistItem, id));
  const onCardHover = (playlistItem: PlaylistItem) => updateBlurImage(playlistItem.image);

  useEffect(() => {
    if (filteredPlaylist.length) updateBlurImage(filteredPlaylist[0].image);
  }, [filter, filteredPlaylist, updateBlurImage]);

  if (error || !playlist) {
    return <ErrorPage title="Playlist not found!" />
  }

  return (
    <div className={styles.playlist}>
      <header className={styles.header}>
        <h2>{title}</h2>
        <Filter name="categories" value={filter} defaultLabel="All" options={categories} setValue={setFilter} />
      </header>
      <main className={styles.main}>
        <CardGrid playlist={filteredPlaylist} onCardClick={onCardClick} onCardHover={onCardHover} isLoading={isLoading} />
      </main>
    </div>
  );
}

export default Playlist;
