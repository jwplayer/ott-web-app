import i18next from 'i18next';

import { legacySeriesURL } from '#src/utils/formatting';
import { secondsToISO8601 } from '#src/utils/datetime';
import type { Playlist, PlaylistItem } from '#types/playlist';
import type { EpisodeMetadata } from '#types/series';

/**
 * Get an array of options for a season filter
 */
export const getFiltersFromSeries = (playlist: Playlist | undefined): { value: string; label: string }[] => {
  // Old series doesn't have sorting supported and just aggregates all episodes in one playlist
  // So we need to sort the playlist manually based on the selected filter (season).
  return (playlist?.playlist || [])
    .reduce((filters, item) => {
      if (filters.some((el) => el?.value === item?.seasonNumber)) {
        return filters;
      }

      return filters.concat(
        item.seasonNumber ? [{ label: i18next.t('video:season_number_filter_template', { seasonNumber: item.seasonNumber }), value: item.seasonNumber }] : [],
      );
    }, [] as { value: string; label: string }[])
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

export const generateLegacySeriesMetadata = (seriesPlaylist: Playlist, seriesId: string | undefined) => {
  // Use playlist for old flow and media id for a new flow
  const seriesCanonical = `${window.location.origin}/s/${seriesId}`;

  return {
    '@type': 'TVSeries',
    '@id': seriesCanonical,
    name: seriesPlaylist.title,
    numberOfEpisodes: String(seriesPlaylist.playlist.length),
    numberOfSeasons: String(
      seriesPlaylist.playlist.reduce(function (list, playlistItem) {
        return !playlistItem.seasonNumber || list.includes(playlistItem.seasonNumber) ? list : list.concat(playlistItem.seasonNumber);
      }, [] as string[]).length,
    ),
  };
};

export const generateLegacyEpisodeJSONLD = (
  seriesPlaylist: Playlist,
  episode: PlaylistItem | undefined,
  episodeMetadata: EpisodeMetadata | undefined,
  seriesId: string,
) => {
  const episodeCanonical = `${window.location.origin}${legacySeriesURL({ episodeId: episode?.mediaid, seriesId })}`;
  const seriesMetadata = generateLegacySeriesMetadata(seriesPlaylist, seriesId);

  if (!episode) {
    return JSON.stringify(seriesMetadata);
  }

  return JSON.stringify({
    '@context': 'http://schema.org/',
    '@type': 'TVEpisode',
    '@id': episodeCanonical,
    episodeNumber: episodeMetadata?.episodeNumber,
    seasonNumber: episodeMetadata?.seasonNumber,
    name: episode.title,
    uploadDate: secondsToISO8601(episode.pubdate),
    partOfSeries: seriesMetadata,
  });
};
