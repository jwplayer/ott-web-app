import React from 'react';

import usePlaylist from '../../hooks/usePlaylist';
import ShelfComponent from '../../components/Shelf/Shelf';

type ShelfProps = {
  playlistId: string;
  featured?: boolean;
};

const Shelf = ({ playlistId, featured = false }: ShelfProps) : JSX.Element => {
  const { isLoading, error, data: { title, playlist } = {} } = usePlaylist(
    playlistId,
  );

  if (isLoading) {
    return <p>Spinner here (todo)</p>;
  }
  if (error) {
    return <p>Error here {error}</p>;
  }

  return (
    <ShelfComponent title={title} playlist={playlist} featured={featured} />
  );
};

export default Shelf;
