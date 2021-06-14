import React from 'react';
import type { PlaylistItem } from 'types/playlist';

import ShelfComponent from '../../components/Shelf/Shelf';
import { favoritesStore } from '../../stores/FavoritesStore';

type FavoritesShelfProps = {
  playlistId: string;
  onCardClick: (playlistItem: PlaylistItem) => void;
  onCardHover: (playlistItem: PlaylistItem) => void;
  featured?: boolean;
};

const Shelf = ({ playlistId, onCardClick, onCardHover, featured = false }: FavoritesShelfProps): JSX.Element => {
  const favoritesPlaylist = favoritesStore.useState(s => s.favorites);
  const continueWatchingPlaylist = favoritesStore.useState(s => s.favorites);

  const playlist = playlistId === 'favorites' ? favoritesPlaylist : continueWatchingPlaylist;

  return (
    <ShelfComponent
      loading={false}
      error={null}
      playlist={playlist}
      onCardClick={onCardClick}
      onCardHover={onCardHover}
      featured={featured}
    />
  );
};

export default Shelf;
