import React, { useEffect } from 'react';
import type { Playlist, PlaylistItem } from 'types/playlist';

import { PersonalShelf, PersonalShelves } from '../../enum/PersonalShelf';
import usePlaylist, { UsePlaylistResult } from '../../hooks/usePlaylist';
import { useFavorites } from '../../stores/FavoritesStore';
import { useWatchHistory } from '../../stores/WatchHistoryStore';
import { playlistLimit } from '../../config';

type ChildrenParams = {
  playlist: Playlist;
  isLoading: boolean;
  error: unknown;
  style?: React.CSSProperties;
};

type Props = {
  playlistId: string;
  relatedItem?: PlaylistItem;
  onPlaylistUpdate?: (playlist: Playlist) => void;
  children: (childrenParams: ChildrenParams) => JSX.Element;
  style?: React.CSSProperties;
  showEmpty?: boolean;
};

const PlaylistContainer = ({ playlistId, relatedItem, onPlaylistUpdate, style, children, showEmpty = false }: Props): JSX.Element | null => {
  const isAlternativeShelf = PersonalShelves.includes(playlistId as PersonalShelf);
  const {
    isLoading,
    error,
    data: fetchedPlaylist = { title: '', playlist: [] },
  }: UsePlaylistResult = usePlaylist(playlistId, relatedItem?.mediaid, !isAlternativeShelf && !!playlistId, true, playlistLimit);

  let playlist = fetchedPlaylist;

  const { getPlaylist: getFavoritesPlaylist } = useFavorites();
  const favoritesPlaylist = getFavoritesPlaylist();
  const { getPlaylist: getWatchHistoryPlaylist } = useWatchHistory();
  const watchHistoryPlaylist = getWatchHistoryPlaylist();

  useEffect(() => {
    if (playlist && onPlaylistUpdate) onPlaylistUpdate(playlist);
  }, [playlist, onPlaylistUpdate]);

  if (playlistId === PersonalShelf.Favorites) playlist = favoritesPlaylist;
  if (playlistId === PersonalShelf.ContinueWatching) playlist = watchHistoryPlaylist;

  if (!playlistId) return <p>No playlist id</p>;
  if (!playlist.playlist.length && !showEmpty) {
    return null;
  }

  if (relatedItem && !playlist.playlist.some(({ mediaid }) => mediaid === relatedItem.mediaid)) {
    playlist.playlist.unshift(relatedItem);
  }

  return children({ playlist, isLoading, error, style });
};

export default PlaylistContainer;
