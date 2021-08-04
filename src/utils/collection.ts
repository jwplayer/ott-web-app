import type { Consent, CustomerConsent } from 'types/account';
import type { Config } from 'types/Config';
import type { GenericFormValues } from 'types/form';
import type { Playlist, PlaylistItem } from 'types/playlist';

const getFiltersFromConfig = (config: Config, playlistId: string): string[] => {
  const menuItem = config.menu.find((item) => item.playlistId === playlistId);
  const filters = menuItem?.filterTags?.split(',');

  return filters || [];
};

const filterPlaylist = (playlist: PlaylistItem[], filter: string) => {
  if (!filter) return playlist;

  return playlist.filter(({ tags }) => (tags ? tags.split(',').includes(filter) : false));
};

const getFiltersFromSeries = (series: PlaylistItem[]): string[] =>
  series.reduce(
    (filters: string[], item) => (item.seasonNumber && filters.includes(item.seasonNumber) ? filters : filters.concat(item.seasonNumber || '')),
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

const formatConsentValues = (publisherConsents?: Consent[], customerConsents?: CustomerConsent[]) => {
  if (!publisherConsents || !customerConsents) {
    return {};
  }

  const values: Record<string, boolean> = {};
  publisherConsents?.forEach((publisherConsent) => {
    if (customerConsents?.find((customerConsent) => customerConsent.name === publisherConsent.name && customerConsent.state === 'accepted')) {
      values[publisherConsent.name] = true;
    }
  });

  return values;
};

const extractConsentValues = (consents?: Consent[]) => {
  const values: Record<string, boolean> = {};

  if (!consents) {
    return values;
  }

  consents?.forEach((consent) => {
    values[consent.name] = consent.enabledByDefault;
  });

  return values;
};

const formatConsentsFromValues = (publisherConsents?: Consent[], values?: GenericFormValues) => {
  const consents: CustomerConsent[] = [];

  if (!publisherConsents || !values) return consents;

  publisherConsents.forEach((consent) => {
    consents.push({
      name: consent.name,
      version: consent.version,
      state: values.consents[consent.name] ? 'accepted' : 'declined',
    });
  });

  return consents;
};

const checkConsentsFromValues = (publisherConsents: Consent[], consents: Record<string, boolean>) => {
  const customerConsents: CustomerConsent[] = [];
  const consentsErrors: string[] = [];

  if (!publisherConsents || !consents) return { customerConsents, consentsErrors };

  publisherConsents.forEach((consent) => {
    if (consent.required && !consents[consent.name]) {
      consentsErrors.push(consent.name);
    }

    customerConsents.push({
      name: consent.name,
      version: consent.version,
      state: consents[consent.name] ? 'accepted' : 'declined',
    });
  });

  return { customerConsents, consentsErrors };
};

const deepCopy = (obj: unknown) => {
  if (Array.isArray(obj) || (typeof obj === 'object' && obj !== null)) {
    return JSON.parse(JSON.stringify(obj));
  }
  return obj;
};

export {
  getFiltersFromConfig,
  getFiltersFromSeries,
  filterPlaylist,
  filterSeries,
  chunk,
  findPlaylistImageForWidth,
  generatePlaylistPlaceholder,
  formatConsentValues,
  formatConsentsFromValues,
  extractConsentValues,
  checkConsentsFromValues,
  deepCopy,
};
