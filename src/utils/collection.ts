import type { Playlist } from 'types/playlist';

const getCategoriesFromPlaylist = (playlist: Playlist) =>
  playlist.reduce(
    (categories: string[], item) => (categories.includes(item.genre) ? categories : categories.concat(item.genre)),
    [],
  );

const filterPlaylistCategory = (playlist: Playlist, filter: string) => {
  if (!filter) return playlist;

  return playlist.filter(({ genre }) => genre === filter);
};

export { getCategoriesFromPlaylist, filterPlaylistCategory };
