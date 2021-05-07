import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { GridCellProps } from 'react-virtualized';

import VirtualizedGrid from '../../components/VirtualizedGrid/VirtualizedGrid';
import Layout from '../../components/Layout/Layout';
import usePlaylist from '../../hooks/usePlaylist';
import { getCategoriesFromPlaylist, filterPlaylistCategory, chunk } from '../../utils/collection';
import Card from '../../components/Card/Card';
import Dropdown from '../../components/Filter/Filter';
import useBreakpoint, { Breakpoint } from '../../hooks/useBreakpoint';

import styles from './Playlist.module.scss';

const cols = {
  [Breakpoint.xs]: 2,
  [Breakpoint.sm]: 2,
  [Breakpoint.md]: 2,
  [Breakpoint.lg]: 4,
  [Breakpoint.xl]: 5,
};

function Playlist() {
  const breakpoint: Breakpoint = useBreakpoint();
  const { id: playlistId } = useParams<Record<string, string>>();
  const [filter, setFilter] = useState<string>('');
  const { isLoading, error, data: { title, playlist } = {} } = usePlaylist(playlistId);

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>No playlist found...</p>;

  const categories = getCategoriesFromPlaylist(playlist);
  const filteredPlaylist = filterPlaylistCategory(playlist, filter);

  const playlistRows = chunk(filteredPlaylist, cols[breakpoint]);

  const cellRenderer = ({ columnIndex, key, rowIndex, style }: GridCellProps) => {
    if (!playlistRows[rowIndex][columnIndex]) return;

    const { mediaid: mediaId, title, duration, image, seriesId } = playlistRows[rowIndex][columnIndex];

    return (
      <div className={styles.wrapper} style={style} key={key}>
        <Card
          key={mediaId}
          title={title}
          duration={duration}
          posterSource={image}
          seriesId={seriesId}
          onClick={() => ''}
        />
      </div>
    );
  };

  return (
    <div className={styles.playlist}>
      <header className={styles.header}>
        <h2>{title}</h2>
        {categories.length && (
          <Dropdown name="categories" value={filter} defaultLabel="All" options={categories} setValue={setFilter} />
        )}
      </header>
      <main>
        <VirtualizedGrid rowCount={playlistRows.length} cellRenderer={cellRenderer} spacing={30} />
      </main>
    </div>
  );
}

export default Playlist;
