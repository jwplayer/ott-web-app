import type { Consent, CustomerConsent } from '#types/account';
import type { Config } from '#types/Config';
import type { GenericFormValues } from '#types/form';
import type { Playlist, PlaylistItem } from '#types/playlist';
import type { PosterAspectRatio } from '#components/Card/Card';
import { cardAspectRatios } from '#components/Card/Card';

const getFiltersFromConfig = (config: Config, playlistId: string | undefined): string[] => {
  const menuItem = config.menu.find((item) => item.contentId === playlistId);
  const filters = menuItem?.filterTags?.split(',').filter(Boolean);

  return filters || [];
};

const filterPlaylist = (playlist: Playlist, filter: string) => {
  if (filter === '') return playlist;

  return {
    ...playlist,
    playlist: playlist.playlist.filter(({ tags }) => (tags ? tags.split(',').includes(filter) : false)),
  };
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
        cardImage: '',
        backgroundImage: '',
        channelLogoImage: '',
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

const formatConsentValues = (publisherConsents: Consent[] | null = [], customerConsents: CustomerConsent[] | null = []) => {
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

const formatConsentsFromValues = (publisherConsents: Consent[] | null, values?: GenericFormValues) => {
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

const parseAspectRatio = (input: unknown) => {
  if (typeof input === 'string' && (cardAspectRatios as readonly string[]).includes(input)) return input as PosterAspectRatio;
};

const parseTilesDelta = (posterAspect?: PosterAspectRatio) => {
  if (!posterAspect) {
    return 0;
  }

  const parts = posterAspect.split(':');

  return parts.length === 2 ? Math.floor(parseInt(parts[1]) / parseInt(parts[0])) : 0;
};

export {
  getFiltersFromConfig,
  filterPlaylist,
  chunk,
  findPlaylistImageForWidth,
  generatePlaylistPlaceholder,
  formatConsentValues,
  formatConsentsFromValues,
  extractConsentValues,
  checkConsentsFromValues,
  deepCopy,
  parseAspectRatio,
  parseTilesDelta,
};
