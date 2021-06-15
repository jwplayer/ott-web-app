import type { Playlist, PlaylistItem } from 'types/playlist';

const formatDurationTag = (seconds: number): string | null => {
  if (!seconds || typeof seconds !== 'number') return null;

  const minutes = Math.ceil(seconds / 60);

  return `${minutes} min`;
};
/**
 * @param duration Duration in seconds
 *
 * Calculates hours and minutes into a string
 * Hours are only shown if at least 1
 * Minutes get rounded
 *
 * @returns string, such as '2h 24m' or '31m'
 */

const formatDuration = (duration: number): string | null => {
  if (!duration || typeof duration !== 'number') return null;

  const hours = Math.floor(duration / 3600);
  const minutes = Math.round((duration - hours * 3600) / 60);

  const hoursString = hours ? `${hours}h ` : '';
  const minutesString = minutes ? `${minutes}m ` : '';

  return `${hoursString}${minutesString}`;
};

const slugify = (text: string, whitespaceChar: string = '-') =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .replace(/-/g, whitespaceChar);

const movieURL = (item: PlaylistItem, playlistId?: string | null) =>
  `/m/${item.mediaid}/${slugify(item.title)}${playlistId ? `?r=${playlistId}` : ''}`;

const seriesURL = (item: PlaylistItem, playlistId?: string | null) =>
  `/s/${item.seriesId}/${slugify(item.title)}?r=${playlistId}`;

const episodeURL = (seriesPlaylist: Playlist, episodeId?: string) =>
  `/s/${seriesPlaylist.feedid}/${slugify(seriesPlaylist.title)}${episodeId ? `?e=${episodeId}` : ''}`;

const cardUrl = (item: PlaylistItem, playlistId?: string | null) =>
  item.seriesId ? seriesURL(item, playlistId) : movieURL(item, playlistId);

const videoUrl = (item: PlaylistItem, playlistId?: string | null, play: boolean = false) => {
  const url = item.seriesId ? seriesURL(item, playlistId) : movieURL(item, playlistId);

  return `${url}${play ? '&play=1' : ''}`;
};

export { formatDurationTag, formatDuration, cardUrl, movieURL, seriesURL, videoUrl, episodeURL };
