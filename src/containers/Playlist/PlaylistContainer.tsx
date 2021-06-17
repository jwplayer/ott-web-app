import React, { useEffect } from 'react';
import type { Playlist } from 'types/playlist';

import { PersonalShelf, PersonalShelves } from '../../enum/PersonalShelf';
import usePlaylist, { UsePlaylistResult } from '../../hooks/usePlaylist';
import { useFavorites } from '../../stores/FavoritesStore';
import { useWatchHistory } from '../../stores/WatchHistoryStore';

type ChildrenParams = {
  playlist: Playlist;
  isLoading: boolean;
  error: unknown;
};

type Props = {
  playlistId: string;
  relatedMediaId?: string;
  onPlaylistUpdate?: (playlist: Playlist) => void;
  children: (childrenParams: ChildrenParams) => JSX.Element;
};

const PlaylistContainer = ({ playlistId, onPlaylistUpdate, children }: Props): JSX.Element | null => {
  const isAlternativeShelf = PersonalShelves.includes(playlistId as PersonalShelf);
  const { isLoading, error, data: fetchedPlaylist = { title: '', playlist: [] } }: UsePlaylistResult = usePlaylist(
    playlistId,
    relatedMediaId,
    !isAlternativeShelf,
  );

  let playlist = fetchedPlaylist;

  const { getPlaylist: getFavoritesPlayist } = useFavorites();
  const favoritesPlaylist = getFavoritesPlayist();
  const { getPlaylist: getWatchHistoryPlayist } = useWatchHistory();
  const watchHistoryPlayist = getWatchHistoryPlayist();

  useEffect(() => {
    if (playlist && onPlaylistUpdate) onPlaylistUpdate(playlist);
  }, [playlist, onPlaylistUpdate]);

  if (playlistId === PersonalShelf.Favorites) playlist = favoritesPlaylist;
  if (playlistId === PersonalShelf.ContinueWatching) playlist = watchHistoryPlayist;

  if (!playlistId) return <p>No playlist id</p>;

  return children({ playlist, isLoading, error });
};

export default PlaylistContainer;
