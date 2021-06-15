import React from 'react';
import type { PlaylistItem } from 'types/playlist';

import { PersonalShelf, PersonalShelves } from '../../enum/PersonalShelf';
import { useWatchlist } from '../../stores/WatchHistoryStore';
import usePlaylist, { UsePlaylistResult } from '../../hooks/usePlaylist';
import ShelfComponent from '../../components/Shelf/Shelf';
import { useFavorites } from '../../stores/FavoritesStore';

type ShelfProps = {
  playlistId: string;
  onCardClick: (playlistItem: PlaylistItem) => void;
  onCardHover: (playlistItem: PlaylistItem) => void;
  relatedMediaId?: string;
  featured?: boolean;
};

const Shelf = ({
  playlistId,
  onCardClick,
  onCardHover,
  relatedMediaId,
  featured = false,
}: ShelfProps): JSX.Element | null => {
  const isAlternativeShelf = PersonalShelves.includes(playlistId as PersonalShelf);
  const { isLoading, error, data: playlist = { title: '', playlist: [] } }: UsePlaylistResult = usePlaylist(
    playlistId,
    relatedMediaId,
    !isAlternativeShelf,
  );
  const { getPlaylist: getFavoritesPlayist } = useFavorites();
  const favoritesPlaylist = getFavoritesPlayist();
  const { getPlaylist: getWatchHistoryPlayist } = useWatchlist();
  const watchHistoryPlayist = getWatchHistoryPlayist();

  let shelfPlaylist = playlist;
  if (playlistId === PersonalShelf.Favorites) shelfPlaylist = favoritesPlaylist;
  if (playlistId === PersonalShelf.ContinueWatching) shelfPlaylist = watchHistoryPlayist;

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
