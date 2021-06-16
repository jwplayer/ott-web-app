import React from 'react';
import type { Playlist } from 'types/playlist';

import { PersonalShelf, PersonalShelves } from '../../enum/PersonalShelf';
import usePlaylist, { UsePlaylistResult } from '../../hooks/usePlaylist';
import { useFavorites } from '../../stores/FavoritesStore';
import { useWatchHistory } from '../../stores/WatchHistoryStore';

type ChildrenParams = {
  playlist: Playlist;
  error: unknown;
};

type Props = {
  playlistId: string;
  children: (childrenParams: ChildrenParams) => JSX.Element;
  relatedMediaId?: string;
};

const PlaylistContainer = ({ playlistId, children, relatedMediaId }: Props): JSX.Element | null => {
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

  // if (isLoading || error || !playlist || !children) return null;

  let shelfPlaylist = playlist;
  if (playlistId === PersonalShelf.Favorites) shelfPlaylist = favoritesPlaylist;
  if (playlistId === PersonalShelf.ContinueWatching) shelfPlaylist = watchHistoryPlayist;

  if (!playlistId) return <p>No playlist id</p>;
  if (!isLoading && !shelfPlaylist?.playlist.length) return null;

  return children({ playlist, error });
};

export default PlaylistContainer;
