import React from 'react';
import type { PlaylistItem } from 'types/playlist';

import { PersonalShelf, PersonalShelves } from '../../enum/PersonalShelf';
import { useWatchHistory } from '../../stores/WatchHistoryStore';
import usePlaylist, { UsePlaylistResult } from '../../hooks/usePlaylist';
import ShelfComponent from '../../components/Shelf/Shelf';
import { useFavorites } from '../../stores/FavoritesStore';

type ShelfProps = {
  playlistId: string;
  onCardClick: (playlistItem: PlaylistItem) => void;
  onCardHover?: (playlistItem: PlaylistItem) => void;
  relatedMediaId?: string;
  featured?: boolean;
  title?: string;
};

const Shelf = ({
  playlistId,
  onCardClick,
  onCardHover,
  relatedMediaId,
  featured = false,
  title,
}: ShelfProps): JSX.Element | null => {
  const isAlternativeShelf = PersonalShelves.includes(playlistId as PersonalShelf);
  const { isLoading, error, data: playlist = { title: '', playlist: [] } }: UsePlaylistResult = usePlaylist(
    playlistId,
    relatedMediaId,
    !isAlternativeShelf,
  );
  const { getPlaylist: getFavoritesPlayist } = useFavorites();
  const favoritesPlaylist = getFavoritesPlayist();
  const { getPlaylist: getWatchHistoryPlayist } = useWatchHistory();
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
      title={title}
      featured={featured}
    />
  );
};

export default Shelf;
