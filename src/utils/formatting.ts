import type { PlaylistItem } from 'types/playlist';

const formatDurationTag = (seconds: number): string | null => {
  if (!seconds || typeof seconds !== 'number') return null;

  const minutes = Math.ceil(seconds / 60);

  return `${minutes} min`;
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

const movieURL = (item: PlaylistItem, playlistId: string = '') =>
  `/m/${item.mediaid}/${slugify(item.title)}?list=${playlistId}`;

const seriesURL = (item: PlaylistItem, playlistId: string = '') => `/s/${playlistId}/${slugify(item.title)}`;

const cardUrl = (item: PlaylistItem, playlistId: string = '') =>
  item.seriesId ? seriesURL(item, playlistId) : movieURL(item, playlistId);

const videoUrl = (item: PlaylistItem, playlistId: string = '', play: boolean = false) => {
  const url = item.seriesId ? seriesURL(item, playlistId) : movieURL(item, playlistId);

  return `${url}${play ? '&play=1' : ''}`;
};

export { formatDurationTag, cardUrl, movieURL, seriesURL, videoUrl };
