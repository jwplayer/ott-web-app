import React from 'react';
import usePlaylist, { UsePlaylistResult } from '../../hooks/usePlaylist';
import ShelfComponent from '../../components/Shelf/Shelf';
import type { PlaylistItem } from 'types/playlist';

type ShelfProps = {
  playlistId: string;
  onCardClick: (playlistItem: PlaylistItem) => void;
  onCardHover: (playlistItem: PlaylistItem) => void;
  featured?: boolean;
};

const Shelf = ({ playlistId, onCardClick, onCardHover, featured = false }: ShelfProps): JSX.Element => {
  const { isLoading, error, data: playlist }: UsePlaylistResult = usePlaylist(playlistId);

  if (isLoading) return <p>Spinner here (todo)</p>;
  if (error) return <p>Error here {error}</p>;

  return <ShelfComponent playlist={playlist} onCardClick={onCardClick} onCardHover={onCardHover} featured={featured} />;
};

export default Shelf;
