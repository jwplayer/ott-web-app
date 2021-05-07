import type { PlaylistItem } from 'types/playlist';

const getCategoriesFromPlaylist = (playlist: PlaylistItem[]) =>
  playlist.reduce(
    (categories: string[], item) =>
      categories.includes(item.genre)
        ? categories
        : categories.concat(item.genre),
    [],
  );

const filterPlaylistCategory = (playlist: PlaylistItem[], filter: string) => {
  if (!filter) return playlist;

  return playlist.filter(({ genre }) => genre === filter);
};

export { getCategoriesFromPlaylist, filterPlaylistCategory };
