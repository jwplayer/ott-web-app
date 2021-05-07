import React, { useState } from 'react';

import usePlaylist from '../../hooks/usePlaylist';
import { getCategoriesFromPlaylist, filterPlaylistCategory } from '../../utils/collection';
import Card from '../../components/Card/Card';
import Dropdown from '../../components/Dropdown/Dropdown';
import CardGrid from '../../components/CardGrid/CardGrid';

import styles from './Playlist.module.scss';

// TEMP DATA
const playlistId = 'sR5VypYk';

type PlaylistDestructuredArguments = {
  mediaid: string;
  title: string;
  duration: number;
  image: string;
};

function Playlist() {
  const { isLoading, error, data: { title, playlist } = {} } = usePlaylist(playlistId);
  const [filter, setFilter] = useState<string>('');

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>No playlist found...</p>;

  const categories = getCategoriesFromPlaylist(playlist);
  const filteredPlaylist = filterPlaylistCategory(playlist, filter);

  return (
    <div className={styles.playlist}>
      <header className={styles.header}>
        <h2>{title}</h2>
        {categories.length && (
          <Dropdown name="categories" value={filter} defaultLabel="All" options={categories} setValue={setFilter} />
        )}
      </header>
      <main>
        <CardGrid>
          {filteredPlaylist.map(({ mediaid: mediaId, title, duration, image }: PlaylistDestructuredArguments) => (
            <Card key={mediaId} title={title} duration={duration} posterSource={image} onClick={() => ''} />
          ))}
        </CardGrid>
      </main>
    </div>
  );
}

export default Playlist;
