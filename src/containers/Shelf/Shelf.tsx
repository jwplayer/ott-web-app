import React from 'react';
import type { PlaylistItem } from 'types/playlist';

import usePlaylist, { UsePlaylistResult } from '../../hooks/usePlaylist';
import ShelfComponent from '../../components/Shelf/Shelf';

type ShelfProps = {
  playlistId: string;
  onCardClick: (playlistItem: PlaylistItem) => void;
  onCardHover: (playlistItem: PlaylistItem) => void;
  relatedMediaId?: string;
  featured?: boolean;
};

const Shelf = ({ playlistId, onCardClick, onCardHover, relatedMediaId, featured = false }: ShelfProps): JSX.Element => {
  const { isLoading, error, data: playlist }: UsePlaylistResult = usePlaylist(playlistId, relatedMediaId);

  if (!playlistId) return <p>No playlist</p>;
  if (error) return <p>Error here {error}</p>;

  return (
    <ShelfComponent
      loading={isLoading}
      playlist={playlist}
      onCardClick={onCardClick}
      onCardHover={onCardHover}
      featured={featured}
    />
  );
};

export default Shelf;
