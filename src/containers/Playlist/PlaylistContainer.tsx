import React, { useEffect } from 'react';

import { PersonalShelf, PersonalShelves } from '#src/enum/PersonalShelf';
import usePlaylist, { UsePlaylistResult } from '#src/hooks/usePlaylist';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { PLAYLIST_LIMIT } from '#src/config';
import type { Playlist } from '#types/playlist';

type ChildrenParams = {
  playlist: Playlist;
  isLoading: boolean;
  error: unknown;
  style?: React.CSSProperties;
};

type Props = {
  playlistId: string;
  onPlaylistUpdate?: (playlist: Playlist) => void;
  children: (childrenParams: ChildrenParams) => JSX.Element;
  style?: React.CSSProperties;
  showEmpty?: boolean;
};

const PlaylistContainer = ({ playlistId, onPlaylistUpdate, style, children, showEmpty = false }: Props): JSX.Element | null => {
  const isAlternativeShelf = PersonalShelves.includes(playlistId as PersonalShelf);
  const {
    isLoading,
    error,
    data: fetchedPlaylist = { title: '', playlist: [] },
  }: UsePlaylistResult = usePlaylist(playlistId, { page_limit: PLAYLIST_LIMIT.toString() }, !isAlternativeShelf, true);
  let playlist = fetchedPlaylist;

  const favoritesPlaylist = useFavoritesStore((state) => state.getPlaylist());
  const watchHistoryPlaylist = useWatchHistoryStore((state) => state.getPlaylist());

  useEffect(() => {
    if (playlist && onPlaylistUpdate) onPlaylistUpdate(playlist);
  }, [playlist, onPlaylistUpdate]);

  if (playlistId === PersonalShelf.Favorites) playlist = favoritesPlaylist;
  if (playlistId === PersonalShelf.ContinueWatching) playlist = watchHistoryPlaylist;

  if (!playlistId) return <p>No playlist id</p>;
  if (!playlist.playlist.length && !showEmpty) {
    return null;
  }

  return children({ playlist, isLoading, error, style });
};

export default PlaylistContainer;
