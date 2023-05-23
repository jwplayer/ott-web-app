import type { Playlist, PlaylistItem } from '#types/playlist';

/**
 * Get an array of options for a season filter
 */
export const getFiltersFromSeries = (playlist: Playlist | undefined): string[] => {
  // Old series doesn't have sorting supported and just aggregates all episodes in one playlist
  // So we need to sort the playlist manually based on the selected filter (season).
  return (playlist?.playlist || [])
    .reduce((filters: string[], item) => (item.seasonNumber && filters.includes(item.seasonNumber) ? filters : filters.concat(item.seasonNumber || '')), [])
    .slice()
    .sort();
};

/**
 * Get a playlist with episodes based on the selected filter
 */
export const filterSeries = (playlist: Playlist | undefined, filter: string | undefined): Playlist | undefined => {
  if (!playlist) return;

  if (filter === '') return playlist;

  return {
    ...playlist,
    // Filter episodes manually for the old flow where our playlists includes all episodes with all seasons
    playlist: playlist.playlist.filter(({ seasonNumber }) => seasonNumber === filter),
  };
};

export const getNextItem = (episode: PlaylistItem | undefined, seriesPlaylist: Playlist | undefined): PlaylistItem | undefined => {
  if (!episode || !seriesPlaylist) return;

  // For the old flow we already have all the episodes and seasons so we just need to find them in the array
  const index = seriesPlaylist?.playlist?.findIndex(({ mediaid }) => mediaid === episode.mediaid);

  return seriesPlaylist?.playlist?.[index + 1];
};

/** Get a total amount of episodes in a season */
export const getEpisodesInSeason = (episode: PlaylistItem | undefined, seriesPlaylist: Playlist | undefined) => {
  if (!seriesPlaylist) return;

  return seriesPlaylist.playlist.filter((i) => i.seasonNumber === episode?.seasonNumber)?.length;
};
