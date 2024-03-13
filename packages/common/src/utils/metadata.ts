import type { Playlist, PlaylistItem } from '../../types/playlist';

import { formatDuration, formatVideoSchedule } from './formatting';

export const createVideoMetadata = (media: PlaylistItem, episodesLabel?: string) => {
  const metaData = [];
  const duration = formatDuration(media.duration);

  if (media.pubdate) metaData.push(String(new Date(media.pubdate * 1000).getFullYear()));
  if (!episodesLabel && duration) metaData.push(duration);
  if (episodesLabel) metaData.push(episodesLabel);
  if (media.genre) metaData.push(media.genre);
  if (media.rating) metaData.push(media.rating);

  return metaData;
};
export const createPlaylistMetadata = (playlist: Playlist, episodesLabel?: string) => {
  const metaData = [];

  if (episodesLabel) metaData.push(episodesLabel);
  if (playlist.genre) metaData.push(playlist.genre as string);
  if (playlist.rating) metaData.push(playlist.rating as string);

  return metaData;
};
export const createLiveEventMetadata = (media: PlaylistItem, locale: string) => {
  const metaData = [];
  const scheduled = formatVideoSchedule(locale, media.scheduledStart, media.scheduledEnd);
  const duration = formatDuration(media.duration);

  if (scheduled) metaData.push(scheduled);
  if (duration) metaData.push(duration);
  if (media.genre) metaData.push(media.genre);
  if (media.rating) metaData.push(media.rating);

  return metaData;
};
