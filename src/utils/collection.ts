import type { Config } from 'types/Config';
import type { Playlist, PlaylistItem } from 'types/playlist';

const getFiltersFromConfig = (config: Config, playlistId: string): string[] => {
  const menuItem = config.menu.find((item) => item.playlistId === playlistId);
  const filters = menuItem?.filterTags?.split(',');

  return filters || [];
};

const filterPlaylist = (playlist: PlaylistItem[], filter: string) => {
  if (!filter) return playlist;

  return playlist.filter(({ tags }) => tags.split(',').includes(filter));
};

const getFiltersFromSeries = (series: PlaylistItem[]): string[] =>
  series.reduce(
    (filters: string[], item) =>
      item.seasonNumber && filters.includes(item.seasonNumber) ? filters : filters.concat(item.seasonNumber || ''),
    [],
  );

const filterSeries = (playlist: PlaylistItem[], filter: string) => {
  if (!filter) return playlist;

  return playlist.filter(({ seasonNumber }) => seasonNumber === filter);
};

const chunk = <T>(input: T[], size: number) => {
  return input?.reduce((arr: T[][], item, idx: number) => {
    return idx % size === 0 ? [...arr, [item]] : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};

const findPlaylistImageForWidth = (playlistItem: PlaylistItem, width: number): string =>
  playlistItem.images.find((img) => img.width === width)?.src || playlistItem.image;

const generatePlaylistPlaceholder = (playlistLength: number = 15): Playlist => ({
  title: '',
  playlist: new Array(playlistLength).fill({}).map(
    (_value, index) =>
      ({
        description: '',
        duration: 0,
        feedid: '',
        image: '',
        images: [],
        link: '',
        genre: '',
        mediaid: `placeholder_${index}`,
        pubdate: 0,
        rating: '',
        sources: [],
        tags: '',
        title: '',
        tracks: [],
      } as PlaylistItem),
  ),
});

export {
  getFiltersFromConfig,
  getFiltersFromSeries,
  filterPlaylist,
  filterSeries,
  chunk,
  findPlaylistImageForWidth,
  generatePlaylistPlaceholder,
};
