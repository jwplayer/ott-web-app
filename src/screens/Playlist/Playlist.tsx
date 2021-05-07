import React, { useState } from 'react';
import type { RouteComponentProps } from 'react-router-dom';
import type { GridCellProps } from 'react-virtualized';

import VirtualizedGrid from '../../components/VirtualizedGrid/VirtualizedGrid';
import usePlaylist from '../../hooks/usePlaylist';
import { getCategoriesFromPlaylist, filterPlaylistCategory, chunk } from '../../utils/collection';
import Card from '../../components/Card/Card';
import Filter from '../../components/Filter/Filter';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

import styles from './Playlist.module.scss';

const cols = {
  [Breakpoint.xs]: 2,
  [Breakpoint.sm]: 2,
  [Breakpoint.md]: 2,
  [Breakpoint.lg]: 4,
  [Breakpoint.xl]: 5,
};

type PlaylistRouteParams = {
  id: string;
};

function Playlist({
  match: {
    params: { id },
  },
}: RouteComponentProps<PlaylistRouteParams>) {
  const { isLoading, error, data: { title, playlist } = {} } = usePlaylist(id);
  const [filter, setFilter] = useState<string>('');
  const breakpoint: Breakpoint = useBreakpoint();

  if (isLoading) return <p>Loading...</p>;

  if (error || !playlist) return <p>No playlist found...</p>;

  const categories = getCategoriesFromPlaylist(playlist);
  const filteredPlaylist = filterPlaylistCategory(playlist, filter);

  const playlistRows = chunk(filteredPlaylist, cols[breakpoint]);

  const cellRenderer = ({ columnIndex, rowIndex, style }: GridCellProps) => {
    if (!playlistRows[rowIndex][columnIndex]) return;

    const { mediaid: mediaId, title, duration, image, seriesId } = playlistRows[rowIndex][columnIndex];

    return (
      <div className={styles.cell} style={style} key={mediaId}>
        <Card title={title} duration={duration} posterSource={image} seriesId={seriesId} onClick={() => ''} />
      </div>
    );
  };

  return (
    <div className={styles.playlist}>
      <header className={styles.header}>
        <h2>{title}</h2>
        {categories.length && (
          <Filter name="categories" value={filter} defaultLabel="All" options={categories} setValue={setFilter} />
        )}
      </header>
      <main className={styles.main}>
        <VirtualizedGrid rowCount={playlistRows.length} cellRenderer={cellRenderer} spacing={30} />
      </main>
    </div>
  );
}

export default Playlist;
