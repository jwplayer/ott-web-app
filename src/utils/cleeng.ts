import type { AccessModel } from '../../types/Config';
import type { MediaOffer } from '../../types/media';

export const isAllowedToWatch = (
  accessModel: AccessModel,
  isLoggedIn: boolean,
  isItemFree: boolean,
  hasSubscription: boolean,
  isEntitled?: boolean,
): boolean => {
  if (accessModel === 'AVOD') return true;
  if (isItemFree) return true;
  if (accessModel === 'AUTHVOD' && isLoggedIn) return true;
  if (accessModel === 'SVOD' && hasSubscription) return true;
  if (accessModel === 'SVOD' && isEntitled) return true;
  if (accessModel === 'TVOD' && isEntitled) return true;

  return false;
};

export const filterCleengMediaOffers = (offerIds: string = ''): MediaOffer[] => {
  return offerIds
    .replace(/\s/g, '')
    .split(',')
    .reduce<MediaOffer[]>(
      (offers, offerId) =>
        offerId.indexOf('cleeng:') === 0 || offerId?.indexOf('!cleeng:') === 0
          ? [...offers, { offerId: offerId.slice(offerId.indexOf(':') + 1), forced: offerId[0] === '!' }]
          : offers,
      [],
    );
};
