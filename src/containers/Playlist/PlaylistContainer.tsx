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
};

const PlaylistContainer = ({ playlistId, relatedItem, onPlaylistUpdate, style, children }: Props): JSX.Element | null => {
  const isAlternativeShelf = PersonalShelves.includes(playlistId as PersonalShelf);
  const {
    isLoading,
    error,
    data: fetchedPlaylist = { title: '', playlist: [] },
  }: UsePlaylistResult = usePlaylist(playlistId, relatedItem?.mediaid, !isAlternativeShelf && !!playlistId, true, playlistLimit);

  let playlist = fetchedPlaylist;

  const { getPlaylist: getFavoritesPlayist } = useFavorites();
  const favoritesPlaylist = getFavoritesPlayist();
  const { getPlaylist: getWatchHistoryPlayist } = useWatchHistory();
  const watchHistoryPlaylist = getWatchHistoryPlayist();

  useEffect(() => {
    if (playlist && onPlaylistUpdate) onPlaylistUpdate(playlist);
  }, [playlist, onPlaylistUpdate]);

  if (playlistId === PersonalShelf.Favorites) playlist = favoritesPlaylist;
  if (playlistId === PersonalShelf.ContinueWatching) playlist = watchHistoryPlaylist;

  if (!playlistId) return <p>No playlist id</p>;
  if (!playlist.playlist.length) {
    return null;
  }

  if (relatedItem && !playlist.playlist.some(({ mediaid }) => mediaid === relatedItem.mediaid)) {
    playlist.playlist.unshift(relatedItem);
  }

  return children({ playlist, isLoading, error, style });
};

export default PlaylistContainer;
