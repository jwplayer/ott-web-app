import type { PlaylistItem } from 'types/playlist';

const getCategoriesFromPlaylist = (playlist: PlaylistItem[]) =>
  playlist.reduce(
    (categories: string[], item) =>
      categories.includes(item.genre) || !item.genre ? categories : categories.concat(item.genre),
    [],
  );

const filterPlaylistCategory = (playlist: PlaylistItem[], filter: string) => {
  if (!filter) return playlist;

  return playlist.filter(({ genre }) => genre === filter);
};

const chunk = <T>(input: T[], size: number) => {
  return input?.reduce((arr: T[][], item, idx: number) => {
    return idx % size === 0 ? [...arr, [item]] : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};

const findPlaylistImageForWidth = (playlistItem: PlaylistItem, width: number): string =>
  playlistItem.images.find((img) => img.width === width)?.src || playlistItem.image;

export { getCategoriesFromPlaylist, filterPlaylistCategory, chunk, findPlaylistImageForWidth };
