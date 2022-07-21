import React, { useEffect } from 'react';

import { Shelf, PersonalShelves } from '#src/enum/PersonalShelf';
import usePlaylist from '#src/hooks/usePlaylist';
import { useWatchHistoryStore } from '#src/stores/WatchHistoryStore';
import { useFavoritesStore } from '#src/stores/FavoritesStore';
import { PLAYLIST_LIMIT } from '#src/config';
import type { Playlist, PlaylistItem } from '#types/playlist';
import { useConfigStore } from '#src/stores/ConfigStore';

type ChildrenParams = {
  playlist: Playlist;
  isLoading: boolean;
  error: unknown;
  style?: React.CSSProperties;
};

type Props = {
  playlistId?: string;
  type: Shelf;
  relatedItem?: PlaylistItem;
  onPlaylistUpdate?: (playlist: Playlist) => void;
  children: (childrenParams: ChildrenParams) => JSX.Element;
  style?: React.CSSProperties;
  showEmpty?: boolean;
};

const PlaylistContainer = ({ playlistId, type, onPlaylistUpdate, style, children, showEmpty = false }: Props): JSX.Element | null => {
  const recommendationsPlaylist = useConfigStore((s) => s.config?.features?.recommendationsPlaylist) as string;
  const favoritesPlaylist = useFavoritesStore((state) => state.getPlaylist());
  const { continueWatchingPlaylist, watchedItem } = useWatchHistoryStore((state) => ({
    continueWatchingPlaylist: state.getPlaylist(),
    watchedItem: state.getWatchedItem(),
  }));

  const isAlternativeShelf = PersonalShelves.some((shelfType) => shelfType === type);
  const isRecommendationsShelf = type === Shelf.Recommendations;

  const id = isRecommendationsShelf ? recommendationsPlaylist : playlistId;
  const playlistQueryEnabled = isRecommendationsShelf && !!watchedItem ? true : !isAlternativeShelf;
  const related_media_id = isRecommendationsShelf ? watchedItem?.mediaid : undefined;

  const {
    isLoading,
    error,
    data: fetchedPlaylist = { title: '', playlist: [] },
  } = usePlaylist(id, { page_limit: PLAYLIST_LIMIT.toString(), related_media_id }, playlistQueryEnabled, !isRecommendationsShelf);
  let playlist = fetchedPlaylist;

  useEffect(() => {
    if (playlist && onPlaylistUpdate) onPlaylistUpdate(playlist);
  }, [playlist, onPlaylistUpdate]);

  if (type === Shelf.Favorites) playlist = favoritesPlaylist;
  if (type === Shelf.ContinueWatching) playlist = continueWatchingPlaylist;
  if (type === Shelf.Recommendations) playlist.title = `Because you watched ${watchedItem?.title}`;

  if (!playlistId && !type) {
    throw new Error('Playlist without contentId and type was set in the content config section. Please check the config validity');
  }

  if (!playlist.playlist.length && !showEmpty) {
    return null;
  }

  return children({ playlist, isLoading, error, style });
};

export default PlaylistContainer;
