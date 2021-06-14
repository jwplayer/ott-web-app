import React from 'react';
import type { PlaylistItem } from 'types/playlist';

import usePlaylist, { UsePlaylistResult } from '../../hooks/usePlaylist';
import ShelfComponent from '../../components/Shelf/Shelf';
import { favoritesStore } from '../../stores/FavoritesStore';

type ShelfProps = {
  playlistId: string;
  onCardClick: (playlistItem: PlaylistItem) => void;
  onCardHover: (playlistItem: PlaylistItem) => void;
  relatedMediaId?: string;
  featured?: boolean;
};

const alternativeShelves = ['favorites'];
const Shelf = ({ playlistId, onCardClick, onCardHover, relatedMediaId, featured = false }: ShelfProps): JSX.Element | null => {
  const isAlternativeShelf = alternativeShelves.includes(playlistId);
  const {
    isLoading,
    error,
    data: playlist = { title: '', playlist: [] },
  }: UsePlaylistResult = usePlaylist(playlistId, relatedMediaId, !isAlternativeShelf);

  const favoritesPlaylist = favoritesStore.useState((s) => s.favorites);

  const shelfPlaylist = playlistId === 'favorites' ? favoritesPlaylist : playlist;

  if (!playlistId) return <p>No playlist id</p>;
  if (!isLoading && !shelfPlaylist?.playlist.length) return null;

  return (
    <ShelfComponent
      loading={isLoading}
      error={error}
      playlist={shelfPlaylist}
      onCardClick={onCardClick}
      onCardHover={onCardHover}
      featured={featured}
    />
  );
};

export default Shelf;
