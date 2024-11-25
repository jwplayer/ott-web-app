import type { Playlist, PlaylistItem } from '../../types/playlist';
import type { DurationAbbreviation } from '../../types/i18n';

import { formatDuration, formatVideoSchedule } from './formatting';

export const createVideoMetadata = (media: PlaylistItem, i18n: DurationAbbreviation & { episodesLabel?: string }) => {
  const metaData = [];
  const duration = formatDuration(media.duration, i18n);

  if (media.pubdate) metaData.push(String(new Date(media.pubdate * 1000).getFullYear()));
  if (!i18n.episodesLabel && duration) metaData.push(duration);
  if (i18n.episodesLabel) metaData.push(i18n.episodesLabel);
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
export const createLiveEventMetadata = (media: PlaylistItem, locale: string, i18n: DurationAbbreviation) => {
  const metaData = [];
  const scheduled = formatVideoSchedule(locale, media.scheduledStart, media.scheduledEnd);
  const duration = formatDuration(media.duration, i18n);

  if (scheduled) metaData.push(scheduled);
  if (duration) metaData.push(duration);
  if (media.genre) metaData.push(media.genre);
  if (media.rating) metaData.push(media.rating);

  return metaData;
};
